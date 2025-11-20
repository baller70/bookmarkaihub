'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Share2, Users, Eye, Edit, MessageSquare, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface BookmarkShareToolProps {
  bookmarkId: string;
}

interface BookmarkShare {
  id: string;
  permission: string;
  message: string | null;
  accessCount: number;
  lastAccessed: string | null;
  expiresAt: string | null;
  createdAt: string;
  sharedWith?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

const PERMISSION_OPTIONS = [
  { value: 'VIEW', label: 'View Only', icon: Eye },
  { value: 'COMMENT', label: 'Can Comment', icon: MessageSquare },
  { value: 'EDIT', label: 'Can Edit', icon: Edit },
];

export function BookmarkShareTool({ bookmarkId }: BookmarkShareToolProps) {
  const [shares, setShares] = useState<BookmarkShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    permission: 'VIEW',
    message: '',
  });

  useEffect(() => {
    fetchShares();
  }, [bookmarkId]);

  const fetchShares = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookmark-share/${bookmarkId}`);
      if (response.ok) {
        const data = await response.json();
        setShares(data);
      }
    } catch (error) {
      console.error('Error fetching shares:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      const response = await fetch(`/api/bookmark-share/${bookmarkId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sharedWithEmail: formData.email,
          permission: formData.permission,
          message: formData.message || null,
        }),
      });

      if (response.ok) {
        toast.success('Bookmark shared successfully');
        setFormData({ email: '', permission: 'VIEW', message: '' });
        setShowForm(false);
        fetchShares();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to share bookmark');
      }
    } catch (error) {
      console.error('Error sharing bookmark:', error);
      toast.error('Failed to share bookmark');
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    if (!confirm('Remove this share?')) return;

    try {
      const response = await fetch(`/api/bookmark-share/${bookmarkId}/${shareId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Share removed');
        fetchShares();
      }
    } catch (error) {
      console.error('Error removing share:', error);
      toast.error('Failed to remove share');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">COLLABORATION & SHARING</h3>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          {showForm ? 'CANCEL' : 'SHARE'}
        </Button>
      </div>

      {/* Share Form */}
      {showForm && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100 space-y-3">
          <Input
            type="email"
            placeholder="Enter user email..."
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          
          <Select value={formData.permission} onValueChange={(v) => setFormData({ ...formData, permission: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERMISSION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Message (optional)..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={2}
          />

          <Button onClick={handleShare} className="w-full">
            <Share2 className="h-4 w-4 mr-2" />
            SHARE BOOKMARK
          </Button>
        </div>
      )}

      {/* Shares List */}
      {shares.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Not shared with anyone yet</p>
          <p className="text-sm text-gray-500 mt-1">Share this bookmark with team members</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shares.map((share) => (
            <div key={share.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-700">
                        {share.sharedWith?.name?.[0]?.toUpperCase() || share.sharedWith?.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {share.sharedWith?.name || 'User'}
                      </p>
                      <p className="text-sm text-gray-600">{share.sharedWith?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary">
                      {PERMISSION_OPTIONS.find(p => p.value === share.permission)?.label}
                    </Badge>
                    <span className="text-gray-500">
                      Accessed {share.accessCount} times
                    </span>
                  </div>

                  {share.message && (
                    <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                      {share.message}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    Shared {new Date(share.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <Button size="sm" variant="ghost" onClick={() => handleRemoveShare(share.id)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
