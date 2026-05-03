"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Play, RefreshCw } from "lucide-react"
import { EXAMPLE_VIDEOS } from "@/lib/example-videos"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

type ExampleTaskStatus = "idle" | "starting" | "submitted" | "pending" | "processing" | "completed" | "failed" | "cancelled" | "error"

interface ExampleTaskState {
  id: string
  taskId?: string
  status: ExampleTaskStatus
  progress?: number
  videoUrl?: string
  thumbnailUrl?: string
  message?: string
  errorMessage?: string
}

interface GenerateExamplesResponse {
  tasks: Array<Omit<ExampleTaskState, "status"> & {
    status: Exclude<ExampleTaskStatus, "idle" | "starting">
  }>
}

interface GenerateExamplesErrorResponse {
  error: string
}

const ACTIVE_TASK_STATUSES: ExampleTaskStatus[] = ["starting", "submitted", "pending", "processing"]

function isActiveTask(status?: ExampleTaskStatus): boolean {
  return Boolean(status && ACTIVE_TASK_STATUSES.includes(status))
}

function getCardState(states: Record<string, ExampleTaskState>, id: string): ExampleTaskState {
  return states[id] ?? { id, status: "idle" }
}

function getStatusLabel(state: ExampleTaskState): string {
  if (state.status === "completed") {
    return "Ready"
  }

  if (state.status === "failed" || state.status === "cancelled" || state.status === "error") {
    return "Retry"
  }

  if (typeof state.progress === "number" && isActiveTask(state.status)) {
    return `${state.progress}%`
  }

  if (isActiveTask(state.status)) {
    return "Generating"
  }

  return "Sample"
}

export function ExamplesSection() {
  const [states, setStates] = useState<Record<string, ExampleTaskState>>({})
  const [sectionError, setSectionError] = useState<string | null>(null)
  const [isStartingAll, setIsStartingAll] = useState(false)

  const activeTasks = useMemo(() => (
    Object.values(states).filter((state) => state.taskId && isActiveTask(state.status))
  ), [states])

  const startExamples = useCallback(async (ids?: string[]) => {
    const targetIds = ids && ids.length > 0 ? ids : EXAMPLE_VIDEOS.map((example) => example.id)

    setSectionError(null)
    setStates((current) => {
      const next = { ...current }

      for (const id of targetIds) {
        next[id] = {
          ...next[id],
          id,
          status: "starting",
          progress: 0,
          message: "Starting",
          errorMessage: undefined,
        }
      }

      return next
    })

    if (!ids) {
      setIsStartingAll(true)
    }

    try {
      const response = await fetch("/api/example-videos/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: targetIds }),
      })
      const data = await response.json() as GenerateExamplesResponse | GenerateExamplesErrorResponse

      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Could not start sample videos.")
      }

      setStates((current) => {
        const next = { ...current }

        for (const task of data.tasks) {
          next[task.id] = {
            ...next[task.id],
            ...task,
          }
        }

        return next
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not start sample videos."

      setSectionError(message)
      setStates((current) => {
        const next = { ...current }

        for (const id of targetIds) {
          if (next[id]?.status === "starting") {
            next[id] = {
              ...next[id],
              id,
              status: "error",
              message,
              errorMessage: message,
            }
          }
        }

        return next
      })
    } finally {
      if (!ids) {
        setIsStartingAll(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!activeTasks.length) {
      return
    }

    let isCancelled = false
    let timeoutId: ReturnType<typeof setTimeout>

    const pollTasks = async () => {
      try {
        const response = await fetch("/api/example-videos/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tasks: activeTasks.map((task) => ({ id: task.id, taskId: task.taskId })),
          }),
        })
        const data = await response.json() as GenerateExamplesResponse | GenerateExamplesErrorResponse

        if (!response.ok || "error" in data) {
          throw new Error("error" in data ? data.error : "Could not update sample videos.")
        }

        if (!isCancelled) {
          setStates((current) => {
            const next = { ...current }

            for (const task of data.tasks) {
              next[task.id] = {
                ...next[task.id],
                ...task,
              }
            }

            return next
          })
        }
      } catch {
        if (!isCancelled) {
          setStates((current) => {
            const next = { ...current }

            for (const task of activeTasks) {
              next[task.id] = {
                ...next[task.id],
                message: "Status update delayed.",
              }
            }

            return next
          })
        }
      }

      if (!isCancelled) {
        timeoutId = setTimeout(pollTasks, 8000)
      }
    }

    timeoutId = setTimeout(pollTasks, 2500)

    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
    }
  }, [activeTasks])

  const hasAnyActiveTask = activeTasks.length > 0

  return (
    <section className="w-full px-5 py-16 md:py-24">
      <div className="mx-auto mb-12 flex max-w-4xl flex-col items-center gap-5 text-center md:mb-16">
        <div>
          <h2 className="text-foreground text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">
            Example Prompts
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Get inspired by these example prompts. Try them in the generator above or create your own.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => startExamples()}
          disabled={isStartingAll || hasAnyActiveTask}
          className="h-11 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {isStartingAll || hasAnyActiveTask ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Generating Samples
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Generate Samples
            </>
          )}
        </Button>
        {sectionError && (
          <p className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-200/90">
            {sectionError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {EXAMPLE_VIDEOS.map((example) => {
          const state = getCardState(states, example.id)
          const isActive = isActiveTask(state.status)
          const canRetry = state.status === "failed" || state.status === "cancelled" || state.status === "error"

          return (
            <article
              key={example.id}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent text-left transition-all duration-300 hover:from-white/[0.08]"
            >
              <div className="aspect-video bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative">
                {state.videoUrl && state.status === "completed" ? (
                  <video
                    className="h-full w-full bg-black/40 object-contain"
                    src={state.videoUrl}
                    poster={state.thumbnailUrl}
                    controls
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (state.status === "idle" || canRetry) {
                        void startExamples([example.id])
                      }
                    }}
                    disabled={isActive}
                    aria-label={`${getStatusLabel(state)}: ${example.prompt}`}
                    className="absolute inset-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/70 disabled:cursor-default"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      {isActive ? (
                        <Spinner className="h-6 w-6 text-primary" />
                      ) : canRetry ? (
                        <RefreshCw className="h-5 w-5 text-primary" />
                      ) : (
                        <Play className="w-5 h-5 text-primary ml-0.5" />
                      )}
                    </div>
                  </button>
                )}
                {isActive && typeof state.progress === "number" && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
                    <div
                      className="h-full bg-primary transition-[width] duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, state.progress))}%` }}
                    />
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-xs text-foreground/80">
                  {example.styleLabel}
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-xs text-foreground/80">
                  {getStatusLabel(state)}
                </div>
              </div>

              <div className="p-4">
                <p className="text-foreground text-sm leading-relaxed line-clamp-2">{example.prompt}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{example.aspectRatio}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  <span>{example.styleLabel}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  <span>{example.duration}s</span>
                </div>
                {state.message && state.status !== "idle" && (
                  <p className="mt-3 text-xs text-muted-foreground/80">
                    {state.errorMessage || state.message}
                  </p>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
