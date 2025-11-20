
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/marketplace/bundles/[id]/purchase - Purchase a bundle
export async function POST(
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

    const { id: bundleId } = params;
    const { stripePaymentId } = await request.json();

    const bundle = await prisma.marketplaceBundle.findUnique({
      where: { id: bundleId }
    });

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    if (!bundle.isActive) {
      return NextResponse.json({ error: 'Bundle is not available' }, { status: 400 });
    }

    // Check if user already purchased
    const existingPurchase = await prisma.marketplacePurchase.findFirst({
      where: {
        bundleId,
        buyerId: user.id
      }
    });

    if (existingPurchase) {
      return NextResponse.json({ error: 'Already purchased' }, { status: 400 });
    }

    // Create purchase
    const purchase = await prisma.marketplacePurchase.create({
      data: {
        bundleId,
        buyerId: user.id,
        sellerId: bundle.sellerId,
        amount: bundle.price,
        stripePaymentId
      }
    });

    // Update bundle purchase count
    await prisma.marketplaceBundle.update({
      where: { id: bundleId },
      data: { purchaseCount: { increment: 1 } }
    });

    // Update seller badge stats
    const sellerBadge = await prisma.marketplaceBadge.findUnique({
      where: { userId: bundle.sellerId }
    });

    if (sellerBadge) {
      const newTotalSales = sellerBadge.totalSales + 1;
      const newTotalRevenue = sellerBadge.totalRevenue + bundle.price;

      // Calculate quality score (weighted average of ratings and sales)
      const qualityScore = (sellerBadge.averageRating * 20) + (Math.min(newTotalSales, 100) * 0.5);

      // Determine badge level
      let badgeLevel = 'BRONZE';
      if (newTotalSales >= 51 && qualityScore >= 90) badgeLevel = 'DIAMOND';
      else if (newTotalSales >= 31 && qualityScore >= 75) badgeLevel = 'PLATINUM';
      else if (newTotalSales >= 16 && qualityScore >= 60) badgeLevel = 'GOLD';
      else if (newTotalSales >= 6 && qualityScore >= 40) badgeLevel = 'SILVER';

      await prisma.marketplaceBadge.update({
        where: { userId: bundle.sellerId },
        data: {
          totalSales: newTotalSales,
          totalRevenue: newTotalRevenue,
          qualityScore,
          badgeLevel: badgeLevel as any
        }
      });
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('[MARKETPLACE_PURCHASE_POST]', error);
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    );
  }
}
