'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, Plus, Search, FileText, ArrowLeft, Target, Edit2, Trash2 } from 'lucide-react';
import { CreateGoalFolderModal } from '@/components/create-goal-folder-modal';
import { CreateGoalModal } from '@/components/create-goal-modal';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface GoalFolder {
  id: string;
  name: string;
  description?: string;
  color: string;
  goals: Goal[];
  createdAt: string;
  updatedAt: string;
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
  bookmarks: Array<{
    id: string;
    bookmark: {
      id: string;
      title: string;
      url: string;
    };
  }>;
}

export function BookmarkGoals() {
  const [folders, setFolders] = useState<GoalFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<GoalFolder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
        
        // If a folder is selected, refresh its data
        if (selectedFolder) {
          const updatedFolder = data.find((f: GoalFolder) => f.id === selectedFolder.id);
          if (updatedFolder) {
            setSelectedFolder(updatedFolder);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching goal folders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderCreated = () => {
    fetchFolders();
  };

  const handleGoalCreated = () => {
    fetchFolders();
  };

  const handleFolderClick = (folder: GoalFolder) => {
    setSelectedFolder(folder);
  };

  const handleBackToFolders = () => {
    setSelectedFolder(null);
  };

  const handleEditGoal = (goal: Goal) => {
    // TODO: Implement edit goal modal
    toast.info('Edit goal functionality coming soon!');
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Goal deleted successfully');
        fetchFolders();
      } else {
        toast.error('Failed to delete goal');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  // If a folder is selected, show the folder detail view
  if (selectedFolder) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Goal 2.0</h1>
          <p className="text-muted-foreground">
            Advanced goal management with folders, deadline tracking and progress monitoring
          </p>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleBackToFolders}
              className="gap-2 hover:bg-gray-100 px-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Folders
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <Folder className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">{selectedFolder.name}</span>
              <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white">
                {selectedFolder.goals.length} goals
              </Badge>
            </div>
          </div>
          <Button onClick={() => setIsCreateGoalModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Goal
          </Button>
        </div>

        {/* Goals List */}
        {selectedFolder.goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Target className="w-16 h-16 text-muted-foreground" strokeWidth={1.5} />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">No goals in this folder</h3>
              <p className="text-sm text-muted-foreground">
                Create your first goal to get started
              </p>
            </div>
            <Button onClick={() => setIsCreateGoalModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedFolder.goals.map((goal) => (
              <div
                key={goal.id}
                className="border rounded-lg p-6 bg-white dark:bg-gray-950 space-y-4"
              >
                {/* Goal Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: goal.color }}
                    >
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg">{goal.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditGoal(goal)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        backgroundColor: goal.color,
                        width: `${goal.progress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Goal Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Deadline</span>
                    <span className="font-medium">
                      {goal.deadline
                        ? new Date(goal.deadline).toLocaleDateString()
                        : 'No deadline'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Priority</span>
                    <span className="font-medium capitalize">{goal.priority.toLowerCase()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium">
                      {goal.status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Bookmarks</span>
                    <span className="font-medium">{goal.bookmarks.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        <CreateGoalModal
          isOpen={isCreateGoalModalOpen}
          onClose={() => setIsCreateGoalModalOpen(false)}
          onGoalCreated={handleGoalCreated}
        />
        {/* Note: Edit functionality uses a browser alert for now */}
      </div>
    );
  }

  // Default view: Show all folders
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Goal 2.0</h1>
        <p className="text-muted-foreground">
          Advanced goal management with folders, deadline tracking and progress monitoring
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Folder className="w-6 h-6 text-blue-500" />
          <span className="text-xl font-bold">All Folders</span>
          <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white">
            {folders.length} folders
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsCreateFolderModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Folder
          </Button>
          <Button onClick={() => setIsCreateGoalModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Goal
          </Button>
        </div>
      </div>

      {/* Goal Folders Section */}
      {!isLoading && folders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Goal Folders</h2>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading folders...</p>
          </div>
        </div>
      ) : folders.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Folder className="w-16 h-16 text-muted-foreground" strokeWidth={1.5} />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">No goal folders yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your first folder to organize your goals
            </p>
          </div>
          <Button onClick={() => setIsCreateFolderModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Folder
          </Button>
        </div>
      ) : (
        /* Folders Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => handleFolderClick(folder)}
              className="border rounded-2xl p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-950 cursor-pointer"
            >
              <div className="space-y-4">
                {/* Blue rounded square icon with folder - Top Left */}
                <div className="w-16 h-16 rounded-xl bg-blue-500 flex items-center justify-center">
                  <Folder className="w-8 h-8 text-white" />
                </div>
                
                {/* Folder Name - Left Aligned */}
                <h3 className="font-bold text-lg break-words">
                  {folder.name}
                </h3>
                
                {/* Goal Count - Left Aligned */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{folder.goals.length} goal{folder.goals.length === 1 ? '' : 's'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateGoalFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onFolderCreated={handleFolderCreated}
      />
      <CreateGoalModal
        isOpen={isCreateGoalModalOpen}
        onClose={() => setIsCreateGoalModalOpen(false)}
        onGoalCreated={handleGoalCreated}
      />
    </div>
  );
}
