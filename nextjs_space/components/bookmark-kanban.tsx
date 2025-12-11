'use client';

import { useState, useEffect, DragEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { BookmarkDetailModal } from './bookmark-detail-modal';
import { 
  Search, 
  Filter, 
  Settings, 
  Plus, 
  MoreVertical, 
  ChevronDown,
  GripVertical,
  MessageSquare,
  Paperclip,
  Star,
  Eye,
  Palette,
  Heart,
  ExternalLink,
  Copy,
  Trash2,
  Edit3,
  ArrowUpDown,
  X,
  SlidersHorizontal,
  LayoutGrid,
  Tag,
  BarChart3,
  Layers
} from 'lucide-react';

interface BookmarkKanbanProps {
  bookmarks: any[];
  onUpdate: () => void;
}

interface KanbanColumn {
  id: string;
  name: string;
  description: string;
  statusColor: string;
  statusDotColor: string;
}

interface KanbanRow {
  id: string;
  name: string;
  isExpanded: boolean;
  columns: KanbanColumn[];
}

const defaultColumns: KanbanColumn[] = [
  {
    id: 'BACKLOG',
    name: 'BACKLOG',
    description: 'Items to be reviewed and prioritized',
    statusColor: 'text-gray-600',
    statusDotColor: 'bg-gray-600',
  },
  {
    id: 'TODO',
    name: 'TO DO',
    description: 'Ready to work on',
    statusColor: 'text-orange-600',
    statusDotColor: 'bg-orange-600',
  },
  {
    id: 'IN_PROGRESS',
    name: 'IN PROGRESS',
    description: 'Currently being worked on',
    statusColor: 'text-blue-600',
    statusDotColor: 'bg-blue-600',
  },
];

const getPriorityConfig = (priority: string) => {
  switch (priority?.toUpperCase()) {
    case 'LOW':
      return { text: 'low', color: 'text-green-600', dotColor: 'bg-green-600' };
    case 'MEDIUM':
      return { text: 'medium', color: 'text-yellow-600', dotColor: 'bg-yellow-600' };
    case 'HIGH':
      return { text: 'high', color: 'text-orange-600', dotColor: 'bg-orange-600' };
    case 'URGENT':
      return { text: 'urgent', color: 'text-red-600', dotColor: 'bg-red-600' };
    default:
      return { text: 'medium', color: 'text-yellow-600', dotColor: 'bg-yellow-600' };
  }
};

const getCardAccentColor = (priority: string) => {
  switch (priority?.toUpperCase()) {
    case 'LOW':
      return '';
    case 'MEDIUM':
      return 'border-l-yellow-400';
    case 'HIGH':
      return 'border-l-orange-400';
    case 'URGENT':
      return 'border-l-red-400';
    default:
      return '';
  }
};

export function BookmarkKanban({ bookmarks, onUpdate }: BookmarkKanbanProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [rows, setRows] = useState<KanbanRow[]>([
    {
      id: 'row-1',
      name: 'Row 1',
      isExpanded: true,
      columns: [...defaultColumns],
    },
  ]);
  const [cards, setCards] = useState<any[]>(bookmarks || []);
  const [editingColumn, setEditingColumn] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [cardPositions, setCardPositions] = useState<Record<string, string>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string>('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuRowId, setAddMenuRowId] = useState<string | null>(null);
  const [addMenuQuery, setAddMenuQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filterPriorities, setFilterPriorities] = useState<Set<string>>(new Set());
  const [filterStatuses, setFilterStatuses] = useState<Set<string>>(new Set());
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [showTags, setShowTags] = useState(true);
  const [compactCards, setCompactCards] = useState(false);
  const [cardMenuId, setCardMenuId] = useState<string | null>(null);
  const [columnMenuId, setColumnMenuId] = useState<string | null>(null);
  const [accentColorOverrides, setAccentColorOverrides] = useState<Record<string, string>>({});
  const [cardModalId, setCardModalId] = useState<string | null>(null);
  const [selectedAddIds, setSelectedAddIds] = useState<Set<string>>(new Set());
  const [selectedBookmark, setSelectedBookmark] = useState<any | null>(null);
  const [showWipLimit, setShowWipLimit] = useState(false);
  const [showCardLabels, setShowCardLabels] = useState(true);
  const [autoSort, setAutoSort] = useState(false);

  const getInitialStatusForBookmark = (bookmark: any) => {
    if (bookmark.priority === 'HIGH' || bookmark.priority === 'URGENT') {
      return 'TODO';
    }
    if (bookmark.visitCount > 5) {
      return 'IN_PROGRESS';
    }
    return 'BACKLOG';
  };

  // Initialize or refresh card positions when bookmarks change
  useEffect(() => {
    setCards(bookmarks || []);
    const nextPositions: Record<string, string> = {};
    bookmarks.forEach((bookmark) => {
      nextPositions[bookmark.id] = cardPositions[bookmark.id] || getInitialStatusForBookmark(bookmark);
    });
    setCardPositions(nextPositions);
  }, [bookmarks]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragStart = (event: DragEvent<HTMLDivElement>, bookmarkId: string) => {
    event.dataTransfer.setData('text/plain', bookmarkId);
    setDraggingId(bookmarkId);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, columnId: string) => {
    event.preventDefault();
    const bookmarkId = event.dataTransfer.getData('text/plain');
    if (!bookmarkId) return;
    setCardPositions((prev) => ({
      ...prev,
      [bookmarkId]: columnId,
    }));
    setDraggingId(null);
  };

  const handleToggleFavorite = (bookmarkId: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === bookmarkId ? { ...card, isFavorite: !card.isFavorite } : card
      )
    );
    setActionMessage('Updated favorite');
  };

  const handleAddCard = (rowId: string) => {
    setAddMenuRowId(rowId);
    setShowAddMenu(true);
    setSelectedAddIds(new Set());
    setActionMessage('Select cards to add');
  };

  const handleAddColumn = (rowId: string) => {
    const newId = `COL-${Date.now()}`;
    const newColumn: KanbanColumn = {
      id: newId,
      name: 'NEW COLUMN',
      description: 'Custom column',
      statusColor: 'text-purple-600',
      statusDotColor: 'bg-purple-600',
    };
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, columns: [...row.columns, newColumn] } : row
      )
    );
    setActionMessage('Added a new column');
  };

  const handleColumnMenuClick = (rowId: string, columnId: string) => {
    const key = `${rowId}:${columnId}`;
    setColumnMenuId((prev) => (prev === key ? null : key));
    setActionMessage('');
  };

  const handleDeleteColumn = (rowId: string, columnId: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? { ...row, columns: row.columns.filter((c) => c.id !== columnId) }
          : row
      )
    );
    setColumnMenuId(null);
    setActionMessage('Column removed');
  };

  const handleCardMenuClick = (bookmarkId: string) => {
    setCardMenuId((prev) => (prev === bookmarkId ? null : bookmarkId));
    setActionMessage('');
  };

  const handleAccentChange = (bookmarkId: string, colorValue: string) => {
    setAccentColorOverrides((prev) => {
      const next = { ...prev };
      if (!colorValue) {
        delete next[bookmarkId];
      } else {
        next[bookmarkId] = colorValue;
      }
      return next;
    });
    setActionMessage('Updated card color');
    setCardMenuId(null);
  };

  const presetAccentOptions = [
    { label: 'Default (by priority)', value: '' },
    { label: 'Blue', value: '#3B82F6' },
    { label: 'Green', value: '#22C55E' },
    { label: 'Orange', value: '#F97316' },
    { label: 'Red', value: '#EF4444' },
    { label: 'Purple', value: '#A855F7' },
  ];

  const handleOpenCard = (bookmark: any) => {
    setSelectedBookmark(bookmark);
  };

  const togglePriorityFilter = (priority: string) => {
    setFilterPriorities((prev) => {
      const next = new Set(prev);
      if (next.has(priority)) {
        next.delete(priority);
      } else {
        next.add(priority);
      }
      return next;
    });
  };

  const toggleStatusFilter = (status: string) => {
    setFilterStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const filteredCards = cards.filter((card) => {
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      const haystack = `${card.title || ''} ${card.description || ''} ${card.tags?.map((t: any) => t.tag?.name || t.name || '').join(' ')}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filterPriorities.size && card.priority && !filterPriorities.has(card.priority.toUpperCase())) {
      return false;
    }
    const status = cardPositions[card.id] || getInitialStatusForBookmark(card);
    if (filterStatuses.size && !filterStatuses.has(status)) {
      return false;
    }
    return true;
  });

  const existingIds = new Set(cards.map((c) => c.id));
  const [addCardPage, setAddCardPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  
  const allAddableBookmarks = bookmarks
    .filter((b) => !existingIds.has(b.id))
    .filter((b) => {
      const q = addMenuQuery.trim().toLowerCase();
      if (!q) return true;
      return `${b.title || ''} ${b.description || ''}`.toLowerCase().includes(q);
    });
  
  const totalAddableCount = allAddableBookmarks.length;
  const totalPages = Math.ceil(totalAddableCount / ITEMS_PER_PAGE);
  const addableBookmarks = allAddableBookmarks.slice(
    (addCardPage - 1) * ITEMS_PER_PAGE,
    addCardPage * ITEMS_PER_PAGE
  );
  
  // Reset page when search changes
  useEffect(() => {
    setAddCardPage(1);
  }, [addMenuQuery]);

  const handleSelectAddCard = (bookmark: any) => {
    setSelectedAddIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookmark.id)) {
        next.delete(bookmark.id);
      } else {
        next.add(bookmark.id);
      }
      return next;
    });
  };

  const handleAddSelectedCards = () => {
    if (!addMenuRowId || selectedAddIds.size === 0) {
      setShowAddMenu(false);
      return;
    }
    const toAdd = bookmarks.filter((b) => selectedAddIds.has(b.id));
    setCards((prev) => [...prev, ...toAdd]);
    setCardPositions((prev) => {
      const next = { ...prev };
      toAdd.forEach((b) => {
        next[b.id] = 'BACKLOG';
      });
      return next;
    });
    setActionMessage(`Added ${toAdd.length} card(s) to Backlog`);
    setShowAddMenu(false);
    setSelectedAddIds(new Set());
  };

  const toggleSetting = (setter: (val: boolean | ((v: boolean) => boolean)) => void) => {
    setter((prev: boolean) => !prev);
  };

  // Group bookmarks by column
  const groupedBookmarks = filteredCards.reduce((groups: any, bookmark: any) => {
    const status = cardPositions[bookmark.id] || getInitialStatusForBookmark(bookmark);
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(bookmark);
    return groups;
  }, {});

  const totalCards = bookmarks.length;

  const handleAddRow = () => {
    const newRowNumber = rows.length + 1;
    const newRow: KanbanRow = {
      id: `row-${newRowNumber}`,
      name: `Row ${newRowNumber}`,
      isExpanded: true,
      columns: [...defaultColumns],
    };
    setRows([...rows, newRow]);
  };

  const toggleRowExpansion = (rowId: string) => {
    setRows(rows.map(row => 
      row.id === rowId ? { ...row, isExpanded: !row.isExpanded } : row
    ));
  };

  const startEditingColumn = (rowId: string, columnId: string, currentName: string) => {
    setEditingColumn({ rowId, columnId });
    setEditingValue(currentName);
  };

  const saveColumnName = (rowId: string, columnId: string) => {
    if (editingValue.trim()) {
      setRows(rows.map(row => {
        if (row.id === rowId) {
          return {
            ...row,
            columns: row.columns.map(col => 
              col.id === columnId ? { ...col, name: editingValue.trim().toUpperCase() } : col
            )
          };
        }
        return row;
      }));
    }
    setEditingColumn(null);
    setEditingValue('');
  };

  const cancelEditingColumn = () => {
    setEditingColumn(null);
    setEditingValue('');
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-0">
      {/* Header */}
      <div className="text-center space-y-2 px-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase">Kanban</h1>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
          Advanced task management with visual workflow tracking
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-4 px-2">
        {/* Search */}
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 sm:h-10 text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 justify-end overflow-x-auto">
          <Button variant="outline" size="sm" className="flex-shrink-0 h-10 px-3" onClick={() => setShowFilters((p) => !p)}>
            <Filter className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-shrink-0 h-10 px-3" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button size="sm" className="flex-shrink-0 h-10 px-3" onClick={() => handleAddCard('row-1')}>
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Card</span>
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div className="px-2 text-xs sm:text-sm text-muted-foreground">
          {actionMessage}
        </div>
      )}

      {/* Filter Dialog */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Filter Cards
            </DialogTitle>
            <DialogDescription>
              Filter cards by priority and status to focus on what matters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                Priority Level
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-700 border-green-200' },
                  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200' },
                  { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-200' },
                ].map((p) => (
                  <button
                    key={p.value}
                    onClick={() => togglePriorityFilter(p.value)}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      filterPriorities.has(p.value)
                        ? `${p.color} ring-2 ring-offset-1 ring-primary/30`
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {filterPriorities.has(p.value) && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                Column Status
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'BACKLOG', label: 'Backlog', color: 'bg-gray-100 text-gray-700 border-gray-200' },
                  { value: 'TODO', label: 'To Do', color: 'bg-orange-100 text-orange-700 border-orange-200' },
                  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => toggleStatusFilter(s.value)}
                    className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                      filterStatuses.has(s.value)
                        ? `${s.color} ring-2 ring-offset-1 ring-primary/30`
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {filterStatuses.has(s.value) && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterPriorities(new Set());
                setFilterStatuses(new Set());
              }}
            >
              Clear All
            </Button>
            <Button onClick={() => setShowFilters(false)}>
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Card Dialog */}
      <Dialog open={showAddMenu} onOpenChange={(open) => {
        setShowAddMenu(open);
        if (!open) {
          setAddCardPage(1);
          setAddMenuQuery('');
        }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add Cards to Board
            </DialogTitle>
            <DialogDescription>
              {totalAddableCount} bookmark{totalAddableCount !== 1 ? 's' : ''} available to add to your Kanban board.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search your bookmarks..."
              value={addMenuQuery}
              onChange={(e) => setAddMenuQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* Stats bar */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-gray-50 rounded-lg px-3 py-2">
            <span>
              Showing {addableBookmarks.length > 0 ? ((addCardPage - 1) * ITEMS_PER_PAGE) + 1 : 0}-{Math.min(addCardPage * ITEMS_PER_PAGE, totalAddableCount)} of {totalAddableCount}
            </span>
            <span className="font-medium text-primary">{selectedAddIds.size} selected</span>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6" style={{ maxHeight: '400px' }}>
            {addableBookmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <LayoutGrid className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {addMenuQuery ? 'No bookmarks match your search' : 'No bookmarks available to add'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 py-2">
                {addableBookmarks.map((b, index) => (
                  <label
                    key={b.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedAddIds.has(b.id)
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Checkbox
                      checked={selectedAddIds.has(b.id)}
                      onCheckedChange={() => handleSelectAddCard(b)}
                      className="mt-0.5"
                    />
                    <span className="text-xs text-muted-foreground w-6 mt-1">
                      {((addCardPage - 1) * ITEMS_PER_PAGE) + index + 1}
                    </span>
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100 border flex-shrink-0">
                        <Image
                          src={b.favicon || '/favicon.svg'}
                          alt={b.title}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{b.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{b.description || b.url}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-3 border-t border-b">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddCardPage(1)}
                disabled={addCardPage === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddCardPage((p) => Math.max(1, p - 1))}
                disabled={addCardPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (addCardPage <= 3) {
                    pageNum = i + 1;
                  } else if (addCardPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = addCardPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setAddCardPage(pageNum)}
                      className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                        addCardPage === pageNum
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddCardPage((p) => Math.min(totalPages, p + 1))}
                disabled={addCardPage === totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddCardPage(totalPages)}
                disabled={addCardPage === totalPages}
              >
                Last
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedAddIds(new Set())}
                disabled={selectedAddIds.size === 0}
              >
                Clear Selection
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const allIds = new Set(allAddableBookmarks.map(b => b.id));
                  setSelectedAddIds(allIds);
                }}
              >
                Select All ({totalAddableCount})
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddMenu(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSelectedCards} disabled={selectedAddIds.size === 0}>
                Add {selectedAddIds.size > 0 ? `(${selectedAddIds.size})` : ''} to Board
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Board Settings
            </DialogTitle>
            <DialogDescription>
              Customize how your Kanban board looks and behaves.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                Card Display
              </Label>
              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="progress" className="text-sm text-gray-600 cursor-pointer">Show progress bar</Label>
                  <Switch
                    id="progress"
                    checked={showProgressBar}
                    onCheckedChange={setShowProgressBar}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="tags" className="text-sm text-gray-600 cursor-pointer">Show tags</Label>
                  <Switch
                    id="tags"
                    checked={showTags}
                    onCheckedChange={setShowTags}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="compact" className="text-sm text-gray-600 cursor-pointer">Compact cards</Label>
                  <Switch
                    id="compact"
                    checked={compactCards}
                    onCheckedChange={setCompactCards}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="labels" className="text-sm text-gray-600 cursor-pointer">Show card labels</Label>
                  <Switch
                    id="labels"
                    checked={showCardLabels}
                    onCheckedChange={setShowCardLabels}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                Board Behavior
              </Label>
              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="wip" className="text-sm text-gray-600 cursor-pointer">Show WIP limits</Label>
                  <Switch
                    id="wip"
                    checked={showWipLimit}
                    onCheckedChange={setShowWipLimit}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="autosort" className="text-sm text-gray-600 cursor-pointer">Auto-sort by priority</Label>
                  <Switch
                    id="autosort"
                    checked={autoSort}
                    onCheckedChange={setAutoSort}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setShowSettings(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bookmark Detail Modal */}
      {selectedBookmark && (
        <BookmarkDetailModal
          bookmark={selectedBookmark}
          open={!!selectedBookmark}
          onOpenChange={(open) => !open && setSelectedBookmark(null)}
          onUpdate={onUpdate}
        />
      )}

      {/* Rows Container */}
      <div className="space-y-4 sm:space-y-6">
        {rows.map((row, rowIndex) => (
          <div key={row.id} className="rounded-xl border bg-card text-card-foreground shadow p-2 sm:p-3 md:p-4 space-y-3 sm:space-y-4">
            {/* Row Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <button
                onClick={() => toggleRowExpansion(row.id)}
                className="flex items-center gap-2 hover:bg-muted/50 px-2 py-1 rounded touch-target"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform flex-shrink-0 ${
                    row.isExpanded ? '' : '-rotate-90'
                  }`}
                />
                <span className="font-medium text-sm sm:text-base truncate">{row.name} ({row.columns.length})</span>
              </button>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  {rowIndex === 0 ? totalCards : 0} cards
                </span>
                <Button variant="ghost" size="sm" className="flex-shrink-0" onClick={() => handleAddColumn(row.id)}>
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Column</span>
                </Button>
                <Button variant="outline" size="sm" className="flex-shrink-0" onClick={() => handleAddCard(row.id)}>
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Card</span>
                </Button>
              </div>
            </div>

            {/* Kanban Board */}
            {row.isExpanded && (
              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 pb-3 sm:pb-4">
                  {row.columns.map((column) => {
                    // Only show bookmarks in the first row (row-1), other rows are blank
                    const columnBookmarks = rowIndex === 0 ? (groupedBookmarks[column.id] || []) : [];

                    return (
                      <div
                        key={column.id}
                        className="min-w-0 space-y-3.5"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.id)}
                      >
                        {/* Column Header */}
                        <div className="flex items-start justify-between gap-2 relative">
                          <div className="flex items-start gap-2 min-w-0 flex-1">
                            <div className={`w-2 h-2 rounded-full ${column.statusDotColor} mt-1.5 flex-shrink-0`} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                {editingColumn?.rowId === row.id && editingColumn?.columnId === column.id ? (
                                  <Input
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    onBlur={() => saveColumnName(row.id, column.id)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        saveColumnName(row.id, column.id);
                                      } else if (e.key === 'Escape') {
                                        cancelEditingColumn();
                                      }
                                    }}
                                    className="h-6 w-32 text-xs sm:text-sm font-bold"
                                    autoFocus
                                  />
                                ) : (
                                  <h3
                                    className={`font-bold text-xs sm:text-sm ${column.statusColor} cursor-pointer hover:opacity-70 transition-opacity truncate`}
                                    onClick={() => startEditingColumn(row.id, column.id, column.name)}
                                    title="Click to edit"
                                  >
                                    {column.name}
                                  </h3>
                                )}
                                <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                                  {columnBookmarks.length}
                                </span>
                                {column.id === 'IN_PROGRESS' && (
                                  <div className="flex gap-1 flex-shrink-0">
                                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {column.description}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 -mt-1 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleColumnMenuClick(row.id, column.id);
                            }}
                          >
                            <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          {columnMenuId === `${row.id}:${column.id}` && (
                            <div
                              className="absolute right-0 top-full mt-1 z-50 w-52 rounded-lg border border-gray-200 bg-white shadow-xl py-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="px-3 py-1.5 border-b border-gray-100 mb-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Column Options</p>
                              </div>
                              <button
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => {
                                  setColumnMenuId(null);
                                  startEditingColumn(row.id, column.id, column.name);
                                }}
                              >
                                <Edit3 className="w-4 h-4 text-blue-500" />
                                <div>
                                  <div className="font-medium">Rename Column</div>
                                  <div className="text-xs text-gray-400">Change the column title</div>
                                </div>
                              </button>
                              <button
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => {
                                  setColumnMenuId(null);
                                  handleAddCard(row.id);
                                }}
                              >
                                <Plus className="w-4 h-4 text-green-500" />
                                <div>
                                  <div className="font-medium">Add Card</div>
                                  <div className="text-xs text-gray-400">Add bookmarks to this column</div>
                                </div>
                              </button>
                              <button
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => {
                                  setColumnMenuId(null);
                                  setActionMessage(`Sorting cards in ${column.name} by priority`);
                                }}
                              >
                                <ArrowUpDown className="w-4 h-4 text-purple-500" />
                                <div>
                                  <div className="font-medium">Sort Cards</div>
                                  <div className="text-xs text-gray-400">Order by priority</div>
                                </div>
                              </button>
                              <button
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => {
                                  setColumnMenuId(null);
                                  setActionMessage(`Copied ${columnBookmarks.length} cards from ${column.name}`);
                                }}
                              >
                                <Copy className="w-4 h-4 text-orange-500" />
                                <div>
                                  <div className="font-medium">Duplicate Column</div>
                                  <div className="text-xs text-gray-400">Copy column and cards</div>
                                </div>
                              </button>
                              <div className="my-2 border-t border-gray-100" />
                              <button
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                onClick={() => {
                                  setColumnMenuId(null);
                                  handleDeleteColumn(row.id, column.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                                <div>
                                  <div className="font-medium">Delete Column</div>
                                  <div className="text-xs text-red-400">Remove this column</div>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Cards Container */}
                        <div className="space-y-3 sm:space-y-3.5">
                          {columnBookmarks.length === 0 ? (
                            <div className="text-center py-8 sm:py-10 text-muted-foreground text-xs sm:text-sm">
                              No cards in {column.name.toLowerCase()}
                            </div>
                          ) : (
                            columnBookmarks.map((bookmark: any) => {
                              const priorityConfig = getPriorityConfig(bookmark.priority);
                              const accentOverride = accentColorOverrides[bookmark.id];
                              const accentClass = accentOverride ? 'border-l-4' : getCardAccentColor(bookmark.priority);
                              const accentStyle = accentOverride
                                ? { borderLeftColor: accentOverride, borderLeftWidth: '4px' }
                                : accentClass
                                  ? { borderLeftWidth: '4px' }
                                  : undefined;
                              const progress = Math.floor(Math.random() * 100); // Simulated progress
                              const tags = bookmark.tags?.slice(0, 2) || [];
                              const extraTagsCount = bookmark.tags?.length > 2 ? bookmark.tags.length - 2 : 0;

                              return (
                                <div
                                  key={bookmark.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, bookmark.id)}
                                  onDragEnd={() => setDraggingId(null)}
                                  onClick={() => handleOpenCard(bookmark)}
                                  className={`group relative bg-white border rounded-lg p-4 sm:p-4.5 hover:shadow-md transition-all cursor-pointer touch-target ${accentClass} ${
                                    draggingId === bookmark.id ? 'opacity-70 ring-2 ring-primary/40' : ''
                                  }`}
                                  style={accentStyle}
                                >
                                  {/* Card Header with Logo */}
                                  <div className="flex items-start gap-2 mb-3 sm:mb-3.5">
                                    {/* Favicon */}
                                    <div className="relative w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 rounded-md overflow-hidden bg-white border">
                                      <Image
                                        src={bookmark.favicon || '/favicon.svg'}
                                        alt={bookmark.title}
                                        fill
                                        className="object-contain p-0.5"
                                        unoptimized
                                      />
                                    </div>

                                    <h4 className="font-bold text-xs sm:text-sm pr-12 line-clamp-2 leading-relaxed flex-1">
                                      {bookmark.title.toUpperCase()}
                                    </h4>

                                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 sm:h-7 sm:w-7"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCardMenuClick(bookmark.id);
                                        }}
                                      >
                                        <MoreVertical className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 sm:h-7 sm:w-7 cursor-move"
                                        onMouseDown={(e) => e.stopPropagation()}
                                      >
                                        <GripVertical className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Card actions menu */}
                                  {cardMenuId === bookmark.id && (
                                    <div
                                      className="absolute z-30 top-9 right-2 sm:right-3 w-52 rounded-md border border-gray-200 bg-white shadow-lg py-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        onClick={() => {
                                          setCardMenuId(null);
                                          handleOpenCard(bookmark);
                                        }}
                                      >
                                        <Eye className="w-4 h-4 text-gray-500" />
                                        View Details
                                      </button>
                                      <button
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        onClick={() => {
                                          if (bookmark.url) window.open(bookmark.url, '_blank');
                                          setCardMenuId(null);
                                        }}
                                      >
                                        <ExternalLink className="w-4 h-4 text-gray-500" />
                                        Open Website
                                      </button>
                                      <button
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        onClick={() => {
                                          if (bookmark.url) navigator.clipboard.writeText(bookmark.url);
                                          setCardMenuId(null);
                                          setActionMessage('URL copied');
                                        }}
                                      >
                                        <Copy className="w-4 h-4 text-gray-500" />
                                        Copy URL
                                      </button>
                                      <div className="my-1 border-t border-gray-100" />
                                      <button
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        onClick={() => handleToggleFavorite(bookmark.id)}
                                      >
                                        <Heart className={`w-4 h-4 ${bookmark.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                                        {bookmark.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                                      </button>
                                      <div className="relative group/color">
                                        <button
                                          className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                          <span className="flex items-center gap-3">
                                            <Palette className="w-4 h-4 text-gray-500" />
                                            Change Color
                                          </span>
                                          <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
                                        </button>
                                        <div className="hidden group-hover/color:block absolute left-full top-0 ml-1 w-32 rounded-md border border-gray-200 bg-white shadow-lg py-1">
                                          <button
                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => handleAccentChange(bookmark.id, '')}
                                          >
                                            <div className="w-3 h-3 rounded-full bg-gray-300 border border-gray-400" />
                                            Default
                                          </button>
                                          <button
                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => handleAccentChange(bookmark.id, '#3B82F6')}
                                          >
                                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                                            Blue
                                          </button>
                                          <button
                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => handleAccentChange(bookmark.id, '#22C55E')}
                                          >
                                            <div className="w-3 h-3 rounded-full bg-green-500" />
                                            Green
                                          </button>
                                          <button
                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => handleAccentChange(bookmark.id, '#F97316')}
                                          >
                                            <div className="w-3 h-3 rounded-full bg-orange-500" />
                                            Orange
                                          </button>
                                          <button
                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => handleAccentChange(bookmark.id, '#EF4444')}
                                          >
                                            <div className="w-3 h-3 rounded-full bg-red-500" />
                                            Red
                                          </button>
                                          <button
                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => handleAccentChange(bookmark.id, '#A855F7')}
                                          >
                                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                                            Purple
                                          </button>
                                        </div>
                                      </div>
                                      <div className="my-1 border-t border-gray-100" />
                                      <button
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        onClick={() => {
                                          setCards((prev) => prev.filter((c) => c.id !== bookmark.id));
                                          setCardMenuId(null);
                                          setActionMessage('Card removed from board');
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Remove from Board
                                      </button>
                                    </div>
                                  )}

                                  {/* Description */}
                                  {!compactCards && (
                                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-3.5 line-clamp-2 leading-relaxed">
                                      {bookmark.description || `${bookmark.title} is a website that introduces innovative solutions...`}
                                    </p>
                                  )}

                                  {/* Tags */}
                                  {showTags && (
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-3.5">
                                      {tags.map((tag: any, idx: number) => (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 h-4 sm:h-5 bg-muted hover:bg-muted"
                                        >
                                          {tag.tag?.name || `tag${idx + 1}`}
                                        </Badge>
                                      ))}
                                      {extraTagsCount > 0 && (
                                        <Badge
                                          variant="secondary"
                                          className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 h-4 sm:h-5 bg-muted hover:bg-muted"
                                        >
                                          +{extraTagsCount}
                                        </Badge>
                                      )}
                                    </div>
                                  )}

                                  {/* Progress Bar */}
                                  {showProgressBar && (
                                    <div className="mb-2 sm:mb-3">
                                      <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground mb-1">
                                        <span>Progress</span>
                                        <span>{progress}%</span>
                                      </div>
                                      <div className="w-full bg-muted rounded-full h-1 sm:h-1.5">
                                        <div
                                          className="bg-primary h-1 sm:h-1.5 rounded-full transition-all"
                                          style={{ width: `${progress}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Footer */}
                                  <div className="flex items-center justify-between text-[10px] sm:text-xs">
                                    <div className="flex items-center gap-1">
                                      <div className={`w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full ${priorityConfig.dotColor}`} />
                                      <span className={priorityConfig.color}>{priorityConfig.text}</span>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        <span>{Math.floor(Math.random() * 5)}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Paperclip className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        <span>{Math.floor(Math.random() * 3)}</span>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleFavorite(bookmark.id);
                                        }}
                                        className="focus:outline-none"
                                      >
                                        <Star
                                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                                            bookmark.isFavorite
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'text-muted-foreground'
                                          }`}
                                        />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add Row Button */}
        <Button
          variant="outline"
          size="lg"
          onClick={handleAddRow}
          className="w-full border-dashed border-2 touch-target"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>
      </div>
    </div>
  );
}
