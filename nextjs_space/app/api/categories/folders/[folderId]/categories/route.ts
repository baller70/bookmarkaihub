
import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from "@/lib/dev-auth";
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { folderId: string } }
) {
  try {
    const session = await getDevSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const categories = await prisma.category.findMany({
      where: {
        folderId: params.folderId,
        userId: user.id,
      },
      include: {
        _count: {
          select: { bookmarks: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formattedCategories = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      bookmarkCount: category._count.bookmarks,
    }));

    return NextResponse.json({ categories: formattedCategories });
  } catch (error) {
    console.error('Error fetching folder categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
