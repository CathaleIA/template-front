import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins, Open_Sans, Montserrat } from "next/font/google"
import { LanguageProvider } from "@/context/LanguageContext"
import { ThemeProvider } from "@/context/theme-provider"
import { Navbar } from "@/components/navbar"

import "@/app/styles/globals.css"
import "@/app/styles/sidebar.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
})
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

export const metadata: Metadata = {
  title: "Copower Dashboard",
  description: "App web, managed your analisis data company",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${montserrat.variable} ${poppins.variable} ${openSans.variable} font-montserrat antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <div className="min-h-screen bg-background">
              <Navbar />
              <main className="pt-14">{children}</main>
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
