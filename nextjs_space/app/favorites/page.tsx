
'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { DashboardAuth } from '@/components/dashboard-auth'
import FavoritesView from '@/components/dna-profile/favorites-view'

export default function FavoritesPage() {
  return (
    <DashboardAuth>
      <DashboardLayout>
        <FavoritesView />
      </DashboardLayout>
    </DashboardAuth>
  )
}
