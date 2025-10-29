'use client';

import { useState } from 'react';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Kanban 2.0</h1>
        <p className="text-muted-foreground">
          Advanced task management with visual workflow tracking
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </Button>
        </div>
      </div>

      {/* Rows Container */}
      <div className="space-y-6">
        {rows.map((row, rowIndex) => (
          <div key={row.id} className="rounded-xl border bg-card text-card-foreground shadow p-4 space-y-4">
            {/* Row Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => toggleRowExpansion(row.id)}
                className="flex items-center gap-2 hover:bg-muted/50 px-2 py-1 rounded"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    row.isExpanded ? '' : '-rotate-90'
                  }`}
                />
                <span className="font-medium">{row.name} ({row.columns.length} columns)</span>
              </button>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{totalCards} cards</span>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Column
                </Button>
              </div>
            </div>

            {/* Kanban Board */}
            {row.isExpanded && (
              <div className="flex gap-6 overflow-x-auto pb-4">
                {row.columns.map((column) => {
              const columnBookmarks = groupedBookmarks[column.id] || [];
              
              return (
                <div key={column.id} className="flex-shrink-0 w-[340px] space-y-3">
                  {/* Column Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full ${column.statusDotColor} mt-1.5`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold text-sm ${column.statusColor}`}>
                            {column.name}
                          </h3>
                          <span className="text-sm text-muted-foreground">
                            {columnBookmarks.length}
                          </span>
                          {column.id === 'IN_PROGRESS' && (
                            <div className="flex gap-1">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {column.description}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Cards Container */}
                  <div className="space-y-3">
                    {columnBookmarks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No cards in {column.name.toLowerCase()}
                      </div>
                    ) : (
                      columnBookmarks.map((bookmark: any) => {
                        const priorityConfig = getPriorityConfig(bookmark.priority);
                        const accentColor = getCardAccentColor(bookmark.priority);
                        const progress = Math.floor(Math.random() * 100); // Simulated progress
                        const tags = bookmark.tags?.slice(0, 3) || [];
                        const extraTagsCount = bookmark.tags?.length > 3 ? bookmark.tags.length - 3 : 0;

                        return (
                          <div
                            key={bookmark.id}
                            className={`group relative bg-white border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${accentColor} ${
                              accentColor ? 'border-l-4' : ''
                            }`}
                          >
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-bold text-sm pr-8 line-clamp-1">
                                {bookmark.title.toUpperCase()}
                              </h4>
                              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 cursor-move">
                                  <GripVertical className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                              {bookmark.description || `${bookmark.title} is a website that introduces innovative solutions...`}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {tags.map((tag: any, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs px-2 py-0 h-5 bg-muted hover:bg-muted"
                                >
                                  {tag.tag?.name || `tag${idx + 1}`}
                                </Badge>
                              ))}
                              {extraTagsCount > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs px-2 py-0 h-5 bg-muted hover:bg-muted"
                                >
                                  +{extraTagsCount}
                                </Badge>
                              )}
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div
                                  className="bg-primary h-1.5 rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dotColor}`} />
                                <span className={priorityConfig.color}>{priorityConfig.text}</span>
                              </div>
                              <div className="flex items-center gap-3 text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  <span>{Math.floor(Math.random() * 5)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Paperclip className="w-3 h-3" />
                                  <span>{Math.floor(Math.random() * 3)}</span>
                                </div>
                                <Star
                                  className={`w-3 h-3 ${
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
        )}
      </div>
        ))}

        {/* Add Row Button */}
        <Button 
          variant="outline" 
          size="lg" 
          onClick={handleAddRow}
          className="w-full border-dashed border-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>
      </div>
    </div>
  );
}
