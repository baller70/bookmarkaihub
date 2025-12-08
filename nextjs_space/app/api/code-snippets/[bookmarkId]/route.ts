
import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from '@/lib/dev-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET: Fetch all code snippets for a bookmark
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

    const snippets = await prisma.codeSnippet.findMany({
      where: {
        bookmarkId,
        userId: session.user.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(snippets);
  } catch (error) {
    console.error('Error fetching code snippets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new code snippet
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

    if (!body.title || !body.code) {
      return NextResponse.json({ error: 'Title and code are required' }, { status: 400 });
    }

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId: session.user.id },
    });

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    const snippet = await prisma.codeSnippet.create({
      data: {
        bookmarkId,
        userId: session.user.id,
        title: body.title,
        code: body.code,
        language: body.language || 'javascript',
        description: body.description,
        tags: body.tags || [],
        lineNumber: body.lineNumber,
      },
    });

    return NextResponse.json(snippet);
  } catch (error) {
    console.error('Error creating code snippet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
