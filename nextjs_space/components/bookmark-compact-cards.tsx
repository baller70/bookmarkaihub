
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

  // Calculate engagement percentage (starts at 0%, grows gradually with visits)
  const getEngagementPercentage = (visitCount: number) => {
    // Each visit adds 1% until it reaches 100%
    // This means: 0 visits = 0%, 1 visit = 1%, 100 visits = 100%
    return Math.min(visitCount, 100)
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {bookmarks.map((bookmark) => {
          const domain = getDomain(bookmark.url)
          const engagementPct = getEngagementPercentage(bookmark.visitCount)

          return (
            <div
              key={bookmark.id}
              className="relative bg-white border border-black rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-black group"
              style={{ aspectRatio: '1', minHeight: '200px' }}
              onClick={() => openDetailModal(bookmark)}
            >
              {/* Top Left - Small Favicon */}
              <div className="absolute top-2.5 left-2.5 w-7 h-7 bg-black rounded-md flex items-center justify-center overflow-hidden z-10">
                {bookmark.favicon ? (
                  <Image
                    src={bookmark.favicon}
                    alt={bookmark.title}
                    width={28}
                    height={28}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5 text-white" />
                )}
              </div>

              {/* Top Right - Engagement Hexagon Badge */}
              <div className="absolute top-1.5 right-2.5 z-10">
                <div className="relative">
                  <svg width="32" height="36" viewBox="0 0 40 44" className="text-red-500">
                    <path
                      d="M20 2 L35 11 L35 29 L20 38 L5 29 L5 11 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-red-500">
                      {engagementPct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Center - Title and URL */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-3 z-10">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-tight text-center line-clamp-2 leading-tight mb-1.5">
                  {bookmark.title}
                </h3>
                <p className="text-[10px] text-blue-600 truncate text-center mb-1.5">
                  {domain}
                </p>
                {bookmark.priority && (
                  <div className="flex justify-center">
                    <span className="text-[9px] px-2 py-0.5 rounded font-medium lowercase bg-yellow-100 text-yellow-800 border border-yellow-200">
                      {bookmark.priority}
                    </span>
                  </div>
                )}
              </div>

              {/* Large Background Logo Watermark */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-10">
                {bookmark.favicon ? (
                  <Image
                    src={bookmark.favicon}
                    alt={bookmark.title}
                    width={200}
                    height={200}
                    className="w-40 h-40 object-contain"
                  />
                ) : (
                  <ExternalLink className="w-32 h-32 text-gray-300" />
                )}
              </div>

              {/* Bottom Right - Small Logo */}
              <div className="absolute bottom-2.5 right-2.5 w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden z-10 shadow-sm">
                {bookmark.favicon ? (
                  <Image
                    src={bookmark.favicon}
                    alt={bookmark.title}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ExternalLink className="w-6 h-6 text-gray-400" />
                )}
              </div>

              {/* Bottom Left - Visit Count */}
              <div className="absolute bottom-2.5 left-2.5 z-10">
                <div className="flex items-center gap-1 text-[9px] text-gray-600">
                  <Eye className="w-2.5 h-2.5" />
                  <span className="font-medium uppercase tracking-wide">
                    {bookmark.visitCount} VISIT{bookmark.visitCount !== 1 ? 'S' : ''}
                  </span>
                  <span className="text-green-500 text-xs">●</span>
                </div>
              </div>

              {/* Hover Actions - Dropdown */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 bg-white/90 hover:bg-white shadow-sm rounded"
                    >
                      <svg
                        className="w-3 h-3 text-gray-600"
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
