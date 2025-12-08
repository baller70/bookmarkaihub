
import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from '@/lib/dev-auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getDevSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all companies owned by the user
    const companies = await prisma.company.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: {
            bookmarks: true,
            categories: true,
            goals: true,
          },
        },
      },
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getDevSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check subscription tier
    if (user.subscriptionTier !== 'ELITE') {
      return NextResponse.json(
        { error: 'Elite subscription required' },
        { status: 403 }
      );
    }

    // Count existing companies
    const existingCount = await prisma.company.count({
      where: { ownerId: user.id },
    });

    // Elite tier allows 5 companies free, then $5/company
    // For now, we'll just check the limit
    const MAX_FREE_COMPANIES = 5;
    if (existingCount >= MAX_FREE_COMPANIES) {
      return NextResponse.json(
        {
          error: 'Company limit reached',
          message: 'Upgrade required for additional companies ($5/company)',
        },
        { status: 402 }
      );
    }

    const { name, description, logo } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    // Check for duplicate name
    const existing = await prisma.company.findUnique({
      where: {
        ownerId_name: {
          ownerId: user.id,
          name: name,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A company with this name already exists' },
        { status: 409 }
      );
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        name,
        description,
        logo,
        ownerId: user.id,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}
