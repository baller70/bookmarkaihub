
"use client"

interface DashboardAuthProps {
  children: React.ReactNode
}

export function DashboardAuth({ children }: DashboardAuthProps) {
  // DEV MODE: Skip auth check entirely
  return <>{children}</>
}
