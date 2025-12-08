
import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from "@/lib/dev-auth";
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
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

    const body = await request.json();
    const { folderId } = body;

    const category = await prisma.category.findFirst({
      where: {
        id: params.categoryId,
        userId: user.id,
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: params.categoryId },
      data: { folderId: folderId || null },
    });

    return NextResponse.json({ category: updatedCategory });
  } catch (error) {
    console.error('Error assigning category:', error);
    return NextResponse.json(
      { error: 'Failed to assign category' },
      { status: 500 }
    );
  }
}
