
"use client"

import { useState } from "react"
import { Star, ExternalLink, MoreVertical, Trash2, Edit, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { BookmarkDetailModal } from "@/components/bookmark-detail-modal"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  faviconUrl?: string
  imageUrl?: string
  isFavorite: boolean
  priority?: string
  category?: {
    id: string
    name: string
    color: string
  }
  tags?: Array<{
    id: string
    name: string
  }>
  createdAt: string
  lastVisited?: string
}

interface BookmarkCompactProps {
  bookmarks: Bookmark[]
  onUpdate: () => void
}

export function BookmarkCompact({ bookmarks, onUpdate }: BookmarkCompactProps) {
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleBookmarkClick = (bookmark: Bookmark) => {
    setSelectedBookmark(bookmark)
    setIsDetailModalOpen(true)
  }

  const handleToggleFavorite = async (bookmark: Bookmark, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !bookmark.isFavorite }),
      })

      if (response.ok) {
        toast.success(bookmark.isFavorite ? "Removed from favorites" : "Added to favorites")
        onUpdate()
      } else {
        toast.error("Failed to update favorite status")
      }
    } catch (error) {
      toast.error("Failed to update favorite status")
    }
  }

  const handleDelete = async (bookmarkId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this bookmark?")) return

    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Bookmark deleted")
        onUpdate()
      } else {
        toast.error("Failed to delete bookmark")
      }
    } catch (error) {
      toast.error("Failed to delete bookmark")
    }
  }

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "")
    } catch {
      return url
    }
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diffInHours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) return `${diffInDays}d ago`
    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) return `${diffInMonths}mo ago`
    return `${Math.floor(diffInMonths / 12)}y ago`
  }

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ExternalLink className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">NO BOOKMARKS FOUND</h3>
        <p className="text-gray-500">Add your first bookmark to get started</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="group relative bg-white border border-gray-200 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300"
            onClick={() => handleBookmarkClick(bookmark)}
          >
            {/* Header Row */}
            <div className="flex items-start gap-2 mb-2">
              {/* Favicon */}
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                {bookmark.faviconUrl ? (
                  <Image
                    src={bookmark.faviconUrl}
                    alt=""
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                ) : (
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                )}
              </div>

              {/* Title and Actions */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-0.5">
                  {bookmark.title}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {getDomain(bookmark.url)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                    bookmark.isFavorite && "opacity-100"
                  )}
                  onClick={(e) => handleToggleFavorite(bookmark, e)}
                >
                  <Star
                    className={cn(
                      "h-3.5 w-3.5",
                      bookmark.isFavorite
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-400"
                    )}
                  />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-3.5 w-3.5 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(bookmark.url, "_blank")
                      }}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Link
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBookmarkClick(bookmark)
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => handleDelete(bookmark.id, e)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Description */}
            {bookmark.description && (
              <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                {bookmark.description}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100">
              {/* Category & Tags */}
              <div className="flex items-center gap-1 flex-wrap min-w-0">
                {bookmark.category && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-5 font-medium"
                    style={{
                      borderColor: bookmark.category.color,
                      color: bookmark.category.color,
                    }}
                  >
                    {bookmark.category.name}
                  </Badge>
                )}
                {bookmark.priority && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-1.5 py-0 h-5 font-medium",
                      bookmark.priority === "HIGH" && "border-red-500 text-red-500",
                      bookmark.priority === "MEDIUM" && "border-yellow-500 text-yellow-500",
                      bookmark.priority === "LOW" && "border-green-500 text-green-500"
                    )}
                  >
                    {bookmark.priority}
                  </Badge>
                )}
              </div>

              {/* Time */}
              <div className="flex items-center gap-1 text-[10px] text-gray-400 flex-shrink-0">
                <Clock className="w-3 h-3" />
                <span>{getTimeAgo(bookmark.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedBookmark && (
        <BookmarkDetailModal
          bookmark={selectedBookmark}
          open={isDetailModalOpen}
          onOpenChange={(open) => {
            setIsDetailModalOpen(open)
            if (!open) setSelectedBookmark(null)
          }}
          onUpdate={onUpdate}
        />
      )}
    </>
  )
}
