
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FolderKanban, Search, Plus, Settings, ChevronLeft, ChevronRight, Filter, X, MoreVertical, ZoomIn, ZoomOut, Maximize2, Move, ChevronDown, ChevronUp, ExternalLink, Star, Trash2, Edit } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookmarkDetailModal } from './bookmark-detail-modal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface HierarchyLevel {
  id: string;
  label: string;
  order: number;
}

interface BookmarkHierarchyProps {
  bookmarks: Bookmark[];
  onUpdate?: () => void;
}

interface HierarchyLevelWithColor extends HierarchyLevel {
  color?: string;
}

interface BoardState {
  id: string;
  name: string;
  levels: HierarchyLevelWithColor[];
  folderLevels: Record<string, string>;
  zoomedLevelId: string | null;
  color?: string;
}

const DEFAULT_LEVELS: HierarchyLevelWithColor[] = [
  { id: 'top', label: 'Top Level', order: 0, color: '#6366f1' },
  { id: 'second', label: 'Second Level', order: 1, color: '#8B5CF6' },
  { id: 'third', label: 'Third Level', order: 2, color: '#EC4899' },
  { id: 'fourth', label: 'Fourth Level', order: 3, color: '#F59E0B' },
  { id: 'fifth', label: 'Fifth Level', order: 4, color: '#10B981' },
];

const LEVEL_COLORS = [
  '#6366f1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', 
  '#3B82F6', '#EF4444', '#14B8A6', '#F97316', '#84CC16',
  '#06B6D4', '#A855F7', '#000000', '#64748B'
];

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 25];
const SIDEBAR_PAGE_SIZE = 10;

export function BookmarkHierarchy({ bookmarks, onUpdate }: BookmarkHierarchyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [globalCustomLogo, setGlobalCustomLogo] = useState<string | null>(null);
  
  // Folder state
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [folderPages, setFolderPages] = useState<Record<string, number>>({});
  const [itemsPerPage, setItemsPerPage] = useState<Record<string, number>>({});
  const [sideColors, setSideColors] = useState<Record<string, string>>({});
  const [sidebarPage, setSidebarPage] = useState(1);
  
  // Boards + hierarchy state
  const [boards, setBoards] = useState<BoardState[]>([
    { id: 'board-1', name: 'Board 1', levels: DEFAULT_LEVELS, folderLevels: {}, zoomedLevelId: null, color: '#6366f1' },
  ]);
  const [activeBoardId, setActiveBoardId] = useState('board-1');
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingBoardName, setEditingBoardName] = useState('');
  const [colorBoardId, setColorBoardId] = useState<string | null>(null);
  
  // Drag state
  const [draggingFolderId, setDraggingFolderId] = useState<string | null>(null);
  const [dropHoverLevel, setDropHoverLevel] = useState<string | null>(null);
  const [draggingBookmark, setDraggingBookmark] = useState<{ folderId: string; bookmarkId: string } | null>(null);
  const [folderOrders, setFolderOrders] = useState<Record<string, string[]>>({});
  const [draggingLevelId, setDraggingLevelId] = useState<string | null>(null);
  const [levelDropHover, setLevelDropHover] = useState<string | null>(null);
  
  // Level management
  const [newLevelName, setNewLevelName] = useState('');
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [editingLevelName, setEditingLevelName] = useState('');
  const [inlineEditingLevelId, setInlineEditingLevelId] = useState<string | null>(null);
  const [inlineEditingName, setInlineEditingName] = useState('');
  
  // Zoom per level
  const [zoomEnabled, setZoomEnabled] = useState(true);

  // Active board helpers (must be before any use)
  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0];
  const levels = activeBoard?.levels || DEFAULT_LEVELS;
  const folderLevels = activeBoard?.folderLevels || {};
  const activeZoomedLevelId = activeBoard?.zoomedLevelId || null;

  const updateActiveBoard = (updater: (board: BoardState) => BoardState) => {
    setBoards((prev) =>
      prev.map((b) => (b.id === activeBoardId ? updater(b) : b))
    );
  };

  // Fetch global logo
  useEffect(() => {
    const fetchGlobalLogo = async () => {
      try {
        const res = await fetch('/api/user/custom-logo');
        if (res.ok) {
          const data = await res.json();
          if (data.customLogoUrl) setGlobalCustomLogo(data.customLogoUrl);
        }
      } catch (err) {
        console.error('Error fetching global custom logo:', err);
      }
    };
    fetchGlobalLogo();
  }, []);

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

  // Initialize folder orders
  useEffect(() => {
    const newOrders: Record<string, string[]> = {};
    folders.forEach((folder) => {
      if (!folderOrders[folder.id]) {
        newOrders[folder.id] = folder.bookmarks.map((b) => b.id);
      }
    });
    if (Object.keys(newOrders).length > 0) {
      setFolderOrders((prev) => ({ ...prev, ...newOrders }));
    }
  }, [folders]);

  // Filter folders by search
  const filteredFolders = React.useMemo(() => {
    if (!searchQuery) return folders;
    return folders.filter((folder) =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      folder.bookmarks.some((b) => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [folders, searchQuery]);

  // Precompute ordered bookmarks and pagination per folder to keep expand smooth
  const folderComputed = React.useMemo(() => {
    const meta: Record<
      string,
      { ordered: Bookmark[]; perPage: number; page: number; totalPages: number; slice: Bookmark[]; startIndex: number }
    > = {};

    filteredFolders.forEach((folder) => {
      const order = folderOrders[folder.id];
      const ordered = order
        ? [...folder.bookmarks].sort((a, b) => {
            const aIndex = order.indexOf(a.id);
            const bIndex = order.indexOf(b.id);
            if (aIndex === -1 && bIndex === -1) return 0;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
          })
        : folder.bookmarks;

      const perPage = itemsPerPage[folder.id] || 5;
      const totalPages = Math.max(1, Math.ceil(ordered.length / perPage));
      const currentPage = Math.min(folderPages[folder.id] || 1, totalPages);
      const startIndex = (currentPage - 1) * perPage;
      const slice = ordered.slice(startIndex, startIndex + perPage);

      meta[folder.id] = { ordered, perPage, page: currentPage, totalPages, slice, startIndex };
    });

    return meta;
  }, [filteredFolders, folderOrders, itemsPerPage, folderPages]);

  // Reset sidebar page when filter changes
  useEffect(() => {
    setSidebarPage(1);
  }, [filteredFolders.length]);

  const sidebarTotalPages = Math.max(1, Math.ceil(filteredFolders.length / SIDEBAR_PAGE_SIZE));
  const sidebarPageFolders = filteredFolders.slice(
    (sidebarPage - 1) * SIDEBAR_PAGE_SIZE,
    sidebarPage * SIDEBAR_PAGE_SIZE
  );

  // Get folders for a specific level
  const getFoldersForLevel = (levelId: string) => {
    return filteredFolders.filter((folder) => folderLevels[folder.id] === levelId);
  };

  // Get unassigned folders (not in any level)
  const unassignedFolders = filteredFolders.filter((folder) => !folderLevels[folder.id]);

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.3));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!zoomEnabled) return;
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!zoomEnabled) return;
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (!zoomEnabled) return;
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((z) => Math.max(0.3, Math.min(3, z + delta)));
    } else if (e.shiftKey) {
      // Shift + scroll to pan horizontally
      e.preventDefault();
      setPan((p) => ({ ...p, x: p.x - e.deltaY }));
    }
  };

  const nudgePan = (dx: number, dy: number) => {
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  };

  const toggleZoomEnabled = () => {
    setZoomEnabled((prev) => !prev);
    setIsPanning(false);
  };

  const setBoardZoom = (levelId: string | null) => {
    updateActiveBoard((board) => ({ ...board, zoomedLevelId: levelId }));
  };

  const createBoard = () => {
    const newId = `board-${Date.now()}`;
    const newName = `Board ${boards.length + 1}`;
    const colorIndex = boards.length % LEVEL_COLORS.length;
    const boardColor = LEVEL_COLORS[colorIndex];
    setBoards((prev) => [
      ...prev,
      { id: newId, name: newName, levels: DEFAULT_LEVELS, folderLevels: {}, zoomedLevelId: null, color: boardColor },
    ]);
    setActiveBoardId(newId);
    setZoomEnabled(true);
    setIsPanning(false);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  const deleteBoard = (boardId: string) => {
    if (boards.length === 1) return; // keep at least one board
    setBoards((prev) => prev.filter((b) => b.id !== boardId));
    if (boardId === activeBoardId) {
      const nextBoard = boards.find((b) => b.id !== boardId);
      if (nextBoard) {
        setActiveBoardId(nextBoard.id);
        setZoomEnabled(true);
        setIsPanning(false);
        setPan({ x: 0, y: 0 });
        setZoom(1);
      }
    }
  };

  const startRenameBoard = (board: BoardState) => {
    setEditingBoardId(board.id);
    setEditingBoardName(board.name);
  };

  const setBoardColor = (boardId: string, color: string) => {
    setBoards((prev) => prev.map((b) => (b.id === boardId ? { ...b, color } : b)));
  };

  const saveRenameBoard = () => {
    if (!editingBoardId || !editingBoardName.trim()) {
      setEditingBoardId(null);
      setEditingBoardName('');
      return;
    }
    setBoards((prev) =>
      prev.map((b) => (b.id === editingBoardId ? { ...b, name: editingBoardName.trim() } : b))
    );
    setEditingBoardId(null);
    setEditingBoardName('');
  };

  const cancelRenameBoard = () => {
    setEditingBoardId(null);
    setEditingBoardName('');
  };

  // Level management
  const addLevel = () => {
    if (!activeBoard) return;
    if (levels.length >= 5) return;
    if (!newLevelName.trim()) return;
    const newId = `level-${Date.now()}`;
    const colorIndex = levels.length % LEVEL_COLORS.length;
    const nextLevels = [...levels, { id: newId, label: newLevelName.trim(), order: levels.length, color: LEVEL_COLORS[colorIndex] }];
    updateActiveBoard((board) => ({ ...board, levels: nextLevels }));
    setNewLevelName('');
    // Auto-scroll to see the new level
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);
  };

  const deleteLevel = (id: string) => {
    if (!activeBoard) return;
    const filtered = levels.filter((l) => l.id !== id).map((l, i) => ({ ...l, order: i }));
    updateActiveBoard((board) => ({
      ...board,
      levels: filtered,
      folderLevels: Object.fromEntries(
        Object.entries(board.folderLevels).filter(([, levelId]) => levelId !== id)
      ),
    }));
  };

  const startEditLevel = (level: HierarchyLevelWithColor) => {
    setEditingLevelId(level.id);
    setEditingLevelName(level.label);
  };

  const saveEditLevel = () => {
    if (!editingLevelId || !editingLevelName.trim()) return;
    updateActiveBoard((board) => ({
      ...board,
      levels: board.levels.map((l) => (l.id === editingLevelId ? { ...l, label: editingLevelName.trim() } : l)),
    }));
    setEditingLevelId(null);
    setEditingLevelName('');
  };

  // Inline editing for level titles
  const startInlineEdit = (level: HierarchyLevelWithColor) => {
    setInlineEditingLevelId(level.id);
    setInlineEditingName(level.label);
  };

  const saveInlineEdit = () => {
    if (!inlineEditingLevelId || !inlineEditingName.trim()) return;
    updateActiveBoard((board) => ({
      ...board,
      levels: board.levels.map((l) => (l.id === inlineEditingLevelId ? { ...l, label: inlineEditingName.trim() } : l)),
    }));
    setInlineEditingLevelId(null);
    setInlineEditingName('');
  };

  const cancelInlineEdit = () => {
    setInlineEditingLevelId(null);
    setInlineEditingName('');
  };

  // Level color change
  const setLevelColor = (levelId: string, color: string) => {
    updateActiveBoard((board) => ({
      ...board,
      levels: board.levels.map((l) => (l.id === levelId ? { ...l, color } : l)),
    }));
  };

  // Level reordering via drag and drop
  const handleLevelDragStart = (levelId: string) => {
    setDraggingLevelId(levelId);
  };

  const handleLevelReorderDrop = (targetLevelId: string) => {
    if (!draggingLevelId || draggingLevelId === targetLevelId) {
      setDraggingLevelId(null);
      setLevelDropHover(null);
      return;
    }

    updateActiveBoard((board) => {
      const newLevels = [...board.levels];
      const dragIndex = newLevels.findIndex((l) => l.id === draggingLevelId);
      const targetIndex = newLevels.findIndex((l) => l.id === targetLevelId);
      
      if (dragIndex === -1 || targetIndex === -1) return board;
      
      const [draggedLevel] = newLevels.splice(dragIndex, 1);
      newLevels.splice(targetIndex, 0, draggedLevel);
      
      return { ...board, levels: newLevels.map((l, i) => ({ ...l, order: i })) };
    });

    setDraggingLevelId(null);
    setLevelDropHover(null);
  };

  const handleLevelReorderDragEnd = () => {
    setDraggingLevelId(null);
    setLevelDropHover(null);
  };

  // Move level up/down
  const moveLevelUp = (levelId: string) => {
    updateActiveBoard((board) => {
      const index = board.levels.findIndex((l) => l.id === levelId);
      if (index <= 0) return board;
      const newLevels = [...board.levels];
      [newLevels[index - 1], newLevels[index]] = [newLevels[index], newLevels[index - 1]];
      return { ...board, levels: newLevels.map((l, i) => ({ ...l, order: i })) };
    });
  };

  const moveLevelDown = (levelId: string) => {
    updateActiveBoard((board) => {
      const index = board.levels.findIndex((l) => l.id === levelId);
      if (index === -1 || index >= board.levels.length - 1) return board;
      const newLevels = [...board.levels];
      [newLevels[index], newLevels[index + 1]] = [newLevels[index + 1], newLevels[index]];
      return { ...board, levels: newLevels.map((l, i) => ({ ...l, order: i })) };
    });
  };

  // Folder expand/collapse
  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // Folder pagination
  const getFolderPage = (folderId: string) => folderPages[folderId] || 1;
  const getFolderItemsPerPage = (folderId: string) => itemsPerPage[folderId] || 5;
  
  const setFolderPage = (folderId: string, page: number) => {
    const meta = folderComputed[folderId];
    const maxPage = meta ? meta.totalPages : page;
    const safePage = Math.min(Math.max(1, page), maxPage);
    setFolderPages((prev) => ({ ...prev, [folderId]: safePage }));
  };

  const setFolderItemsPerPage = (folderId: string, count: number) => {
    setItemsPerPage((prev) => ({ ...prev, [folderId]: count }));
    setFolderPages((prev) => ({ ...prev, [folderId]: 1 })); // Reset to page 1
  };

  // Folder drag handlers
  const handleFolderDragStart = (folderId: string) => {
    setDraggingFolderId(folderId);
  };

  const handleFolderDragEnd = () => {
    setDraggingFolderId(null);
    setDropHoverLevel(null);
  };

  const handleLevelDragOver = (e: React.DragEvent, levelId: string) => {
    e.preventDefault();
    setDropHoverLevel(levelId);
  };

  const handleLevelDrop = (e: React.DragEvent, levelId: string) => {
    e.preventDefault();
    if (draggingFolderId) {
      updateActiveBoard((board) => ({
        ...board,
        folderLevels: { ...board.folderLevels, [draggingFolderId]: levelId },
      }));
    }
    setDropHoverLevel(null);
    setDraggingFolderId(null);
  };

  const removeFolderFromLevel = (folderId: string) => {
    updateActiveBoard((board) => {
      const next = { ...board.folderLevels };
      delete next[folderId];
      return { ...board, folderLevels: next };
    });
  };

  // Bookmark drag handlers for reordering
  const handleBookmarkDragStart = (folderId: string, bookmarkId: string) => {
    setDraggingBookmark({ folderId, bookmarkId });
  };

  const handleBookmarkDrop = (folderId: string, targetBookmarkId: string) => {
    if (!draggingBookmark || draggingBookmark.folderId !== folderId) return;
    if (draggingBookmark.bookmarkId === targetBookmarkId) return;

    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;

    setFolderOrders((prev) => {
      const currentOrder = prev[folderId] || folder.bookmarks.map((b) => b.id);
      const filtered = currentOrder.filter((id) => id !== draggingBookmark.bookmarkId);
      const targetIndex = filtered.indexOf(targetBookmarkId);
      const insertIndex = targetIndex === -1 ? filtered.length : targetIndex;
      filtered.splice(insertIndex, 0, draggingBookmark.bookmarkId);
      return { ...prev, [folderId]: filtered };
    });
    setDraggingBookmark(null);
  };

  const handleBookmarkDragEnd = () => {
    setDraggingBookmark(null);
  };

  // Get folder color
  const getFolderColor = (folder: Folder) => {
    return sideColors[folder.id] || folder.color || '#6366f1';
  };

  // Get ordered bookmarks for a folder
  const getOrderedBookmarks = (folder: Folder) => {
    const order = folderOrders[folder.id];
    if (!order) return folder.bookmarks;
    
    return [...folder.bookmarks].sort((a, b) => {
      const aIndex = order.indexOf(a.id);
      const bIndex = order.indexOf(b.id);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  };

  // Render the full folder card with bookmarks inside
  const renderFolderCard = (folder: Folder, inLevel: boolean = false) => {
    const color = getFolderColor(folder);
    const isExpanded = expandedFolders.has(folder.id);
    const meta = folderComputed[folder.id] || {
      ordered: folder.bookmarks,
      perPage: getFolderItemsPerPage(folder.id),
      page: getFolderPage(folder.id),
      totalPages: 1,
      slice: folder.bookmarks,
      startIndex: 0,
    };
    
    return (
      <div
        key={folder.id}
        draggable={!isExpanded}
        onDragStart={() => !isExpanded && handleFolderDragStart(folder.id)}
        onDragEnd={handleFolderDragEnd}
        className={`bg-white rounded-xl border border-black/15 shadow-md hover:shadow-lg transition-all ${
          !isExpanded ? 'cursor-grab active:cursor-grabbing' : ''
        } ${draggingFolderId === folder.id ? 'opacity-50 scale-95' : ''}`}
        style={{ 
          borderLeftWidth: '5px', 
          borderLeftColor: color,
          minWidth: isExpanded ? '400px' : '280px',
          maxWidth: isExpanded ? '500px' : '320px',
        }}
      >
        {/* Folder Header */}
        <div 
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-t-xl"
          onClick={() => toggleFolder(folder.id)}
        >
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="relative w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
              {globalCustomLogo ? (
                <Image src={globalCustomLogo} alt={folder.name} fill className="object-contain p-1" />
              ) : (
                <span className="text-xl font-bold" style={{ color }}>{folder.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 truncate">{folder.name}</h4>
              <p className="text-sm text-gray-500">{folder.bookmarks.length} bookmarks</p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  {inLevel && (
                    <>
                      <DropdownMenuItem onClick={() => removeFolderFromLevel(folder.id)}>
                        <X className="w-4 h-4 mr-2" />
                        Remove from level
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <div className="px-2 py-2">
                    <div className="text-xs font-medium text-gray-500 mb-2">Side Color</div>
                    <div className="flex gap-1 flex-wrap">
                      {['#FF6B6B', '#4ECDC4', '#FFE66D', '#6366f1', '#A8E6CF', '#B4A7D6', '#F39C12', '#000000'].map((c) => (
                        <button
                          key={c}
                          className={`w-6 h-6 rounded-md border-2 transition ${sideColors[folder.id] === c ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: c }}
                          onClick={() => setSideColors((prev) => ({ ...prev, [folder.id]: c }))}
                        />
                      ))}
                    </div>
                    <Input
                      className="mt-2 h-8 text-xs"
                      placeholder="Custom #hex"
                      value={sideColors[folder.id] || ''}
                      onChange={(e) => setSideColors((prev) => ({ ...prev, [folder.id]: e.target.value }))}
                    />
                    {sideColors[folder.id] && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full mt-1 text-xs"
                        onClick={() => setSideColors((prev) => {
                          const next = { ...prev };
                          delete next[folder.id];
                          return next;
                        })}
                      >
                        Reset to default
                      </Button>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min((folder.bookmarks.length / 20) * 100, 100)}%`, backgroundColor: color }}
            />
          </div>
        </div>
        
        {/* Expanded Bookmarks Section */}
        {isExpanded && (
          <div className="border-t border-gray-100">
            {/* Items per page selector */}
            <div className="px-4 py-2 bg-gray-50 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Showing {startIndex + 1}-{Math.min(startIndex + perPage, orderedBookmarks.length)} of {orderedBookmarks.length}
              </span>
              <Select
                value={String(perPage)}
                onValueChange={(val) => setFolderItemsPerPage(folder.id, parseInt(val))}
              >
                <SelectTrigger className="w-20 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={String(opt)}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Bookmarks List */}
            <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
              {paginatedBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  draggable
                  onDragStart={() => handleBookmarkDragStart(folder.id, bookmark.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleBookmarkDrop(folder.id, bookmark.id)}
                  onDragEnd={handleBookmarkDragEnd}
                  className={`flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing transition-colors border border-transparent hover:border-gray-200 ${
                    draggingBookmark?.bookmarkId === bookmark.id ? 'opacity-50' : ''
                  }`}
                >
                  {/* Favicon */}
                  <div className="w-8 h-8 rounded bg-white border flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {bookmark.favicon ? (
                      <Image src={bookmark.favicon} alt="" width={20} height={20} className="object-contain" />
                    ) : (
                      <span className="text-xs font-bold text-gray-400">
                        {bookmark.title.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-sm text-gray-900 truncate">{bookmark.title}</h5>
                    <p className="text-xs text-gray-500 truncate">{bookmark.url}</p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {bookmark.isFavorite && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBookmark(bookmark);
                      }}
                      className="p-1.5 rounded hover:bg-white"
                    >
                      <Edit className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFolderPage(folder.id, page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 px-3">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFolderPage(folder.id, page + 1)}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 uppercase flex items-center gap-3">
              <FolderKanban className="w-7 h-7 text-indigo-600" />
              Hierarchy Board
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Drag folders into levels • Click folder to expand • Alt+drag to pan • Ctrl+scroll to zoom
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowManageDialog(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Manage Levels
            </Button>
          </div>
        </div>

        {/* Board selector */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {boards.map((board) => (
            <div
              key={board.id}
              className={`relative rounded-xl border transition shadow-sm hover:shadow-md px-3 py-2 flex items-center gap-3 min-w-[200px]`}
              style={{
                borderColor: board.color || '#E5E7EB',
                backgroundColor: board.id === activeBoardId ? (board.color ? `${board.color}15` : '#EEF2FF') : '#FFFFFF',
                boxShadow: board.id === activeBoardId ? `0 0 0 3px ${(board.color || '#6366f1')}20` : undefined,
              }}
              onClick={() => setActiveBoardId(board.id)}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: board.color ? `${board.color}22` : '#E5E7EB',
                  color: board.color || '#374151',
                }}
              >
                {boards.indexOf(board) + 1}
              </div>
              <div className="flex-1 min-w-0">
                {editingBoardId === board.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingBoardName}
                      onChange={(e) => setEditingBoardName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); saveRenameBoard(); }
                        if (e.key === 'Escape') { e.preventDefault(); cancelRenameBoard(); }
                      }}
                      className="h-8 text-sm"
                      autoFocus
                    />
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); saveRenameBoard(); }}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); cancelRenameBoard(); }}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <div className="font-semibold text-sm text-gray-900 truncate">
                      {board.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">Customizable board</div>
                  </>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                    onClick={(e) => e.stopPropagation()}
                    title="Board options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={() => startRenameBoard(board)}>
                    Rename board
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setColorBoardId((prev) => (prev === board.id ? null : board.id))}
                  >
                    Change color
                  </DropdownMenuItem>
                  {colorBoardId === board.id && (
                    <div className="px-2 py-2 space-y-2 border-t mt-1">
                      <div className="text-xs text-gray-500 mb-1">Board color</div>
                      <div className="grid grid-cols-7 gap-1">
                        {LEVEL_COLORS.map((c) => (
                          <button
                            key={c}
                            className={`w-6 h-6 rounded-md border-2 transition ${board.color === c ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setBoardColor(board.id, c)}
                          />
                        ))}
                      </div>
                      <Input
                        className="h-8 text-xs"
                        placeholder="Custom #hex"
                        value={board.color || ''}
                        onChange={(e) => setBoardColor(board.id, e.target.value)}
                      />
                    </div>
                  )}
                  <DropdownMenuItem
                    className={`text-red-600 ${boards.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (boards.length === 1) return;
                      deleteBoard(board.id);
                    }}
                  >
                    Delete board
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={createBoard}>
            + New Board
          </Button>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search folders or bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Button variant="ghost" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="px-2 text-sm font-medium min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleResetView}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Button variant="ghost" size="sm" onClick={() => nudgePan(-120, 0)} title="Pan left">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => nudgePan(120, 0)} title="Pan right">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Available Folders */}
        <div className="w-72 flex-shrink-0 bg-gray-50 border-r p-4 overflow-y-auto">
          <div className="mb-4">
            <h3 className="font-bold text-gray-700 uppercase text-sm tracking-wide flex items-center gap-2">
              <FolderKanban className="w-4 h-4" />
              Available Folders
            </h3>
            <p className="text-xs text-gray-500 mt-1">{filteredFolders.length} folders • Drag to assign</p>
          </div>
          
          {filteredFolders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FolderKanban className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No folders found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sidebarPageFolders.map((folder) => {
                const isAssigned = !!folderLevels[folder.id];
                const assignedLevel = levels.find(l => l.id === folderLevels[folder.id]);
                const color = getFolderColor(folder);
                
                return (
                  <div
                    key={folder.id}
                    draggable
                    onDragStart={() => handleFolderDragStart(folder.id)}
                    onDragEnd={handleFolderDragEnd}
                    className={`relative bg-white rounded-lg border shadow-sm hover:shadow transition-all cursor-grab active:cursor-grabbing p-3 ${
                      draggingFolderId === folder.id ? 'opacity-50 scale-95' : ''
                    } ${isAssigned ? 'border-green-400 bg-green-50/50' : 'border-gray-200'}`}
                    style={{ borderLeftWidth: '4px', borderLeftColor: color }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                        {globalCustomLogo ? (
                          <Image src={globalCustomLogo} alt={folder.name} fill className="object-contain p-0.5" />
                        ) : (
                          <span className="text-sm font-bold" style={{ color }}>{folder.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">{folder.name}</h4>
                        <p className="text-xs text-gray-500">{folder.bookmarks.length} items</p>
                      </div>
                    </div>
                    {isAssigned && assignedLevel && (
                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                          {assignedLevel.label}
                        </Badge>
                        <button
                          onClick={() => removeFolderFromLevel(folder.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {sidebarTotalPages > 1 && (
                <div className="pt-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Page {sidebarPage} of {sidebarTotalPages}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSidebarPage((p) => Math.max(1, p - 1))}
                        disabled={sidebarPage === 1}
                        className="h-8 px-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSidebarPage((p) => Math.min(sidebarTotalPages, p + 1))}
                        disabled={sidebarPage === sidebarTotalPages}
                        className="h-8 px-2"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Canvas Container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onClick={toggleZoomEnabled}
          style={{ cursor: isPanning ? 'grabbing' : zoomEnabled ? 'default' : 'pointer' }}
        >
          {/* Zoomable/Pannable Canvas */}
          <div
            ref={canvasRef}
            className="absolute inset-0 px-12 py-10"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'top center',
              transition: isPanning || !zoomEnabled ? 'none' : 'transform 0.1s ease-out',
              minWidth: '1600px',
              minHeight: '900px',
            }}
          >
            {/* Hierarchy Levels */}
            <div className="flex flex-col gap-10">
              {levels.map((level, levelIndex) => {
                const levelFolders = getFoldersForLevel(level.id);
                const isHovered = dropHoverLevel === level.id;
                const levelColor = level.color || '#6366f1';
                const isZoomed = activeZoomedLevelId === level.id;
                const isLevelDragging = draggingLevelId === level.id;
                const isLevelDropTarget = levelDropHover === level.id;
                
                return (
                  <div 
                    key={level.id} 
                    className={`relative transition-all ${isLevelDragging ? 'opacity-50' : ''} ${isZoomed ? 'scale-110 z-10' : ''}`}
                    style={{ transformOrigin: 'center top' }}
                  >
                    {/* Drop indicator for level reordering */}
                    {isLevelDropTarget && draggingLevelId && (
                      <div className="absolute -top-3 left-0 right-0 h-1 bg-blue-500 rounded-full z-20" />
                    )}
                    
                    {/* Connecting lines from previous level */}
                    {levelIndex > 0 && (
                      <svg className="absolute -top-6 left-0 w-full h-6 pointer-events-none overflow-visible">
                        <line
                          x1="50%"
                          y1="0"
                          x2="50%"
                          y2="100%"
                          stroke={levelColor}
                          strokeWidth="3"
                          strokeDasharray="8 4"
                        />
                      </svg>
                    )}
                    
                    {/* Level Header - Draggable for reordering */}
                    <div 
                      className="flex items-center justify-center mb-3 gap-2"
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        handleLevelDragStart(level.id);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (draggingLevelId && draggingLevelId !== level.id) {
                          setLevelDropHover(level.id);
                        }
                      }}
                      onDragLeave={() => setLevelDropHover(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLevelReorderDrop(level.id);
                      }}
                      onDragEnd={handleLevelReorderDragEnd}
                    >
                      {/* Move up button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-60 hover:opacity-100"
                        onClick={() => moveLevelUp(level.id)}
                        disabled={levelIndex === 0}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      
                      {/* Level title badge */}
                      <div 
                        className="px-6 py-2.5 bg-white rounded-full shadow-lg border-2 cursor-grab active:cursor-grabbing flex items-center gap-2"
                        style={{ borderColor: levelColor }}
                      >
                        {inlineEditingLevelId === level.id ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={inlineEditingName}
                              onChange={(e) => setInlineEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveInlineEdit();
                                if (e.key === 'Escape') cancelInlineEdit();
                              }}
                              className="h-7 w-40 text-sm font-bold uppercase"
                              autoFocus
                            />
                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={saveInlineEdit}>
                              ✓
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={cancelInlineEdit}>
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <span 
                            className="font-bold uppercase tracking-wider cursor-text hover:underline"
                            style={{ color: levelColor }}
                            onClick={(e) => {
                              e.stopPropagation();
                              startInlineEdit(level);
                            }}
                            title="Click to edit"
                          >
                            {level.label}
                          </span>
                        )}
                        <Badge 
                          variant="secondary" 
                          className="ml-2"
                          style={{ backgroundColor: levelColor + '20', color: levelColor }}
                        >
                          {levelFolders.length}
                        </Badge>
                        
                        {/* Color picker dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button 
                              className="w-5 h-5 rounded-full border-2 border-white shadow-sm ml-1"
                              style={{ backgroundColor: levelColor }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className="p-2">
                            <div className="text-xs font-medium text-gray-500 mb-2">Level Color</div>
                            <div className="grid grid-cols-7 gap-1">
                              {LEVEL_COLORS.map((c) => (
                                <button
                                  key={c}
                                  className={`w-6 h-6 rounded-md border-2 transition ${level.color === c ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'}`}
                                  style={{ backgroundColor: c }}
                                  onClick={() => setLevelColor(level.id, c)}
                                />
                              ))}
                            </div>
                            <Input
                              className="mt-2 h-7 text-xs"
                              placeholder="Custom #hex"
                              value={level.color || ''}
                              onChange={(e) => setLevelColor(level.id, e.target.value)}
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        {/* Zoom toggle */}
                        <button
                          className="p-1 rounded hover:bg-gray-100 ml-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBoardZoom(isZoomed ? null : level.id);
                          }}
                          title={isZoomed ? 'Zoom out' : 'Zoom in'}
                        >
                          {isZoomed ? <ZoomOut className="w-4 h-4" style={{ color: levelColor }} /> : <ZoomIn className="w-4 h-4" style={{ color: levelColor }} />}
                        </button>
                      </div>
                      
                      {/* Move down button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-60 hover:opacity-100"
                        onClick={() => moveLevelDown(level.id)}
                        disabled={levelIndex === levels.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Level Drop Zone */}
                    <div
                      onDragOver={(e) => {
                        if (!draggingLevelId) {
                          handleLevelDragOver(e, level.id);
                        }
                      }}
                      onDragLeave={() => setDropHoverLevel(null)}
                      onDrop={(e) => {
                        if (!draggingLevelId) {
                          handleLevelDrop(e, level.id);
                        }
                      }}
                      className={`min-h-[200px] rounded-2xl border-2 transition-all p-6 pb-8 ${
                        isHovered
                          ? 'shadow-lg border-solid'
                          : 'border-dashed bg-white/50'
                      }`}
                      style={{
                        borderColor: isHovered ? levelColor : '#D1D5DB',
                        backgroundColor: isHovered ? levelColor + '15' : undefined,
                      }}
                    >
                      {levelFolders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
                          {levelFolders.map((folder) => renderFolderCard(folder, true))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[100px] text-gray-400">
                          <div 
                            className={`w-16 h-16 rounded-2xl border-2 border-dashed flex items-center justify-center mb-2 transition-all`}
                            style={{ 
                              borderColor: isHovered ? levelColor : '#D1D5DB',
                              backgroundColor: isHovered ? levelColor + '10' : undefined
                            }}
                          >
                            <Move className={`w-6 h-6`} style={{ color: isHovered ? levelColor : '#9CA3AF' }} />
                          </div>
                          <p className="font-medium text-sm">Drop folders here</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Connecting lines to next level */}
                    {levelIndex < levels.length - 1 && (
                      <svg className="w-full h-8 mt-5 pointer-events-none overflow-visible">
                        <line
                          x1="50%"
                          y1="0"
                          x2="50%"
                          y2="100%"
                          stroke={levelColor}
                          strokeWidth="3"
                          strokeDasharray="8 4"
                        />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Manage Levels Dialog */}
      <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="uppercase">Manage Hierarchy Levels</DialogTitle>
            <DialogDescription>
              Add, rename, reorder, or remove levels. Drag levels to reorder them, or use the arrow buttons. Limit: 5 levels per board.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Add new level */}
            <div className="flex gap-2">
              <Input
                placeholder="New level name (e.g., Executive, Manager, Staff)..."
                value={newLevelName}
                onChange={(e) => setNewLevelName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLevel()}
              />
              <Button onClick={addLevel} disabled={!newLevelName.trim() || levels.length >= 5}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            {levels.length >= 5 && (
              <p className="text-xs text-red-500">Reached max of 5 levels for this board. Create a new board to add more.</p>
            )}
            
            {/* Existing levels */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {levels.map((level, index) => (
                <div
                  key={level.id}
                  draggable
                  onDragStart={() => handleLevelDragStart(level.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (draggingLevelId && draggingLevelId !== level.id) {
                      setLevelDropHover(level.id);
                    }
                  }}
                  onDragLeave={() => setLevelDropHover(null)}
                  onDrop={() => handleLevelReorderDrop(level.id)}
                  onDragEnd={handleLevelReorderDragEnd}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all ${
                    draggingLevelId === level.id ? 'opacity-50 scale-95' : ''
                  } ${levelDropHover === level.id ? 'border-blue-500 bg-blue-50' : 'bg-gray-50'}`}
                  style={{ borderLeftWidth: '4px', borderLeftColor: level.color || '#6366f1' }}
                >
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button 
                      className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"
                      onClick={() => moveLevelUp(level.id)}
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button 
                      className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"
                      onClick={() => moveLevelDown(level.id)}
                      disabled={index === levels.length - 1}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {/* Position number */}
                  <span 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
                    style={{ backgroundColor: level.color || '#6366f1' }}
                  >
                    {index + 1}
                  </span>
                  
                  {editingLevelId === level.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editingLevelName}
                        onChange={(e) => setEditingLevelName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEditLevel()}
                        autoFocus
                        className="flex-1"
                      />
                      <Button size="sm" onClick={saveEditLevel}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingLevelId(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 font-medium">{level.label}</span>
                      
                      {/* Color picker */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className="w-6 h-6 rounded-full border-2 border-white shadow"
                            style={{ backgroundColor: level.color || '#6366f1' }}
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="p-2">
                          <div className="grid grid-cols-7 gap-1">
                            {LEVEL_COLORS.map((c) => (
                              <button
                                key={c}
                                className={`w-5 h-5 rounded border-2 transition ${level.color === c ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'}`}
                                style={{ backgroundColor: c }}
                                onClick={() => setLevelColor(level.id, c)}
                              />
                            ))}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Badge variant="secondary">{getFoldersForLevel(level.id).length}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => startEditLevel(level)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteLevel(level.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManageDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bookmark Detail Modal */}
      {selectedBookmark && (
        <BookmarkDetailModal
          bookmark={selectedBookmark}
          open={!!selectedBookmark}
          onOpenChange={(open) => {
            if (!open) setSelectedBookmark(null);
          }}
          onUpdate={onUpdate || (() => {})}
        />
      )}
    </div>
  );
}
