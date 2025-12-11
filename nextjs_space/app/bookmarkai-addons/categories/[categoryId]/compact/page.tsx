
"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookmarkCompactCards } from "@/components/bookmark-compact-cards"
import Image from "next/image"
import {
  ArrowLeft,
  Search,
  Calendar,
  Star,
  SortAsc,
  ExternalLink,
  Folder,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface Bookmark {
  id: string
  title: string
  url: string
  description?: string | null
  favicon?: string | null
  faviconUrl?: string
  previewImage?: string
  tags?: Array<{ id: string; name: string; color: string }> | null
  category?: {
    id: string
    name: string
    color: string
  } | null
  categories?: Array<{ id: string; name: string; color: string }>
  isFavorite: boolean
  priority?: string | null
  visitCount: number
  createdAt: string
  updatedAt: string
  folderId?: string | null
}

interface Category {
  id: string
  name: string
  color: string
  icon?: string
  logo?: string
  _count?: {
    bookmarks: number
  }
}

interface BookmarkFolder {
  id: string
  name: string
  categoryId: string
  color?: string
}

type SortBy = "recent" | "oldest" | "title" | "favorites"

export default function CompactCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params?.categoryId as string

  const [category, setCategory] = useState<Category | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortBy>("recent")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25

  // Subfolder state
  const [folders, setFolders] = useState<BookmarkFolder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<BookmarkFolder | null>(null)
  const [foldersLoading, setFoldersLoading] = useState(false)
  const [globalLogo, setGlobalLogo] = useState<string | null>(null)

  // Create/Edit folder dialog state
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderColor, setNewFolderColor] = useState("#3B82F6")
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [editingFolder, setEditingFolder] = useState<BookmarkFolder | null>(null)

  const FOLDER_COLORS = [
    "#3B82F6", // Blue
    "#8B5CF6", // Purple
    "#10B981", // Green
    "#F59E0B", // Orange
    "#EF4444", // Red
    "#EC4899", // Pink
    "#14B8A6", // Teal
    "#6B7280", // Gray
    "#F97316", // Orange-Red
    "#06B6D4", // Cyan
  ]

  useEffect(() => {
    if (categoryId) {
      fetchCategoryData()
      if (categoryId !== 'all') {
        fetchFolders(categoryId)
      }
      fetchGlobalLogo()
    }
  }, [categoryId])

  const fetchGlobalLogo = async () => {
    try {
      const res = await fetch('/api/user/custom-logo')
      if (res.ok) {
        const data = await res.json()
        setGlobalLogo(data.customLogo || null)
      }
    } catch (e) {
      console.error('Failed to fetch global logo:', e)
    }
  }

  const fetchCategoryData = async () => {
    try {
      if (categoryId === 'all') {
        setCategory({
          id: 'all',
          name: 'ALL BOOKMARKS',
          color: '#3B82F6',
          _count: { bookmarks: 0 }
        })
        
        const bookmarksRes = await fetch(`/api/bookmarks`)
        const bookmarksData = await bookmarksRes.json()
        setBookmarks(bookmarksData)
        
        setCategory(prev => ({
          ...prev!,
          _count: { bookmarks: bookmarksData.length }
        }))
      } else {
        // Fetch all categories and find the one we need
        const categoryRes = await fetch(`/api/categories`)
        const categoryData = await categoryRes.json()
        
        // API returns { categories: [...] }
        const categories = categoryData.categories || categoryData || []
        const foundCategory = categories.find((c: Category) => c.id === categoryId)
        
        if (foundCategory) {
          setCategory(foundCategory)
        } else {
          console.error("Category not found:", categoryId)
        }

        const bookmarksRes = await fetch(`/api/bookmarks?category=${categoryId}`)
        const bookmarksData = await bookmarksRes.json()
        setBookmarks(bookmarksData)
      }
    } catch (error) {
      console.error('Failed to fetch category data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFolders = async (catId: string) => {
    try {
      setFoldersLoading(true)
      const res = await fetch(`/api/bookmark-folders?categoryId=${catId}`)
      if (res.ok) {
        const data = await res.json()
        setFolders(data)
      } else {
        setFolders([])
      }
    } catch (e) {
      setFolders([])
    } finally {
      setFoldersLoading(false)
    }
  }

  const openCreateFolderDialog = () => {
    setNewFolderName("")
    setNewFolderColor("#3B82F6")
    setEditingFolder(null)
    setIsCreateFolderOpen(true)
  }

  const openEditFolderDialog = (folder: BookmarkFolder, e: React.MouseEvent) => {
    e.stopPropagation()
    setNewFolderName(folder.name)
    setNewFolderColor(folder.color || "#3B82F6")
    setEditingFolder(folder)
    setIsCreateFolderOpen(true)
  }

  const createOrUpdateFolder = async () => {
    if (!category || category.id === "all" || !newFolderName.trim()) {
      return
    }
    setIsCreatingFolder(true)
    try {
      if (editingFolder) {
        // Update existing folder
        const res = await fetch(`/api/bookmark-folders`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingFolder.id, name: newFolderName.trim(), color: newFolderColor })
        })
        if (res.ok) {
          await fetchFolders(category.id)
          toast.success("Folder updated")
          setIsCreateFolderOpen(false)
          setNewFolderName("")
          setEditingFolder(null)
        } else {
          const errorData = await res.json().catch(() => ({}))
          toast.error(errorData.error || "Failed to update folder")
        }
      } else {
        // Create new folder
        const res = await fetch(`/api/bookmark-folders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newFolderName.trim(), categoryId: category.id, color: newFolderColor })
        })
        if (res.ok) {
          await fetchFolders(category.id)
          toast.success("Folder created")
          setIsCreateFolderOpen(false)
          setNewFolderName("")
        } else {
          const errorData = await res.json().catch(() => ({}))
          toast.error(errorData.error || "Failed to create folder")
        }
      }
    } catch (e) {
      toast.error("Failed to save folder")
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const deleteFolder = async (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Delete this folder? Bookmarks inside will be moved out.")) return
    
    try {
      const res = await fetch(`/api/bookmark-folders`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: folderId })
      })
      if (res.ok) {
        await fetchFolders(category!.id)
        handleUpdate()
        toast.success("Folder deleted")
      } else {
        toast.error("Failed to delete folder")
      }
    } catch (e) {
      toast.error("Failed to delete folder")
    }
  }

  const handleUpdate = () => {
    fetchCategoryData()
    if (categoryId && categoryId !== 'all') {
      fetchFolders(categoryId)
    }
  }

  const handleBack = () => {
    if (selectedFolder) {
      setSelectedFolder(null)
    } else {
      router.push('/dashboard')
    }
  }

  // Get bookmarks for current view
  const currentBookmarks = selectedFolder
    ? bookmarks.filter(b => b.folderId === selectedFolder.id)
    : bookmarks // Show ALL bookmarks when not inside a folder

  const searchFiltered = currentBookmarks.filter(bookmark =>
    bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedBookmarks = [...searchFiltered].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "title":
        return a.title.localeCompare(b.title)
      case "favorites":
        return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)
      default:
        return 0
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedBookmarks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedBookmarks = sortedBookmarks.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy, selectedFolder])

  if (loading) {
    return (
      <DashboardAuth>
        <DashboardLayout>
          <div className="p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </DashboardLayout>
      </DashboardAuth>
    )
  }

  if (!category) {
    return (
      <DashboardAuth>
        <DashboardLayout>
          <div className="p-8">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">CATEGORY NOT FOUND</h3>
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </DashboardAuth>
    )
  }

  return (
    <DashboardAuth>
      <DashboardLayout>
        {/* Full-page dotted background */}
        <div className="fixed inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          zIndex: 0
        }} />
        
        <div className="relative p-4 md:p-8" style={{ zIndex: 1 }}>
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {selectedFolder ? `Back to ${category.name}` : 'Back to Dashboard'}
            </Button>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: category.color ? category.color + '20' : '#e5e7eb' }}
                >
                  <Folder 
                    className="w-10 h-10"
                    style={{ color: category.color || '#3b82f6' }}
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold uppercase tracking-wide mb-2 text-gray-900">
                    {selectedFolder ? selectedFolder.name : category.name}
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    {sortedBookmarks.length} BOOKMARK{sortedBookmarks.length !== 1 ? 'S' : ''}
                    {!selectedFolder && folders.length > 0 && ` • ${folders.length} SUBFOLDER${folders.length !== 1 ? 'S' : ''}`}
                  </p>
                </div>
              </div>
              {categoryId !== 'all' && !selectedFolder && (
                <Button onClick={openCreateFolderDialog} className="gap-2">
                  <FolderPlus className="h-4 w-4" />
                  New Subfolder
                </Button>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-300"
                />
              </div>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                <SelectTrigger className="w-[180px] bg-white border-gray-300">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Most Recent
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Oldest First
                    </div>
                  </SelectItem>
                  <SelectItem value="title">
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      Alphabetical
                    </div>
                  </SelectItem>
                  <SelectItem value="favorites">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Favorites First
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subfolder Cards - Show at top when not inside a folder */}
          {!selectedFolder && folders.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Subfolders</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {folders.map((folder) => {
                  const folderCount = bookmarks.filter(b => b.folderId === folder.id).length
                  return (
                    <div
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder)}
                      className="bg-white border-2 border-gray-300 hover:border-black rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer relative group"
                    >
                      {/* Edit/Delete buttons on hover */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={(e) => openEditFolderDialog(folder, e)}
                          className="p-1 bg-white rounded shadow hover:bg-gray-100"
                          title="Edit folder"
                        >
                          <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => deleteFolder(folder.id, e)}
                          className="p-1 bg-white rounded shadow hover:bg-red-100"
                          title="Delete folder"
                        >
                          <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-10 h-10 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: folder.color || category.color || '#60A5FA' }}
                        >
                          <Folder className="w-6 h-6 text-white" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm uppercase truncate">{folder.name}</h4>
                          <p className="text-xs text-gray-500">{folderCount} bookmark{folderCount !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Bookmarks */}
          {sortedBookmarks.length > 0 ? (
            <>
              {!selectedFolder && folders.length > 0 && (
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">All Bookmarks</h3>
              )}
              <BookmarkCompactCards 
                bookmarks={paginatedBookmarks} 
                onUpdate={handleUpdate}
                categoryId={categoryId}
                folders={folders}
              />
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, sortedBookmarks.length)} of {sortedBookmarks.length} bookmarks
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ExternalLink className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks found</h3>
              <p className="text-gray-500">
                {selectedFolder ? 'Move bookmarks to this folder to see them here' : 'Add bookmarks to get started'}
              </p>
            </div>
          )}
        </div>

        {/* Create/Edit Folder Dialog */}
        <Dialog open={isCreateFolderOpen} onOpenChange={(open) => {
          setIsCreateFolderOpen(open)
          if (!open) setEditingFolder(null)
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingFolder ? "Edit Subfolder" : "Create New Subfolder"}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Folder Name</label>
                <Input
                  placeholder="Enter folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newFolderName.trim()) {
                      createOrUpdateFolder()
                    }
                  }}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Folder Color</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {FOLDER_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewFolderColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newFolderColor === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newFolderColor}
                    onChange={(e) => setNewFolderColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <Input
                    value={newFolderColor}
                    onChange={(e) => setNewFolderColor(e.target.value)}
                    placeholder="#3B82F6"
                    className="w-28 font-mono text-sm"
                  />
                  <div 
                    className="w-10 h-10 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: newFolderColor }}
                  >
                    <Folder className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={createOrUpdateFolder} 
                disabled={!newFolderName.trim() || isCreatingFolder}
              >
                {isCreatingFolder ? "Saving..." : (editingFolder ? "Save Changes" : "Create Folder")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </DashboardAuth>
  )
}
