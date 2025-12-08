
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tag, Plus, Search, Edit, Trash2, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import type { Tag as TagType } from "@/types/bookmark"

export default function TagsPage() {
  const [tags, setTags] = useState<TagType[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  // Create tag modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("#3B82F6")

  // Delete confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<string | null>(null)

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
    setShowCreateModal(true)
  }

  const submitCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Tag name is required")
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim(), color: newTagColor }),
      })

      if (response.ok) {
        toast.success("Tag created successfully!")
        fetchTags()
        setShowCreateModal(false)
        setNewTagName("")
        setNewTagColor("#3B82F6")
      } else {
        toast.error("Failed to create tag")
      }
    } catch {
      toast.error("Failed to create tag")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    setTagToDelete(tagId)
    setShowDeleteDialog(true)
  }

  const confirmDeleteTag = async () => {
    if (!tagToDelete) return

    try {
      const response = await fetch(`/api/tags/${tagToDelete}`, {
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
    } finally {
      setShowDeleteDialog(false)
      setTagToDelete(null)
    }
  }

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {/* Bordered Container */}
          <div className="border border-gray-300 rounded-lg p-3 sm:p-4 md:p-6 bg-white overflow-hidden">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex-shrink-0">
                  <Tag className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 uppercase">TAGS</h1>
                  <p className="text-sm text-gray-600">Organize bookmarks with custom tags</p>
                </div>
              </div>
              <Button 
                onClick={handleCreateTag}
                disabled={isCreating}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex-shrink-0"
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
            <Card className="p-4 sm:p-6 bg-white border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Tags</p>
                  <p className="text-3xl font-bold text-gray-900 uppercase">{tags.length}</p>
                </div>
                <Tag className="h-10 w-10 text-purple-500" />
              </div>
            </Card>
            <Card className="p-4 sm:p-6 bg-white border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Most Used</p>
                  <p className="text-3xl font-bold text-gray-900 uppercase">{tags[0]?.name || "AI"}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500" />
              </div>
            </Card>
            <Card className="p-4 sm:p-6 bg-white border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active Tags</p>
                  <p className="text-3xl font-bold text-gray-900 uppercase">{tags.filter(t => (t._count?.bookmarks ?? 0) > 0).length}</p>
                </div>
                <Tag className="h-10 w-10 text-blue-500" />
              </div>
            </Card>
            <Card className="p-4 sm:p-6 bg-white border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Unused Tags</p>
                  <p className="text-3xl font-bold text-gray-900 uppercase">{tags.filter(t => (t._count?.bookmarks ?? 0) === 0).length}</p>
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
                  className="p-3 bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 rounded-xl"
                >
                  {/* Top Row: Icon, Name, and Actions */}
                  <div className="flex items-start gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: tag.color || '#8b5cf6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 truncate leading-tight">
                        {tag.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-gray-100 rounded"
                      >
                        <Edit className="h-3.5 w-3.5 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-red-50 rounded"
                        onClick={() => handleDeleteTag(tag.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  {/* Bookmark Count */}
                  <div className="mb-2">
                    <span className="text-xs text-gray-600 font-medium">
                      {tag._count?.bookmarks || 0} bookmark{(tag._count?.bookmarks || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: tag.color || '#8b5cf6',
                        width: `${Math.min((tag._count?.bookmarks || 0) * 10, 100)}%`,
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
          </div>
        </div>
      </DashboardLayout>

      {/* Create Tag Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>
              Add a new tag to organize your bookmarks.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tagName">Tag Name</Label>
              <Input
                id="tagName"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name"
                onKeyDown={(e) => e.key === 'Enter' && submitCreateTag()}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tagColor">Tag Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="tagColor"
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={submitCreateTag} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tag? This action cannot be undone.
              The tag will be removed from all bookmarks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTagToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTag}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardAuth>
  )
}
