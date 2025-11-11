'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FolderIcon, ExternalLink, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookmarkDetailModal } from './bookmark-detail-modal';
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
  } | null;
  isFavorite: boolean;
  priority: string | null;
}

export default function BookmarkFolders({ bookmarks, onUpdate }: { bookmarks: Bookmark[], onUpdate: () => void }) {
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);

  // Group bookmarks by category
  const groupedBookmarks = bookmarks.reduce((acc: any, bookmark) => {
    const categoryName = bookmark.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = {
        category: bookmark.category || { name: 'Uncategorized', color: '#6b7280', id: 'uncategorized' },
        bookmarks: []
      };
    }
    acc[categoryName].bookmarks.push(bookmark);
    return acc;
  }, {});

  const handleToggleFavorite = async (e: React.MouseEvent, bookmarkId: string, currentFavorite: boolean) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentFavorite }),
      });
      if (response.ok) {
        toast.success(currentFavorite ? 'Removed from favorites' : 'Added to favorites');
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  if (!bookmarks?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderIcon className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks found</h3>
        <p className="text-gray-500">Create your first bookmark to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {Object.entries(groupedBookmarks).map(([categoryName, data]: [string, any]) => {
          const cat = data.category;
          const categoryBookmarks = data.bookmarks;

          return (
            <div key={cat.id} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center gap-3 border-b pb-3">
                <FolderIcon className="w-5 h-5" style={{ color: cat.color }} />
                <h2 className="text-lg font-bold text-gray-900">{cat.name}</h2>
                <Badge variant="secondary">{categoryBookmarks.length} bookmarks</Badge>
              </div>

              {/* Bookmarks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryBookmarks.map((bookmark: Bookmark) => (
                  <div
                    key={bookmark.id}
                    className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                    onClick={() => setSelectedBookmark(bookmark)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Favicon */}
                        <div className="w-10 h-10 flex-shrink-0 relative bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                          {bookmark.favicon ? (
                            <Image
                              src={bookmark.favicon}
                              alt={bookmark.title}
                              fill
                              className="object-contain p-1"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                              {bookmark.title.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 min-w-0">
                          {bookmark.title}
                        </h3>
                      </div>

                      {/* Favorite Star */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleToggleFavorite(e, bookmark.id, bookmark.isFavorite)}
                      >
                        <Star
                          className={`w-4 h-4 ${bookmark.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                        />
                      </Button>
                    </div>

                    {/* Description */}
                    {bookmark.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                        {bookmark.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      {bookmark.priority && (
                        <Badge variant="secondary" className="text-xs">
                          {bookmark.priority}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 ml-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(bookmark.url, '_blank');
                        }}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedBookmark && (
        <BookmarkDetailModal
          bookmark={selectedBookmark}
          open={!!selectedBookmark}
          onOpenChange={(open) => !open && setSelectedBookmark(null)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
