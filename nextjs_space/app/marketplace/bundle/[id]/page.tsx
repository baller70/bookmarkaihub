'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardAuth } from '@/components/dashboard-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  Eye,
  ThumbsUp,
  ExternalLink,
  Shield,
  Send
} from 'lucide-react';
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
  sellerId: string;
  createdAt?: string;
  category?: { id: string; name: string; icon: string };
  seller?: { id: true; name?: string; email: string; image?: string };
  badge?: { badgeLevel: string; qualityScore: number; totalSales: number };
  items?: Array<{
    id: string;
    order: number;
    bookmark?: {
      id: string;
      title: string;
      url: string;
      description?: string;
      favicon?: string;
    };
  }>;
  reviews?: Array<{
    id: string;
    rating: number;
    reviewText?: string;
    createdAt: string;
    user?: { id: string; name?: string; image?: string };
    upvoteCount: number;
    upvotes: Array<{ userId: string }>;
  }>;
  _count?: { purchases: number };
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

export default function BundleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession() || {};
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (params?.id) {
      fetchBundle();
      checkPurchaseStatus();
    }
  }, [params?.id]);

  const fetchBundle = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/marketplace/bundles/${params?.id}`);
      if (res.ok) {
        const data = await res.json();
        setBundle(data);
      } else {
        toast.error('Bundle not found');
        router.push('/marketplace');
      }
    } catch (error) {
      console.error('Failed to fetch bundle:', error);
      toast.error('Failed to load bundle');
    } finally {
      setLoading(false);
    }
  };

  const checkPurchaseStatus = async () => {
    try {
      const res = await fetch('/api/marketplace/profile/buyer');
      if (res.ok) {
        const data = await res.json();
        const purchased = data.purchases.some(
          (p: any) => p.bundleId === params?.id
        );
        setHasPurchased(purchased);
      }
    } catch (error) {
      console.error('Failed to check purchase status:', error);
    }
  };

  const handlePurchase = async () => {
    if (!bundle) return;

    if (bundle.price === 0) {
      // Free bundle
      setPurchasing(true);
      try {
        const res = await fetch(`/api/marketplace/bundles/${bundle.id}/purchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });

        if (res.ok) {
          toast.success('Bundle added to your library!');
          setHasPurchased(true);
          fetchBundle();
        } else {
          const error = await res.json();
          toast.error(error.error || 'Failed to claim bundle');
        }
      } catch (error) {
        console.error('Purchase error:', error);
        toast.error('Failed to claim bundle');
      } finally {
        setPurchasing(false);
      }
    } else {
      // Paid bundle - redirect to Stripe or show payment form
      toast.info('Stripe payment integration coming soon!');
      // TODO: Implement Stripe checkout
    }
  };

  const handleSubmitReview = async () => {
    if (!bundle) return;

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/marketplace/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundleId: bundle.id,
          rating: reviewRating,
          reviewText: reviewText.trim() || undefined
        })
      });

      if (res.ok) {
        toast.success('Review submitted!');
        setReviewText('');
        setReviewRating(5);
        fetchBundle();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Review error:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUpvoteReview = async (reviewId: string, hasUpvoted: boolean) => {
    try {
      const method = hasUpvoted ? 'DELETE' : 'POST';
      const res = await fetch(`/api/marketplace/reviews/${reviewId}/upvote`, {
        method
      });

      if (res.ok) {
        fetchBundle();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to upvote');
      }
    } catch (error) {
      console.error('Upvote error:', error);
      toast.error('Failed to upvote');
    }
  };

  if (loading) {
    return (
      <DashboardAuth>
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Loading bundle...</p>
        </div>
      </DashboardAuth>
    );
  }

  if (!bundle) {
    return null;
  }

  const currentUserId = session?.user?.email; // Using email as identifier
  const hasReviewed = bundle.reviews?.some(
    (r) => r.user?.id === currentUserId
  );

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

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Cover Image */}
              <div className="relative w-full h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg overflow-hidden mb-6">
                {bundle.coverImage ? (
                  <Image
                    src={bundle.coverImage}
                    alt={bundle.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShoppingCart className="h-24 w-24 text-white/50" />
                  </div>
                )}
              </div>

              {/* Title and Description */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase">
                    {bundle.title}
                  </h1>
                  {bundle.category && (
                    <Badge variant="outline">{bundle.category.name}</Badge>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {bundle.description}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {bundle.viewCount} views
                </div>
                <div className="flex items-center gap-1">
                  <ShoppingCart className="h-4 w-4" />
                  {bundle.purchaseCount} purchases
                </div>
                {bundle.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {bundle.averageRating.toFixed(1)} ({bundle.reviews?.length || 0} reviews)
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              {/* Bookmarks/Links in Bundle */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 uppercase">
                  Included Links ({bundle.items?.length || 0})
                </h2>
                <div className="space-y-3">
                  {bundle.items?.map((item) => (
                    <Card
                      key={item.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {item.bookmark?.favicon && (
                          <div className="relative w-8 h-8 flex-shrink-0">
                            <Image
                              src={item.bookmark.favicon}
                              alt=""
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {item.bookmark?.title}
                          </h3>
                          {item.bookmark?.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                              {item.bookmark.description}
                            </p>
                          )}
                          {hasPurchased && item.bookmark?.url && (
                            <a
                              href={item.bookmark.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                            >
                              {item.bookmark.url}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                {!hasPurchased && (
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    🔒 Purchase this bundle to access all links
                  </p>
                )}
              </div>

              <Separator className="my-6" />

              {/* Reviews Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 uppercase">
                  Reviews ({bundle.reviews?.length || 0})
                </h2>

                {/* Add Review Form (only if purchased and not reviewed) */}
                {hasPurchased && !hasReviewed && (
                  <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      Write a Review
                    </h3>
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer ${
                            star <= reviewRating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          onClick={() => setReviewRating(star)}
                        />
                      ))}
                    </div>
                    <Textarea
                      placeholder="Share your thoughts about this bundle... (optional)"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="mb-3"
                      rows={3}
                    />
                    <Button
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </Card>
                )}

                {/* Reviews List */}
                {bundle.reviews && bundle.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {bundle.reviews.map((review) => {
                      const hasUserUpvoted = review.upvotes.some(
                        (u) => u.userId === currentUserId
                      );
                      return (
                        <Card key={review.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {review.user?.name || 'Anonymous'}
                                </span>
                                <div className="flex items-center">
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
                                </div>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {review.reviewText && (
                                <p className="text-gray-700 dark:text-gray-300 mb-2">
                                  {review.reviewText}
                                </p>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 h-8"
                                onClick={() =>
                                  handleUpvoteReview(review.id, hasUserUpvoted)
                                }
                              >
                                <ThumbsUp
                                  className={`h-4 w-4 ${
                                    hasUserUpvoted ? 'fill-blue-600 text-blue-600' : ''
                                  }`}
                                />
                                {review.upvoteCount > 0 && (
                                  <span>{review.upvoteCount}</span>
                                )}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No reviews yet. Be the first to review!
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <Card className="p-6 sticky top-4">
                {/* Price */}
                <div className="text-center mb-6">
                  {bundle.price === 0 ? (
                    <Badge className="text-lg px-4 py-2 bg-green-500 text-white">
                      FREE
                    </Badge>
                  ) : (
                    <div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white uppercase">
                        ${bundle.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">One-time purchase</p>
                    </div>
                  )}
                </div>

                {/* Purchase Button */}
                {hasPurchased ? (
                  <Button className="w-full" disabled>
                    ✓ Already Purchased
                  </Button>
                ) : bundle.sellerId === session?.user?.email ? (
                  <Button className="w-full" disabled>
                    Your Bundle
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-black text-white hover:bg-gray-800 gap-2"
                    onClick={handlePurchase}
                    disabled={purchasing}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {purchasing
                      ? 'Processing...'
                      : bundle.price === 0
                      ? 'Claim Free Bundle'
                      : 'Purchase Now'}
                  </Button>
                )}

                <Separator className="my-6" />

                {/* Seller Info */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Sold by</p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {bundle.seller?.name || bundle.seller?.email}
                      </p>
                      {bundle.badge && (
                        <Badge
                          className={
                            BADGE_COLORS[
                              bundle.badge.badgeLevel as keyof typeof BADGE_COLORS
                            ]
                          }
                        >
                          {
                            BADGE_ICONS[
                              bundle.badge.badgeLevel as keyof typeof BADGE_ICONS
                            ]
                          }{' '}
                          {bundle.badge.badgeLevel}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {bundle.badge && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>
                        <Shield className="h-4 w-4 inline mr-1" />
                        {bundle.badge.totalSales} sales
                      </p>
                      <p>Quality Score: {bundle.badge.qualityScore.toFixed(1)}</p>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Bundle Info */}
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>{bundle.items?.length || 0} curated links</p>
                  <p>{bundle.reviews?.length || 0} reviews</p>
                  <p>Last updated: {new Date(bundle.createdAt || '').toLocaleDateString()}</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardAuth>
  );
}
