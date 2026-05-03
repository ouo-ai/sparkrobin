import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Spark Robin AI Video Generator | Text to Video Demo',
  description: 'Spark Robin is an AI video generator for turning text and image ideas into short video concepts with a no-registration workflow.',
  keywords: ['Spark Robin', 'sparkrobin', 'spark robin ai', 'Spark Robin AI video generator', 'AI video generator', 'text to video generator', 'image to video generator'],
  authors: [{ name: 'Spark Robin' }],
  creator: 'Spark Robin',
  publisher: 'Spark Robin',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sparkrobin.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Spark Robin',
    title: 'Spark Robin AI Video Generator | Text to Video Demo',
    description: 'Use Spark Robin to preview a no-registration AI video generator workflow for text-to-video and image-to-video ideas.',
    images: [
      {
        url: '/brand/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Spark Robin AI Video Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spark Robin AI Video Generator',
    description: 'Preview text-to-video and image-to-video workflows in the Spark Robin no-registration demo.',
    images: ['/brand/og-image.png'],
    creator: '@sparkrobin',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/brand/favicon-32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/brand/favicon-32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/brand/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: '/brand/apple-touch-icon.png',
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: '#0f1211',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
