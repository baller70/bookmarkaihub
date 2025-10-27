
'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { DashboardAuth } from '@/components/dashboard-auth'
import { TimeCapsuleContent } from '@/components/time-capsule/time-capsule-content'

export default function TimeCapsulePage() {
  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-6">
          <TimeCapsuleContent showTitle={true} />
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
