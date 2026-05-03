import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Spark Robin AI Video Generator | Text To Video & Image to Video',
  description: 'Spark Robin is an AI video generator for Text To Video and Image to Video creation with a no-registration workflow.',
  keywords: ['Spark Robin', 'sparkrobin', 'spark robin ai', 'Spark Robin AI video generator', 'Text To Video', 'Image to Video', 'AI video generator', 'text to video generator', 'image to video generator'],
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
    title: 'Spark Robin AI Video Generator | Text To Video & Image to Video',
    description: 'Use Spark Robin for Text To Video and Image to Video generation with no registration.',
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
    description: 'Generate Text To Video and Image to Video clips in the Spark Robin no-registration workflow.',
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
  other: {
    'naver-site-verification': '1eb2dc2bc9482cde29c87d8795d5a560ee792421',
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
        <script defer data-domain="sparkrobin.ai" src="https://plau.origai.net/js/script.js" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
