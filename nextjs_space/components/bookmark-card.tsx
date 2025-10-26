
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
  Star, 
  MoreHorizontal,
  Clock,
  TrendingUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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
    
    // Track visit (optional - could call analytics API)
  }

  const progress = bookmark.totalTasks > 0 
    ? (bookmark.completedTasks / bookmark.totalTasks) * 100 
    : 0

  return (
    <>
      <Card 
        className={cn(
          "group relative overflow-hidden cursor-pointer transition-all duration-500",
          "border border-gray-200 hover:border-blue-300 hover:shadow-xl",
          "bg-white",
          compact ? "h-32" : "h-64",
          isDeleting && "opacity-50 pointer-events-none"
        )}
        onClick={() => setShowDetail(true)}
      >
        {/* Background Image/Favicon */}
        <div className="absolute inset-0">
          {bookmark.favicon && (
            <div className="relative w-full h-full">
              <Image
                src={bookmark.favicon}
                alt={bookmark.title}
                fill
                className="object-cover opacity-10 blur-sm"
                unoptimized
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/60 to-white/30" />
        </div>

        {/* Content */}
        <div className="relative h-full p-4 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              {bookmark.favicon && (
                <div className="relative w-6 h-6 flex-shrink-0">
                  <Image
                    src={bookmark.favicon}
                    alt=""
                    fill
                    className="object-contain rounded"
                    unoptimized
                  />
                </div>
              )}
              <Badge 
                variant="secondary"
                className={cn("text-xs", priorityColors[bookmark.priority as keyof typeof priorityColors])}
              >
                {bookmark.priority?.toLowerCase()}
              </Badge>
            </div>

            {/* Action buttons (visible on hover) */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVisit}
                className="h-7 w-7 p-0 hover:bg-blue-100"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-7 w-7 p-0 hover:bg-red-100"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Title */}
          <h3 className={cn(
            "font-bold text-gray-900 mb-2 bookmark-title",
            compact ? "text-sm line-clamp-1" : "text-base line-clamp-2"
          )}>
            {bookmark.title}
          </h3>

          {!compact && (
            <>
              {/* URL */}
              <p className="text-xs text-gray-500 mb-2 truncate">
                {bookmark.url}
              </p>

              {/* Description */}
              {bookmark.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
                  {bookmark.description}
                </p>
              )}

              {/* Tags */}
              {bookmark.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {bookmark.tags.slice(0, 3).map((tag: any) => (
                    <Badge
                      key={tag.tag.id}
                      variant="outline"
                      className="text-xs px-2 py-0"
                      style={{ 
                        backgroundColor: `${tag.tag.color}15`,
                        borderColor: tag.tag.color,
                        color: tag.tag.color 
                      }}
                    >
                      {tag.tag.name}
                    </Badge>
                  ))}
                  {bookmark.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      +{bookmark.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="space-y-2 mt-auto">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {bookmark.usagePercentage?.toFixed(1)}%
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {bookmark.timeSpent}m
                    </span>
                  </div>
                  <span>
                    {bookmark.openTasks}/{bookmark.completedTasks}/{bookmark.totalTasks}
                  </span>
                </div>

                {/* Progress Bar */}
                {bookmark.totalTasks > 0 && (
                  <Progress value={progress} className="h-1" />
                )}
              </div>
            </>
          )}
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
