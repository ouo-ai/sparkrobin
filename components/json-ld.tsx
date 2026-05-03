export function JsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sparkrobin.ai"
  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Spark Robin",
    description: "Spark Robin is an AI video generator demo that previews text-to-video and image-to-video workflows. The public demo returns mock generation data until a real provider key is connected.",
    url: siteUrl,
    image: `${siteUrl}/brand/og-image.png`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free workflow demo available",
    },
    featureList: [
      "Text to Video Generation",
      "Image to Video Generation",
      "Multiple Video Styles",
      "Custom Aspect Ratios",
      "Variable Duration",
        "No Registration Required for Demo",
        "Mock API Response Preview",
    ],
    potentialAction: {
      "@type": "UseAction",
      target: `${siteUrl}/#generator`,
      name: "Try the Spark Robin demo generator",
    },
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Spark Robin?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Spark Robin is an AI video generator that transforms your text prompts and images into stunning, fluid videos. It uses advanced AI models to create cinematic, anime, realistic, and artistic video content.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to register to try Spark Robin?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No registration is required to try our demo. You can immediately test the workflow and see how the generator works. For production use with real AI video generation, you'll need to connect your own provider API key.",
        },
      },
      {
        "@type": "Question",
        name: "What video styles does Spark Robin support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Spark Robin supports multiple styles including Cinematic, Anime, Realistic, Artistic, and Minimalist. Each style produces distinctly different visual aesthetics for your videos.",
        },
      },
      {
        "@type": "Question",
        name: "What aspect ratios and durations are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Spark Robin supports 16:9 (landscape), 9:16 (portrait/vertical), 1:1 (square), and 4:3 aspect ratios. Video durations range from 2 to 8 seconds.",
        },
      },
      {
        "@type": "Question",
        name: "Is this a free AI video generator?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The demo experience is free and requires no registration. This allows you to explore the workflow and interface. For generating real AI videos, you'll need to connect a video generation provider.",
        },
      },
    ],
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
