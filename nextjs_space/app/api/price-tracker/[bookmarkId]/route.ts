
import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from '@/lib/dev-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET: Fetch price tracker for a bookmark
export async function GET(
  req: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getDevSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookmarkId } = params;

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId: session.user.id },
    });

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    const tracker = await prisma.priceTracker.findFirst({
      where: {
        bookmarkId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(tracker || null);
  } catch (error) {
    console.error('Error fetching price tracker:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create or update price tracker
export async function POST(
  req: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getDevSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookmarkId } = params;
    const body = await req.json();

    if (typeof body.currentPrice !== 'number') {
      return NextResponse.json({ error: 'Current price is required' }, { status: 400 });
    }

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId: session.user.id },
    });

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    // Get existing tracker if any
    const existingTracker = await prisma.priceTracker.findFirst({
      where: {
        bookmarkId,
        userId: session.user.id,
      },
    });

    let priceHistory = existingTracker?.priceHistory as any[] || [];
    
    // Add current price to history
    priceHistory.push({
      date: new Date().toISOString(),
      price: body.currentPrice,
    });

    // Keep only last 30 entries
    if (priceHistory.length > 30) {
      priceHistory = priceHistory.slice(-30);
    }

    const prices = priceHistory.map((entry: any) => entry.price);
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);

    const tracker = await prisma.priceTracker.upsert({
      where: {
        bookmarkId_userId: {
          bookmarkId,
          userId: session.user.id,
        },
      },
      update: {
        currentPrice: body.currentPrice,
        availability: body.availability || 'IN_STOCK',
        priceHistory,
        lowestPrice,
        highestPrice,
        alertOnDrop: body.alertOnDrop ?? true,
        alertThreshold: body.alertThreshold,
        lastChecked: new Date(),
      },
      create: {
        bookmarkId,
        userId: session.user.id,
        currentPrice: body.currentPrice,
        originalPrice: body.currentPrice,
        currency: body.currency || 'USD',
        availability: body.availability || 'IN_STOCK',
        priceHistory,
        lowestPrice: body.currentPrice,
        highestPrice: body.currentPrice,
        alertOnDrop: body.alertOnDrop ?? true,
        alertThreshold: body.alertThreshold,
      },
    });

    return NextResponse.json(tracker);
  } catch (error) {
    console.error('Error updating price tracker:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove price tracker
export async function DELETE(
  req: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getDevSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookmarkId } = params;

    await prisma.priceTracker.deleteMany({
      where: {
        bookmarkId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting price tracker:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
