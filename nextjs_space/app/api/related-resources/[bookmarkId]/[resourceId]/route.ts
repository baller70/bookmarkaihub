
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// DELETE: Remove a related resource
export async function DELETE(
  req: NextRequest,
  { params }: { params: { bookmarkId: string; resourceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resourceId } = params;

    await prisma.relatedResource.delete({
      where: { id: resourceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting related resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
