
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AILinkPilotSettingsPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/ai-linkpilot/settings/auto-processing')
  }, [router])

  return null
}
