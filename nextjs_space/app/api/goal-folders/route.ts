
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    const folders = await prisma.goalFolder.findMany({
      where: { userId: user.id },
      include: {
        goals: {
          include: {
            bookmarks: {
              include: {
                bookmark: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error('Error fetching goal folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal folders' },
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
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check if goal folder with this name already exists for this user
    const existingFolder = await prisma.goalFolder.findFirst({
      where: {
        userId: user.id,
        name: name.trim(),
      },
    });

    if (existingFolder) {
      return NextResponse.json(
        { error: `A goal folder named "${name}" already exists. Please choose a different name.` },
        { status: 409 }
      );
    }

    const folder = await prisma.goalFolder.create({
      data: {
        name: name.trim(),
        description: description || null,
        color: color || '#3B82F6',
        userId: user.id,
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error('Error creating goal folder:', error);
    return NextResponse.json(
      { error: 'Failed to create goal folder' },
      { status: 500 }
    );
  }
}
