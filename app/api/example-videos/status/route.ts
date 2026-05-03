import { NextRequest, NextResponse } from "next/server"
import { ApimartRequestError, getApimartVideoTaskStatus } from "@/lib/apimart"

export const dynamic = "force-dynamic"

type ExampleTaskStatus = "submitted" | "pending" | "processing" | "completed" | "failed" | "cancelled" | "error"

interface TaskStatusRequest {
  tasks?: Array<{
    id?: string
    taskId?: string
  }>
}

interface ExampleTaskStatusResponse {
  id: string
  taskId?: string
  status: ExampleTaskStatus
  progress?: number
  videoUrl?: string
  thumbnailUrl?: string
  estimatedSeconds?: number
  message: string
  errorMessage?: string
}

interface StatusResponse {
  tasks: ExampleTaskStatusResponse[]
}

export async function POST(request: NextRequest): Promise<NextResponse<StatusResponse | { error: string }>> {
  let body: TaskStatusRequest

  try {
    body = await request.json() as TaskStatusRequest
  } catch {
    return NextResponse.json({ error: "A valid task list is required." }, { status: 400 })
  }

  const tasks = Array.isArray(body.tasks)
    ? body.tasks
      .filter((task): task is { id: string; taskId: string } => (
        typeof task.id === "string" &&
        typeof task.taskId === "string" &&
        task.id.length > 0 &&
        task.taskId.length > 0 &&
        task.taskId.length <= 200
      ))
      .slice(0, 12)
    : []

  if (!tasks.length) {
    return NextResponse.json({ error: "A valid task list is required." }, { status: 400 })
  }

  const settledStatuses = await Promise.allSettled(
    tasks.map(async (task): Promise<ExampleTaskStatusResponse> => {
      const status = await getApimartVideoTaskStatus(task.taskId)

      return {
        id: task.id,
        ...status,
        message: getTaskMessage(status.status, status.progress, Boolean(status.videoUrl)),
      }
    }),
  )

  return NextResponse.json({
    tasks: settledStatuses.map((status, index) => {
      if (status.status === "fulfilled") {
        return status.value
      }

      return {
        id: tasks[index].id,
        taskId: tasks[index].taskId,
        status: "error",
        message: getPublicErrorMessage(status.reason),
        errorMessage: getPublicErrorMessage(status.reason),
      }
    }),
  })
}

function getTaskMessage(status: Exclude<ExampleTaskStatus, "error">, progress?: number, hasVideoUrl = false): string {
  if (status === "completed") {
    return hasVideoUrl ? "Video is ready." : "Video is ready, playback is still preparing."
  }

  if (status === "failed") {
    return "Video generation failed. Try another sample."
  }

  if (status === "cancelled") {
    return "This video task was cancelled."
  }

  if (typeof progress === "number") {
    return `Generating ${progress}%`
  }

  return "Generating"
}

function getPublicErrorMessage(error: unknown): string {
  if (error instanceof ApimartRequestError) {
    return error.message
  }

  return "Video status could not be updated."
}
