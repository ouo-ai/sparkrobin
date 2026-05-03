import { Play } from "lucide-react"

const examples = [
  {
    prompt: "A golden sunrise over misty mountains with eagles soaring",
    style: "Cinematic",
    duration: "4s",
    aspectRatio: "16:9",
  },
  {
    prompt: "Cyberpunk city street at night with neon reflections on wet pavement",
    style: "Artistic",
    duration: "6s",
    aspectRatio: "16:9",
  },
  {
    prompt: "Cherry blossom petals falling in slow motion, anime style",
    style: "Anime",
    duration: "4s",
    aspectRatio: "9:16",
  },
  {
    prompt: "Ocean waves crashing on rocky cliffs during a thunderstorm",
    style: "Realistic",
    duration: "8s",
    aspectRatio: "16:9",
  },
  {
    prompt: "Abstract geometric shapes morphing and flowing",
    style: "Minimalist",
    duration: "4s",
    aspectRatio: "1:1",
  },
  {
    prompt: "A cozy cabin interior with fireplace and falling snow outside",
    style: "Cinematic",
    duration: "6s",
    aspectRatio: "4:3",
  },
]

export function ExamplesSection() {
  return (
    <section className="w-full px-5 py-16 md:py-24">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-foreground text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">
          Example Prompts
        </h2>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
          Get inspired by these example prompts. Try them in the generator above or create your own.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {examples.map((example, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent hover:from-white/[0.08] transition-all duration-300"
          >
            {/* Preview Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Play className="w-5 h-5 text-primary ml-0.5" />
                </div>
              </div>
              {/* Style Badge */}
              <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-xs text-foreground/80">
                {example.style}
              </div>
              {/* Duration Badge */}
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-xs text-foreground/80">
                {example.duration}
              </div>
            </div>

            {/* Prompt */}
            <div className="p-4">
              <p className="text-foreground text-sm leading-relaxed line-clamp-2">{example.prompt}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>{example.aspectRatio}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <span>{example.style}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
