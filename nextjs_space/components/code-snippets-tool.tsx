
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Code, Plus, Copy, Trash2, Edit2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CodeSnippetsToolProps {
  bookmarkId: string;
}

interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  description: string | null;
  tags: string[];
  lineNumber: number | null;
  createdAt: string;
}

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'go', 'rust', 'cpp', 'csharp',
  'php', 'ruby', 'swift', 'kotlin', 'sql', 'html', 'css', 'bash', 'json', 'yaml', 'markdown'
];

export function CodeSnippetsTool({ bookmarkId }: CodeSnippetsToolProps) {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    language: 'javascript',
    description: '',
    tags: '',
  });

  useEffect(() => {
    fetchSnippets();
  }, [bookmarkId]);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/code-snippets/${bookmarkId}`);
      if (response.ok) {
        const data = await response.json();
        setSnippets(data);
      }
    } catch (error) {
      console.error('Error fetching snippets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.code.trim()) {
      toast.error('Title and code are required');
      return;
    }

    try {
      const url = editingId
        ? `/api/code-snippets/${bookmarkId}/${editingId}`
        : `/api/code-snippets/${bookmarkId}`;

      const response = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        toast.success(editingId ? 'Snippet updated' : 'Snippet created');
        setFormData({ title: '', code: '', language: 'javascript', description: '', tags: '' });
        setShowForm(false);
        setEditingId(null);
        fetchSnippets();
      }
    } catch (error) {
      console.error('Error saving snippet:', error);
      toast.error('Failed to save snippet');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this snippet?')) return;

    try {
      const response = await fetch(`/api/code-snippets/${bookmarkId}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Snippet deleted');
        fetchSnippets();
      }
    } catch (error) {
      console.error('Error deleting snippet:', error);
      toast.error('Failed to delete snippet');
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Copied to clipboard');
  };

  const startEdit = (snippet: CodeSnippet) => {
    setFormData({
      title: snippet.title,
      code: snippet.code,
      language: snippet.language,
      description: snippet.description || '',
      tags: snippet.tags.join(', '),
    });
    setEditingId(snippet.id);
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
          <Code className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">CODE SNIPPETS</h3>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          {showForm ? 'CANCEL' : 'ADD SNIPPET'}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
          <Input
            placeholder="Snippet title..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          
          <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Paste your code here..."
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            rows={6}
            className="font-mono text-sm"
          />

          <Input
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <Input
            placeholder="Tags (comma-separated)"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />

          <Button onClick={handleSubmit} className="w-full">
            <Check className="h-4 w-4 mr-2" />
            {editingId ? 'UPDATE SNIPPET' : 'SAVE SNIPPET'}
          </Button>
        </div>
      )}

      {/* Snippets List */}
      {snippets.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Code className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No code snippets yet</p>
          <p className="text-sm text-gray-500 mt-1">Click "Add Snippet" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {snippets.map((snippet) => (
            <div key={snippet.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Snippet Header */}
              <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{snippet.language.toUpperCase()}</Badge>
                  <span className="font-medium text-gray-900">{snippet.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleCopy(snippet.code)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => startEdit(snippet)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(snippet.id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>

              {/* Code Block */}
              <div className="p-4 bg-gray-900 text-gray-100 overflow-x-auto">
                <pre className="text-sm font-mono">
                  <code>{snippet.code}</code>
                </pre>
              </div>

              {/* Snippet Footer */}
              {(snippet.description || snippet.tags.length > 0) && (
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 space-y-2">
                  {snippet.description && (
                    <p className="text-sm text-gray-600">{snippet.description}</p>
                  )}
                  {snippet.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {snippet.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
