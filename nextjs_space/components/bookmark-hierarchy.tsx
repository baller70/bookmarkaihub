
'use client';

import React, { useState } from 'react';
import { FolderKanban, Search, Plus, Settings, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookmarkDetailModal } from './bookmark-detail-modal';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string;
  favicon: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  tags: { id: string; name: string }[];
  isFavorite: boolean;
  createdAt: string;
  visitCount?: number;
  engagementPercentage?: number;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  bookmarks: Bookmark[];
  collaborators?: number;
}

interface BookmarkHierarchyProps {
  bookmarks: Bookmark[];
  onUpdate?: () => void;
}

export function BookmarkHierarchy({ bookmarks }: BookmarkHierarchyProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);
  const [folderPages, setFolderPages] = useState<Record<string, number>>({});

  // Group bookmarks by category to create folders
  const folders: Folder[] = React.useMemo(() => {
    const folderMap = new Map<string, Folder>();
    
    bookmarks.forEach((bookmark) => {
      const categoryId = bookmark.category?.id || 'uncategorized';
      const categoryName = bookmark.category?.name || 'Uncategorized';
      const categoryColor = bookmark.category?.color || '#6366f1';
      
      if (!folderMap.has(categoryId)) {
        folderMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          color: categoryColor,
          bookmarks: [],
          collaborators: 0,
        });
      }
      
      folderMap.get(categoryId)!.bookmarks.push(bookmark);
    });
    
    return Array.from(folderMap.values());
  }, [bookmarks]);

  // Filter folders by search query
  const filteredFolders = folders.filter((folder) => {
    if (searchQuery === '') return true;
    return (
      folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      folder.bookmarks.some((b) =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  // Get folder colors
  const getFolderColor = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
      '#FF6B6B': { bg: 'bg-red-50', border: 'border-l-red-400', icon: 'bg-red-400' },
      '#4ECDC4': { bg: 'bg-teal-50', border: 'border-l-teal-400', icon: 'bg-teal-400' },
      '#FFE66D': { bg: 'bg-yellow-50', border: 'border-l-yellow-400', icon: 'bg-yellow-400' },
      '#6366f1': { bg: 'bg-blue-50', border: 'border-l-blue-400', icon: 'bg-blue-400' },
      '#A8E6CF': { bg: 'bg-green-50', border: 'border-l-green-400', icon: 'bg-green-400' },
      '#C7CEEA': { bg: 'bg-indigo-50', border: 'border-l-indigo-400', icon: 'bg-indigo-400' },
      '#B4A7D6': { bg: 'bg-purple-50', border: 'border-l-purple-400', icon: 'bg-purple-400' },
      '#95A5A6': { bg: 'bg-gray-50', border: 'border-l-gray-400', icon: 'bg-gray-400' },
    };

    return colorMap[color] || { bg: 'bg-blue-50', border: 'border-l-blue-400', icon: 'bg-blue-400' };
  };

  // Pagination for folder bookmarks
  const getPageBookmarks = (folder: Folder) => {
    const currentPage = folderPages[folder.id] || 1;
    const itemsPerPage = 5;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return folder.bookmarks.slice(startIndex, endIndex);
  };

  const getTotalPages = (folder: Folder) => {
    const itemsPerPage = 5;
    return Math.ceil(folder.bookmarks.length / itemsPerPage);
  };

  const changePage = (folderId: string, direction: 'prev' | 'next') => {
    setFolderPages((prev) => {
      const currentPage = prev[folderId] || 1;
      const folder = folders.find((f) => f.id === folderId);
      if (!folder) return prev;
      
      const totalPages = getTotalPages(folder);
      let newPage = currentPage;
      
      if (direction === 'next' && currentPage < totalPages) {
        newPage = currentPage + 1;
      } else if (direction === 'prev' && currentPage > 1) {
        newPage = currentPage - 1;
      }
      
      return { ...prev, [folderId]: newPage };
    });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-relaxed md:leading-normal">FOLDER ORGANIZATION CHART</h1>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                {filteredFolders.length} folders
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Organize your existing folders by dragging them between hierarchy levels. Create folders by adding bookmarks in Grid view first.
            </p>
          </div>
        </div>

        {/* Controls Row 1 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Level
            </Button>
            <Button variant="outline" size="sm" className="text-sm">
              <Settings className="w-4 h-4 mr-2" />
              Manage Hierarchy
            </Button>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
        </div>

        {/* Controls Row 2 */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" className="text-sm">
            <Filter className="w-4 h-4 mr-2" />
            Sort
          </Button>
          <Button variant="outline" size="sm" className="text-sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Director Drop Zone */}
      <div className="mb-8">
        <div className="relative bg-blue-100 border-2 border-blue-400 rounded-xl p-12 text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">DIRECTOR</h2>
          <p className="text-lg font-semibold text-yellow-600 flex items-center justify-center gap-2">
            <span className="text-2xl">📁</span>
            DROP ZONE
          </p>
        </div>
      </div>

      {/* Folder Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFolders.map((folder) => {
          const colors = getFolderColor(folder.color);
          const currentPage = folderPages[folder.id] || 1;
          const totalPages = getTotalPages(folder);
          const pageBookmarks = getPageBookmarks(folder);
          const progress = Math.min((folder.bookmarks.length / 10) * 100, 100);

          return (
            <div
              key={folder.id}
              className={`${colors.bg} rounded-xl border-l-4 ${colors.border} shadow-sm hover:shadow-md transition-shadow p-4`}
            >
              {/* Folder Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 ${colors.icon} rounded-lg flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
                  {folder.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{folder.name}</h3>
                  <Badge variant="secondary" className="text-xs bg-white/60">
                    COLLABORATORS
                  </Badge>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  {folder.bookmarks.length} bookmarks
                </span>
                <span className="text-xs text-gray-500">Progress</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className={`${colors.icon} h-2 rounded-full transition-all`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Page {currentPage} of {totalPages}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => changePage(folder.id, 'prev')}
                      disabled={currentPage === 1}
                      className="p-1 hover:bg-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => changePage(folder.id, 'next')}
                      disabled={currentPage === totalPages}
                      className="p-1 hover:bg-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Bookmark List */}
              <div className="space-y-2">
                {pageBookmarks.map((bookmark) => (
                  <button
                    key={bookmark.id}
                    onClick={() => setSelectedBookmark(bookmark)}
                    className="w-full bg-white hover:bg-gray-50 rounded-lg p-3 text-left transition-colors group"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                        {bookmark.favicon ? (
                          <div className="relative w-5 h-5">
                            <Image
                              src={bookmark.favicon}
                              alt={bookmark.title}
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                            {bookmark.title.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600">
                          {bookmark.title}
                        </p>
                        <p className="text-xs text-gray-500">{folder.name}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredFolders.length === 0 && (
        <div className="text-center py-12">
          <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No folders found</h3>
          <p className="text-gray-500">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Create folders by adding bookmarks in Grid view first'}
          </p>
        </div>
      )}

      {/* Bookmark Detail Modal */}
      {selectedBookmark && (
        <BookmarkDetailModal
          bookmark={selectedBookmark}
          open={!!selectedBookmark}
          onOpenChange={(open) => {
            if (!open) setSelectedBookmark(null);
          }}
          onUpdate={() => {}}
        />
      )}
    </div>
  );
}
