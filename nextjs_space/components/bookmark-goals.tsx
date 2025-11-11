'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Target, ExternalLink, Star } from 'lucide-react';
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

export function BookmarkGoals({ bookmarks, onUpdate }: { bookmarks: Bookmark[], onUpdate: () => void }) {
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);

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
        <Target className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks found</h3>
        <p className="text-gray-500">Create your first bookmark to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="group relative bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer"
            onClick={() => setSelectedBookmark(bookmark)}
          >
            {/* Target Icon Badge */}
            <div className="absolute -top-3 -right-3">
              <div className="bg-blue-500 rounded-full p-2 shadow-lg">
                <Target className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Favicon */}
                <div className="w-12 h-12 flex-shrink-0 relative bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                  {bookmark.favicon ? (
                    <Image
                      src={bookmark.favicon}
                      alt={bookmark.title}
                      fill
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {bookmark.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Favorite Star */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleToggleFavorite(e, bookmark.id, bookmark.isFavorite)}
                >
                  <Star
                    className={`w-5 h-5 ${bookmark.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                  />
                </Button>
              </div>
            </div>

            {/* Title */}
            <h3 className="font-bold text-base text-gray-900 mb-2 line-clamp-2">
              {bookmark.title}
            </h3>

            {/* Description */}
            {bookmark.description && (
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                {bookmark.description}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t">
              {bookmark.priority && (
                <Badge 
                  variant="secondary" 
                  className="text-xs font-semibold"
                  style={{ 
                    backgroundColor: bookmark.category?.color ? `${bookmark.category.color}20` : undefined,
                    color: bookmark.category?.color || undefined
                  }}
                >
                  {bookmark.priority}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 ml-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(bookmark.url, '_blank');
                }}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                <span className="text-xs">Visit</span>
              </Button>
            </div>

            {/* Category Badge */}
            {bookmark.category && (
              <div className="mt-3 pt-3 border-t">
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ 
                    borderColor: bookmark.category.color,
                    color: bookmark.category.color
                  }}
                >
                  {bookmark.category.name}
                </Badge>
              </div>
            )}
          </div>
        ))}
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
