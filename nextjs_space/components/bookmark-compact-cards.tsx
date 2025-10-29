
"use client"

import { useState } from "react"
import { Eye, ExternalLink, Star, Trash2, Edit } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { BookmarkDetailModal } from "./bookmark-detail-modal"

interface Bookmark {
  id: string
  title: string
  url: string
  description?: string | null
  favicon?: string | null
  priority?: string | null
  isFavorite: boolean
  visitCount: number
  category?: {
    id: string
    name: string
    color: string
  } | null
  tags?: Array<{ id: string; name: string }> | null
  createdAt: string
}

interface BookmarkCompactCardsProps {
  bookmarks: Bookmark[]
  onUpdate: () => void
}

const priorityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200",
}

export function BookmarkCompactCards({ bookmarks, onUpdate }: BookmarkCompactCardsProps) {
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this bookmark?")) return

    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error("Error deleting bookmark:", error)
    }
  }

  const toggleFavorite = async (bookmark: Bookmark, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !bookmark.isFavorite }),
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  const openDetailModal = (bookmark: Bookmark) => {
    setSelectedBookmark(bookmark)
    setIsDetailModalOpen(true)
  }

  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace("www.", "")
      return domain
    } catch {
      return url
    }
  }

  // Calculate engagement percentage (simplified version)
  const getEngagementPercentage = (visitCount: number) => {
    // Simple calculation: cap at 100%
    return Math.min(visitCount * 5, 100)
  }

  if (!bookmarks?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ExternalLink className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks found</h3>
        <p className="text-gray-500">Add bookmarks to this category to get started</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {bookmarks.map((bookmark) => {
          const domain = getDomain(bookmark.url)
          const engagementPct = getEngagementPercentage(bookmark.visitCount)

          return (
            <div
              key={bookmark.id}
              className="relative bg-white border border-black rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-black group aspect-square flex flex-col"
              onClick={() => openDetailModal(bookmark)}
            >
              {/* Top Section */}
              <div className="relative p-4 pb-2 flex items-start justify-between z-10">
                {/* Favicon - Smaller */}
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {bookmark.favicon ? (
                    <Image
                      src={bookmark.favicon}
                      alt={bookmark.title}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Engagement Badge */}
                <div className="relative">
                  <svg width="40" height="44" viewBox="0 0 40 44" className="text-red-500">
                    <path
                      d="M20 2 L35 11 L35 29 L20 38 L5 29 L5 11 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-red-500">
                      {engagementPct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Section - Title and URL */}
              <div className="px-4 py-2 flex-shrink-0 z-10 relative">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide line-clamp-1 leading-tight mb-1">
                  {bookmark.title}
                </h3>
                <p className="text-xs text-blue-600 truncate mb-2">
                  {domain}
                </p>
                {bookmark.priority && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-2 py-0.5 font-medium uppercase",
                      priorityColors[bookmark.priority.toLowerCase()] || priorityColors.medium
                    )}
                  >
                    {bookmark.priority}
                  </Badge>
                )}
              </div>

              {/* Large Background Logo - Much bigger and covers most of the card */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-20">
                {bookmark.favicon ? (
                  <Image
                    src={bookmark.favicon}
                    alt={bookmark.title}
                    width={300}
                    height={300}
                    className="w-64 h-64 object-contain"
                  />
                ) : (
                  <ExternalLink className="w-40 h-40 text-gray-300" />
                )}
              </div>

              {/* Bottom Right Logo - Moved to corner */}
              <div className="absolute bottom-3 right-3 w-16 h-16 bg-white rounded-xl border-2 border-gray-200 flex items-center justify-center overflow-hidden z-10">
                {bookmark.favicon ? (
                  <Image
                    src={bookmark.favicon}
                    alt={bookmark.title}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ExternalLink className="w-8 h-8 text-gray-400" />
                )}
              </div>

              {/* Bottom Section - Visits */}
              <div className="relative mt-auto px-4 pb-4 pt-2 z-10">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                  <Eye className="w-3 h-3" />
                  <span className="font-medium uppercase tracking-wide">
                    {bookmark.visitCount} VISIT{bookmark.visitCount !== 1 ? 'S' : ''}
                  </span>
                  <span className="text-green-500">●</span>
                </div>
              </div>

              {/* Hover Actions - Top Right Dropdown */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 bg-white/90 hover:bg-white shadow-sm"
                    >
                      <svg
                        className="w-3.5 h-3.5 text-gray-600"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <circle cx="5" cy="5" r="1.5" />
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="5" cy="12" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="5" cy="19" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(bookmark.url, "_blank")
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => toggleFavorite(bookmark, e)}>
                      <Star
                        className={cn(
                          "w-4 h-4 mr-2",
                          bookmark.isFavorite && "fill-yellow-400 text-yellow-400"
                        )}
                      />
                      {bookmark.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        openDetailModal(bookmark)
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => handleDelete(bookmark.id, e)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )
        })}
      </div>

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
