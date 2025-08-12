import type { Metadata } from 'next'
import './globals.css'
import { Inter, Playfair_Display } from 'next/font/google'
import { PageLoader } from '@/components/page-loader'
import { AccentRouteTransition } from '@/components/accent-route-transition'

export const metadata: Metadata = {
  title: 'Tribalyn — Vietnam\'s Heritage, Virtually',
  description:
    'Try on Vietnam\'s 54 ethnic costumes virtually. Explore curated collections, stories, and culture brought to life.',
  applicationName: 'Tribalyn',
  generator: 'Tribalyn',
  keywords: ['Tribalyn', 'Vietnam heritage', 'virtual try-on', 'ethnic costumes', 'culture', 'fashion'],
  authors: [{ name: 'Tribalyn' }],
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: [{ url: '/logo.png' }],
  },
  metadataBase: new URL('https://tribalyn.app'),
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
