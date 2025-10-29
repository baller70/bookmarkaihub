'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, Plus, Search } from 'lucide-react';
import { CreateGoalFolderModal } from '@/components/create-goal-folder-modal';
import { CreateGoalModal } from '@/components/create-goal-modal';
import { Badge } from '@/components/ui/badge';

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
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-blue-500" />
          <span className="font-semibold">All Folders</span>
          <Badge variant="secondary">{folders.length} folders</Badge>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <Folder
                  className="w-8 h-8 mt-1 flex-shrink-0"
                  style={{ color: folder.color }}
                  fill={folder.color}
                  fillOpacity={0.1}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{folder.name}</h3>
                  {folder.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {folder.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {folder.goals.length} goals
                    </Badge>
                  </div>
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
