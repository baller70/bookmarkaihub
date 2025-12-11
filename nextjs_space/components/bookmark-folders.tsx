'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Folder, MoreVertical, ChevronLeft, ExternalLink, Star, Edit, Trash2, 
  Search, Plus, FolderPlus, X, TrendingUp, Medal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { BookmarkDetailModal } from './bookmark-detail-modal';
import { FitnessRings, RingData } from './ui/fitness-rings';
import { FitnessRingsModal } from './ui/fitness-rings-modal';
import { RingColorCustomizer } from './ui/ring-color-customizer';

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
    logo?: string | null;
  } | null;
  tags?: { id: string; name: string }[];
  isFavorite: boolean;
  priority: string | null;
  createdAt?: string;
  visitCount?: number;
  folderId?: string | null;
  engagementPercentage?: number;
}

interface CategoryFolder {
  id: string;
  name: string;
  color: string;
  backgroundColor?: string;
  logo?: string | null;
  bookmarks: Bookmark[];
}

interface Subfolder {
  id: string;
  name: string;
  color: string;
  categoryId: string;
}

const SUBFOLDER_COLORS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#14B8A6', '#6B7280', '#F97316', '#06B6D4',
];

export default function BookmarkFolders({ bookmarks, onUpdate }: { bookmarks: Bookmark[], onUpdate: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFolder | null>(null);
  const [globalCustomLogo, setGlobalCustomLogo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);
  
  // Subfolder state
  const [subfolders, setSubfolders] = useState<Subfolder[]>([]);
  const [selectedSubfolder, setSelectedSubfolder] = useState<Subfolder | null>(null);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#6366f1');
  
  // Selection state for bulk move
  const [selectMode, setSelectMode] = useState(false);
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<Set<string>>(new Set());
  
  // Fitness rings modal & color customizer
  const [fitnessRingsBookmark, setFitnessRingsBookmark] = useState<Bookmark | null>(null);
  const [showColorCustomizer, setShowColorCustomizer] = useState(false);
  const [ringColors, setRingColors] = useState({
    engagement: '#FF2D55',
    activity: '#30D158',
    goals: '#007AFF',
  });
  // Category side-color picker
  const [colorPickerId, setColorPickerId] = useState<string | null>(null);
  const [colorPickerValue, setColorPickerValue] = useState<string>('#3B82F6');
  const [savingCategoryColor, setSavingCategoryColor] = useState(false);

  // Load saved ring colors from localStorage
  useEffect(() => {
    const savedColors = localStorage.getItem('fitnessRingColors');
    if (savedColors) {
      try {
        setRingColors(JSON.parse(savedColors));
      } catch (e) {
        console.error('Failed to parse saved ring colors:', e);
      }
    }
  }, []);

  // Create rings data for a bookmark
  const createRingsData = (bookmark: Bookmark): RingData[] => {
    return [
      {
        id: 'engagement',
        label: 'Engagement',
        value: bookmark.engagementPercentage || Math.min((bookmark.visitCount || 1) * 10, 100),
        target: 100,
        color: ringColors.engagement,
      },
      {
        id: 'activity',
        label: 'Activity',
        value: Math.min((bookmark.visitCount || 1) * 15, 100),
        target: 100,
        color: ringColors.activity,
      },
      {
        id: 'goals',
        label: 'Goals',
        value: bookmark.isFavorite ? 100 : 50,
        target: 100,
        color: ringColors.goals,
      },
    ];
  };

  const handleSaveRingColors = (colors: Record<string, string>) => {
    const newColors = {
      engagement: colors.engagement || ringColors.engagement,
      activity: colors.activity || ringColors.activity,
      goals: colors.goals || ringColors.goals,
    };
    setRingColors(newColors);
    localStorage.setItem('fitnessRingColors', JSON.stringify(newColors));
    toast.success('Ring colors saved!');
    setShowColorCustomizer(false);
  };

  // Fetch global custom logo on mount
  useEffect(() => {
    const fetchGlobalLogo = async () => {
      try {
        const response = await fetch('/api/user/custom-logo');
        if (response.ok) {
          const data = await response.json();
          if (data.customLogoUrl) {
            setGlobalCustomLogo(data.customLogoUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching global custom logo:', error);
      }
    };
    fetchGlobalLogo();
  }, []);

  // Fetch subfolders when category is selected
  useEffect(() => {
    if (selectedCategory) {
      fetchSubfolders(selectedCategory.id);
    }
  }, [selectedCategory]);

  const fetchSubfolders = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/bookmark-folders?categoryId=${categoryId}`);
      if (res.ok) {
        const data = await res.json();
        setSubfolders(data);
      }
    } catch (e) {
      console.error('Error fetching subfolders:', e);
    }
  };

  const createSubfolder = async () => {
    if (!selectedCategory || !newFolderName.trim()) return;
    try {
      const res = await fetch('/api/bookmark-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newFolderName.trim(), 
          categoryId: selectedCategory.id,
          color: newFolderColor 
        }),
      });
      if (res.ok) {
        await fetchSubfolders(selectedCategory.id);
        setShowNewFolderDialog(false);
        setNewFolderName('');
        toast.success('Subfolder created');
      } else {
        toast.error('Failed to create subfolder');
      }
    } catch (e) {
      toast.error('Failed to create subfolder');
    }
  };

  const deleteSubfolder = async (subfolderId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('Delete this subfolder? Bookmarks will be moved back to the main category.')) return;
    try {
      const res = await fetch('/api/bookmark-folders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subfolderId }),
      });
      if (res.ok) {
        if (selectedCategory) await fetchSubfolders(selectedCategory.id);
        if (selectedSubfolder?.id === subfolderId) setSelectedSubfolder(null);
        toast.success('Subfolder deleted');
        onUpdate();
      }
    } catch (e) {
      toast.error('Failed to delete subfolder');
    }
  };

  // Edit subfolder state
  const [editingSubfolder, setEditingSubfolder] = useState<Subfolder | null>(null);

  const openEditSubfolder = (folder: Subfolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setNewFolderName(folder.name);
    setNewFolderColor(folder.color || '#3B82F6');
    setEditingSubfolder(folder);
    setShowNewFolderDialog(true);
  };

  const updateSubfolder = async () => {
    if (!editingSubfolder || !newFolderName.trim()) return;
    try {
      const res = await fetch('/api/bookmark-folders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingSubfolder.id, name: newFolderName.trim(), color: newFolderColor }),
      });
      if (res.ok) {
        if (selectedCategory) await fetchSubfolders(selectedCategory.id);
        setShowNewFolderDialog(false);
        setNewFolderName('');
        setEditingSubfolder(null);
        toast.success('Subfolder updated');
      } else {
        toast.error('Failed to update subfolder');
      }
    } catch (e) {
      toast.error('Failed to update subfolder');
    }
  };

  const moveBookmarksToFolder = async (folderId: string | null) => {
    if (selectedBookmarkIds.size === 0) return;
    try {
      const res = await fetch('/api/bookmarks/bulk-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bookmarkIds: Array.from(selectedBookmarkIds), 
          folderId 
        }),
      });
      if (res.ok) {
        toast.success(`Moved ${selectedBookmarkIds.size} bookmarks`);
        setSelectedBookmarkIds(new Set());
        setSelectMode(false);
        onUpdate();
      }
    } catch (e) {
      toast.error('Failed to move bookmarks');
    }
  };

  // Group bookmarks by category
  const categories: CategoryFolder[] = useMemo(() => {
    const grouped = new Map<string, CategoryFolder>();

    bookmarks?.forEach((bookmark) => {
      const categoryId = bookmark.category?.id || 'uncategorized';
      const categoryName = bookmark.category?.name || 'Uncategorized';
      const categoryColor = bookmark.category?.color || '#6366f1';

      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, {
          id: categoryId,
          name: categoryName,
          color: categoryColor,
          backgroundColor: bookmark.category?.backgroundColor,
          logo: bookmark.category?.logo,
          bookmarks: [],
        });
      }
      grouped.get(categoryId)?.bookmarks.push(bookmark);
    });

    return Array.from(grouped.values()).sort((a, b) => b.bookmarks.length - a.bookmarks.length);
  }, [bookmarks]);

  // Save category color (side color) and refresh via onUpdate
  const saveCategoryColor = async (categoryId: string, color: string) => {
    setSavingCategoryColor(true);
    try {
      await fetch(`/api/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color }),
      });
      toast.success('Folder color updated');
      onUpdate();
      setColorPickerId(null);
    } catch (e) {
      toast.error('Failed to update folder color');
    } finally {
      setSavingCategoryColor(false);
    }
  };

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  // Get bookmarks for current view (filtered by subfolder if selected)
  const currentBookmarks = useMemo(() => {
    if (!selectedCategory) return [];
    let filtered = selectedCategory.bookmarks;
    
    if (selectedSubfolder) {
      filtered = filtered.filter(b => b.folderId === selectedSubfolder.id);
    } else if (subfolders.length > 0) {
      // Show unfiled bookmarks when no subfolder selected
      const subfolderIds = new Set(subfolders.map(sf => sf.id));
      filtered = filtered.filter(b => !b.folderId || !subfolderIds.has(b.folderId));
    }
    
    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [selectedCategory, selectedSubfolder, subfolders, searchQuery]);

  // Count bookmarks per subfolder for display
  const subfolderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!selectedCategory) return counts;
    selectedCategory.bookmarks.forEach((b) => {
      if (b.folderId) counts[b.folderId] = (counts[b.folderId] || 0) + 1;
    });
    return counts;
  }, [selectedCategory]);

  // Rank bookmarks by visit count (most visited = rank 1)
  const rankedBookmarks = useMemo(() => {
    return [...currentBookmarks]
      .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))
      .map((bookmark, index) => ({
        ...bookmark,
        rank: index + 1,
      }));
  }, [currentBookmarks]);

  const handleToggleFavorite = async (bookmark: Bookmark) => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !bookmark.isFavorite }),
      });
      if (!response.ok) throw new Error('Failed to update');
      toast.success(bookmark.isFavorite ? 'Removed from favorites' : 'Added to favorites');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleDeleteBookmark = async (bookmark: Bookmark) => {
    if (!confirm('Are you sure you want to delete this bookmark?')) return;
    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      toast.success('Bookmark deleted');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete bookmark');
    }
  };

  const toggleBookmarkSelection = (bookmarkId: string) => {
    setSelectedBookmarkIds(prev => {
      const next = new Set(prev);
      if (next.has(bookmarkId)) {
        next.delete(bookmarkId);
      } else {
        next.add(bookmarkId);
      }
      return next;
    });
  };

  // Get rank color based on position
  const getRankColor = (rank: number) => {
    if (rank === 1) return '#D4AF37'; // gold
    if (rank === 2) return '#9CA3AF'; // silver
    if (rank === 3) return '#CD7F32'; // bronze
    return '#6B7280'; // gray
  };

  // Render faded rank in bottom-left corner
  const renderFadedRank = (rank: number) => {
    const color = getRankColor(rank);
    const isTop3 = rank <= 3;
    return (
      <div className="absolute bottom-3 left-3 pointer-events-none flex items-center gap-1" style={{ opacity: 0.15 }}>
        {isTop3 && (
          <Medal className="w-10 h-10" style={{ color }} strokeWidth={1.5} />
        )}
        <span 
          className="font-black" 
          style={{ 
            fontSize: isTop3 ? '48px' : '56px', 
            color,
            lineHeight: 1,
          }}
        >
          {rank}
        </span>
      </div>
    );
  };

  // Render category folders grid (main view)
  if (!selectedCategory) {
    return (
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 uppercase flex items-center gap-3">
                <Folder className="w-7 h-7 text-indigo-600" />
                Folders
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {categories.length} categories • {bookmarks.length} total bookmarks
              </p>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Folders Grid with color picker in 3-dot menu */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => {
                setSelectedCategory(category);
                setSearchQuery('');
                setSelectedSubfolder(null);
              }}
              className="group relative bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden"
              style={{ borderLeftWidth: '5px', borderLeftColor: category.color }}
            >
              {/* Top-right 3-dot for side color customization */}
              <div className="absolute top-2 right-2 z-20">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-2 bg-white rounded-lg shadow hover:shadow-md border border-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setColorPickerId(category.id);
                        setColorPickerValue(category.color || '#3B82F6');
                      }}
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={5} className="z-[110] w-48">
                    <div className="px-3 py-2 space-y-2">
                      <div className="text-xs font-semibold text-gray-700">Side Color</div>
                      <input
                        type="color"
                        className="w-full h-10 rounded border border-gray-200"
                        value={colorPickerId === category.id ? colorPickerValue : category.color || '#3B82F6'}
                        onChange={(e) => {
                          setColorPickerId(category.id);
                          setColorPickerValue(e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={savingCategoryColor}
                          onClick={(e) => {
                            e.stopPropagation();
                            saveCategoryColor(category.id, colorPickerValue);
                          }}
                        >
                          {savingCategoryColor ? 'Saving…' : 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setColorPickerId(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Folder Header */}
              <div className="p-5">
                <div className="flex items-start mb-4">
                  {/* Logo/Icon */}
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden bg-white border border-gray-100 shadow-sm"
                  >
                    {globalCustomLogo ? (
                      <Image src={globalCustomLogo} alt={category.name} width={40} height={40} className="object-contain" />
                    ) : (
                      <Folder className="w-7 h-7" style={{ color: category.color }} />
                    )}
                  </div>
                </div>
                
                {/* Category Name */}
                <h3 className="font-bold text-gray-900 truncate mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.bookmarks.length} bookmarks</p>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min((category.bookmarks.length / 30) * 100, 100)}%`, 
                      backgroundColor: category.color 
                    }}
                  />
                </div>
                
                {/* Preview of bookmarks */}
                <div className="flex gap-1 mt-4">
                  {category.bookmarks.slice(0, 4).map((bookmark) => (
                    <div 
                      key={bookmark.id}
                      className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden"
                    >
                      {bookmark.favicon ? (
                        <Image src={bookmark.favicon} alt="" width={16} height={16} className="object-contain" />
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400">
                          {bookmark.title.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  ))}
                  {category.bookmarks.length > 4 && (
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-[10px] font-medium text-gray-500">
                        +{category.bookmarks.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Folder className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No categories found</p>
          </div>
        )}
      </div>
    );
  }

  // Render Bento-style category detail view
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              if (selectedSubfolder) {
                setSelectedSubfolder(null);
              } else {
                setSelectedCategory(null);
                setSearchQuery('');
                setSelectMode(false);
                setSelectedBookmarkIds(new Set());
              }
            }}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {selectedSubfolder ? `Back to ${selectedCategory.name}` : 'Back to Folders'}
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden bg-white border-2 shadow-lg"
              style={{ borderColor: selectedSubfolder?.color || selectedCategory.color }}
            >
              {globalCustomLogo && !selectedSubfolder ? (
                <Image src={globalCustomLogo} alt={selectedCategory.name} width={48} height={48} className="object-contain" />
              ) : (
                <Folder className="w-8 h-8" style={{ color: selectedSubfolder?.color || selectedCategory.color }} />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 uppercase">
                {selectedSubfolder?.name || selectedCategory.name}
              </h1>
              <p className="text-sm text-gray-500">
                {rankedBookmarks.length} bookmarks • Ranked by usage
                {!selectedSubfolder && subfolders.length > 0 && ` • ${subfolders.length} subfolder${subfolders.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* New Subfolder - Only show when not in subfolder */}
            {!selectedSubfolder && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewFolderDialog(true)}
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                New Subfolder
              </Button>
            )}
          </div>
        </div>
        
        {/* Subfolders - Same as Compact/List View */}
        {!selectedSubfolder && subfolders.length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Subfolders</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {subfolders.map((folder) => {
                const folderCount = subfolderCounts[folder.id] || 0;
                return (
                  <div
                    key={folder.id}
                    onClick={() => setSelectedSubfolder(folder)}
                    className="bg-white border-2 border-gray-300 hover:border-black rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer relative group"
                  >
                    {/* Edit/Delete buttons on hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={(e) => openEditSubfolder(folder, e)}
                        className="p-1 bg-white rounded shadow hover:bg-gray-100"
                        title="Edit folder"
                      >
                        <Edit className="w-3 h-3 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => deleteSubfolder(folder.id, e)}
                        className="p-1 bg-white rounded shadow hover:bg-red-100"
                        title="Delete folder"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-10 h-10 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: folder.color || selectedCategory?.color || '#60A5FA' }}
                      >
                        <Folder className="w-6 h-6 text-white" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm uppercase truncate">{folder.name}</h4>
                        <p className="text-xs text-gray-500">{folderCount} bookmark{folderCount !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Selection controls - Same as Compact/List View */}
        {subfolders.length > 0 && !selectedSubfolder && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
            <Button
              variant={selectMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectMode(!selectMode);
                if (selectMode) setSelectedBookmarkIds(new Set());
              }}
            >
              {selectMode ? 'Cancel Selection' : 'Select Bookmarks'}
            </Button>
            {selectMode && (
              <>
                <Button variant="outline" size="sm" onClick={() => setSelectedBookmarkIds(new Set(currentBookmarks.map(b => b.id)))}>
                  Select All
                </Button>
                {selectedBookmarkIds.size > 0 && (
                  <>
                    <span className="text-sm text-gray-600">{selectedBookmarkIds.size} selected</span>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      onChange={(e) => moveBookmarksToFolder(e.target.value === '__none__' ? null : e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>Move to folder...</option>
                      <option value="__none__">Remove from folder</option>
                      {subfolders.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Search */}
        <div className="relative max-w-md mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rankedBookmarks.map((bookmark) => (
          <div
              key={bookmark.id}
              className={`group relative bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all overflow-hidden ${
                selectedBookmarkIds.has(bookmark.id) ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-black/15 hover:border-black/25'
              }`}
              onClick={() => {
                if (selectMode) {
                  toggleBookmarkSelection(bookmark.id);
                } else {
                  setSelectedBookmark(bookmark);
                }
              }}
            >
              {/* Faded Logo Background - Use bookmark favicon by default; if no favicon and global logo exists, use global */}
              {(bookmark.favicon || globalCustomLogo) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                  <div className="w-3/4 h-3/4 opacity-[0.08]">
                    <Image 
                      src={bookmark.favicon || globalCustomLogo || ''} 
                      alt="" 
                      width={200} 
                      height={200} 
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>
              )}
              
              {/* Faded Rank in Bottom-Left Corner */}
              {renderFadedRank(bookmark.rank)}
              
              {/* Select checkbox */}
              {selectMode && (
                <div className="absolute top-3 left-3 z-20">
                  <Checkbox
                    checked={selectedBookmarkIds.has(bookmark.id)}
                    onCheckedChange={() => toggleBookmarkSelection(bookmark.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white"
                  />
                </div>
              )}
              
              <div className="p-4 relative z-[1]">
                <div className="flex items-start gap-3">
                  {/* Favicon */}
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                    {bookmark.favicon ? (
                      <Image src={bookmark.favicon} alt="" width={28} height={28} className="object-contain" />
                    ) : (
                      <span className="text-lg font-bold text-gray-400">
                        {bookmark.title.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{bookmark.title}</h4>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{new URL(bookmark.url).hostname}</p>
                    
                    {/* Stats and Fitness Rings */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span>{bookmark.visitCount || 0} visits</span>
                        </div>
                        {bookmark.isFavorite && (
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <div className="flex-shrink-0 relative z-30">
                        <FitnessRings
                          rings={createRingsData(bookmark)}
                          size={52}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setFitnessRingsBookmark(bookmark);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Hover actions - separated buttons with larger touch targets */}
              {!selectMode && (
                <div className="absolute top-2 right-2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-40">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4 text-gray-600" />
                  </a>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="p-2.5 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={5} className="z-[100]">
                      <DropdownMenuItem onClick={() => handleToggleFavorite(bookmark)}>
                        <Star className="w-4 h-4 mr-2" />
                        {bookmark.isFavorite ? 'Unfavorite' : 'Favorite'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedBookmark(bookmark)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {subfolders.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-medium text-gray-500">Move to...</div>
                          <DropdownMenuItem onClick={() => moveBookmarksToFolder(null)}>
                            Main folder
                          </DropdownMenuItem>
                          {subfolders.map(sf => (
                            <DropdownMenuItem 
                              key={sf.id}
                              onClick={() => {
                                setSelectedBookmarkIds(new Set([bookmark.id]));
                                moveBookmarksToFolder(sf.id);
                              }}
                            >
                              <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: sf.color }} />
                              {sf.name}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteBookmark(bookmark)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
          </div>
        ))}
      </div>

      {rankedBookmarks.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No bookmarks found</p>
        </div>
      )}

      {/* Create/Edit Subfolder Dialog - Same as Compact/List View */}
      <Dialog open={showNewFolderDialog} onOpenChange={(open) => {
        setShowNewFolderDialog(open);
        if (!open) {
          setEditingSubfolder(null);
          setNewFolderName('');
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSubfolder ? 'Edit Subfolder' : 'Create New Subfolder'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Folder Name</label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFolderName.trim()) {
                    editingSubfolder ? updateSubfolder() : createSubfolder();
                  }
                }}
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Folder Color</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {SUBFOLDER_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewFolderColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${newFolderColor === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newFolderColor}
                  onChange={(e) => setNewFolderColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                />
                <Input
                  value={newFolderColor}
                  onChange={(e) => setNewFolderColor(e.target.value)}
                  placeholder="#3B82F6"
                  className="w-28 font-mono text-sm"
                />
                <div 
                  className="w-10 h-10 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: newFolderColor }}
                >
                  <Folder className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>Cancel</Button>
            <Button 
              onClick={editingSubfolder ? updateSubfolder : createSubfolder} 
              disabled={!newFolderName.trim()}
            >
              {editingSubfolder ? 'Save Changes' : 'Create Folder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bookmark Detail Modal */}
      {selectedBookmark && (
        <BookmarkDetailModal
          bookmark={selectedBookmark as any}
          open={!!selectedBookmark}
          onOpenChange={(open) => {
            if (!open) setSelectedBookmark(null);
          }}
          onUpdate={onUpdate}
        />
      )}

      {/* Fitness Rings Modal - shows analytics and has customize button */}
      {fitnessRingsBookmark && (
        <FitnessRingsModal
          open={!!fitnessRingsBookmark}
          onOpenChange={(open) => {
            if (!open) setFitnessRingsBookmark(null);
          }}
          rings={createRingsData(fitnessRingsBookmark)}
          onCustomize={() => {
            setShowColorCustomizer(true);
          }}
        />
      )}

      {/* Ring Color Customizer Modal */}
      {fitnessRingsBookmark && (
        <RingColorCustomizer
          open={showColorCustomizer}
          onOpenChange={(open) => {
            setShowColorCustomizer(open);
            if (!open) setFitnessRingsBookmark(null);
          }}
          rings={createRingsData(fitnessRingsBookmark)}
          onSave={handleSaveRingColors}
        />
      )}
    </div>
  );
}
