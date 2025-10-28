
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Folder, Layers, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  bookmarkCount: number;
}

interface FolderDetails {
  id: string;
  name: string;
  categoryCount: number;
}

export default function CategoryFolderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = params?.folderId as string;
  const { data: session, status } = useSession() || {};
  const [folder, setFolder] = useState<FolderDetails | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && folderId) {
      fetchFolderDetails();
    }
  }, [status, folderId, router]);

  const fetchFolderDetails = async () => {
    try {
      setIsLoading(true);
      const [folderRes, categoriesRes] = await Promise.all([
        fetch(`/api/categories/folders/${folderId}`),
        fetch(`/api/categories/folders/${folderId}/categories`),
      ]);

      if (folderRes.ok) {
        const folderData = await folderRes.json();
        setFolder(folderData.folder);
      } else {
        toast.error('Failed to load folder');
        router.push('/bookmarkai-addons/categories');
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }
    } catch (error) {
      console.error('Error fetching folder details:', error);
      toast.error('Failed to load folder details');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading folder...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!folder) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#FAFAFA] pb-20">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/bookmarkai-addons/categories')}
              className="text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Folder Header */}
          <div className="bg-white rounded-lg border p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Folder className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1 uppercase">{folder.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {folder.categoryCount} {folder.categoryCount === 1 ? 'category' : 'categories'}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search categories in this folder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>

          {/* Categories Grid */}
          {filteredCategories.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? 'No categories found matching your search.' : 'No categories in this folder yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/categories/${category.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.bookmarkCount} bookmarks
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
