
import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from '@/lib/dev-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// PATCH: Update a highlight
export async function PATCH(
  req: NextRequest,
  { params }: { params: { bookmarkId: string; highlightId: string } }
) {
  try {
    const session = await getDevSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { highlightId } = params;
    const body = await req.json();

    const highlight = await prisma.webHighlight.update({
      where: { id: highlightId },
      data: {
        highlightedText: body.highlightedText,
        context: body.context,
        personalNote: body.personalNote,
        color: body.color,
        tags: body.tags,
        position: body.position,
      },
    });

    return NextResponse.json(highlight);
  } catch (error) {
    console.error('Error updating highlight:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a highlight
export async function DELETE(
  req: NextRequest,
  { params }: { params: { bookmarkId: string; highlightId: string } }
) {
  try {
    const session = await getDevSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { highlightId } = params;

    await prisma.webHighlight.delete({
      where: { id: highlightId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting highlight:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
