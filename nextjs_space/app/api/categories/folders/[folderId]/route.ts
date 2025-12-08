
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

    const folder = await prisma.categoryFolder.findFirst({
      where: {
        id: params.folderId,
        userId: user.id,
      },
      include: {
        _count: {
          select: { categories: true },
        },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    const formattedFolder = {
      id: folder.id,
      name: folder.name,
      categoryCount: folder._count.categories,
    };

    return NextResponse.json({ folder: formattedFolder });
  } catch (error) {
    console.error('Error fetching folder:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folder' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await request.json();
    const { name } = body;

    const folder = await prisma.categoryFolder.findFirst({
      where: {
        id: params.folderId,
        userId: user.id,
      },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    const updatedFolder = await prisma.categoryFolder.update({
      where: { id: params.folderId },
      data: { name },
    });

    return NextResponse.json({ folder: updatedFolder });
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json(
      { error: 'Failed to update folder' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const folder = await prisma.categoryFolder.findFirst({
      where: {
        id: params.folderId,
        userId: user.id,
      },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Unassign all categories from this folder
    await prisma.category.updateMany({
      where: { folderId: params.folderId },
      data: { folderId: null },
    });

    // Delete the folder
    await prisma.categoryFolder.delete({
      where: { id: params.folderId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
}
