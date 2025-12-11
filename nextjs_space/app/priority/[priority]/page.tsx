
"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BookmarkCard } from "@/components/bookmark-card"
import { AlertTriangle, TrendingUp, Clock, Target, Search, ArrowLeft, SlidersHorizontal, BookOpen, RefreshCw } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import type { Bookmark } from "@/types/bookmark"

export default function PriorityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const priorityParam = params.priority as string
  const priority = priorityParam?.toUpperCase() as 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const priorityConfig = {
    URGENT: {
      label: "URGENT",
      description: "Requires immediate attention",
      color: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
      bgColor: "bg-red-600",
      gradientColor: "from-red-500 to-rose-600",
      lightBg: "bg-red-50 dark:bg-red-950/30",
      textColor: "text-red-600 dark:text-red-400",
      icon: AlertTriangle,
    },
    HIGH: {
      label: "HIGH",
      description: "Important, handle soon",
      color: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
      bgColor: "bg-orange-600",
      gradientColor: "from-orange-500 to-amber-600",
      lightBg: "bg-orange-50 dark:bg-orange-950/30",
      textColor: "text-orange-600 dark:text-orange-400",
      icon: TrendingUp,
    },
    MEDIUM: {
      label: "MEDIUM",
      description: "Standard priority items",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
      bgColor: "bg-yellow-600",
      gradientColor: "from-yellow-500 to-amber-500",
      lightBg: "bg-yellow-50 dark:bg-yellow-950/30",
      textColor: "text-yellow-600 dark:text-yellow-400",
      icon: Clock,
    },
    LOW: {
      label: "LOW",
      description: "Can wait, no rush",
      color: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
      bgColor: "bg-green-600",
      gradientColor: "from-emerald-500 to-green-600",
      lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
      textColor: "text-emerald-600 dark:text-emerald-400",
      icon: Target,
    }
  }

  const config = priorityConfig[priority]
  const Icon = config?.icon || AlertTriangle

  useEffect(() => {
    if (priority) {
      fetchBookmarks()
    }
  }, [priority])

  useEffect(() => {
    filterAndSortBookmarks()
  }, [bookmarks, searchQuery, sortBy])

  const fetchBookmarks = async () => {
    try {
      const response = await fetch('/api/bookmarks')
      if (response.ok) {
        const data = await response.json()
        const filtered = data.filter((b: Bookmark) => b.priority === priority)
        setBookmarks(filtered)
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error)
      toast.error('Failed to load bookmarks')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortBookmarks = () => {
    let filtered = [...bookmarks]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "visits":
        filtered.sort((a, b) => (b.totalVisits ?? b.visitCount ?? 0) - (a.totalVisits ?? a.visitCount ?? 0))
        break
    }

    setFilteredBookmarks(filtered)
  }

  const handleBack = () => {
    router.push('/priority')
  }

  if (loading) {
    return (
      <DashboardAuth>
        <DashboardLayout>
          <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto bg-gray-900/5 dark:bg-gray-950/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8">
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading bookmarks...</p>
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </DashboardAuth>
    )
  }

  if (!config) {
    return (
      <DashboardAuth>
        <DashboardLayout>
          <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto bg-gray-900/5 dark:bg-gray-950/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8">
              <div className="text-center py-16">
                <h2 className="text-2xl font-bold mb-2 uppercase text-gray-900 dark:text-white">Invalid Priority Level</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">The specified priority level does not exist.</p>
                <Button onClick={handleBack}>Back to Priority Management</Button>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </DashboardAuth>
    )
  }

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="p-4 md:p-6 lg:p-8">
          {/* Main Container with light black background */}
          <div className="max-w-7xl mx-auto bg-gray-900/5 dark:bg-gray-950/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8">
            
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="mb-4 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Priority Management
              </Button>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                    config.gradientColor
                  )}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                      {config.label} Priority
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {config.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={cn("text-sm px-3 py-1", config.color)}
                  >
                    {filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? 's' : ''}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchBookmarks}
                    className="h-9"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <Card className={cn("mb-8 p-5 border-2", config.lightBg, "border-gray-200 dark:border-gray-700")}>
              <div className="flex items-center gap-4">
                <div className={cn("h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center", config.gradientColor)}>
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You have <span className={cn("font-bold", config.textColor)}>{bookmarks.length}</span> bookmarks marked as {config.label.toLowerCase()} priority
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                    {searchQuery && `Showing ${filteredBookmarks.length} matching your search`}
                  </p>
                </div>
              </div>
            </Card>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search bookmarks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px] h-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                  <SelectItem value="visits">Most Visited</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bookmarks Grid - 3 columns */}
            {filteredBookmarks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onUpdate={fetchBookmarks}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <div className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                  config.lightBg
                )}>
                  <Icon className={cn("h-8 w-8", config.textColor)} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchQuery ? 'No Bookmarks Found' : `No ${config.label} Priority Bookmarks`}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : `Create bookmarks and set their priority to ${config.label} to see them here`}
                </p>
                <Button 
                  onClick={handleBack}
                  variant="outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Priority Management
                </Button>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
