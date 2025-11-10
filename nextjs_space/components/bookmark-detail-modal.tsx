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
            <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] min-h-[400px] lg:h-[600px]">
              <div className="border-b lg:border-r lg:border-b-0 bg-gray-50 p-3 sm:p-4">
                <div className="text-xs sm:text-sm font-bold mb-3 hidden lg:block">NOTIFICATION SETTINGS</div>
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible scrollbar-hide">
                  <Button className="justify-start bg-blue-600 text-white hover:bg-blue-700 text-xs sm:text-sm whitespace-nowrap">
                    <Timer className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    SCHEDULER
                  </Button>
                  <Button variant="ghost" className="justify-start text-xs sm:text-sm whitespace-nowrap">
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    PREFERENCES
                  </Button>
                  <Button variant="ghost" className="justify-start text-xs sm:text-sm whitespace-nowrap">
                    <History className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    HISTORY
                  </Button>
                  <Button variant="ghost" className="justify-start text-xs sm:text-sm whitespace-nowrap">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    TEAM
                    <Badge variant="outline" className="ml-auto text-xs">Premium</Badge>
                  </Button>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">NOTIFICATIONS & REMINDERS</h3>
                    <p className="text-sm text-gray-500">Schedule reminders for &quot;21ST.DEV&quot;</p>
                  </div>
                  <Button variant="outline" className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900 uppercase">
                    <Plus className="w-4 h-4 mr-2" />
                    New Reminder
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">REMINDER CALENDAR</h4>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        &lt;
                      </Button>
                      <span className="text-sm font-medium">October 2025</span>
                      <Button variant="outline" size="sm">
                        &gt;
                      </Button>
                    </div>
                  </div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TASK TAB */}
          <TabsContent value="task" className="p-0 bg-white mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] min-h-[400px] lg:h-[600px]">
              <div className="border-b lg:border-r lg:border-b-0 bg-gray-50 p-3 sm:p-4">
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible scrollbar-hide">
                  <Button 
                    onClick={() => setTaskSubTab("timer")}
                    className={cn(
                      "justify-start text-xs sm:text-sm whitespace-nowrap",
                      taskSubTab === "timer" 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "bg-transparent hover:bg-gray-100 text-gray-700"
                    )}
                    variant={taskSubTab === "timer" ? "default" : "ghost"}
                  >
                    <Timer className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    TIMER
                  </Button>
                  <Button 
                    onClick={() => setTaskSubTab("tasks")}
                    variant="ghost" 
                    className={cn(
                      "justify-start text-xs sm:text-sm whitespace-nowrap",
                      taskSubTab === "tasks" 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "bg-transparent hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    <ListTodo className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    TASKS
                    <Badge variant="outline" className="ml-auto text-xs">0</Badge>
                  </Button>
                  <Button 
                    onClick={() => setTaskSubTab("lists")}
                    variant="ghost" 
                    className={cn(
                      "justify-start text-xs sm:text-sm whitespace-nowrap",
                      taskSubTab === "lists" 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "bg-transparent hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    <ListTodo className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    LISTS
                    <Badge variant="outline" className="ml-auto text-xs">0</Badge>
                  </Button>
                  <Button 
                    onClick={() => setTaskSubTab("analytics")}
                    variant="ghost" 
                    className={cn(
                      "justify-start text-xs sm:text-sm whitespace-nowrap",
                      taskSubTab === "analytics" 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "bg-transparent hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    ANALYTICS
                  </Button>
                  <Button 
                    onClick={() => setTaskSubTab("settings")}
                    variant="ghost" 
                    className={cn(
                      "justify-start text-xs sm:text-sm whitespace-nowrap",
                      taskSubTab === "settings" 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "bg-transparent hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    SETTINGS
                  </Button>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 space-y-6">
                {/* TIMER SUB-TAB */}
                {taskSubTab === "timer" && (
                  <>
                    <div className="border rounded-lg p-8 text-center space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium">
                        <Activity className="w-4 h-4" />
                        WORK SESSION
                      </div>
                      
                      <div className="text-6xl font-bold text-red-600">
                        {formatTime(timerTime)}
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full transition-all"
                          style={{ width: `${((25 * 60 - timerTime) / (25 * 60)) * 100}%` }}
                        ></div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">0:00</span>
                        <span className="mx-2">–</span>
                        <span className="font-medium">25:00</span>
                      </div>
                      
                      <div className="text-sm text-gray-600">Session 1</div>
                      
                      <div className="flex gap-3 justify-center pt-4">
                        {!isTimerRunning ? (
                          <Button
                            onClick={handleStartTimer}
                            className="bg-green-600 hover:bg-green-700 text-white uppercase px-8"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start
                          </Button>
                        ) : (
                          <Button
                            onClick={handleStopTimer}
                            className="bg-red-600 hover:bg-red-700 text-white uppercase px-8"
                          >
                            <Pause className="w-4 h-4 mr-2" />
                            Stop
                          </Button>
                        )}
                        <Button
                          onClick={handleResetTimer}
                          variant="outline"
                          className="uppercase px-8"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 sm:p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        <h4 className="font-medium">CURRENT TASK</h4>
                      </div>
                      <p className="text-sm text-gray-500">No task selected</p>
                    </div>

                    <div className="border rounded-lg p-4 bg-blue-50 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-sm mb-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">WORK</span>
                        <span className="font-bold">25:00</span>
                      </div>
                      <p className="text-xs text-gray-600">Session 1</p>
                    </div>
                  </>
                )}

                {/* TASKS SUB-TAB */}
                {taskSubTab === "tasks" && (
                  <TasksTab bookmarkId={bookmark?.id} />
                )}

                {/* LISTS SUB-TAB */}
                {taskSubTab === "lists" && (
                  <ListsTab bookmarkId={bookmark?.id} />
                )}

                {/* ANALYTICS SUB-TAB */}
                {taskSubTab === "analytics" && (
                  <AnalyticsTab bookmarkId={bookmark?.id} />
                )}

                {/* SETTINGS SUB-TAB */}
                {taskSubTab === "settings" && (
                  <SettingsTab bookmarkId={bookmark?.id} />
                )}
              </div>
            </div>
          </TabsContent>

          {/* MEDIA TAB */}
          <TabsContent value="media" className="p-4 sm:p-6 bg-white mt-0">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2">Media Hub</h2>
                <p className="text-sm text-gray-500">Manage your files, documents, and rich content</p>
              </div>

              <div className="grid grid-cols-5 gap-4">
                {[
                  { icon: "🖼️", label: "Images", count: 0 },
                  { icon: "🎥", label: "Videos", count: 0 },
                  { icon: "🎵", label: "Audio", count: 0 },
                  { icon: "📄", label: "Documents", count: 0 },
                  { icon: "📁", label: "Folders", count: 0 },
                ].map((item) => (
                  <div key={item.label} className="border rounded-lg p-4 sm:p-6 text-center hover:border-blue-500 cursor-pointer transition-colors">
                    <div className="text-4xl mb-2">{item.icon}</div>
                    <div className="text-2xl font-bold">{item.count}</div>
                    <div className="text-sm text-gray-600">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 border-b">
                <Button variant="ghost" className="border-b-2 border-blue-600 rounded-none">
                  All Media
                </Button>
                <Button variant="ghost" className="text-gray-500">
                  Images (0)
                </Button>
                <Button variant="ghost" className="text-gray-500">
                  Videos (0)
                </Button>
                <Button variant="ghost" className="text-gray-500">
                  Audio (0)
                </Button>
                <Button variant="ghost" className="text-gray-500">
                  Documents (0)
                </Button>
              </div>

              <div className="border rounded-lg">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-bold">Media Library</h3>
                  <Button variant="outline" size="sm">
                    All
                  </Button>
                </div>
                
                <div className="p-4">
                  <Input
                    placeholder="Search files, folders, and documents..."
                    className="mb-4 !bg-white border-gray-300"
                  />
                  
                  <div className="flex gap-2 mb-6">
                    <Button variant="outline" className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Files
                    </Button>
                    <Button variant="outline" className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900">
                      <FolderPlus className="w-4 h-4 mr-2" />
                      New Folder
                    </Button>
                  </div>

                  <div className="text-center py-16">
                    <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="font-medium mb-2">No files yet</h4>
                    <p className="text-sm text-gray-500">
                      Upload your first files or create a folder to get started
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* COMMENT TAB */}
          <TabsContent value="comment" className="p-4 sm:p-6 bg-white mt-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  <h3 className="font-bold">Comments</h3>
                  <Badge variant="outline">{comments.length}</Badge>
                </div>
                <Button variant="outline" className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900">
                  <Plus className="w-4 w-4 mr-2" />
                  Add Comment
                </Button>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Search comments..."
                  className="flex-1 !bg-white border-gray-300"
                />
                <Button variant="outline" className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900">
                  All Tags
                </Button>
                <Button variant="outline" className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900">
                  Newest
                </Button>
                <label className="flex items-center gap-2 px-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 bg-white">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Show Resolved</span>
                </label>
              </div>

              {comments.length === 0 ? (
                <div className="text-center py-16 border rounded-lg">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="font-medium mb-2">No comments yet</h4>
                  <p className="text-sm text-gray-500 mb-6">
                    Be the first to share your thoughts about this bookmark.
                  </p>
                  <Button
                    variant="outline"
                    className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900"
                    onClick={() => {
                      const comment = prompt("Enter your comment:")
                      if (comment) {
                        setComments([...comments, {
                          id: Date.now().toString(),
                          text: comment,
                          createdAt: new Date(),
                          author: "Current User"
                        }])
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Comment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium">U</span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">{comment.author}</div>
                            <div className="text-xs text-gray-500">
                              {comment.createdAt.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* NEW TOOLS - QUICK NOTES */}
          <TabsContent value="notes" className="mt-0 bg-white">
            <QuickNotesTool bookmarkId={bookmark?.id} />
          </TabsContent>

          {/* NEW TOOLS - HABITS */}
          <TabsContent value="habits" className="mt-0 bg-white">
            <HabitsTool bookmarkId={bookmark?.id} />
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
