
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AddBookmarkModal } from "@/components/add-bookmark-modal"
import { ViewMode } from "@/components/dashboard-content"
import { Search, Filter, Plus, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onBookmarkCreated: () => void
}

const viewModes: { id: ViewMode; label: string }[] = [
  { id: "GRID", label: "GRID" },
  { id: "COMPACT", label: "COMPACT" },
  { id: "LIST", label: "LIST" },
  { id: "TIMELINE", label: "TIMELINE" },
  { id: "HIERARCHY", label: "HIERARCHY" },
  { id: "FOLDER", label: "FOLDER 2.0" },
  { id: "GOAL", label: "GOAL 2.0" },
  { id: "KANBAN", label: "KANBAN 2.0" },
]

export function DashboardHeader({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  onBookmarkCreated,
}: DashboardHeaderProps) {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="space-y-6">
      {/* Main Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-900 font-audiowide">
          BOOKMARKHUB
        </h1>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 h-12 rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        
        <Button
          onClick={() => setShowAddModal(true)}
          className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          ADD BOOKMARK
        </Button>
        
        <Button
          variant="outline"
          className="h-12 px-6 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-md"
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          BULK SELECT
        </Button>
        
        <Button
          variant="outline"
          className="h-12 px-6 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-md"
        >
          Breakdown
        </Button>
      </div>

      {/* View Mode Toggles */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {viewModes.map((mode) => (
          <Button
            key={mode.id}
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange(mode.id)}
            className={cn(
              "px-3 py-2 text-xs font-medium rounded-md transition-colors",
              viewMode === mode.id
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            )}
          >
            {mode.label}
          </Button>
        ))}
      </div>

      {/* Add Bookmark Modal */}
      <AddBookmarkModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={onBookmarkCreated}
      />
    </div>
  )
}
