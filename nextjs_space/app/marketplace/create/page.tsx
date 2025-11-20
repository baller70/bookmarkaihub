'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardAuth } from '@/components/dashboard-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, X, Upload, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function CreateBundlePage() {
  const router = useRouter();
  const { data: session } = useSession() || {};
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingBookmarks, setFetchingBookmarks] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchBookmarks();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/marketplace/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchBookmarks = async () => {
    try {
      setFetchingBookmarks(true);
      const res = await fetch('/api/bookmarks');
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data);
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      toast.error('Failed to load your bookmarks');
    } finally {
      setFetchingBookmarks(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const toggleBookmark = (bookmarkId: string) => {
    if (selectedBookmarks.includes(bookmarkId)) {
      setSelectedBookmarks(selectedBookmarks.filter((id) => id !== bookmarkId));
    } else {
      setSelectedBookmarks([...selectedBookmarks, bookmarkId]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (selectedBookmarks.length === 0) {
      toast.error('Please select at least one bookmark');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/marketplace/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price: parseFloat(price) || 0,
          categoryId: categoryId || undefined,
          tags,
          bookmarkIds: selectedBookmarks,
          coverImage: coverImage || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Bundle created successfully!');
        router.push(`/marketplace/bundle/${data.id}`);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create bundle');
      }
    } catch (error) {
      console.error('Create bundle error:', error);
      toast.error('Failed to create bundle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardAuth>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/marketplace')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Bundle
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Share your curated collection of bookmarks with the community
          </p>

          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Top 10 AI Tools for Productivity"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what's in this bundle and who it's for..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-category">No Category</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="price">Price (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Set to 0 for a free bundle
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="tags"
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button onClick={handleAddTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="coverImage">Cover Image URL (optional)</Label>
                  <Input
                    id="coverImage"
                    placeholder="https://example.com/image.jpg"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide a direct link to an image
                  </p>
                </div>
              </div>
            </Card>

            {/* Select Bookmarks */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Select Bookmarks ({selectedBookmarks.length} selected)
                </h2>
                {selectedBookmarks.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedBookmarks([])}
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {fetchingBookmarks ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  Loading your bookmarks...
                </p>
              ) : bookmarks.length === 0 ? (
                <div className="text-center py-8">
                  <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No bookmarks found
                  </p>
                  <Button onClick={() => router.push('/dashboard')}>
                    Add Bookmarks
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {bookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => toggleBookmark(bookmark.id)}
                    >
                      <Checkbox
                        checked={selectedBookmarks.includes(bookmark.id)}
                        onCheckedChange={() => toggleBookmark(bookmark.id)}
                      />
                      {bookmark.favicon && (
                        <div className="relative w-6 h-6 flex-shrink-0">
                          <Image
                            src={bookmark.favicon}
                            alt=""
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {bookmark.title}
                        </p>
                        {bookmark.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                            {bookmark.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/marketplace')}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || selectedBookmarks.length === 0}
                className="bg-black text-white hover:bg-gray-800"
              >
                {loading ? 'Creating...' : 'Create Bundle'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardAuth>
  );
}
