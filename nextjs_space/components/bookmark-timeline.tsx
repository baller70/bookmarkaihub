
'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Search, ChevronDown, ChevronLeft, ChevronRight, Plus, TrendingUp, Filter, ExternalLink, MoreVertical, Heart, Clock as ClockIcon, Edit2 } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BookmarkDetailModal } from './bookmark-detail-modal';
import { FitnessRings, RingData } from '@/components/ui/fitness-rings';
import { FitnessRingsModal } from '@/components/ui/fitness-rings-modal';
import { RingColorCustomizer } from '@/components/ui/ring-color-customizer';
import { toast } from 'sonner';

// Default ring colors
const DEFAULT_RING_COLORS = {
  visits: "#EF4444", // Red
  tasks: "#22C55E",  // Green
  time: "#06B6D4",   // Cyan
};

// Local storage key for ring colors
const RING_COLORS_KEY = "bookmarkhub-ring-colors";

// Get ring colors from localStorage
function getRingColors(): Record<string, string> {
  if (typeof window === "undefined") return DEFAULT_RING_COLORS;
  try {
    const stored = localStorage.getItem(RING_COLORS_KEY);
    return stored ? { ...DEFAULT_RING_COLORS, ...JSON.parse(stored) } : DEFAULT_RING_COLORS;
  } catch {
    return DEFAULT_RING_COLORS;
  }
}

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
  updatedAt?: string;
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
  const [timeGrouping, setTimeGrouping] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['All Time']));
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [draggedBookmarkId, setDraggedBookmarkId] = useState<string | null>(null);
  const [orderedBookmarks, setOrderedBookmarks] = useState<Bookmark[]>(bookmarks);
  const [ringColors, setRingColors] = useState<Record<string, string>>(DEFAULT_RING_COLORS);
  
  // Card expansion state - true = full card, false = compact (logo + name only)
  const [cardsExpanded, setCardsExpanded] = useState(true);
  
  // Custom date range state
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const itemsPerPageOptions = [5, 10, 15, 25, 50, 100];
  
  // Fitness rings modal state
  const [showRingsModal, setShowRingsModal] = useState(false);
  const [showColorCustomizer, setShowColorCustomizer] = useState(false);
  const [selectedBookmarkForRings, setSelectedBookmarkForRings] = useState<Bookmark | null>(null);
  
  // Create category modal state
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; color: string }>>([]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, timeGrouping, selectedCategory, customStartDate, customEndDate]);

  // Load ring colors from localStorage on mount
  useEffect(() => {
    setRingColors(getRingColors());
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          const cats = (data.categories || data || []).map((c: any) => ({
            id: c.id?.toString() ?? '',
            name: c.name ?? '',
            color: c.color ?? '#6366f1',
          }));
          setCategories(cats);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Create new category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setIsCreatingCategory(true);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          color: newCategoryColor,
        }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories(prev => [...prev, newCategory]);
        toast.success(`Category "${newCategoryName}" created!`);
        setNewCategoryName('');
        setNewCategoryColor('#6366f1');
        setShowCreateCategoryModal(false);
        onUpdate?.();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create category');
      }
    } catch (error) {
      toast.error('Failed to create category');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Create ring data for a bookmark
  const createRingsData = (bookmark: Bookmark): RingData[] => {
    return [
      {
        id: "visits",
        label: "Visits",
        value: bookmark.visitCount || 0,
        target: 100,
        color: ringColors.visits,
      },
      {
        id: "tasks",
        label: "Tasks",
        value: 0,
        target: 1,
        color: ringColors.tasks,
      },
      {
        id: "time",
        label: "Time",
        value: 0,
        target: 60,
        color: ringColors.time,
      },
    ];
  };

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

  // Helper: is within time window
  const isWithinTimeGrouping = (bookmark: Bookmark) => {
    if (timeGrouping === 'all') return true;

    const activityDate = bookmark.updatedAt || bookmark.createdAt;
    const ts = Date.parse(activityDate);
    if (Number.isNaN(ts)) return true; // if bad data, don't filter out

    const now = Date.now();
    const diffDays = (now - ts) / (1000 * 60 * 60 * 24);

    const sameCalendarDay = (d: Date, ref: Date) =>
      d.getFullYear() === ref.getFullYear() &&
      d.getMonth() === ref.getMonth() &&
      d.getDate() === ref.getDate();

    if (timeGrouping === 'today') {
      const d = new Date(ts);
      return sameCalendarDay(d, new Date());
    }

    if (timeGrouping === 'yesterday') {
      const d = new Date(ts);
      const y = new Date();
      y.setDate(y.getDate() - 1);
      return sameCalendarDay(d, y);
    }

    if (timeGrouping === 'day') return diffDays <= 1;
    if (timeGrouping === 'week') return diffDays <= 7;
    if (timeGrouping === 'month') return diffDays <= 31;
    if (timeGrouping === 'quarter') return diffDays <= 90;
    if (timeGrouping === 'year') return diffDays <= 365;

    if (timeGrouping === 'lastYear') {
      const d = new Date(ts);
      const nowDate = new Date();
      const lastYear = nowDate.getFullYear() - 1;
      return d.getFullYear() === lastYear;
    }
    
    // Custom date range
    if (timeGrouping === 'custom') {
      if (!customStartDate && !customEndDate) return true;
      const bookmarkDate = new Date(ts);
      if (customStartDate) {
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        if (bookmarkDate < start) return false;
      }
      if (customEndDate) {
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        if (bookmarkDate > end) return false;
      }
      return true;
    }
    
    return true;
  };

  // Filtered + sorted bookmarks
  const filteredBookmarks = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const safeLower = (val?: string | null) => (val ? val.toLowerCase() : '');
    return orderedBookmarks.filter((bookmark) => {
      const matchesSearch =
        q === '' ||
        safeLower(bookmark.title).includes(q) ||
        safeLower(bookmark.description).includes(q) ||
        safeLower(bookmark.url).includes(q) ||
        safeLower(bookmark.category?.name).includes(q) ||
        (bookmark.tags?.some((t) => safeLower(t?.name).includes(q)) ?? false);

      const matchesCategory =
        selectedCategory === 'all' ||
        bookmark.category?.id?.toString() === selectedCategory;

      const matchesTime = isWithinTimeGrouping(bookmark);

      return matchesSearch && matchesCategory && matchesTime;
    });
  }, [orderedBookmarks, searchQuery, selectedCategory, timeGrouping, customStartDate, customEndDate]);

  const sortedBookmarks = React.useMemo(() => {
    return [...filteredBookmarks].sort((a, b) => {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? bDate - aDate : aDate - bDate;
    });
  }, [filteredBookmarks, sortOrder]);

  // Pagination calculations (memoized to avoid re-renders causing loops)
  const { paginatedBookmarks, totalItems, totalPages, startIndex, endIndex } = React.useMemo(() => {
    const totalItemsCalc = sortedBookmarks.length;
    const totalPagesCalc = Math.ceil(totalItemsCalc / itemsPerPage) || 1;
    const startIndexCalc = (currentPage - 1) * itemsPerPage;
    const endIndexCalc = startIndexCalc + itemsPerPage;
    const pageSlice = sortedBookmarks.slice(startIndexCalc, endIndexCalc);
    return {
      paginatedBookmarks: pageSlice,
      totalItems: totalItemsCalc,
      totalPages: totalPagesCalc,
      startIndex: startIndexCalc,
      endIndex: endIndexCalc,
    };
  }, [sortedBookmarks, currentPage, itemsPerPage]);

  // Group bookmarks based on time grouping, preserving sort order
  const timelineGroups = React.useMemo(() => {
    if (paginatedBookmarks.length === 0) return [];

    const groups: Record<string, Bookmark[]> = {};

    const getWeekStart = (date: Date) => {
      const d = new Date(date);
      const day = d.getDay(); // 0 (Sun) .. 6 (Sat)
      const diff = (day + 6) % 7; // make Monday start
      d.setDate(d.getDate() - diff);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const getLabel = (bookmark: Bookmark) => {
      const created = new Date(bookmark.createdAt);
      if (timeGrouping === 'today') {
        return 'Today';
      }
      if (timeGrouping === 'yesterday') {
        return 'Yesterday';
      }
      if (timeGrouping === 'day') {
        return created.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      if (timeGrouping === 'week') {
        const start = getWeekStart(created);
        return `Week of ${start.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}`;
      }
      if (timeGrouping === 'month') {
        return created.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        });
      }
      if (timeGrouping === 'quarter') {
        const quarter = Math.floor(created.getMonth() / 3) + 1;
        return `Q${quarter} ${created.getFullYear()}`;
      }
      if (timeGrouping === 'year') {
        return created.getFullYear().toString();
      }
      if (timeGrouping === 'lastYear') {
        return 'Last Year';
      }
      return 'All Time';
    };

    paginatedBookmarks.forEach((bookmark) => {
      const label = getLabel(bookmark);
      if (!groups[label]) groups[label] = [];
      groups[label].push(bookmark);
    });

    return Object.entries(groups).map(([label, bookmarks]) => ({
      label,
      bookmarks,
    }));
  }, [paginatedBookmarks, timeGrouping]);

  // Auto-expand groups whenever grouping changes or new data arrives
  useEffect(() => {
    const labels = timelineGroups.map((g) => g.label).join('|');
    setExpandedGroups(new Set(timelineGroups.map((g) => g.label)));
  }, [timelineGroups]);

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
    setCardsExpanded(true);
    setExpandedGroups(new Set(timelineGroups.map((g) => g.label)));
  };

  const collapseAll = () => {
    setCardsExpanded(false);
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
          <h1 className="text-3xl font-bold text-gray-900 uppercase">Timeline View</h1>
        </div>
        <p className="text-gray-600">Chronological view of your bookmarks journey</p>
      </div>

      {/* Timeline Controls */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Timeline Controls</h2>
            <Badge variant="secondary" className="bg-white/50">
              {categories.length} categories
            </Badge>
          </div>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setShowCreateCategoryModal(true)}
          >
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
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="day">Past 24 Hours</SelectItem>
              <SelectItem value="week">Past 7 Days</SelectItem>
              <SelectItem value="month">Past 31 Days</SelectItem>
              <SelectItem value="quarter">Past 90 Days</SelectItem>
              <SelectItem value="year">Past 365 Days</SelectItem>
              <SelectItem value="lastYear">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Custom Date Range Inputs */}
          {timeGrouping === 'custom' && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-[140px] bg-white"
                placeholder="Start date"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-[140px] bg-white"
                placeholder="End date"
              />
            </div>
          )}

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
              {/* Fallback: categories from bookmarks if API had none */}
              {categories.length === 0 &&
                Array.from(
                  new Map(
                    orderedBookmarks
                      .filter((b) => b.category?.id && b.category?.name)
                      .map((b) => [
                        b.category!.id.toString(),
                        {
                          id: b.category!.id.toString(),
                          name: b.category!.name,
                          color: b.category!.color ?? '#6366f1',
                        },
                      ])
                  ).values()
                ).map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>

          {/* Sort */}
          <Button
            variant="outline"
            className="bg-white"
            onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
          >
            <Filter className="w-4 h-4 mr-2" />
            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
          </Button>
        </div>

        {/* Stats and Items Per Page */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-200">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Total: {bookmarks.length} bookmarks</span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>Filtered: {totalItems} bookmarks</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Showing: {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Per page:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-[80px] bg-white h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {itemsPerPageOptions.map((opt) => (
                    <SelectItem key={opt} value={opt.toString()}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="ghost" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  className={currentPage === pageNum ? "bg-indigo-600" : ""}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </Button>
        </div>
      )}

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
                <h3 className="text-xl font-bold text-gray-900 uppercase">{group.label}</h3>
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
                  const isDescExpanded = expandedDescriptions.has(bookmark.id);
                  const truncatedDescription =
                    bookmark.description?.length > 200
                      ? bookmark.description.substring(0, 200) + '...'
                      : bookmark.description;

                  return (
                    <div 
                      key={bookmark.id} 
                      className="relative mb-4"
                      draggable
                      onDragStart={(e) => handleDragStart(e, bookmark.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, bookmark.id)}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Timeline Dot */}
                      <div className={`absolute left-[-12px] ${cardsExpanded ? 'top-6' : 'top-4'} w-5 h-5 bg-indigo-600 rounded-full border-4 border-white`} />

                      {/* Collapsed Card - Logo and Name Only */}
                      {!cardsExpanded && (
                        <div
                          className={`relative rounded-xl px-4 py-3 border-2 transition-all duration-300 cursor-pointer group overflow-hidden hover:shadow-lg hover:border-indigo-400 ${
                            draggedBookmarkId === bookmark.id ? 'opacity-50 border-blue-500' : 'border-gray-200'
                          } bg-white`}
                          onClick={() => setSelectedBookmark(bookmark)}
                        >
                          <div className="flex items-center gap-3">
                            {/* Logo */}
                            <div className="flex-shrink-0">
                              <div className="relative w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white shadow-sm border border-gray-100">
                                {bookmark.favicon ? (
                                  <Image
                                    src={bookmark.favicon}
                                    alt={bookmark.title}
                                    fill
                                    className="object-contain p-1"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold uppercase">
                                    {bookmark.title.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Title */}
                            <h4 className="flex-1 text-sm font-semibold text-gray-900 truncate uppercase">
                              {bookmark.title}
                            </h4>

                            {/* Favorite indicator */}
                            {bookmark.isFavorite && (
                              <Heart className="w-4 h-4 text-red-500 fill-red-500 flex-shrink-0" />
                            )}

                            {/* Expand arrow */}
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          </div>
                        </div>
                      )}

                      {/* Expanded Card - Full Details */}
                      {cardsExpanded && (
                        <div
                          className={`relative rounded-xl p-6 border-2 transition-all duration-300 cursor-move group overflow-hidden hover:scale-[1.02] hover:shadow-2xl hover:border-indigo-400 ${
                            draggedBookmarkId === bookmark.id ? 'opacity-50 border-blue-500' : 'border-black'
                          } bg-gradient-to-br from-pink-50/30 via-purple-50/20 to-blue-50/30`}
                        >
                          {/* Full Background Faded Logo - Stretched to Cover Every Inch */}
                          {bookmark.favicon && (
                            <div className="absolute inset-0 opacity-[0.08] pointer-events-none overflow-hidden">
                              <Image
                                src={bookmark.favicon}
                                alt=""
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}

                          <div className="flex gap-4 relative z-10">
                            {/* Logo */}
                            <div className="flex-shrink-0">
                              <div className="relative w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden bg-white shadow-sm">
                                {bookmark.favicon ? (
                                  <Image
                                    src={bookmark.favicon}
                                    alt={bookmark.title}
                                    fill
                                    className="object-contain p-2"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold uppercase">
                                    {bookmark.title.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pr-28">
                              {/* Title and Category */}
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex-1">
                                  <h4
                                    className="text-xl font-bold text-indigo-600 hover:text-indigo-700 mb-2 cursor-pointer uppercase"
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
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      className="p-2 hover:bg-white rounded-lg transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="w-4 h-4 text-gray-600" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuItem onClick={() => setSelectedBookmark(bookmark)}>
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              </div>

                              {/* Description */}
                              {bookmark.description && (
                                <p
                                  className={`text-gray-600 text-sm mb-3 leading-relaxed break-words ${
                                    isDescExpanded ? '' : 'line-clamp-2'
                                  }`}
                                >
                                  {isDescExpanded ? bookmark.description : truncatedDescription}
                                  {bookmark.description.length > 200 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDescription(bookmark.id);
                                      }}
                                      className="ml-2 text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                      {isDescExpanded ? 'Less' : 'More'}
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
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                                  <div className="w-2 h-2 bg-gray-500 rounded-full" />
                                </div>
                                <a
                                  href={bookmark.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={bookmark.url}
                                  className="text-sm text-gray-500 hover:text-indigo-600 truncate flex-1 min-w-0 block"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {bookmark.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Fitness Rings - Lower Right Corner */}
                          <div 
                            className="absolute bottom-4 right-4 z-30"
                            draggable={false}
                            onDragStart={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <div className="bg-white/90 rounded-full p-2 shadow-lg border border-gray-200 cursor-pointer">
                              <FitnessRings
                                rings={createRingsData(bookmark)}
                                size={70}
                                strokeWidth={5}
                                animated={false}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setSelectedBookmarkForRings(bookmark);
                                  setShowRingsModal(true);
                                }}
                              />
                            </div>
                            <div className="text-center mt-1">
                              <span className="text-[9px] font-bold text-gray-600 tracking-wider uppercase">Activity</span>
                            </div>
                          </div>
                        </div>
                      )}
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

      {/* Fitness Rings Detail Modal */}
      {selectedBookmarkForRings && (
        <FitnessRingsModal
          open={showRingsModal}
          onOpenChange={(open) => {
            setShowRingsModal(open);
            if (!open) setSelectedBookmarkForRings(null);
          }}
          rings={createRingsData(selectedBookmarkForRings)}
          onCustomize={() => {
            setShowRingsModal(false);
            setShowColorCustomizer(true);
          }}
        />
      )}

      {/* Ring Color Customizer Modal */}
      {selectedBookmarkForRings && (
        <RingColorCustomizer
          open={showColorCustomizer}
          onOpenChange={(open) => {
            setShowColorCustomizer(open);
            if (!open) setSelectedBookmarkForRings(null);
          }}
          rings={createRingsData(selectedBookmarkForRings)}
          onSave={(colors) => {
            toast.success("Ring colors saved!");
            setShowColorCustomizer(false);
            setSelectedBookmarkForRings(null);
          }}
        />
      )}

      {/* Create Category Modal */}
      <Dialog open={showCreateCategoryModal} onOpenChange={setShowCreateCategoryModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase">Create New Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                placeholder="Enter category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isCreatingCategory) {
                    handleCreateCategory();
                  }
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-color">Category Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="category-color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border border-gray-200"
                />
                <Input
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  placeholder="#6366f1"
                  className="flex-1"
                />
                <div 
                  className="w-10 h-10 rounded-lg border border-gray-200"
                  style={{ backgroundColor: newCategoryColor }}
                />
              </div>
              {/* Preset colors */}
              <div className="flex flex-wrap gap-2 mt-2">
                {['#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#6B7280'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategoryColor(color)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      newCategoryColor === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateCategoryModal(false);
                setNewCategoryName('');
                setNewCategoryColor('#6366f1');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={isCreatingCategory || !newCategoryName.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isCreatingCategory ? 'Creating...' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
