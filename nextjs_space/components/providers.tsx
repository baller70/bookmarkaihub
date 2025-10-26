
"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import { useEffect, useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    )
  }

  return (
    <SessionProvider>
      <div suppressHydrationWarning>
        {children}
      </div>
      <Toaster />
    </SessionProvider>
  )
}
