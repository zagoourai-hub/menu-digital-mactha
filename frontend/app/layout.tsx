import { Cantora_One, Fira_Code, Playfair_Display } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import Navbar from "./layout/Navbar"
import { QueryProvider } from "@/lib/provider"

const fontSans = Cantora_One({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: "400",
})

const fontSerif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
})

const fontMono = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Matcha Yuk | Menu Digital",
  description: "Menu digital dan pemesanan online untuk outlet minuman.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        fontSerif.variable,
        fontSans.variable
      )}
    >
      <body>
        <QueryProvider>
          <ThemeProvider>
            <Navbar />
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
