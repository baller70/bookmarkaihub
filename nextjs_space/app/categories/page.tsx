
"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Folder, Search, Grid3x3, List, TrendingUp, Clock, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface Category {
  id: string
  name: string
  color: string
  icon: string
  bookmarkCount: number
  _count?: {
    bookmarks: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/categories/${categoryId}`)
  }

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

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Categories</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Browse and organize your bookmarks by category
                </p>
              </div>
            </div>

            {/* Search and View Controls */}
            <div className="flex items-center gap-4 mt-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg p-1 border">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Folder className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Categories</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Bookmarks</p>
                  <p className="text-2xl font-bold">
                    {categories.reduce((sum, cat) => sum + (cat._count?.bookmarks || cat.bookmarkCount || 0), 0)}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg per Category</p>
                  <p className="text-2xl font-bold">
                    {categories.length > 0
                      ? Math.round(categories.reduce((sum, cat) => sum + (cat._count?.bookmarks || cat.bookmarkCount || 0), 0) / categories.length)
                      : 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Categories Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category) => {
                const bookmarkCount = category._count?.bookmarks || category.bookmarkCount || 0
                return (
                  <Card
                    key={category.id}
                    className="p-6 bg-white hover:shadow-lg transition-all cursor-pointer hover:scale-105 hover:border-blue-500"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ backgroundColor: category.color ? category.color + '20' : '#e5e7eb' }}
                        >
                          {category.icon || '📁'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{category.name}</h3>
                          <p className="text-sm text-gray-500">
                            {bookmarkCount} bookmark{bookmarkCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: category.color || '#6b7280',
                          color: category.color || '#6b7280'
                        }}
                      >
                        {category.name}
                      </Badge>
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color || '#6b7280' }}
                      />
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCategories.map((category) => {
                const bookmarkCount = category._count?.bookmarks || category.bookmarkCount || 0
                return (
                  <Card
                    key={category.id}
                    className="p-4 bg-white hover:shadow-md transition-all cursor-pointer hover:border-blue-500"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: category.color ? category.color + '20' : '#e5e7eb' }}
                        >
                          {category.icon || '📁'}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{category.name}</h3>
                          <p className="text-sm text-gray-500">
                            {bookmarkCount} bookmark{bookmarkCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: category.color || '#6b7280',
                            color: category.color || '#6b7280'
                          }}
                        >
                          {category.name}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {filteredCategories.length === 0 && !loading && (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Folder className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No categories found" : "No categories yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Categories will appear here as you organize your bookmarks"}
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
