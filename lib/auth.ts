import { betterAuth } from "better-auth"
import { Pool } from "pg"

const databaseUrl =
  process.env.BETTER_AUTH_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.VIDEO_RATE_LIMIT_DATABASE_URL
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const localDevelopmentSecret = process.env.VERCEL
  ? undefined
  : "sparkrobin-local-development-better-auth-secret"

const database = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      max: 3,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 10_000,
    })
  : undefined

export const auth = betterAuth({
  appName: "Spark Robin",
  secret: process.env.BETTER_AUTH_SECRET || localDevelopmentSecret,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  trustedOrigins: [
    "https://sparkrobin.ai",
    "https://*.vercel.app",
    "http://localhost:3000",
    "http://localhost:*",
  ],
  ...(database ? { database } : {}),
  emailAndPassword: {
    enabled: false,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            prompt: "select_account",
          },
        }
      : {},
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
})

export type Session = typeof auth.$Infer.Session.session
export type User = typeof auth.$Infer.Session.user
