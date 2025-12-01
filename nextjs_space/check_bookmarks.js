const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBookmarks() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });
    
    console.log('📋 Users in database:');
    users.forEach(u => console.log(`   • ${u.email} (${u.name}) - ID: ${u.id}`));
    console.log('');
    
    // Get all bookmarks
    const bookmarks = await prisma.bookmark.findMany({
      include: {
        user: { select: { email: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    console.log(`📚 Found ${bookmarks.length} bookmarks (showing last 20):\n`);
    
    bookmarks.forEach((bm, idx) => {
      console.log(`${idx + 1}. ${bm.title}`);
      console.log(`   URL: ${bm.url}`);
      console.log(`   User: ${bm.user.email}`);
      console.log(`   Description: ${bm.description || '❌ NO DESCRIPTION'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBookmarks();
