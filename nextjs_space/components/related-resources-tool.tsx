'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Link2, ExternalLink, Sparkles, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface RelatedResourcesToolProps {
  bookmarkId: string;
}

interface RelatedResource {
  id: string;
  resourceType: string;
  title: string;
  url: string;
  description: string | null;
  relevanceScore: number;
  source: string | null;
  createdAt: string;
}

export function RelatedResourcesTool({ bookmarkId }: RelatedResourcesToolProps) {
  const [resources, setResources] = useState<RelatedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
  });

  useEffect(() => {
    fetchResources();
  }, [bookmarkId]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/related-resources/${bookmarkId}`);
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAISuggestions = async () => {
    try {
      setGenerating(true);
      const response = await fetch(`/api/related-resources/${bookmarkId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generateAI: true }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Found ${data.created || 0} related resources`);
        fetchResources();
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate suggestions');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error('Title and URL are required');
      return;
    }

    try {
      const response = await fetch(`/api/related-resources/${bookmarkId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          url: formData.url,
          description: formData.description,
          resourceType: 'EXTERNAL',
        }),
      });

      if (response.ok) {
        toast.success('Resource added');
        setFormData({ title: '', url: '', description: '' });
        setShowForm(false);
        fetchResources();
      }
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error('Failed to add resource');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this resource?')) return;

    try {
      const response = await fetch(`/api/related-resources/${bookmarkId}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Resource removed');
        fetchResources();
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to remove resource');
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
          <Link2 className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">RELATED RESOURCES</h3>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={generateAISuggestions} disabled={generating}>
            <Sparkles className={`h-4 w-4 mr-1 ${generating ? 'animate-pulse' : ''}`} />
            AI FIND
          </Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" />
            ADD
          </Button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
          <Input
            placeholder="Resource title..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Input
            placeholder="URL..."
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
          <Textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
          />
          <Button onClick={handleSubmit} className="w-full">
            ADD RESOURCE
          </Button>
        </div>
      )}

      {/* Resources List */}
      {resources.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Link2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No related resources yet</p>
          <p className="text-sm text-gray-500 mt-1">Add links or let AI find connections</p>
        </div>
      ) : (
        <div className="space-y-2">
          {resources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {resource.title}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  
                  {resource.description && (
                    <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant={resource.resourceType === 'INTERNAL' ? 'default' : 'secondary'} className="text-xs">
                      {resource.resourceType}
                    </Badge>
                    {resource.source && (
                      <span className="text-gray-500">{resource.source.replace('_', ' ')}</span>
                    )}
                    <span className="text-gray-400">
                      Relevance: {(resource.relevanceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <Button size="sm" variant="ghost" onClick={() => handleDelete(resource.id)}>
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
