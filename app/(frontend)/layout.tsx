import type { Metadata } from 'next'
import { Roboto, Roboto_Condensed } from 'next/font/google'

import { PostHogProvider } from '@/lib/posthog/provider'

import '../globals.css'

// Brand typefaces. next/font self-hosts the files and exposes each as a CSS var
// that globals.css maps onto --font-sans / --font-condensed.
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
})

const robotoCondensed = Roboto_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto-condensed',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'EKFM Portfolio',
  description: 'Portfolio of Eduardo Ferrer',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${roboto.variable} ${robotoCondensed.variable}`}>
      <body className="antialiased">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  )
}
