
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  FolderOpen,
  Layers,
  RefreshCw,
  Plus,
  FolderPlus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Folder,
} from "lucide-react"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  description: string | null
  color: string
  icon: string | null
  userId: string
  _count?: {
    bookmarks: number
  }
}

interface FolderData {
  id: string
  name: string
  categoryCount: number
}

const AVAILABLE_COLORS = [
  "#3B82F6", // blue
  "#A855F7", // purple
  "#10B981", // green
  "#F59E0B", // orange
  "#EF4444", // red
  "#6B7280", // gray
  "#EC4899", // pink
  "#14B8A6", // teal
]

export default function CategoriesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [folders, setFolders] = useState<FolderData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: AVAILABLE_COLORS[0],
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session) {
      fetchCategories()
      fetchFolders()
    }
  }, [session])

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const fetchFolders = async () => {
    // Mock folder data - replace with actual API call
    setFolders([
      { id: "1", name: "PLAYWRIGHT DND FOLDER-1758076082947-86", categoryCount: 1 },
      { id: "2", name: "PLAYWRIGHT DND COUNT-1758109428735-280", categoryCount: 1 },
    ])
  }

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Please enter a category name")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      })

      if (res.ok) {
        toast.success("Category created successfully")
        setIsCreateModalOpen(false)
        setNewCategory({ name: "", description: "", color: AVAILABLE_COLORS[0] })
        fetchCategories()
      } else {
        toast.error("Failed to create category")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateCategory = async () => {
    if (!selectedCategory || !selectedCategory.name.trim()) {
      toast.error("Please enter a category name")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/categories?id=${selectedCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedCategory.name,
          description: selectedCategory.description,
          color: selectedCategory.color,
        }),
      })

      if (res.ok) {
        toast.success("Category updated successfully")
        setIsEditModalOpen(false)
        setSelectedCategory(null)
        fetchCategories()
      } else {
        toast.error("Failed to update category")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Category deleted successfully")
        fetchCategories()
      } else {
        toast.error("Failed to delete category")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {}}
              className="gap-2 bg-black hover:bg-black/90 text-white"
            >
              <FolderOpen className="w-4 h-4" />
              Manage Folders
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="w-4 h-4" />
              <span className="font-medium text-foreground">Categories</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Categories</h1>
            <p className="text-muted-foreground">
              Organize your bookmarks with custom categories
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCategories}
              className="gap-2 bg-black hover:bg-black/90 text-white border-black"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2 bg-black hover:bg-black/90 text-white"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              Add Folder
            </Button>
          </div>
        </div>

        {/* Folders Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow relative bg-card"
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Folder
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Folder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg mb-3">
                <Folder className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm mb-2 break-all">{folder.name}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <FolderOpen className="w-3 h-3" />
                <span>{folder.categoryCount} category</span>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Unassigned Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Unassigned</h2>
            <span className="text-sm text-muted-foreground">
              {filteredCategories.length} categories
            </span>
          </div>

          {filteredCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              All categories are assigned.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                      {category.description && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {category.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {category._count?.bookmarks || 0} bookmarks
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-muted"
                        onClick={() => {
                          setSelectedCategory(category)
                          setIsEditModalOpen(true)
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <select className="w-full text-xs border rounded px-2 py-1 bg-background">
                    <option>Unassigned</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Category Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category to organize your bookmarks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input
                placeholder="Enter category name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Enter category description"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              <div className="flex gap-2">
                {AVAILABLE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      newCategory.color === color
                        ? "border-black scale-110"
                        : "border-transparent"
                    } transition-all`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewCategory({ ...newCategory, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleCreateCategory}
              disabled={isLoading}
              className="bg-black hover:bg-black/90 text-white"
            >
              {isLoading ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category information.
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  placeholder="Enter category name"
                  value={selectedCategory.name}
                  onChange={(e) =>
                    setSelectedCategory({
                      ...selectedCategory,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Enter category description"
                  value={selectedCategory.description || ""}
                  onChange={(e) =>
                    setSelectedCategory({
                      ...selectedCategory,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Color</label>
                <div className="flex gap-2">
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedCategory.color === color
                          ? "border-black scale-110"
                          : "border-transparent"
                      } transition-all`}
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        setSelectedCategory({ ...selectedCategory, color })
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button
              onClick={handleUpdateCategory}
              disabled={isLoading}
              className="bg-black hover:bg-black/90 text-white"
            >
              {isLoading ? "Updating..." : "Update Category"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
