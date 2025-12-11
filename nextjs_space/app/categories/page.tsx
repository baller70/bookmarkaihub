"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  Folder, 
  Search, 
  RefreshCw, 
  Plus, 
  Pencil, 
  Trash2, 
  BookOpen, 
  Upload, 
  Image as ImageIcon, 
  X,
  LayoutGrid,
  FolderOpen,
  Layers,
  MoreHorizontal,
  ChevronRight,
  Sparkles
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import { cn } from "@/lib/utils"

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
  logo?: string | null
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
  const [globalLogo, setGlobalLogo] = useState<string | null>(null)
  const [uploadingGlobalLogo, setUploadingGlobalLogo] = useState(false)
  const [uploadingCategoryLogos, setUploadingCategoryLogos] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    fetchData()
    fetchGlobalLogo()
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

  const fetchGlobalLogo = async () => {
    try {
      const res = await fetch('/api/user/custom-logo')
      if (res.ok) {
        const data = await res.json()
        setGlobalLogo(data.customLogoUrl || null)
      }
    } catch (error) {
      console.error('Failed to fetch global logo:', error)
    }
  }

  const handleGlobalLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setUploadingGlobalLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/user/custom-logo', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()
      setGlobalLogo(data.customLogoUrl)
      toast.success('Global category logo uploaded successfully')
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Failed to upload logo')
    } finally {
      setUploadingGlobalLogo(false)
      e.target.value = ''
    }
  }

  const handleRemoveGlobalLogo = async () => {
    try {
      const res = await fetch('/api/user/custom-logo', {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Delete failed')

      setGlobalLogo(null)
      toast.success('Global logo removed')
    } catch (error) {
      console.error('Error removing logo:', error)
      toast.error('Failed to remove logo')
    }
  }

  const handleCategoryLogoUpload = async (categoryId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setUploadingCategoryLogos(prev => new Set(prev).add(categoryId))
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`/api/categories/${categoryId}/logo`, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error('Upload failed')

      toast.success('Category logo uploaded successfully')
      fetchData()
    } catch (error) {
      console.error('Error uploading category logo:', error)
      toast.error('Failed to upload category logo')
    } finally {
      setUploadingCategoryLogos(prev => {
        const next = new Set(prev)
        next.delete(categoryId)
        return next
      })
      e.target.value = ''
    }
  }

  const handleRemoveCategoryLogo = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/categories/${categoryId}/logo`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Delete failed')

      toast.success('Category logo removed')
      fetchData()
    } catch (error) {
      console.error('Error removing category logo:', error)
      toast.error('Failed to remove category logo')
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
  const totalBookmarks = categories.reduce((acc, cat) => acc + (cat._count?.bookmarks || 0), 0)

  if (loading) {
    return (
      <DashboardAuth>
        <DashboardLayout>
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading categories...</p>
            </div>
          </div>
        </DashboardLayout>
      </DashboardAuth>
    )
  }

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="p-4 md:p-6 lg:p-8">
          {/* Main Container with light black background */}
          <div className="max-w-7xl mx-auto bg-gray-900/5 dark:bg-gray-950/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Layers className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                    Categories
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Organize your bookmarks into custom categories
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchData}
                  className="h-9"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddFolderModalOpen(true)}
                  className="h-9"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsAddCategoryModalOpen(true)}
                  className="h-9 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Category
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Categories</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{categories.length}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <LayoutGrid className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Folders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{folders.length}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Folder className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Bookmarks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalBookmarks}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unassigned</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{unassignedCategories.length}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </Card>
          </div>

          {/* Global Logo Section */}
          <Card className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                  Global Category Logo
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Default logo for all category folders. Override with individual logos.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <label htmlFor="global-logo-upload">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={uploadingGlobalLogo}
                    className="cursor-pointer h-8"
                    onClick={() => document.getElementById('global-logo-upload')?.click()}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    {uploadingGlobalLogo ? 'Uploading...' : 'Upload'}
                  </Button>
                  <input
                    id="global-logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleGlobalLogoUpload}
                    className="hidden"
                  />
                </label>
                {globalLogo && (
                  <>
                    <div className="h-10 w-10 rounded-lg border-2 border-blue-300 dark:border-blue-700 overflow-hidden bg-white">
                      <Image
                        src={globalLogo}
                        alt="Global logo"
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveGlobalLogo}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Folders Section */}
          {folders.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  Folders
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {folders.length} folder{folders.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.map((folder) => (
                  <Card
                    key={folder.id}
                    className="group p-4 bg-white dark:bg-slate-800 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer border-gray-200 dark:border-slate-700"
                    onClick={() => handleFolderClick(folder.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Folder className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {folder.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {folder._count?.categories || 0} categories
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Categories Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                {searchQuery ? 'Search Results' : 'Unassigned Categories'}
              </h2>
              <Badge variant="secondary" className="text-xs">
                {unassignedCategories.length} categor{unassignedCategories.length !== 1 ? 'ies' : 'y'}
              </Badge>
            </div>

            {unassignedCategories.length === 0 ? (
              <Card className="p-12 text-center bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                  <Layers className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchQuery ? 'No Categories Found' : 'No Categories Yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  {searchQuery ? 'Try adjusting your search query' : 'Create your first category to get started'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsAddCategoryModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Category
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unassignedCategories.map((category) => {
                  const bookmarkCount = category._count?.bookmarks || 0
                  return (
                    <Card
                      key={category.id}
                      className="group p-4 bg-white dark:bg-slate-800 hover:shadow-lg transition-all border-gray-200 dark:border-slate-700"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {(category.logo || globalLogo) ? (
                          <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                            <Image
                              src={category.logo || globalLogo || ''}
                              alt={category.name}
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div 
                            className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: category.color || '#3b82f6' }}
                          >
                            <Folder className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: category.color || '#3b82f6' }}
                            />
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                              {category.name}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {bookmarkCount} bookmark{bookmarkCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Pencil className="h-3.5 w-3.5 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      {/* Logo Upload */}
                      <div className="flex items-center gap-2 mb-3">
                        <label htmlFor={`logo-upload-${category.id}`} className="flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={uploadingCategoryLogos.has(category.id)}
                            className="w-full h-8 text-xs cursor-pointer"
                            onClick={() => document.getElementById(`logo-upload-${category.id}`)?.click()}
                          >
                            <Upload className="h-3 w-3 mr-1.5" />
                            {uploadingCategoryLogos.has(category.id) ? 'Uploading...' : category.logo ? 'Change Logo' : 'Add Logo'}
                          </Button>
                          <input
                            id={`logo-upload-${category.id}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCategoryLogoUpload(category.id, e)}
                            className="hidden"
                          />
                        </label>
                        {category.logo && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCategoryLogo(category.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>

                      {/* Folder Assignment */}
                      <Select
                        value={category.folderId || 'unassigned'}
                        onValueChange={(value) => handleUpdateCategoryFolder(category.id, value)}
                      >
                        <SelectTrigger className="h-8 text-xs bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600">
                          <SelectValue placeholder="Assign to folder" />
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
            )}
          </div>
          </div>
        </div>

        {/* Edit Category Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="uppercase">Edit Category</DialogTitle>
              <DialogDescription>
                Update the category name and color.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Category name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-color"
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCategory} className="bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Category Modal */}
        <Dialog open={isAddCategoryModalOpen} onOpenChange={setIsAddCategoryModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="uppercase">Create Category</DialogTitle>
              <DialogDescription>
                Add a new category to organize your bookmarks.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">Name</Label>
                <Input
                  id="new-name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-description">Description (Optional)</Label>
                <Input
                  id="new-description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Enter description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-color"
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddCategoryModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCategory} className="bg-blue-600 hover:bg-blue-700">
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Folder Modal */}
        <Dialog open={isAddFolderModalOpen} onOpenChange={setIsAddFolderModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="uppercase">Create Folder</DialogTitle>
              <DialogDescription>
                Create a new folder to organize your categories.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="folder-name">Folder Name</Label>
                <Input
                  id="folder-name"
                  value={newFolder.name}
                  onChange={(e) => setNewFolder({ name: e.target.value })}
                  placeholder="Enter folder name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddFolderModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} className="bg-blue-600 hover:bg-blue-700">
                Create Folder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </DashboardAuth>
  )
}
