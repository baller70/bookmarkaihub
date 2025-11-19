const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  try {
    // Get all categories
    const categories = await prisma.category.findMany({
      include: {
        bookmarks: {
          include: {
            bookmark: true
          }
        }
      }
    });
    
    console.log('\n=== CATEGORIES IN DATABASE ===');
    console.log(`Total categories: ${categories.length}\n`);
    
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name}`);
      console.log(`   ID: ${cat.id}`);
      console.log(`   Color: ${cat.color}`);
      console.log(`   Background Color: ${cat.backgroundColor}`);
      console.log(`   Icon: ${cat.icon}`);
      console.log(`   Bookmarks assigned: ${cat.bookmarks.length}`);
      console.log(`   ---`);
    });
    
    // Get all bookmarks with categories
    const bookmarksWithCategories = await prisma.bookmark.findMany({
      where: {
        categories: {
          some: {}
        }
      },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });
    
    console.log('\n=== BOOKMARKS WITH CATEGORIES ===');
    console.log(`Total bookmarks with categories: ${bookmarksWithCategories.length}\n`);
    
    bookmarksWithCategories.slice(0, 5).forEach((bookmark, index) => {
      console.log(`${index + 1}. ${bookmark.title}`);
      bookmark.categories.forEach(bc => {
        console.log(`   Category: ${bc.category.name} (Color: ${bc.category.color})`);
      });
      console.log(`   Total Visits: ${bookmark.totalVisits}`);
      console.log(`   Time Spent: ${bookmark.timeSpent}`);
      console.log(`   ---`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
