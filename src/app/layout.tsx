import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans } from 'next/font/google';
import { ThemeProvider } from "@/context/theme-provider"
import { ApolloHook } from '@/hooks/apollo-provider'

import "@/app/styles/globals.css";
import { UserProvider } from "@/context/UserContext"

const notoSans = Noto_Sans({ 
  subsets: ["latin"], 
  variable: "--font-noto-sans" 
});

export const metadata: Metadata = {
  title: "Cathaleia dashboard",
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
        className={`${notoSans.variable} font-sans`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <UserProvider>
              <ApolloHook>
                <div className="min-h-screen bg-background">
                  <main>{children}</main>
                </div>
              </ApolloHook>
            </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
