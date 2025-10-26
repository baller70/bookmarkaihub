
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, User } from "lucide-react"

interface BookmarkKanbanProps {
  bookmarks: any[]
  onUpdate: () => void
}

const columns = [
  { id: "BACKLOG", title: "BACKLOG", color: "bg-gray-100" },
  { id: "TODO", title: "TO DO", color: "bg-blue-100" },
  { id: "IN_PROGRESS", title: "IN PROGRESS", color: "bg-yellow-100" },
  { id: "DONE", title: "DONE", color: "bg-green-100" },
]

const priorityColors = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
}

export function BookmarkKanban({ bookmarks, onUpdate }: BookmarkKanbanProps) {
  // Group bookmarks by status (using priority as a proxy for status)
  const groupedBookmarks = bookmarks.reduce((groups: any, bookmark: any) => {
    let status = "BACKLOG"
    if (bookmark.priority === "HIGH" || bookmark.priority === "URGENT") {
      status = "TODO"
    } else if (bookmark.totalTasks > 0 && bookmark.completedTasks < bookmark.totalTasks) {
      status = "IN_PROGRESS"
    } else if (bookmark.totalTasks > 0 && bookmark.completedTasks === bookmark.totalTasks) {
      status = "DONE"
    }
    
    if (!groups[status]) {
      groups[status] = []
    }
    groups[status].push(bookmark)
    return groups
  }, {})

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnBookmarks = groupedBookmarks[column.id] || []
        
        return (
          <div key={column.id} className="flex-shrink-0 w-80">
            {/* Column Header */}
            <div className={`${column.color} rounded-t-lg p-4 border-b`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {columnBookmarks.length}
                </Badge>
              </div>
            </div>

            {/* Column Content */}
            <div className="bg-gray-50 rounded-b-lg p-4 space-y-3 min-h-96">
              {columnBookmarks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No items in {column.title.toLowerCase()}
                </div>
              ) : (
                columnBookmarks.map((bookmark: any) => {
                  const progress = bookmark.totalTasks > 0 
                    ? (bookmark.completedTasks / bookmark.totalTasks) * 100 
                    : 0

                  return (
                    <Card key={bookmark.id} className="p-4 bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="space-y-3">
                        {/* Title */}
                        <h4 className="font-medium text-gray-900 line-clamp-2">
                          {bookmark.title}
                        </h4>

                        {/* Description */}
                        {bookmark.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {bookmark.description}
                          </p>
                        )}

                        {/* Priority Badge */}
                        <Badge 
                          variant="secondary"
                          className={`text-xs ${priorityColors[bookmark.priority as keyof typeof priorityColors]}`}
                        >
                          {bookmark.priority?.toLowerCase()}
                        </Badge>

                        {/* Progress */}
                        {bookmark.totalTasks > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Progress</span>
                              <span>{bookmark.completedTasks}/{bookmark.totalTasks}</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-2">
                            {bookmark.lastVisited && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(bookmark.lastVisited).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              U
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        {bookmark.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {bookmark.tags.slice(0, 2).map((tag: any) => (
                              <Badge
                                key={tag.tag.id}
                                variant="outline"
                                className="text-xs px-1 py-0"
                                style={{ 
                                  backgroundColor: `${tag.tag.color}15`,
                                  borderColor: tag.tag.color,
                                  color: tag.tag.color 
                                }}
                              >
                                {tag.tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
