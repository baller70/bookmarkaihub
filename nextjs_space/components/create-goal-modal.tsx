'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Target, TrendingUp, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isFavorite: boolean;
  categories?: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
}

interface GoalFolder {
  id: string;
  name: string;
}

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: () => void;
}

export function CreateGoalModal({
  isOpen,
  onClose,
  onGoalCreated,
}: CreateGoalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState('Custom');
  const [color, setColor] = useState('#3b82f6');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('NOT_STARTED');
  const [deadline, setDeadline] = useState('');
  const [folderId, setFolderId] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<GoalFolder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBookmarks();
      fetchFolders();
    }
  }, [isOpen]);

  const fetchBookmarks = async () => {
    try {
      const response = await fetch('/api/bookmarks');
      if (response.ok) {
        const data = await response.json();
        setBookmarks(data);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/goal-folders');
      if (response.ok) {
        const data = await response.json();
        setFolders(data);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const query = searchQuery.toLowerCase();
    return (
      bookmark.title.toLowerCase().includes(query) ||
      bookmark.url.toLowerCase().includes(query) ||
      bookmark.categories?.some((c) =>
        c.category.name.toLowerCase().includes(query)
      )
    );
  });

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleToggleBookmark = (bookmarkId: string) => {
    setSelectedBookmarks((prev) =>
      prev.includes(bookmarkId)
        ? prev.filter((id) => id !== bookmarkId)
        : [...prev, bookmarkId]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a goal title');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          goalType,
          color,
          priority,
          status,
          deadline: deadline || null,
          folderId: folderId || null,
          progress,
          tags,
          notes: notes.trim() || null,
          bookmarkIds: selectedBookmarks,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create goal');
      }

      toast.success('Goal created successfully');
      resetForm();
      onGoalCreated();
      onClose();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setGoalType('Custom');
    setColor('#3b82f6');
    setPriority('MEDIUM');
    setStatus('NOT_STARTED');
    setDeadline('');
    setFolderId('');
    setProgress(0);
    setTags([]);
    setNewTag('');
    setNotes('');
    setSelectedBookmarks([]);
    setSearchQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Create New Goal
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Create a new goal with deadlines, progress tracking, and bookmark connections
          </p>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="bookmarks">Connected Bookmarks</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          </TabsList>

          {/* Tab 1: Basic Info */}
          <TabsContent value="basic" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Goal Name */}
              <div className="space-y-2">
                <Label htmlFor="goal-title">
                  Goal Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="goal-title"
                  placeholder="Enter goal name..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Goal Color */}
              <div className="space-y-2">
                <Label htmlFor="goal-color">Goal Color</Label>
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded border"
                    style={{ backgroundColor: color }}
                  />
                  <Input
                    id="goal-color"
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="goal-description">Description</Label>
              <Textarea
                id="goal-description"
                placeholder="Describe your goal..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Folder (Optional) */}
            <div className="space-y-2">
              <Label>Folder (Optional)</Label>
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

            <div className="grid grid-cols-2 gap-4">
              {/* Goal Type */}
              <div className="space-y-2">
                <Label>Goal Type</Label>
                <Select value={goalType} onValueChange={setGoalType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Custom">Custom...</SelectItem>
                    <SelectItem value="Learning">Learning</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Career">Career</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PAUSED">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label htmlFor="goal-deadline">Deadline</Label>
                <Input
                  id="goal-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            {/* Progress Slider */}
            <div className="space-y-2">
              <Label>Progress ({progress}%)</Label>
              <Slider
                value={[progress]}
                onValueChange={(value) => setProgress(value[0])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </TabsContent>

          {/* Tab 2: Connected Bookmarks */}
          <TabsContent value="bookmarks" className="py-4">
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold">Connect Bookmarks</Label>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <Label>Search Bookmarks</Label>
                <Input
                  placeholder="Search by title, URL, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Bookmarks List */}
              <div className="max-h-[400px] overflow-y-auto space-y-2 border rounded-lg p-4">
                {filteredBookmarks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No bookmarks found
                  </p>
                ) : (
                  filteredBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="flex items-start gap-3 p-2 hover:bg-muted rounded-lg"
                    >
                      <Checkbox
                        checked={selectedBookmarks.includes(bookmark.id)}
                        onCheckedChange={() => handleToggleBookmark(bookmark.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {bookmark.title}
                            {bookmark.isFavorite && <span className="ml-1">⭐</span>}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{bookmark.url}</p>
                        {bookmark.categories && bookmark.categories.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {bookmark.categories.map((cat) => (
                              <Badge key={cat.category.id} variant="secondary" className="text-xs">
                                {cat.category.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Advanced Settings */}
          <TabsContent value="advanced" className="space-y-4 py-4">
            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
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
                <Button type="button" size="icon" onClick={handleAddTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="goal-notes">Notes</Label>
              <Textarea
                id="goal-notes"
                placeholder="Additional notes, reminders, or details about this goal..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            {/* Goal Summary */}
            <div className="border rounded-lg p-4 space-y-3">
              <Label className="flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4" />
                Goal Summary
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className="ml-2" variant="secondary">
                    {status.replace('_', ' ').toLowerCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Priority:</span>
                  <Badge className="ml-2" variant="secondary">
                    {priority.toLowerCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Progress:</span>
                  <span className="ml-2 font-semibold">{progress}%</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Bookmarks:</span>
                  <span className="ml-2 font-semibold">{selectedBookmarks.length}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            Create Goal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
