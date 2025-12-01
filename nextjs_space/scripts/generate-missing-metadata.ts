import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

// AI-powered description and tags generation
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

    const llmResponse = await fetch(`${process.env.ABACUSAI_API_ENDPOINT || 'https://api.abacus.ai'}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates concise descriptions and relevant tags for bookmarks.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!llmResponse.ok) {
      console.error('AI API error:', await llmResponse.text());
      return { description: '', tags: [] };
    }

    const llmData = await llmResponse.json();
    const content = llmData.choices?.[0]?.message?.content || '';

    // Parse the response
    const descMatch = content.match(/DESCRIPTION:\s*(.+?)(?=\nTAGS:|$)/s);
    const tagsMatch = content.match(/TAGS:\s*(.+?)$/s);

    const description = descMatch?.[1]?.trim() || '';
    const tagsStr = tagsMatch?.[1]?.trim() || '';
    const tags = tagsStr.split(',').map((t: string) => t.trim().toLowerCase()).filter((t: string) => t.length > 0);

    return { description, tags };
  } catch (error) {
    console.error('Error generating metadata with AI:', error);
    return { description: '', tags: [] };
  }
}

async function main() {
  console.log('🤖 Starting AI metadata generation for existing bookmarks...\n');

  // Get all bookmarks without descriptions or with no tags
  const bookmarks = await prisma.bookmark.findMany({
    where: {
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

  console.log(`Found ${bookmarks.length} bookmarks that need metadata.\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const bookmark of bookmarks) {
    try {
      console.log(`Processing: ${bookmark.title}`);
      console.log(`  URL: ${bookmark.url}`);

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
      if (aiMetadata.tags.length > 0) {
        const tagIds = await Promise.all(
          aiMetadata.tags.map(async (tagName: string) => {
            // Check if tag exists for this user
            let tag = await prisma.tag.findFirst({
              where: { 
                name: tagName,
                userId: bookmark.userId 
              }
            });

            // Create if doesn't exist
            if (!tag) {
              tag = await prisma.tag.create({
                data: {
                  name: tagName,
                  userId: bookmark.userId,
                },
              });
            }

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

        console.log(`  ✅ Tags: ${aiMetadata.tags.join(', ')}`);
      }

      successCount++;
      console.log(`  ✅ Success!\n`);

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`  ❌ Error processing ${bookmark.title}:`, error);
      errorCount++;
      console.log('');
    }
  }

  console.log('\n========================================')
  console.log('📊 SUMMARY');
  console.log('========================================')
  console.log(`✅ Successfully processed: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📚 Total bookmarks: ${bookmarks.length}`);
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
