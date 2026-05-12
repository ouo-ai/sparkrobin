import Image from "next/image"

interface BentoCardProps {
  title: string
  description: string
  iconSrc: string
}

const BentoCard = ({ title, description, iconSrc }: BentoCardProps) => (
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
      <div className="w-14 h-14 overflow-hidden rounded-xl group-hover:scale-105 transition-transform">
        <Image
          src={iconSrc}
          alt=""
          width={112}
          height={112}
          className="h-full w-full object-cover"
          aria-hidden="true"
        />
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
    iconSrc: "/brand/card-icons/video-styles.png",
  },
  {
    title: "Smart AI Generation",
    description: "Create Text To Video clips from prompts or Image to Video clips from uploaded reference images.",
    iconSrc: "/brand/card-icons/smart-generation.png",
  },
  {
    title: "Flexible Aspect Ratios",
    description: "Create videos in 16:9 for YouTube and websites, or 9:16 for TikTok, Reels, and Shorts.",
    iconSrc: "/brand/card-icons/aspect-ratios.png",
  },
  {
    title: "Variable Duration",
    description: "Generate 4, 8, 12, 16, or 20-second Sora 2 clips for social media, ads, and creative projects.",
    iconSrc: "/brand/card-icons/duration.png",
  },
  {
    title: "Instant Preview",
    description: "See your generation settings and preview metadata instantly before committing to full generation.",
    iconSrc: "/brand/card-icons/instant-preview.png",
  },
  {
    title: "Google Sign-In",
    description: "Use Google sign-in before generation so video requests are tied to a real account.",
    iconSrc: "/brand/card-icons/no-registration.png",
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
