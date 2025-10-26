
"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardContent } from "@/components/dashboard-content"
import { DashboardAuth } from "@/components/dashboard-auth"

export default function DashboardPage() {
  return (
    <DashboardAuth>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </DashboardAuth>
  )
}
