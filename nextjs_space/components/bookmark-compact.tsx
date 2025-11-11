"use client"

import { useState } from "react"
import Image from "next/image"
import { ExternalLink, Star, MoreVertical, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookmarkDetailModal } from "./bookmark-detail-modal"
import { toast } from "sonner"

interface BookmarkCompactProps {
  bookmarks: any[]
  onUpdate: () => void
}

export function BookmarkCompact({ bookmarks, onUpdate }: BookmarkCompactProps) {
  const [selectedBookmark, setSelectedBookmark] = useState<any | null>(null)

  const handleToggleFavorite = async (e: React.MouseEvent, bookmarkId: string, currentFavorite: boolean) => {
    e.stopPropagation()
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentFavorite }),
      })

      if (response.ok) {
        toast.success(currentFavorite ? 'Removed from favorites' : 'Added to favorites')
        onUpdate()
      }
    } catch (error) {
      toast.error('Failed to update favorite')
    }
  }

  const handleDelete = async (e: React.MouseEvent, bookmarkId: string) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this bookmark?')) return

    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Bookmark deleted')
        onUpdate()
      }
    } catch (error) {
      toast.error('Failed to delete bookmark')
    }
  }

  if (!bookmarks?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks found</h3>
        <p className="text-gray-500">Create your first bookmark to get started</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
            onClick={() => setSelectedBookmark(bookmark)}
          >
            {/* Header with Favicon and Actions */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Favicon */}
                <div className="w-10 h-10 flex-shrink-0 relative bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                  {bookmark.favicon ? (
                    <Image
                      src={bookmark.favicon}
                      alt={bookmark.title}
                      fill
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {bookmark.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 min-w-0">
                  {bookmark.title}
                </h3>
              </div>

              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    window.open(bookmark.url, '_blank')
                  }}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    setSelectedBookmark(bookmark)
                  }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => handleDelete(e, bookmark.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Description */}
            {bookmark.description && (
              <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                {bookmark.description}
              </p>
            )}

            {/* Category Badge */}
            {bookmark.category && (
              <Badge 
                className="mb-3 text-xs"
                style={{
                  backgroundColor: `${bookmark.category.color}15`,
                  color: bookmark.category.color,
                  borderLeft: `3px solid ${bookmark.category.color}`
                }}
              >
                {bookmark.category.name}
              </Badge>
            )}

            {/* Footer with URL and Favorite */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-gray-500 hover:text-blue-600 truncate flex-1 mr-2"
              >
                {bookmark.url.replace(/^https?:\/\//, '').replace(/\/$/, '').substring(0, 30)}...
              </a>

              <button
                onClick={(e) => handleToggleFavorite(e, bookmark.id, bookmark.isFavorite)}
                className="flex-shrink-0"
              >
                <Star
                  className={`w-4 h-4 transition-colors ${
                    bookmark.isFavorite
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bookmark Detail Modal */}
      {selectedBookmark && (
        <BookmarkDetailModal
          bookmark={selectedBookmark}
          open={!!selectedBookmark}
          onOpenChange={(open) => {
            if (!open) setSelectedBookmark(null)
          }}
          onUpdate={() => {
            onUpdate()
            setSelectedBookmark(null)
          }}
        />
      )}
    </>
  )
}
