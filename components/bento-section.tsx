import { Palette, Wand2, Ratio, Clock, Zap, Sparkles } from "lucide-react"

interface BentoCardProps {
  title: string
  description: string
  icon: React.ElementType
  gradient: string
}

const BentoCard = ({ title, description, icon: Icon, gradient }: BentoCardProps) => (
  <div className="overflow-hidden rounded-2xl border border-white/20 flex flex-col justify-start items-start relative group hover:border-white/30 transition-colors">
    {/* Background with blur effect */}
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        background: "rgba(231, 236, 235, 0.06)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    />
    {/* Additional subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />

    <div className="self-stretch p-6 flex flex-col justify-start items-start gap-4 relative z-10">
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-foreground" />
      </div>
      
      {/* Content */}
      <div className="self-stretch flex flex-col justify-start items-start gap-2">
        <h3 className="text-foreground text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
)

const features: BentoCardProps[] = [
  {
    title: "Multiple Video Styles",
    description: "Choose from Cinematic, Anime, Realistic, Artistic, and Minimalist styles to match your creative vision.",
    icon: Palette,
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    title: "Smart AI Generation",
    description: "Advanced AI understands your prompts and creates fluid, coherent video sequences with natural motion.",
    icon: Wand2,
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Flexible Aspect Ratios",
    description: "Create videos in 16:9 for YouTube, 9:16 for TikTok/Reels, 1:1 for Instagram, or 4:3 for presentations.",
    icon: Ratio,
    gradient: "from-orange-500/20 to-amber-500/20",
  },
  {
    title: "Variable Duration",
    description: "Generate 2, 4, 6, or 8-second clips perfect for social media, ads, or longer creative projects.",
    icon: Clock,
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    title: "Instant Preview",
    description: "See your generation settings and preview metadata instantly before committing to full generation.",
    icon: Zap,
    gradient: "from-yellow-500/20 to-orange-500/20",
  },
  {
    title: "No Registration Demo",
    description: "Try the complete workflow without signing up. Experience the interface and test your prompts freely.",
    icon: Sparkles,
    gradient: "from-teal-500/20 to-cyan-500/20",
  },
]

export function BentoSection() {
  return (
    <section className="w-full px-5 flex flex-col justify-center items-center overflow-visible bg-transparent">
      <div className="w-full py-8 md:py-16 relative flex flex-col justify-start items-start gap-6">
        <div className="w-[547px] h-[938px] absolute top-[614px] left-[80px] origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[130px] z-0" />
        <div className="self-stretch py-8 md:py-14 flex flex-col justify-center items-center gap-2 z-10">
          <div className="flex flex-col justify-start items-center gap-4">
            <h2 className="w-full max-w-[655px] text-center text-foreground text-4xl md:text-5xl font-semibold leading-tight">
              Powerful Video Generation Controls
            </h2>
            <p className="w-full max-w-[600px] text-center text-muted-foreground text-base md:text-lg font-medium leading-relaxed">
              Fine-tune every aspect of your AI-generated videos with intuitive style and format controls.
            </p>
          </div>
        </div>
        <div className="self-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10">
          {features.map((feature) => (
            <BentoCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
