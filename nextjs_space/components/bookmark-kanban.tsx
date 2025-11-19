'use client';

import { useState, useEffect } from 'react';
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
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [rows, setRows] = useState<KanbanRow[]>([
    {
      id: 'row-1',
      name: 'Row 1',
      isExpanded: true,
      columns: [...defaultColumns],
    },
  ]);
  const [editingColumn, setEditingColumn] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Fetch custom logo on mount
  useEffect(() => {
    const fetchCustomLogo = async () => {
      try {
        const response = await fetch('/api/user/custom-logo');
        if (response.ok) {
          const data = await response.json();
          if (data.customLogoUrl) {
            setCustomLogoUrl(data.customLogoUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching custom logo:', error);
      }
    };

    fetchCustomLogo();
  }, []);

  // Group bookmarks by column
  const groupedBookmarks = bookmarks.reduce((groups: any, bookmark: any) => {
    let status = 'BACKLOG';
    if (bookmark.priority === 'HIGH' || bookmark.priority === 'URGENT') {
      status = 'TODO';
    } else if (bookmark.visitCount > 5) {
      status = 'IN_PROGRESS';
    }
    
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
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Kanban 2.0</h1>
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
          <Button variant="outline" size="sm" className="flex-shrink-0 h-10 px-3">
            <Filter className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-shrink-0 h-10 px-3">
            <Settings className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button size="sm" className="flex-shrink-0 h-10 px-3">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Card</span>
          </Button>
        </div>
      </div>

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
                <Button variant="ghost" size="sm" className="flex-shrink-0">
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Column</span>
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
                <div key={column.id} className="min-w-0 space-y-3.5">
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
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {column.description}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 flex-shrink-0">
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
                        const accentColor = getCardAccentColor(bookmark.priority);
                        const progress = Math.floor(Math.random() * 100); // Simulated progress
                        const tags = bookmark.tags?.slice(0, 2) || [];
                        const extraTagsCount = bookmark.tags?.length > 2 ? bookmark.tags.length - 2 : 0;

                        return (
                          <div
                            key={bookmark.id}
                            className={`group relative bg-white border rounded-lg p-4 sm:p-4.5 hover:shadow-md transition-all cursor-pointer touch-target ${accentColor} ${
                              accentColor ? 'border-l-4' : ''
                            }`}
                          >
                            {/* Card Header with Logo */}
                            <div className="flex items-start gap-2 mb-3 sm:mb-3.5">
                              {/* Custom Logo/Favicon */}
                              <div className={`relative w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 rounded-md overflow-hidden ${customLogoUrl ? '' : 'bg-white border'}`}>
                                <Image
                                  src={customLogoUrl || bookmark.favicon || '/favicon.svg'}
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
                                <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7">
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 cursor-move">
                                  <GripVertical className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-3.5 line-clamp-2 leading-relaxed">
                              {bookmark.description || `${bookmark.title} is a website that introduces innovative solutions...`}
                            </p>

                            {/* Tags */}
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

                            {/* Progress Bar */}
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
                                <Star
                                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                                    bookmark.isFavorite
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted-foreground'
                                  }`}
                                />
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
