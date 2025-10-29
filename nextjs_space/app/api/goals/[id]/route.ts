
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

    const goal = await prisma.goal.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        folder: true,
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
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
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
    const {
      title,
      description,
      goalType,
      color,
      priority,
      status,
      deadline,
      progress,
      tags,
      notes,
      folderId,
      bookmarkIds,
    } = body;

    // Update the goal
    await prisma.goal.updateMany({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(goalType && { goalType }),
        ...(color && { color }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(deadline !== undefined && {
          deadline: deadline ? new Date(deadline) : null,
        }),
        ...(progress !== undefined && { progress }),
        ...(tags !== undefined && { tags }),
        ...(notes !== undefined && { notes }),
        ...(folderId !== undefined && { folderId }),
      },
    });

    // Update bookmarks if provided
    if (bookmarkIds !== undefined) {
      // Delete existing connections
      await prisma.goalBookmark.deleteMany({
        where: { goalId: params.id },
      });

      // Create new connections
      if (bookmarkIds.length > 0) {
        await prisma.goalBookmark.createMany({
          data: bookmarkIds.map((bookmarkId: string) => ({
            goalId: params.id,
            bookmarkId,
          })),
        });
      }
    }

    // Fetch the updated goal
    const updatedGoal = await prisma.goal.findUnique({
      where: { id: params.id },
      include: {
        folder: true,
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
    });

    if (!updatedGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { error: 'Failed to update goal' },
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

    const goal = await prisma.goal.deleteMany({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (goal.count === 0) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
