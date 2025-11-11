
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Folder, X } from 'lucide-react';
import { toast } from 'sonner';

interface CreateGoalFolderModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FOLDER_COLORS = [
  '#60A5FA', // Light Blue
  '#14B8A6', // Teal
  '#FBBF24', // Yellow
  '#F472B6', // Pink
  '#A78BFA', // Purple
  '#22D3EE', // Cyan
  '#FB923C', // Orange
  '#84CC16', // Lime
  '#EC4899', // Hot Pink
  '#94A3B8', // Gray Blue
  '#3B82F6', // Blue
  '#10B981', // Green
  '#EF4444', // Red
  '#8B5CF6', // Dark Purple
  '#06B6D4', // Teal/Cyan
];

export function CreateGoalFolderModal({ open, onClose, onSuccess }: CreateGoalFolderModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/goal-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          color: selectedColor,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create folder');
      }

      toast.success('Goal folder created successfully');
      setName('');
      setDescription('');
      setSelectedColor(FOLDER_COLORS[0]);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create folder');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setSelectedColor(FOLDER_COLORS[0]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Folder className="w-5 h-5" />
            Create New Goal Folder
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Create a new folder to organize your goals
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Folder Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Folder Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter folder name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              placeholder="Optional description for this folder..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Folder Color */}
          <div>
            <label className="block text-sm font-medium mb-3">Folder Color</label>
            <div className="grid grid-cols-5 gap-2">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-full aspect-square rounded-lg border-2 transition-all ${
                    selectedColor === color
                      ? 'border-gray-900 ring-2 ring-gray-300'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium mb-2">Preview</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedColor }}
                >
                  <Folder className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium text-gray-900">
                  {name.trim() || 'Folder Name'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
            className="bg-gray-900 hover:bg-gray-800"
          >
            <Folder className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Creating...' : 'Create Folder'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
