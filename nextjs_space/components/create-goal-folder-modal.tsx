'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Folder } from 'lucide-react';
import { toast } from 'sonner';

interface CreateGoalFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFolderCreated: () => void;
}

const FOLDER_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6B7280',
  '#1E3A8A', '#065F46', '#B91C1C', '#7C3AED', '#0E7490',
];

export function CreateGoalFolderModal({
  isOpen,
  onClose,
  onFolderCreated,
}: CreateGoalFolderModalProps) {
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
        throw new Error('Failed to create folder');
      }

      toast.success('Goal folder created successfully');
      setName('');
      setDescription('');
      setSelectedColor(FOLDER_COLORS[0]);
      onFolderCreated();
      onClose();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create goal folder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Create New Goal Folder
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Create a new folder to organize your goals
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Folder Name */}
          <div className="space-y-2">
            <Label htmlFor="folder-name">
              Folder Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="folder-name"
              placeholder="Enter folder name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="folder-description">Description</Label>
            <Textarea
              id="folder-description"
              placeholder="Optional description for this folder..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Folder Color */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedColor }} />
              Folder Color
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-full aspect-square rounded-lg border-2 transition-all ${
                    selectedColor === color
                      ? 'border-primary scale-110 ring-2 ring-primary ring-offset-2'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="border-2 border-dashed rounded-lg p-4 flex items-center gap-3">
              <Folder className="w-8 h-8" style={{ color: selectedColor }} />
              <span className="font-semibold">{name || 'Folder Name'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Folder className="w-4 h-4 mr-2" />
            Create Folder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
