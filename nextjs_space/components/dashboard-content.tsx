
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/dashboard-header"
import { AnalyticsChart } from "@/components/analytics-chart"
import { BookmarkGrid } from "@/components/bookmark-grid"
import { BookmarkList } from "@/components/bookmark-list"
import { BookmarkTimeline } from "@/components/bookmark-timeline"
import { BookmarkFolders } from "@/components/bookmark-folders"
import { BookmarkKanban } from "@/components/bookmark-kanban"
import { toast } from "sonner"

export type ViewMode = "GRID" | "COMPACT" | "LIST" | "TIMELINE" | "HIERARCHY" | "FOLDER" | "GOAL" | "KANBAN"

export function DashboardContent() {
  const { data: session } = useSession()
  const [viewMode, setViewMode] = useState<ViewMode>("GRID")
  const [searchQuery, setSearchQuery] = useState("")
  const [bookmarks, setBookmarks] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchBookmarks()
      fetchAnalytics()
    }
  }, [session, searchQuery])

  const fetchBookmarks = async () => {
    try {
      const response = await fetch(`/api/bookmarks${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`)
      if (response.ok) {
        const data = await response.json()
        setBookmarks(data)
      } else {
        toast.error("Failed to load bookmarks")
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error)
      toast.error("Failed to load bookmarks")
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics?range=30")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    }
  }

  const handleBookmarkCreated = () => {
    fetchBookmarks()
    fetchAnalytics()
  }

  const renderBookmarkView = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      )
    }

    switch (viewMode) {
      case "GRID":
      case "COMPACT":
        return <BookmarkGrid bookmarks={bookmarks} compact={viewMode === "COMPACT"} onUpdate={fetchBookmarks} />
      case "LIST":
        return <BookmarkList bookmarks={bookmarks} onUpdate={fetchBookmarks} />
      case "TIMELINE":
        return <BookmarkTimeline bookmarks={bookmarks} onUpdate={fetchBookmarks} />
      case "FOLDER":
        return <BookmarkFolders bookmarks={bookmarks} onUpdate={fetchBookmarks} />
      case "KANBAN":
        return <BookmarkKanban bookmarks={bookmarks} onUpdate={fetchBookmarks} />
      default:
        return <BookmarkGrid bookmarks={bookmarks} onUpdate={fetchBookmarks} />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <DashboardHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBookmarkCreated={handleBookmarkCreated}
      />

      {/* Analytics Chart */}
      {analytics && (
        <AnalyticsChart analytics={analytics} />
      )}

      {/* Bookmarks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {searchQuery ? `Search results for "${searchQuery}"` : "Your Bookmarks"}
          </h2>
          <span className="text-sm text-gray-500">
            {bookmarks?.length || 0} bookmark{bookmarks?.length !== 1 ? "s" : ""}
          </span>
        </div>
        {renderBookmarkView()}
      </div>
    </div>
  )
}
