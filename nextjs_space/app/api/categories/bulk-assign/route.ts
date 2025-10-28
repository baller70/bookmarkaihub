
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { categoryIds, folderId } = body;

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: 'Category IDs must be an array' },
        { status: 400 }
      );
    }

    await prisma.category.updateMany({
      where: {
        id: { in: categoryIds },
        userId: user.id,
      },
      data: {
        folderId: folderId || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error bulk assigning categories:', error);
    return NextResponse.json(
      { error: 'Failed to assign categories' },
      { status: 500 }
    );
  }
}
