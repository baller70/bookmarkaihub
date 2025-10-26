
"use client"

import { useState } from "react"
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
  GripVertical
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface BookmarkCardProps {
  bookmark: any
  compact?: boolean
  onUpdate: () => void
}

const priorityColors = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800", 
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
}

export function BookmarkCard({ bookmark, compact = false, onUpdate }: BookmarkCardProps) {
  const [showDetail, setShowDetail] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFavorite, setIsFavorite] = useState(bookmark.isFavorite || false)

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
          "border border-gray-200/80 hover:shadow-lg",
          "bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20",
          "rounded-3xl h-[640px]",
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
          <div className="flex-1 p-6 flex flex-col">
            {/* Header with logo and title */}
            <div className="flex items-start space-x-4 mb-4">
              {/* Logo */}
              <div className="relative w-16 h-16 flex-shrink-0 bg-black rounded-2xl overflow-hidden shadow-sm">
                {bookmark.favicon ? (
                  <Image
                    src={bookmark.favicon}
                    alt={bookmark.title}
                    fill
                    className="object-cover p-2"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                    {bookmark.title?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Title and URL */}
              <div className="flex-1 min-w-0 pt-1">
                <h3 className="text-lg font-bold text-gray-900 mb-0.5 truncate tracking-tight font-audiowide">
                  {bookmark.title}
                </h3>
                <p className="text-sm text-blue-600 font-medium truncate font-saira">
                  {bookmark.url?.replace(/^https?:\/\/(www\.)?/, '')}
                </p>
              </div>
            </div>

            {/* Center Image */}
            <div className="flex items-center justify-center my-4">
              <div className="relative w-32 h-32 bg-white rounded-3xl shadow-lg overflow-hidden border-4 border-white">
                {bookmark.favicon ? (
                  <Image
                    src={bookmark.favicon}
                    alt={bookmark.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl font-bold">
                    {bookmark.title?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 mb-4 line-clamp-2 h-10 leading-5 font-saira">
              {bookmark.description || "No description available"}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge 
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg font-medium",
                  priorityColors[bookmark.priority as keyof typeof priorityColors] || "bg-yellow-100 text-yellow-800"
                )}
              >
                {bookmark.priority?.toLowerCase() || "medium"}
              </Badge>
              {bookmark.tags?.slice(0, 1).map((tag: any) => (
                <Badge
                  key={tag.tag.id}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium"
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
            <div className="flex items-start justify-between mb-4 min-h-[70px]">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2 bg-green-50/50 rounded-xl px-3 py-1.5">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <span className="text-base font-bold text-gray-800 font-russo">{bookmark.visits || 13}</span>
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <div className="flex items-center space-x-2 bg-green-50/50 rounded-xl px-3 py-1.5">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-base font-bold text-gray-800 font-russo">{bookmark.timeSpent || 13}m</span>
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
              </div>

              {/* Usage Hexagon */}
              <div className="relative flex flex-col items-center">
                <div className="relative">
                  <svg width="70" height="70" viewBox="0 0 70 70" className="transform">
                    <polygon 
                      points="35,8 58,21 58,49 35,62 12,49 12,21" 
                      fill="none" 
                      stroke="#EF4444" 
                      strokeWidth="2.5"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-red-500 font-audiowide">
                      {bookmark.usagePercentage?.toFixed(0) || 95}%
                    </span>
                  </div>
                </div>
                <div className="mt-1">
                  <span className="text-[10px] font-bold text-gray-700 tracking-wider font-audiowide">USAGE</span>
                </div>
              </div>
            </div>

            {/* Task Stats */}
            <div className="space-y-2.5 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-russo text-slate-800">OPEN TASK</span>
                <span className="text-sm text-gray-500 font-saira">TOTAL: {bookmark.openTasks || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-russo text-slate-800">COMPLETED TASK</span>
                <span className="text-sm text-gray-500 font-saira">TOTAL: {bookmark.completedTasks || 0}</span>
              </div>
            </div>

            {/* Progress - Now at the bottom */}
            <div className="flex items-center justify-between py-2 border-t border-gray-200">
              <span className="text-sm text-gray-500 font-saira uppercase">PROGRESS</span>
              <span className="text-sm font-bold text-green-500 font-saira">{progress.toFixed(0)}%</span>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex flex-col items-center justify-center space-y-2.5 px-2.5 py-6 border-l border-gray-200/50 bg-gradient-to-b from-gray-50/50 to-transparent">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 rounded-full hover:bg-red-50 transition-colors",
                isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"
              )}
              onClick={handleToggleFavorite}
              title="Toggle Favorite"
            >
              <Heart className={cn("h-3.5 w-3.5", isFavorite && "fill-current")} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
              onClick={handleVisit}
              title="Visit URL"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-yellow-50 text-gray-400 hover:text-yellow-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setShowDetail(true)
              }}
              title="Edit Bookmark"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-green-50 text-gray-400 hover:text-green-500 transition-colors"
              onClick={handleCopy}
              title="Copy URL"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              onClick={handleDelete}
              title="Delete Bookmark"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-purple-50 text-gray-400 hover:text-purple-500 transition-colors"
              onClick={handleMoveToFolder}
              title="Move to Folder"
            >
              <Folder className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-indigo-50 text-gray-400 hover:text-indigo-500 transition-colors"
              onClick={handleChangePriority}
              title="Change Priority"
            >
              <Target className="h-3.5 w-3.5" />
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
