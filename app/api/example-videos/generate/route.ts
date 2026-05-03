import { NextRequest, NextResponse } from "next/server"
import { ApimartRequestError, getApimartConfig, submitApimartVideoTask } from "@/lib/apimart"
import { EXAMPLE_VIDEOS, getExampleVideoById, type ExampleVideo } from "@/lib/example-videos"

export const dynamic = "force-dynamic"

type ExampleTaskStatus = "submitted" | "pending" | "processing" | "completed" | "failed" | "cancelled" | "error"

interface GenerateExamplesRequest {
  ids?: string[]
}

interface GeneratedExampleTask {
  id: string
  taskId?: string
  status: ExampleTaskStatus
  progress?: number
  videoUrl?: string
  thumbnailUrl?: string
  message: string
  errorMessage?: string
}

interface GenerateExamplesResponse {
  tasks: GeneratedExampleTask[]
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateExamplesResponse | { error: string }>> {
  let body: GenerateExamplesRequest = {}

  try {
    body = await request.json() as GenerateExamplesRequest
  } catch {
    body = {}
  }

  const examples = resolveRequestedExamples(body.ids)

  if (!examples.length) {
    return NextResponse.json({ error: "No valid example videos were requested." }, { status: 400 })
  }

  if (!getApimartConfig()) {
    return NextResponse.json({ error: "Video generation is temporarily unavailable." }, { status: 503 })
  }

  const settledTasks = await Promise.allSettled(
    examples.map(async (example): Promise<GeneratedExampleTask> => {
      const task = await submitApimartVideoTask({
        prompt: example.prompt,
        style: example.style,
        duration: example.duration,
        aspectRatio: example.aspectRatio,
      })

      return {
        id: example.id,
        taskId: task.taskId,
        status: task.status,
        progress: 0,
        message: "Video generation started.",
      }
    }),
  )

  return NextResponse.json({
    tasks: settledTasks.map((task, index) => {
      if (task.status === "fulfilled") {
        return task.value
      }

      return {
        id: examples[index].id,
        status: "error",
        message: getPublicErrorMessage(task.reason),
        errorMessage: getPublicErrorMessage(task.reason),
      }
    }),
  })
}

function resolveRequestedExamples(ids: unknown): ExampleVideo[] {
  if (ids === undefined) {
    return EXAMPLE_VIDEOS
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return []
  }

  const uniqueIds = Array.from(new Set(ids.filter((id): id is string => typeof id === "string")))

  return uniqueIds
    .map((id) => getExampleVideoById(id))
    .filter((example): example is ExampleVideo => Boolean(example))
}

function getPublicErrorMessage(error: unknown): string {
  if (error instanceof ApimartRequestError) {
    return error.message
  }

  return "Video generation could not be started. Try again soon."
}
