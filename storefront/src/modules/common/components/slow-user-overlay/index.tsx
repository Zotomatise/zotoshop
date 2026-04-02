"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useTestUser } from "@lib/context/test-user-context"

const SlowUserOverlay = () => {
  const { isSlowUser } = useTestUser()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isSlowUser) return

    setVisible(true)
    const delay = 3000 + Math.random() * 2000 // 3-5 seconds
    const timer = setTimeout(() => setVisible(false), delay)
    return () => clearTimeout(timer)
  }, [pathname, isSlowUser])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
      data-testid="slow-user-overlay"
    >
      <div className="animate-spin h-12 w-12 border-4 border-ui-fg-base border-t-transparent rounded-full mb-4" />
      <p className="text-ui-fg-base text-lg font-medium">Chargement...</p>
      <p className="text-ui-fg-muted text-sm mt-1">
        Veuillez patienter
      </p>
    </div>
  )
}

export default SlowUserOverlay
