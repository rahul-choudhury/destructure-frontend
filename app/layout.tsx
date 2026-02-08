import type { Metadata } from "next"
import { Fira_Code, Instrument_Serif, Inter } from "next/font/google"
import "./globals.css"
const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  weight: "400",
  subsets: ["latin"],
})

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
})

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://destructure.in"),
  title: {
    template: "%s | Destructure",
    default: "Destructure",
  },
  description: "A blog by Rahul & Shakti",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${inter.className} ${firaCode.variable} ${instrumentSerif.variable} root antialiased`}
      >
        <main className="grid grid-cols-[1fr_minmax(auto,700px)_1fr] gap-x-4 pb-10 *:col-start-2">
          {children}
        </main>
      </body>
    </html>
  )
}
