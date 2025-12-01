require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBookmark() {
  try {
    const bookmarkId = 'cmimggdoe0001pc084vpp86vq';
    
    const bookmark = await prisma.bookmark.findUnique({
      where: { id: bookmarkId },
      select: {
        id: true,
        title: true,
        url: true,
        favicon: true
      }
    });
    
    if (!bookmark) {
      console.log('❌ Bookmark not found');
      return;
    }
    
    console.log('\n📚 Bookmark Details:\n');
    console.log(`ID: ${bookmark.id}`);
    console.log(`Title: ${bookmark.title}`);
    console.log(`URL: ${bookmark.url}`);
    console.log(`Favicon: ${bookmark.favicon || 'NULL/EMPTY'}`);
    
    if (!bookmark.favicon) {
      console.log('\n⚠️  WARNING: Favicon is NULL or empty!');
      console.log('This will cause the enhance-logo endpoint to fail.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkBookmark();
