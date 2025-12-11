import { NextResponse } from 'next/server';
import { getDevSession } from '@/lib/dev-auth';
import { prisma } from '@/lib/db';

// GET - Fetch user's Goals view logo
export async function GET() {
  try {
    const session = await getDevSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { goalsViewLogo: true },
    });

    return NextResponse.json({ goalsViewLogo: user?.goalsViewLogo || null });
  } catch (error) {
    console.error('Error fetching goals logo:', error);
    return NextResponse.json({ error: 'Failed to fetch goals logo' }, { status: 500 });
  }
}

// PUT - Update user's Goals view logo
export async function PUT(request: Request) {
  try {
    const session = await getDevSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { goalsViewLogo } = body;

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { goalsViewLogo },
      select: { goalsViewLogo: true },
    });

    return NextResponse.json({ goalsViewLogo: user.goalsViewLogo });
  } catch (error) {
    console.error('Error updating goals logo:', error);
    return NextResponse.json({ error: 'Failed to update goals logo' }, { status: 500 });
  }
}

// DELETE - Remove user's Goals view logo
export async function DELETE() {
  try {
    const session = await getDevSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { goalsViewLogo: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goals logo:', error);
    return NextResponse.json({ error: 'Failed to delete goals logo' }, { status: 500 });
  }
}

