import { Video, Megaphone, GraduationCap, Gamepad2, Music, ShoppingBag } from "lucide-react"

const useCases = [
  {
    icon: Video,
    title: "Content Creation",
    description: "Create engaging social media videos, YouTube shorts, and TikTok content with AI-generated visuals.",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Megaphone,
    title: "Marketing & Ads",
    description: "Generate eye-catching promotional videos and ad creatives without expensive production costs.",
    gradient: "from-orange-500/20 to-amber-500/20",
  },
  {
    icon: GraduationCap,
    title: "Education",
    description: "Transform educational content into visual stories that engage students and simplify concepts.",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: Gamepad2,
    title: "Game Development",
    description: "Create cutscenes, trailers, and promotional content for indie games and prototypes.",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: Music,
    title: "Music Videos",
    description: "Generate stunning visual accompaniments for music tracks and album releases.",
    gradient: "from-rose-500/20 to-red-500/20",
  },
  {
    icon: ShoppingBag,
    title: "E-commerce",
    description: "Create product videos and walkthroughs to boost sales and customer engagement.",
    gradient: "from-teal-500/20 to-cyan-500/20",
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
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${useCase.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <useCase.icon className="w-7 h-7 text-foreground" />
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
