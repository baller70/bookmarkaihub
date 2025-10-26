
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ExternalLink, 
  Edit, 
  Trash2, 
  Share,
  Clock,
  TrendingUp,
  FileText,
  CheckSquare,
  History,
  Settings
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface BookmarkDetailModalProps {
  bookmark: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function BookmarkDetailModal({ 
  bookmark, 
  open, 
  onOpenChange, 
  onUpdate 
}: BookmarkDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    favicon: "",
    priority: "MEDIUM",
  })

  useEffect(() => {
    if (bookmark) {
      setFormData({
        title: bookmark.title || "",
        url: bookmark.url || "",
        description: bookmark.description || "",
        favicon: bookmark.favicon || "",
        priority: bookmark.priority || "MEDIUM",
      })
    }
  }, [bookmark])

  const handleSave = async () => {
    if (!formData.title || !formData.url) {
      toast.error("Title and URL are required")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("Bookmark updated successfully")
        setIsEditing(false)
        onUpdate()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update bookmark")
      }
    } catch (error) {
      console.error("Error updating bookmark:", error)
      toast.error("Failed to update bookmark")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this bookmark?")) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        toast.success("Bookmark deleted successfully")
        onUpdate()
        onOpenChange(false)
      } else {
        toast.error("Failed to delete bookmark")
      }
    } catch (error) {
      console.error("Error deleting bookmark:", error)
      toast.error("Failed to delete bookmark")
    } finally {
      setLoading(false)
    }
  }

  const handleVisit = () => {
    window.open(bookmark.url, "_blank")
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: bookmark.title,
        url: bookmark.url,
      })
    } else {
      navigator.clipboard.writeText(bookmark.url)
      toast.success("URL copied to clipboard")
    }
  }

  const progress = bookmark?.totalTasks > 0 
    ? (bookmark.completedTasks / bookmark.totalTasks) * 100 
    : 0

  if (!bookmark) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            {bookmark.favicon && (
              <div className="relative w-8 h-8">
                <Image
                  src={bookmark.favicon}
                  alt=""
                  fill
                  className="object-contain rounded"
                  unoptimized
                />
              </div>
            )}
            <div>
              <DialogTitle className="text-xl font-bold bookmark-title">
                {bookmark.title}
              </DialogTitle>
              <p className="text-sm text-gray-500 truncate">
                {bookmark.url}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVisit}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
            >
              <Share className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">OVERVIEW</TabsTrigger>
            <TabsTrigger value="notes">NOTES</TabsTrigger>
            <TabsTrigger value="tasks">TASKS</TabsTrigger>
            <TabsTrigger value="history">HISTORY</TabsTrigger>
            <TabsTrigger value="settings">SETTINGS</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Title</Label>
                      <Input
                        id="edit-title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-url">URL</Label>
                      <Input
                        id="edit-url"
                        value={formData.url}
                        onChange={(e) =>
                          setFormData({ ...formData, url: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Description */}
                  {bookmark.description && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-600">{bookmark.description}</p>
                    </div>
                  )}

                  {/* Categories and Tags */}
                  <div className="grid grid-cols-2 gap-6">
                    {bookmark.categories?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Categories</h4>
                        <div className="flex flex-wrap gap-2">
                          {bookmark.categories.map((cat: any) => (
                            <Badge
                              key={cat.category.id}
                              variant="outline"
                              style={{ 
                                backgroundColor: `${cat.category.color}15`,
                                borderColor: cat.category.color,
                                color: cat.category.color 
                              }}
                            >
                              {cat.category.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {bookmark.tags?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {bookmark.tags.map((tag: any) => (
                            <Badge
                              key={tag.tag.id}
                              variant="outline"
                              style={{ 
                                backgroundColor: `${tag.tag.color}15`,
                                borderColor: tag.tag.color,
                                color: tag.tag.color 
                              }}
                            >
                              {tag.tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {bookmark.totalVisits}
                      </div>
                      <div className="text-sm text-gray-500">Total Visits</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {bookmark.engagementScore}
                      </div>
                      <div className="text-sm text-gray-500">Engagement</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {bookmark.timeSpent}m
                      </div>
                      <div className="text-sm text-gray-500">Time Spent</div>
                    </div>
                  </div>

                  {/* Task Progress */}
                  {bookmark.totalTasks > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Task Progress</span>
                        <span>
                          {bookmark.completedTasks}/{bookmark.totalTasks} completed
                        </span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-500">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Notes for this bookmark</span>
            </div>
            <Textarea
              placeholder="Add your notes here..."
              rows={10}
              className="w-full"
            />
            <Button className="w-full">Save Notes</Button>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-500">
                <CheckSquare className="h-4 w-4" />
                <span className="text-sm">Task management</span>
              </div>
              <Button size="sm">Add Task</Button>
            </div>
            
            <div className="text-center py-8 text-gray-500">
              <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No tasks yet. Create your first task to get started.</p>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-500 mb-4">
              <History className="h-4 w-4" />
              <span className="text-sm">Activity history</span>
            </div>
            
            {bookmark.history?.length > 0 ? (
              <div className="space-y-3">
                {bookmark.history.map((item: any) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.action.replace('_', ' ').toLowerCase()}
                      </p>
                      {item.details && (
                        <p className="text-sm text-gray-600">{item.details}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {format(new Date(item.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No activity history available.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-500 mb-4">
              <Settings className="h-4 w-4" />
              <span className="text-sm">Bookmark settings</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Priority Level</h4>
                  <p className="text-sm text-gray-500">Current: {bookmark.priority}</p>
                </div>
                <Badge className={
                  bookmark.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                  bookmark.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  bookmark.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }>
                  {bookmark.priority}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Created</h4>
                  <p className="text-sm text-gray-500">
                    {format(new Date(bookmark.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Last Updated</h4>
                  <p className="text-sm text-gray-500">
                    {format(new Date(bookmark.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
