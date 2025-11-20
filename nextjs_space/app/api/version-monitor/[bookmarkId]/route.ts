
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createHash } from 'crypto';

// GET: Fetch version snapshots for a bookmark
export async function GET(
  req: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
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

    const snapshots = await prisma.versionSnapshot.findMany({
      where: {
        bookmarkId,
        userId: session.user.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // Limit to last 20 snapshots
    });

    return NextResponse.json(snapshots);
  } catch (error) {
    console.error('Error fetching version snapshots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new version snapshot
export async function POST(
  req: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookmarkId } = params;
    const body = await req.json();

    if (!body.content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId: session.user.id },
    });

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    // Generate content hash
    const contentHash = createHash('md5').update(body.content).digest('hex');

    // Check if this content already exists
    const existingSnapshot = await prisma.versionSnapshot.findFirst({
      where: {
        bookmarkId,
        userId: session.user.id,
        contentHash,
      },
    });

    if (existingSnapshot) {
      return NextResponse.json({ message: 'No changes detected', snapshot: existingSnapshot });
    }

    // Get the last snapshot for comparison
    const lastSnapshot = await prisma.versionSnapshot.findFirst({
      where: {
        bookmarkId,
        userId: session.user.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    let diffSize = 0;
    let majorChange = false;
    let changesSummary = '';

    if (lastSnapshot) {
      diffSize = Math.abs(body.content.length - lastSnapshot.snapshotContent.length);
      majorChange = diffSize > 1000; // Consider major if more than 1000 characters changed
      changesSummary = `Content size changed by ${diffSize} characters`;
    } else {
      changesSummary = 'Initial snapshot';
    }

    const snapshot = await prisma.versionSnapshot.create({
      data: {
        bookmarkId,
        userId: session.user.id,
        snapshotContent: body.content,
        contentHash,
        changesSummary,
        majorChange,
        diffSize,
      },
    });

    return NextResponse.json(snapshot);
  } catch (error) {
    console.error('Error creating version snapshot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
