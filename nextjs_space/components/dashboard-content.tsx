
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/dashboard-header"
import { AnalyticsChart } from "@/components/analytics-chart"
import { BookmarkGrid } from "@/components/bookmark-grid"
import { BookmarkList } from "@/components/bookmark-list"
import { BookmarkTimeline } from "@/components/bookmark-timeline"
import { BookmarkHierarchy } from "@/components/bookmark-hierarchy"
import { BookmarkFolders } from "@/components/bookmark-folders"
import { BookmarkKanban } from "@/components/bookmark-kanban"
import { BookmarkCompact } from "@/components/bookmark-compact"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Grid3x3, List, Clock, FolderTree, Folders, Target, Kanban, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
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

interface Category {
  id: string
  name: string
  color: string
  icon: string
  _count: {
    bookmarks: number
  }
}

export function DashboardContent() {
  const { data: session } = useSession()
  const [viewMode, setViewMode] = useState<ViewMode>("GRID")
  const [searchQuery, setSearchQuery] = useState("")
  const [bookmarks, setBookmarks] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [bulkSelectMode, setBulkSelectMode] = useState(false)
  const [selectedBookmarks, setSelectedBookmarks] = useState<Set<string>>(new Set())
  const [categories, setCategories] = useState<Category[]>([])
  const [breakdownOpen, setBreakdownOpen] = useState(false)

  useEffect(() => {
    if (session) {
      fetchBookmarks()
      fetchAnalytics()
    }
  }, [session, searchQuery])

  useEffect(() => {
    if (breakdownOpen && categories.length === 0) {
      fetchCategories()
    }
  }, [breakdownOpen])

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

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
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

  const handleBulkSelectToggle = () => {
    setBulkSelectMode(!bulkSelectMode)
    setSelectedBookmarks(new Set())
  }

  const handleSelectBookmark = (bookmarkId: string) => {
    setSelectedBookmarks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(bookmarkId)) {
        newSet.delete(bookmarkId)
      } else {
        newSet.add(bookmarkId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedBookmarks.size === bookmarks.length) {
      setSelectedBookmarks(new Set())
    } else {
      setSelectedBookmarks(new Set(bookmarks.map((b: any) => b.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedBookmarks.size} bookmarks?`)) return
    
    try {
      const deletePromises = Array.from(selectedBookmarks).map(id =>
        fetch(`/api/bookmarks/${id}`, { method: "DELETE" })
      )
      
      await Promise.all(deletePromises)
      toast.success(`${selectedBookmarks.size} bookmarks deleted successfully`)
      setSelectedBookmarks(new Set())
      setBulkSelectMode(false)
      fetchBookmarks()
    } catch (error) {
      console.error("Error deleting bookmarks:", error)
      toast.error("Failed to delete bookmarks")
    }
  }

  const handleMoveSelected = async (categoryId: string) => {
    try {
      const updatePromises = Array.from(selectedBookmarks).map(id =>
        fetch(`/api/bookmarks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoryId }),
        })
      )
      
      await Promise.all(updatePromises)
      toast.success(`${selectedBookmarks.size} bookmarks moved successfully`)
      setSelectedBookmarks(new Set())
      fetchBookmarks()
    } catch (error) {
      console.error("Error moving bookmarks:", error)
      toast.error("Failed to move bookmarks")
    }
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
        return <BookmarkGrid 
          bookmarks={currentBookmarks} 
          onUpdate={fetchBookmarks}
          bulkSelectMode={bulkSelectMode}
          selectedBookmarks={selectedBookmarks}
          onSelectBookmark={handleSelectBookmark}
        />
      case "COMPACT":
        return <BookmarkCompact 
          bookmarks={currentBookmarks} 
          onUpdate={fetchBookmarks}
        />
      case "LIST":
        return <BookmarkList bookmarks={currentBookmarks} onUpdate={fetchBookmarks} />
      case "TIMELINE":
        return <BookmarkTimeline bookmarks={currentBookmarks} onUpdate={fetchBookmarks} />
      case "HIERARCHY":
        return <BookmarkHierarchy bookmarks={currentBookmarks} onUpdate={fetchBookmarks} />
      case "FOLDER":
        return <BookmarkFolders bookmarks={currentBookmarks} onUpdate={fetchBookmarks} />
      case "KANBAN":
        return <BookmarkKanban bookmarks={currentBookmarks} onUpdate={fetchBookmarks} />
      default:
        return <BookmarkGrid 
          bookmarks={currentBookmarks} 
          onUpdate={fetchBookmarks}
          bulkSelectMode={bulkSelectMode}
          selectedBookmarks={selectedBookmarks}
          onSelectBookmark={handleSelectBookmark}
        />
    }
  }

  return (
    <div className="space-y-6">
      {/* Sticky Bulk Action Bar */}
      {bulkSelectMode && selectedBookmarks.size > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-50 border-b border-blue-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="h-9 px-4 bg-white hover:bg-gray-50"
              >
                {selectedBookmarks.size === bookmarks.length ? "Deselect All" : "Select All"}
              </Button>
              <span className="text-sm font-medium text-blue-900">
                ✓ {selectedBookmarks.size} of {bookmarks.length} bookmarks selected
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Select onValueChange={handleMoveSelected}>
                <SelectTrigger className="w-[150px] h-9 text-sm bg-white">
                  <SelectValue placeholder="📁 Move to..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white gap-2"
              >
                🗑️ DELETE SELECTED
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="h-9 px-4 bg-white hover:bg-gray-50"
              >
                Select All ({bookmarks.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Top Stats */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-1">Total bookmarks</div>
            <div className="text-5xl font-bold text-gray-900">{bookmarks?.length || 0}</div>
          </div>
          
          {/* Breakdown Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setBreakdownOpen(!breakdownOpen)}
            className="h-9 gap-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
          >
            <span>Breakdown</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", breakdownOpen && "rotate-180")} />
          </Button>
        </div>

        {/* Inline Breakdown Panel */}
        {breakdownOpen && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            {categories.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500">No categories found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-12 gap-y-0.5">
                {categories
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between py-2 px-2 rounded hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform" style={{ backgroundColor: category.color }} />
                        <span className="text-gray-700 font-normal group-hover:text-gray-900">{category.name}:</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 ml-2">
                        {category._count.bookmarks} {category._count.bookmarks === 1 ? 'bookmark' : 'bookmarks'}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Header */}
      <DashboardHeader
        onBookmarkCreated={handleBookmarkCreated}
        onSyncAll={handleSyncAll}
        bulkSelectMode={bulkSelectMode}
        onBulkSelectToggle={handleBulkSelectToggle}
        selectedCount={selectedBookmarks.size}
      />

      {/* Analytics Chart */}
      {analytics && (
        <AnalyticsChart analytics={analytics} />
      )}

      {/* View Mode Toggles */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 bg-gray-900 rounded-xl p-2 w-fit">
          {viewModes.map((mode) => {
            const Icon = mode.icon
            return (
              <Button
                key={mode.id}
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(mode.id)}
                className={cn(
                  "px-4 py-3 h-12 text-sm font-medium rounded-lg transition-colors gap-2",
                  viewMode === mode.id
                    ? "bg-white text-gray-900 shadow-sm hover:bg-white"
                    : "text-white hover:text-white hover:bg-gray-800"
                )}
              >
                <Icon className="h-5 w-5" />
                {mode.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 rounded-xl bg-white border-gray-300 text-black placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400 text-base"
          />
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Per page</span>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => {
            setItemsPerPage(parseInt(value))
            setCurrentPage(1)
          }}>
            <SelectTrigger className="w-[80px] h-9 bg-white border-gray-300">
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
          <span className="text-sm text-black">
            Page {currentPage} of {totalPages || 1}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-9 text-black bg-white hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-9 text-black bg-white hover:bg-gray-50"
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
