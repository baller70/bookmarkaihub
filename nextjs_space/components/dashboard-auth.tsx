
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface DashboardAuthProps {
  children: React.ReactNode
}

export function DashboardAuth({ children }: DashboardAuthProps) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Only call useSession after component mounts
  const sessionResult = mounted ? useSession() : { data: null, status: "loading" }
  const { data: session, status } = sessionResult

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (status === "loading") return
    if (!session) {
      router.replace("/auth/signin")
    }
  }, [mounted, session, status, router])

  // Show loading while mounting or authenticating
  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" suppressHydrationWarning>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!session) {
    return null
  }

  return <>{children}</>
}
