
"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookmarkCompactCards } from "@/components/bookmark-compact-cards"
import {
  ArrowLeft,
  Search,
  Calendar,
  Star,
  SortAsc,
  ExternalLink,
  Folder
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
  description?: string | null
  favicon?: string | null
  faviconUrl?: string
  previewImage?: string
  tags?: Array<{ id: string; name: string; color: string }> | null
  category?: {
    id: string
    name: string
    color: string
  } | null
  categories?: Array<{ id: string; name: string; color: string }>
  isFavorite: boolean
  priority?: string | null
  visitCount: number
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

type SortBy = "recent" | "oldest" | "title" | "favorites"

export default function CompactCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params?.categoryId as string

  const [category, setCategory] = useState<Category | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortBy>("recent")

  useEffect(() => {
    if (categoryId) {
      fetchCategoryData()
    }
  }, [categoryId])

  const fetchCategoryData = async () => {
    try {
      // Handle "all" special case
      if (categoryId === 'all') {
        setCategory({
          id: 'all',
          name: 'ALL BOOKMARKS',
          color: '#3B82F6',
          _count: {
            bookmarks: 0 // Will be set after fetching
          }
        })
        
        // Fetch all bookmarks (no category filter)
        const bookmarksRes = await fetch(`/api/bookmarks`)
        const bookmarksData = await bookmarksRes.json()
        setBookmarks(bookmarksData)
        
        // Update count
        setCategory(prev => ({
          ...prev!,
          _count: {
            bookmarks: bookmarksData.length
          }
        }))
      } else {
        // Fetch category details
        const categoryRes = await fetch(`/api/categories?id=${categoryId}`)
        const categoryData = await categoryRes.json()
        
        if (Array.isArray(categoryData) && categoryData.length > 0) {
          setCategory(categoryData[0])
        } else if (!Array.isArray(categoryData)) {
          setCategory(categoryData)
        }

        // Fetch bookmarks for this specific category
        const bookmarksRes = await fetch(`/api/bookmarks?category=${categoryId}`)
        const bookmarksData = await bookmarksRes.json()
        setBookmarks(bookmarksData)
      }
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
    router.push('/dashboard')
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
                Back to Dashboard
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
        {/* Full-page dotted background */}
        <div className="fixed inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          zIndex: 0
        }} />
        
        <div className="relative p-4 md:p-8" style={{ zIndex: 1 }}>
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: category.color ? category.color + '20' : '#e5e7eb' }}
                >
                  <Folder 
                    className="w-10 h-10"
                    style={{ color: category.color || '#3b82f6' }}
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold uppercase tracking-wide mb-2 text-gray-900 uppercase">
                    {category.name}
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    {bookmarks.length} BOOKMARK{bookmarks.length !== 1 ? 'S' : ''}
                  </p>
                </div>
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
                  className="pl-10 bg-white border-gray-300"
                />
              </div>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                <SelectTrigger className="w-[180px] bg-white border-gray-300">
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
            </div>
          </div>

          {/* Bookmarks in Compact View */}
          {sortedBookmarks.length > 0 ? (
            <BookmarkCompactCards bookmarks={sortedBookmarks} onUpdate={handleUpdate} />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gray-100">
                <ExternalLink className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                {searchQuery ? "No bookmarks found" : "No bookmarks in this category"}
              </h3>
              <p className="text-gray-600">
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
