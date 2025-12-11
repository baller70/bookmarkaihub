'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  Trophy, ChevronLeft, Plus, MoreVertical, Edit, Trash2, 
  Search, Calendar, Flag, CheckCircle, Clock, TrendingUp,
  Bookmark, FolderPlus, Settings, Upload, X, ImageIcon
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
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
  logo?: string | null;
  goals: Goal[];
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  goalType: string;
  color: string;
  logo?: string | null;
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

const FOLDER_COLORS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#14B8A6', '#6366F1', '#F97316', '#06B6D4',
  '#84CC16', '#A855F7', '#1F2937', '#475569', '#64748B', '#94A3B8'
];

export function BookmarkGoals({ bookmarks, onUpdate }: BookmarkGoalsProps) {
  const [folders, setFolders] = useState<GoalFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<GoalFolder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Color picker state
  const [colorPickerId, setColorPickerId] = useState<string | null>(null);
  const [colorPickerValue, setColorPickerValue] = useState('#3B82F6');
  const [savingColor, setSavingColor] = useState(false);

  // Folder logo picker state
  const [folderLogoPickerId, setFolderLogoPickerId] = useState<string | null>(null);
  const [folderLogoValue, setFolderLogoValue] = useState('');
  const [savingFolderLogo, setSavingFolderLogo] = useState(false);
  const folderLogoFileRef = useRef<HTMLInputElement>(null);

  // Global Goals Logo state
  const [showLogoSettings, setShowLogoSettings] = useState(false);
  const [globalGoalsLogo, setGlobalGoalsLogo] = useState<string | null>(null);
  const [logoInputUrl, setLogoInputUrl] = useState('');
  const [savingLogo, setSavingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFolders();
    fetchGlobalGoalsLogo();
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

  const fetchGlobalGoalsLogo = async () => {
    try {
      const response = await fetch('/api/user/goals-logo');
      if (response.ok) {
        const data = await response.json();
        setGlobalGoalsLogo(data.goalsViewLogo || null);
      }
    } catch (error) {
      console.error('Error fetching goals logo:', error);
    }
  };

  const handleSaveGlobalLogo = async (logoUrl: string | null) => {
    setSavingLogo(true);
    try {
      const response = await fetch('/api/user/goals-logo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalsViewLogo: logoUrl }),
      });

      if (!response.ok) throw new Error('Failed to update logo');

      setGlobalGoalsLogo(logoUrl);
      toast.success(logoUrl ? 'Global logo updated' : 'Global logo removed');
      setShowLogoSettings(false);
      setLogoInputUrl('');
    } catch (error) {
      toast.error('Failed to update logo');
    } finally {
      setSavingLogo(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Convert to base64 for local storage (in production, upload to S3)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoInputUrl(base64);
      };
      reader.readAsDataURL(file);
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

      if (!response.ok) throw new Error('Failed to delete folder');

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

      if (!response.ok) throw new Error('Failed to delete goal');

      toast.success('Goal deleted successfully');
      fetchFolders();
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowGoalModal(true);
  };

  const handleGoalModalClose = () => {
    setShowGoalModal(false);
    setEditingGoal(undefined);
  };

  const saveFolderColor = async (folderId: string, color: string) => {
    setSavingColor(true);
    try {
      const response = await fetch(`/api/goal-folders/${folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color }),
      });

      if (!response.ok) throw new Error('Failed to update color');

      toast.success('Folder color updated');
      setColorPickerId(null);
      fetchFolders();
    } catch (error) {
      toast.error('Failed to update folder color');
    } finally {
      setSavingColor(false);
    }
  };

  const saveFolderLogo = async (folderId: string, logo: string | null) => {
    setSavingFolderLogo(true);
    try {
      const response = await fetch(`/api/goal-folders/${folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo }),
      });

      if (!response.ok) throw new Error('Failed to update logo');

      toast.success(logo ? 'Folder logo updated' : 'Folder logo removed');
      setFolderLogoPickerId(null);
      setFolderLogoValue('');
      fetchFolders();
    } catch (error) {
      toast.error('Failed to update folder logo');
    } finally {
      setSavingFolderLogo(false);
    }
  };

  const handleFolderLogoFileUpload = (event: React.ChangeEvent<HTMLInputElement>, folderId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFolderLogoValue(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return '#10B981';
      case 'IN_PROGRESS': return '#3B82F6';
      case 'ON_HOLD': return '#F59E0B';
      case 'CANCELLED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'URGENT': return '#EF4444';
      case 'HIGH': return '#F97316';
      case 'MEDIUM': return '#F59E0B';
      case 'LOW': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.toLowerCase().replace('_', ' ');
  };

  // Calculate folder stats
  const getFolderStats = (folder: GoalFolder) => {
    const totalGoals = folder.goals.length;
    const completed = folder.goals.filter(g => g.status === 'COMPLETED').length;
    const avgProgress = totalGoals > 0 
      ? Math.round(folder.goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals)
      : 0;
    return { totalGoals, completed, avgProgress };
  };

  // Get display logo for a goal (per-goal logo > global logo > null)
  const getGoalLogo = (goal: Goal) => {
    return goal.logo || globalGoalsLogo || null;
  };

  // Filter folders by search
  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    folder.goals.some(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter goals in selected folder
  const filteredGoals = selectedFolder?.goals.filter(goal =>
    goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Main folders view
  if (!selectedFolder) {
    return (
      <div className="w-full">
        {/* Header - Matches Folders view style */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 uppercase flex items-center gap-3">
                <Trophy className="w-7 h-7 text-emerald-600" />
                Goals
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {folders.length} folders • {folders.reduce((sum, f) => sum + f.goals.length, 0)} total goals
              </p>
            </div>
            <div className="flex gap-2">
              {/* Settings button for global logo */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowLogoSettings(true)}
                title="Logo Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateFolderModal(true)}
                className="gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                New Folder
              </Button>
              <Button
                onClick={() => setShowGoalModal(true)}
                className="bg-black hover:bg-gray-800 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                New Goal
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search folders and goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Goal Folders Grid - Matches Folders view style */}
        {filteredFolders.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Goal Folders Yet</h3>
            <p className="text-gray-500 mb-6">Create your first folder to organize your goals</p>
            <Button onClick={() => setShowCreateFolderModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Folder
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredFolders.map((folder) => {
              const stats = getFolderStats(folder);
              return (
                <div
                  key={folder.id}
                  onClick={() => {
                    setSelectedFolder(folder);
                    setSearchQuery('');
                  }}
                  className="group relative bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                  style={{ borderLeftWidth: '5px', borderLeftColor: folder.color }}
                >
                  {/* Three-dot menu */}
                  <div className="absolute top-2 right-2 z-20">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-2 bg-white rounded-lg shadow hover:shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setColorPickerId(folder.id);
                            setColorPickerValue(folder.color || '#3B82F6');
                          }}
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={5} className="z-[110] w-56">
                        {/* Folder Color Section */}
                        <div className="px-3 py-2 space-y-2">
                          <div className="text-xs font-semibold text-gray-700">Folder Color</div>
                          <div className="grid grid-cols-4 gap-1">
                            {FOLDER_COLORS.slice(0, 8).map((color) => (
                              <button
                                key={color}
                                className={`w-8 h-8 rounded-md border-2 transition-all ${
                                  colorPickerValue === color ? 'border-black scale-110' : 'border-gray-200'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setColorPickerValue(color);
                                }}
                              />
                            ))}
                          </div>
                          <div className="flex gap-2 pt-1">
                            <Button
                              size="sm"
                              className="flex-1"
                              disabled={savingColor}
                              onClick={(e) => {
                                e.stopPropagation();
                                saveFolderColor(folder.id, colorPickerValue);
                              }}
                            >
                              {savingColor ? 'Saving…' : 'Save'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setColorPickerId(null);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                        {/* Folder Logo Section */}
                        <div className="px-3 py-2 space-y-2">
                          <div className="text-xs font-semibold text-gray-700">Folder Logo</div>
                          {/* Logo Preview */}
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                              {(folderLogoPickerId === folder.id && folderLogoValue) || folder.logo ? (
                                <Image 
                                  src={folderLogoPickerId === folder.id && folderLogoValue ? folderLogoValue : folder.logo!} 
                                  alt="Logo" 
                                  width={32} 
                                  height={32} 
                                  className="object-contain"
                                  unoptimized
                                />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 text-xs text-gray-500">
                              {folder.logo ? 'Custom logo set' : 'No logo'}
                            </div>
                          </div>
                          {/* Upload/URL Input */}
                          <div className="space-y-1">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              ref={folderLogoFileRef}
                              onChange={(e) => handleFolderLogoFileUpload(e, folder.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full gap-1 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFolderLogoPickerId(folder.id);
                                folderLogoFileRef.current?.click();
                              }}
                            >
                              <Upload className="w-3 h-3" />
                              Upload Image
                            </Button>
                            <Input
                              placeholder="Or paste URL..."
                              className="h-7 text-xs"
                              value={folderLogoPickerId === folder.id ? folderLogoValue : ''}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                setFolderLogoPickerId(folder.id);
                                setFolderLogoValue(e.target.value);
                              }}
                            />
                          </div>
                          {/* Save/Remove Buttons */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 text-xs"
                              disabled={savingFolderLogo || (!folderLogoValue && folderLogoPickerId !== folder.id)}
                              onClick={(e) => {
                                e.stopPropagation();
                                saveFolderLogo(folder.id, folderLogoValue || null);
                              }}
                            >
                              {savingFolderLogo ? 'Saving…' : 'Save'}
                            </Button>
                            {folder.logo && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs text-red-600"
                                disabled={savingFolderLogo}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveFolderLogo(folder.id, null);
                                }}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowGoalModal(true);
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

                  {/* Folder Content */}
                  <div className="p-5">
                    {/* Icon / Logo - Priority: folder.logo > globalGoalsLogo > default icon */}
                    <div className="flex items-start mb-4">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm overflow-hidden"
                        style={{ backgroundColor: (folder.logo || globalGoalsLogo) ? 'white' : folder.color }}
                      >
                        {folder.logo ? (
                          <Image 
                            src={folder.logo} 
                            alt={folder.name} 
                            width={40} 
                            height={40} 
                            className="object-contain"
                            unoptimized
                          />
                        ) : globalGoalsLogo ? (
                          <Image 
                            src={globalGoalsLogo} 
                            alt={folder.name} 
                            width={40} 
                            height={40} 
                            className="object-contain"
                            unoptimized
                          />
                        ) : (
                          <Trophy className="w-7 h-7 text-white" />
                        )}
                      </div>
                    </div>
                    
                    {/* Folder Name */}
                    <h3 className="font-bold text-gray-900 truncate mb-1 uppercase">{folder.name}</h3>
                    <p className="text-sm text-gray-500">{stats.totalGoals} goal{stats.totalGoals !== 1 ? 's' : ''}</p>
                    
                    {/* Stats Row */}
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{stats.completed} done</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                        <span>{stats.avgProgress}%</span>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ 
                          width: `${stats.avgProgress}%`, 
                          backgroundColor: folder.color 
                        }}
                      />
                    </div>
                    
                    {/* Preview of goals */}
                    {folder.goals.length > 0 && (
                      <div className="flex gap-1 mt-4">
                        {folder.goals.slice(0, 4).map((goal) => (
                          <div 
                            key={goal.id}
                            className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: goal.color + '20' }}
                          >
                            {goal.logo || globalGoalsLogo ? (
                              <Image 
                                src={goal.logo || globalGoalsLogo!} 
                                alt="" 
                                width={16} 
                                height={16} 
                                className="object-contain"
                                unoptimized
                              />
                            ) : (
                              <Trophy className="w-3.5 h-3.5" style={{ color: goal.color }} />
                            )}
                          </div>
                        ))}
                        {folder.goals.length > 4 && (
                          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                            <span className="text-[10px] font-medium text-gray-500">
                              +{folder.goals.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Global Logo Settings Dialog */}
        <Dialog open={showLogoSettings} onOpenChange={setShowLogoSettings}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Goals View Logo Settings
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <p className="text-sm text-gray-600">
                Set a global logo that will be displayed on all goal folders and cards in this view. 
                Individual goals can override this with their own logo.
              </p>
              
              {/* Current Logo Preview */}
              {(globalGoalsLogo || logoInputUrl) && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-white rounded-xl border flex items-center justify-center overflow-hidden">
                    <Image 
                      src={logoInputUrl || globalGoalsLogo!} 
                      alt="Logo preview" 
                      width={48} 
                      height={48} 
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Current Logo</p>
                    <p className="text-xs text-gray-500">This will appear on all goals</p>
                  </div>
                  {globalGoalsLogo && !logoInputUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveGlobalLogo(null)}
                      disabled={savingLogo}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              )}
              
              {/* Upload Options */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Image</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">or</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Image URL</label>
                  <Input
                    placeholder="https://example.com/logo.png"
                    value={logoInputUrl}
                    onChange={(e) => setLogoInputUrl(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  disabled={savingLogo || !logoInputUrl}
                  onClick={() => handleSaveGlobalLogo(logoInputUrl)}
                >
                  {savingLogo ? 'Saving...' : 'Save Logo'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowLogoSettings(false);
                    setLogoInputUrl('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
          selectedFolderId={undefined}
        />
      </div>
    );
  }

  // Folder detail view - Goals inside folder
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedFolder(null);
              setSearchQuery('');
            }}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Folders
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden"
              style={{ backgroundColor: (selectedFolder.logo || globalGoalsLogo) ? 'white' : selectedFolder.color }}
            >
              {selectedFolder.logo ? (
                <Image 
                  src={selectedFolder.logo} 
                  alt={selectedFolder.name} 
                  width={48} 
                  height={48} 
                  className="object-contain"
                  unoptimized
                />
              ) : globalGoalsLogo ? (
                <Image 
                  src={globalGoalsLogo} 
                  alt={selectedFolder.name} 
                  width={48} 
                  height={48} 
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <Trophy className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 uppercase">{selectedFolder.name}</h1>
              <p className="text-sm text-gray-500">
                {selectedFolder.goals.length} goal{selectedFolder.goals.length !== 1 ? 's' : ''} • {getFolderStats(selectedFolder).avgProgress}% average progress
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowGoalModal(true)}
            className="bg-black hover:bg-gray-800 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            New Goal
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative max-w-md mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Goals Yet</h3>
          <p className="text-gray-500 mb-6">Create your first goal in this folder</p>
          <Button onClick={() => setShowGoalModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Your First Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGoals.map((goal) => {
            const displayLogo = getGoalLogo(goal);
            return (
              <div
                key={goal.id}
                className="group relative bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all overflow-hidden border-black/15 hover:border-black/25"
              >
                {/* Colored top border */}
                <div 
                  className="h-1 w-full"
                  style={{ backgroundColor: goal.color }}
                />
                
                {/* Actions */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    className="p-2 bg-white rounded-lg shadow-sm hover:shadow transition border border-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditGoal(goal);
                    }}
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    className="p-2 bg-white rounded-lg shadow-sm hover:shadow transition border border-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGoal(goal.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{ backgroundColor: displayLogo ? 'white' : goal.color + '20' }}
                    >
                      {displayLogo ? (
                        <Image 
                          src={displayLogo} 
                          alt="" 
                          width={28} 
                          height={28} 
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <Trophy className="w-5 h-5" style={{ color: goal.color }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{goal.title}</h4>
                      <p className="text-xs text-gray-400">{goal.goalType}</p>
                    </div>
                  </div>
                  
                  {/* Description */}
                  {goal.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{goal.description}</p>
                  )}
                  
                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-600">Progress</span>
                      <span className="text-xs font-bold" style={{ color: goal.color }}>{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${goal.progress}%`,
                          backgroundColor: goal.color,
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Meta info */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {/* Status */}
                    <div 
                      className="flex items-center gap-1 px-2 py-1 rounded-full"
                      style={{ backgroundColor: getStatusColor(goal.status) + '15', color: getStatusColor(goal.status) }}
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span className="font-medium capitalize">{getStatusLabel(goal.status)}</span>
                    </div>
                    
                    {/* Priority */}
                    <div 
                      className="flex items-center gap-1 px-2 py-1 rounded-full"
                      style={{ backgroundColor: getPriorityColor(goal.priority) + '15', color: getPriorityColor(goal.priority) }}
                    >
                      <Flag className="w-3 h-3" />
                      <span className="font-medium capitalize">{goal.priority.toLowerCase()}</span>
                    </div>
                    
                    {/* Deadline */}
                    {goal.deadline && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {/* Bookmarks count */}
                    {goal.bookmarks.length > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        <Bookmark className="w-3 h-3" />
                        <span>{goal.bookmarks.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <GoalModal
        open={showGoalModal}
        onClose={handleGoalModalClose}
        onSuccess={fetchFolders}
        goal={editingGoal}
        folders={folders}
        selectedFolderId={selectedFolder.id}
      />
    </div>
  );
}
