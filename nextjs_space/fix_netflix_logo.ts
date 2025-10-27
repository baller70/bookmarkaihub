import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixNetflixLogo() {
  try {
    // Find Netflix bookmark
    const netflixBookmarks = await prisma.bookmark.findMany({
      where: {
        OR: [
          { url: { contains: 'netflix.com' } },
          { title: { contains: 'Netflix' } }
        ]
      }
    });

    console.log(`Found ${netflixBookmarks.length} Netflix bookmarks`);

    // Update with correct logo
    const correctNetflixLogo = 'https://images.ctfassets.net/4cd45et68cgf/7LrExJ6PAj6MSIPkDyCO86/542b1dfabbf3959908f69be546879952/Netflix-Brand-Logo.png';

    for (const bookmark of netflixBookmarks) {
      await prisma.bookmark.update({
        where: { id: bookmark.id },
        data: {
          favicon: correctNetflixLogo
        }
      });
      console.log(`Updated bookmark ${bookmark.id}: ${bookmark.title}`);
    }

    console.log('✓ Netflix logo fixed successfully!');
  } catch (error) {
    console.error('Error fixing Netflix logo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixNetflixLogo();
