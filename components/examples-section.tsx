import { EXAMPLE_VIDEOS } from "@/lib/example-videos"

export function ExamplesSection() {
  return (
    <section className="w-full px-5 py-16 md:py-24">
      <div className="mx-auto mb-12 flex max-w-4xl flex-col items-center gap-5 text-center md:mb-16">
        <div>
          <h2 className="text-foreground text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">
            Example Prompts
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Explore pre-generated videos from sample prompts, then create your own scene above.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {EXAMPLE_VIDEOS.map((example) => (
          <article
            key={example.id}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent text-left transition-all duration-300 hover:from-white/[0.08]"
          >
            <div className="aspect-video bg-white/[0.03] relative">
              <video
                className="h-full w-full bg-black/40 object-cover"
                src={example.videoSrc}
                poster={example.posterSrc}
                controls
                playsInline
                preload="metadata"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-black/10" />
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
                <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-xs text-foreground/80">
                  {example.styleLabel}
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-xs text-foreground/80">
                  {example.duration}s
                </div>
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
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
