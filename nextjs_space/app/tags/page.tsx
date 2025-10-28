
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tag, Plus, Search, Edit, Trash2, TrendingUp } from "lucide-react"
import { toast } from "sonner"

export default function TagsPage() {
  const [tags, setTags] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags")
      if (response.ok) {
        const data = await response.json()
        setTags(data)
      }
    } catch (error) {
      console.error("Error fetching tags:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTag = () => {
    const tagName = prompt("Enter tag name:")
    if (!tagName) return

    const tagColor = prompt("Enter tag color (e.g., #3B82F6):", "#3B82F6")
    
    setIsCreating(true)
    fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: tagName, color: tagColor }),
    })
      .then((res) => {
        if (res.ok) {
          toast.success("Tag created successfully!")
          fetchTags()
        } else {
          toast.error("Failed to create tag")
        }
      })
      .catch(() => toast.error("Failed to create tag"))
      .finally(() => setIsCreating(false))
  }

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return

    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Tag deleted successfully")
        fetchTags()
      } else {
        toast.error("Failed to delete tag")
      }
    } catch (error) {
      console.error("Error deleting tag:", error)
      toast.error("Failed to delete tag")
    }
  }

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                  <Tag className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
                  <p className="text-gray-600">Organize bookmarks with custom tags</p>
                </div>
              </div>
              <Button 
                onClick={handleCreateTag}
                disabled={isCreating}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? "Creating..." : "Create Tag"}
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white border-gray-200 h-12"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 bg-white border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Tags</p>
                  <p className="text-3xl font-bold text-gray-900">{tags.length}</p>
                </div>
                <Tag className="h-10 w-10 text-purple-500" />
              </div>
            </Card>
            <Card className="p-6 bg-white border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Most Used</p>
                  <p className="text-3xl font-bold text-gray-900">{tags[0]?.name || "AI"}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500" />
              </div>
            </Card>
            <Card className="p-6 bg-white border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active Tags</p>
                  <p className="text-3xl font-bold text-gray-900">{tags.filter(t => t._count?.bookmarks > 0).length}</p>
                </div>
                <Tag className="h-10 w-10 text-blue-500" />
              </div>
            </Card>
            <Card className="p-6 bg-white border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Unused Tags</p>
                  <p className="text-3xl font-bold text-gray-900">{tags.filter(t => !t._count?.bookmarks || t._count.bookmarks === 0).length}</p>
                </div>
                <Tag className="h-10 w-10 text-gray-400" />
              </div>
            </Card>
          </div>

          {/* Tags Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading tags...</p>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "No tags found" : "No tags yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Create your first tag to get started"}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={handleCreateTag}
                  disabled={isCreating}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isCreating ? "Creating..." : "Create Tag"}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTags.map((tag) => (
                <Card
                  key={tag.id}
                  className="p-6 bg-white border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Badge
                      className="text-sm px-3 py-1.5 font-medium"
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        border: `1.5px solid ${tag.color}`,
                      }}
                    >
                      <Tag className="h-3.5 w-3.5 mr-1.5" />
                      {tag.name}
                    </Badge>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDeleteTag(tag.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="mb-3 font-medium">{tag._count?.bookmarks || 0} bookmarks</p>
                    <div
                      className="h-2 rounded-full bg-gray-100"
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          backgroundColor: tag.color,
                          width: `${Math.min((tag._count?.bookmarks || 0) * 10, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
