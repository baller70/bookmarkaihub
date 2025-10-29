
"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Folder, Search, RefreshCw, Plus, Pencil, Trash2, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface CategoryFolder {
  id: string
  name: string
  _count?: {
    categories: number
  }
}

interface Category {
  id: string
  name: string
  color: string
  icon: string
  folderId: string | null
  folder?: CategoryFolder | null
  _count?: {
    bookmarks: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [folders, setFolders] = useState<CategoryFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: "", description: "", color: "#3b82f6" })
  const [newFolder, setNewFolder] = useState({ name: "" })
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [categoriesRes, foldersRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/categories/folders')
      ])
      const categoriesData = await categoriesRes.json()
      const foldersData = await foldersRes.json()
      
      setCategories(categoriesData.categories || [])
      setFolders(foldersData.folders || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleFolderClick = (folderId: string) => {
    router.push(`/categories?folder=${folderId}`)
  }

  const handleUpdateCategoryFolder = async (categoryId: string, folderId: string | null) => {
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId: folderId === 'unassigned' ? null : folderId })
      })

      if (!res.ok) throw new Error('Failed to update category')

      toast.success('Category folder updated')
      fetchData()
    } catch (error) {
      console.error('Error updating category folder:', error)
      toast.error('Failed to update category folder')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete category')

      toast.success('Category deleted')
      fetchData()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setNewCategory({
      name: category.name,
      description: "",
      color: category.color || "#3b82f6"
    })
    setIsEditModalOpen(true)
  }

  const handleSaveCategory = async () => {
    if (!editingCategory) return

    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.name,
          color: newCategory.color
        })
      })

      if (!res.ok) throw new Error('Failed to update category')

      toast.success('Category updated')
      setIsEditModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Failed to update category')
    }
  }

  const handleCreateCategory = async () => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description,
          color: newCategory.color,
          icon: "📁"
        })
      })

      if (!res.ok) throw new Error('Failed to create category')

      toast.success('Category created')
      setIsAddCategoryModalOpen(false)
      setNewCategory({ name: "", description: "", color: "#3b82f6" })
      fetchData()
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
    }
  }

  const handleCreateFolder = async () => {
    try {
      const res = await fetch('/api/categories/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolder.name })
      })

      if (!res.ok) throw new Error('Failed to create folder')

      toast.success('Folder created')
      setIsAddFolderModalOpen(false)
      setNewFolder({ name: "" })
      fetchData()
    } catch (error) {
      console.error('Error creating folder:', error)
      toast.error('Failed to create folder')
    }
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const unassignedCategories = filteredCategories.filter(cat => !cat.folderId)

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

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {/* Bordered Container */}
          <div className="border border-gray-300 rounded-lg p-3 sm:p-4 md:p-6 bg-white overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">MANAGE CATEGORIES</h1>
              <p className="text-sm text-gray-600">Organize your bookmarks with custom categories</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => setIsAddCategoryModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddFolderModalOpen(true)}
                className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                <Folder className="h-4 w-4 mr-2" />
                Add Folder
              </Button>
            </div>
          </div>

          {/* Folders */}
          {folders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {folders.map((folder) => (
                <Card
                  key={folder.id}
                  className="p-6 bg-white hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-blue-300"
                  onClick={() => handleFolderClick(folder.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-blue-600 rounded-xl flex-shrink-0">
                      <Folder className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 uppercase tracking-wide mb-3 break-words">
                        {folder.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">{folder._count?.categories || 0} category</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-300"
              />
            </div>
          </div>

          {/* Unassigned Section */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">UNASSIGNED</h2>
            <span className="text-sm text-gray-700 font-medium">{unassignedCategories.length} categories</span>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unassignedCategories.map((category) => {
              const bookmarkCount = category._count?.bookmarks || 0
              return (
                <Card
                  key={category.id}
                  className="p-3 bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 rounded-xl"
                >
                  {/* Top Row: Color, Name, and Actions */}
                  <div className="flex items-start gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: category.color || '#3b82f6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 truncate leading-tight">
                        {category.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-gray-100 rounded"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Pencil className="h-3.5 w-3.5 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-red-50 rounded"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  {/* Bookmark Count */}
                  <div className="mb-2">
                    <span className="text-xs text-gray-600 font-medium">
                      {bookmarkCount} bookmark{bookmarkCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Folder Assignment Dropdown */}
                  <Select
                    value={category.folderId || 'unassigned'}
                    onValueChange={(value) => handleUpdateCategoryFolder(category.id, value)}
                  >
                    <SelectTrigger className="w-full h-8 bg-gray-50 hover:bg-gray-100 border-gray-200 text-xs text-gray-900 rounded-md">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Card>
              )
            })}
          </div>

          {/* Empty State */}
          {unassignedCategories.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Folder className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">NO CATEGORIES FOUND</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Create your first category to get started"}
              </p>
            </div>
          )}
          </div>
        </div>

        {/* Edit Category Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update the category details below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-color">Color</Label>
                <Input
                  id="edit-color"
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="mt-1 h-10"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCategory}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Category Modal */}
        <Dialog open={isAddCategoryModalOpen} onOpenChange={setIsAddCategoryModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
              <DialogDescription>
                Create a new category for your bookmarks.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="new-name">Name</Label>
                <Input
                  id="new-name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="mt-1"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <Label htmlFor="new-description">Description (Optional)</Label>
                <Input
                  id="new-description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="mt-1"
                  placeholder="Enter description"
                />
              </div>
              <div>
                <Label htmlFor="new-color">Color</Label>
                <Input
                  id="new-color"
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="mt-1 h-10"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddCategoryModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCategory}>
                Create Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Folder Modal */}
        <Dialog open={isAddFolderModalOpen} onOpenChange={setIsAddFolderModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Folder</DialogTitle>
              <DialogDescription>
                Create a new folder to organize your categories.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="folder-name">Folder Name</Label>
                <Input
                  id="folder-name"
                  value={newFolder.name}
                  onChange={(e) => setNewFolder({ name: e.target.value })}
                  className="mt-1"
                  placeholder="Enter folder name"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddFolderModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder}>
                Create Folder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </DashboardAuth>
  )
}
