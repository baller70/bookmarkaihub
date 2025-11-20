
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/marketplace/profile/seller - Get seller dashboard data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
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

    // Get seller bundles
    const bundles = await prisma.marketplaceBundle.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        _count: {
          select: { items: true, purchases: true, reviews: true }
        }
      }
    });

    // Get seller badge
    const badge = await prisma.marketplaceBadge.findUnique({
      where: { userId: user.id }
    });

    // Get sales statistics
    const sales = await prisma.marketplacePurchase.findMany({
      where: { sellerId: user.id },
      orderBy: { purchasedAt: 'desc' }
    });

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);

    // Get reviews on seller's bundles
    const reviews = await prisma.marketplaceReview.findMany({
      where: {
        bundle: {
          sellerId: user.id
        }
      },
      include: {
        bundle: {
          select: { title: true }
        },
        upvotes: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
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
      user,
      badge,
      bundles,
      sales: {
        total: sales.length,
        totalRevenue,
        recentSales: sales.slice(0, 10)
      },
      reviews: reviewsWithUsers
    });
  } catch (error) {
    console.error('[MARKETPLACE_PROFILE_SELLER_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch seller profile' },
      { status: 500 }
    );
  }
}
