import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { TestUserProvider } from "@lib/context/test-user-context"
import SlowUserOverlay from "@modules/common/components/slow-user-overlay"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-mode="light">
      <body>
        <TestUserProvider>
          <SlowUserOverlay />
          <main className="relative">{props.children}</main>
        </TestUserProvider>
      </body>
    </html>
  )
}
