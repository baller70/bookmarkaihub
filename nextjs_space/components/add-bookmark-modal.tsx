
"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { X, FileBox, Link2, Upload, Image as ImageIcon } from "lucide-react"

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
  const [isCustomCard, setIsCustomCard] = useState(false)
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null)
  const customImageInputRef = useRef<HTMLInputElement>(null)
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
      setIsCustomCard(false)
      setCustomImagePreview(null)
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

  const handleCustomImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB")
        return
      }
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setCustomImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Title is always required
    if (!formData.title) {
      toast.error("Title is required")
      return
    }
    
    // URL is required only for regular bookmarks (not custom cards)
    if (!isCustomCard && !formData.url) {
      toast.error("URL is required for regular bookmarks")
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
        url: isCustomCard ? null : formData.url,
        description: formData.description,
        priority: formData.priority.toUpperCase(),
        categoryIds: formData.categoryId && formData.categoryId !== "none" ? [formData.categoryId] : [],
        tagIds,
        isCustomCard: isCustomCard,
        customImage: customImagePreview || null,
      }

      // Add notes if provided
      if (notes) {
        bookmarkData.notes = notes
      }

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
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Custom Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0">
          <h2 className="text-sm font-bold tracking-wide">ADD BOOKMARKS</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-5 flex-shrink-0">
          <button
            onClick={() => setActiveTab("new")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "new"
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
            }`}
          >
            New Bookmark
          </button>
          <button
            onClick={() => setActiveTab("existing")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "existing"
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
            }`}
          >
            Existing Bookmarks
          </button>
        </div>

        {/* Content - Scrollable */}
        {activeTab === "new" ? (
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3 overflow-y-auto flex-1">
            {/* Custom Card Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <FileBox className="h-4 w-4 text-gray-500" />
                <div>
                  <Label htmlFor="custom-card" className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                    CUSTOM CARD (NO URL)
                  </Label>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    Create a card without a website link
                  </p>
                </div>
              </div>
              <Switch
                id="custom-card"
                checked={isCustomCard}
                onCheckedChange={(checked) => {
                  setIsCustomCard(checked)
                  if (checked) {
                    setFormData({ ...formData, url: "" })
                  }
                }}
              />
            </div>

            {/* Title */}
            <div className="space-y-1">
              <Label htmlFor="title" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                TITLE *
              </Label>
              <Input
                id="title"
                placeholder={isCustomCard ? "Enter Card Title (e.g., Project Ideas)" : "Enter Bookmark Title"}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-sm h-9"
                required
              />
            </div>

            {/* URL - Only show for regular bookmarks */}
            {!isCustomCard && (
              <div className="space-y-1">
                <Label htmlFor="url" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  URL *
                </Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="text-sm h-9 pl-9"
                    required
                  />
                </div>
              </div>
            )}

            {/* Custom Image Upload - Only show for custom cards */}
            {isCustomCard && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  CARD IMAGE (OPTIONAL)
                </Label>
                <input
                  ref={customImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCustomImageChange}
                />
                {customImagePreview ? (
                  <div className="relative">
                    <img 
                      src={customImagePreview} 
                      alt="Custom card preview" 
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCustomImagePreview(null)
                        if (customImageInputRef.current) {
                          customImageInputRef.current.value = ""
                        }
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => customImageInputRef.current?.click()}
                    className="w-full h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                  >
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-xs text-gray-500">Click to upload image</span>
                  </button>
                )}
              </div>
            )}

            {/* Description */}
            <div className="space-y-1">
              <Label htmlFor="description" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                DESCRIPTION
              </Label>
              <Textarea
                id="description"
                placeholder="Enter Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="text-sm resize-none"
                rows={2}
              />
            </div>

            {/* Category & Priority Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Category */}
              <div className="space-y-1">
                <Label htmlFor="category" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  CATEGORY
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger className="text-sm h-9">
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

              {/* Priority */}
              <div className="space-y-1">
                <Label htmlFor="priority" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  PRIORITY
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="text-sm h-9">
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
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <Label htmlFor="tags" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                TAGS
              </Label>
              <Input
                id="tags"
                placeholder="Enter Tags Separated By Commas"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="text-sm h-9"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-1">
              <Label htmlFor="image" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                IMAGE (OPTIONAL)
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm cursor-pointer h-9"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label htmlFor="notes" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                NOTES
              </Label>
              <Textarea
                id="notes"
                placeholder="Enter Any Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-sm resize-none"
                rows={2}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-3 pb-1 sticky bottom-0 bg-white dark:bg-slate-900 border-t mt-2 -mx-5 px-5">
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
                className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white text-sm font-medium"
              >
                {loading ? "ADDING..." : "ADD BOOKMARK"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="px-5 py-12 text-center overflow-y-auto flex-1">
            <p className="text-gray-500 dark:text-gray-400">Existing Bookmarks feature coming soon...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
