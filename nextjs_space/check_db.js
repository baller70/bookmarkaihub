require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const users = await prisma.user.findMany();
    const bookmarks = await prisma.bookmark.findMany();
    const categories = await prisma.category.findMany();
    
    console.log('=== DATABASE STATUS ===');
    console.log(`Users: ${users.length}`);
    console.log(`Bookmarks: ${bookmarks.length}`);
    console.log(`Categories: ${categories.length}`);
    
    if (users.length > 0) {
      console.log('\n=== USERS ===');
      users.forEach(user => {
        console.log(`- ${user.email} (ID: ${user.id})`);
      });
    }
    
    if (bookmarks.length > 0) {
      console.log(`\n=== ALL BOOKMARKS ===`);
      bookmarks.forEach(bookmark => {
        const userEmail = users.find(u => u.id === bookmark.userId)?.email || 'Unknown';
        console.log(`- ${bookmark.title} (User: ${userEmail})`);
      });
    } else {
      console.log('\n⚠️ NO BOOKMARKS FOUND IN DATABASE!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
