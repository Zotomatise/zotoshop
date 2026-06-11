import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Inter, Bebas_Neue, JetBrains_Mono } from "next/font/google"
import { TestUserProvider } from "@lib/context/test-user-context"
import SlowUserOverlay from "@modules/common/components/slow-user-overlay"
import AssistantWidget from "@modules/assistant/components/assistant-widget"
import "styles/globals.css"

// Polices de la charte Zotomatise
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas", display: "swap" })
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" })

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`dark ${inter.variable} ${bebas.variable} ${jetbrains.variable}`}
    >
      <body className="bg-zoto-bg text-ui-fg-base">
        <TestUserProvider>
          <SlowUserOverlay />
          <main className="relative">{props.children}</main>
          <AssistantWidget />
        </TestUserProvider>
      </body>
    </html>
  )
}
