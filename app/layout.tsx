import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Link from 'next/link'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0891b2',
}

export const metadata: Metadata = {
  title: 'Hodi Ombath | Your Cinematic Travel Story',
  description: 'Map your travel memories with cinematic precision. Experience your journey through photo bubbles and interactive storytelling.',
  generator: 'Hodi Ombath v1.0',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased bg-background text-foreground">
        <div className="flex flex-col min-h-screen">
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-border bg-background py-6 px-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} Hodi Ombath. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              </div>
            </div>
          </footer>
        </div>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
