
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Target, TrendingUp, Plus, X, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Goal {
  id: string;
  title: string;
  description?: string;
  goalType: string;
  color: string;
  priority: string;
  status: string;
  deadline?: string;
  progress: number;
  tags: string[];
  notes?: string;
  folderId?: string;
  folder?: { id: string; name: string; color: string };
  bookmarks: Array<{
    bookmarkId: string;
    bookmark: {
      id: string;
      title: string;
      url: string;
      categories: Array<{
        category: { name: string };
      }>;
    };
  }>;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  categories: Array<{
    category: { name: string };
  }>;
}

interface GoalFolder {
  id: string;
  name: string;
  color: string;
}

interface GoalModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal?: Goal;
  folders: GoalFolder[];
  selectedFolderId?: string;
}

const GOAL_TYPES = [
  'Custom',
  'Learning',
  'Project',
  'Health',
  'Career',
  'Financial',
  'Personal',
  'Academic',
];

export function GoalModal({ open, onClose, onSuccess, goal, folders, selectedFolderId }: GoalModalProps) {
  const isEditing = !!goal;

  // Basic Info State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState('Custom');
  const [color, setColor] = useState('#3b82f6');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('NOT_STARTED');
  const [deadline, setDeadline] = useState('');
  const [progress, setProgress] = useState(0);
  const [folderId, setFolderId] = useState(selectedFolderId || '');

  // Advanced Settings State
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [newTag, setNewTag] = useState('');

  // Connected Bookmarks State
  const [allBookmarks, setAllBookmarks] = useState<Bookmark[]>([]);
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<string[]>([]);
  const [bookmarkSearch, setBookmarkSearch] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Load existing data when editing OR set selectedFolderId when creating
  useEffect(() => {
    if (goal) {
      // Editing existing goal
      setTitle(goal.title);
      setDescription(goal.description || '');
      setGoalType(goal.goalType);
      setColor(goal.color);
      setPriority(goal.priority);
      setStatus(goal.status);
      setDeadline(goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '');
      setProgress(goal.progress);
      setFolderId(goal.folderId || '');
      setTags(goal.tags || []);
      setNotes(goal.notes || '');
      setSelectedBookmarkIds(goal.bookmarks.map((b) => b.bookmarkId));
    } else if (open && selectedFolderId) {
      // Creating new goal in a specific folder
      setFolderId(selectedFolderId);
    } else if (open && !selectedFolderId) {
      // Creating new goal without a selected folder
      setFolderId('');
    }
  }, [goal, open, selectedFolderId]);

  // Fetch all bookmarks for connection
  useEffect(() => {
    if (open) {
      fetchBookmarks();
    }
  }, [open]);

  const fetchBookmarks = async () => {
    try {
      const response = await fetch('/api/bookmarks');
      if (response.ok) {
        const data = await response.json();
        setAllBookmarks(data.bookmarks || data);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const toggleBookmark = (bookmarkId: string) => {
    if (selectedBookmarkIds.includes(bookmarkId)) {
      setSelectedBookmarkIds(selectedBookmarkIds.filter((id) => id !== bookmarkId));
    } else {
      setSelectedBookmarkIds([...selectedBookmarkIds, bookmarkId]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a goal name');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        goalType,
        color,
        priority,
        status,
        deadline: deadline || null,
        progress,
        tags,
        notes: notes.trim() || null,
        folderId: folderId || null,
        bookmarkIds: selectedBookmarkIds,
      };

      const url = isEditing ? `/api/goals/${goal.id}` : '/api/goals';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'create'} goal`);
      }

      toast.success(`Goal ${isEditing ? 'updated' : 'created'} successfully`);
      handleClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} goal`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isEditing) {
      setTitle('');
      setDescription('');
      setGoalType('Custom');
      setColor('#3b82f6');
      setPriority('MEDIUM');
      setStatus('NOT_STARTED');
      setDeadline('');
      setProgress(0);
      setFolderId('');
      setTags([]);
      setNotes('');
      setSelectedBookmarkIds([]);
    }
    setActiveTab('basic');
    onClose();
  };

  const filteredBookmarks = allBookmarks.filter((bookmark) => {
    const searchLower = bookmarkSearch.toLowerCase();
    return (
      bookmark.title.toLowerCase().includes(searchLower) ||
      bookmark.url.toLowerCase().includes(searchLower) ||
      bookmark.categories.some((c) =>
        c.category.name.toLowerCase().includes(searchLower)
      )
    );
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'bg-gray-700';
      case 'IN_PROGRESS':
      case 'ACTIVE':
        return 'bg-blue-600';
      case 'COMPLETED':
        return 'bg-green-600';
      case 'PAUSED':
        return 'bg-yellow-600';
      case 'CANCELLED':
        return 'bg-red-600';
      default:
        return 'bg-gray-700';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-gray-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'HIGH':
        return 'bg-orange-500';
      case 'URGENT':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Target className="w-5 h-5" />
            {isEditing ? 'Edit Goal' : 'Create New Goal'}
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            {isEditing
              ? 'Update your goal settings and connected bookmarks'
              : 'Create a new goal with deadlines, progress tracking, and bookmark connections'}
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="bookmarks">Connected Bookmarks</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Goal Name */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Goal Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter goal name..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Goal Color */}
              <div>
                <label className="block text-sm font-medium mb-2">Goal Color</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-16 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Folder */}
              <div>
                <label className="block text-sm font-medium mb-2">Folder (Optional)</label>
                <Select value={folderId || "no-folder"} onValueChange={(value) => setFolderId(value === "no-folder" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="No folder (unassigned)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-folder">No folder (unassigned)</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="Describe your goal..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Goal Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Goal Type</label>
                <Select value={goalType} onValueChange={setGoalType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PAUSED">Paused</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium mb-2">Deadline</label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            {/* Progress */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Progress ({progress}%)
              </label>
              <Slider
                value={[progress]}
                onValueChange={(value) => setProgress(value[0])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </TabsContent>

          {/* Connected Bookmarks Tab */}
          <TabsContent value="bookmarks" className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Connect Bookmarks</label>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by title, URL, or category..."
                  value={bookmarkSearch}
                  onChange={(e) => setBookmarkSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="border rounded-lg max-h-96 overflow-y-auto">
                {filteredBookmarks.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {bookmarkSearch ? 'No bookmarks found' : 'No bookmarks available'}
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredBookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        className="p-4 flex items-start gap-3 hover:bg-gray-50 transition"
                      >
                        <Checkbox
                          checked={selectedBookmarkIds.includes(bookmark.id)}
                          onCheckedChange={() => toggleBookmark(bookmark.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {bookmark.title}
                          </div>
                          <div className="text-xs text-gray-500 truncate mt-1">
                            {bookmark.url}
                          </div>
                          {bookmark.categories.length > 0 && (
                            <div className="text-xs text-gray-400 mt-1">
                              Category: {bookmark.categories[0].category.name}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Advanced Settings Tab */}
          <TabsContent value="advanced" className="space-y-4 mt-4">
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button onClick={handleAddTag} size="sm" type="button">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <Textarea
                placeholder="Additional notes, reminders, or details about this goal..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            {/* Goal Summary */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">Goal Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Status:</span>{' '}
                  <Badge className={`${getStatusBadgeColor(status)} text-white ml-2`}>
                    {status.toLowerCase().replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Priority:</span>{' '}
                  <Badge className={`${getPriorityBadgeColor(priority)} text-white ml-2`}>
                    {priority.toLowerCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Progress:</span>{' '}
                  <span className="font-medium">{progress}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Bookmarks:</span>{' '}
                  <span className="font-medium">{selectedBookmarkIds.length}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
            className="bg-gray-900 hover:bg-gray-800"
          >
            {isSubmitting
              ? isEditing
                ? 'Updating...'
                : 'Creating...'
              : isEditing
              ? 'Update Goal'
              : 'Create Goal'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
