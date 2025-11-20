
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET: Fetch all shares for a bookmark (owner view)
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

    const shares = await prisma.bookmarkShare.findMany({
      where: {
        bookmarkId,
        ownerId: session.user.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get user details for sharedWith
    const userIds = shares.map(s => s.sharedWithId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, image: true },
    });

    const sharesWithUsers = shares.map(share => ({
      ...share,
      sharedWith: users.find(u => u.id === share.sharedWithId),
    }));

    return NextResponse.json(sharesWithUsers);
  } catch (error) {
    console.error('Error fetching bookmark shares:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Share a bookmark with another user
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

    if (!body.sharedWithEmail) {
      return NextResponse.json({ error: 'Shared with email is required' }, { status: 400 });
    }

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId: session.user.id },
    });

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    // Find the user to share with
    const sharedWithUser = await prisma.user.findUnique({
      where: { email: body.sharedWithEmail },
    });

    if (!sharedWithUser) {
      return NextResponse.json({ error: 'User not found with that email' }, { status: 404 });
    }

    if (sharedWithUser.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot share with yourself' }, { status: 400 });
    }

    // Check if already shared
    const existingShare = await prisma.bookmarkShare.findUnique({
      where: {
        bookmarkId_sharedWithId: {
          bookmarkId,
          sharedWithId: sharedWithUser.id,
        },
      },
    });

    if (existingShare) {
      return NextResponse.json({ error: 'Already shared with this user' }, { status: 409 });
    }

    const share = await prisma.bookmarkShare.create({
      data: {
        bookmarkId,
        ownerId: session.user.id,
        sharedWithId: sharedWithUser.id,
        permission: body.permission || 'VIEW',
        message: body.message,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });

    return NextResponse.json({
      ...share,
      sharedWith: {
        id: sharedWithUser.id,
        name: sharedWithUser.name,
        email: sharedWithUser.email,
        image: sharedWithUser.image,
      },
    });
  } catch (error) {
    console.error('Error sharing bookmark:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
