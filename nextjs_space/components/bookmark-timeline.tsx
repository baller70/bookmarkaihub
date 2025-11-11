
'use client';

import React, { useState } from 'react';
import { Clock, Search, ChevronDown, Plus, TrendingUp, Filter, ExternalLink, MoreVertical, Heart, Clock as ClockIcon, Edit2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface BookmarkTimelineProps {
  bookmarks: Bookmark[];
  onUpdate?: () => void;
}

interface TimelineGroup {
  label: string;
  bookmarks: Bookmark[];
}

export function BookmarkTimeline({ bookmarks, onUpdate }: BookmarkTimelineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeGrouping, setTimeGrouping] = useState('day');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['JUST NOW']));
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [draggedBookmarkId, setDraggedBookmarkId] = useState<string | null>(null);
  const [orderedBookmarks, setOrderedBookmarks] = useState<Bookmark[]>(bookmarks);

  // Update ordered bookmarks when bookmarks prop changes
  React.useEffect(() => {
    setOrderedBookmarks(bookmarks);
  }, [bookmarks]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, bookmarkId: string) => {
    setDraggedBookmarkId(bookmarkId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetBookmarkId: string) => {
    e.preventDefault();
    
    if (!draggedBookmarkId || draggedBookmarkId === targetBookmarkId) {
      setDraggedBookmarkId(null);
      return;
    }

    // Reorder bookmarks in state
    const sourceIndex = orderedBookmarks.findIndex(b => b.id === draggedBookmarkId);
    const targetIndex = orderedBookmarks.findIndex(b => b.id === targetBookmarkId);
    
    if (sourceIndex !== -1 && targetIndex !== -1) {
      const newBookmarks = [...orderedBookmarks];
      const [removed] = newBookmarks.splice(sourceIndex, 1);
      newBookmarks.splice(targetIndex, 0, removed);
      setOrderedBookmarks(newBookmarks);
    }
    
    setDraggedBookmarkId(null);
  };

  const handleDragEnd = () => {
    setDraggedBookmarkId(null);
  };

  // Group bookmarks by time
  const groupBookmarks = (): TimelineGroup[] => {
    // For now, we'll just group all as "JUST NOW"
    // In a real implementation, this would group by Day, Week, Month based on timeGrouping
    return [
      {
        label: 'JUST NOW',
        bookmarks: filteredBookmarks,
      },
    ];
  };

  // Filter bookmarks
  const filteredBookmarks = orderedBookmarks.filter((bookmark) => {
    const matchesSearch =
      searchQuery === '' ||
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || bookmark.category?.id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const timelineGroups = groupBookmarks();

  const toggleGroup = (label: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedGroups(newExpanded);
  };

  const expandAll = () => {
    setExpandedGroups(new Set(timelineGroups.map((g) => g.label)));
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  const toggleDescription = (bookmarkId: string) => {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(bookmarkId)) {
      newExpanded.delete(bookmarkId);
    } else {
      newExpanded.add(bookmarkId);
    }
    setExpandedDescriptions(newExpanded);
  };

  // Get pastel background colors for cards
  const getCardBackground = (index: number) => {
    const colors = [
      'bg-blue-50/50',
      'bg-pink-50/50',
      'bg-purple-50/50',
      'bg-indigo-50/50',
      'bg-green-50/50',
      'bg-yellow-50/50',
      'bg-red-50/50',
      'bg-orange-50/50',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Timeline View</h1>
        </div>
        <p className="text-gray-600">Chronological view of your bookmarks journey</p>
      </div>

      {/* Timeline Controls */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Timeline Controls</h2>
            <Badge variant="secondary" className="bg-white/50">
              0 custom categories
            </Badge>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Category
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>

          {/* Time Grouping */}
          <Select value={timeGrouping} onValueChange={setTimeGrouping}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {/* Add more categories dynamically */}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Button variant="outline" className="bg-white">
            <Filter className="w-4 h-4 mr-2" />
            Newest First
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-200">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Total: {bookmarks.length} bookmarks</span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>Showing: {filteredBookmarks.length} bookmarks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs">
                1
              </div>
              <span>Groups: {timelineGroups.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="ghost" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {timelineGroups.map((group, groupIndex) => (
          <div key={group.label} className="mb-8">
            {/* Group Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{group.label}</h3>
                <p className="text-sm text-gray-500">{group.bookmarks.length} bookmarks</p>
              </div>
              <button className="ml-auto text-gray-400 hover:text-gray-600">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            {/* Timeline Items */}
            {expandedGroups.has(group.label) && (
              <div className="relative pl-8">
                {/* Vertical Timeline Line */}
                <div className="absolute left-[20px] top-0 bottom-0 w-0.5 bg-indigo-200" />

                {group.bookmarks.map((bookmark, index) => {
                  const isExpanded = expandedDescriptions.has(bookmark.id);
                  const truncatedDescription =
                    bookmark.description?.length > 200
                      ? bookmark.description.substring(0, 200) + '...'
                      : bookmark.description;

                  return (
                    <div 
                      key={bookmark.id} 
                      className="relative mb-6"
                      draggable
                      onDragStart={(e) => handleDragStart(e, bookmark.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, bookmark.id)}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Timeline Dot */}
                      <div className="absolute left-[-12px] top-6 w-5 h-5 bg-indigo-600 rounded-full border-4 border-white" />

                      {/* Bookmark Card */}
                      <div
                        className={`relative rounded-xl p-6 border hover:shadow-lg transition-all cursor-move group overflow-hidden ${
                          draggedBookmarkId === bookmark.id ? 'opacity-50 border-blue-500' : 'border-gray-200'
                        } bg-gradient-to-br from-pink-50/30 via-purple-50/20 to-blue-50/30`}
                      >
                        {/* Full Background Faded Logo */}
                        {bookmark.favicon && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none overflow-hidden">
                            <Image
                              src={bookmark.favicon}
                              alt=""
                              width={400}
                              height={400}
                              className="object-contain"
                            />
                          </div>
                        )}

                        <div className="flex gap-4 relative z-10">
                          {/* Logo */}
                          <div className="flex-shrink-0">
                            <div className="relative w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                              {bookmark.favicon ? (
                                <Image
                                  src={bookmark.favicon}
                                  alt={bookmark.title}
                                  fill
                                  className="object-contain p-2"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                  {bookmark.title.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Title and Category */}
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <h4
                                  className="text-xl font-bold text-indigo-600 hover:text-indigo-700 mb-2 cursor-pointer"
                                  onClick={() => setSelectedBookmark(bookmark)}
                                >
                                  {bookmark.title}
                                </h4>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge
                                    className="bg-white/80 text-gray-700 hover:bg-white"
                                    style={{
                                      borderLeft: `3px solid ${bookmark.category?.color || '#6366f1'}`,
                                    }}
                                  >
                                    {bookmark.category?.name || 'Uncategorized'}
                                  </Badge>
                                  {bookmark.isFavorite && (
                                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  className="p-2 hover:bg-white rounded-lg transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(bookmark.url, '_blank');
                                  }}
                                >
                                  <ExternalLink className="w-4 h-4 text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-white rounded-lg transition-colors">
                                  <MoreVertical className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                            </div>

                            {/* Description */}
                            {bookmark.description && (
                              <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                                {isExpanded ? bookmark.description : truncatedDescription}
                                {bookmark.description.length > 200 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleDescription(bookmark.id);
                                    }}
                                    className="ml-2 text-indigo-600 hover:text-indigo-700 font-medium"
                                  >
                                    {isExpanded ? 'Less' : 'More'}
                                  </button>
                                )}
                              </p>
                            )}

                            {/* Footer with Date */}
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                              <ClockIcon className="w-4 h-4" />
                              <span>
                                Added{' '}
                                {new Date(bookmark.createdAt).toLocaleDateString('en-US', {
                                  month: '2-digit',
                                  day: '2-digit',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>

                            {/* Tags */}
                            {bookmark.tags && bookmark.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {bookmark.tags.map((tag) => (
                                  <Badge
                                    key={tag.id}
                                    variant="secondary"
                                    className="bg-white/60 text-gray-700 hover:bg-white text-xs"
                                  >
                                    {tag.name}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* URL */}
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-gray-500 rounded-full" />
                              </div>
                              <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-gray-500 hover:text-indigo-600 truncate"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {bookmark.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

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
