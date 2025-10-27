
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Grid3x3, List, Clock, FolderTree, Folders, Target, Kanban, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export type ViewMode = "GRID" | "COMPACT" | "LIST" | "TIMELINE" | "HIERARCHY" | "FOLDER" | "GOAL" | "KANBAN"

const viewModes: { id: ViewMode; label: string; icon: any }[] = [
  { id: "GRID", label: "GRID", icon: Grid3x3 },
  { id: "COMPACT", label: "COMPACT", icon: Grid3x3 },
  { id: "LIST", label: "LIST", icon: List },
  { id: "TIMELINE", label: "TIMELINE", icon: Clock },
  { id: "HIERARCHY", label: "HIERARCHY", icon: FolderTree },
  { id: "FOLDER", label: "FOLDER 2.0", icon: Folders },
  { id: "GOAL", label: "GOAL 2.0", icon: Target },
  { id: "KANBAN", label: "KANBAN 2.0", icon: Kanban },
]

export function DashboardContent() {
  const { data: session } = useSession()
  const [viewMode, setViewMode] = useState<ViewMode>("GRID")
  const [searchQuery, setSearchQuery] = useState("")
  const [bookmarks, setBookmarks] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

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

  const handleSyncAll = async () => {
    await fetchBookmarks()
    await fetchAnalytics()
    toast.success("All bookmarks synced successfully!")
  }

  // Pagination calculations
  const totalPages = Math.ceil((bookmarks?.length || 0) / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBookmarks = bookmarks?.slice(startIndex, endIndex) || []

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
        return <BookmarkGrid bookmarks={currentBookmarks} compact={viewMode === "COMPACT"} onUpdate={fetchBookmarks} />
      case "LIST":
        return <BookmarkList bookmarks={currentBookmarks} onUpdate={fetchBookmarks} />
      case "TIMELINE":
        return <BookmarkTimeline bookmarks={currentBookmarks} onUpdate={fetchBookmarks} />
      case "FOLDER":
        return <BookmarkFolders bookmarks={currentBookmarks} onUpdate={fetchBookmarks} />
      case "KANBAN":
        return <BookmarkKanban bookmarks={currentBookmarks} onUpdate={fetchBookmarks} />
      default:
        return <BookmarkGrid bookmarks={currentBookmarks} onUpdate={fetchBookmarks} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-500 mb-1">Total bookmarks</div>
          <div className="text-5xl font-bold text-gray-900">{bookmarks?.length || 0}</div>
        </div>
        <Select defaultValue="breakdown">
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="breakdown">Breakdown</SelectItem>
            <SelectItem value="overview">Overview</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Header */}
      <DashboardHeader
        onBookmarkCreated={handleBookmarkCreated}
        onSyncAll={handleSyncAll}
      />

      {/* Analytics Chart */}
      {analytics && (
        <AnalyticsChart analytics={analytics} />
      )}

      {/* View Mode Toggles */}
      <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-1.5 w-fit">
        {viewModes.map((mode) => {
          const Icon = mode.icon
          return (
            <Button
              key={mode.id}
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(mode.id)}
              className={cn(
                "px-3 py-2 h-9 text-xs font-medium rounded-md transition-colors gap-2",
                viewMode === mode.id
                  ? "bg-white text-gray-900 shadow-sm hover:bg-white"
                  : "text-white hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="h-4 w-4" />
              {mode.label}
            </Button>
          )
        })}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search bookmarks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Per page</span>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => {
            setItemsPerPage(parseInt(value))
            setCurrentPage(1)
          }}>
            <SelectTrigger className="w-[80px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages || 1}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-9"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-9"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bookmarks */}
      {renderBookmarkView()}
    </div>
  )
}
