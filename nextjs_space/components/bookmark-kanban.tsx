'use client';

import { useState, useEffect, DragEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Eye
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
  const [accentColorOverrides, setAccentColorOverrides] = useState<Record<string, string>>({});
  const [selectedAddIds, setSelectedAddIds] = useState<Set<string>>(new Set());

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
    setActionMessage(`Column menu clicked for ${columnId} in ${rowId}`);
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
    if (bookmark.url) {
      window.open(bookmark.url, '_blank', 'noopener,noreferrer');
      return;
    }
    setActionMessage(`Open card: ${bookmark.title || bookmark.id}`);
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
  const addableBookmarks = bookmarks
    .filter((b) => !existingIds.has(b.id))
    .filter((b) => {
      const q = addMenuQuery.trim().toLowerCase();
      if (!q) return true;
      return `${b.title || ''} ${b.description || ''}`.toLowerCase().includes(q);
    })
    .slice(0, 12);

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

      {/* Overlays */}
      {showFilters && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowFilters(false)}>
          <div className="w-full max-w-md rounded-lg border bg-white p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Filters</div>
              <Button size="sm" variant="ghost" onClick={() => setShowFilters(false)}>Close</Button>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">Priority</div>
              <div className="flex flex-wrap gap-2">
                {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => (
                  <button
                    key={p}
                    onClick={() => togglePriorityFilter(p)}
                    className={`text-xs px-2 py-1 rounded border ${
                      filterPriorities.has(p) ? 'bg-primary text-white border-primary' : 'bg-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">Status</div>
              <div className="flex flex-wrap gap-2">
                {['BACKLOG', 'TODO', 'IN_PROGRESS'].map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleStatusFilter(s)}
                    className={`text-xs px-2 py-1 rounded border ${
                      filterStatuses.has(s) ? 'bg-primary text-white border-primary' : 'bg-white'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setShowFilters(false)}>Apply</Button>
            </div>
          </div>
        </div>
      )}

      {showAddMenu && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAddMenu(false)}>
          <div className="w-full max-w-2xl rounded-lg border bg-white p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold">Add bookmarked cards</div>
              <div className="text-xs text-muted-foreground">{selectedAddIds.size} selected</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowAddMenu(false)}>Cancel</Button>
                <Button size="sm" onClick={handleAddSelectedCards} disabled={selectedAddIds.size === 0}>Add</Button>
              </div>
            </div>
            <Input
              placeholder="Search bookmarks..."
              value={addMenuQuery}
              onChange={(e) => setAddMenuQuery(e.target.value)}
              className="h-9 text-sm"
            />
            <div className="max-h-[60vh] overflow-y-auto space-y-2">
              {addableBookmarks.length === 0 ? (
                <div className="text-xs text-muted-foreground px-1 py-2">No bookmarks available</div>
              ) : (
                addableBookmarks.map((b) => (
                  <label key={b.id} className="flex items-start gap-3 border rounded-md px-3 py-2 hover:bg-muted/50 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selectedAddIds.has(b.id)}
                      onChange={() => handleSelectAddCard(b)}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{b.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{b.description}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-md rounded-lg border bg-white p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Kanban Settings</div>
              <Button size="sm" variant="ghost" onClick={() => setShowSettings(false)}>Close</Button>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">Card Display</div>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`text-xs px-2 py-1 rounded border ${showProgressBar ? 'bg-primary text-white border-primary' : 'bg-white'}`}
                  onClick={() => toggleSetting(setShowProgressBar)}
                >
                  Show Progress
                </button>
                <button
                  className={`text-xs px-2 py-1 rounded border ${showTags ? 'bg-primary text-white border-primary' : 'bg-white'}`}
                  onClick={() => toggleSetting(setShowTags)}
                >
                  Show Tags
                </button>
                <button
                  className={`text-xs px-2 py-1 rounded border ${compactCards ? 'bg-primary text-white border-primary' : 'bg-white'}`}
                  onClick={() => toggleSetting(setCompactCards)}
                >
                  Compact Cards
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setShowSettings(false)}>Done</Button>
            </div>
          </div>
        </div>
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
                  <div className="flex items-start justify-between gap-2">
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
                                className="absolute z-20 top-9 right-2 sm:right-3 w-52 rounded-lg border bg-white shadow-lg p-3 space-y-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="text-xs font-semibold text-muted-foreground">Card Options</div>
                                <div className="space-y-2">
                                  <div className="text-[11px] text-muted-foreground">Accent color</div>
                                  <div className="grid grid-cols-3 gap-2">
                                    {presetAccentOptions.map((opt) => (
                                      <button
                                        key={opt.label}
                                        onClick={() => handleAccentChange(bookmark.id, opt.value)}
                                        className={`h-8 rounded border text-[11px] ${
                                          accentColorOverrides[bookmark.id] === opt.value
                                            ? 'border-primary bg-primary text-white'
                                            : 'border-muted bg-white'
                                        }`}
                                        style={opt.value ? { backgroundColor: opt.value } : {}}
                                      >
                                        {opt.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-xs"
                                    onClick={() => handleToggleFavorite(bookmark.id)}
                                  >
                                    {bookmark.isFavorite ? 'Unfavorite' : 'Favorite'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="flex-1 text-xs"
                                    onClick={() => setCardMenuId(null)}
                                  >
                                    Close
                                  </Button>
                                </div>
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
