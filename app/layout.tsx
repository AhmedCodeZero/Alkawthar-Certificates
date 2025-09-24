import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Tajawal } from "next/font/google"
import "./globals.css"
import cn from "classnames"

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "جمعية الكوثر الصحية",
  description: "منصة شهادات التهنئة للخريجين",
  generator: "v0.dev",
  icons: {
    icon: "/placeholder-logo.svg",
    shortcut: "/placeholder-logo.svg",
    apple: "/placeholder-logo.svg",
  },
  openGraph: {
    title: "جمعية الكوثر الصحية",
    description: "منصة شهادات التهنئة للخريجين",
    images: [
      {
        url: "/OG.png",
        width: 1200,
        height: 630,
        alt: "جمعية الكوثر الصحية - تهنئة الخريجين",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: "/OG.png",
        width: 1200,
        height: 630,
        alt: "جمعية الكوثر الصحية - تهنئة الخريجين",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={cn(GeistSans.variable, GeistMono.variable)}>
      <head>
        <meta name="theme-color" content="#0a1410" />
        <link rel="icon" href="/placeholder-logo.svg" />
      </head>
      <body
        className={cn(
          "min-h-screen antialiased selection:bg-emerald-500/20 selection:text-emerald-200",
          tajawal.className,
        )}
      >
        {children}
      </body>
    </html>
  )
}
