"use client"

import { useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { Folder, MoreVertical, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BookmarkCompactProps {
  bookmarks: any[]
  onUpdate: () => void
}

export function BookmarkCompact({ bookmarks, onUpdate }: BookmarkCompactProps) {
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks found</h3>
        <p className="text-gray-500">Create your first bookmark to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {categorizedBookmarks.map(({ category, bookmarks: categoryBookmarks }) => (
        <div
          key={category.id}
          className="group relative bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
        >
          {/* Three-dot menu */}
          <div className="absolute top-3 right-3">
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
                <DropdownMenuItem>View Bookmarks</DropdownMenuItem>
                <DropdownMenuItem>Edit Category</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Folder icon */}
          <div className="flex justify-center mb-4 pt-2">
            <div className="w-20 h-20 flex items-center justify-center">
              <Folder
                className="w-20 h-20"
                style={{ color: category.color }}
                fill={category.color}
                fillOpacity={0.15}
              />
            </div>
          </div>

          {/* Category name */}
          <h3 className="text-center font-bold text-sm text-gray-900 mb-4 uppercase">
            {category.name}
          </h3>

          {/* Footer with bookmark count and user avatar */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>{categoryBookmarks.length} BOOKMARK{categoryBookmarks.length !== 1 ? 'S' : ''}</span>
            </div>

            {/* User avatar */}
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
              {session?.user?.name ? (
                <span className="text-xs font-semibold text-gray-600">
                  {session.user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-3.5 h-3.5 text-gray-500" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
