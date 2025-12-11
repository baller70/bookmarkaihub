'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardAuth } from '@/components/dashboard-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Plus,
  TrendingUp,
  Star,
  Eye,
  ShoppingCart,
  ArrowLeft,
  Shield,
  Award,
  Crown,
  Gem,
  Medal,
  Zap,
  BookOpen,
  Code,
  Briefcase,
  Palette,
  HeartPulse,
  GraduationCap,
  DollarSign,
  Gamepad2,
  Music,
  Camera,
  Globe,
  Rocket,
  Users,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Filter,
  LayoutGrid,
  List,
  Clock,
  Flame,
  Trophy,
  Target,
  TrendingDown,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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
  createdAt: string;
  category?: { id: string; name: string; icon: string };
  seller?: { id: string; name?: string; email: string; image?: string };
  badge?: { badgeLevel: string; qualityScore: number; totalSales?: number };
  _count?: { items: number; purchases: number; reviews: number };
}

interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
  _count: { bundles: number };
}

// Badge configuration - Professional monochromatic design with icons
const BADGE_CONFIG = {
  DIAMOND: {
    color: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
    label: 'DIAMOND',
    minSales: 51,
    priority: 5,
    glow: 'ring-1 ring-slate-400',
    icon: Gem,
    iconColor: '#38bdf8'
  },
  PLATINUM: {
    color: 'bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-800',
    label: 'PLATINUM',
    minSales: 31,
    priority: 4,
    glow: 'ring-1 ring-slate-300',
    icon: Crown,
    iconColor: '#c7cdd3'
  },
  GOLD: {
    color: 'bg-slate-600 text-white dark:bg-slate-300 dark:text-slate-700',
    label: 'GOLD',
    minSales: 16,
    priority: 3,
    glow: '',
    icon: Medal,
    iconColor: '#eab308'
  },
  SILVER: {
    color: 'bg-slate-400 text-slate-900 dark:bg-slate-400 dark:text-slate-900',
    label: 'SILVER',
    minSales: 6,
    priority: 2,
    glow: '',
    icon: Medal,
    iconColor: '#c0c4cc'
  },
  BRONZE: {
    color: 'bg-slate-300 text-slate-700 dark:bg-slate-500 dark:text-white',
    label: 'BRONZE',
    minSales: 1,
    priority: 1,
    glow: '',
    icon: Medal,
    iconColor: '#b45309'
  },
  NONE: {
    color: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
    label: 'NEW',
    minSales: 0,
    priority: 0,
    glow: ''
  }
};

// Category icons mapping
const CATEGORY_ICONS: { [key: string]: any } = {
  'Code': Code,
  'Business': Briefcase,
  'Design': Palette,
  'Health': HeartPulse,
  'Education': GraduationCap,
  'Finance': DollarSign,
  'Gaming': Gamepad2,
  'Music': Music,
  'Photography': Camera,
  'Marketing': TrendingUp,
  'Lifestyle': Globe,
  'Technology': Rocket,
  'default': BookOpen
};

export default function MarketplacePage() {
  const router = useRouter();
  const { data: session } = useSession() || {};
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('badge'); // Default to badge sorting
  const [priceFilter, setPriceFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('discover');

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
      
      // Server-side sorting for non-badge sorts
      if (sortBy !== 'badge') {
        params.append('sortBy', sortBy);
      }
      
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

  // Sort bundles with badge holders first
  const sortedBundles = useMemo(() => {
    if (sortBy !== 'badge') return bundles;
    
    return [...bundles].sort((a, b) => {
      const aBadge = a.badge?.badgeLevel || 'NONE';
      const bBadge = b.badge?.badgeLevel || 'NONE';
      const aPriority = BADGE_CONFIG[aBadge as keyof typeof BADGE_CONFIG]?.priority || 0;
      const bPriority = BADGE_CONFIG[bBadge as keyof typeof BADGE_CONFIG]?.priority || 0;
      
      // First sort by badge priority (higher first)
      if (bPriority !== aPriority) return bPriority - aPriority;
      
      // Then by quality score
      const aScore = a.badge?.qualityScore || 0;
      const bScore = b.badge?.qualityScore || 0;
      if (bScore !== aScore) return bScore - aScore;
      
      // Then by rating
      if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
      
      // Finally by purchase count
      return b.purchaseCount - a.purchaseCount;
    });
  }, [bundles, sortBy]);

  // Get featured sellers (top badge holders)
  const featuredSellers = useMemo(() => {
    const sellerMap = new Map();
    bundles.forEach(bundle => {
      if (bundle.seller && bundle.badge) {
        const existing = sellerMap.get(bundle.seller.id);
        if (!existing || (BADGE_CONFIG[bundle.badge.badgeLevel as keyof typeof BADGE_CONFIG]?.priority || 0) > 
            (BADGE_CONFIG[existing.badge?.badgeLevel as keyof typeof BADGE_CONFIG]?.priority || 0)) {
          sellerMap.set(bundle.seller.id, bundle);
        }
      }
    });
    return Array.from(sellerMap.values())
      .filter(b => b.badge && BADGE_CONFIG[b.badge.badgeLevel as keyof typeof BADGE_CONFIG]?.priority >= 3)
      .slice(0, 4);
  }, [bundles]);

  // Get trending playbooks
  const trendingBundles = useMemo(() => {
    return [...bundles]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 6);
  }, [bundles]);

  const getCategoryIcon = (iconName: string) => {
    const IconComponent = CATEGORY_ICONS[iconName] || CATEGORY_ICONS.default;
    return IconComponent;
  };

  const getBadgeConfig = (level: string | undefined) => {
    return BADGE_CONFIG[level as keyof typeof BADGE_CONFIG] || BADGE_CONFIG.NONE;
  };

  return (
    <DashboardAuth>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Header - Professional monochromatic */}
        <div className="relative bg-slate-900 dark:bg-slate-950 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 py-8">
            {/* Top Nav */}
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="text-slate-300 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                DASHBOARD
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/marketplace/profile')}
                  className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  MY PROFILE
                </Button>
                <Button
                  onClick={() => router.push('/marketplace/create')}
                  className="bg-white text-slate-900 hover:bg-slate-100"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  CREATE PLAYBOOK
                </Button>
              </div>
            </div>

            {/* Hero Content */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full text-slate-300 text-sm mb-4">
                <Sparkles className="h-4 w-4" />
                THE FIRST MARKETPLACE FOR CURATED LINK COLLECTIONS
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 uppercase tracking-tight">
                Playbook Marketplace
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Buy and sell curated link collections. Share your expertise, 
                discover valuable resources, and earn badges as you grow.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search playbooks, categories, or sellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-14 text-lg rounded-full bg-white dark:bg-slate-800 shadow-2xl border-0 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-8 mt-8 text-slate-400 text-sm uppercase tracking-wide">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{bundles.length} Playbooks</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{new Set(bundles.map(b => b.seller?.id)).size} Sellers</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>{bundles.filter(b => b.badge && BADGE_CONFIG[b.badge.badgeLevel as keyof typeof BADGE_CONFIG]?.priority >= 3).length} Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Strip */}
        <div className="bg-white dark:bg-slate-900 border-b dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-1 py-3 overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === 'all'
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                    : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                )}
              >
                <Globe className="h-4 w-4" />
                All Categories
              </button>
              {categories.map((cat) => {
                const IconComponent = getCategoryIcon(cat.icon);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                      selectedCategory === cat.id
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                        : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                    {cat.name}
                    <span className="text-xs opacity-60">({cat._count.bundles})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Homepage Sections (when no search/filter) */}
          {!searchQuery && selectedCategory === 'all' && (
            <>
              {/* Badge System Explainer */}
              <Card className="mb-8 overflow-hidden border border-slate-200 dark:border-slate-700">
                <CardContent className="p-0">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-slate-700 flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-indigo-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide">SELLER BADGE SYSTEM</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Earn badges as you sell more playbooks. Higher badges = higher visibility!</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {Object.entries(BADGE_CONFIG).filter(([key]) => key !== 'NONE').map(([key, config]) => (
                        <div key={key} className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center shadow-sm border border-slate-200 dark:border-slate-700">
                          <Badge className={cn("text-xs px-3 py-1 mb-2 font-semibold", config.color)}>
                            {config.label}
                          </Badge>
                          {config.icon && (
                            <config.icon className="h-6 w-6 mx-auto mb-2" style={{ color: config.iconColor }} />
                          )}
                          <p className="text-xs text-slate-500 dark:text-slate-400">{config.minSales}+ sales</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Featured Verified Sellers */}
              {featuredSellers.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide">FEATURED VERIFIED SELLERS</h2>
                    </div>
                    <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 uppercase text-xs">
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {featuredSellers.map((bundle) => {
                      const badgeConfig = getBadgeConfig(bundle.badge?.badgeLevel);
                      return (
                        <Card 
                          key={bundle.seller?.id} 
                          className={cn(
                            "overflow-hidden cursor-pointer hover:shadow-lg transition-all border-slate-200 dark:border-slate-700",
                            badgeConfig.glow
                          )}
                          onClick={() => router.push(`/marketplace/bundle/${bundle.id}`)}
                        >
                          <CardContent className="p-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-slate-600 dark:text-slate-400">
                              {bundle.seller?.image ? (
                                <Image
                                  src={bundle.seller.image}
                                  alt={bundle.seller.name || ''}
                                  width={64}
                                  height={64}
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                bundle.seller?.name?.charAt(0).toUpperCase() || '?'
                              )}
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-1 uppercase text-sm">
                              {bundle.seller?.name || bundle.seller?.email?.split('@')[0]}
                            </h3>
                            <Badge className={cn("text-xs mb-2 font-semibold gap-1", badgeConfig.color)}>
                              {badgeConfig.icon && (
                                <badgeConfig.icon className="h-3.5 w-3.5" style={{ color: badgeConfig.iconColor }} />
                              )}
                              {badgeConfig.label}
                            </Badge>
                            <div className="flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-slate-400 text-slate-400" />
                                {bundle.averageRating.toFixed(1)}
                              </span>
                              <span>{bundle.badge?.totalSales || bundle.purchaseCount} sales</span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Trending Playbooks */}
              {trendingBundles.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide">TRENDING PLAYBOOKS</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trendingBundles.slice(0, 3).map((bundle, idx) => {
                      const badgeConfig = getBadgeConfig(bundle.badge?.badgeLevel);
                      return (
                        <Card 
                          key={bundle.id}
                          className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group border-slate-200 dark:border-slate-700"
                          onClick={() => router.push(`/marketplace/bundle/${bundle.id}`)}
                        >
                          <div className="relative h-40 bg-slate-200 dark:bg-slate-800">
                            {bundle.coverImage && (
                              <Image
                                src={bundle.coverImage}
                                alt={bundle.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            )}
                            <div className="absolute top-3 left-3">
                              <Badge className="bg-slate-900/80 text-white backdrop-blur-sm text-xs">
                                #{idx + 1} TRENDING
                              </Badge>
                            </div>
                            {bundle.price === 0 && (
                              <Badge className="absolute top-3 right-3 bg-slate-700 text-white text-xs">
                                FREE
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1 uppercase text-sm">{bundle.title}</h3>
                              {bundle.price > 0 && (
                                <span className="font-bold text-lg text-slate-900 dark:text-white">${bundle.price.toFixed(2)}</span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{bundle.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {bundle.badge && (
                                  <Badge className={cn("text-xs font-semibold gap-1", badgeConfig.color)}>
                                    {badgeConfig.icon && (
                                      <badgeConfig.icon className="h-3.5 w-3.5" style={{ color: badgeConfig.iconColor }} />
                                    )}
                                    {badgeConfig.label}
                                  </Badge>
                                )}
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  by {bundle.seller?.name || bundle.seller?.email?.split('@')[0]}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <Eye className="h-3 w-3" /> {bundle.viewCount}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Browse by Category */}
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <LayoutGrid className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide">BROWSE BY CATEGORY</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {categories.map((cat) => {
                    const IconComponent = getCategoryIcon(cat.icon);
                    return (
                      <Card 
                        key={cat.id}
                        className="cursor-pointer hover:shadow-md hover:border-slate-400 dark:hover:border-slate-500 transition-all group border-slate-200 dark:border-slate-700"
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 mx-auto mb-3 flex items-center justify-center transition-colors">
                            <IconComponent className="h-6 w-6 text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors" />
                          </div>
                          <h3 className="font-medium text-slate-900 dark:text-white text-sm mb-1 uppercase">{cat.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{cat._count.bundles} playbooks</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* All Playbooks Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                  {selectedCategory !== 'all' 
                    ? `${categories.find(c => c.id === selectedCategory)?.name || ''} PLAYBOOKS`
                    : searchQuery 
                    ? `SEARCH RESULTS FOR "${searchQuery.toUpperCase()}"`
                    : 'ALL PLAYBOOKS'
                  }
                </h2>
                <Badge variant="secondary" className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">{sortedBundles.length}</Badge>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Price Filter Pills */}
                <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setPriceFilter('all')}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all",
                      priceFilter === 'all' ? "bg-white dark:bg-slate-700 shadow-sm dark:text-white" : "dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setPriceFilter('free')}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all",
                      priceFilter === 'free' ? "bg-white dark:bg-slate-700 shadow-sm dark:text-white" : "dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                    )}
                  >
                    Free
                  </button>
                  <button
                    onClick={() => setPriceFilter('paid')}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all",
                      priceFilter === 'paid' ? "bg-white dark:bg-slate-700 shadow-sm dark:text-white" : "dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                    )}
                  >
                    Paid
                  </button>
                </div>

                {/* Sort Select */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="badge">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Top Sellers First
                      </div>
                    </SelectItem>
                    <SelectItem value="recent">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Most Recent
                      </div>
                    </SelectItem>
                    <SelectItem value="popular">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4" />
                        Most Popular
                      </div>
                    </SelectItem>
                    <SelectItem value="rating">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Highest Rated
                      </div>
                    </SelectItem>
                    <SelectItem value="price">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Lowest Price
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      viewMode === 'grid' ? "bg-white dark:bg-slate-700 shadow-sm" : "dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      viewMode === 'list' ? "bg-white dark:bg-slate-700 shadow-sm" : "dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bundles Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedBundles.length === 0 ? (
              <Card className="p-12 text-center">
                <ShoppingCart className="h-16 w-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No playbooks found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery 
                    ? 'Try adjusting your search or filters' 
                    : 'Be the first to create a playbook in this category!'
                  }
                </p>
                <Button onClick={() => router.push('/marketplace/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Playbook
                </Button>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedBundles.map((bundle) => {
                  const badgeConfig = getBadgeConfig(bundle.badge?.badgeLevel);
                  const isVerified = badgeConfig.priority >= 3;
                  
                  return (
                    <Card
                      key={bundle.id}
                      className={cn(
                        "overflow-hidden hover:shadow-xl transition-all cursor-pointer group border-2",
                        isVerified ? badgeConfig.glow : "border-transparent hover:border-gray-200"
                      )}
                      onClick={() => router.push(`/marketplace/bundle/${bundle.id}`)}
                    >
                      {/* Cover Image */}
                      <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
                        {bundle.coverImage ? (
                          <Image
                            src={bundle.coverImage}
                            alt={bundle.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BookOpen className="h-16 w-16 text-white/30" />
                          </div>
                        )}
                        
                        {/* Badges overlay */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          {isVerified && (
                            <Badge className={cn("shadow-lg gap-1", badgeConfig.color)}>
                              {badgeConfig.icon && (
                                <badgeConfig.icon className="h-3.5 w-3.5" style={{ color: badgeConfig.iconColor }} />
                              )}
                              {badgeConfig.label} Seller
                            </Badge>
                          )}
                        </div>
                        
                        {bundle.price === 0 && (
                          <Badge className="absolute top-3 right-3 bg-green-500 text-white shadow-lg">
                            FREE
                          </Badge>
                        )}
                        
                        {/* Quick stats overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                          <div className="flex items-center gap-3 text-white/90 text-xs">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> {bundle.viewCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <ShoppingCart className="h-3 w-3" /> {bundle.purchaseCount}
                            </span>
                            {bundle.averageRating > 0 && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {bundle.averageRating.toFixed(1)}
                              </span>
                            )}
                            {bundle._count && (
                              <span className="ml-auto">{bundle._count.items} links</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        {/* Title and Price */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {bundle.title}
                          </h3>
                          {bundle.price > 0 && (
                            <span className="text-lg font-bold text-gray-900 dark:text-white flex-shrink-0">
                              ${bundle.price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                          {bundle.description}
                        </p>

                        {/* Category */}
                        {bundle.category && (
                          <Badge variant="outline" className="mb-3 text-xs">
                            {bundle.category.name}
                          </Badge>
                        )}

                        {/* Seller Info */}
                        <div className="flex items-center gap-2 pt-3 border-t">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium overflow-hidden">
                            {bundle.seller?.image ? (
                              <Image
                                src={bundle.seller.image}
                                alt={bundle.seller.name || ''}
                                width={32}
                                height={32}
                                className="object-cover"
                              />
                            ) : (
                              bundle.seller?.name?.charAt(0).toUpperCase() || '?'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {bundle.seller?.name || bundle.seller?.email?.split('@')[0]}
                            </p>
                            {bundle.badge && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                {badgeConfig.icon && (
                                  <badgeConfig.icon className="h-3.5 w-3.5" style={{ color: badgeConfig.iconColor }} />
                                )}
                                {badgeConfig.label}
                              </p>
                            )}
                          </div>
                          {isVerified && (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {sortedBundles.map((bundle) => {
                  const badgeConfig = getBadgeConfig(bundle.badge?.badgeLevel);
                  const isVerified = badgeConfig.priority >= 3;
                  
                  return (
                    <Card
                      key={bundle.id}
                      className={cn(
                        "overflow-hidden hover:shadow-lg transition-all cursor-pointer border-2",
                        isVerified ? badgeConfig.glow : "border-transparent hover:border-gray-200"
                      )}
                      onClick={() => router.push(`/marketplace/bundle/${bundle.id}`)}
                    >
                      <div className="flex">
                        <div className="relative w-48 h-36 flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600">
                          {bundle.coverImage && (
                            <Image
                              src={bundle.coverImage}
                              alt={bundle.title}
                              fill
                              className="object-cover"
                            />
                          )}
                          {bundle.price === 0 && (
                            <Badge className="absolute top-2 left-2 bg-green-500 text-white text-xs">
                              FREE
                            </Badge>
                          )}
                        </div>
                        <CardContent className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{bundle.title}</h3>
                                {isVerified && (
                                  <Badge className={cn("text-xs gap-1", badgeConfig.color)}>
                                    {badgeConfig.icon && (
                                      <badgeConfig.icon className="h-3.5 w-3.5" style={{ color: badgeConfig.iconColor }} />
                                    )}
                                    {badgeConfig.label}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 line-clamp-2 mb-2">{bundle.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" /> {bundle.viewCount} views
                                </span>
                                <span className="flex items-center gap-1">
                                  <ShoppingCart className="h-3 w-3" /> {bundle.purchaseCount} sales
                                </span>
                                {bundle.averageRating > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    {bundle.averageRating.toFixed(1)} rating
                                  </span>
                                )}
                                {bundle._count && (
                                  <span>{bundle._count.items} links</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              {bundle.price > 0 ? (
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">${bundle.price.toFixed(2)}</p>
                              ) : (
                                <Badge className="bg-green-500 text-white">FREE</Badge>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                by {bundle.seller?.name || bundle.seller?.email?.split('@')[0]}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-slate-900 dark:bg-slate-950 py-12 mt-12">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide">
              READY TO SHARE YOUR EXPERTISE?
            </h2>
            <p className="text-slate-400 mb-6">
              Create your first playbook, start earning badges, and build your reputation as a trusted curator.
            </p>
            <Button 
              size="lg"
              onClick={() => router.push('/marketplace/create')}
              className="bg-white text-slate-900 hover:bg-slate-100 uppercase"
            >
              <Rocket className="h-5 w-5 mr-2" />
              CREATE YOUR PLAYBOOK
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </DashboardAuth>
  );
}
