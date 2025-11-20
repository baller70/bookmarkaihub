'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardAuth } from '@/components/dashboard-auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ShoppingBag,
  Package,
  Star,
  DollarSign,
  ThumbsUp,
  Eye,
  ShoppingCart,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

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

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession() || {};
  const [activeTab, setActiveTab] = useState('seller');
  const [sellerData, setSellerData] = useState<any>(null);
  const [buyerData, setBuyerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerProfile();
    fetchBuyerProfile();
  }, []);

  const fetchSellerProfile = async () => {
    try {
      const res = await fetch('/api/marketplace/profile/seller');
      if (res.ok) {
        const data = await res.json();
        setSellerData(data);
      }
    } catch (error) {
      console.error('Failed to fetch seller profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuyerProfile = async () => {
    try {
      const res = await fetch('/api/marketplace/profile/buyer');
      if (res.ok) {
        const data = await res.json();
        setBuyerData(data);
      }
    } catch (error) {
      console.error('Failed to fetch buyer profile:', error);
    }
  };

  if (loading) {
    return (
      <DashboardAuth>
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </DashboardAuth>
    );
  }

  return (
    <DashboardAuth>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 py-4">
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

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 uppercase">
              My Marketplace Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your bundles and purchases
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="seller" className="gap-2">
                <Package className="h-4 w-4" />
                Seller Dashboard
              </TabsTrigger>
              <TabsTrigger value="buyer" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Buyer Dashboard
              </TabsTrigger>
            </TabsList>

            {/* Seller Dashboard */}
            <TabsContent value="seller" className="space-y-6">
              {/* Seller Badge & Stats */}
              {sellerData?.badge && (
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 uppercase">
                        Seller Badge
                      </h2>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={`text-xl px-4 py-2 ${
                            BADGE_COLORS[
                              sellerData.badge.badgeLevel as keyof typeof BADGE_COLORS
                            ]
                          }`}
                        >
                          {
                            BADGE_ICONS[
                              sellerData.badge.badgeLevel as keyof typeof BADGE_ICONS
                            ]
                          }{' '}
                          {sellerData.badge.badgeLevel}
                        </Badge>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          Quality Score: {sellerData.badge.qualityScore.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <Award className="h-16 w-16 text-gray-300" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white uppercase">
                        {sellerData.badge.totalSales}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white uppercase">
                        ${sellerData.badge.totalRevenue.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white uppercase">
                        {sellerData.badge.averageRating.toFixed(1)} ★
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white uppercase">
                        {sellerData.badge.totalUpvotes}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Upvotes</p>
                    </div>
                  </div>

                  {/* Badge Requirements */}
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Badge System
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
                      <div>
                        <Badge className={BADGE_COLORS.BRONZE}>🥉 BRONZE</Badge>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">1-5 sales</p>
                      </div>
                      <div>
                        <Badge className={BADGE_COLORS.SILVER}>🥈 SILVER</Badge>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">6-15 sales</p>
                      </div>
                      <div>
                        <Badge className={BADGE_COLORS.GOLD}>🥇 GOLD</Badge>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">16-30 sales</p>
                      </div>
                      <div>
                        <Badge className={BADGE_COLORS.PLATINUM}>💎 PLATINUM</Badge>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">31-50 sales</p>
                      </div>
                      <div>
                        <Badge className={BADGE_COLORS.DIAMOND}>💠 DIAMOND</Badge>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">51+ sales</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                      Badge level also considers quality score (ratings + upvotes)
                    </p>
                  </div>
                </Card>
              )}

              {/* My Bundles */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white uppercase">
                    My Bundles ({sellerData?.bundles?.length || 0})
                  </h2>
                  <Button
                    onClick={() => router.push('/marketplace/create')}
                    className="gap-2"
                  >
                    Create New Bundle
                  </Button>
                </div>

                {sellerData?.bundles && sellerData.bundles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sellerData.bundles.map((bundle: any) => (
                      <Card
                        key={bundle.id}
                        className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => router.push(`/marketplace/bundle/${bundle.id}`)}
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {bundle.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {bundle.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {bundle.viewCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <ShoppingCart className="h-4 w-4" />
                            {bundle.purchaseCount}
                          </span>
                          {bundle.averageRating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              {bundle.averageRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        {bundle.price > 0 ? (
                          <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                            ${bundle.price.toFixed(2)}
                          </p>
                        ) : (
                          <Badge className="mt-2 bg-green-500 text-white">FREE</Badge>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      You haven't created any bundles yet
                    </p>
                    <Button onClick={() => router.push('/marketplace/create')}>
                      Create Your First Bundle
                    </Button>
                  </div>
                )}
              </Card>

              {/* Recent Reviews */}
              {sellerData?.reviews && sellerData.reviews.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 uppercase">
                    Recent Reviews
                  </h2>
                  <div className="space-y-3">
                    {sellerData.reviews.slice(0, 5).map((review: any) => (
                      <div
                        key={review.id}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-500">
                            on {review.bundle.title}
                          </span>
                        </div>
                        {review.reviewText && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            {review.reviewText}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>by {review.user?.name || 'Anonymous'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {review.upvoteCount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* Buyer Dashboard */}
            <TabsContent value="buyer" className="space-y-6">
              {/* Purchase Stats */}
              {buyerData?.stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-6 text-center">
                    <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white uppercase">
                      {buyerData.stats.totalPurchases}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Bundles Purchased</p>
                  </Card>
                  <Card className="p-6 text-center">
                    <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white uppercase">
                      ${buyerData.stats.totalSpent.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                  </Card>
                  <Card className="p-6 text-center">
                    <Star className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white uppercase">
                      {buyerData.stats.totalReviews}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reviews Written</p>
                  </Card>
                </div>
              )}

              {/* My Purchases */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 uppercase">
                  My Purchases ({buyerData?.purchases?.length || 0})
                </h2>

                {buyerData?.purchases && buyerData.purchases.length > 0 ? (
                  <div className="space-y-4">
                    {buyerData.purchases.map((purchase: any) => (
                      <Card
                        key={purchase.id}
                        className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() =>
                          router.push(`/marketplace/bundle/${purchase.bundle.id}`)
                        }
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {purchase.bundle.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {purchase.bundle.items?.length || 0} links included
                            </p>
                            <p className="text-xs text-gray-500">
                              Purchased on{' '}
                              {new Date(purchase.purchasedAt).toLocaleDateString()}
                            </p>
                          </div>
                          {purchase.amount > 0 && (
                            <p className="font-bold text-gray-900 dark:text-white">
                              ${purchase.amount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      You haven't purchased any bundles yet
                    </p>
                    <Button onClick={() => router.push('/marketplace')}>
                      Browse Marketplace
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardAuth>
  );
}
