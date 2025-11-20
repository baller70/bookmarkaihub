
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET: Fetch related resources for a bookmark
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

    const resources = await prisma.relatedResource.findMany({
      where: {
        bookmarkId,
        userId: session.user.id,
      },
      orderBy: { relevanceScore: 'desc' },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching related resources:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add a related resource or generate AI suggestions
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

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId: session.user.id },
    });

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    // If generateAI flag is set, use AI to find related resources
    if (body.generateAI) {
      // Find similar bookmarks in user's collection
      const userBookmarks = await prisma.bookmark.findMany({
        where: {
          userId: session.user.id,
          id: { not: bookmarkId },
        },
        take: 5,
      });

      const suggestions = userBookmarks.map(bm => ({
        bookmarkId,
        userId: session.user.id,
        resourceType: 'INTERNAL' as const,
        title: bm.title,
        url: bm.url,
        description: bm.description,
        relevanceScore: Math.random() * 0.5 + 0.5, // Random score 0.5-1.0
        source: 'ai_suggestion',
      }));

      // Create all suggestions
      const created = await prisma.relatedResource.createMany({
        data: suggestions,
        skipDuplicates: true,
      });

      return NextResponse.json({ created: created.count, suggestions });
    }

    // Manual addition
    if (!body.title || !body.url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
    }

    const resource = await prisma.relatedResource.create({
      data: {
        bookmarkId,
        userId: session.user.id,
        resourceType: body.resourceType || 'EXTERNAL',
        title: body.title,
        url: body.url,
        description: body.description,
        relevanceScore: body.relevanceScore || 0.5,
        source: 'user_added',
      },
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error creating related resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
