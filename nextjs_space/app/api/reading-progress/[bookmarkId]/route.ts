
import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from '@/lib/dev-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET: Fetch reading progress for a bookmark
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

    const progress = await prisma.readingProgress.findFirst({
      where: {
        bookmarkId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(progress || null);
  } catch (error) {
    console.error('Error fetching reading progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST/PUT: Update reading progress
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

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId: session.user.id },
    });

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    const progress = await prisma.readingProgress.upsert({
      where: {
        bookmarkId_userId: {
          bookmarkId,
          userId: session.user.id,
        },
      },
      update: {
        scrollPosition: body.scrollPosition,
        currentSection: body.currentSection,
        estimatedTimeLeft: body.estimatedTimeLeft,
        totalSections: body.totalSections,
        completedSections: body.completedSections,
        lastReadAt: new Date(),
      },
      create: {
        bookmarkId,
        userId: session.user.id,
        scrollPosition: body.scrollPosition || 0,
        currentSection: body.currentSection,
        estimatedTimeLeft: body.estimatedTimeLeft || 0,
        totalSections: body.totalSections || 1,
        completedSections: body.completedSections || 0,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating reading progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Reset reading progress
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

    await prisma.readingProgress.deleteMany({
      where: {
        bookmarkId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reading progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
