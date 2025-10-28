
"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BookmarkGrid } from "@/components/bookmark-grid"
import { BookmarkList } from "@/components/bookmark-list"
import { BookmarkKanban } from "@/components/bookmark-kanban"
import { BookmarkCompactCards } from "@/components/bookmark-compact-cards"
import {
  ArrowLeft,
  Search,
  Grid3x3,
  List,
  LayoutGrid,
  Edit,
  Trash2,
  Filter,
  SortAsc,
  Calendar,
  Star,
  ExternalLink,
  Layers
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  faviconUrl?: string
  previewImage?: string
  tags?: Array<{ id: string; name: string; color: string }>
  categories?: Array<{ id: string; name: string; color: string }>
  isFavorite?: boolean
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  color: string
  icon?: string
  _count?: {
    bookmarks: number
  }
}

type ViewMode = "grid" | "compact" | "list" | "kanban"
type SortBy = "recent" | "oldest" | "title" | "favorites"

export default function CategoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params?.categoryId as string

  const [category, setCategory] = useState<Category | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortBy>("recent")

  useEffect(() => {
    if (categoryId) {
      fetchCategoryData()
    }
  }, [categoryId])

  const fetchCategoryData = async () => {
    try {
      // Fetch category details
      const categoryRes = await fetch(`/api/categories?id=${categoryId}`)
      const categoryData = await categoryRes.json()
      
      if (Array.isArray(categoryData) && categoryData.length > 0) {
        setCategory(categoryData[0])
      } else if (!Array.isArray(categoryData)) {
        setCategory(categoryData)
      }

      // Fetch bookmarks for this category
      const bookmarksRes = await fetch(`/api/bookmarks?categoryId=${categoryId}`)
      const bookmarksData = await bookmarksRes.json()
      setBookmarks(bookmarksData)
    } catch (error) {
      console.error('Failed to fetch category data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = () => {
    fetchCategoryData()
  }

  const handleBack = () => {
    router.push('/categories')
  }

  const filteredBookmarks = bookmarks.filter(bookmark =>
    bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "title":
        return a.title.localeCompare(b.title)
      case "favorites":
        return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <DashboardAuth>
        <DashboardLayout>
          <div className="p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </DashboardLayout>
      </DashboardAuth>
    )
  }

  if (!category) {
    return (
      <DashboardAuth>
        <DashboardLayout>
          <div className="p-8">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">CATEGORY NOT FOUND</h3>
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </DashboardAuth>
    )
  }

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: category.color ? category.color + '20' : '#e5e7eb' }}
                >
                  {category.icon || '📁'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''} in this category
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Most Recent
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Oldest First
                    </div>
                  </SelectItem>
                  <SelectItem value="title">
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      Alphabetical
                    </div>
                  </SelectItem>
                  <SelectItem value="favorites">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Favorites First
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "compact" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("compact")}
                >
                  <Layers className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "kanban" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bookmarks */}
          {sortedBookmarks.length > 0 ? (
            <>
              {viewMode === "grid" && <BookmarkGrid bookmarks={sortedBookmarks} onUpdate={handleUpdate} />}
              {viewMode === "compact" && <BookmarkCompactCards bookmarks={sortedBookmarks} onUpdate={handleUpdate} />}
              {viewMode === "list" && <BookmarkList bookmarks={sortedBookmarks} onUpdate={handleUpdate} />}
              {viewMode === "kanban" && <BookmarkKanban bookmarks={sortedBookmarks} onUpdate={handleUpdate} />}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <ExternalLink className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No bookmarks found" : "No bookmarks in this category"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Add bookmarks to this category to see them here"}
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
