import { PrismaClient } from '@prisma/client';
import { sendOpenAIRequest } from './lib/openai-client';

const prisma = new PrismaClient();

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

async function main() {
  try {
    console.log('🤖 Starting AI metadata generation for existing bookmarks...\n');

    // Get all bookmarks without descriptions for the user
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: 'cmig31j360000vqyx7xwcfl8f', // khouston@thebasketballfactorynj.com
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

    console.log(`Found ${bookmarks.length} bookmarks that need metadata\n`);

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
            aiMetadata.tags.map(async (tagName) => {
              const tag = await prisma.tag.upsert({
                where: { 
                  userId_name: {
                    userId: bookmark.userId,
                    name: tagName
                  }
                },
                create: {
                  name: tagName,
                  userId: bookmark.userId
                },
                update: {}
              });
              createdTags.push(tagName);
              return tag.id;
            })
          );

          // Link tags to bookmark
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
          tags: createdTags
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        console.error(`  ❌ Error: ${error.message}`);
        results.errors++;
        results.details.push({
          title: bookmark.title,
          error: error.message
        });
      }
    }

    console.log('\n✅ AI METADATA GENERATION COMPLETE!\n');
    console.log(`📊 Results:`);
    console.log(`   • Total bookmarks processed: ${results.total}`);
    console.log(`   • Successfully generated: ${results.success}`);
    console.log(`   • Errors: ${results.errors}`);

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
