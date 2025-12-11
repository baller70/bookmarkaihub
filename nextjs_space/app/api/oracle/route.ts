import { NextRequest, NextResponse } from 'next/server'
import { getDevSession } from '@/lib/dev-auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

// Oracle's knowledge base about the app
const APP_KNOWLEDGE = `
You are "The Oracle" - the intelligent AI assistant for BookmarkHub. You have complete knowledge of the application and help users navigate, organize, and optimize their bookmark management experience.

## Your Personality
- Friendly, wise, and encouraging
- Explain concepts simply, as if talking to a 10-year-old
- Use step-by-step instructions for "how to" questions
- Be concise but thorough
- Use emojis sparingly for warmth
- Format responses with clear structure (bullet points, numbered steps)

## BookmarkHub Features You Know:

### Dashboard & Views
- Grid View: Card-based display with thumbnails and metadata
- Compact View: Condensed cards for quick scanning
- List View: Traditional list with key details
- Timeline View: Chronological bookmark history
- Hierarchy View: Nested folder structure
- Folders View: Organize bookmarks in folders
- Goals View: Track bookmark-related goals
- Kanban View: Board-style organization

### Bookmark Properties
- Title, URL, Description
- Tags (multiple per bookmark)
- Categories (with colors)
- Priority levels: Low, Medium, High, Urgent
- Ratings (1-5 stars)
- Favicon/Logo
- Custom images

### Tracking Features
- Visit Count: How many times you've opened a bookmark
- Time Spent: Duration spent on bookmarked pages
- Fitness Rings: Visual engagement indicators (visits, tasks, time)
- Engagement Score: Combined activity metric

### Task Management
- Open Tasks: Pending items attached to bookmarks
- Completed Tasks: Finished items
- Task Progress: Visual progress indicators

### Organization Tools
- Categories: Color-coded groups
- Tags: Flexible labels
- Folders: Nested organization
- Bulk Select: Multi-bookmark operations
- Drag & Drop: Reorder and organize

### AI Features (AI LinkPilot)
- Auto-Tagging: AI-generated tags
- Smart Categorization: Automatic category suggestions
- Content Discovery: Recommendations based on interests
- Link Finder: Find related content
- Link Validator: Check for broken links
- Bulk Uploader: Import many bookmarks at once

### Time Capsule
- Snapshots: Save point-in-time states
- Compare: See changes over time
- Restore: Revert to previous states
- Schedule: Automatic snapshots

### DNA Profile
- About You: Personal interests and preferences
- Favorites: Most-loved bookmarks
- Search History: Past searches
- Playbooks: Curated bookmark collections

### Marketplace
- Buy/Sell Playbooks: Curated bookmark collections
- Seller Badges: Trust indicators
- Categories: Browse by topic

### Settings
- Appearance: Theme, colors, fonts
- Notifications: Alerts and digests
- Privacy & Security: Password, 2FA
- Billing: Subscription management

## How to Help Users
1. Answer questions about any feature
2. Provide step-by-step instructions
3. Suggest organization strategies
4. Help troubleshoot issues
5. Recommend features they might not know about
6. Guide through complex workflows
`

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getDevSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, conversationHistory = [], context } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Fetch user's bookmark data for context
    const [bookmarks, categories, tags] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          title: true,
          url: true,
          description: true,
          priority: true,
          totalVisits: true,
          tags: true,
          category: { select: { name: true, color: true } },
          _count: { select: { tasks: true } }
        },
        take: 100,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.category.findMany({
        where: { userId: session.user.id },
        select: { name: true, color: true, _count: { select: { bookmarks: true } } }
      }),
      prisma.bookmark.findMany({
        where: { userId: session.user.id },
        select: { tags: true }
      })
    ])

    // Extract unique tags
    const allTags = [...new Set(tags.flatMap(b => b.tags))]

    // Build context about user's data
    const userDataContext = `
## User's Current Data:
- Total Bookmarks: ${bookmarks.length}
- Categories: ${categories.map(c => `${c.name} (${c._count.bookmarks} bookmarks)`).join(', ') || 'None'}
- Tags used: ${allTags.slice(0, 20).join(', ') || 'None'}
- Recent bookmarks: ${bookmarks.slice(0, 5).map(b => b.title).join(', ')}
- Priority distribution: ${['URGENT', 'HIGH', 'MEDIUM', 'LOW'].map(p => 
    `${p}: ${bookmarks.filter(b => b.priority === p).length}`
  ).join(', ')}

## Current Context:
${context?.currentPage ? `- Current page: ${context.currentPage}` : ''}
${context?.selectedBookmark ? `- Selected bookmark: ${context.selectedBookmark}` : ''}
${context?.searchQuery ? `- Active search: "${context.searchQuery}"` : ''}
`

    // Build messages for AI
    const messages: Message[] = [
      { role: 'system', content: APP_KNOWLEDGE + userDataContext },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ]

    // Generate response (simulated AI for now - can be replaced with actual AI API)
    const response = await generateOracleResponse(message, messages, bookmarks, categories, allTags)

    return NextResponse.json({
      response,
      context: {
        bookmarkCount: bookmarks.length,
        categoryCount: categories.length,
        tagCount: allTags.length
      }
    })
  } catch (error) {
    console.error('Oracle API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}

async function generateOracleResponse(
  message: string,
  _messages: Message[],
  bookmarks: any[],
  categories: any[],
  tags: string[]
): Promise<string> {
  const lowerMessage = message.toLowerCase()

  // Greeting responses
  if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
    return `Hello! 👋 I'm The Oracle, your personal guide to BookmarkHub. I can help you:

• **Navigate** any feature in the app
• **Organize** your ${bookmarks.length} bookmarks efficiently
• **Discover** features you might not know about
• **Troubleshoot** any issues you're facing

What would you like to explore today?`
  }

  // Help/What can you do
  if (lowerMessage.match(/what can you do|help me|how can you help/)) {
    return `Great question! Here's how I can assist you:

**📚 Bookmark Management**
- Help organize your ${bookmarks.length} bookmarks
- Suggest tags and categories
- Find specific bookmarks quickly

**🎯 Feature Guidance**
- Explain how any feature works
- Walk you through step-by-step processes
- Show you hidden gems in the app

**📊 Insights**
- Analyze your bookmark patterns
- Suggest organization improvements
- Track your engagement stats

**🔧 Troubleshooting**
- Fix common issues
- Answer "how do I..." questions
- Guide you through settings

Just ask me anything! For example:
- "How do I create a new category?"
- "What are fitness rings?"
- "Help me organize my bookmarks"`
  }

  // How to create category
  if (lowerMessage.match(/create.*category|new category|add category/)) {
    return `Here's how to create a new category:

**Quick Method:**
1. Go to the **Dashboard**
2. Click the **Breakdown** button to see categories
3. Look for the **"+ Add Category"** option

**From Categories Page:**
1. Click **Categories** in the sidebar
2. Click the **"New Category"** button
3. Enter a name and pick a color
4. Click **Save**

**Pro Tip:** You can also create categories while editing a bookmark - just type a new category name!

You currently have ${categories.length} categories: ${categories.map(c => c.name).join(', ') || 'none yet'}.`
  }

  // How to add tags
  if (lowerMessage.match(/add.*tag|create.*tag|tagging/)) {
    return `Adding tags is super easy! Here's how:

**While Editing a Bookmark:**
1. Open any bookmark's edit modal
2. Find the **Tags** field
3. Type a tag name and press **Enter**
4. Add as many tags as you want

**Bulk Tagging:**
1. Enable **Bulk Select** mode
2. Select multiple bookmarks
3. Use the bulk actions menu to add tags

**AI Auto-Tagging:**
1. Go to **AI LinkPilot**
2. Enable **Auto-Tagging** in settings
3. New bookmarks get tagged automatically!

You're currently using ${tags.length} unique tags. Most popular: ${tags.slice(0, 5).join(', ') || 'none yet'}.`
  }

  // What are fitness rings
  if (lowerMessage.match(/fitness ring|rings|engagement/)) {
    return `**Fitness Rings** are visual indicators that show how engaged you are with each bookmark:

**🔴 Red Ring - Visits**
Shows how often you've opened this bookmark. More visits = fuller ring.

**🟢 Green Ring - Tasks**
Tracks completed tasks related to this bookmark. Complete tasks to fill it!

**🔵 Blue Ring - Time**
Measures time spent on the bookmarked page. More time = more progress.

**Why They Matter:**
- Quickly see which bookmarks you actually use
- Identify forgotten bookmarks (empty rings)
- Gamify your browsing habits

**Where to Find Them:**
Look at any bookmark card - the rings appear on the right side!

Want me to explain how to improve your engagement scores?`
  }

  // Views explanation
  if (lowerMessage.match(/views|layouts|display options/)) {
    return `BookmarkHub has **8 different views** to display your bookmarks:

**📱 Grid View** - Card-based layout with thumbnails
**📋 Compact View** - Smaller cards, see more at once
**📝 List View** - Traditional list format
**📅 Timeline View** - Chronological order by date
**🌳 Hierarchy View** - Nested folder structure
**📁 Folders View** - Organize in folders
**🎯 Goals View** - Track bookmark goals
**📊 Kanban View** - Board-style columns

**To Switch Views:**
Look for the view toggle bar below the search - it shows all available options as icons.

**Pro Tip:** Different views work better for different tasks:
- Use **Compact** for quick scanning
- Use **Kanban** for workflow organization
- Use **Timeline** to see recent additions

Which view would you like to learn more about?`
  }

  // Time Capsule
  if (lowerMessage.match(/time capsule|snapshot|backup|restore/)) {
    return `**Time Capsule** is like a time machine for your bookmarks! 🕐

**What It Does:**
- Creates snapshots of your entire bookmark collection
- Lets you compare different points in time
- Restore previous states if needed

**How to Use:**
1. Go to the **Time Capsule** page (sidebar)
2. Click **"Create Snapshot"** to save current state
3. Add a title and description
4. Your collection is now preserved!

**Cool Features:**
- **Compare** two snapshots to see what changed
- **Schedule** automatic snapshots (daily/weekly)
- **Export** snapshots for safekeeping

**When to Use:**
- Before major reorganization
- Weekly backups
- Before deleting lots of bookmarks

Would you like me to help you create your first snapshot?`
  }

  // AI LinkPilot
  if (lowerMessage.match(/ai linkpilot|auto process|smart|ai features/)) {
    return `**AI LinkPilot** is your intelligent bookmark assistant! 🤖

**Auto-Processing Features:**
- **Auto-Tagging**: AI suggests tags for new bookmarks
- **Auto-Categorization**: Smart category suggestions
- **Duplicate Detection**: Find and manage duplicates
- **Broken Link Detection**: Identify dead links

**Content Discovery:**
- **Recommendations**: Find new content you'll love
- **Link Finder**: Search for related bookmarks
- **Trending**: See popular links in your interests

**Bulk Operations:**
- **Bulk Uploader**: Import many bookmarks at once
- **Link Validator**: Check all links for issues

**How to Access:**
Click **AI LinkPilot** in the sidebar to explore all features!

Want me to explain any specific AI feature in detail?`
  }

  // Search tips
  if (lowerMessage.match(/search|find|filter/)) {
    return `Here are **power tips** for finding bookmarks:

**Basic Search:**
- Use the search bar on the Dashboard
- Searches titles, URLs, and descriptions
- Results update as you type

**Advanced Filtering:**
1. **By Category**: Click the category dropdown
2. **By Priority**: Filter urgent/high/medium/low
3. **By Tags**: Click tag pills to filter

**Pro Search Tips:**
- Search by domain: "github.com"
- Search by tag: include tag name
- Use the Breakdown panel for category quick-filters

**Can't Find Something?**
- Check if it's in a specific folder
- Look in Timeline view for recent additions
- Use Bulk Select to scan through all

You have ${bookmarks.length} bookmarks. Try searching for: "${bookmarks[0]?.title?.split(' ')[0] || 'your topic'}"`
  }

  // Stats/Analytics
  if (lowerMessage.match(/stats|analytics|how many|count/)) {
    const totalVisits = bookmarks.reduce((sum, b) => sum + (b.totalVisits || 0), 0)
    const withTasks = bookmarks.filter(b => b._count?.tasks > 0).length
    
    return `📊 **Your BookmarkHub Stats:**

**Collection Overview:**
- Total Bookmarks: **${bookmarks.length}**
- Categories: **${categories.length}**
- Unique Tags: **${tags.length}**

**Engagement:**
- Total Visits: **${totalVisits}**
- Bookmarks with Tasks: **${withTasks}**

**Priority Breakdown:**
${['URGENT', 'HIGH', 'MEDIUM', 'LOW'].map(p => {
  const count = bookmarks.filter(b => b.priority === p).length
  return `- ${p}: ${count} bookmarks`
}).join('\n')}

**Top Categories:**
${categories.slice(0, 5).map(c => `- ${c.name}: ${c._count.bookmarks} bookmarks`).join('\n') || '- No categories yet'}

Want deeper insights? Check out the **Analytics** page!`
  }

  // Marketplace
  if (lowerMessage.match(/marketplace|playbook|sell|buy/)) {
    return `**The Marketplace** is where you can buy and sell curated bookmark collections called **Playbooks**! 🛒

**What's a Playbook?**
A themed collection of bookmarks curated by users - like a starter pack for any topic!

**Buying Playbooks:**
1. Browse by category
2. Check seller badges (trust indicators)
3. Preview included bookmarks
4. Purchase and import instantly

**Selling Playbooks:**
1. Click **Create Playbook**
2. Select bookmarks to include
3. Set price and description
4. Earn money when others buy!

**Seller Badges:**
- 🥉 Bronze: 1-5 sales
- 🥈 Silver: 6-15 sales
- 🥇 Gold: 16-30 sales
- 💎 Diamond: 51+ sales

Ready to explore the Marketplace?`
  }

  // Settings
  if (lowerMessage.match(/settings|customize|theme|dark mode/)) {
    return `**Settings** let you customize your BookmarkHub experience:

**🎨 Appearance:**
- Theme: Light, Dark, or System
- Accent Color: Pick your favorite
- Font Size: Adjust readability
- Dyslexia-friendly font option

**🔔 Notifications:**
- Email notifications toggle
- In-app alerts
- Weekly digest settings

**🔒 Privacy & Security:**
- Change password
- Two-factor authentication
- Session management
- Data export

**💳 Billing:**
- View current plan
- Upgrade options
- Payment methods

**To Access Settings:**
Click **Settings** in the sidebar, or use the gear icon!

What setting would you like to adjust?`
  }

  // Keyboard shortcuts
  if (lowerMessage.match(/keyboard|shortcut|hotkey/)) {
    return `⌨️ **Keyboard Shortcuts** to speed up your workflow:

**Navigation:**
- \`Cmd/Ctrl + K\` - Open The Oracle (me!)
- \`Cmd/Ctrl + /\` - Focus search bar
- \`Escape\` - Close modals/panels

**Bookmark Actions:**
- \`N\` - New bookmark
- \`E\` - Edit selected bookmark
- \`D\` - Delete selected bookmark
- \`F\` - Toggle favorite

**Views:**
- \`1-8\` - Switch between view modes
- \`G\` then \`D\` - Go to Dashboard
- \`G\` then \`S\` - Go to Settings

**Bulk Operations:**
- \`Cmd/Ctrl + A\` - Select all
- \`Shift + Click\` - Range select

Pro tip: These shortcuts work from anywhere in the app!`
  }

  // Default response for unknown queries
  return `I'd be happy to help with that! While I think about the best answer, here are some things I can definitely help you with:

**Popular Questions:**
• "How do I organize my bookmarks?"
• "What are fitness rings?"
• "How do I use AI LinkPilot?"
• "Show me my stats"
• "How do I create categories?"

**Quick Actions:**
• Type "help" for a full list of what I can do
• Ask "how to..." for step-by-step guides
• Say "show stats" to see your bookmark analytics

Your current collection has **${bookmarks.length} bookmarks** across **${categories.length} categories**.

What specific aspect would you like to explore?`
}

// GET endpoint to fetch conversation history
export async function GET(request: NextRequest) {
  try {
    const session = await getDevSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return Oracle settings and basic stats
    const [bookmarkCount, categoryCount] = await Promise.all([
      prisma.bookmark.count({ where: { userId: session.user.id } }),
      prisma.category.count({ where: { userId: session.user.id } })
    ])

    return NextResponse.json({
      enabled: true,
      stats: {
        bookmarkCount,
        categoryCount
      },
      settings: {
        personality: 'friendly',
        responseLength: 'detailed',
        proactiveSuggestions: true
      }
    })
  } catch (error) {
    console.error('Oracle GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch Oracle data' }, { status: 500 })
  }
}




