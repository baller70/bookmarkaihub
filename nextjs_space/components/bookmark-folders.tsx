'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, MoreVertical, Palette, Type, Check, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string | null;
  favicon: string | null;
  category: {
    id: string;
    name: string;
    color: string;
    backgroundColor?: string;
  } | null;
  isFavorite: boolean;
  priority: string | null;
}

export default function BookmarkFolders({ bookmarks, onUpdate }: { bookmarks: Bookmark[], onUpdate: () => void }) {
  const router = useRouter();
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);
  const [tempBackgroundColor, setTempBackgroundColor] = useState('#FFFFFF');
  const [tempOutlineColor, setTempOutlineColor] = useState('#000000');

  // Group bookmarks by category
  const categorizedBookmarks = useMemo(() => {
    const grouped = new Map<string, { category: any; bookmarks: any[] }>();

    bookmarks?.forEach((bookmark) => {
      const categoryId = bookmark.category?.id || "uncategorized";
      const categoryName = bookmark.category?.name || "UNCATEGORIZED";
      const categoryColor = bookmark.category?.color;
      const categoryBackgroundColor = bookmark.category?.backgroundColor;

      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, {
          category: {
            id: categoryId,
            name: categoryName,
            color: categoryColor,
            backgroundColor: categoryBackgroundColor,
          },
          bookmarks: [],
        });
      }
      grouped.get(categoryId)?.bookmarks.push(bookmark);
    });

    return Array.from(grouped.values());
  }, [bookmarks]);

  const handleEditName = (category: any) => {
    setEditingCategoryId(category.id);
    setEditedName(category.name);
  };

  const handleSaveName = async (categoryId: string) => {
    if (!editedName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedName.trim() }),
      });

      if (!response.ok) throw new Error('Failed to update category name');

      toast.success('Category name updated');
      setEditingCategoryId(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating category name:', error);
      toast.error('Failed to update category name');
    }
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditedName('');
  };

  const handleOpenColorPicker = (category: any) => {
    setColorPickerOpen(category.id);
    setTempBackgroundColor(category.backgroundColor || '#FFFFFF');
    setTempOutlineColor(category.color || '#000000');
  };

  const handleSaveColors = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backgroundColor: tempBackgroundColor,
          color: tempOutlineColor,
        }),
      });

      if (!response.ok) throw new Error('Failed to update colors');

      toast.success('Folder colors updated');
      setColorPickerOpen(null);
      
      // Refresh only after closing the color picker to prevent interruption
      setTimeout(() => {
        onUpdate();
      }, 100);
    } catch (error) {
      console.error('Error updating colors:', error);
      toast.error('Failed to update colors');
    }
  };

  const handleFolderClick = (categoryId: string) => {
    // Don't navigate for uncategorized
    if (categoryId === 'uncategorized') return;
    
    router.push(`/categories/${categoryId}`);
  };

  if (!bookmarks?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Folder className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks found</h3>
        <p className="text-gray-500">Create your first bookmark to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Folder 2.0</h2>
        <p className="text-gray-600">Advanced folder management with drag-and-drop functionality</p>
      </div>

      {/* Folder Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {categorizedBookmarks.map(({ category, bookmarks: categoryBookmarks }) => (
          <div
            key={category.id}
            onClick={() => handleFolderClick(category.id)}
            className="group relative bg-white border border-black rounded-lg p-6 hover:shadow-md hover:border-gray-900 transition-all cursor-pointer"
            style={{
              ...(category.backgroundColor && { backgroundColor: category.backgroundColor }),
              ...(category.color && { borderColor: category.color, borderWidth: '2px' }),
            }}
          >
            {/* Three Dot Menu - Top Right */}
            {category.id !== 'uncategorized' && (
              <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-white/80"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-700" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem
                      onClick={() => handleEditName(category)}
                      className="cursor-pointer"
                    >
                      <Type className="mr-2 h-4 w-4" />
                      Edit Category Name
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleOpenColorPicker(category)}
                      className="cursor-pointer"
                    >
                      <Palette className="mr-2 h-4 w-4" />
                      Change Colors
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Large Folder Icon with Dark Square Background */}
            <div className="flex justify-start mb-5">
              <div className="bg-gray-900 rounded-md p-3 flex items-center justify-center">
                <Folder
                  className="w-16 h-16 text-white"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Category Name - Editable */}
            {editingCategoryId === category.id ? (
              <div className="mb-3">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-left font-bold text-base uppercase tracking-wide mb-2"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName(category.id);
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSaveName(category.id)}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <h3 className="text-left font-bold text-base text-gray-900 mb-2 uppercase tracking-wide">
                {category.name}
              </h3>
            )}

            {/* Color Picker Panel */}
            {colorPickerOpen === category.id && (
              <div className="mb-4 p-3 bg-white rounded-md border border-gray-200">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="bg-color" className="text-xs font-medium text-gray-700">
                      Background Color
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="bg-color"
                        type="color"
                        value={tempBackgroundColor}
                        onChange={(e) => setTempBackgroundColor(e.target.value)}
                        className="h-9 w-16 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={tempBackgroundColor}
                        onChange={(e) => setTempBackgroundColor(e.target.value)}
                        className="h-9 flex-1 text-xs"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="outline-color" className="text-xs font-medium text-gray-700">
                      Outline Color
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="outline-color"
                        type="color"
                        value={tempOutlineColor}
                        onChange={(e) => setTempOutlineColor(e.target.value)}
                        className="h-9 w-16 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={tempOutlineColor}
                        onChange={(e) => setTempOutlineColor(e.target.value)}
                        className="h-9 flex-1 text-xs"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveColors(category.id)}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setColorPickerOpen(null)}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-left text-sm text-gray-600 mb-4">
              {category.name} related bookmarks
            </p>

            {/* Bookmark Count */}
            <div className="flex items-center justify-start gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>{categoryBookmarks.length} bookmark{categoryBookmarks.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
