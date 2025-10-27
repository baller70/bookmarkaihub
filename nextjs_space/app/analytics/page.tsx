'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { DashboardAuth } from '@/components/dashboard-auth'
import { AnalyticsContent } from '@/components/analytics-content'

export default function AnalyticsPage() {
  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <AnalyticsContent showTitle={true} />
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
