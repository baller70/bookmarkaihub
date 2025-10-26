
"use client"

import { BookmarkCard } from "@/components/bookmark-card"
import { format, parseISO, isToday, isYesterday, isThisWeek } from "date-fns"

interface BookmarkTimelineProps {
  bookmarks: any[]
  onUpdate: () => void
}

function getDateGroup(date: string) {
  const parsedDate = parseISO(date)
  
  if (isToday(parsedDate)) {
    return "JUST NOW"
  } else if (isYesterday(parsedDate)) {
    return "YESTERDAY"
  } else if (isThisWeek(parsedDate)) {
    return "THIS WEEK"
  } else {
    return format(parsedDate, "MMMM yyyy").toUpperCase()
  }
}

export function BookmarkTimeline({ bookmarks, onUpdate }: BookmarkTimelineProps) {
  if (!bookmarks?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks found</h3>
        <p className="text-gray-500">Create your first bookmark to get started</p>
      </div>
    )
  }

  // Group bookmarks by date
  const groupedBookmarks = bookmarks.reduce((groups: any, bookmark: any) => {
    const dateGroup = getDateGroup(bookmark.createdAt)
    if (!groups[dateGroup]) {
      groups[dateGroup] = []
    }
    groups[dateGroup].push(bookmark)
    return groups
  }, {})

  return (
    <div className="space-y-8">
      <div className="text-sm text-gray-500 mb-6">
        Total: {bookmarks.length} bookmarks
      </div>
      
      {Object.entries(groupedBookmarks).map(([dateGroup, groupBookmarks]: [string, any]) => (
        <div key={dateGroup} className="space-y-4">
          {/* Date Group Header */}
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">{dateGroup}</h3>
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-500">
              {(groupBookmarks as any[]).length} item{(groupBookmarks as any[]).length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Timeline Items */}
          <div className="space-y-3 pl-6 border-l-2 border-gray-100">
            {(groupBookmarks as any[]).map((bookmark, index) => (
              <div key={bookmark.id} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-8 top-4 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm" />
                
                {/* Bookmark card */}
                <div className="ml-4">
                  <BookmarkCard bookmark={bookmark} onUpdate={onUpdate} />
                </div>
                
                {/* More button for large groups */}
                {index === 4 && (groupBookmarks as any[]).length > 5 && (
                  <button className="ml-4 mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Show {(groupBookmarks as any[]).length - 5} more items
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
