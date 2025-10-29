
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const folder = await prisma.goalFolder.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        goals: {
          include: {
            bookmarks: {
              include: {
                bookmark: {
                  include: {
                    categories: {
                      include: {
                        category: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    return NextResponse.json(folder);
  } catch (error) {
    console.error('Error fetching goal folder:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal folder' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
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
    const { name, description, color } = body;

    const folder = await prisma.goalFolder.updateMany({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
      },
    });

    if (folder.count === 0) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    const updatedFolder = await prisma.goalFolder.findUnique({
      where: { id: params.id },
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error('Error updating goal folder:', error);
    return NextResponse.json(
      { error: 'Failed to update goal folder' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const folder = await prisma.goalFolder.deleteMany({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (folder.count === 0) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete goal folder' },
      { status: 500 }
    );
  }
}
