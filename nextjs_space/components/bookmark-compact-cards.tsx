"use client"

import { useState, useEffect } from "react"
import { Eye, ExternalLink, Star, Trash2, Edit, Folder, FolderInput, Check, X } from "lucide-react"
import Image from "next/image"
import { FallbackImage } from "@/components/ui/fallback-image"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { BookmarkDetailModal } from "./bookmark-detail-modal"
import { FitnessRings, RingData } from "@/components/ui/fitness-rings"
import { FitnessRingsModal } from "@/components/ui/fitness-rings-modal"
import { RingColorCustomizer } from "@/components/ui/ring-color-customizer"
import { toast } from "sonner"

// Default ring colors
const DEFAULT_RING_COLORS = {
  visits: "#EF4444", // Red
  tasks: "#22C55E",  // Green
  time: "#06B6D4",   // Cyan
}

// Local storage key for ring colors
const RING_COLORS_KEY = "bookmarkhub-ring-colors"

// Get ring colors from localStorage
function getRingColors(): Record<string, string> {
  if (typeof window === "undefined") return DEFAULT_RING_COLORS
  try {
    const stored = localStorage.getItem(RING_COLORS_KEY)
    return stored ? { ...DEFAULT_RING_COLORS, ...JSON.parse(stored) } : DEFAULT_RING_COLORS
  } catch {
    return DEFAULT_RING_COLORS
  }
}

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
  categoryId?: string
  folders?: { id: string; name: string }[]
  onMoveBookmark?: (bookmarkId: string, folderId: string | null) => void
}

const priorityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200",
}

export function BookmarkCompactCards({ bookmarks, onUpdate, categoryId, folders = [], onMoveBookmark }: BookmarkCompactCardsProps) {
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [ringColors, setRingColors] = useState<Record<string, string>>(DEFAULT_RING_COLORS)
  const [availableFolders, setAvailableFolders] = useState<{ id: string; name: string }[]>(folders)
  
  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  
  // Fitness rings modal state
  const [showRingsModal, setShowRingsModal] = useState(false)
  const [showColorCustomizer, setShowColorCustomizer] = useState(false)
  const [selectedBookmarkForRings, setSelectedBookmarkForRings] = useState<Bookmark | null>(null)

  // Fetch folders for category if not provided
  useEffect(() => {
    if (categoryId && categoryId !== 'all' && folders.length === 0) {
      fetch(`/api/bookmark-folders?categoryId=${categoryId}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setAvailableFolders(data))
        .catch(() => setAvailableFolders([]))
    } else {
      setAvailableFolders(folders)
    }
  }, [categoryId, folders])

  const toggleSelection = (bookmarkId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(bookmarkId)) {
        newSet.delete(bookmarkId)
      } else {
        newSet.add(bookmarkId)
      }
      return newSet
    })
  }

  const selectAll = () => {
    setSelectedIds(new Set(bookmarks.map(b => b.id)))
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
    setIsSelectionMode(false)
  }

  const moveSelectedToFolder = async (folderId: string | null) => {
    if (selectedIds.size === 0) return
    
    const promises = Array.from(selectedIds).map(async (bookmarkId) => {
      try {
        const res = await fetch(`/api/bookmarks/${bookmarkId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId })
        })
        return res.ok
      } catch {
        return false
      }
    })

    const results = await Promise.all(promises)
    const successCount = results.filter(Boolean).length

    if (successCount > 0) {
      toast.success(`Moved ${successCount} bookmark${successCount > 1 ? 's' : ''} to folder`)
      clearSelection()
      onUpdate()
    } else {
      toast.error("Failed to move bookmarks")
    }
  }

  const moveToFolder = async (bookmarkId: string, folderId: string | null) => {
    if (onMoveBookmark) {
      onMoveBookmark(bookmarkId, folderId)
      return
    }
    try {
      const res = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId })
      })
      if (res.ok) {
        toast.success(folderId ? "Moved to folder" : "Removed from folder")
        onUpdate()
      } else {
        toast.error("Failed to move bookmark")
      }
    } catch (e) {
      toast.error("Failed to move bookmark")
    }
  }

  // Load ring colors from localStorage on mount
  useEffect(() => {
    setRingColors(getRingColors())
  }, [])

  // Create ring data for a bookmark
  const createRingsData = (bookmark: Bookmark): RingData[] => {
    return [
      {
        id: "visits",
        label: "Visits",
        value: bookmark.visitCount || 0,
        target: 100,
        color: ringColors.visits,
      },
      {
        id: "tasks",
        label: "Tasks",
        value: 0,
        target: 1,
        color: ringColors.tasks,
      },
      {
        id: "time",
        label: "Time",
        value: 0,
        target: 60,
        color: ringColors.time,
      },
    ]
  }

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
      // Truncate if too long
      return domain.length > 35 ? domain.substring(0, 32) + '...' : domain
    } catch {
      // If URL parsing fails, return truncated URL
      const truncated = url.replace(/^https?:\/\/(www\.)?/, '')
      return truncated.length > 35 ? truncated.substring(0, 32) + '...' : truncated
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
      {/* Bulk Action Bar - Shows when folders are available */}
      {availableFolders.length > 0 && (
        <div className="mb-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
          <Button
            variant={isSelectionMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setIsSelectionMode(!isSelectionMode)
              if (isSelectionMode) clearSelection()
            }}
          >
            {isSelectionMode ? "Cancel Selection" : "Select Bookmarks"}
          </Button>
          
          {isSelectionMode && (
            <>
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              
              {selectedIds.size > 0 && (
                <>
                  <span className="text-sm text-gray-600">
                    {selectedIds.size} selected
                  </span>
                  <Select onValueChange={(value) => moveSelectedToFolder(value === "__none__" ? null : value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Move to folder..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Remove from folder</SelectItem>
                      {availableFolders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {bookmarks.map((bookmark) => {
          const domain = getDomain(bookmark.url)
          const engagementPct = getEngagementPercentage(bookmark.visitCount)
          const isSelected = selectedIds.has(bookmark.id)

          return (
            <div
              key={bookmark.id}
              className={cn(
                "relative bg-white border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg group",
                isSelected ? "border-2 border-blue-500 ring-2 ring-blue-200" : "border border-black hover:border-black"
              )}
              style={{ aspectRatio: '1', minHeight: '200px' }}
              onClick={() => isSelectionMode ? toggleSelection(bookmark.id, { stopPropagation: () => {} } as any) : openDetailModal(bookmark)}
            >
              {/* Selection Checkbox - Top Left when in selection mode */}
              {isSelectionMode && (
                <div 
                  className="absolute top-2 left-2 z-20"
                  onClick={(e) => toggleSelection(bookmark.id, e)}
                >
                  <div className={cn(
                    "w-6 h-6 rounded border-2 flex items-center justify-center transition-colors",
                    isSelected ? "bg-blue-500 border-blue-500" : "bg-white border-gray-400 hover:border-blue-400"
                  )}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              )}

              {/* Top Left - Small Favicon (shifted right when in selection mode) */}
              <div className={cn(
                "absolute top-2.5 w-7 h-7 bg-black rounded-md flex items-center justify-center overflow-hidden z-10",
                isSelectionMode ? "left-10" : "left-2.5"
              )}>
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

              {/* Middle Right - Activity Rings Badge */}
              <div className="absolute top-1/2 -translate-y-1/2 right-2 z-30">
                <FitnessRings
                  rings={createRingsData(bookmark)}
                  size={36}
                  strokeWidth={3}
                  animated={false}
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setSelectedBookmarkForRings(bookmark)
                    setShowRingsModal(true)
                  }}
                />
              </div>

              {/* Left - Title and URL */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-3 z-10">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-tight text-left line-clamp-2 leading-tight mb-1.5">
                  {bookmark.title}
                </h3>
                <p className="text-[10px] text-blue-600 truncate text-left mb-1.5" title={bookmark.url}>
                  {domain}
                </p>
                {bookmark.priority && (
                  <div className="flex justify-start">
                    <span className="text-[9px] px-2 py-0.5 rounded font-medium lowercase bg-yellow-100 text-yellow-800 border border-yellow-200">
                      {bookmark.priority}
                    </span>
                  </div>
                )}
              </div>

              {/* Large Background Logo Watermark - Fills entire card */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-10">
                <FallbackImage
                  src={bookmark.favicon || ""}
                  alt={bookmark.title}
                  fallbackText={bookmark.title}
                  fill
                  className="object-cover"
                  fallbackClassName="w-full h-full text-gray-300"
                  sizes="200px"
                />
              </div>

              {/* Bottom Right - Small Logo */}
              <div className="absolute bottom-2.5 right-2.5 w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden z-10 shadow-sm">
                <FallbackImage
                  src={bookmark.favicon || ""}
                  alt={bookmark.title}
                  fallbackText={bookmark.title}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  fallbackClassName="text-sm text-gray-400"
                />
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
                    {availableFolders.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger onClick={(e) => e.stopPropagation()}>
                            <FolderInput className="w-4 h-4 mr-2" />
                            Move to Folder
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                moveToFolder(bookmark.id, null)
                              }}
                            >
                              <Folder className="w-4 h-4 mr-2 text-gray-400" />
                              Remove from folder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {availableFolders.map((folder) => (
                              <DropdownMenuItem
                                key={folder.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  moveToFolder(bookmark.id, folder.id)
                                }}
                              >
                                <Folder className="w-4 h-4 mr-2" />
                                {folder.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      </>
                    )}
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

      {/* Fitness Rings Detail Modal */}
      {selectedBookmarkForRings && (
        <FitnessRingsModal
          open={showRingsModal}
          onOpenChange={(open) => {
            setShowRingsModal(open)
            if (!open) setSelectedBookmarkForRings(null)
          }}
          rings={createRingsData(selectedBookmarkForRings)}
          onCustomize={() => {
            setShowRingsModal(false)
            setShowColorCustomizer(true)
          }}
        />
      )}

      {/* Ring Color Customizer Modal */}
      {selectedBookmarkForRings && (
        <RingColorCustomizer
          open={showColorCustomizer}
          onOpenChange={(open) => {
            setShowColorCustomizer(open)
            if (!open) setSelectedBookmarkForRings(null)
          }}
          rings={createRingsData(selectedBookmarkForRings)}
          onSave={(colors) => {
            toast.success("Ring colors saved!")
            setShowColorCustomizer(false)
            setSelectedBookmarkForRings(null)
          }}
        />
      )}
    </>
  )
}
