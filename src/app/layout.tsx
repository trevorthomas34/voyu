import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Voyu - ISO 27001 Readiness',
  description: 'Get your organization ready for ISO 27001 certification',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
