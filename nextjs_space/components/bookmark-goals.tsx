'use client';

import { useState, useEffect } from 'react';
import { Folder, Target, ChevronLeft, Plus, MoreVertical, Edit, Trash2, Type, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { CreateGoalFolderModal } from './create-goal-folder-modal';
import { GoalModal } from './goal-modal';
import { toast } from 'sonner';

interface GoalFolder {
  id: string;
  name: string;
  description?: string;
  color: string;
  goals: Goal[];
}

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
    bookmark: any;
  }>;
}

interface BookmarkGoalsProps {
  bookmarks: any[];
  onUpdate: () => void;
}

export function BookmarkGoals({ bookmarks, onUpdate }: BookmarkGoalsProps) {
  const [folders, setFolders] = useState<GoalFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<GoalFolder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Name editing state
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  // Color picker state
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);
  const [tempColor, setTempColor] = useState('#3B82F6');
  const [folderColors, setFolderColors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/goal-folders');
      if (response.ok) {
        const data = await response.json();
        setFolders(data);
      }
    } catch (error) {
      console.error('Error fetching goal folders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder? Goals inside will become unassigned.')) {
      return;
    }

    try {
      const response = await fetch(`/api/goal-folders/${folderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete folder');
      }

      toast.success('Folder deleted successfully');
      fetchFolders();
      if (selectedFolder?.id === folderId) {
        setSelectedFolder(null);
      }
    } catch (error) {
      toast.error('Failed to delete folder');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }

      toast.success('Goal deleted successfully');
      fetchFolders();
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const handleCreateGoalInFolder = (folder: GoalFolder) => {
    // Pre-select the folder in the goal modal
    setShowGoalModal(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowGoalModal(true);
  };

  const handleGoalModalClose = () => {
    setShowGoalModal(false);
    setEditingGoal(undefined);
  };

  // Name editing handlers
  const handleEditName = (folder: GoalFolder) => {
    setEditingFolderId(folder.id);
    setEditedName(folder.name);
  };

  const handleSaveName = async (folderId: string) => {
    if (!editedName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }

    try {
      const response = await fetch(`/api/goal-folders/${folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedName.trim() }),
      });

      if (!response.ok) throw new Error('Failed to update folder name');

      toast.success('Folder name updated');
      setEditingFolderId(null);
      fetchFolders();
    } catch (error) {
      toast.error('Failed to update folder name');
    }
  };

  const handleCancelEdit = () => {
    setEditingFolderId(null);
    setEditedName('');
  };

  // Color picker handlers
  const handleOpenColorPicker = (folder: GoalFolder) => {
    setColorPickerOpen(folder.id);
    setTempColor(folder.color || '#3B82F6');
  };

  const handleSaveColor = async (folderId: string) => {
    try {
      const response = await fetch(`/api/goal-folders/${folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color: tempColor }),
      });

      if (!response.ok) throw new Error('Failed to update folder color');

      // Update local state for immediate UI feedback
      setFolderColors(prev => ({ ...prev, [folderId]: tempColor }));
      
      toast.success('Folder color updated');
      setColorPickerOpen(null);
      fetchFolders();
    } catch (error) {
      toast.error('Failed to update folder color');
    }
  };

  const handleCancelColorPicker = () => {
    setColorPickerOpen(null);
  };

  const getStatusLabel = (status: string) => {
    return status.toLowerCase().replace('_', ' ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Loading goals...</div>
      </div>
    );
  }

  // Main folders view
  if (!selectedFolder) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Goal 2.0</h2>
          <p className="text-gray-600 text-sm">
            Advanced goal management with folders, deadline tracking and progress monitoring
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <Input
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* All Folders Tab */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-gray-600" />
            <span className="font-medium">All Folders</span>
            <Badge variant="secondary">{folders.length} folders</Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateFolderModal(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Folder
            </Button>
            <Button
              onClick={() => setShowGoalModal(true)}
              className="bg-black hover:bg-gray-800 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Goal
            </Button>
          </div>
        </div>

        {/* Goal Folders */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Goal Folders</h3>
          {folders.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Folder className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 mb-4">No goal folders yet</p>
              <Button onClick={() => setShowCreateFolderModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Folder
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="relative bg-white border border-black rounded-lg p-6 hover:shadow-md hover:border-gray-900 transition cursor-pointer group"
                  onClick={() => setSelectedFolder(folder)}
                >
                  {/* Three Dot Menu */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditName(folder);
                          }}
                          className="cursor-pointer"
                        >
                          <Type className="mr-2 h-4 w-4" />
                          Edit Folder Name
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenColorPicker(folder);
                          }}
                          className="cursor-pointer"
                        >
                          <Palette className="mr-2 h-4 w-4" />
                          Change Colors
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateGoalInFolder(folder);
                          }}
                          className="cursor-pointer"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Goal
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id);
                          }}
                          className="text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Folder
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Folder Icon */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: folderColors[folder.id] || folder.color }}
                  >
                    <Folder className="w-6 h-6 text-white" />
                  </div>

                  {/* Folder Name - Editable */}
                  {editingFolderId === folder.id ? (
                    <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName(folder.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="mb-2"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveName(folder.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <h4 className="font-semibold text-lg mb-1 uppercase">{folder.name}</h4>
                  )}

                  {/* Goals Count */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="w-4 h-4" />
                    <span>{folder.goals.length} {folder.goals.length === 1 ? 'goal' : 'goals'}</span>
                  </div>

                  {/* Color Picker Panel */}
                  {colorPickerOpen === folder.id && (
                    <div
                      className="absolute top-0 left-0 right-0 bottom-0 bg-white border-2 border-black rounded-lg p-4 z-50 shadow-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <h5 className="font-semibold text-sm mb-3">Choose Folder Color</h5>
                      
                      {/* Color Options Grid */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {[
                          '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
                          '#F59E0B', '#10B981', '#14B8A6', '#6366F1',
                          '#F97316', '#06B6D4', '#84CC16', '#A855F7',
                          '#1F2937', '#475569', '#64748B', '#94A3B8'
                        ].map((color) => (
                          <button
                            key={color}
                            className={`w-full h-10 rounded-md border-2 transition-all ${
                              tempColor === color ? 'border-black scale-110' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setTempColor(color);
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                          />
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleSaveColor(folder.id);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          className="flex-1"
                        >
                          Save Color
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleCancelColorPicker();
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        <CreateGoalFolderModal
          open={showCreateFolderModal}
          onClose={() => setShowCreateFolderModal(false)}
          onSuccess={fetchFolders}
        />
        <GoalModal
          open={showGoalModal}
          onClose={handleGoalModalClose}
          onSuccess={fetchFolders}
          goal={editingGoal}
          folders={folders}
        />
      </div>
    );
  }

  // Folder detail view
  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setSelectedFolder(null)}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Folders
          </Button>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ backgroundColor: selectedFolder.color }}
            >
              <Folder className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">{selectedFolder.name}</span>
            <Badge variant="secondary">
              {selectedFolder.goals.length} {selectedFolder.goals.length === 1 ? 'goal' : 'goals'}
            </Badge>
          </div>
        </div>
        <Button
          onClick={() => setShowGoalModal(true)}
          className="bg-black hover:bg-gray-800 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Goal
        </Button>
      </div>

      {/* Goals in Folder */}
      {selectedFolder.goals.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Target className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 mb-4">No goals in this folder yet</p>
          <Button onClick={() => setShowGoalModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedFolder.goals.map((goal) => (
            <div
              key={goal.id}
              className="border rounded-lg p-6 hover:shadow-md transition group"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: goal.color }}
                >
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-lg truncate">{goal.title}</h4>
                  <p className="text-sm text-gray-600">{goal.goalType}</p>
                </div>
                {/* Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEditGoal(goal)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteGoal(goal.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-600">Progress</span>
                  <span className="text-xs font-semibold">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${goal.progress}%`,
                      backgroundColor: goal.color,
                    }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Deadline</span>
                  <span className="font-medium">
                    {goal.deadline
                      ? new Date(goal.deadline).toLocaleDateString()
                      : 'No deadline'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority</span>
                  <span className="font-medium capitalize">{goal.priority.toLowerCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium capitalize">{getStatusLabel(goal.status)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bookmarks</span>
                  <span className="font-medium">{goal.bookmarks.length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <GoalModal
        open={showGoalModal}
        onClose={handleGoalModalClose}
        onSuccess={fetchFolders}
        goal={editingGoal}
        folders={folders}
      />
    </div>
  );
}
