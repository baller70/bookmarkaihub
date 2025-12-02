
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { X } from "lucide-react"

interface AddBookmarkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddBookmarkModal({ open, onOpenChange, onSuccess }: AddBookmarkModalProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"new" | "existing">("new")
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    categoryId: "",
    priority: "Medium",
  })

  useEffect(() => {
    if (open) {
      fetchCategories()
      // Reset form when modal opens
      setFormData({
        title: "",
        url: "",
        description: "",
        categoryId: "",
        priority: "Medium",
      })
      setTags("")
      setNotes("")
      setSelectedFile(null)
      setActiveTab("new")
    }
  }, [open])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(Array.isArray(data) ? data : (data.categories || []))
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB")
        return
      }
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.url) {
      toast.error("Title and URL are required")
      return
    }

    setLoading(true)
    try {
      // Parse tags (comma-separated)
      const tagNames = tags
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0)

      // Create or find tag IDs
      const tagIds: string[] = []
      for (const tagName of tagNames) {
        try {
          // Try to create the tag (will fail if exists, which is fine)
          const tagResponse = await fetch("/api/tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: tagName }),
          })
          
          if (tagResponse.ok) {
            const tag = await tagResponse.json()
            tagIds.push(tag.id)
          } else {
            // Tag might already exist, fetch all tags and find it
            const tagsResponse = await fetch("/api/tags")
            if (tagsResponse.ok) {
              const allTags = await tagsResponse.json()
              const existingTag = allTags.find(
                (t: any) => t.name.toLowerCase() === tagName.toLowerCase()
              )
              if (existingTag) {
                tagIds.push(existingTag.id)
              }
            }
          }
        } catch (error) {
          console.error("Error processing tag:", error)
        }
      }

      // Prepare bookmark data
      const bookmarkData: any = {
        title: formData.title,
        url: formData.url,
        description: formData.description,
        priority: formData.priority.toUpperCase(),
        categoryIds: formData.categoryId ? [formData.categoryId] : [],
        tagIds,
      }

      // Add notes if provided
      if (notes) {
        bookmarkData.notes = notes
      }

      // For now, file upload is not implemented (requires cloud storage setup)
      // In a real implementation, you would upload the file to S3 here

      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookmarkData),
      })

      if (response.ok) {
        toast.success("Bookmark created successfully")
        onSuccess()
        onOpenChange(false)
      } else {
        const error = await response.json()
        
        // Handle duplicate bookmark with specific warning
        if (response.status === 409 && error.duplicate) {
          toast.warning(
            error.message || "This URL already exists in your bookmarks",
            { duration: 5000 }
          )
        } else {
          toast.error(error.error || "Failed to create bookmark")
        }
      }
    } catch (error) {
      console.error("Error creating bookmark:", error)
      toast.error("Failed to create bookmark")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] p-0 gap-0">
        {/* Custom Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-sm font-bold tracking-wide">ADD BOOKMARKS</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          <button
            onClick={() => setActiveTab("new")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "new"
                ? "bg-black text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            New Bookmark
          </button>
          <button
            onClick={() => setActiveTab("existing")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "existing"
                ? "bg-black text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Existing Bookmarks
          </button>
        </div>

        {/* Content */}
        {activeTab === "new" ? (
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold text-gray-700">
                TITLE
              </Label>
              <Input
                id="title"
                placeholder="Enter Bookmark Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-sm"
                required
              />
            </div>

            {/* URL */}
            <div className="space-y-1.5">
              <Label htmlFor="url" className="text-xs font-semibold text-gray-700">
                URL
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="text-sm"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold text-gray-700">
                DESCRIPTION
              </Label>
              <Textarea
                id="description"
                placeholder="Enter Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="text-sm resize-none"
                rows={3}
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs font-semibold text-gray-700">
                CATEGORY
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label htmlFor="tags" className="text-xs font-semibold text-gray-700">
                TAGS
              </Label>
              <Input
                id="tags"
                placeholder="Enter Tags Separated By Commas"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label htmlFor="priority" className="text-xs font-semibold text-gray-700">
                PRIORITY
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div className="space-y-1.5">
              <Label htmlFor="image" className="text-xs font-semibold text-gray-700">
                IMAGE
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload a circular image for this bookmark (optional - will auto-fetch from website if
                not provided). Max file size: 5MB
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-semibold text-gray-700">
                NOTES
              </Label>
              <Textarea
                id="notes"
                placeholder="Enter Any Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-sm resize-none"
                rows={3}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-sm font-medium"
              >
                CANCEL
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-black hover:bg-gray-800 text-white text-sm font-medium"
              >
                {loading ? "ADDING..." : "ADD BOOKMARK"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">Existing Bookmarks feature coming soon...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
