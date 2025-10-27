
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Extract main title by removing taglines and suffixes
 */
function extractMainTitle(fullTitle: string): string {
  if (!fullTitle) return '';
  
  // Remove common separators and everything after them
  const separators = [' - ', ' | ', ' :: ', ': ', ' — ', ' – ', ' / '];
  
  let cleanTitle = fullTitle.trim();
  
  for (const separator of separators) {
    const index = cleanTitle.indexOf(separator);
    if (index > 0) {
      cleanTitle = cleanTitle.substring(0, index).trim();
      break;
    }
  }
  
  // Remove domain suffix if present (e.g., "Amazon.com" -> "Amazon")
  cleanTitle = cleanTitle.replace(/\.(com|net|org|io|co)$/i, '');
  
  return cleanTitle;
}

async function cleanBookmarkTitles() {
  try {
    console.log('🔄 Fetching all bookmarks...');
    const bookmarks = await prisma.bookmark.findMany({
      select: {
        id: true,
        title: true,
      },
    });

    console.log(`📚 Found ${bookmarks.length} bookmarks`);

    let updatedCount = 0;

    for (const bookmark of bookmarks) {
      const cleanTitle = extractMainTitle(bookmark.title);
      
      if (cleanTitle !== bookmark.title) {
        console.log(`✏️  Updating: "${bookmark.title}" -> "${cleanTitle}"`);
        
        await prisma.bookmark.update({
          where: { id: bookmark.id },
          data: { title: cleanTitle },
        });
        
        updatedCount++;
      }
    }

    console.log(`✅ Updated ${updatedCount} bookmark titles`);
    console.log('🎉 Done!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanBookmarkTitles();
