
import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from '@/lib/dev-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// PATCH: Update a code snippet
export async function PATCH(
  req: NextRequest,
  { params }: { params: { bookmarkId: string; snippetId: string } }
) {
  try {
    const session = await getDevSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { snippetId } = params;
    const body = await req.json();

    const snippet = await prisma.codeSnippet.update({
      where: { id: snippetId },
      data: {
        title: body.title,
        code: body.code,
        language: body.language,
        description: body.description,
        tags: body.tags,
        lineNumber: body.lineNumber,
      },
    });

    return NextResponse.json(snippet);
  } catch (error) {
    console.error('Error updating code snippet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a code snippet
export async function DELETE(
  req: NextRequest,
  { params }: { params: { bookmarkId: string; snippetId: string } }
) {
  try {
    const session = await getDevSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { snippetId } = params;

    await prisma.codeSnippet.delete({
      where: { id: snippetId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting code snippet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
