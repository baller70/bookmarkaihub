
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft,
  Folder,
  FolderPlus,
  Layers,
  RefreshCw,
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  bookmarkCount: number;
  folderId?: string;
}

interface CategoryFolder {
  id: string;
  name: string;
  categoryCount: number;
}

const COLORS = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#10B981', // green
  '#F59E0B', // orange
  '#EF4444', // red
  '#6B7280', // gray
  '#EC4899', // pink
  '#14B8A6', // teal
];

export default function ManageCategoriesPage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const [categories, setCategories] = useState<Category[]>([]);
  const [folders, setFolders] = useState<CategoryFolder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFolderManagerOpen, setIsFolderManagerOpen] = useState(false);
  const [isEditFolderModalOpen, setIsEditFolderModalOpen] = useState(false);

  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryColor, setCategoryColor] = useState(COLORS[0]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingFolder, setEditingFolder] = useState<CategoryFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [folderCategorySearch, setFolderCategorySearch] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [categoriesRes, foldersRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/categories/folders'),
      ]);

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
      }

      if (foldersRes.ok) {
        const data = await foldersRes.json();
        setFolders(data.folders || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryName,
          description: categoryDescription,
          color: categoryColor,
        }),
      });

      if (response.ok) {
        toast.success('Category created successfully');
        setIsCreateModalOpen(false);
        resetForm();
        fetchData();
      } else {
        toast.error('Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryName,
          description: categoryDescription,
          color: categoryColor,
        }),
      });

      if (response.ok) {
        toast.success('Category updated successfully');
        setIsEditModalOpen(false);
        setEditingCategory(null);
        resetForm();
        fetchData();
      } else {
        toast.error('Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Category deleted successfully');
        fetchData();
      } else {
        toast.error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleAssignToFolder = async (categoryId: string, folderId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId: folderId === 'unassigned' ? null : folderId }),
      });

      if (response.ok) {
        toast.success('Category assigned successfully');
        fetchData();
      } else {
        toast.error('Failed to assign category');
      }
    } catch (error) {
      console.error('Error assigning category:', error);
      toast.error('Failed to assign category');
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name is required');
      return;
    }

    try {
      const response = await fetch('/api/categories/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName }),
      });

      if (response.ok) {
        toast.success('Folder created successfully');
        setNewFolderName('');
        fetchData();
      } else {
        toast.error('Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  const handleUpdateFolder = async () => {
    if (!editingFolder || !newFolderName.trim()) {
      toast.error('Folder name is required');
      return;
    }

    try {
      const response = await fetch(`/api/categories/folders/${editingFolder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName }),
      });

      if (response.ok) {
        toast.success('Folder updated successfully');
        setIsEditFolderModalOpen(false);
        setEditingFolder(null);
        setNewFolderName('');
        fetchData();
      } else {
        toast.error('Failed to update folder');
      }
    } catch (error) {
      console.error('Error updating folder:', error);
      toast.error('Failed to update folder');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder?')) return;

    try {
      const response = await fetch(`/api/categories/folders/${folderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Folder deleted successfully');
        fetchData();
      } else {
        toast.error('Failed to delete folder');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  const handleSaveAssignments = async () => {
    if (!selectedFolderId) {
      toast.error('Please select a folder');
      return;
    }

    try {
      const response = await fetch('/api/categories/bulk-assign', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryIds: selectedCategories,
          folderId: selectedFolderId,
        }),
      });

      if (response.ok) {
        toast.success('Categories assigned successfully');
        setIsFolderManagerOpen(false);
        setSelectedCategories([]);
        setSelectedFolderId('');
        fetchData();
      } else {
        toast.error('Failed to assign categories');
      }
    } catch (error) {
      console.error('Error assigning categories:', error);
      toast.error('Failed to assign categories');
    }
  };

  const resetForm = () => {
    setCategoryName('');
    setCategoryDescription('');
    setCategoryColor(COLORS[0]);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
    setCategoryColor(category.color);
    setIsEditModalOpen(true);
  };

  const openEditFolderModal = (folder: CategoryFolder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setIsEditFolderModalOpen(true);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unassignedCategories = filteredCategories.filter((cat) => !cat.folderId);

  const folderFilteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(folderCategorySearch.toLowerCase())
  );

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = folderFilteredCategories.map((cat) => cat.id);
    setSelectedCategories(visibleIds);
  };

  const clearSelection = () => {
    setSelectedCategories([]);
  };

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Loading categories...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#FAFAFA] pb-20">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsFolderManagerOpen(true)}
                className="bg-black hover:bg-gray-800 text-white"
              >
                <Folder className="w-4 h-4 mr-2" />
                Manage Folders
              </Button>
              <div className="flex items-center gap-2 ml-auto">
                <Layers className="w-5 h-5" />
                <span className="font-semibold">Categories</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Title Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 uppercase">MANAGE CATEGORIES</h1>
              <p className="text-muted-foreground">
                Organize your bookmarks with custom categories
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                className="bg-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-black hover:bg-gray-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFolderManagerOpen(true)}
                className="bg-white"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                Add Folder
              </Button>
            </div>
          </div>

          {/* Folders Grid */}
          {folders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow cursor-pointer relative"
                  onClick={() => router.push(`/bookmarkai-addons/categories/folders/${folder.id}`)}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-4 right-4 h-8 w-8 p-0"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditFolderModal(folder);
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Folder
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Folder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Folder className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1 uppercase">{folder.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        <Layers className="w-3 h-3 inline mr-1" />
                        {folder.categoryCount} {folder.categoryCount === 1 ? 'category' : 'categories'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>

          {/* Unassigned Categories */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold uppercase">UNASSIGNED</h2>
              <span className="text-sm text-muted-foreground">
                {unassignedCategories.length} categories
              </span>
            </div>

            {unassignedCategories.length === 0 ? (
              <div className="bg-white rounded-lg border p-8 text-center">
                <p className="text-muted-foreground">All categories are assigned.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unassignedCategories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm mb-1 truncate">{category.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {category.bookmarkCount} bookmarks
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(category)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Folder: {category.folderId 
                        ? folders.find(f => f.id === category.folderId)?.name || 'Unknown' 
                        : 'Unassigned'}
                    </div>
                    <Select
                      value={category.folderId || 'unassigned'}
                      onValueChange={(value) => handleAssignToFolder(category.id, value)}
                    >
                      <SelectTrigger className="w-full bg-white h-8 text-xs">
                        <SelectValue placeholder="Select folder..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {folders.map((folder) => (
                          <SelectItem key={folder.id} value={folder.id}>
                            {folder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Category Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>CREATE NEW CATEGORY</DialogTitle>
              <DialogDescription>
                Add a new category to organize your bookmarks.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  placeholder="Enter category name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Enter category description"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  className="bg-white min-h-[80px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Color</label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCategoryColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        categoryColor === color ? 'ring-2 ring-offset-2 ring-yellow-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleCreateCategory}
                className="bg-black hover:bg-gray-800 text-white"
              >
                Create Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Category Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>EDIT CATEGORY</DialogTitle>
              <DialogDescription>
                Update the category information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  placeholder="Enter category name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Enter category description"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  className="bg-white min-h-[80px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Color</label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCategoryColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        categoryColor === color ? 'ring-2 ring-offset-2 ring-yellow-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleUpdateCategory}
                className="bg-black hover:bg-gray-800 text-white"
              >
                Update Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Folder Modal */}
        <Dialog open={isEditFolderModalOpen} onOpenChange={setIsEditFolderModalOpen}>
          <DialogContent className="bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>EDIT FOLDER</DialogTitle>
              <DialogDescription>
                Update the folder name.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Folder Name</label>
                <Input
                  placeholder="Enter folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditFolderModalOpen(false);
                  setEditingFolder(null);
                  setNewFolderName('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateFolder}
                className="bg-black hover:bg-gray-800 text-white"
              >
                Update Folder
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Folder Manager Modal */}
        <Dialog open={isFolderManagerOpen} onOpenChange={setIsFolderManagerOpen}>
          <DialogContent className="bg-white max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>FOLDER MANAGER</DialogTitle>
              <DialogDescription>
                Create folders and assign categories to a selected folder. You can also quickly add a new folder here.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Top Section: Select Folder + Quick Add */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select folder</label>
                  <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="— Choose a folder —" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Quick add folder</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="bg-white"
                    />
                    <Button
                      onClick={handleCreateFolder}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Assign Categories Section */}
              <div>
                <h3 className="text-sm font-medium mb-3">Assign categories to this folder</h3>
                <div className="mb-3">
                  <Input
                    placeholder="Search categories..."
                    value={folderCategorySearch}
                    onChange={(e) => setFolderCategorySearch(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">
                    Selected: {selectedCategories.length}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllVisible}
                      className="text-xs"
                    >
                      Select all visible
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                      className="text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-white">
                  <div className="grid grid-cols-2 gap-3">
                    {folderFilteredCategories.map((category) => (
                      <div key={category.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategorySelection(category.id)}
                        />
                        <label className="text-sm cursor-pointer flex-1">
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSaveAssignments}
                className="bg-black hover:bg-gray-800 text-white"
              >
                Save Assignments
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
