import type { Metadata } from 'next'

import { PostHogProvider } from '@/lib/posthog/provider'

import '../globals.css'

export const metadata: Metadata = {
  title: 'EKFM Portfolio',
  description: 'Portfolio of Eduardo Ferrer',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  )
}
