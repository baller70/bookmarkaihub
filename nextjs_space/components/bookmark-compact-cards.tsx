
"use client"

import { useState } from "react"
import Image from "next/image"
import { ExternalLink, Star, MoreVertical, Share2, Copy, Trash2, Edit, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { BookmarkDetailModal } from "@/components/bookmark-detail-modal"

interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  faviconUrl?: string
  previewImage?: string
  tags?: Array<{ id: string; name: string; color: string }>
  categories?: Array<{ id: string; name: string; color: string }>
  isFavorite?: boolean
  priority?: string
  visits?: number
  completionPercentage?: number
  createdAt: string
  updatedAt: string
}

interface BookmarkCompactCardsProps {
  bookmarks: Bookmark[]
  onUpdate: () => void
}

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
}

const priorityLabels: Record<string, string> = {
  high: "high",
  medium: "medium",
  low: "low",
}

export function BookmarkCompactCards({ bookmarks, onUpdate }: BookmarkCompactCardsProps) {
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const handleBookmarkClick = (bookmark: Bookmark) => {
    setSelectedBookmark(bookmark)
    setShowDetailModal(true)
  }

  const handleToggleFavorite = async (e: React.MouseEvent, bookmarkId: string, currentState: boolean) => {
    e.stopPropagation()
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !currentState }),
      })
      if (response.ok) {
        toast.success(currentState ? "Removed from favorites" : "Added to favorites")
        onUpdate()
      }
    } catch (error) {
      toast.error("Failed to update favorite status")
    }
  }

  const handleCopyUrl = async (e: React.MouseEvent, url: string) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(url)
      toast.success("URL copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy URL")
    }
  }

  const handleDelete = async (e: React.MouseEvent, bookmarkId: string) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this bookmark?")) return
    
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success("Bookmark deleted")
        onUpdate()
      }
    } catch (error) {
      toast.error("Failed to delete bookmark")
    }
  }

  const getCompletionBadge = (percentage: number) => {
    let bgColor = "bg-red-50"
    let textColor = "text-red-600"
    let borderColor = "border-red-200"

    if (percentage >= 75) {
      bgColor = "bg-green-50"
      textColor = "text-green-600"
      borderColor = "border-green-200"
    } else if (percentage >= 50) {
      bgColor = "bg-yellow-50"
      textColor = "text-yellow-600"
      borderColor = "border-yellow-200"
    } else if (percentage >= 25) {
      bgColor = "bg-orange-50"
      textColor = "text-orange-600"
      borderColor = "border-orange-200"
    }

    return (
      <div className={`absolute top-3 right-3 flex items-center justify-center w-10 h-10 rounded-lg border-2 ${bgColor} ${textColor} ${borderColor}`}>
        <span className="text-xs font-bold">{percentage}%</span>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {bookmarks.map((bookmark) => {
          const priority = bookmark.priority?.toLowerCase() || "medium"
          const completion = bookmark.completionPercentage || 0
          const visits = bookmark.visits || 0

          return (
            <div
              key={bookmark.id}
              className="relative bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 group flex flex-col min-h-[220px]"
              onClick={() => handleBookmarkClick(bookmark)}
            >
              {/* Top Section: Small Favicon & Completion Badge */}
              <div className="relative mb-3">
                <div className="w-8 h-8 relative rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                  {bookmark.faviconUrl ? (
                    <Image
                      src={bookmark.faviconUrl}
                      alt={bookmark.title}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                {getCompletionBadge(completion)}
              </div>

              {/* Title */}
              <div className="mb-1">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide line-clamp-1">
                  {bookmark.title}
                </h3>
              </div>

              {/* URL */}
              <div className="mb-2">
                <p className="text-xs text-blue-600 line-clamp-1">
                  {bookmark.url.replace(/^https?:\/\/(www\.)?/, '')}
                </p>
              </div>

              {/* Priority Badge */}
              <div className="mb-3">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${priorityColors[priority] || priorityColors.medium}`}>
                  {priorityLabels[priority] || "medium"}
                </span>
              </div>

              {/* Large Logo/Preview Section */}
              <div className="flex-1 flex items-center justify-center mb-3 min-h-[80px]">
                {bookmark.previewImage ? (
                  <div className="relative w-full h-20">
                    <Image
                      src={bookmark.previewImage}
                      alt={bookmark.title}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : bookmark.faviconUrl ? (
                  <div className="relative w-16 h-16">
                    <Image
                      src={bookmark.faviconUrl}
                      alt={bookmark.title}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                    <ExternalLink className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Visit Count */}
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Eye className="w-3 h-3" />
                <span className="font-medium uppercase">
                  {visits} VISIT{visits !== 1 ? 'S' : ''} •
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bookmark Detail Modal */}
      {selectedBookmark && (
        <BookmarkDetailModal
          bookmark={selectedBookmark}
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
          onUpdate={() => {
            onUpdate()
            setShowDetailModal(false)
          }}
        />
      )}
    </>
  )
}
