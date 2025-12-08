
import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from "@/lib/dev-auth";
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/marketplace/categories - Get all marketplace categories
export async function GET() {
  try {
    const categories = await prisma.marketplaceCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { bundles: true }
        }
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('[MARKETPLACE_CATEGORIES_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/marketplace/categories - Create a new category (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getDevSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isAdmin: true }
    });

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description, icon } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await prisma.marketplaceCategory.create({
      data: {
        name,
        description,
        icon: icon || 'folder'
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('[MARKETPLACE_CATEGORIES_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
