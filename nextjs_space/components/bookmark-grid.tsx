
"use client"

import { useState, useEffect } from "react"
import { BookmarkCard } from "@/components/bookmark-card"
import { cn } from "@/lib/utils"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable"

interface BookmarkGridProps {
  bookmarks: any[]
  compact?: boolean
  onUpdate: () => void
  bulkSelectMode?: boolean
  selectedBookmarks?: Set<string>
  onSelectBookmark?: (id: string) => void
}

export function BookmarkGrid({ 
  bookmarks, 
  compact = false, 
  onUpdate,
  bulkSelectMode = false,
  selectedBookmarks = new Set(),
  onSelectBookmark
}: BookmarkGridProps) {
  const [items, setItems] = useState(bookmarks)
  
  // Update items when bookmarks prop changes
  useEffect(() => {
    setItems(bookmarks)
  }, [bookmarks])
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
        <div className={cn(
          "grid gap-6",
          compact 
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
            : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
        )}>
          {items.map((bookmark) => (
            <BookmarkCard 
              key={bookmark.id} 
              bookmark={bookmark} 
              compact={compact}
              onUpdate={onUpdate}
              bulkSelectMode={bulkSelectMode}
              isSelected={selectedBookmarks.has(bookmark.id)}
              onSelect={onSelectBookmark}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
