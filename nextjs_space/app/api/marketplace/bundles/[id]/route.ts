
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/marketplace/bundles/[id] - Get bundle by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const bundle = await prisma.marketplaceBundle.findUnique({
      where: { id },
      include: {
        category: true,
        items: {
          orderBy: { order: 'asc' }
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            upvotes: true
          }
        },
        _count: {
          select: { purchases: true }
        }
      }
    });

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.marketplaceBundle.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    // Fetch seller info
    const seller = await prisma.user.findUnique({
      where: { id: bundle.sellerId },
      select: { id: true, name: true, email: true, image: true }
    });

    // Fetch seller badge
    const badge = await prisma.marketplaceBadge.findUnique({
      where: { userId: bundle.sellerId },
      select: { badgeLevel: true, qualityScore: true, totalSales: true }
    });

    // Fetch bookmarks for items
    const itemsWithBookmarks = await Promise.all(
      bundle.items.map(async (item) => {
        const bookmark = await prisma.bookmark.findUnique({
          where: { id: item.bookmarkId },
          select: {
            id: true,
            title: true,
            url: true,
            description: true,
            favicon: true
          }
        });
        return { ...item, bookmark };
      })
    );

    // Fetch user info for reviews
    const reviewsWithUsers = await Promise.all(
      bundle.reviews.map(async (review) => {
        const reviewUser = await prisma.user.findUnique({
          where: { id: review.userId },
          select: { id: true, name: true, image: true }
        });
        return {
          ...review,
          user: reviewUser,
          upvoteCount: review.upvotes.length
        };
      })
    );

    return NextResponse.json({
      ...bundle,
      seller,
      badge,
      items: itemsWithBookmarks,
      reviews: reviewsWithUsers
    });
  } catch (error) {
    console.error('[MARKETPLACE_BUNDLE_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch bundle' },
      { status: 500 }
    );
  }
}

// PATCH /api/marketplace/bundles/[id] - Update bundle
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const bundle = await prisma.marketplaceBundle.findUnique({
      where: { id }
    });

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    if (bundle.sellerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, description, price, categoryId, tags, coverImage, isActive } = await request.json();

    const updatedBundle = await prisma.marketplaceBundle.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price !== undefined && { price }),
        ...(categoryId !== undefined && { categoryId }),
        ...(tags && { tags }),
        ...(coverImage && { coverImage }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json(updatedBundle);
  } catch (error) {
    console.error('[MARKETPLACE_BUNDLE_PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update bundle' },
      { status: 500 }
    );
  }
}

// DELETE /api/marketplace/bundles/[id] - Delete bundle
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const bundle = await prisma.marketplaceBundle.findUnique({
      where: { id }
    });

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    if (bundle.sellerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.marketplaceBundle.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[MARKETPLACE_BUNDLE_DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to delete bundle' },
      { status: 500 }
    );
  }
}
