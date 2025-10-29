
export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { Audiowide, Saira, Russo_One } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const audiowide = Audiowide({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-audiowide"
})

const saira = Saira({ 
  subsets: ["latin"],
  variable: "--font-saira"
})

const russoOne = Russo_One({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-russo"
})

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: "BookmarkHub - Your Digital Workspace",
  description: "Organize, manage, and discover your bookmarks with advanced AI features and multiple view modes.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "BookmarkHub - Your Digital Workspace",
    description: "Organize, manage, and discover your bookmarks with advanced AI features and multiple view modes.",
    url: "/",
    siteName: "BookmarkHub",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
    }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BookmarkHub - Your Digital Workspace",
    description: "Organize, manage, and discover your bookmarks with advanced AI features and multiple view modes.",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${audiowide.variable} ${saira.variable} ${russoOne.variable} font-saira`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
