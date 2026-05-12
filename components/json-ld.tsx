export function JsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sparkrobin.ai"
  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Spark Robin",
    description: "Spark Robin is an AI video generator for Text To Video and Image to Video creation with live generation status.",
    url: siteUrl,
    image: `${siteUrl}/brand/og-image.png`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Google sign-in video generation workflow available",
    },
    featureList: [
      "Text To Video Generation",
      "Image to Video Generation",
      "Multiple Video Styles",
      "Custom Aspect Ratios",
      "Variable Duration",
      "Google Sign-In Required",
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
          text: "Spark Robin is an AI video generator for Text To Video and Image to Video creation. You can write a prompt or upload a reference image, then choose style, format, and duration.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use Spark Robin for Image to Video?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Switch to Image to Video, upload a reference image, describe the motion, and generate a short video from that image.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to register to try Spark Robin?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Google sign-in is required before generating a video. After signing in, you can choose Text To Video or Image to Video, enter a prompt, choose a format, and track generation status directly in the page.",
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
          text: "Spark Robin supports 16:9 landscape and 9:16 portrait videos. Sora 2 durations include 4, 8, 12, 16, and 20 seconds.",
        },
      },
      {
        "@type": "Question",
        name: "Is this a free AI video generator?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Spark Robin requires Google sign-in before generation. After signing in, enter a prompt, choose your settings, and start a video generation workflow directly from the page.",
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
