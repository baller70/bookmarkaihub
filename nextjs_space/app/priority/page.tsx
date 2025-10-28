
"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertTriangle, TrendingUp, Clock, Target, Search, RefreshCw, FileText } from "lucide-react"
import { useRouter } from "next/navigation"

interface Bookmark {
  id: string
  title: string
  url: string
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
}

export default function PriorityPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    try {
      const response = await fetch('/api/bookmarks')
      if (response.ok) {
        const data = await response.json()
        setBookmarks(data)
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const priorityConfig = {
    URGENT: {
      label: "URGENT",
      color: "bg-red-100 text-red-800 border-red-300",
      bgColor: "bg-red-600",
      icon: AlertTriangle,
      count: bookmarks.filter(b => b.priority === 'URGENT').length
    },
    HIGH: {
      label: "HIGH",
      color: "bg-orange-100 text-orange-800 border-orange-300",
      bgColor: "bg-orange-600",
      icon: TrendingUp,
      count: bookmarks.filter(b => b.priority === 'HIGH').length
    },
    MEDIUM: {
      label: "MEDIUM",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      bgColor: "bg-yellow-600",
      icon: Clock,
      count: bookmarks.filter(b => b.priority === 'MEDIUM').length
    },
    LOW: {
      label: "LOW",
      color: "bg-green-100 text-green-800 border-green-300",
      bgColor: "bg-green-600",
      icon: Target,
      count: bookmarks.filter(b => b.priority === 'LOW').length
    }
  }

  const handleFolderClick = (priority: string) => {
    router.push(`/priority/${priority.toLowerCase()}`)
  }

  const filteredPriorities = Object.entries(priorityConfig).filter(([_, config]) =>
    config.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <DashboardAuth>
        <DashboardLayout>
          <div className="p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          </div>
        </DashboardLayout>
      </DashboardAuth>
    )
  }

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {/* Bordered Container */}
          <div className="border border-gray-300 rounded-lg p-6 bg-white">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">PRIORITY MANAGEMENT</h1>
              <p className="text-sm text-gray-700">Organize bookmarks by priority levels</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBookmarks}
                className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search priority levels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-300"
              />
            </div>
          </div>

          {/* Priority Folders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPriorities.map(([priority, config]) => {
              const Icon = config.icon
              return (
                <Card
                  key={priority}
                  className="p-6 bg-white hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-red-300"
                  onClick={() => handleFolderClick(priority)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-4 ${config.bgColor} rounded-xl flex-shrink-0`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 uppercase tracking-wide mb-3 break-words">
                        {config.label}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">{config.count} bookmark{config.count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Empty State */}
          {bookmarks.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border mt-6">
              <AlertTriangle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookmarks found</h3>
              <p className="text-gray-600 mb-4">
                Create your first bookmark to get started
              </p>
            </div>
          )}
          </div>
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
