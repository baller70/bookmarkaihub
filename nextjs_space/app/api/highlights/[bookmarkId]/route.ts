
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET: Fetch all highlights for a bookmark
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

    const highlights = await prisma.webHighlight.findMany({
      where: {
        bookmarkId,
        userId: session.user.id,
      },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json(highlights);
  } catch (error) {
    console.error('Error fetching highlights:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new highlight
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

    if (!body.highlightedText) {
      return NextResponse.json({ error: 'Highlighted text is required' }, { status: 400 });
    }

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId: session.user.id },
    });

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    const highlight = await prisma.webHighlight.create({
      data: {
        bookmarkId,
        userId: session.user.id,
        highlightedText: body.highlightedText,
        context: body.context,
        personalNote: body.personalNote,
        color: body.color || '#FCD34D',
        tags: body.tags || [],
        position: body.position,
      },
    });

    return NextResponse.json(highlight);
  } catch (error) {
    console.error('Error creating highlight:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
