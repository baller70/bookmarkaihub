
import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from "@/lib/dev-auth";
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/marketplace/profile/buyer - Get buyer dashboard data
export async function GET() {
  try {
    const session = await getDevSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, image: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get purchases
    const purchases = await prisma.marketplacePurchase.findMany({
      where: { buyerId: user.id },
      orderBy: { purchasedAt: 'desc' },
      include: {
        bundle: {
          include: {
            category: true,
            items: true,
            _count: {
              select: { reviews: true }
            }
          }
        }
      }
    });

    // Get bundles with items
    const purchasesWithBookmarks = await Promise.all(
      purchases.map(async (purchase) => {
        const items = await Promise.all(
          purchase.bundle.items.map(async (item) => {
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

        return {
          ...purchase,
          bundle: {
            ...purchase.bundle,
            items
          }
        };
      })
    );

    // Get reviews written by buyer
    const reviews = await prisma.marketplaceReview.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        bundle: {
          select: { id: true, title: true, coverImage: true }
        },
        upvotes: true
      }
    });

    const totalSpent = purchases.reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      user,
      purchases: purchasesWithBookmarks,
      reviews: reviews.map((r) => ({
        ...r,
        upvoteCount: r.upvotes.length
      })),
      stats: {
        totalPurchases: purchases.length,
        totalSpent,
        totalReviews: reviews.length
      }
    });
  } catch (error) {
    console.error('[MARKETPLACE_PROFILE_BUYER_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch buyer profile' },
      { status: 500 }
    );
  }
}
