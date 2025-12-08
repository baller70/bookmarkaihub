
import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from "@/lib/dev-auth";
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/marketplace/reviews/[id]/upvote - Upvote a review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getDevSession();
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

    const { id: reviewId } = params;

    const review = await prisma.marketplaceReview.findUnique({
      where: { id: reviewId },
      include: { bundle: true }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Create upvote
    const upvote = await prisma.marketplaceReviewUpvote.create({
      data: {
        reviewId,
        userId: user.id
      }
    });

    // Update seller badge with new upvote count
    const allUpvotes = await prisma.marketplaceReviewUpvote.findMany({
      where: {
        review: {
          bundle: {
            sellerId: review.bundle.sellerId
          }
        }
      }
    });

    const badge = await prisma.marketplaceBadge.findUnique({
      where: { userId: review.bundle.sellerId }
    });

    if (badge) {
      const qualityScore =
        badge.averageRating * 20 +
        Math.min(badge.totalSales, 100) * 0.5 +
        Math.min(allUpvotes.length, 50) * 0.3;

      await prisma.marketplaceBadge.update({
        where: { userId: review.bundle.sellerId },
        data: {
          totalUpvotes: allUpvotes.length,
          qualityScore
        }
      });
    }

    return NextResponse.json(upvote);
  } catch (error: any) {
    console.error('[MARKETPLACE_REVIEW_UPVOTE_POST]', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'You have already upvoted this review' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to upvote review' },
      { status: 500 }
    );
  }
}

// DELETE /api/marketplace/reviews/[id]/upvote - Remove upvote from a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getDevSession();
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

    const { id: reviewId } = params;

    const upvote = await prisma.marketplaceReviewUpvote.findFirst({
      where: {
        reviewId,
        userId: user.id
      },
      include: {
        review: {
          include: { bundle: true }
        }
      }
    });

    if (!upvote) {
      return NextResponse.json({ error: 'Upvote not found' }, { status: 404 });
    }

    await prisma.marketplaceReviewUpvote.delete({
      where: { id: upvote.id }
    });

    // Update seller badge
    const allUpvotes = await prisma.marketplaceReviewUpvote.findMany({
      where: {
        review: {
          bundle: {
            sellerId: upvote.review.bundle.sellerId
          }
        }
      }
    });

    const badge = await prisma.marketplaceBadge.findUnique({
      where: { userId: upvote.review.bundle.sellerId }
    });

    if (badge) {
      const qualityScore =
        badge.averageRating * 20 +
        Math.min(badge.totalSales, 100) * 0.5 +
        Math.min(allUpvotes.length, 50) * 0.3;

      await prisma.marketplaceBadge.update({
        where: { userId: upvote.review.bundle.sellerId },
        data: {
          totalUpvotes: allUpvotes.length,
          qualityScore
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[MARKETPLACE_REVIEW_UPVOTE_DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to remove upvote' },
      { status: 500 }
    );
  }
}
