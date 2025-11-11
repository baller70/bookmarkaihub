"use client"

import { useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Folder, MoreVertical, User, ArrowLeft, ExternalLink, Star, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookmarkDetailModal } from "@/components/bookmark-detail-modal"
import { toast } from "sonner"

interface BookmarkCompactProps {
  bookmarks: any[]
  onUpdate: () => void
}

export function BookmarkCompact({ bookmarks, onUpdate }: BookmarkCompactProps) {
  const { data: session } = useSession() || {}
  const [selectedCategory, setSelectedCategory] = useState<{id: string; name: string; color: string} | null>(null)
  const [selectedBookmark, setSelectedBookmark] = useState<any>(null)
  
  // Group bookmarks by category
  const categorizedBookmarks = useMemo(() => {
    const grouped = new Map<string, { category: any; bookmarks: any[] }>()

    bookmarks?.forEach((bookmark) => {
      const categoryId = bookmark.category?.id || "uncategorized"
      const categoryName = bookmark.category?.name || "UNCATEGORIZED"
      const categoryColor = bookmark.category?.color || "#94A3B8"
      const categoryIcon = bookmark.category?.icon || "Folder"

      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, {
          category: {
            id: categoryId,
            name: categoryName,
            color: categoryColor,
            icon: categoryIcon,
          },
          bookmarks: [],
        })
      }
      grouped.get(categoryId)?.bookmarks.push(bookmark)
    })

    return Array.from(grouped.values())
  }, [bookmarks])

  // Get bookmarks for selected category
  const currentCategoryBookmarks = useMemo(() => {
    if (!selectedCategory) return []
    const found = categorizedBookmarks.find(c => c.category.id === selectedCategory.id)
    return found?.bookmarks || []
  }, [selectedCategory, categorizedBookmarks])

  const handleToggleFavorite = async (bookmarkId: string, isFavorite: boolean) => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      })

      if (!response.ok) throw new Error("Failed to update bookmark")

      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites")
      onUpdate()
    } catch (error) {
      toast.error("Failed to update bookmark")
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

  // Second level: Show individual bookmarks as square cards
  if (selectedCategory) {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4 pb-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Folders</span>
          </Button>
          <div className="flex items-center gap-3">
            <Folder
              className="w-6 h-6"
              style={{ color: selectedCategory.color }}
              fill={selectedCategory.color}
              fillOpacity={0.15}
            />
            <h2 className="text-lg font-bold uppercase">{selectedCategory.name}</h2>
            <Badge variant="secondary">{currentCategoryBookmarks.length} BOOKMARKS</Badge>
          </div>
        </div>

        {/* Bookmarks as square cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentCategoryBookmarks.map((bookmark: any) => (
            <div
              key={bookmark.id}
              className="relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => setSelectedBookmark(bookmark)}
            >
              {/* Percentage indicator */}
              <div className="absolute top-3 right-3 z-10">
                <div className="w-10 h-10 bg-red-100 border-2 border-red-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600">0%</span>
                </div>
              </div>

              {/* Square card content */}
              <div className="aspect-square flex flex-col p-6">
                {/* Logo/Favicon */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-20 h-20 bg-black rounded-2xl flex items-center justify-center overflow-hidden">
                    {bookmark.favicon ? (
                      <Image
                        src={bookmark.favicon}
                        alt={bookmark.title || "Bookmark"}
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {bookmark.title?.charAt(0) || "?"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-center font-bold text-sm text-gray-900 mb-2 uppercase line-clamp-2">
                  {bookmark.title || "Untitled"}
                </h3>

                {/* URL */}
                <p className="text-center text-xs text-blue-600 mb-3 truncate">
                  {bookmark.url?.replace(/^https?:\/\/(www\.)?/, "")}
                </p>

                {/* Priority badge */}
                {bookmark.priority && (
                  <div className="flex justify-center mb-auto">
                    <Badge
                      variant="secondary"
                      className={`
                        text-xs px-2 py-0.5
                        ${bookmark.priority === "HIGH" ? "bg-yellow-100 text-yellow-800" : ""}
                        ${bookmark.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-800" : ""}
                        ${bookmark.priority === "LOW" ? "bg-gray-100 text-gray-600" : ""}
                      `}
                    >
                      {bookmark.priority?.toLowerCase()}
                    </Badge>
                  </div>
                )}

                {/* Decorative graphic space (bottom area) */}
                <div className="mt-auto pt-4">
                  <div className="h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center opacity-60">
                    <div className="text-4xl font-bold text-blue-200">
                      {bookmark.title?.charAt(0) || ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Visit count footer */}
              <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{bookmark.analytics?.[0]?.totalVisits || 0} VISITS</span>
                  {bookmark.analytics?.[0]?.totalVisits > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 ml-auto"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bookmark Detail Modal */}
        {selectedBookmark && (
          <BookmarkDetailModal
            bookmark={selectedBookmark}
            open={!!selectedBookmark}
            onOpenChange={(open) => !open && setSelectedBookmark(null)}
            onUpdate={onUpdate}
          />
        )}
      </div>
    )
  }

  // First level: Show category folders as VERY COMPACT SQUARE cards
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2">
      {categorizedBookmarks.map(({ category, bookmarks: categoryBookmarks }) => (
        <div
          key={category.id}
          onClick={() => setSelectedCategory(category)}
          className="group relative bg-white border border-gray-200 rounded-md hover:shadow-md hover:border-gray-300 transition-all cursor-pointer overflow-hidden"
        >
          {/* Square aspect ratio container - VERY SMALL padding */}
          <div className="aspect-square relative p-2 flex flex-col">
            
            {/* Three-dot menu in top right */}
            <div className="absolute top-1 right-1 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm hover:bg-gray-100"
                  >
                    <MoreVertical className="w-3 h-3 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    setSelectedCategory(category)
                  }}>
                    View Bookmarks
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Edit Category</DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-red-600">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* BIGGER Colored Folder icon in UPPER LEFT corner */}
            <div className="absolute top-1.5 left-1.5">
              <Folder
                className="w-10 h-10"
                style={{ color: category.color }}
                fill={category.color}
                fillOpacity={0.25}
                strokeWidth={1.5}
              />
            </div>

            {/* Category name - centered vertically and horizontally */}
            <div className="flex-1 flex items-center justify-center px-1">
              <h3 className="text-center font-black text-[10px] text-gray-900 uppercase tracking-tight leading-tight line-clamp-2">
                {category.name}
              </h3>
            </div>

            {/* Footer section at bottom */}
            <div className="flex items-center justify-between mt-auto pt-1">
              {/* Bookmark count - bottom left */}
              <div className="flex items-center gap-0.5 text-[8px] text-gray-600 font-medium">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>{categoryBookmarks.length}</span>
              </div>

              {/* BIGGER User profile/logo - bottom right */}
              <div className="w-8 h-8 bg-gray-400 rounded-sm flex items-center justify-center border border-gray-500 shadow-sm">
                {session?.user?.name ? (
                  <span className="text-xs font-bold text-white">
                    {session.user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
