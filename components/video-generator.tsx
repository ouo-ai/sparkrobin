"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Play, Image as ImageIcon, Film, Clock, Ratio, Palette, Info } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

type GenerateStatus = "preview" | "submitted" | "pending" | "processing" | "completed" | "failed" | "cancelled" | "error"

interface GenerateResponse {
  id: string
  taskId?: string
  status: GenerateStatus
  prompt: string
  style: string
  duration: number
  aspectRatio: string
  estimatedSeconds: number
  previewTitle: string
  frames: number
  progress?: number
  videoUrl?: string
  thumbnailUrl?: string
  errorMessage?: string
  message: string
  previewMode: boolean
}

interface TaskStatusResponse {
  taskId: string
  status: Exclude<GenerateStatus, "preview" | "error">
  progress?: number
  videoUrl?: string
  thumbnailUrl?: string
  estimatedSeconds?: number
  message: string
  errorMessage?: string
}

interface TaskStatusErrorResponse {
  error: string
}

const ACTIVE_TASK_STATUSES: GenerateStatus[] = ["submitted", "pending", "processing"]

function getPreviewAspectClass(aspectRatio: string): string {
  if (aspectRatio === "9:16") {
    return "aspect-[9/16] max-h-[420px] w-full max-w-[260px] mx-auto"
  }

  if (aspectRatio === "1:1") {
    return "aspect-square max-h-[420px] w-full max-w-[420px] mx-auto"
  }

  return "aspect-video w-full"
}

function getStatusLabel(result: GenerateResponse): string {
  if (result.previewMode) {
    return "Workflow Preview"
  }

  if (result.status === "completed") {
    return "Video Ready"
  }

  if (typeof result.progress === "number") {
    return `Generating video (${result.progress}%)`
  }

  return "Generating video"
}

function getNoticeClasses(result: GenerateResponse): string {
  if (result.status === "failed" || result.status === "cancelled" || result.status === "error") {
    return "bg-red-500/10 border-red-500/20 text-red-200/90"
  }

  if (result.previewMode) {
    return "bg-amber-500/10 border-amber-500/20 text-amber-200/80"
  }

  return "bg-primary/10 border-primary/20 text-primary/90"
}

export function VideoGenerator() {
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("cinematic")
  const [aspectRatio, setAspectRatio] = useState("16:9")
  const [duration, setDuration] = useState("5")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<GenerateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const taskIsActive = Boolean(result?.taskId && !result.previewMode && ACTIVE_TASK_STATUSES.includes(result.status))

  useEffect(() => {
    if (!result?.taskId || result.previewMode || !ACTIVE_TASK_STATUSES.includes(result.status)) {
      return
    }

    let isCancelled = false
    let timeoutId: ReturnType<typeof setTimeout>

    const pollTask = async () => {
      let shouldContinuePolling = true

      try {
        const response = await fetch(`/api/tasks/${encodeURIComponent(result.taskId || "")}`)
        const data = await response.json() as TaskStatusResponse | TaskStatusErrorResponse

        if (!response.ok) {
          throw new Error("error" in data ? data.error : "Failed to fetch video status")
        }

        if ("error" in data) {
          throw new Error(data.error)
        }

        shouldContinuePolling = ACTIVE_TASK_STATUSES.includes(data.status)

        if (!isCancelled) {
          setResult((current) => {
            if (!current || current.taskId !== data.taskId) {
              return current
            }

            return {
              ...current,
              status: data.status,
              progress: data.progress ?? current.progress,
              videoUrl: data.videoUrl ?? current.videoUrl,
              thumbnailUrl: data.thumbnailUrl ?? current.thumbnailUrl,
              estimatedSeconds: data.estimatedSeconds ?? current.estimatedSeconds,
              errorMessage: data.errorMessage,
              message: data.errorMessage || data.message || current.message,
            }
          })
        }
      } catch {
        if (!isCancelled) {
          setResult((current) => current && current.taskId === result.taskId
            ? {
                ...current,
                message: "Task submitted, but status polling is temporarily unavailable.",
              }
            : current)
        }
      }

      if (!isCancelled && shouldContinuePolling) {
        timeoutId = setTimeout(pollTask, 6000)
      }
    }

    timeoutId = setTimeout(pollTask, 2500)

    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
    }
  }, [result?.taskId, result?.status, result?.previewMode])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt to generate a video")
      return
    }

    setIsGenerating(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          aspectRatio,
          duration: parseInt(duration),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to generate video")
        return
      }

      setResult(data)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="rounded-2xl border border-white/20 overflow-hidden" style={{
        background: "rgba(231, 236, 235, 0.06)",
        backdropFilter: "blur(12px)",
      }}>
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 md:px-8 border-b border-white/10 flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center">
            <Film className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-foreground text-sm sm:text-base font-medium">AI Video Generator</h3>
            <p className="text-muted-foreground text-xs sm:text-sm">No registration required</p>
          </div>
        </div>

        {/* Input Section */}
        <div className="p-5 sm:p-6 md:p-8 space-y-4 sm:space-y-5">
          {/* Prompt Input */}
          <div className="space-y-2 sm:space-y-3">
            <label className="text-foreground text-sm sm:text-base font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Describe your video
            </label>
            <Textarea
              placeholder="A majestic eagle soaring through golden sunset clouds over mountain peaks..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[96px] md:min-h-[128px] bg-white/5 border-white/10 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/50 resize-none focus:border-primary/50 focus:ring-primary/20"
              maxLength={2500}
            />
            <div className="flex justify-between gap-3 text-xs sm:text-sm text-muted-foreground/70">
              <span>Be descriptive for better results</span>
              <span>{prompt.length}/2500</span>
            </div>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Style */}
            <div className="col-span-2 sm:col-span-1 space-y-1.5 sm:space-y-2">
              <label className="text-muted-foreground text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
                Style
              </label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="bg-white/5 border-white/10 text-foreground text-sm sm:text-base h-10 sm:h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cinematic">Cinematic</SelectItem>
                  <SelectItem value="anime">Anime</SelectItem>
                  <SelectItem value="realistic">Realistic</SelectItem>
                  <SelectItem value="artistic">Artistic</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-muted-foreground text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                <Ratio className="w-3 h-3 sm:w-4 sm:h-4" />
                Aspect
              </label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger className="bg-white/5 border-white/10 text-foreground text-sm sm:text-base h-10 sm:h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9</SelectItem>
                  <SelectItem value="9:16">9:16</SelectItem>
                  <SelectItem value="1:1">1:1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-muted-foreground text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                Duration
              </label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-white/5 border-white/10 text-foreground text-sm sm:text-base h-10 sm:h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 sec</SelectItem>
                  <SelectItem value="10">10 sec</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || taskIsActive || !prompt.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-11 sm:h-12 md:h-14 text-sm sm:text-base font-medium shadow-lg shadow-primary/20"
          >
            {isGenerating || taskIsActive ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                {taskIsActive ? "Generating video..." : "Starting generation..."}
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Generate Video
              </>
            )}
          </Button>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Result Preview */}
          {result && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-foreground text-sm font-medium truncate">{result.previewTitle}</h4>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {result.style} • {result.aspectRatio} • {result.duration}s • {result.frames} frames
                  </p>
                </div>
              </div>

              <div className={`${getPreviewAspectClass(result.aspectRatio)} rounded-lg bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-white/10 flex items-center justify-center relative overflow-hidden`}>
                {result.videoUrl && result.status === "completed" ? (
                  <video
                    className="h-full w-full rounded-lg bg-black/40 object-contain"
                    src={result.videoUrl}
                    poster={result.thumbnailUrl}
                    controls
                    playsInline
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,252,214,0.1)_0%,transparent_70%)]" />
                    <div className="text-center z-10 px-4">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                        {taskIsActive ? (
                          <Spinner className="w-6 h-6 text-primary" />
                        ) : (
                          <Play className="w-6 h-6 text-primary ml-0.5" />
                        )}
                      </div>
                      <p className="text-foreground/70 text-sm font-medium">{getStatusLabel(result)}</p>
                      <p className="text-muted-foreground text-xs mt-1">ID: {result.taskId || result.id}</p>
                    </div>
                  </>
                )}
              </div>

              {!result.previewMode && typeof result.progress === "number" && result.status !== "completed" && (
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, result.progress))}%` }}
                  />
                </div>
              )}

              <div className={`flex items-start gap-2 p-2.5 rounded-lg border ${getNoticeClasses(result)}`}>
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 text-xs leading-relaxed">
                  <p>{result.message}</p>
                  {result.videoUrl && result.status === "completed" && (
                    <a
                      href={result.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex text-primary underline-offset-4 hover:underline"
                    >
                      Open generated video
                    </a>
                  )}
                  {!result.previewMode && result.status !== "completed" && (
                    <p className="mt-1 text-muted-foreground/80">
                      Keep this tab open while Spark Robin checks the generation status.
                    </p>
                  )}
                  {result.errorMessage && (
                    <p className="mt-1">
                      {result.errorMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Notice */}
        <div className="px-5 py-3 sm:px-6 sm:py-4 md:px-8 border-t border-white/10 bg-white/[0.02]">
          <p className="text-muted-foreground/60 text-xs sm:text-sm text-center">
            Describe a scene, choose a format, and generate your video directly in Spark Robin.
          </p>
        </div>
      </div>
    </div>
  )
}
