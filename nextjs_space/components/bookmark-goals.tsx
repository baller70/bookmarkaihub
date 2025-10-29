'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, Plus, Search, FileText } from 'lucide-react';
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-950"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Blue rounded square icon with folder */}
                <div className="w-20 h-20 rounded-xl bg-blue-500 flex items-center justify-center">
                  <Folder className="w-10 h-10 text-white" />
                </div>
                
                {/* Folder Name */}
                <h3 className="font-bold text-lg break-words w-full">
                  {folder.name}
                </h3>
                
                {/* Goal Count */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{folder.goals.length} goal{folder.goals.length !== 1 ? 's' : ''}</span>
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
