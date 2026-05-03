import { NextResponse } from "next/server"
import { ApimartRequestError, getApimartVideoTaskStatus } from "@/lib/apimart"

interface TaskStatusResponse {
  taskId: string
  status: "submitted" | "pending" | "processing" | "completed" | "failed" | "cancelled"
  progress?: number
  videoUrl?: string
  thumbnailUrl?: string
  estimatedSeconds?: number
  message: string
  errorMessage?: string
}

type RouteContext = {
  params: Promise<{
    taskId: string
  }>
}

export async function GET(_request: Request, { params }: RouteContext): Promise<NextResponse<TaskStatusResponse | { error: string }>> {
  const { taskId } = await params

  if (!taskId || taskId.length > 200) {
    return NextResponse.json({ error: "A valid task id is required" }, { status: 400 })
  }

  try {
    const task = await getApimartVideoTaskStatus(taskId)

    return NextResponse.json({
      ...task,
      message: getTaskMessage(task.status, task.progress, Boolean(task.videoUrl)),
    })
  } catch (error) {
    const statusCode = error instanceof ApimartRequestError ? error.statusCode : 502
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch video task status"

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode >= 400 && statusCode < 500 ? statusCode : 502 },
    )
  }
}

function getTaskMessage(status: TaskStatusResponse["status"], progress?: number, hasVideoUrl = false): string {
  if (status === "completed") {
    return hasVideoUrl
      ? "Your video is ready."
      : "The video is ready, but the playback link is still unavailable. Try refreshing in a moment."
  }

  if (status === "failed") {
    return "Video generation failed. Try a simpler prompt or adjust the settings."
  }

  if (status === "cancelled") {
    return "This video task was cancelled."
  }

  if (typeof progress === "number") {
    return `Generating your video: ${progress}% complete.`
  }

  return "Generating your video."
}
