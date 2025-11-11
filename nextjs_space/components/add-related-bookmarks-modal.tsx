
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus } from "lucide-react"
import { toast } from "sonner"

interface Bookmark {
  id: string
  title: string
  url: string
  description: string | null
  favicon: string | null
  priority: string
  isFavorite: boolean
}

interface AddRelatedBookmarksModalProps {
  bookmarkId: string
  currentBookmarkTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookmarksAdded: () => void
}

export function AddRelatedBookmarksModal({
  bookmarkId,
  currentBookmarkTitle,
  open,
  onOpenChange,
  onBookmarksAdded,
}: AddRelatedBookmarksModalProps) {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("existing")
  const [searchQuery, setSearchQuery] = useState("")
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)

  // Fetch all bookmarks
  useEffect(() => {
    if (open && activeTab === "existing") {
      fetchBookmarks()
    }
  }, [open, activeTab])

  const fetchBookmarks = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/bookmarks")
      if (response.ok) {
        const data = await response.json()
        // Filter out the current bookmark
        const filteredBookmarks = data.filter((b: Bookmark) => b.id !== bookmarkId)
        setBookmarks(filteredBookmarks)
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error)
      toast.error("Failed to load bookmarks")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBookmark = (bookmarkId: string) => {
    setSelectedBookmarkIds((prev) =>
      prev.includes(bookmarkId)
        ? prev.filter((id) => id !== bookmarkId)
        : [...prev, bookmarkId]
    )
  }

  const handleAddSelected = async () => {
    if (selectedBookmarkIds.length === 0) {
      toast.error("Please select at least one bookmark")
      return
    }

    try {
      setAdding(true)
      const response = await fetch(`/api/bookmarks/${bookmarkId}/related`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relatedBookmarkIds: selectedBookmarkIds }),
      })

      if (response.ok) {
        toast.success(`Added ${selectedBookmarkIds.length} related bookmark(s)`)
        setSelectedBookmarkIds([])
        onBookmarksAdded()
        onOpenChange(false)
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to add related bookmarks")
      }
    } catch (error) {
      console.error("Error adding related bookmarks:", error)
      toast.error("Failed to add related bookmarks")
    } finally {
      setAdding(false)
    }
  }

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const query = searchQuery.toLowerCase()
    return (
      bookmark.title.toLowerCase().includes(query) ||
      bookmark.description?.toLowerCase().includes(query) ||
      bookmark.url.toLowerCase().includes(query)
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold uppercase">
            ADD BOOKMARKS
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">New Bookmark</TabsTrigger>
            <TabsTrigger value="existing">Existing Bookmarks</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="flex-1 overflow-auto mt-4">
            <div className="text-center py-12 text-gray-500">
              <p>Create a new bookmark feature coming soon</p>
              <p className="text-sm mt-2">For now, please add existing bookmarks</p>
            </div>
          </TabsContent>

          <TabsContent value="existing" className="flex-1 flex flex-col overflow-hidden mt-4">
            <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
                  SEARCH YOUR EXISTING BOOKMARKS
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, description, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-auto space-y-2 pr-2">
                {loading ? (
                  <div className="text-center py-12 text-gray-500">Loading bookmarks...</div>
                ) : filteredBookmarks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    {searchQuery ? "No bookmarks found" : "No bookmarks available"}
                  </div>
                ) : (
                  filteredBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleToggleBookmark(bookmark.id)}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {bookmark.favicon ? (
                          <img
                            src={bookmark.favicon}
                            alt=""
                            className="w-10 h-10 rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-lg">
                              {bookmark.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1">{bookmark.title}</h4>
                        {bookmark.description && (
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {bookmark.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {bookmark.priority}
                          </span>
                        </div>
                      </div>
                      <Checkbox
                        checked={selectedBookmarkIds.includes(bookmark.id)}
                        onCheckedChange={() => handleToggleBookmark(bookmark.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  {selectedBookmarkIds.length} bookmark(s) selected
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    CANCEL
                  </Button>
                  <Button
                    onClick={handleAddSelected}
                    disabled={selectedBookmarkIds.length === 0 || adding}
                  >
                    ADD SELECTED ({selectedBookmarkIds.length})
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
