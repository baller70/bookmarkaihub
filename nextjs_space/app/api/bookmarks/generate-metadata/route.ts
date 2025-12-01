export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendOpenAIRequest } from "@/lib/openai-client";

// AI-powered description and tags generation using OpenAI
async function generateMetadataWithAI(title: string, url: string) {
  try {
    const prompt = `Given this bookmark:
Title: ${title}
URL: ${url}

Generate:
1. A concise 1-2 sentence description (max 150 characters)
2. 3-5 relevant tags (comma-separated, lowercase, single words or short phrases)

Format your response EXACTLY like this:
DESCRIPTION: [your description here]
TAGS: tag1, tag2, tag3, tag4, tag5`;

    const content = await sendOpenAIRequest(prompt, {
      maxTokens: 200,
      temperature: 0.7,
    });

    // Parse the response
    const descMatch = content.match(/DESCRIPTION:\s*(.+?)(?=\nTAGS:|$)/s);
    const tagsMatch = content.match(/TAGS:\s*(.+?)$/s);

    const description = descMatch?.[1]?.trim() || '';
    const tagsStr = tagsMatch?.[1]?.trim() || '';
    const tags = tagsStr.split(',').map((t: string) => t.trim().toLowerCase()).filter((t: string) => t.length > 0);

    return { description, tags };
  } catch (error) {
    console.error('Error generating metadata with OpenAI:', error);
    return { description: '', tags: [] };
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('🤖 Starting AI metadata generation for existing bookmarks...');

    // Get all bookmarks without descriptions
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { description: { equals: '' } },
          { description: null },
        ]
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    console.log(`Found ${bookmarks.length} bookmarks that need metadata`);

    const results = {
      total: bookmarks.length,
      success: 0,
      errors: 0,
      details: [] as any[]
    };

    for (const bookmark of bookmarks) {
      try {
        console.log(`Processing: ${bookmark.title}`);

        // Generate AI metadata
        const aiMetadata = await generateMetadataWithAI(bookmark.title, bookmark.url);

        // Update description if generated
        if (aiMetadata.description) {
          await prisma.bookmark.update({
            where: { id: bookmark.id },
            data: { description: aiMetadata.description }
          });
          console.log(`  ✅ Description: ${aiMetadata.description}`);
        }

        // Create/find tags if generated
        const createdTags: string[] = [];
        if (aiMetadata.tags.length > 0) {
          const tagIds = await Promise.all(
            aiMetadata.tags.map(async (tagName: string) => {
              // Check if tag exists for this user
              let tag = await prisma.tag.findFirst({
                where: { 
                  name: tagName,
                  userId: session.user.id 
                }
              });

              // Create if doesn't exist
              if (!tag) {
                tag = await prisma.tag.create({
                  data: {
                    name: tagName,
                    userId: session.user.id,
                  },
                });
              }

              createdTags.push(tagName);
              return tag.id;
            })
          );

          // Create bookmark-tag relationships
          for (const tagId of tagIds) {
            await prisma.bookmarkTag.upsert({
              where: {
                bookmarkId_tagId: {
                  bookmarkId: bookmark.id,
                  tagId: tagId
                }
              },
              create: {
                bookmarkId: bookmark.id,
                tagId: tagId
              },
              update: {}
            });
          }

          console.log(`  ✅ Tags: ${createdTags.join(', ')}`);
        }

        results.success++;
        results.details.push({
          title: bookmark.title,
          description: aiMetadata.description,
          tags: createdTags,
          status: 'success'
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`  ❌ Error processing ${bookmark.title}:`, error);
        results.errors++;
        results.details.push({
          title: bookmark.title,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('\n========================================')
    console.log('📊 SUMMARY');
    console.log('========================================')
    console.log(`✅ Successfully processed: ${results.success}`);
    console.log(`❌ Errors: ${results.errors}`);
    console.log(`📚 Total bookmarks: ${results.total}`);
    console.log('========================================\n');

    return NextResponse.json(results);

  } catch (error) {
    console.error("Error generating metadata:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
