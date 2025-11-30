const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategoryFolders() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'khouston@thebasketballfactorynj.com' }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    const categories = await prisma.category.findMany({
      where: { userId: user.id },
      include: {
        folder: true,
        _count: { select: { bookmarks: true } }
      },
      orderBy: { name: 'asc' }
    });
    
    console.log('=== CATEGORIES BY FOLDER STATUS ===\n');
    
    const unassigned = categories.filter(c => !c.folderId);
    const assigned = categories.filter(c => c.folderId);
    
    console.log(`UNASSIGNED CATEGORIES (${unassigned.length}):`);
    unassigned.forEach(cat => {
      console.log(`  ✓ ${cat.name} (${cat._count.bookmarks} bookmarks)`);
    });
    
    console.log(`\nASSIGNED TO FOLDERS (${assigned.length}):`);
    assigned.forEach(cat => {
      console.log(`  ✓ ${cat.name} → Folder: ${cat.folder?.name || 'Unknown'} (${cat._count.bookmarks} bookmarks)`);
    });
    
    // Get all folders
    const folders = await prisma.categoryFolder.findMany({
      where: { userId: user.id },
      include: {
        _count: { select: { categories: true } }
      }
    });
    
    console.log(`\n=== CATEGORY FOLDERS (${folders.length}) ===`);
    folders.forEach(folder => {
      console.log(`  📁 ${folder.name} (${folder._count.categories} categories)`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategoryFolders();
