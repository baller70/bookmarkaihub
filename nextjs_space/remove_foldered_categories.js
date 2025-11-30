const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeFolderedCategories() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'khouston@thebasketballfactorynj.com' }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    // Delete categories that are assigned to folders
    const categoriesToDelete = await prisma.category.findMany({
      where: {
        userId: user.id,
        NOT: { folderId: null }
      }
    });
    
    console.log(`Found ${categoriesToDelete.length} categories in folders:`);
    categoriesToDelete.forEach(cat => {
      console.log(`  - ${cat.name}`);
    });
    
    // Delete them
    const result = await prisma.category.deleteMany({
      where: {
        userId: user.id,
        NOT: { folderId: null }
      }
    });
    
    console.log(`\nDeleted ${result.count} categories`);
    
    // Verify remaining categories
    const remaining = await prisma.category.findMany({
      where: { userId: user.id },
      include: {
        _count: { select: { bookmarks: true } }
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`\nRemaining categories (${remaining.length}):`);
    remaining.forEach(cat => {
      console.log(`  ✓ ${cat.name} (${cat._count.bookmarks} bookmarks)`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeFolderedCategories();
