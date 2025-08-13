import type { Metadata } from 'next'
import './globals.css'
import { Inter, Playfair_Display } from 'next/font/google'
import { PageLoader } from '@/components/page-loader'
import { AccentRouteTransition } from '@/components/accent-route-transition'

export const metadata: Metadata = {
  title: {
    default: "Tribalyn — Virtual Try‑On for Vietnam & World Traditional Costumes",
    template: "%s | Tribalyn",
  },
  description:
    "Virtually try on Vietnam’s Áo dài and world traditional costumes (Qipao, Hanfu, Dirndl, Lederhosen, Chut Thai, and more). Explore culture through fashion with an elegant, modern experience.",
  applicationName: 'Tribalyn',
  generator: 'Tribalyn',
  keywords: [
    'Tribalyn',
    'virtual try-on',
    'Vietnam',
    'Ao dai',
    'Áo dài',
    'world traditional costumes',
    'Qipao',
    'Hanfu',
    'Dirndl',
    'Lederhosen',
    'Chut Thai',
    'culture',
    'fashion tech',
  ],
  authors: [{ name: 'Tribalyn' }],
  category: 'fashion',
  metadataBase: new URL('https://tribalyn.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Tribalyn — Virtual Try‑On for Vietnam & World Traditional Costumes',
    description:
      "Virtually try on Vietnam’s Áo dài and world traditional outfits with realistic drape and layering.",
    url: 'https://tribalyn.app',
    siteName: 'Tribalyn',
    images: [
      {
        url: '/home/hero/hero-2.jpg',
        width: 1200,
        height: 630,
        alt: 'Tribalyn Virtual Try‑On',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tribalyn — Virtual Try‑On for Vietnam & World Traditional Costumes',
    description:
      "Try on Áo dài, Qipao, Hanfu, Dirndl, Lederhosen, Chut Thai, and more — instantly.",
    images: ['/home/hero/hero-2.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: [{ url: '/logo.png' }],
    shortcut: ['/favicon.ico'],
  },
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  style: ['normal', 'italic'],
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  style: ['normal', 'italic'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans">
        <PageLoader />
        <AccentRouteTransition />
        {children}
      </body>
    </html>
  )
}
