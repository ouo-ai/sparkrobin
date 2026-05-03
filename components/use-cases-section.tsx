import Image from "next/image"

const useCases = [
  {
    iconSrc: "/brand/card-icons/content-creation.png",
    title: "Content Creation",
    description: "Create engaging social media videos, YouTube shorts, and TikTok content with AI-generated visuals.",
  },
  {
    iconSrc: "/brand/card-icons/marketing-ads.png",
    title: "Marketing & Ads",
    description: "Generate eye-catching promotional videos and ad creatives without expensive production costs.",
  },
  {
    iconSrc: "/brand/card-icons/education.png",
    title: "Education",
    description: "Transform educational content into visual stories that engage students and simplify concepts.",
  },
  {
    iconSrc: "/brand/card-icons/game-development.png",
    title: "Game Development",
    description: "Create cutscenes, trailers, and promotional content for indie games and prototypes.",
  },
  {
    iconSrc: "/brand/card-icons/music-videos.png",
    title: "Music Videos",
    description: "Generate stunning visual accompaniments for music tracks and album releases.",
  },
  {
    iconSrc: "/brand/card-icons/ecommerce.png",
    title: "E-commerce",
    description: "Create product videos and walkthroughs to boost sales and customer engagement.",
  },
]

export function UseCasesSection() {
  return (
    <section className="w-full px-5 py-16 md:py-24">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-foreground text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">
          Built for Creators Like You
        </h2>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
          From social media to marketing, education to entertainment - Spark Robin adapts to your creative needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {useCases.map((useCase) => (
          <div
            key={useCase.title}
            className="group p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300"
          >
            {/* Icon with gradient background */}
            <div className="mb-4 h-14 w-14 overflow-hidden rounded-xl group-hover:scale-105 transition-transform">
              <Image
                src={useCase.iconSrc}
                alt=""
                width={112}
                height={112}
                className="h-full w-full object-cover"
                aria-hidden="true"
              />
            </div>

            {/* Content */}
            <h3 className="text-foreground text-xl font-semibold mb-2">{useCase.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{useCase.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
