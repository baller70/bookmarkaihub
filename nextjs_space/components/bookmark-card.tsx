
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookmarkDetailModal } from "@/components/bookmark-detail-modal"
import { 
  ExternalLink, 
  Edit, 
  Trash2, 
  Heart,
  Eye,
  Copy,
  Folder,
  Target,
  Clock,
  GripVertical,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface BookmarkCardProps {
  bookmark: any
  compact?: boolean
  onUpdate: () => void
  bulkSelectMode?: boolean
  isSelected?: boolean
  onSelect?: (id: string) => void
}

const priorityColors = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800", 
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
}

export function BookmarkCard({ 
  bookmark, 
  compact = false, 
  onUpdate,
  bulkSelectMode = false,
  isSelected = false,
  onSelect
}: BookmarkCardProps) {
  const [showDetail, setShowDetail] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFavorite, setIsFavorite] = useState(bookmark.isFavorite || false)
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null)

  // Fetch custom logo on mount
  useEffect(() => {
    const fetchCustomLogo = async () => {
      try {
        const response = await fetch('/api/user/custom-logo')
        if (response.ok) {
          const data = await response.json()
          if (data.customLogoUrl) {
            setCustomLogoUrl(data.customLogoUrl)
          }
        }
      } catch (error) {
        console.error('Error fetching custom logo:', error)
      }
    }
    fetchCustomLogo()
  }, [])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bookmark.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this bookmark?")) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        toast.success("Bookmark deleted successfully")
        onUpdate()
      } else {
        toast.error("Failed to delete bookmark")
      }
    } catch (error) {
      console.error("Error deleting bookmark:", error)
      toast.error("Failed to delete bookmark")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleVisit = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(bookmark.url, "_blank")
    toast.success("Opening bookmark in new tab")
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(bookmark.url)
    toast.success("URL copied to clipboard")
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
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
      } else {
        toast.error("Failed to update favorite status")
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast.error("Failed to update favorite status")
    }
  }

  const handleMoveToFolder = async (e: React.MouseEvent) => {
    e.stopPropagation()
    toast.info("Opening folder selector...")
    // This could open a modal to select categories
    setShowDetail(true)
  }

  const handleChangePriority = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]
    const currentIndex = priorities.indexOf(bookmark.priority || "MEDIUM")
    const nextPriority = priorities[(currentIndex + 1) % priorities.length]
    
    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: nextPriority }),
      })
      
      if (response.ok) {
        toast.success(`Priority changed to ${nextPriority}`)
        onUpdate()
      } else {
        toast.error("Failed to update priority")
      }
    } catch (error) {
      console.error("Error changing priority:", error)
      toast.error("Failed to update priority")
    }
  }

  const progress = bookmark.totalTasks > 0 
    ? (bookmark.completedTasks / bookmark.totalTasks) * 100 
    : 0

  return (
    <>
      <Card 
        ref={setNodeRef}
        style={style}
        className={cn(
          "group relative overflow-hidden cursor-pointer transition-all duration-300",
          "border border-black hover:shadow-lg",
          "bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20",
          "rounded-3xl h-[600px] sm:h-[640px]",
          isDeleting && "opacity-50 pointer-events-none",
          isDragging && "opacity-50 z-50"
        )}
        onClick={() => setShowDetail(true)}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-100/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[100px]" />
        </div>

        {/* Background Logo - Faint watermark */}
        {(customLogoUrl || bookmark.favicon) && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <Image
              src={customLogoUrl || bookmark.favicon}
              alt=""
              fill
              className="opacity-[0.05] object-cover"
              style={{ filter: 'grayscale(30%)' }}
              unoptimized
            />
          </div>
        )}

        {/* Bulk Select Checkbox */}
        {bulkSelectMode && (
          <div 
            className="absolute top-3 left-3 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onSelect?.(bookmark.id)}
              className={cn(
                "w-6 h-6 rounded border-2 flex items-center justify-center transition-all",
                isSelected 
                  ? "bg-blue-600 border-blue-600" 
                  : "bg-white border-gray-300 hover:border-blue-500"
              )}
            >
              {isSelected && (
                <Check className="h-4 w-4 text-white" />
              )}
            </button>
          </div>
        )}

        {/* Drag Handle */}
        <div 
          {...attributes}
          {...listeners}
          className="absolute top-3 right-3 z-10 cursor-grab active:cursor-grabbing touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
        </div>

        <div className="relative flex h-full">
          {/* Main Content Area */}
          <div className="flex-1 p-4 sm:p-6 flex flex-col">
            {/* Header with logo and title */}
            <div className="flex items-start space-x-3 sm:space-x-4 mb-3 sm:mb-4">
              {/* Small Header Logo */}
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-black rounded-2xl overflow-hidden shadow-sm">
                {(customLogoUrl || bookmark.favicon) ? (
                  <Image
                    src={customLogoUrl || bookmark.favicon}
                    alt={bookmark.title}
                    fill
                    className="object-cover p-1.5 sm:p-2"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-base sm:text-lg">
                    {bookmark.title?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Title and URL */}
              <div className="flex-1 min-w-0 pt-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5 truncate tracking-tight font-audiowide">
                  {bookmark.title}
                </h3>
                <p className="text-xs sm:text-sm text-blue-600 font-medium truncate font-saira">
                  {bookmark.url?.replace(/^https?:\/\/(www\.)?/, '')}
                </p>
              </div>
            </div>

            {/* LARGE CENTERED MIDDLE LOGO */}
            <div className="flex items-center justify-center my-3 sm:my-4">
              <div className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden ${customLogoUrl ? '' : 'bg-white shadow-lg border-4 border-white'}`}>
                {(customLogoUrl || bookmark.favicon) ? (
                  <Image
                    src={customLogoUrl || bookmark.favicon}
                    alt={bookmark.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl sm:text-4xl font-bold">
                    {bookmark.title?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-700 mb-4 sm:mb-6 line-clamp-3 min-h-[48px] sm:min-h-[60px] leading-5 font-saira">
              {bookmark.description || "No description available"}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              <Badge 
                className={cn(
                  "text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium",
                  priorityColors[bookmark.priority as keyof typeof priorityColors] || "bg-yellow-100 text-yellow-800"
                )}
              >
                {bookmark.priority?.toLowerCase() || "medium"}
              </Badge>
              {bookmark.tags?.slice(0, 1).map((tag: any) => (
                <Badge
                  key={tag.tag.id}
                  className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium"
                  style={{ 
                    backgroundColor: `${tag.tag.color}20`,
                    color: tag.tag.color,
                    border: "none"
                  }}
                >
                  {tag.tag.name}
                </Badge>
              ))}
            </div>

            {/* Stats Row */}
            <div className="flex items-start justify-between mb-3 sm:mb-4 min-h-[60px] sm:min-h-[70px]">
              <div className="flex flex-col space-y-1.5 sm:space-y-2">
                <div className="flex items-center space-x-1.5 sm:space-x-2 bg-green-50/50 rounded-xl px-2 sm:px-3 py-1 sm:py-1.5">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  <span className="text-sm sm:text-base font-bold text-gray-800 font-russo">{bookmark.totalVisits || 0}</span>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400" />
                </div>
                <div className="flex items-center space-x-1.5 sm:space-x-2 bg-green-50/50 rounded-xl px-2 sm:px-3 py-1 sm:py-1.5">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  <span className="text-sm sm:text-base font-bold text-gray-800 font-russo">{bookmark.timeSpent || 0}m</span>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400" />
                </div>
              </div>

              {/* Usage Hexagon */}
              <div className="relative flex flex-col items-center">
                <div className="relative">
                  <svg width="60" height="60" viewBox="0 0 70 70" className="transform sm:w-[70px] sm:h-[70px]">
                    <polygon 
                      points="35,8 58,21 58,49 35,62 12,49 12,21" 
                      fill="none" 
                      stroke="#EF4444" 
                      strokeWidth="2.5"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base sm:text-lg font-bold text-red-500 font-audiowide">
                      {bookmark.usagePercentage?.toFixed(0) || 0}%
                    </span>
                  </div>
                </div>
                <div className="mt-1">
                  <span className="text-[9px] sm:text-[10px] font-bold text-gray-700 tracking-wider font-audiowide">USAGE</span>
                </div>
              </div>
            </div>

            {/* Divider Line */}
            <div className="border-t border-gray-200 mb-2 sm:mb-3"></div>

            {/* Task Stats */}
            <div className="space-y-2 sm:space-y-2.5 mb-2 sm:mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-russo text-slate-800">OPEN TASK</span>
                <span className="text-xs sm:text-sm text-gray-500 font-saira">TOTAL: {bookmark.openTasks || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-russo text-slate-800">COMPLETED TASK</span>
                <span className="text-xs sm:text-sm text-gray-500 font-saira">TOTAL: {bookmark.completedTasks || 0}</span>
              </div>
            </div>

            {/* Progress Section at the bottom */}
            <div className="py-1.5 sm:py-2 space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-500 font-saira uppercase">PROGRESS</span>
                <span className="text-xs sm:text-sm font-bold text-green-500 font-saira">{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                <div 
                  className="bg-green-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-2.5 px-2 sm:px-2.5 py-4 sm:py-6 border-l border-gray-200/50 bg-gradient-to-b from-gray-50/50 to-transparent">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-red-50 transition-colors touch-target",
                isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"
              )}
              onClick={handleToggleFavorite}
              title="Toggle Favorite"
            >
              <Heart className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", isFavorite && "fill-current")} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors touch-target"
              onClick={handleVisit}
              title="Visit URL"
            >
              <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-yellow-50 text-gray-400 hover:text-yellow-500 transition-colors touch-target"
              onClick={(e) => {
                e.stopPropagation()
                setShowDetail(true)
              }}
              title="Edit Bookmark"
            >
              <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-green-50 text-gray-400 hover:text-green-500 transition-colors touch-target"
              onClick={handleCopy}
              title="Copy URL"
            >
              <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors touch-target"
              onClick={handleDelete}
              title="Delete Bookmark"
            >
              <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-purple-50 text-gray-400 hover:text-purple-500 transition-colors touch-target"
              onClick={handleMoveToFolder}
              title="Move to Folder"
            >
              <Folder className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-indigo-50 text-gray-400 hover:text-indigo-500 transition-colors touch-target"
              onClick={handleChangePriority}
              title="Change Priority"
            >
              <Target className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Bookmark Detail Modal */}
      <BookmarkDetailModal
        bookmark={bookmark}
        open={showDetail}
        onOpenChange={setShowDetail}
        onUpdate={onUpdate}
      />
    </>
  )
}
