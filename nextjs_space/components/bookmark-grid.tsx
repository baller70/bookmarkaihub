
"use client"

import { BookmarkCard } from "@/components/bookmark-card"
import { cn } from "@/lib/utils"

interface BookmarkGridProps {
  bookmarks: any[]
  compact?: boolean
  onUpdate: () => void
}

export function BookmarkGrid({ bookmarks, compact = false, onUpdate }: BookmarkGridProps) {
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
    <div className={cn(
      "grid gap-4",
      compact 
        ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    )}>
      {bookmarks.map((bookmark) => (
        <BookmarkCard 
          key={bookmark.id} 
          bookmark={bookmark} 
          compact={compact}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}
