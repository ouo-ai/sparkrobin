import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check, Clock, Sparkles, Shield, Zap } from "lucide-react"

import { FooterSection } from "@/components/footer-section"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Spark Robin Pricing | AI Video Generator Plans",
  description:
    "Choose a Spark Robin plan for AI video generation. Start free, then scale with monthly video credits, priority generation, and team-ready workflows.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Spark Robin Pricing | AI Video Generator Plans",
    description:
      "Simple plans for turning prompts into short AI videos with Spark Robin.",
    url: "/pricing",
    siteName: "Spark Robin",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "Spark Robin pricing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spark Robin Pricing",
    description: "Simple AI video generation plans for creators and teams.",
    images: ["/brand/og-image.png"],
  },
}

const plans = [
  {
    name: "Starter",
    price: "$0",
    cadence: "forever",
    summary: "For quick ideas, prompt testing, and first videos.",
    cta: "Start Generating",
    href: "/#generator",
    featured: false,
    features: [
      "No registration required",
      "Core video styles",
      "5-second video generation",
      "Landscape, portrait, and square formats",
      "Generation status tracking",
    ],
  },
  {
    name: "Creator",
    price: "$19",
    cadence: "per month",
    summary: "For creators publishing videos every week.",
    cta: "Choose Creator",
    href: "/#generator",
    featured: true,
    features: [
      "120 monthly video credits",
      "5-second and 10-second videos",
      "Priority generation queue",
      "Commercial project use",
      "Email support",
    ],
  },
  {
    name: "Studio",
    price: "$49",
    cadence: "per month",
    summary: "For teams producing campaign and product video assets.",
    cta: "Choose Studio",
    href: "/#generator",
    featured: false,
    features: [
      "420 monthly video credits",
      "Priority generation queue",
      "Team prompt guidance",
      "Campaign-ready aspect ratios",
      "Priority support",
    ],
  },
]

const included = [
  {
    icon: Sparkles,
    title: "Prompt-first creation",
    description: "Describe the scene, mood, motion, and format in one focused workflow.",
  },
  {
    icon: Clock,
    title: "Short-form formats",
    description: "Create 5-second or 10-second clips for social posts, product shots, and concepts.",
  },
  {
    icon: Shield,
    title: "Private by default",
    description: "Your prompts stay inside the generation workflow and are not shown publicly on the site.",
  },
  {
    icon: Zap,
    title: "Fast iteration",
    description: "Adjust style, aspect ratio, and duration before starting the next generation.",
  },
]

const questions = [
  {
    question: "Can I start without registering?",
    answer: "Yes. The Starter plan lets you begin from the generator with no registration required.",
  },
  {
    question: "What is a video credit?",
    answer: "A video credit represents one generation request. Longer videos may use more monthly capacity as plan limits evolve.",
  },
  {
    question: "Can I use generated videos commercially?",
    answer: "Creator and Studio are designed for commercial projects such as ads, product visuals, and social campaigns.",
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto my-6 w-full max-w-[1320px] overflow-hidden rounded-2xl border border-white/[0.06]">
        <div className="relative">
          <Header />
          <main className="px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20">
            <section className="mx-auto flex max-w-4xl flex-col items-center text-center">
              <Badge className="mb-5 border-white/10 bg-white/[0.06] text-foreground hover:bg-white/[0.06]">
                Pricing
              </Badge>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
                Simple plans for AI video generation
              </h1>
              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-muted-foreground md:text-lg">
                Start free, then scale with monthly video credits, priority generation, and workflows built for repeated creative production.
              </p>
            </section>

            <section className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <article
                  key={plan.name}
                  className={`relative flex min-h-[560px] flex-col rounded-lg border p-6 ${
                    plan.featured
                      ? "border-primary/50 bg-white/[0.08] shadow-[0_0_0_1px_rgba(120,252,214,0.18)]"
                      : "border-white/10 bg-white/[0.045]"
                  }`}
                >
                  {plan.featured && (
                    <Badge className="absolute right-5 top-5 border-primary/20 bg-primary/15 text-primary hover:bg-primary/15">
                      Popular
                    </Badge>
                  )}
                  <div>
                    <h2 className="text-2xl font-semibold">{plan.name}</h2>
                    <p className="mt-3 min-h-[48px] text-sm leading-6 text-muted-foreground">{plan.summary}</p>
                    <div className="mt-7 flex items-end gap-2">
                      <span className="text-5xl font-semibold tracking-normal">{plan.price}</span>
                      <span className="pb-2 text-sm font-medium text-muted-foreground">{plan.cadence}</span>
                    </div>
                  </div>

                  <Button
                    asChild
                    className={`mt-8 h-12 rounded-full ${
                      plan.featured
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    }`}
                  >
                    <Link href={plan.href}>
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-foreground/85">
                        <Check className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </section>

            <section className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-4">
              {included.map((item) => (
                <article key={item.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                  <item.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </article>
              ))}
            </section>

            <section className="mx-auto mt-16 max-w-4xl rounded-lg border border-white/10 bg-white/[0.04] p-6 md:p-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Pricing questions</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    A compact guide to choosing the right Spark Robin plan.
                  </p>
                </div>
                <Button asChild variant="secondary" className="rounded-full">
                  <Link href="/#generator">Start Generating</Link>
                </Button>
              </div>
              <div className="mt-8 grid gap-5">
                {questions.map((item) => (
                  <div key={item.question} className="border-t border-white/10 pt-5">
                    <h3 className="text-base font-semibold">{item.question}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
      <FooterSection />
    </div>
  )
}
