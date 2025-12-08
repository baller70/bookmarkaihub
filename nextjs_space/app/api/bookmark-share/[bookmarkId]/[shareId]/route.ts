
import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from '@/lib/dev-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// PATCH: Update share permissions
export async function PATCH(
  req: NextRequest,
  { params }: { params: { bookmarkId: string; shareId: string } }
) {
  try {
    const session = await getDevSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shareId } = params;
    const body = await req.json();

    const share = await prisma.bookmarkShare.update({
      where: { id: shareId },
      data: {
        permission: body.permission,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });

    return NextResponse.json(share);
  } catch (error) {
    console.error('Error updating share:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a share
export async function DELETE(
  req: NextRequest,
  { params }: { params: { bookmarkId: string; shareId: string } }
) {
  try {
    const session = await getDevSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shareId } = params;

    await prisma.bookmarkShare.delete({
      where: { id: shareId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting share:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
