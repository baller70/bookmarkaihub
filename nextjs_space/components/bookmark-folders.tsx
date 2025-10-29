
'use client';

import { useState, useEffect } from 'react';
import { FolderIcon, ArrowLeftIcon, BookmarkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string;
  bookmarkCount: number;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string | null;
  favicon: string | null;
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export default function BookmarkFolders({ bookmarks }: { bookmarks: any[] }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Category | null>(null);
  const [folderBookmarks, setFolderBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Group bookmarks by category
    const categoryMap = new Map<string, Category>();

    bookmarks.forEach((bookmark) => {
      // Handle both direct category and categories array
      const categories = bookmark.categories || [];
      
      categories.forEach((catRel: any) => {
        const cat = catRel.category;
        if (cat) {
          const catId = cat.id;
          if (categoryMap.has(catId)) {
            const existingCat = categoryMap.get(catId)!;
            existingCat.bookmarkCount += 1;
          } else {
            categoryMap.set(catId, {
              id: cat.id,
              name: cat.name,
              description: `${cat.name} related bookmarks`,
              color: cat.color || '#3b82f6',
              bookmarkCount: 1,
            });
          }
        }
      });
    });

    // Convert to array and sort by name
    const categoriesArray = Array.from(categoryMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    setCategories(categoriesArray);
  }, [bookmarks]);

  const handleFolderClick = (folder: Category) => {
    setSelectedFolder(folder);
    
    // Filter bookmarks for this folder
    const filtered = bookmarks.filter((bookmark) => {
      const categories = bookmark.categories || [];
      return categories.some((catRel: any) => catRel.category?.id === folder.id);
    });
    setFolderBookmarks(filtered);
    
    toast.success(`Opened folder: ${folder.name}`);
  };

  const handleBackToFolders = () => {
    setSelectedFolder(null);
    setFolderBookmarks([]);
  };

  const getIconColor = (color: string) => {
    return color || '#3b82f6';
  };

  if (selectedFolder) {
    return (
      <div className="space-y-6">
        {/* Back to Folders Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleBackToFolders}
            className="gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Folders
          </Button>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: selectedFolder.color }}
            >
              <FolderIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{selectedFolder.name}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedFolder.description}
              </p>
            </div>
          </div>
        </div>

        {/* Bookmarks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {folderBookmarks.map((bookmark) => (
            <Card
              key={bookmark.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Logo/Image */}
                  <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
                    {bookmark.favicon ? (
                      <div className="w-full h-full flex items-center justify-center bg-white">
                        <Image
                          src={bookmark.favicon}
                          alt={bookmark.title}
                          width={80}
                          height={80}
                          className="object-contain"
                        />
                      </div>
                    ) : bookmark.imageUrl ? (
                      <Image
                        src={bookmark.imageUrl}
                        alt={bookmark.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookmarkIcon className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Title and URL */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm line-clamp-2">
                      {bookmark.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {bookmark.url}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {folderBookmarks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FolderIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No bookmarks in this folder</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Folder 2.0</h1>
        <p className="text-muted-foreground">
          Advanced folder management with drag-and-drop functionality.
        </p>
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="hover:shadow-lg transition-all cursor-pointer group hover:scale-105"
            onClick={() => handleFolderClick(category)}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Folder Icon */}
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: getIconColor(category.color) }}
                >
                  <FolderIcon className="w-8 h-8 text-white" />
                </div>

                {/* Folder Name */}
                <div>
                  <h3 className="font-bold text-base uppercase mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                </div>

                {/* Bookmark Count */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookmarkIcon className="w-4 h-4" />
                  <span>
                    {category.bookmarkCount}{' '}
                    {category.bookmarkCount === 1 ? 'bookmark' : 'bookmarks'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FolderIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No folders found. Create categories to organize your bookmarks.</p>
        </div>
      )}
    </div>
  );
}
