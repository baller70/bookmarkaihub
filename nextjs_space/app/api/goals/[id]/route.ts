
import { NextResponse } from 'next/server';
import { getDevSession } from "@/lib/dev-auth";
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
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

    const goalId = params.id;

    // Verify the goal belongs to the user
    const existingGoal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    if (existingGoal.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      goalType,
      color,
      logo,
      priority,
      status,
      deadline,
      progress,
      tags,
      notes,
      folderId,
      bookmarkIds,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Update the goal
    const goal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        title,
        description: description || null,
        goalType: goalType || 'Custom',
        color: color || '#3b82f6',
        logo: logo !== undefined ? logo : undefined,
        priority: priority || 'MEDIUM',
        status: status || 'NOT_STARTED',
        deadline: deadline ? new Date(deadline) : null,
        progress: progress || 0,
        tags: tags || [],
        notes: notes || null,
        folderId: folderId || null,
      },
    });

    // Update bookmark connections
    if (bookmarkIds !== undefined) {
      // Delete existing connections
      await prisma.goalBookmark.deleteMany({
        where: { goalId: goal.id },
      });

      // Create new connections
      if (bookmarkIds.length > 0) {
        await prisma.goalBookmark.createMany({
          data: bookmarkIds.map((bookmarkId: string) => ({
            goalId: goal.id,
            bookmarkId,
          })),
        });
      }
    }

    // Fetch the complete goal with relations
    const completeGoal = await prisma.goal.findUnique({
      where: { id: goal.id },
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

    return NextResponse.json(completeGoal);
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

    const goalId = params.id;

    // Verify the goal belongs to the user
    const existingGoal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    if (existingGoal.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete bookmark connections first
    await prisma.goalBookmark.deleteMany({
      where: { goalId },
    });

    // Delete the goal
    await prisma.goal.delete({
      where: { id: goalId },
    });

    return NextResponse.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
