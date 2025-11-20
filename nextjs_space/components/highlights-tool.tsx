'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Highlighter, Plus, Trash2, Edit2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface HighlightsToolProps {
  bookmarkId: string;
}

interface WebHighlight {
  id: string;
  highlightedText: string;
  context: string | null;
  personalNote: string | null;
  color: string;
  tags: string[];
  position: number | null;
  createdAt: string;
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#FCD34D' },
  { name: 'Green', value: '#86EFAC' },
  { name: 'Blue', value: '#93C5FD' },
  { name: 'Pink', value: '#F9A8D4' },
  { name: 'Purple', value: '#C4B5FD' },
];

export function HighlightsTool({ bookmarkId }: HighlightsToolProps) {
  const [highlights, setHighlights] = useState<WebHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    highlightedText: '',
    context: '',
    personalNote: '',
    color: '#FCD34D',
    tags: '',
  });

  useEffect(() => {
    fetchHighlights();
  }, [bookmarkId]);

  const fetchHighlights = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/highlights/${bookmarkId}`);
      if (response.ok) {
        const data = await response.json();
        setHighlights(data);
      }
    } catch (error) {
      console.error('Error fetching highlights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.highlightedText.trim()) {
      toast.error('Highlighted text is required');
      return;
    }

    try {
      const url = editingId
        ? `/api/highlights/${bookmarkId}/${editingId}`
        : `/api/highlights/${bookmarkId}`;

      const response = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        toast.success(editingId ? 'Highlight updated' : 'Highlight created');
        setFormData({ highlightedText: '', context: '', personalNote: '', color: '#FCD34D', tags: '' });
        setShowForm(false);
        setEditingId(null);
        fetchHighlights();
      }
    } catch (error) {
      console.error('Error saving highlight:', error);
      toast.error('Failed to save highlight');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this highlight?')) return;

    try {
      const response = await fetch(`/api/highlights/${bookmarkId}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Highlight deleted');
        fetchHighlights();
      }
    } catch (error) {
      console.error('Error deleting highlight:', error);
      toast.error('Failed to delete highlight');
    }
  };

  const startEdit = (highlight: WebHighlight) => {
    setFormData({
      highlightedText: highlight.highlightedText,
      context: highlight.context || '',
      personalNote: highlight.personalNote || '',
      color: highlight.color,
      tags: highlight.tags.join(', '),
    });
    setEditingId(highlight.id);
    setShowForm(true);
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
          <Highlighter className="h-5 w-5 text-yellow-600" />
          <h3 className="font-semibold text-gray-900">WEB HIGHLIGHTS</h3>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          {showForm ? 'CANCEL' : 'ADD HIGHLIGHT'}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
          <Textarea
            placeholder="Highlighted text..."
            value={formData.highlightedText}
            onChange={(e) => setFormData({ ...formData, highlightedText: e.target.value })}
            rows={3}
          />
          
          <Input
            placeholder="Context (optional)"
            value={formData.context}
            onChange={(e) => setFormData({ ...formData, context: e.target.value })}
          />

          <Textarea
            placeholder="Your notes..."
            value={formData.personalNote}
            onChange={(e) => setFormData({ ...formData, personalNote: e.target.value })}
            rows={2}
          />

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">HIGHLIGHT COLOR</label>
            <div className="flex gap-2">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.value}
                  className={`w-10 h-10 rounded-full border-2 ${
                    formData.color === color.value ? 'border-gray-900 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setFormData({ ...formData, color: color.value })}
                />
              ))}
            </div>
          </div>

          <Input
            placeholder="Tags (comma-separated)"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />

          <Button onClick={handleSubmit} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {editingId ? 'UPDATE' : 'SAVE'} HIGHLIGHT
          </Button>
        </div>
      )}

      {/* Highlights List */}
      {highlights.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Highlighter className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No highlights yet</p>
          <p className="text-sm text-gray-500 mt-1">Save important text excerpts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {highlights.map((highlight) => (
            <div
              key={highlight.id}
              className="bg-white rounded-lg border border-gray-200 p-4"
              style={{ borderLeftWidth: '4px', borderLeftColor: highlight.color }}
            >
              {/* Highlighted Text */}
              <div
                className="p-3 rounded mb-2 text-gray-900"
                style={{ backgroundColor: `${highlight.color}40` }}
              >
                {highlight.highlightedText}
              </div>

              {/* Personal Note */}
              {highlight.personalNote && (
                <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded mb-2">
                  <strong>Note:</strong> {highlight.personalNote}
                </div>
              )}

              {/* Tags */}
              {highlight.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {highlight.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(highlight.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(highlight)}>
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(highlight.id)}>
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
