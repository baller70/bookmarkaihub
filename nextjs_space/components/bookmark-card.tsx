
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
  Clock
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
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(bookmark.url)
    toast.success("URL copied to clipboard")
  }

  const progress = bookmark.totalTasks > 0 
    ? (bookmark.completedTasks / bookmark.totalTasks) * 100 
    : 0

  return (
    <>
      <Card 
        className={cn(
          "group relative overflow-hidden cursor-pointer transition-all duration-300",
          "border border-gray-200/80 hover:shadow-lg",
          "bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20",
          "rounded-3xl h-[640px]",
          isDeleting && "opacity-50 pointer-events-none"
        )}
        onClick={() => setShowDetail(true)}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-100/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[100px]" />
        </div>

        <div className="relative flex h-full">
          {/* Main Content Area */}
          <div className="flex-1 p-5 flex flex-col">
            {/* Header with logo and title */}
            <div className="flex items-start space-x-3 mb-3">
              {/* Logo */}
              <div className="relative w-14 h-14 flex-shrink-0 bg-black rounded-2xl overflow-hidden shadow-sm">
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
            <div className="flex items-center justify-center my-3">
              <div className="relative w-36 h-36 bg-white rounded-3xl shadow-lg overflow-hidden border-4 border-white">
                {bookmark.favicon ? (
                  <Image
                    src={bookmark.favicon}
                    alt={bookmark.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-5xl font-bold">
                    {bookmark.title?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 mb-3 line-clamp-2 h-10 leading-5 font-saira">
              {bookmark.description || "No description available"}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
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
            <div className="flex items-start justify-between mb-3 min-h-[70px]">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2 bg-green-50/50 rounded-xl px-3 py-1.5">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <span className="text-base font-bold text-gray-800 font-audiowide">{bookmark.visits || 13}</span>
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <div className="flex items-center space-x-2 bg-green-50/50 rounded-xl px-3 py-1.5">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-base font-bold text-gray-800 font-audiowide">{bookmark.timeSpent || 13}m</span>
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
                    <span className="text-2xl font-bold text-red-500 font-audiowide">
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
            <div className="space-y-1.5 mb-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-800 font-audiowide">OPEN TASK</span>
                <span className="text-gray-600 font-medium font-saira">TOTAL: {bookmark.openTasks || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-800 font-audiowide">COMPLETED TASK</span>
                <span className="text-gray-600 font-medium font-saira">TOTAL: {bookmark.completedTasks || 0}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1 mt-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 font-saira">Progress</span>
                <span className="text-xs font-bold text-green-600 font-audiowide">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-gray-200" />
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex flex-col items-center justify-center space-y-2.5 px-2.5 py-6 border-l border-gray-200/50 bg-gradient-to-b from-gray-50/50 to-transparent">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Heart className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
              onClick={handleVisit}
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
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-green-50 text-gray-400 hover:text-green-500 transition-colors"
              onClick={handleCopy}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-purple-50 text-gray-400 hover:text-purple-500 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Folder className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-indigo-50 text-gray-400 hover:text-indigo-500 transition-colors"
              onClick={(e) => e.stopPropagation()}
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
