
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
import { AlertTriangle, TrendingUp, Clock, Target, Search, ArrowLeft, SlidersHorizontal } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  favicon?: string
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
  isFavorite: boolean
  totalVisits: number
  createdAt: string
  categories?: Array<{ category: { name: string; color: string } }>
  tags?: Array<{ tag: { name: string; color: string } }>
}

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
      color: "bg-red-100 text-red-800 border-red-300",
      bgColor: "bg-red-600",
      icon: AlertTriangle,
    },
    HIGH: {
      label: "HIGH",
      color: "bg-orange-100 text-orange-800 border-orange-300",
      bgColor: "bg-orange-600",
      icon: TrendingUp,
    },
    MEDIUM: {
      label: "MEDIUM",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      bgColor: "bg-yellow-600",
      icon: Clock,
    },
    LOW: {
      label: "LOW",
      color: "bg-green-100 text-green-800 border-green-300",
      bgColor: "bg-green-600",
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
        filtered.sort((a, b) => b.totalVisits - a.totalVisits)
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
          <div className="p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          </div>
        </DashboardLayout>
      </DashboardAuth>
    )
  }

  if (!config) {
    return (
      <DashboardAuth>
        <DashboardLayout>
          <div className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Invalid Priority Level</h2>
              <p className="text-gray-600 mb-4">The specified priority level does not exist.</p>
              <Button onClick={handleBack}>Back to Priority Management</Button>
            </div>
          </div>
        </DashboardLayout>
      </DashboardAuth>
    )
  }

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Priority Management
            </Button>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 ${config.bgColor} rounded-xl`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{config.label} Priority</h1>
                  <p className="text-sm text-gray-700">
                    {filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-300"
                />
              </div>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white border-gray-300">
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

          {/* Bookmarks Grid */}
          {filteredBookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onUpdate={fetchBookmarks}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Icon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'No bookmarks found' : `No ${config.label} priority bookmarks`}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? "Try adjusting your search query"
                  : `Create bookmarks and set their priority to ${config.label} to see them here`}
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
