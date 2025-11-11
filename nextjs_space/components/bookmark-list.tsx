"use client"

import { useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Folder, MoreVertical, User, ArrowLeft, ExternalLink, Star, Eye, MoreHorizontal } from "lucide-react"
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

interface BookmarkListProps {
  bookmarks: any[]
  onUpdate: () => void
}

export function BookmarkList({ bookmarks, onUpdate }: BookmarkListProps) {
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks found</h3>
        <p className="text-gray-500">Create your first bookmark to get started</p>
      </div>
    )
  }

  // Second level: Show individual bookmarks as full-width horizontal cards
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

        {/* Bookmarks as full-width horizontal cards */}
        <div className="space-y-4">
          {currentCategoryBookmarks.map((bookmark: any) => (
            <div
              key={bookmark.id}
              className="relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all group"
            >
              {/* Three-dot menu */}
              <div className="absolute top-3 right-3 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => setSelectedBookmark(bookmark)}>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Percentage indicator */}
              <div className="absolute bottom-4 right-4 z-10">
                <div className="w-12 h-12 bg-red-100 border-2 border-red-400 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-red-600">
                    {bookmark.analytics?.[0]?.engagementScore || 0}%
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-6 p-6 cursor-pointer" onClick={() => setSelectedBookmark(bookmark)}>
                {/* Left: Logo/Favicon */}
                <div className="flex-shrink-0">
                  <div className="relative w-16 h-16 bg-black rounded-2xl flex items-center justify-center overflow-hidden">
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

                {/* Middle: Content */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Title and badges */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-gray-900 uppercase">
                      {bookmark.title || "Untitled"}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {bookmark.priority && (
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
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Folder className="w-3.5 h-3.5" />
                        <span>{bookmark.category?.name || "UNCATEGORIZED"}</span>
                      </div>
                    </div>
                  </div>

                  {/* URL */}
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {bookmark.url?.replace(/^https?:\/\/(www\.)?/, "")}
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {bookmark.description || "No description available"}
                  </p>

                  {/* Visit count */}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span>{bookmark.analytics?.[0]?.totalVisits || 0} VISITS</span>
                    {bookmark.analytics?.[0]?.totalVisits > 0 && (
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    )}
                  </div>
                </div>

                {/* Right: Decorative graphic */}
                <div className="flex-shrink-0 w-32 h-32 hidden lg:flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg flex items-center justify-center opacity-60">
                    <div className="text-6xl font-bold text-blue-200">
                      {bookmark.title?.charAt(0) || ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Drag handle at bottom center */}
              <div className="flex justify-center py-1 border-t border-gray-100 bg-gray-50">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
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

  // First level: Show category folders as full-width rows
  return (
    <div className="space-y-3">
      {categorizedBookmarks.map(({ category, bookmarks: categoryBookmarks }) => (
        <div
          key={category.id}
          onClick={() => setSelectedCategory(category)}
          className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm hover:border-gray-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between gap-4">
            {/* Left: Folder icon + Category info */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              {/* Folder icon */}
              <div className="flex-shrink-0">
                <Folder
                  className="w-12 h-12"
                  style={{ color: category.color }}
                  fill={category.color}
                  fillOpacity={0.15}
                />
              </div>

              {/* Category name and bookmark count */}
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base text-gray-900 mb-1 uppercase">
                  {category.name}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span>{categoryBookmarks.length} BOOKMARK{categoryBookmarks.length !== 1 ? 'S' : ''}</span>
                </div>
              </div>
            </div>

            {/* Right: User avatar + Three-dot menu */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* User avatar */}
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                {session?.user?.name ? (
                  <span className="text-xs font-semibold text-gray-600">
                    {session.user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="w-4 h-4 text-gray-500" />
                )}
              </div>

              {/* Three-dot menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
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
          </div>
        </div>
      ))}
    </div>
  )
}
