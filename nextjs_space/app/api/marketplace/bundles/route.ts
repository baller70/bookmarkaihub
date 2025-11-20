
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/marketplace/bundles - Get all bundles with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'recent'; // recent, popular, rating, price
    const sellerId = searchParams.get('sellerId');

    const where: any = {
      isActive: true
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'popular') {
      orderBy = { purchaseCount: 'desc' };
    } else if (sortBy === 'rating') {
      orderBy = { averageRating: 'desc' };
    } else if (sortBy === 'price') {
      orderBy = { price: 'asc' };
    }

    const bundles = await prisma.marketplaceBundle.findMany({
      where,
      orderBy,
      include: {
        category: true,
        _count: {
          select: { items: true, purchases: true, reviews: true }
        }
      }
    });

    // Fetch seller info for each bundle
    const bundlesWithSellers = await Promise.all(
      bundles.map(async (bundle) => {
        const seller = await prisma.user.findUnique({
          where: { id: bundle.sellerId },
          select: { id: true, name: true, email: true, image: true }
        });

        const badge = await prisma.marketplaceBadge.findUnique({
          where: { userId: bundle.sellerId },
          select: { badgeLevel: true, qualityScore: true }
        });

        return {
          ...bundle,
          seller,
          badge
        };
      })
    );

    return NextResponse.json(bundlesWithSellers);
  } catch (error) {
    console.error('[MARKETPLACE_BUNDLES_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch bundles' },
      { status: 500 }
    );
  }
}

// POST /api/marketplace/bundles - Create a new bundle
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

    const { title, description, price, categoryId, tags, bookmarkIds, coverImage } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Create bundle
    const bundle = await prisma.marketplaceBundle.create({
      data: {
        title,
        description,
        price: price || 0,
        categoryId,
        tags: tags || [],
        coverImage,
        sellerId: user.id
      }
    });

    // Add bundle items
    if (bookmarkIds && bookmarkIds.length > 0) {
      await Promise.all(
        bookmarkIds.map((bookmarkId: string, index: number) =>
          prisma.marketplaceBundleItem.create({
            data: {
              bundleId: bundle.id,
              bookmarkId,
              order: index
            }
          })
        )
      );
    }

    // Initialize badge if doesn't exist
    await prisma.marketplaceBadge.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {}
    });

    return NextResponse.json(bundle);
  } catch (error) {
    console.error('[MARKETPLACE_BUNDLES_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create bundle' },
      { status: 500 }
    );
  }
}
