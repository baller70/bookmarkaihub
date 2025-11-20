
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardAuth } from '@/components/dashboard-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, Plus, TrendingUp, Star, Eye, ShoppingCart, ArrowLeft, Shield } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface Bundle {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  price: number;
  tags: string[];
  viewCount: number;
  purchaseCount: number;
  averageRating: number;
  category?: { id: string; name: string; icon: string };
  seller?: { id: string; name?: string; email: string; image?: string };
  badge?: { badgeLevel: string; qualityScore: number };
  _count?: { items: number; purchases: number; reviews: number };
}

interface Category {
  id: string;
  name: string;
  icon: string;
  _count: { bundles: number };
}

const BADGE_COLORS = {
  BRONZE: 'bg-amber-700 text-white',
  SILVER: 'bg-gray-400 text-gray-900',
  GOLD: 'bg-yellow-500 text-gray-900',
  PLATINUM: 'bg-purple-600 text-white',
  DIAMOND: 'bg-cyan-400 text-gray-900',
};

const BADGE_ICONS = {
  BRONZE: '🥉',
  SILVER: '🥈',
  GOLD: '🥇',
  PLATINUM: '💎',
  DIAMOND: '💠',
};

export default function MarketplacePage() {
  const router = useRouter();
  const { data: session } = useSession() || {};
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('recent');
  const [priceFilter, setPriceFilter] = useState('all');

  useEffect(() => {
    fetchCategories();
    fetchBundles();
  }, []);

  useEffect(() => {
    fetchBundles();
  }, [searchQuery, selectedCategory, sortBy, priceFilter]);

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

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('categoryId', selectedCategory);
      params.append('sortBy', sortBy);
      if (priceFilter === 'free') {
        params.append('minPrice', '0');
        params.append('maxPrice', '0');
      } else if (priceFilter === 'paid') {
        params.append('minPrice', '0.01');
      }

      const res = await fetch(`/api/marketplace/bundles?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBundles(data);
      }
    } catch (error) {
      console.error('Failed to fetch bundles:', error);
      toast.error('Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardAuth>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push('/marketplace/profile')}
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  My Profile
                </Button>
                <Button
                  onClick={() => router.push('/marketplace/create')}
                  className="gap-2 bg-black text-white hover:bg-gray-800"
                >
                  <Plus className="h-4 w-4" />
                  Create Bundle
                </Button>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 uppercase">
              Marketplace
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Buy and sell curated bookmark bundles from the community
            </p>

            {/* Search and Filters */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search bundles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name} ({cat._count.bundles})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price">Lowest Price</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Filter */}
            <div className="mt-4 flex gap-2">
              <Button
                variant={priceFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPriceFilter('all')}
              >
                All
              </Button>
              <Button
                variant={priceFilter === 'free' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPriceFilter('free')}
              >
                Free
              </Button>
              <Button
                variant={priceFilter === 'paid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPriceFilter('paid')}
              >
                Paid
              </Button>
            </div>
          </div>
        </div>

        {/* Bundle Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading bundles...</p>
            </div>
          ) : bundles.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 uppercase">
                No bundles found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try adjusting your search or filters
              </p>
              <Button onClick={() => router.push('/marketplace/create')}>
                Create Your First Bundle
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bundles.map((bundle) => (
                <Card
                  key={bundle.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                  onClick={() => router.push(`/marketplace/bundle/${bundle.id}`)}
                >
                  {/* Cover Image */}
                  <div className="relative w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                    {bundle.coverImage ? (
                      <Image
                        src={bundle.coverImage}
                        alt={bundle.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingCart className="h-16 w-16 text-white/50" />
                      </div>
                    )}
                    {bundle.price === 0 && (
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                        FREE
                      </Badge>
                    )}
                  </div>

                  <div className="p-4">
                    {/* Title and Price */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
                        {bundle.title}
                      </h3>
                      {bundle.price > 0 && (
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ${bundle.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {bundle.description}
                    </p>

                    {/* Category */}
                    {bundle.category && (
                      <Badge variant="outline" className="mb-3">
                        {bundle.category.name}
                      </Badge>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {bundle.viewCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <ShoppingCart className="h-4 w-4" />
                        {bundle.purchaseCount}
                      </div>
                      {bundle.averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {bundle.averageRating.toFixed(1)}
                        </div>
                      )}
                      {bundle._count && (
                        <span>{bundle._count.items} links</span>
                      )}
                    </div>

                    {/* Seller Info */}
                    {bundle.seller && (
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Sold by</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {bundle.seller.name || bundle.seller.email}
                          </p>
                        </div>
                        {bundle.badge && (
                          <Badge className={BADGE_COLORS[bundle.badge.badgeLevel as keyof typeof BADGE_COLORS]}>
                            {BADGE_ICONS[bundle.badge.badgeLevel as keyof typeof BADGE_ICONS]}{' '}
                            {bundle.badge.badgeLevel}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardAuth>
  );
}
