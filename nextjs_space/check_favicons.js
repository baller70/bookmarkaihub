require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFavicons() {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      select: {
        id: true,
        title: true,
        url: true,
        favicon: true
      },
      take: 5
    });
    
    console.log('\n📚 Sample Bookmarks with Favicons:\n');
    for (const bookmark of bookmarks) {
      console.log(`Title: ${bookmark.title}`);
      console.log(`URL: ${bookmark.url}`);
      console.log(`Favicon: ${bookmark.favicon || 'NULL'}`);
      console.log('---');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFavicons();
