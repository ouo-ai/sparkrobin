import { NextRequest, NextResponse } from "next/server"
import {
  ApimartRequestError,
  getApimartConfig,
  normalizeVideoAspectRatio,
  normalizeVideoDuration,
  normalizeStyle,
  submitApimartVideoTask,
} from "@/lib/apimart"

interface GenerateRequest {
  prompt: string
  style?: string
  aspectRatio?: string
  duration?: number
}

interface GenerateResponse {
  id: string
  taskId?: string
  status: "preview" | "submitted" | "pending" | "processing" | "completed" | "failed" | "cancelled" | "error"
  prompt: string
  style: string
  duration: number
  aspectRatio: string
  estimatedSeconds: number
  previewTitle: string
  frames: number
  progress?: number
  message: string
  previewMode: boolean
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function getPreviewTitle(prompt: string): string {
  return prompt.length > 50 ? `${prompt.substring(0, 47)}...` : prompt
}

function getPreviewResponse(params: {
  prompt: string
  style: string
  duration: 5 | 10
  aspectRatio: "16:9" | "9:16" | "1:1"
}): GenerateResponse {
  const promptHash = hashString(params.prompt.toLowerCase())
  const id = `preview_${promptHash.toString(36)}_${Date.now().toString(36)}`

  return {
    id,
    status: "preview",
    prompt: params.prompt,
    style: params.style,
    duration: params.duration,
    aspectRatio: params.aspectRatio,
    estimatedSeconds: Math.ceil(params.duration * 2.5),
    previewTitle: getPreviewTitle(params.prompt),
    frames: params.duration * 24,
    message: "Preview mode is active. Submit a prompt to explore the workflow.",
    previewMode: true,
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse | { error: string }>> {
  try {
    const body: GenerateRequest = await request.json()

    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : ""
    const style = normalizeStyle(body.style)
    const duration = normalizeVideoDuration(body.duration)
    const aspectRatio = normalizeVideoAspectRatio(body.aspectRatio)

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required and must be a non-empty string" },
        { status: 400 },
      )
    }

    if (prompt.length < 3) {
      return NextResponse.json(
        { error: "Prompt must be at least 3 characters long" },
        { status: 400 },
      )
    }

    if (prompt.length > 2500) {
      return NextResponse.json(
        { error: "Prompt must be 2500 characters or less" },
        { status: 400 },
      )
    }

    if (!getApimartConfig()) {
      return NextResponse.json(getPreviewResponse({ prompt, style, duration, aspectRatio }))
    }

    const task = await submitApimartVideoTask({ prompt, style, duration, aspectRatio })

    return NextResponse.json({
      id: task.taskId,
      taskId: task.taskId,
      status: task.status,
      prompt,
      style,
      duration,
      aspectRatio,
      estimatedSeconds: duration === 10 ? 90 : 60,
      previewTitle: getPreviewTitle(prompt),
      frames: duration * 24,
      progress: 0,
      message: "Video generation started. Status will update automatically.",
      previewMode: false,
    })
  } catch (error) {
    const statusCode = error instanceof ApimartRequestError ? error.statusCode : 400
    const errorMessage = error instanceof Error ? error.message : "Invalid request body"

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode >= 400 && statusCode < 500 ? statusCode : 502 },
    )
  }
}

export async function GET(): Promise<NextResponse<{ message: string; endpoints: { POST: string } }>> {
  return NextResponse.json({
    message: "Spark Robin AI Video Generator API",
    endpoints: {
      POST: "Submit a video generation task, or return preview mode when generation is unavailable.",
    },
  })
}
