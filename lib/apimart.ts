const DEFAULT_APIMART_BASE_URL = "https://api.apimart.ai"
const DEFAULT_APIMART_VIDEO_MODEL = "sora-2"
const DEFAULT_APIMART_VIDEO_RESOLUTION = "720p"

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
  model: "sora-2" | "sora-2-pro"
  resolution: "720p" | "1024p" | "1080p"
}

interface ApimartGenerationData {
  task_id?: string
  id?: string
  status?: string
}

interface ApimartImageUploadResponse {
  url?: string
  filename?: string
  content_type?: string
  bytes?: number
  created_at?: number
  error?: unknown
  message?: unknown
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

export interface ApimartImageUpload {
  url: string
  filename?: string
  contentType?: string
  bytes?: number
}

export type Sora2Duration = 4 | 8 | 12 | 16 | 20
export type Sora2AspectRatio = "16:9" | "9:16"

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
  const model = process.env.APIMART_VIDEO_MODEL === "sora-2-pro" ? "sora-2-pro" : DEFAULT_APIMART_VIDEO_MODEL
  const configuredResolution = process.env.APIMART_VIDEO_RESOLUTION
  const resolution = configuredResolution === "1024p" || configuredResolution === "1080p"
    ? configuredResolution
    : DEFAULT_APIMART_VIDEO_RESOLUTION

  return { apiKey, baseUrl, model, resolution }
}

export function normalizeVideoDuration(duration: unknown): Sora2Duration {
  const numericDuration = typeof duration === "number" ? duration : Number(duration)

  if (numericDuration >= 20) {
    return 20
  }

  if (numericDuration >= 16) {
    return 16
  }

  if (numericDuration >= 12) {
    return 12
  }

  if (numericDuration >= 8) {
    return 8
  }

  return 4
}

export function normalizeVideoAspectRatio(aspectRatio: unknown): Sora2AspectRatio {
  if (aspectRatio === "9:16" || aspectRatio === "portrait") {
    return "9:16"
  }

  if (aspectRatio === "16:9" || aspectRatio === "landscape") {
    return "16:9"
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

export async function uploadApimartImage(file: File): Promise<ApimartImageUpload> {
  const config = getApimartConfig()

  if (!config) {
    throw new ApimartRequestError("Image upload is temporarily unavailable.", 503)
  }

  const formData = new FormData()
  formData.append("file", file, file.name || "reference-image.png")

  const response = await fetch(`${config.baseUrl}/v1/uploads/images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: formData,
  })

  const data = await readJson<ApimartImageUploadResponse>(response)

  if (!response.ok || !data.url) {
    throw toApimartError(response.status)
  }

  return {
    url: data.url,
    filename: data.filename,
    contentType: data.content_type,
    bytes: data.bytes,
  }
}

export async function submitApimartVideoTask(params: {
  prompt: string
  style: string
  duration: Sora2Duration
  aspectRatio: Sora2AspectRatio
  imageUrls?: string[]
}): Promise<ApimartVideoTaskSubmission> {
  const config = getApimartConfig()

  if (!config) {
    throw new ApimartRequestError("Video generation is temporarily unavailable.", 503)
  }

  const payload = {
    model: config.model,
    prompt: formatVideoPrompt(params.prompt, params.style),
    duration: params.duration,
    resolution: config.resolution,
    ...(params.imageUrls?.length
      ? { image_urls: params.imageUrls.slice(0, 1) }
      : { aspect_ratio: params.aspectRatio }),
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
  const errorMessage = status === "failed" ? normalizeProviderError(extractErrorMessage(data.data.error)) : undefined

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

function normalizeProviderError(message: string | undefined): string | undefined {
  if (!message) {
    return undefined
  }

  if (/base64|image pixel|file.*invalid/i.test(message)) {
    return "The uploaded image could not be processed. Try another JPG or PNG image with a clear subject."
  }

  return message
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}
