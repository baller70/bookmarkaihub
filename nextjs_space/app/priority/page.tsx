
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookmarkCard } from "@/components/bookmark-card"
import { AlertTriangle, TrendingUp, Clock, Target } from "lucide-react"

export default function PriorityPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    try {
      const response = await fetch("/api/bookmarks")
      if (response.ok) {
        const data = await response.json()
        setBookmarks(data)
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const groupedByPriority = {
    URGENT: bookmarks.filter((b) => b.priority === "URGENT"),
    HIGH: bookmarks.filter((b) => b.priority === "HIGH"),
    MEDIUM: bookmarks.filter((b) => b.priority === "MEDIUM"),
    LOW: bookmarks.filter((b) => b.priority === "LOW"),
  }

  const priorityConfig = {
    URGENT: {
      color: "bg-red-100 text-red-800 border-red-300",
      icon: AlertTriangle,
      bgColor: "bg-red-50",
    },
    HIGH: {
      color: "bg-orange-100 text-orange-800 border-orange-300",
      icon: TrendingUp,
      bgColor: "bg-orange-50",
    },
    MEDIUM: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: Clock,
      bgColor: "bg-yellow-50",
    },
    LOW: {
      color: "bg-green-100 text-green-800 border-green-300",
      icon: Target,
      bgColor: "bg-green-50",
    },
  }

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Priority Management</h1>
                <p className="text-gray-600">
                  Organize bookmarks by priority levels
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {Object.entries(groupedByPriority).map(([priority, items]) => {
              const config = priorityConfig[priority as keyof typeof priorityConfig]
              const Icon = config.icon
              return (
                <Card key={priority} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={config.color}>{priority}</Badge>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold">{items.length}</p>
                  <p className="text-sm text-gray-600">bookmarks</p>
                </Card>
              )
            })}
          </div>

          {/* Priority Sections */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading bookmarks...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedByPriority).map(([priority, items]) => {
                const config = priorityConfig[priority as keyof typeof priorityConfig]
                const Icon = config.icon

                if (items.length === 0) return null

                return (
                  <div key={priority}>
                    <div className="flex items-center gap-3 mb-4">
                      <Icon className="h-5 w-5" />
                      <h2 className="text-xl font-bold">{priority} Priority</h2>
                      <Badge className={config.color}>{items.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {items.map((bookmark) => (
                        <BookmarkCard
                          key={bookmark.id}
                          bookmark={bookmark}
                          onUpdate={fetchBookmarks}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}

              {bookmarks.length === 0 && (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
                  <p className="text-gray-600">
                    Create your first bookmark to get started
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
