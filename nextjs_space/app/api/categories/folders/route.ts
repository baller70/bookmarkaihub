
import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from "@/lib/dev-auth";
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
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

    const folders = await prisma.categoryFolder.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { categories: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedFolders = folders.map((folder: any) => ({
      id: folder.id,
      name: folder.name,
      categoryCount: folder._count.categories,
    }));

    return NextResponse.json({ folders: formattedFolders });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    if (!name) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    // Check if category folder with this name already exists for this user
    const existingFolder = await prisma.categoryFolder.findFirst({
      where: {
        userId: user.id,
        name: name.trim(),
      },
    });

    if (existingFolder) {
      return NextResponse.json(
        { error: `A folder named "${name}" already exists. Please choose a different name.` },
        { status: 409 }
      );
    }

    const folder = await prisma.categoryFolder.create({
      data: {
        name: name.trim(),
        userId: user.id,
      },
    });

    return NextResponse.json({ folder }, { status: 201 });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}
