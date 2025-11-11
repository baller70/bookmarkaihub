"use client"

import { useMemo } from "react"
import { useSession } from "next-auth/react"
import { Folder, MoreVertical, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BookmarkListProps {
  bookmarks: any[]
  onUpdate: () => void
}

export function BookmarkList({ bookmarks, onUpdate }: BookmarkListProps) {
  const { data: session } = useSession() || {}
  
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

  return (
    <div className="space-y-3">
      {categorizedBookmarks.map(({ category, bookmarks: categoryBookmarks }) => (
        <div
          key={category.id}
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
                  <DropdownMenuItem>View Bookmarks</DropdownMenuItem>
                  <DropdownMenuItem>Edit Category</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
