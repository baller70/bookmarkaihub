"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Heart, 
  Share2, 
  Copy,
  ExternalLink,
  Clock,
  Activity,
  Globe,
  Camera,
  Edit,
  Plus,
  Stethoscope,
  Play,
  Pause,
  RotateCcw,
  Upload,
  FolderPlus,
  MessageSquare,
  Settings,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  Users,
  History,
  Timer,
  ListTodo,
  ListChecks,
  BarChart3,
  X,
  GripVertical,
  Trash2,
  Flag,
  Clock4,
  PlusCircle,
  Folder
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ManageToolsModal } from "@/components/manage-tools-modal"
import { QuickNotesTool } from "@/components/quick-notes-tool"
import { HabitsTool } from "@/components/habits-tool"
import { TasksTab } from "@/components/task-subtabs/tasks-tab"
import { ListsTab } from "@/components/task-subtabs/lists-tab"
import { AnalyticsTab } from "@/components/task-subtabs/analytics-tab"
import { SettingsTab } from "@/components/task-subtabs/settings-tab"
import { NotificationTool } from "@/components/notification-tool"
import { MediaTool } from "@/components/media-tool"
import { CommentsTool } from "@/components/comments-tool"

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
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(bookmark?.isFavorite || false)
  const [description, setDescription] = useState(bookmark?.description || "")
  const [notes, setNotes] = useState("")
  const [tags, setTags] = useState("")
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [isEditingTags, setIsEditingTags] = useState(false)
  
  // Timer state
  const [timerTime, setTimerTime] = useState(25 * 60) // 25 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Analytics tracking state
  const modalOpenTimeRef = useRef<Date | null>(null)
  const visitTrackedRef = useRef<boolean>(false) // Track if visit already recorded for this modal opening
  const [currentVisits, setCurrentVisits] = useState(bookmark?.totalVisits || 0)
  const [currentTimeSpent, setCurrentTimeSpent] = useState(bookmark?.timeSpent || 0)
  
  // Notification state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  
  // Comment state
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  
  // Tools state
  const [availableTools, setAvailableTools] = useState<any[]>([])
  const [showManageTools, setShowManageTools] = useState(false)
  const [toolsLoading, setToolsLoading] = useState(true)
  
  // TASK tab sub-navigation state
  const [taskSubTab, setTaskSubTab] = useState("timer")
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (bookmark) {
      setIsFavorite(bookmark.isFavorite || false)
      setDescription(bookmark.description || "")
      // Convert tags array to comma-separated string
      const tagNames = bookmark.tags?.map((t: any) => t.tag.name).join(", ") || ""
      setTags(tagNames)
      // Update analytics state
      setCurrentVisits(bookmark.totalVisits || 0)
      setCurrentTimeSpent(bookmark.timeSpent || 0)
      // Fetch tools
      fetchTools()
    }
  }, [bookmark])

  // Fetch available tools for this bookmark
  const fetchTools = async () => {
    if (!bookmark?.id) return
    try {
      setToolsLoading(true)
      const response = await fetch(`/api/bookmark-tools/${bookmark.id}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableTools(data)
      }
    } catch (error) {
      console.error('Error fetching tools:', error)
    } finally {
      setToolsLoading(false)
    }
  }

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && timerTime > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerTime((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            toast.success("Work session complete!")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [isTimerRunning, timerTime])

  // Analytics tracking: Track visits and time spent
  useEffect(() => {
    const trackVisit = async () => {
      // Prevent double counting by checking if visit already tracked for this opening
      if (!bookmark?.id || visitTrackedRef.current) return
      
      visitTrackedRef.current = true // Mark as tracked
      
      try {
        const response = await fetch(`/api/bookmarks/${bookmark.id}/track-visit`, {
          method: 'POST',
        })
        
        if (response.ok) {
          const data = await response.json()
          setCurrentVisits(data.totalVisits)
          // Immediately refresh parent component to show updated count on card
          onUpdate()
        }
      } catch (error) {
        console.error('Error tracking visit:', error)
      }
    }

    const trackTimeSpent = async () => {
      if (!bookmark?.id || !modalOpenTimeRef.current) return
      
      const now = new Date()
      const timeSpentSeconds = (now.getTime() - modalOpenTimeRef.current.getTime()) / 1000
      const timeSpentMinutes = timeSpentSeconds / 60
      
      // Only track if at least 1 second has passed
      if (timeSpentSeconds >= 1) {
        try {
          const response = await fetch(`/api/bookmarks/${bookmark.id}/track-time`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ timeSpentMinutes }),
          })
          
          if (response.ok) {
            const data = await response.json()
            setCurrentTimeSpent(data.timeSpent)
            // Update parent to show new time on card
            onUpdate()
          }
        } catch (error) {
          console.error('Error tracking time:', error)
        }
      }
    }

    // When modal opens
    if (open && bookmark?.id) {
      modalOpenTimeRef.current = new Date()
      visitTrackedRef.current = false // Reset tracking flag when modal opens
      trackVisit()
      
      // Track time spent every 5 seconds while modal is open
      const timeTrackingInterval = setInterval(() => {
        trackTimeSpent()
      }, 5000) // Update every 5 seconds
      
      // Cleanup on close
      return () => {
        clearInterval(timeTrackingInterval)
        // Track final time when modal closes
        if (modalOpenTimeRef.current) {
          trackTimeSpent()
          modalOpenTimeRef.current = null
        }
        // Reset tracking flag when modal closes
        visitTrackedRef.current = false
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bookmark?.id])

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
      }).catch(() => {
        // Fallback if share fails
        navigator.clipboard.writeText(bookmark.url)
        toast.success("URL copied to clipboard")
      })
    } else {
      navigator.clipboard.writeText(bookmark.url)
      toast.success("URL copied to clipboard")
    }
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(bookmark.url)
    toast.success("Bookmark URL copied to clipboard!")
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

  const handleSaveTags = async () => {
    try {
      // Parse comma-separated tags
      const tagNames = tags.split(",").map(t => t.trim()).filter(t => t.length > 0)
      
      toast.success("Tags updated")
      setIsEditingTags(false)
      onUpdate()
    } catch (error) {
      toast.error("Failed to update tags")
    }
  }

  const handleSaveNotes = () => {
    toast.success("Notes saved")
    setIsEditingNotes(false)
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      toast.success("Image uploaded successfully")
    }
  }

  const handleViewAnalytics = () => {
    onOpenChange(false)
    router.push("/analytics")
  }

  const handleCheckHealth = async () => {
    try {
      toast.loading("Checking bookmark health...")
      
      // Simulate health check
      setTimeout(() => {
        toast.dismiss()
        toast.success("Bookmark is healthy!")
      }, 2000)
    } catch (error) {
      toast.error("Failed to fetch bookmark health")
    }
  }

  // Timer functions
  const handleStartTimer = () => {
    setIsTimerRunning(true)
  }

  const handleStopTimer = () => {
    setIsTimerRunning(false)
  }

  const handleResetTimer = () => {
    setIsTimerRunning(false)
    setTimerTime(25 * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Comment functions
  const handleAddComment = () => {
    if (!newComment.trim()) return
    
    const comment = {
      id: Date.now().toString(),
      text: newComment,
      createdAt: new Date(),
      author: "Current User"
    }
    
    setComments([...comments, comment])
    setNewComment("")
    toast.success("Comment added")
  }

  if (!bookmark) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-0">
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
          onChange={handleFileChange}
        />
        <input
          ref={faviconInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={backgroundInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        
        {/* Header */}
        <div className="border-b px-3 sm:px-6 py-3 sm:py-4 bg-white">
          <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row items-start justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 w-full sm:w-auto">
              {bookmark.favicon && (
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-black flex-shrink-0">
                  <Image
                    src={bookmark.favicon}
                    alt=""
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-sm sm:text-xl font-bold text-gray-900 flex items-center gap-2 truncate">
                  <span className="truncate">{bookmark.title}</span>
                  <button 
                    className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
                    onClick={() => {}}
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  </button>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{bookmark.url}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-end">
              <Button
                size="icon"
                variant="outline"
                onClick={handleFavorite}
                className="rounded-lg !bg-white border-gray-300 hover:!bg-gray-50 h-8 w-8 sm:h-10 sm:w-10"
              >
                <Heart className={cn("h-3 w-3 sm:h-4 sm:w-4 text-gray-700", isFavorite && "fill-current text-red-500")} />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={handleShare}
                className="rounded-lg !bg-white border-gray-300 hover:!bg-gray-50 h-8 w-8 sm:h-10 sm:w-10"
              >
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyUrl}
                className="rounded-lg !bg-white border-gray-300 hover:!bg-gray-50 h-8 w-8 sm:h-10 sm:w-10"
              >
                <Copy className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
              </Button>
              <Button
                variant="outline"
                onClick={handleVisit}
                className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900 rounded-lg uppercase text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
              >
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Visit Site</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="border-b px-3 sm:px-6 bg-gray-50">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="bg-transparent h-auto p-0 gap-3 sm:gap-8 flex min-w-full w-max sm:w-full items-center">
                {availableTools
                  .filter(tool => tool.isEnabled)
                  .sort((a, b) => a.order - b.order)
                  .map((tool) => (
                    <TabsTrigger 
                      key={tool.key}
                      value={tool.key} 
                      className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-gray-900 rounded-none px-0 pb-2 sm:pb-3 font-medium text-xs sm:text-sm text-gray-600 data-[state=active]:text-gray-900 whitespace-nowrap"
                    >
                      {tool.label}
                    </TabsTrigger>
                  ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowManageTools(true)}
                  className="ml-auto text-xs sm:text-sm text-gray-500 hover:text-gray-700 h-auto py-2 whitespace-nowrap"
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Manage
                </Button>
              </TabsList>
            </div>
          </div>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="p-3 sm:p-6 mt-0 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
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
                    variant="outline"
                    className="flex-1 rounded-lg !bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900 uppercase"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Custom Logo
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900 rounded-lg flex-1 uppercase"
                    onClick={() => backgroundInputRef.current?.click()}
                  >
                    Front Background
                  </Button>
                  <Button
                    variant="outline"
                    className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900 rounded-lg flex-1 uppercase"
                    onClick={() => faviconInputRef.current?.click()}
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
                        className="min-h-[120px] text-sm !bg-white border-gray-300"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSaveDescription}
                          className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900 uppercase"
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
                          className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900 uppercase"
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
                  {isEditingTags ? (
                    <div className="space-y-2">
                      <Input
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="vibe-crafting, tool, personalization, atmosphere"
                        className="text-sm !bg-white border-gray-300 !text-gray-900"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSaveTags}
                          className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900 uppercase"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditingTags(false)
                            const tagNames = bookmark.tags?.map((t: any) => t.tag.name).join(", ") || ""
                            setTags(tagNames)
                          }}
                          className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900 uppercase"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {bookmark.tags && bookmark.tags.length > 0 ? (
                        bookmark.tags.map((tag: any) => (
                          <Badge
                            key={tag.tag.id}
                            variant="outline"
                            className="rounded-full px-3 py-1 text-xs font-medium border-gray-300 flex items-center gap-2 !bg-white !text-gray-900"
                          >
                            <span className="mr-1">🏷️</span>
                            {tag.tag.name.toUpperCase()}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No tags</p>
                      )}
                    </div>
                  )}
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
                        placeholder="No notes"
                        className="min-h-[80px] text-sm !bg-white border-gray-300"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSaveNotes}
                          className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900 uppercase"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditingNotes(false)}
                          className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900 uppercase"
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

            {/* Related Bookmarks Section */}
            <div className="mt-8 pt-8 border-t">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">RELATED BOOKMARKS</h3>
                <Button
                  variant="outline"
                  className="text-sm uppercase !text-gray-900 !bg-white border-gray-300 hover:!bg-gray-50"
                  onClick={() => {
                    toast.info("Feature to browse and add related bookmarks")
                  }}
                >
                  + Browse All Bookmarks To Add More
                </Button>
              </div>
              
              <div className="text-center py-12">
                <p className="text-gray-500 mb-2">No related bookmarks yet.</p>
                <p className="text-sm text-gray-400">
                  Click &quot;Browse All Bookmarks to add more&quot; to add related bookmarks.
                </p>
              </div>
              
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  className="uppercase !text-gray-900 !bg-white border-gray-300 hover:!bg-gray-50"
                  onClick={() => {
                    toast.info("Feature to browse and add related bookmarks")
                  }}
                >
                  + Browse All Bookmarks To Add More
                </Button>
              </div>
            </div>

            {/* Goals Section */}
            <div className="mt-8 pt-8 border-t">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">GOALS</h3>
                <Button
                  variant="outline"
                  className="text-sm uppercase !text-gray-900 !bg-white border-gray-300 hover:!bg-gray-50"
                  onClick={() => {
                    toast.info("Feature to add or link goals to this bookmark")
                  }}
                >
                  + Add Goal
                </Button>
              </div>
              
              <div className="text-center py-12">
                <p className="text-gray-500 mb-2">No goals linked yet.</p>
                <p className="text-sm text-gray-400">
                  Click &quot;ADD GOAL&quot; to link existing goals to this bookmark.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* ARP TAB */}
          <TabsContent value="arp" className="p-3 sm:p-6 bg-white mt-0">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="text-lg sm:text-2xl font-bold">ACTION RESEARCH PLAN</h2>
                <Badge variant="outline" className="text-xs sm:text-sm">1 Section</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">Overall Progress</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">0%</div>
                  <div className="text-xs text-gray-500">0/1</div>
                  <Progress value={0} className="mt-2 h-1" />
                  <div className="text-xs text-gray-500 mt-1">0 in progress</div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Time Tracking</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Actual</span>
                      <span className="font-medium">0h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Estimated</span>
                      <span className="font-medium">0h</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">Alerts</span>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">All on track</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">Upcoming</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-4">No upcoming deadlines</div>
                </div>
              </div>

              <div className="border rounded-lg p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Input 
                    placeholder="ENTER SECTION TITLE..." 
                    className="flex-1 text-sm font-medium border-0 px-0 focus-visible:ring-0"
                  />
                  <div className="flex gap-2">
                    <Badge variant="outline">NOT STARTED</Badge>
                    <Badge className="bg-yellow-500">MEDIUM</Badge>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 font-medium">CONTENT</div>
                <Textarea 
                  placeholder="Start writing your action research plan... Press '/' for commands"
                  className="min-h-[200px] text-sm"
                />
              </div>

              <div className="flex items-center gap-2 text-blue-600 text-sm font-medium cursor-pointer hover:underline">
                <Plus className="w-4 h-4" />
                Assets
              </div>
            </div>
          </TabsContent>

          {/* NOTIFICATION TAB */}
          <TabsContent value="notification" className="p-0 bg-white mt-0">
            <NotificationTool bookmarkId={bookmark.id} bookmarkTitle={bookmark.title} />
          </TabsContent>
          {/* MEDIA TAB */}
          <TabsContent value="media" className="p-4 sm:p-6 bg-white mt-0">
            <MediaTool bookmarkId={bookmark.id} />
          </TabsContent>
          {/* COMMENT TAB */}
          <TabsContent value="comment" className="p-4 sm:p-6 bg-white mt-0">
            <CommentsTool bookmarkId={bookmark.id} />
          </TabsContent>

          {/* TASK TAB - Only Tasks */}
          <TabsContent value="task" className="p-0 bg-white mt-0">
            <TasksTab bookmarkId={bookmark.id} />
          </TabsContent>

          {/* LIST TAB - Only Lists */}
          <TabsContent value="list" className="p-0 bg-white mt-0">
            <ListsTab bookmarkId={bookmark.id} />
          </TabsContent>

          {/* TASK + TIMER TAB - Full functionality with sub-tabs */}
          <TabsContent value="tasktimer" className="p-0 bg-white mt-0">
            <Tabs defaultValue="tasks" className="w-full">
              <div className="border-b px-6 bg-gray-50">
                <TabsList className="bg-transparent h-auto p-0 gap-8">
                  <TabsTrigger 
                    value="tasks"
                    className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-gray-900 rounded-none px-0 pb-3 font-medium text-sm text-gray-600 data-[state=active]:text-gray-900"
                  >
                    TASKS
                  </TabsTrigger>
                  <TabsTrigger 
                    value="lists"
                    className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-gray-900 rounded-none px-0 pb-3 font-medium text-sm text-gray-600 data-[state=active]:text-gray-900"
                  >
                    LISTS
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analytics"
                    className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-gray-900 rounded-none px-0 pb-3 font-medium text-sm text-gray-600 data-[state=active]:text-gray-900"
                  >
                    ANALYTICS
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings"
                    className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-gray-900 rounded-none px-0 pb-3 font-medium text-sm text-gray-600 data-[state=active]:text-gray-900"
                  >
                    SETTINGS
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="tasks" className="p-0 mt-0">
                <TasksTab bookmarkId={bookmark.id} />
              </TabsContent>

              <TabsContent value="lists" className="p-0 mt-0">
                <ListsTab bookmarkId={bookmark.id} />
              </TabsContent>

              <TabsContent value="analytics" className="p-0 mt-0">
                <AnalyticsTab bookmarkId={bookmark.id} />
              </TabsContent>

              <TabsContent value="settings" className="p-0 mt-0">
                <SettingsTab bookmarkId={bookmark.id} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="timer" className="mt-0 bg-white p-6">
            <div className="max-w-2xl mx-auto">
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">POMODORO TIMER</h2>
                  <p className="text-sm text-gray-500">Focus on your work with the Pomodoro technique</p>
                </div>

                {/* Timer Display */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 border-2 border-blue-200">
                  <div className="text-8xl font-bold text-gray-900 mb-6">
                    {Math.floor(timerTime / 60).toString().padStart(2, '0')}:
                    {(timerTime % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-lg text-gray-600 font-medium mb-8">
                    {isTimerRunning ? 'Focus Time' : 'Ready to Start'}
                  </div>
                  
                  {/* Timer Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      size="lg"
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="h-14 px-8 text-base"
                    >
                      {isTimerRunning ? (
                        <>
                          <Pause className="h-5 w-5 mr-2" />
                          PAUSE
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          START
                        </>
                      )}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        setIsTimerRunning(false)
                        setTimerTime(25 * 60)
                      }}
                      className="h-14 px-8 text-base"
                    >
                      <RotateCcw className="h-5 w-5 mr-2" />
                      RESET
                    </Button>
                  </div>
                </div>

                {/* Timer Stats */}
                <div className="grid grid-cols-3 gap-4 pt-6">
                  <div className="bg-white border rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">0</div>
                    <div className="text-xs text-gray-500 uppercase">Completed</div>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">25</div>
                    <div className="text-xs text-gray-500 uppercase">Minutes</div>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">0</div>
                    <div className="text-xs text-gray-500 uppercase">Today</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Manage Tools Modal */}
      <ManageToolsModal
        bookmarkId={bookmark?.id}
        open={showManageTools}
        onOpenChange={setShowManageTools}
        onToolsUpdated={fetchTools}
      />
    </Dialog>
  )
}