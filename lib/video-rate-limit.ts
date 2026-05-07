import { createHash, randomUUID } from "node:crypto"
import { isIP } from "node:net"

import { Redis } from "@upstash/redis"
import type { NextRequest } from "next/server"
import postgres, { type Sql } from "postgres"

const WINDOW_SECONDS = 24 * 60 * 60
const KEY_PREFIX = process.env.VIDEO_RATE_LIMIT_KEY_PREFIX || "sparkrobin:video-generation"
const POSTGRES_TABLE = "sparkrobin_video_generation_ip_limits"

type RedisConfig = {
  url: string
  token: string
}

type PostgresConfig = {
  url: string
}

type RateLimitStore = {
  reserve(key: string, token: string): Promise<VideoRateLimitResult>
  release(reservation: VideoRateLimitReservation): Promise<void>
}

export type VideoRateLimitReservation = {
  key: string
  token: string
  resetAt: string
}

export type VideoRateLimitResult =
  | {
      allowed: true
      reservation: VideoRateLimitReservation
    }
  | {
      allowed: false
      retryAfterSeconds: number
      resetAt: string
    }

let redisClient: Redis | null = null
let postgresClient: Sql | null = null
let postgresTableReady: Promise<void> | null = null

export class VideoRateLimitStoreError extends Error {
  constructor() {
    super("Video generation rate limit storage is not configured.")
    this.name = "VideoRateLimitStoreError"
  }
}

function getRedisConfig(): RedisConfig | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.REDIS_REST_API_URL
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.REDIS_REST_API_TOKEN

  if (!url || !token) {
    return null
  }

  return { url, token }
}

function getPostgresConfig(): PostgresConfig | null {
  const url =
    process.env.VIDEO_RATE_LIMIT_DATABASE_URL ||
    process.env.RATE_LIMIT_DATABASE_URL

  if (!url) {
    return null
  }

  return { url }
}

function getRedis(): Redis | null {
  const config = getRedisConfig()

  if (!config) {
    return null
  }

  if (redisClient) {
    return redisClient
  }

  redisClient = new Redis(config)
  return redisClient
}

function getPostgres(): Sql | null {
  const config = getPostgresConfig()

  if (!config) {
    return null
  }

  if (postgresClient) {
    return postgresClient
  }

  postgresClient = postgres(config.url, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  })
  return postgresClient
}

function getStore(): RateLimitStore {
  const redis = getRedis()

  if (redis) {
    return createRedisStore(redis)
  }

  const sql = getPostgres()

  if (sql) {
    return createPostgresStore(sql)
  }

  throw new VideoRateLimitStoreError()
}

function normalizeIpCandidate(value: string | null): string | null {
  if (!value) {
    return null
  }

  const firstValue = value.split(",")[0]?.trim()

  if (!firstValue) {
    return null
  }

  const withoutIpv6Brackets = firstValue.replace(/^\[([^\]]+)\](?::\d+)?$/, "$1")
  const withoutIpv4Port = withoutIpv6Brackets.replace(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/, "$1")
  const normalized = withoutIpv4Port.replace(/^::ffff:/i, "")

  return isIP(normalized) ? normalized : null
}

export function getClientIp(request: NextRequest): string {
  return (
    normalizeIpCandidate(request.headers.get("x-vercel-forwarded-for")) ||
    normalizeIpCandidate(request.headers.get("x-forwarded-for")) ||
    normalizeIpCandidate(request.headers.get("x-real-ip")) ||
    normalizeIpCandidate(request.headers.get("cf-connecting-ip")) ||
    "unknown"
  )
}

function getRateLimitKey(ip: string): string {
  const salt = process.env.VIDEO_RATE_LIMIT_HASH_SALT || ""
  const ipHash = createHash("sha256").update(`${salt}:${ip}`).digest("hex")
  return `${KEY_PREFIX}:${ipHash}`
}

function getResetAt(secondsFromNow: number): string {
  return new Date(Date.now() + secondsFromNow * 1000).toISOString()
}

function getRetryAfterSeconds(resetAt: Date): number {
  return Math.max(1, Math.ceil((resetAt.getTime() - Date.now()) / 1000))
}

function createRedisStore(redis: Redis): RateLimitStore {
  return {
    async reserve(key, token) {
      const setResult = await redis.set(key, token, {
        nx: true,
        ex: WINDOW_SECONDS,
      })

      if (setResult === "OK") {
        return {
          allowed: true,
          reservation: {
            key,
            token,
            resetAt: getResetAt(WINDOW_SECONDS),
          },
        }
      }

      const ttl = await redis.ttl(key)
      const retryAfterSeconds = ttl > 0 ? ttl : WINDOW_SECONDS

      return {
        allowed: false,
        retryAfterSeconds,
        resetAt: getResetAt(retryAfterSeconds),
      }
    },
    async release(reservation) {
      const currentToken = await redis.get<string>(reservation.key)

      if (currentToken === reservation.token) {
        await redis.del(reservation.key)
      }
    },
  }
}

async function ensurePostgresTable(sql: Sql): Promise<void> {
  postgresTableReady ??= sql`
    CREATE TABLE IF NOT EXISTS ${sql(POSTGRES_TABLE)} (
      rate_key TEXT PRIMARY KEY,
      token TEXT NOT NULL,
      reset_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `.then(() => undefined)

  await postgresTableReady
}

function normalizePostgresDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value)
}

function createPostgresStore(sql: Sql): RateLimitStore {
  return {
    async reserve(key, token) {
      await ensurePostgresTable(sql)

      const resetAt = new Date(Date.now() + WINDOW_SECONDS * 1000)
      const rows = await sql<{ token: string; reset_at: Date | string }[]>`
        INSERT INTO ${sql(POSTGRES_TABLE)} (rate_key, token, reset_at)
        VALUES (${key}, ${token}, ${resetAt})
        ON CONFLICT (rate_key) DO UPDATE
          SET token = EXCLUDED.token,
              reset_at = EXCLUDED.reset_at,
              updated_at = NOW()
        WHERE ${sql(POSTGRES_TABLE)}.reset_at <= NOW()
        RETURNING token, reset_at
      `

      if (rows[0]?.token === token) {
        return {
          allowed: true,
          reservation: {
            key,
            token,
            resetAt: normalizePostgresDate(rows[0].reset_at).toISOString(),
          },
        }
      }

      const existingRows = await sql<{ reset_at: Date | string }[]>`
        SELECT reset_at
        FROM ${sql(POSTGRES_TABLE)}
        WHERE rate_key = ${key}
        LIMIT 1
      `
      const existingResetAt = normalizePostgresDate(existingRows[0]?.reset_at || resetAt)
      const retryAfterSeconds = getRetryAfterSeconds(existingResetAt)

      return {
        allowed: false,
        retryAfterSeconds,
        resetAt: existingResetAt.toISOString(),
      }
    },
    async release(reservation) {
      await ensurePostgresTable(sql)

      await sql`
        DELETE FROM ${sql(POSTGRES_TABLE)}
        WHERE rate_key = ${reservation.key}
          AND token = ${reservation.token}
      `
    },
  }
}

export async function reserveVideoGenerationQuota(ip: string): Promise<VideoRateLimitResult> {
  const store = getStore()
  const key = getRateLimitKey(ip)
  const token = randomUUID()

  return store.reserve(key, token)
}

export async function releaseVideoGenerationQuota(reservation: VideoRateLimitReservation): Promise<void> {
  await getStore().release(reservation)
}
