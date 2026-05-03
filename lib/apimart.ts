const DEFAULT_APIMART_BASE_URL = "https://api.apimart.ai"
const APIMART_VIDEO_MODEL = "kling-v2-6"

const STYLE_PROMPTS: Record<string, string> = {
  cinematic: "cinematic lighting, natural camera movement, film-grade detail",
  anime: "anime-inspired composition, expressive motion, clean illustrated detail",
  realistic: "photorealistic detail, natural motion, realistic lighting",
  artistic: "stylized art direction, expressive color, polished motion design",
  minimalist: "minimal composition, clean shapes, refined motion",
}

export type VideoTaskStatus =
  | "submitted"
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"

interface ApimartConfig {
  apiKey: string
  baseUrl: string
  mode: "std" | "pro"
}

interface ApimartGenerationData {
  task_id?: string
  id?: string
  status?: string
}

interface ApimartGenerationResponse {
  code?: number
  data?: ApimartGenerationData[] | ApimartGenerationData
  error?: unknown
  message?: unknown
}

interface ApimartTaskResponse {
  code?: number
  data?: {
    id?: string
    status?: string
    progress?: number
    result?: unknown
    estimated_time?: number
    error?: unknown
  }
  error?: unknown
  message?: unknown
}

export interface ApimartVideoTaskSubmission {
  taskId: string
  status: VideoTaskStatus
}

export interface ApimartVideoTaskStatus {
  taskId: string
  status: VideoTaskStatus
  progress?: number
  videoUrl?: string
  thumbnailUrl?: string
  estimatedSeconds?: number
  errorMessage?: string
}

export class ApimartRequestError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = "ApimartRequestError"
    this.statusCode = statusCode
  }
}

export function getApimartConfig(): ApimartConfig | null {
  const apiKey = process.env.APIMART_API_KEY || process.env.APIMART_TOKEN

  if (!apiKey) {
    return null
  }

  const baseUrl = (process.env.APIMART_BASE_URL || DEFAULT_APIMART_BASE_URL).replace(/\/+$/, "")
  const mode = process.env.APIMART_VIDEO_MODE === "pro" ? "pro" : "std"

  return { apiKey, baseUrl, mode }
}

export function normalizeVideoDuration(duration: unknown): 5 | 10 {
  const numericDuration = typeof duration === "number" ? duration : Number(duration)
  return numericDuration > 5 ? 10 : 5
}

export function normalizeVideoAspectRatio(aspectRatio: unknown): "16:9" | "9:16" | "1:1" {
  if (aspectRatio === "9:16" || aspectRatio === "1:1") {
    return aspectRatio
  }

  return "16:9"
}

export function normalizeStyle(style: unknown): string {
  return typeof style === "string" && STYLE_PROMPTS[style] ? style : "cinematic"
}

export function formatVideoPrompt(prompt: string, style: string): string {
  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.cinematic
  return `${prompt.trim()}\n\nVisual style: ${stylePrompt}.`
}

export async function submitApimartVideoTask(params: {
  prompt: string
  style: string
  duration: 5 | 10
  aspectRatio: "16:9" | "9:16" | "1:1"
}): Promise<ApimartVideoTaskSubmission> {
  const config = getApimartConfig()

  if (!config) {
    throw new ApimartRequestError("Video generation is temporarily unavailable.", 503)
  }

  const payload = {
    model: APIMART_VIDEO_MODEL,
    prompt: formatVideoPrompt(params.prompt, params.style),
    mode: config.mode,
    duration: params.duration,
    aspect_ratio: params.aspectRatio,
  }

  const response = await fetch(`${config.baseUrl}/v1/videos/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const data = await readJson<ApimartGenerationResponse>(response)

  if (!response.ok || data.code !== 200) {
    throw toApimartError(response.status)
  }

  const task = Array.isArray(data.data) ? data.data[0] : data.data
  const taskId = task?.task_id || task?.id

  if (!taskId) {
    throw new ApimartRequestError("Video generation did not return a task id.", 502)
  }

  return {
    taskId,
    status: normalizeTaskStatus(task?.status, "submitted"),
  }
}

export async function getApimartVideoTaskStatus(taskId: string): Promise<ApimartVideoTaskStatus> {
  const config = getApimartConfig()

  if (!config) {
    throw new ApimartRequestError("Video generation is temporarily unavailable.", 503)
  }

  const response = await fetch(`${config.baseUrl}/v1/tasks/${encodeURIComponent(taskId)}?language=en`, {
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
  })

  const data = await readJson<ApimartTaskResponse>(response)

  if (!response.ok || data.code !== 200 || !data.data) {
    throw toApimartError(response.status)
  }

  const result = data.data.result
  const status = normalizeTaskStatus(data.data.status, "processing")
  const errorMessage = status === "failed" ? extractErrorMessage(data.data.error) : undefined

  return {
    taskId: data.data.id || taskId,
    status,
    progress: data.data.progress,
    videoUrl: extractResultUrl(result, "videos"),
    thumbnailUrl: extractResultUrl(result, "thumbnail_url"),
    estimatedSeconds: data.data.estimated_time,
    errorMessage,
  }
}

async function readJson<T>(response: Response): Promise<T> {
  try {
    return await response.json() as T
  } catch {
    throw new ApimartRequestError("Video generation returned an invalid response.", 502)
  }
}

function toApimartError(statusCode: number): ApimartRequestError {
  if (statusCode === 401) {
    return new ApimartRequestError("Video generation is temporarily unavailable.", 401)
  }

  if (statusCode === 402) {
    return new ApimartRequestError("Video generation is temporarily unavailable.", 402)
  }

  if (statusCode === 429) {
    return new ApimartRequestError("Generation is busy right now. Try again soon.", 429)
  }

  return new ApimartRequestError("Video generation request failed. Try adjusting the prompt or settings.", statusCode || 502)
}

function normalizeTaskStatus(status: unknown, fallback: VideoTaskStatus): VideoTaskStatus {
  if (
    status === "submitted" ||
    status === "pending" ||
    status === "processing" ||
    status === "completed" ||
    status === "failed" ||
    status === "cancelled"
  ) {
    return status
  }

  return fallback
}

function extractResultUrl(result: unknown, key: "videos" | "thumbnail_url"): string | undefined {
  if (!isRecord(result)) {
    return undefined
  }

  return extractFirstUrl(result[key])
}

function extractFirstUrl(value: unknown): string | undefined {
  if (typeof value === "string" && /^https?:\/\//.test(value)) {
    return value
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nestedUrl = extractFirstUrl(item)
      if (nestedUrl) {
        return nestedUrl
      }
    }
  }

  if (isRecord(value)) {
    for (const key of ["url", "video_url", "download_url", "file_url", "thumbnail_url"]) {
      const nestedUrl = extractFirstUrl(value[key])
      if (nestedUrl) {
        return nestedUrl
      }
    }
  }

  return undefined
}

function extractErrorMessage(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value
  }

  if (isRecord(value)) {
    if (typeof value.message === "string") {
      return value.message
    }

    if (typeof value.error === "string") {
      return value.error
    }
  }

  return undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}
