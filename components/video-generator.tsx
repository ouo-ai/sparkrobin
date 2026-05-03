"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Play, Image as ImageIcon, Film, Clock, Ratio, Palette, Info } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface GenerateResponse {
  id: string
  status: string
  prompt: string
  style: string
  duration: number
  aspectRatio: string
  estimatedSeconds: number
  previewTitle: string
  frames: number
  message: string
  demoMode: boolean
}

export function VideoGenerator() {
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("cinematic")
  const [aspectRatio, setAspectRatio] = useState("16:9")
  const [duration, setDuration] = useState("4")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<GenerateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

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
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-2xl border border-white/20 overflow-hidden" style={{
        background: "rgba(231, 236, 235, 0.06)",
        backdropFilter: "blur(12px)",
      }}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Film className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-foreground text-sm font-medium">AI Video Generator</h3>
            <p className="text-muted-foreground text-xs">No registration required</p>
          </div>
        </div>

        {/* Input Section */}
        <div className="p-5 space-y-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-foreground text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Describe your video
            </label>
            <Textarea
              placeholder="A majestic eagle soaring through golden sunset clouds over mountain peaks..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px] bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground/50 resize-none focus:border-primary/50 focus:ring-primary/20"
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-muted-foreground/70">
              <span>Be descriptive for better results</span>
              <span>{prompt.length}/500</span>
            </div>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Style */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground text-xs font-medium flex items-center gap-1.5">
                <Palette className="w-3 h-3" />
                Style
              </label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="bg-white/5 border-white/10 text-foreground text-sm h-9">
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
            <div className="space-y-1.5">
              <label className="text-muted-foreground text-xs font-medium flex items-center gap-1.5">
                <Ratio className="w-3 h-3" />
                Aspect
              </label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger className="bg-white/5 border-white/10 text-foreground text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9</SelectItem>
                  <SelectItem value="9:16">9:16</SelectItem>
                  <SelectItem value="1:1">1:1</SelectItem>
                  <SelectItem value="4:3">4:3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground text-xs font-medium flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Duration
              </label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-white/5 border-white/10 text-foreground text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 sec</SelectItem>
                  <SelectItem value="4">4 sec</SelectItem>
                  <SelectItem value="6">6 sec</SelectItem>
                  <SelectItem value="8">8 sec</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-11 font-medium shadow-lg shadow-primary/20"
          >
            {isGenerating ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Generating Preview...
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
              
              {/* Demo Video Placeholder */}
              <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-white/10 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,252,214,0.1)_0%,transparent_70%)]" />
                <div className="text-center z-10">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                    <Play className="w-6 h-6 text-primary ml-0.5" />
                  </div>
                  <p className="text-foreground/70 text-sm font-medium">Demo Preview</p>
                  <p className="text-muted-foreground text-xs mt-1">ID: {result.id}</p>
                </div>
              </div>

              {/* Demo Notice */}
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-amber-200/80 text-xs leading-relaxed">
                  {result.message}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Notice */}
        <div className="px-5 py-3 border-t border-white/10 bg-white/[0.02]">
          <p className="text-muted-foreground/60 text-xs text-center">
            This is a fast demo experience. Connect your own AI provider key to generate real videos.
          </p>
        </div>
      </div>
    </div>
  )
}
