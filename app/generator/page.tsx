import type { Metadata } from "next"
import { Check, Clock, Film, Lightbulb, Ratio, Sparkles, Wand2, Zap } from "lucide-react"

import { FooterSection } from "@/components/footer-section"
import { Header } from "@/components/header"
import { VideoGenerator } from "@/components/video-generator"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Spark Robin AI Video Generator | Create Videos Online",
  description:
    "Use the Spark Robin AI video generator to create text-to-video and image-to-video clips online with no registration. Choose styles, formats, and short video durations.",
  keywords: [
    "Spark Robin AI video generator",
    "AI video generator",
    "text to video generator",
    "image to video generator",
    "online AI video generator",
    "no registration AI video generator",
  ],
  alternates: {
    canonical: "/generator",
  },
  openGraph: {
    title: "Spark Robin AI Video Generator | Create Videos Online",
    description:
      "Create short AI videos from prompts with Spark Robin. Choose style, aspect ratio, and duration in a no-registration generator.",
    url: "/generator",
    siteName: "Spark Robin",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "Spark Robin AI video generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spark Robin AI Video Generator",
    description:
      "Generate short text-to-video and image-to-video clips online with Spark Robin.",
    images: ["/brand/og-image.png"],
  },
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sparkrobin.ai"

const steps = [
  {
    icon: Lightbulb,
    title: "Describe the scene",
    description: "Write the subject, environment, mood, motion, and key visual details in one focused prompt.",
  },
  {
    icon: Wand2,
    title: "Choose a style",
    description: "Pick Cinematic, Anime, Realistic, Artistic, or Minimalist to shape the look of the clip.",
  },
  {
    icon: Ratio,
    title: "Set the format",
    description: "Use landscape, portrait, or square output for social posts, product concepts, and creative drafts.",
  },
  {
    icon: Zap,
    title: "Generate and review",
    description: "Start the request, track progress, and play the finished video directly in Spark Robin.",
  },
]

const tips = [
  "Name the main subject early, such as a product, character, place, or action.",
  "Add camera direction, lighting, and motion cues when the result needs a cinematic feel.",
  "Keep one clear scene per request instead of mixing several unrelated ideas.",
  "Use the aspect ratio that matches the destination before starting a generation.",
]

const formats = [
  "16:9 landscape for YouTube, website headers, ads, and presentation screens.",
  "9:16 portrait for TikTok, Reels, Shorts, and mobile-first creative testing.",
  "1:1 square for social feeds, product concepts, thumbnails, and compact loops.",
]

const styles = [
  "Cinematic for film-like lighting, depth, and camera motion.",
  "Anime for illustrated scenes, expressive motion, and stylized character ideas.",
  "Realistic for natural lighting, believable materials, and product-style visuals.",
  "Artistic and Minimalist for abstract, graphic, or simplified creative directions.",
]

const faqs = [
  {
    question: "What is the Spark Robin AI video generator?",
    answer:
      "The Spark Robin AI video generator is an online tool for turning text and image ideas into short AI-generated videos. Enter a scene, choose a style and format, then start generation from the browser.",
  },
  {
    question: "Can I use Spark Robin as a text to video generator?",
    answer:
      "Yes. You can describe the subject, motion, camera direction, mood, and environment in text, then generate a short video from that prompt.",
  },
  {
    question: "Do I need to register before generating a video?",
    answer:
      "No registration is required to start from the generator page. You can enter a prompt, choose settings, and track video generation in the page.",
  },
  {
    question: "Which video formats and styles are supported?",
    answer:
      "Spark Robin supports 16:9, 9:16, and 1:1 formats with Cinematic, Anime, Realistic, Artistic, and Minimalist styles.",
  },
]

export default function GeneratorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <GeneratorJsonLd />
      <div className="mx-auto my-6 w-full max-w-[1320px] overflow-hidden rounded-2xl border border-white/[0.06]">
        <Header />
        <main className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-16">
          <section className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center md:gap-10">
            <div className="flex w-full max-w-3xl flex-col items-center pt-4">
              <Badge className="mb-5 border-white/10 bg-white/[0.06] text-foreground hover:bg-white/[0.06]">
                Online Generator
              </Badge>
              <h1 className="max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">
                Spark Robin AI Video Generator
              </h1>
              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-muted-foreground md:text-lg">
                Use the Spark Robin AI video generator to create short text-to-video and image-to-video clips online.
                Write a prompt, choose a visual style, pick a format, and generate with no registration.
              </p>
              <div className="mt-8 grid w-full max-w-2xl gap-3 text-sm text-foreground/85 sm:grid-cols-2">
                {["Text-to-video prompts", "Image idea workflows", "5s and 10s clips", "16:9, 9:16, and 1:1"].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full max-w-4xl">
              <VideoGenerator />
            </div>
          </section>

          <section className="mt-16 md:mt-20">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold md:text-4xl">How Spark Robin works</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base">
                The generator keeps the workflow simple while giving creators control over prompt detail, style, aspect ratio, and duration.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
              {steps.map((step) => (
                <article key={step.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                  <step.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-16 grid grid-cols-1 gap-4 md:mt-20 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-lg border border-white/10 bg-white/[0.04] p-6 md:p-8">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="mt-5 text-3xl font-semibold">Prompt tips for better AI video results</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base">
                Strong prompts give the generator a clear visual target. Focus on one scene, describe what should move,
                and include the mood or lighting that matters most.
              </p>
            </article>
            <div className="grid gap-3">
              {tips.map((tip) => (
                <div key={tip} className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-foreground/85">
                  {tip}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 grid grid-cols-1 gap-4 md:mt-20 md:grid-cols-2">
            <article className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
              <Film className="h-5 w-5 text-primary" />
              <h2 className="mt-4 text-2xl font-semibold">Supported video styles</h2>
              <ul className="mt-5 space-y-3">
                {styles.map((style) => (
                  <li key={style} className="text-sm leading-6 text-muted-foreground">{style}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="mt-4 text-2xl font-semibold">Formats for short video workflows</h2>
              <ul className="mt-5 space-y-3">
                {formats.map((format) => (
                  <li key={format} className="text-sm leading-6 text-muted-foreground">{format}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="mx-auto mt-16 max-w-4xl md:mt-20">
            <div className="text-center">
              <h2 className="text-3xl font-semibold md:text-4xl">Generator FAQ</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base">
                Answers for creators using Spark Robin as an online AI video generator.
              </p>
            </div>
            <div className="mt-8 grid gap-4">
              {faqs.map((faq) => (
                <article key={faq.question} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                  <h3 className="text-base font-semibold">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>
        </main>
        <FooterSection />
      </div>
    </div>
  )
}

function GeneratorJsonLd() {
  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Spark Robin AI Video Generator",
    description:
      "Spark Robin AI video generator creates short text-to-video and image-to-video clips online with style, format, and duration controls.",
    url: `${siteUrl}/generator`,
    image: `${siteUrl}/brand/og-image.png`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "No-registration AI video generation workflow",
    },
    featureList: [
      "Text to Video Generation",
      "Image to Video Generation",
      "Cinematic, Anime, Realistic, Artistic, and Minimalist Styles",
      "16:9, 9:16, and 1:1 Aspect Ratios",
      "5-second and 10-second Video Durations",
      "Live Generation Status",
    ],
    potentialAction: {
      "@type": "UseAction",
      target: `${siteUrl}/generator`,
      name: "Create a video with Spark Robin",
    },
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}
