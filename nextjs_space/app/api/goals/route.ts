
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getActiveCompanyId } from '@/lib/company';

export async function GET() {
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

    // Get active company
    const activeCompanyId = await getActiveCompanyId(user.id);

    const goals = await prisma.goal.findMany({
      where: { 
        userId: user.id,
        ...(activeCompanyId && { companyId: activeCompanyId }),
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Get active company
    const activeCompanyId = await getActiveCompanyId(user.id);

    // Create the goal
    const goal = await prisma.goal.create({
      data: {
        title,
        description: description || null,
        goalType: goalType || 'Custom',
        color: color || '#3b82f6',
        priority: priority || 'MEDIUM',
        status: status || 'NOT_STARTED',
        deadline: deadline ? new Date(deadline) : null,
        progress: progress || 0,
        tags: tags || [],
        notes: notes || null,
        userId: user.id,
        companyId: activeCompanyId,
        folderId: folderId || null,
      },
    });

    // Connect bookmarks if provided
    if (bookmarkIds && bookmarkIds.length > 0) {
      await prisma.goalBookmark.createMany({
        data: bookmarkIds.map((bookmarkId: string) => ({
          goalId: goal.id,
          bookmarkId,
        })),
      });
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

    return NextResponse.json(completeGoal, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}
