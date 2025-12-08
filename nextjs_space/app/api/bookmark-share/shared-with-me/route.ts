
import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from '@/lib/dev-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET: Fetch all bookmarks shared with the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getDevSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const shares = await prisma.bookmarkShare.findMany({
      where: {
        sharedWithId: session.user.id,
      },
      include: {
        bookmark: {
          select: {
            id: true,
            title: true,
            url: true,
            description: true,
            favicon: true,
            priority: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get owner details
    const ownerIds = shares.map(s => s.ownerId);
    const owners = await prisma.user.findMany({
      where: { id: { in: ownerIds } },
      select: { id: true, name: true, email: true, image: true },
    });

    const sharesWithDetails = shares.map(share => ({
      ...share,
      owner: owners.find(o => o.id === share.ownerId),
    }));

    return NextResponse.json(sharesWithDetails);
  } catch (error) {
    console.error('Error fetching shared bookmarks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
