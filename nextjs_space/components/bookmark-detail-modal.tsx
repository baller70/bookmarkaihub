
"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Heart, 
  Share2, 
  Copy,
  ExternalLink,
  Eye,
  Clock,
  Activity,
  Globe,
  Camera,
  Edit,
  Plus,
  Stethoscope
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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
  const [isFavorite, setIsFavorite] = useState(bookmark?.isFavorite || false)
  const [description, setDescription] = useState(bookmark?.description || "")
  const [notes, setNotes] = useState("")
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(bookmark?.title || "")
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [newTag, setNewTag] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (bookmark) {
      setIsFavorite(bookmark.isFavorite || false)
      setDescription(bookmark.description || "")
      setTitle(bookmark.title || "")
    }
  }, [bookmark])

  const handleFavorite = async () => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      })

      if (response.ok) {
        setIsFavorite(!isFavorite)
        toast.success(isFavorite ? "Removed from favorites" : "Added to favorites")
        onUpdate()
      }
    } catch (error) {
      toast.error("Failed to update favorite status")
    }
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

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(bookmark.url)
    toast.success("URL copied to clipboard")
  }

  const handleVisit = () => {
    window.open(bookmark.url, "_blank")
  }

  const handleSaveDescription = async () => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      })

      if (response.ok) {
        toast.success("Description updated")
        setIsEditingDescription(false)
        onUpdate()
      }
    } catch (error) {
      toast.error("Failed to update description")
    }
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Handle image upload logic here
      toast.info("Image upload functionality coming soon")
    }
  }

  const handleSaveTitle = async () => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })

      if (response.ok) {
        toast.success("Title updated")
        setIsEditingTitle(false)
        onUpdate()
      }
    } catch (error) {
      toast.error("Failed to update title")
    }
  }

  const handleLogoUpload = () => {
    logoInputRef.current?.click()
  }

  const handleFaviconUpload = () => {
    faviconInputRef.current?.click()
  }

  const handleBackgroundUpload = () => {
    backgroundInputRef.current?.click()
  }

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      toast.info("Custom logo upload functionality coming soon")
    }
  }

  const handleFaviconFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      toast.info("Favicon upload functionality coming soon")
    }
  }

  const handleBackgroundFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      toast.info("Background upload functionality coming soon")
    }
  }

  const handleAddTag = async () => {
    if (!newTag.trim()) return
    
    try {
      // First create or get the tag
      const tagResponse = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTag }),
      })

      if (tagResponse.ok) {
        const tag = await tagResponse.json()
        
        // Then associate it with the bookmark
        const bookmarkResponse = await fetch(`/api/bookmarks/${bookmark.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            tagIds: [...(bookmark.tags?.map((t: any) => t.tag.id) || []), tag.id]
          }),
        })

        if (bookmarkResponse.ok) {
          toast.success("Tag added")
          setNewTag("")
          setIsEditingTags(false)
          onUpdate()
        }
      }
    } catch (error) {
      toast.error("Failed to add tag")
    }
  }

  const handleRemoveTag = async (tagId: string) => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tagIds: bookmark.tags?.filter((t: any) => t.tag.id !== tagId).map((t: any) => t.tag.id) || []
        }),
      })

      if (response.ok) {
        toast.success("Tag removed")
        onUpdate()
      }
    } catch (error) {
      toast.error("Failed to remove tag")
    }
  }

  const handleViewAnalytics = () => {
    toast.info("Opening full analytics dashboard...")
    // You can navigate to an analytics page here
  }

  const handleCheckHealth = () => {
    toast.info("Checking bookmark health...")
    // Check if URL is still valid
    window.open(`https://www.isitdownrightnow.com/check.php?domain=${encodeURIComponent(bookmark.url)}`, '_blank')
  }

  const handleBrowseBookmarks = () => {
    toast.info("Browse bookmarks feature coming soon")
    // You can implement a bookmark picker modal here
  }

  const handleAddGoal = () => {
    toast.info("Add goal feature coming soon")
    // You can implement a goal creation/linking modal here
  }

  if (!bookmark) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-0">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoFileChange}
        />
        <input
          ref={faviconInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFaviconFileChange}
        />
        <input
          ref={backgroundInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBackgroundFileChange}
        />
        
        {/* Header */}
        <div className="border-b px-6 py-4 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {bookmark.favicon && (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-black">
                  <Image
                    src={bookmark.favicon}
                    alt=""
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
              <div>
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-xl font-bold text-gray-900 border-b-2 border-gray-300 focus:border-black outline-none bg-transparent"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveTitle}
                      className="bg-black hover:bg-gray-800 text-white h-7 text-xs uppercase"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditingTitle(false)
                        setTitle(bookmark.title || "")
                      }}
                      className="h-7 text-xs uppercase"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {title}
                    <button 
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      <Edit className="h-4 w-4 text-gray-400" />
                    </button>
                  </h2>
                )}
                <p className="text-sm text-gray-500">{bookmark.url}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                onClick={handleFavorite}
                className={cn(
                  "rounded-lg bg-black hover:bg-gray-800 text-white",
                  isFavorite && "text-red-500"
                )}
              >
                <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
              </Button>
              <Button
                size="icon"
                onClick={handleShare}
                className="rounded-lg bg-black hover:bg-gray-800 text-white"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                onClick={handleCopyUrl}
                className="rounded-lg bg-black hover:bg-gray-800 text-white"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleVisit}
                className="bg-black hover:bg-gray-800 text-white rounded-lg uppercase"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Site
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="border-b px-6 bg-gray-50">
            <TabsList className="bg-transparent h-auto p-0 gap-8">
              <TabsTrigger 
                value="overview" 
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-gray-900 rounded-none px-0 pb-3 font-medium text-gray-600 data-[state=active]:text-gray-900"
              >
                OVERVIEW
              </TabsTrigger>
              <TabsTrigger 
                value="arp"
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-gray-900 rounded-none px-0 pb-3 font-medium text-gray-600 data-[state=active]:text-gray-900"
              >
                ARP
              </TabsTrigger>
              <TabsTrigger 
                value="notification"
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-gray-900 rounded-none px-0 pb-3 font-medium text-gray-600 data-[state=active]:text-gray-900"
              >
                NOTIFICATION
              </TabsTrigger>
              <TabsTrigger 
                value="task"
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-gray-900 rounded-none px-0 pb-3 font-medium text-gray-600 data-[state=active]:text-gray-900"
              >
                TASK
              </TabsTrigger>
              <TabsTrigger 
                value="media"
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-gray-900 rounded-none px-0 pb-3 font-medium text-gray-600 data-[state=active]:text-gray-900"
              >
                MEDIA
              </TabsTrigger>
              <TabsTrigger 
                value="comment"
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-gray-900 rounded-none px-0 pb-3 font-medium text-gray-600 data-[state=active]:text-gray-900"
              >
                COMMENT
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="p-6 mt-0 bg-white">
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column - Logo */}
              <div className="space-y-6">
                <div className="relative aspect-square bg-gray-100 rounded-lg flex items-center justify-center group">
                  {bookmark.favicon ? (
                    <Image
                      src={bookmark.favicon}
                      alt={bookmark.title}
                      fill
                      className="object-contain p-8"
                      unoptimized
                    />
                  ) : (
                    <div className="text-6xl font-bold text-gray-300">
                      {bookmark.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <button 
                    onClick={handleImageUpload}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                  >
                    <div className="bg-white rounded-full p-3">
                      <Camera className="h-6 w-6 text-gray-900" />
                    </div>
                  </button>
                </div>
                
                <p className="text-center text-sm text-gray-500">
                  Click the camera icon to update image
                </p>
                
                <div className="flex gap-2">
                  <Button
                    className="flex-1 rounded-lg bg-black hover:bg-gray-800 text-white uppercase"
                    onClick={handleLogoUpload}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Custom Logo
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    className="bg-black hover:bg-gray-800 text-white rounded-lg flex-1 uppercase"
                    onClick={handleBackgroundUpload}
                  >
                    Front Background
                  </Button>
                  <Button
                    className="bg-black hover:bg-gray-800 text-white rounded-lg flex-1 uppercase"
                    onClick={handleFaviconUpload}
                  >
                    Favicon
                  </Button>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">DESCRIPTION</h3>
                    <button 
                      onClick={() => setIsEditingDescription(!isEditingDescription)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Edit className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                  {isEditingDescription ? (
                    <div className="space-y-2">
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[120px] text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveDescription}
                          className="bg-black hover:bg-gray-800 text-white uppercase"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditingDescription(false)
                            setDescription(bookmark.description || "")
                          }}
                          className="uppercase"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {description || "No description available."}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">TAGS</h3>
                    <button 
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => setIsEditingTags(!isEditingTags)}
                    >
                      <Edit className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                  {isEditingTags && (
                    <div className="mb-3 flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add new tag..."
                        className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-black"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddTag()
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={handleAddTag}
                        className="bg-black hover:bg-gray-800 text-white uppercase"
                      >
                        Add
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {bookmark.tags && bookmark.tags.length > 0 ? (
                      bookmark.tags.map((tag: any) => (
                        <Badge
                          key={tag.tag.id}
                          variant="outline"
                          className="rounded-full px-3 py-1 text-xs font-medium border-gray-300 flex items-center gap-2"
                        >
                          <span className="mr-1">🏷️</span>
                          {tag.tag.name.toUpperCase()}
                          {isEditingTags && (
                            <button
                              onClick={() => handleRemoveTag(tag.tag.id)}
                              className="text-gray-500 hover:text-red-600 ml-1"
                            >
                              ×
                            </button>
                          )}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No tags</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">NOTES</h3>
                    <button 
                      onClick={() => setIsEditingNotes(!isEditingNotes)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Edit className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                  {isEditingNotes ? (
                    <div className="space-y-2">
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes..."
                        className="min-h-[80px] text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setIsEditingNotes(false)
                            toast.success("Notes saved")
                          }}
                          className="bg-black hover:bg-gray-800 text-white uppercase"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditingNotes(false)}
                          className="uppercase"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {notes || "No notes"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="mt-8 pt-8 border-t">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {bookmark.totalVisits || 6}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">TOTAL VISITS</div>
                  <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-2"></div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Clock className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {bookmark.timeSpent || 5}m
                  </div>
                  <div className="text-xs text-gray-500 font-medium">TIME SPENT</div>
                  <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-2"></div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {bookmark.weeklyVisits || 5}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">THIS WEEK</div>
                  <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-2"></div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Globe className="h-6 w-6 text-gray-500 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    0
                  </div>
                  <div className="text-xs text-gray-500 font-medium">BROKEN</div>
                  <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mt-2"></div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-black hover:bg-gray-800 text-white rounded-lg h-12 font-medium uppercase"
                  onClick={handleViewAnalytics}
                >
                  View Full Analytics
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-12 font-medium uppercase"
                  onClick={handleCheckHealth}
                >
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Check Health
                </Button>
              </div>
            </div>

            {/* Related Bookmarks */}
            <div className="mt-8 pt-8 border-t">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">RELATED BOOKMARKS</h3>
                <Button 
                  size="sm" 
                  className="rounded-lg bg-black hover:bg-gray-800 text-white uppercase"
                  onClick={handleBrowseBookmarks}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Browse All Bookmarks to Add More
                </Button>
              </div>
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No related bookmarks yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Click "Browse All Bookmarks to add more" to add related bookmarks.
                </p>
              </div>
              
              <div className="text-center mt-6">
                <Button 
                  className="bg-black hover:bg-gray-800 text-white uppercase"
                  onClick={handleBrowseBookmarks}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Browse All Bookmarks to Add More
                </Button>
              </div>
            </div>

            {/* Goals */}
            <div className="mt-8 pt-8 border-t">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">GOALS</h3>
                <Button 
                  size="sm" 
                  className="rounded-lg bg-black hover:bg-gray-800 text-white uppercase"
                  onClick={handleAddGoal}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </div>
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No goals linked yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Click "ADD GOAL" to link existing goals to this bookmark.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Other Tabs */}
          <TabsContent value="arp" className="p-6 bg-white">
            <div className="text-center py-12 text-gray-500">
              <p>ARP content coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="notification" className="p-6 bg-white">
            <div className="text-center py-12 text-gray-500">
              <p>Notification content coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="task" className="p-6 bg-white">
            <div className="text-center py-12 text-gray-500">
              <p>Task content coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="media" className="p-6 bg-white">
            <div className="text-center py-12 text-gray-500">
              <p>Media content coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="comment" className="p-6 bg-white">
            <div className="text-center py-12 text-gray-500">
              <p>Comment content coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
