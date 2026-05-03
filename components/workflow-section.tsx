import { PenLine, Sliders, Wand2, Download } from "lucide-react"

const steps = [
  {
    icon: PenLine,
    title: "Describe Your Vision",
    description: "Enter a text prompt describing the video you want to create, or upload a reference image.",
  },
  {
    icon: Sliders,
    title: "Customize Settings",
    description: "Choose your preferred style, aspect ratio, and duration to match your creative needs.",
  },
  {
    icon: Wand2,
    title: "AI Generation",
    description: "Our AI transforms your prompt into fluid video frames with motion, lighting, and detail.",
  },
  {
    icon: Download,
    title: "Export & Share",
    description: "Download your generated video in high quality or share directly to social platforms.",
  },
]

export function WorkflowSection() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-foreground text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">
          How Spark Robin Works
        </h2>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
          Create stunning AI videos in four simple steps. No technical expertise required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="relative p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
          >
            {/* Step Number */}
            <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">
              {index + 1}
            </div>

            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <step.icon className="w-6 h-6 text-primary" />
            </div>

            {/* Content */}
            <h3 className="text-foreground text-lg font-semibold mb-2">{step.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>

            {/* Connector Line (hidden on last item and mobile) */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-white/20 to-transparent" />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
