# DNA Profile - Complete Feature Specification

Based on comprehensive browser exploration of https://bookmarkhub-web.vercel.app/dna-profile

## Structure
- Main layout with left sidebar navigation
- 6 main sections: About You, Favorites, Playbooks, Search, Analytics, Time Capsule
- Each section is a separate route/page

## Section 1: About You (/dna-profile)
### Components:
1. Basic Information
   - Avatar upload (Upload Custom Photo, Remove Logo)
   - Full Name input
   - Favorite Industry dropdown  
   - Organization input
   - Favorite Industry #2 dropdown
   - Bio textarea

2. Content Preferences
   - Link Source Preference dropdown
   - Language Preference dropdown
   - Media Format Priority dropdown
   - Content Freshness dropdown
   - Source Credibility dropdown
   - Primary Use Case dropdown

3. Links & Social Profiles
   - Website, LinkedIn, Twitter/X, TikTok, Instagram, Facebook inputs

4. Interests & Skills
   - Sub-Industry & Skills (add with + button)
   - Skills & Expertise (add with + button)
   - Personal Interests (add with + button)

5. Learning Preferences
   - Learning Style, Content Depth Preference, Time Commitment, Goal-Setting Style dropdowns

6. Privacy & Preferences
   - Profile Visibility dropdown
   - Notification Frequency dropdown
   - Show Activity toggle
   - Allow Recommendations toggle
   - Save Profile button

## Section 2: Favorites (/favorites)
- Header with Refresh, Export buttons
- 4 stat cards: Total Favorites, Total Visits, Avg Visits, Most Visited
- View options: Grid, List, Compact, Table
- Sort dropdown: Title, Date Added, Last Updated, Most Visited, Folder
- Bookmark cards with heart icon, metadata

## Section 3: Playbooks (/playbooks)
- AI Generate and Create Playbook buttons
- Playbook player UI with play/pause, shuffle, repeat controls
- Search bar, category filter, newest filter
- Left sidebar with playbook list
- Main area showing active playbook with bookmark items and durations
- Generate AI Playbook modal

## Section 4: Search (/search)  
- History button → Search History modal
- AI Assist button → AI Search Assistant modal with suggestions
- Main search bar with filter button

## Section 5: Analytics (/analytics)
### Tabs:
1. Overview: Total Bookmarks, Total Visits, Engagement Score, Active Time cards + Activity Heatmap + Performance/Categories/Insights
2. Time Tracking: Daily Average, Total Hours, Focus Sessions, Efficiency + Weekly Pattern + Peak Hours + Session Breakdown + Distraction Analysis + Time Goals
3. Insights: Top Performers, Underperformers
4. Categories: Category Efficiency, Productivity by Category
5. Projects: Active Projects, Resource Allocation
6. Recommendations: Cleanup Suggestions, Optimization Tips, Trending Items

## Section 6: Time Capsule (/time-capsule)
- Schedule, Compare, Create Snapshot buttons
- List/Calendar view toggle
- Capsule cards with metadata (size, bookmarks, folders, date)
- Click to view details panel with AI Summary, Restore, Export, Share buttons
- Calendar view showing capsules by date

## Profile Completion Widget
- Shows progress (4/6 sections)
- Lists incomplete sections

## Key Features Observed:
- All forms have working inputs
- Modals overlay with backdrop
- Toggle switches animate
- Progress bars show percentage
- Dropdowns have proper options
- Charts use real data visualization
- Everything is styled consistently with the dashboard
