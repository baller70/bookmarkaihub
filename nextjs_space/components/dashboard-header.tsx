
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddBookmarkModal } from "@/components/add-bookmark-modal"
import { Check, Plus, RefreshCw, Grid3x3, List as ListIcon, LayoutGrid, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  onBookmarkCreated: () => void
  onSyncAll?: () => void
  bulkSelectMode?: boolean
  onBulkSelectToggle?: () => void
  selectedCount?: number
}

export function DashboardHeader({
  onBookmarkCreated,
  onSyncAll,
  bulkSelectMode = false,
  onBulkSelectToggle,
  selectedCount = 0,
}: DashboardHeaderProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSyncAll = async () => {
    setIsSyncing(true)
    try {
      if (onSyncAll) {
        await onSyncAll()
      }
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex items-start justify-between">
      {/* Left: Title and Subtitle */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-audiowide tracking-tight">
          BOOKMARKHUB
        </h1>
        <p className="text-sm text-gray-500 mt-1">Your Digital Workspace</p>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Bulk Select Button with Badge */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkSelectToggle}
            className={cn(
              "h-9 px-4 gap-2 border-2 transition-all",
              bulkSelectMode 
                ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" 
                : "bg-white hover:bg-gray-50 text-black border-gray-900"
            )}
          >
            <Check className="h-4 w-4" />
            <FolderOpen className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-bold">BULK SELECT</span>
          </Button>
          {bulkSelectMode && selectedCount > 0 && (
            <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                {selectedCount} SELECTED
              </span>
            </div>
          )}
        </div>

        {/* All Categories Dropdown */}
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px] h-9 text-xs text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="work">Work</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="entertainment">Entertainment</SelectItem>
          </SelectContent>
        </Select>

        {/* Sync All Button with View Icons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="h-9 px-4 gap-2 text-white"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="text-xs font-medium">{isSyncing ? 'Syncing...' : 'Sync All'}</span>
          </Button>
          
          {/* View Icons */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Grid3x3 className="h-4 w-4 text-blue-500" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ListIcon className="h-4 w-4 text-blue-500" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <LayoutGrid className="h-4 w-4 text-blue-500" />
            </Button>
          </div>
        </div>

        {/* Add Bookmark Button */}
        <Button
          onClick={() => setShowAddModal(true)}
          className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs font-medium">ADD BOOKMARK</span>
        </Button>
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
