
"use client"

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { DashboardAuth } from '@/components/dashboard-auth'
import { Button } from '@/components/ui/button'
import { Settings, ArrowLeft, Sparkles, BookOpen, Upload, CheckCircle, Globe } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const navigationItems = [
  {
    id: 'auto-processing',
    label: 'Auto-Processing',
    icon: Settings,
    path: '/ai-linkpilot/settings/auto-processing'
  },
  {
    id: 'content-discovery',
    label: 'Content Discovery',
    icon: Sparkles,
    path: '/ai-linkpilot/settings/content-discovery'
  },
  {
    id: 'bulk-uploader',
    label: 'Bulk Link Uploader',
    icon: Upload,
    path: '/ai-linkpilot/settings/bulk-uploader'
  },
  {
    id: 'link-validator',
    label: 'Link Validator',
    icon: CheckCircle,
    path: '/ai-linkpilot/settings/link-validator'
  },
  {
    id: 'browser-launcher',
    label: 'Browser Launcher',
    icon: Globe,
    path: '/ai-linkpilot/settings/browser-launcher'
  },
]

export default function AILinkPilotSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <DashboardAuth>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <h1 className="text-lg font-semibold">AI LinkPilot</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-6">
          <div className="flex gap-6">
            {/* Sidebar Navigation */}
            <aside className="w-64 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.path
                  
                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </DashboardAuth>
  )
}
