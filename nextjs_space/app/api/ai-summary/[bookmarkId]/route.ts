
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET: Fetch AI summaries for a bookmark
export async function GET(
  req: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookmarkId } = params;

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId: session.user.id },
    });

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    const summaries = await prisma.aISummary.findMany({
      where: {
        bookmarkId,
        userId: session.user.id,
      },
      orderBy: { generatedAt: 'desc' },
    });

    return NextResponse.json(summaries);
  } catch (error) {
    console.error('Error fetching AI summaries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Generate a new AI summary
export async function POST(
  req: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookmarkId } = params;
    const body = await req.json();

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId: session.user.id },
    });

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    // Generate AI summary using LLM API
    const summaryType = body.summaryType || 'TLDR';
    let prompt = '';
    
    switch (summaryType) {
      case 'TLDR':
        prompt = `Please provide a concise TL;DR summary of the content from ${bookmark.url}. Title: ${bookmark.title}. Description: ${bookmark.description || 'N/A'}`;
        break;
      case 'KEY_POINTS':
        prompt = `Extract 5-7 key points from the content at ${bookmark.url}. Title: ${bookmark.title}. Description: ${bookmark.description || 'N/A'}`;
        break;
      case 'ACTION_ITEMS':
        prompt = `Identify action items and takeaways from the content at ${bookmark.url}. Title: ${bookmark.title}. Description: ${bookmark.description || 'N/A'}`;
        break;
      case 'DISCUSSION_QUESTIONS':
        prompt = `Generate 3-5 thought-provoking discussion questions based on the content at ${bookmark.url}. Title: ${bookmark.title}. Description: ${bookmark.description || 'N/A'}`;
        break;
      default:
        prompt = `Provide a comprehensive summary of the content at ${bookmark.url}. Title: ${bookmark.title}. Description: ${bookmark.description || 'N/A'}`;
    }

    // Call LLM API
    const llmResponse = await fetch(`${process.env.ABACUSAI_API_ENDPOINT || 'https://api.abacus.ai'}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that summarizes web content.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const llmData = await llmResponse.json();
    const generatedContent = llmData.choices?.[0]?.message?.content || 'Unable to generate summary.';

    // Parse content based on type
    let keyPoints: string[] = [];
    let actionItems: string[] = [];
    let discussionQuestions: string[] = [];

    if (summaryType === 'KEY_POINTS') {
      keyPoints = generatedContent.split('\n').filter((line: string) => line.trim().length > 0);
    } else if (summaryType === 'ACTION_ITEMS') {
      actionItems = generatedContent.split('\n').filter((line: string) => line.trim().length > 0);
    } else if (summaryType === 'DISCUSSION_QUESTIONS') {
      discussionQuestions = generatedContent.split('\n').filter((line: string) => line.trim().length > 0);
    }

    const summary = await prisma.aISummary.create({
      data: {
        bookmarkId,
        userId: session.user.id,
        summaryType,
        content: generatedContent,
        keyPoints,
        actionItems,
        discussionQuestions,
      },
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
