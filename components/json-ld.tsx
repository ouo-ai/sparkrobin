export function JsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sparkrobin.video"
  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Spark Robin",
    description: "Spark Robin is an AI video generator workflow for turning text prompts and image ideas into short video concepts with no registration.",
    url: siteUrl,
    image: `${siteUrl}/brand/og-image.png`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free no-registration workflow preview available",
    },
    featureList: [
      "Text to Video Generation",
      "Image to Video Generation",
      "Multiple Video Styles",
      "Custom Aspect Ratios",
      "Variable Duration",
      "No Registration Required",
      "Live Generation Status",
    ],
    potentialAction: {
      "@type": "UseAction",
      target: `${siteUrl}/#generator`,
      name: "Try the Spark Robin generator",
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
          text: "Spark Robin is an AI video generator workflow for turning text prompts and image ideas into short video concepts. It supports cinematic, anime, realistic, artistic, and minimalist settings.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to register to try Spark Robin?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No registration is required. You can immediately enter a prompt, choose a format, and track generation status directly in the page.",
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
          text: "Spark Robin supports 16:9 (landscape), 9:16 (portrait/vertical), and 1:1 (square) aspect ratios. Video durations include 5 and 10 seconds.",
        },
      },
      {
        "@type": "Question",
        name: "Is this a free AI video generator?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Spark Robin can be tried without registration. Enter a prompt, choose your settings, and preview the video generation workflow directly from the page.",
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
