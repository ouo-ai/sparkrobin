import { NextResponse } from "next/server"
import { ApimartRequestError, getKlingTaskStatus } from "@/lib/apimart"

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
    const task = await getKlingTaskStatus(taskId)

    return NextResponse.json({
      ...task,
      message: getTaskMessage(task.status, task.progress, Boolean(task.videoUrl)),
    })
  } catch (error) {
    const statusCode = error instanceof ApimartRequestError ? error.statusCode : 502
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch APIMart task status"

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode >= 400 && statusCode < 500 ? statusCode : 502 },
    )
  }
}

function getTaskMessage(status: TaskStatusResponse["status"], progress?: number, hasVideoUrl = false): string {
  if (status === "completed") {
    return hasVideoUrl
      ? "Your Kling v2.6 video is ready."
      : "Kling v2.6 completed the task, but APIMart did not return a video URL yet."
  }

  if (status === "failed") {
    return "Kling v2.6 generation failed. Try a simpler prompt or adjust the settings."
  }

  if (status === "cancelled") {
    return "This Kling v2.6 task was cancelled."
  }

  if (typeof progress === "number") {
    return `Kling v2.6 is generating your video: ${progress}% complete.`
  }

  return "Kling v2.6 is generating your video."
}
