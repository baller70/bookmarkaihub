
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/marketplace/reviews - Get reviews by bundleId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bundleId = searchParams.get('bundleId');

    if (!bundleId) {
      return NextResponse.json(
        { error: 'Bundle ID is required' },
        { status: 400 }
      );
    }

    const reviews = await prisma.marketplaceReview.findMany({
      where: { bundleId },
      orderBy: { createdAt: 'desc' },
      include: {
        upvotes: true
      }
    });

    // Fetch user info for each review
    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const user = await prisma.user.findUnique({
          where: { id: review.userId },
          select: { id: true, name: true, image: true }
        });
        return {
          ...review,
          user,
          upvoteCount: review.upvotes.length
        };
      })
    );

    return NextResponse.json(reviewsWithUsers);
  } catch (error) {
    console.error('[MARKETPLACE_REVIEWS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/marketplace/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { bundleId, rating, reviewText } = await request.json();

    if (!bundleId || !rating) {
      return NextResponse.json(
        { error: 'Bundle ID and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user purchased the bundle
    const purchase = await prisma.marketplacePurchase.findFirst({
      where: {
        bundleId,
        buyerId: user.id
      }
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'You must purchase the bundle before reviewing' },
        { status: 403 }
      );
    }

    // Create review
    const review = await prisma.marketplaceReview.create({
      data: {
        bundleId,
        userId: user.id,
        rating,
        reviewText
      }
    });

    // Update bundle average rating
    const allReviews = await prisma.marketplaceReview.findMany({
      where: { bundleId }
    });

    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.marketplaceBundle.update({
      where: { id: bundleId },
      data: { averageRating }
    });

    // Update seller badge stats
    const bundle = await prisma.marketplaceBundle.findUnique({
      where: { id: bundleId }
    });

    if (bundle) {
      const sellerReviews = await prisma.marketplaceReview.findMany({
        where: {
          bundle: {
            sellerId: bundle.sellerId
          }
        }
      });

      const sellerAvgRating =
        sellerReviews.reduce((sum, r) => sum + r.rating, 0) /
        sellerReviews.length;

      const badge = await prisma.marketplaceBadge.findUnique({
        where: { userId: bundle.sellerId }
      });

      if (badge) {
        const qualityScore =
          sellerAvgRating * 20 + Math.min(badge.totalSales, 100) * 0.5;

        await prisma.marketplaceBadge.update({
          where: { userId: bundle.sellerId },
          data: {
            averageRating: sellerAvgRating,
            totalReviews: sellerReviews.length,
            qualityScore
          }
        });
      }
    }

    return NextResponse.json(review);
  } catch (error: any) {
    console.error('[MARKETPLACE_REVIEWS_POST]', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'You have already reviewed this bundle' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
