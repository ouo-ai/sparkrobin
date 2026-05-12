"use client"

import type { ChangeEvent } from "react"
import { useEffect, useState } from "react"
import NextImage from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Play, Image as ImageIcon, Film, Clock, Ratio, Palette, Info, Upload, X, LogIn, LogOut, UserCircle } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { signIn, signOut, useSession } from "@/lib/auth-client"

type VideoGenerationMode = "text-to-video" | "image-to-video"
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
  generationMode: VideoGenerationMode
  imageUrls?: string[]
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
const MAX_REFERENCE_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_REFERENCE_IMAGE_DIMENSION = 1280
const generationModes: Array<{ id: VideoGenerationMode; label: string; description: string }> = [
  {
    id: "text-to-video",
    label: "Text To Video",
    description: "Create from a prompt",
  },
  {
    id: "image-to-video",
    label: "Image to Video",
    description: "Animate a reference image",
  },
]
const promptSuggestions: Record<VideoGenerationMode, string[]> = {
  "text-to-video": [
    "A majestic eagle soaring through golden sunset clouds over mountain peaks...",
    "A futuristic city street glowing with neon reflections after rain...",
    "Cherry blossom petals drifting in slow motion across a quiet garden...",
  ],
  "image-to-video": [
    "Animate this image with slow cinematic camera movement and natural lighting...",
    "Turn the subject toward the camera with subtle motion and soft background depth...",
    "Add gentle environmental motion while preserving the main subject...",
  ],
}

function getPreviewAspectClass(aspectRatio: string): string {
  if (aspectRatio === "9:16") {
    return "aspect-[9/16] max-h-[420px] w-full max-w-[260px] mx-auto"
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

function readImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Upload a valid image file"))
    }

    image.src = objectUrl
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Image conversion failed"))
        return
      }

      resolve(blob)
    }, type, quality)
  })
}

async function normalizeReferenceImage(file: File): Promise<File> {
  const image = await readImage(file)
  const scale = Math.min(1, MAX_REFERENCE_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")

  if (!context) {
    throw new Error("Image conversion is unavailable in this browser")
  }

  canvas.width = width
  canvas.height = height
  context.fillStyle = "#ffffff"
  context.fillRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)

  const blob = await canvasToBlob(canvas, "image/jpeg", 0.92)
  const baseName = file.name.replace(/\.[^.]+$/, "") || "reference-image"

  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  })
}

export function VideoGenerator() {
  const [generationMode, setGenerationMode] = useState<VideoGenerationMode>("text-to-video")
  const [prompt, setPrompt] = useState("")
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [referencePreviewUrl, setReferencePreviewUrl] = useState<string | null>(null)
  const [style, setStyle] = useState("cinematic")
  const [aspectRatio, setAspectRatio] = useState("16:9")
  const [duration, setDuration] = useState("4")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<GenerateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [promptHintIndex, setPromptHintIndex] = useState(0)
  const { data: session, isPending: sessionIsPending } = useSession()
  const user = session?.user
  const taskIsActive = Boolean(result?.taskId && !result.previewMode && ACTIVE_TASK_STATUSES.includes(result.status))
  const activePromptSuggestions = promptSuggestions[generationMode]
  const activeMode = generationModes.find((mode) => mode.id === generationMode) || generationModes[0]
  const canGenerate = Boolean(prompt.trim()) && (generationMode === "text-to-video" || Boolean(referenceImage))

  useEffect(() => {
    if (!referenceImage) {
      setReferencePreviewUrl(null)
      return
    }

    const previewUrl = URL.createObjectURL(referenceImage)
    setReferencePreviewUrl(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [referenceImage])

  useEffect(() => {
    setPromptHintIndex(0)
  }, [generationMode])

  useEffect(() => {
    if (prompt) {
      return
    }

    const intervalId = setInterval(() => {
      setPromptHintIndex((current) => (current + 1) % promptSuggestions[generationMode].length)
    }, 3200)

    return () => clearInterval(intervalId)
  }, [generationMode, prompt])

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

  const handleSignIn = async () => {
    setError(null)

    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: `${window.location.pathname}${window.location.search}`,
      })

      if (result?.error) {
        setError("Google sign-in is temporarily unavailable. Try again in a moment.")
      }
    } catch {
      setError("Google sign-in is temporarily unavailable. Try again in a moment.")
    }
  }

  const handleSignOut = async () => {
    setError(null)
    setResult(null)

    await signOut()
  }

  const handleGenerate = async () => {
    if (!user) {
      await handleSignIn()
      return
    }

    if (!prompt.trim()) {
      setError("Please enter a prompt to generate a video")
      return
    }

    if (generationMode === "image-to-video" && !referenceImage) {
      setError("Please upload an image for Image to Video")
      return
    }

    setIsGenerating(true)
    setError(null)
    setResult(null)

    try {
      let imageUrls: string[] | undefined

      if (generationMode === "image-to-video" && referenceImage) {
        const uploadFile = await normalizeReferenceImage(referenceImage)
        const formData = new FormData()
        formData.append("file", uploadFile)

        const uploadResponse = await fetch("/api/uploads/images", {
          method: "POST",
          body: formData,
        })
        const uploadData = await uploadResponse.json()

        if (!uploadResponse.ok || typeof uploadData.url !== "string") {
          if (uploadResponse.status === 401) {
            setError("Sign in with Google to upload an image.")
            return
          }

          throw new Error(uploadData.error || "Failed to upload image")
        }

        imageUrls = [uploadData.url]
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationMode,
          prompt: prompt.trim(),
          style,
          aspectRatio,
          duration: parseInt(duration),
          imageUrls,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setError("Sign in with Google to generate your video.")
          return
        }

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

  const handleReferenceImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      setError("Upload an image file for Image to Video")
      event.target.value = ""
      return
    }

    if (file.size > MAX_REFERENCE_IMAGE_BYTES) {
      setError("Image must be 10MB or smaller")
      event.target.value = ""
      return
    }

    setReferenceImage(file)
    setError(null)
  }

  const handleGenerationModeChange = (mode: VideoGenerationMode) => {
    setGenerationMode(mode)
    setError(null)
    setResult(null)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="rounded-2xl border border-white/20 overflow-hidden" style={{
        background: "rgba(231, 236, 235, 0.06)",
        backdropFilter: "blur(12px)",
      }}>
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 md:px-8 border-b border-white/10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center">
              <Film className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground text-sm sm:text-base font-medium">{activeMode.label}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">Google sign-in required</p>
            </div>
          </div>
          {sessionIsPending ? (
            <div className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs text-muted-foreground sm:self-auto">
              <Spinner className="h-3.5 w-3.5" />
              Checking account
            </div>
          ) : user ? (
            <div className="flex min-w-0 items-center justify-between gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-2 pr-1 sm:max-w-[320px]">
              <div className="flex min-w-0 items-center gap-2">
                <UserCircle className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate text-xs text-foreground/85">{user.email || user.name || "Signed in"}</span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign in with Google
            </button>
          )}
        </div>

        {/* Input Section */}
        <div className="p-5 sm:p-6 md:p-8 space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-1.5 sm:grid-cols-2">
            {generationModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleGenerationModeChange(mode.id)}
                className={`rounded-xl px-4 py-3 text-left transition-colors ${
                  generationMode === mode.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                }`}
              >
                <span className="block text-sm font-semibold sm:text-base">{mode.label}</span>
                <span className="mt-0.5 block text-xs opacity-75">{mode.description}</span>
              </button>
            ))}
          </div>

          {generationMode === "image-to-video" && (
            <div className="space-y-2 sm:space-y-3">
              <label htmlFor="reference-image" className="text-foreground text-sm sm:text-base font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Reference image
              </label>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-stretch">
                <label
                  htmlFor="reference-image"
                  className="relative flex min-h-[118px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/15 bg-white/[0.04] p-4 transition-colors hover:border-primary/45 hover:bg-white/[0.06]"
                >
                  {referencePreviewUrl ? (
                    <NextImage
                      src={referencePreviewUrl}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                      aria-hidden="true"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                      <Upload className="h-6 w-6 text-primary" />
                      <span className="text-sm font-medium text-foreground">Upload image for Image to Video</span>
                      <span className="text-xs">JPG, PNG, WebP, or GIF up to 10MB</span>
                    </div>
                  )}
                </label>
                <input
                  id="reference-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={handleReferenceImageChange}
                />
                {referenceImage && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground sm:w-48 sm:flex-col sm:items-start sm:justify-center">
                    <span className="min-w-0 truncate">{referenceImage.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setReferenceImage(null)
                        setResult(null)
                      }}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-foreground/80 transition-colors hover:bg-white/10 hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2 sm:space-y-3">
            <label htmlFor="video-prompt" className="text-foreground text-sm sm:text-base font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              {generationMode === "image-to-video" ? "Describe image motion" : "Describe your video"}
            </label>
            <div className="relative">
              <Textarea
                id="video-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[96px] md:min-h-[128px] bg-white/5 border-white/10 text-sm sm:text-base text-foreground resize-none focus:border-primary/50 focus:ring-primary/20"
                maxLength={2500}
              />
              {!prompt && (
                <div className="pointer-events-none absolute left-3 right-3 top-3 overflow-hidden text-left text-sm leading-6 text-zinc-300/55 sm:left-4 sm:right-4 sm:top-3 sm:text-base">
                  <span key={promptHintIndex} className="block animate-prompt-hint">
                    {activePromptSuggestions[promptHintIndex]}
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-between gap-3 text-xs sm:text-sm text-muted-foreground/70">
              <span>{generationMode === "image-to-video" ? "Describe how the image should move" : "Be descriptive for better results"}</span>
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
                  <SelectItem value="4">4 sec</SelectItem>
                  <SelectItem value="8">8 sec</SelectItem>
                  <SelectItem value="12">12 sec</SelectItem>
                  <SelectItem value="16">16 sec</SelectItem>
                  <SelectItem value="20">20 sec</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={sessionIsPending || isGenerating || taskIsActive || (Boolean(user) && !canGenerate)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-11 sm:h-12 md:h-14 text-sm sm:text-base font-medium shadow-lg shadow-primary/20"
          >
            {sessionIsPending ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Checking account...
              </>
            ) : !user ? (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign in with Google to generate
              </>
            ) : isGenerating || taskIsActive ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                {taskIsActive ? "Generating video..." : generationMode === "image-to-video" ? "Preparing image..." : "Starting generation..."}
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                {generationMode === "image-to-video" ? "Generate Image to Video" : "Generate Text To Video"}
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
                    {result.generationMode === "image-to-video" ? "Image to Video" : "Text To Video"} • {result.style} • {result.aspectRatio} • {result.duration}s
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
                  {!result.previewMode && ACTIVE_TASK_STATUSES.includes(result.status) && (
                    <p className="mt-1 text-muted-foreground/80">
                      Keep this tab open while Spark Robin checks the generation status.
                    </p>
                  )}
                  {result.errorMessage && result.message !== result.errorMessage && (
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
            Choose Text To Video or Image to Video, set the format, and generate directly in Spark Robin.
          </p>
        </div>
      </div>
    </div>
  )
}
