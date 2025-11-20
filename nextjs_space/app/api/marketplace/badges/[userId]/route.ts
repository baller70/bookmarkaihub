
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/marketplace/badges/[userId] - Get badge info for a user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    let badge = await prisma.marketplaceBadge.findUnique({
      where: { userId }
    });

    // Create badge if doesn't exist
    if (!badge) {
      badge = await prisma.marketplaceBadge.create({
        data: { userId }
      });
    }

    return NextResponse.json(badge);
  } catch (error) {
    console.error('[MARKETPLACE_BADGE_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch badge' },
      { status: 500 }
    );
  }
}
