'use client';

import { useMemo } from 'react';
import { Folder } from 'lucide-react';

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
  // Group bookmarks by category
  const categorizedBookmarks = useMemo(() => {
    const grouped = new Map<string, { category: any; bookmarks: any[] }>();

    bookmarks?.forEach((bookmark) => {
      const categoryId = bookmark.category?.id || "uncategorized";
      const categoryName = bookmark.category?.name || "UNCATEGORIZED";
      const categoryColor = bookmark.category?.color || "#94A3B8";

      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, {
          category: {
            id: categoryId,
            name: categoryName,
            color: categoryColor,
          },
          bookmarks: [],
        });
      }
      grouped.get(categoryId)?.bookmarks.push(bookmark);
    });

    return Array.from(grouped.values());
  }, [bookmarks]);

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
            className="group relative bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
          >
            {/* Large Folder Icon with Dark Square Background */}
            <div className="flex justify-start mb-5">
              <div className="bg-gray-900 rounded-md p-3 flex items-center justify-center">
                <Folder
                  className="w-16 h-16 text-white"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Category Name */}
            <h3 className="text-left font-bold text-base text-gray-900 mb-2 uppercase tracking-wide">
              {category.name}
            </h3>

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
