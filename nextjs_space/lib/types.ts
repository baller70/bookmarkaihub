export type Expense = {
  id: string
  amount: number
  category: string
  description: string
  date: Date
}

export type ExpenseFormData = Omit<Expense, 'id' | 'date'> & {
  date: string
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Other'
] as const

export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

// ==================== DNA PROFILE TYPES ====================

export type DNAProfileData = {
  id?: string
  userId: string
  // Basic Information
  avatar?: string
  fullName?: string
  organization?: string
  bio?: string
  // Industry & Preferences
  favoriteIndustry?: string
  favoriteIndustry2?: string
  linkSourcePref?: string
  languagePref?: string
  mediaFormatPriority?: string
  contentFreshness?: string
  sourceCredibility?: string
  primaryUseCase?: string
  // Links & Social
  website?: string
  linkedin?: string
  twitter?: string
  tiktok?: string
  instagram?: string
  facebook?: string
  // Interests & Skills
  subIndustrySkills?: string[]
  skillsExpertise?: string[]
  personalInterests?: string[]
  // Learning Preferences
  learningStyle?: string
  contentDepthPref?: string
  timeCommitment?: string
  goalSettingStyle?: string
  // Privacy & Preferences
  profileVisibility?: string
  notificationFreq?: string
  showActivity?: boolean
  allowRecommendations?: boolean
}

export const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'E-commerce',
  'Marketing',
  'Design',
  'Real Estate',
  'Manufacturing',
  'Legal',
  'Consulting',
  'Entertainment',
  'Travel & Hospitality',
  'Non-profit',
  'Government',
  'Other'
] as const

export const LINK_SOURCE_PREFERENCES = [
  'News Sites',
  'Blogs',
  'Social Media',
  'Research Papers',
  'Video Platforms',
  'Podcasts',
  'Documentation',
  'All Sources'
] as const

export const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Japanese',
  'Korean',
  'Portuguese',
  'Russian',
  'Arabic',
  'Hindi',
  'Italian'
] as const

export const MEDIA_FORMATS = [
  'Text Articles',
  'Videos',
  'Podcasts',
  'Infographics',
  'Interactive Content',
  'Mixed Media'
] as const

export const CONTENT_FRESHNESS = [
  'Latest (Last 24h)',
  'Recent (Last Week)',
  'Current (Last Month)',
  'Timeless'
] as const

export const SOURCE_CREDIBILITY = [
  'Verified Sources Only',
  'Mainstream Media',
  'Academic & Research',
  'All Sources'
] as const

export const PRIMARY_USE_CASES = [
  'Research',
  'Learning',
  'Work Projects',
  'Personal Development',
  'Content Creation',
  'Networking',
  'Entertainment',
  'Shopping'
] as const

export const LEARNING_STYLES = [
  'Visual',
  'Auditory',
  'Reading/Writing',
  'Kinesthetic',
  'Mixed'
] as const

export const CONTENT_DEPTH = [
  'Quick Overview',
  'Medium Depth',
  'Comprehensive',
  'Expert Level'
] as const

export const TIME_COMMITMENTS = [
  'Quick (< 5 min)',
  'Short (5-15 min)',
  'Medium (15-30 min)',
  'Long (30+ min)',
  'Flexible'
] as const

export const GOAL_SETTING_STYLES = [
  'Daily Tasks',
  'Weekly Goals',
  'Monthly Objectives',
  'Long-term Vision',
  'No Specific Goals'
] as const

export const PROFILE_VISIBILITY = [
  'private',
  'friends',
  'public'
] as const

export const NOTIFICATION_FREQUENCY = [
  'realtime',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'never'
] as const

// Favorites Types
export type FavoriteStats = {
  totalFavorites: number
  totalVisits: number
  avgVisits: number
  mostVisited: {
    title: string
    visits: number
  }
}

export type ViewMode = 'grid' | 'list' | 'compact' | 'folder'
export type SortOption = 'title' | 'dateAdded' | 'lastUpdated' | 'mostVisited' | 'folder'

// Playbook Types
export type Playbook = {
  id: string
  title: string
  description?: string
  category?: string
  isActive: boolean
  duration: number
  items: PlaybookItemWithBookmark[]
  createdAt: Date
  updatedAt: Date
}

export type PlaybookItemWithBookmark = {
  id: string
  order: number
  duration: number
  bookmark: {
    id: string
    title: string
    url: string
    favicon?: string
    description?: string
  }
}

export type CreatePlaybookInput = {
  title: string
  description?: string
  category?: string
  bookmarkIds: string[]
}

// Search Types
export type SearchHistoryItem = {
  id: string
  query: string
  filters?: any
  results: number
  createdAt: Date
}

// Time Capsule Types
export type TimeCapsule = {
  id: string
  title: string
  description?: string
  date: Date
  totalBookmarks: number
  totalFolders: number
  totalSize: number
  snapshot: any
  aiSummary?: string
  createdAt: Date
  updatedAt: Date
}

export type CapsuleViewMode = 'list' | 'calendar'

// Analytics Types
export type AnalyticsTab = 'overview' | 'timeTracking' | 'insights' | 'categories' | 'projects' | 'recommendations'

export type AnalyticsOverview = {
  totalBookmarks: number
  totalVisits: number
  engagementScore: number
  activeTime: number
  activityHeatmap: HeatmapData[]
  performanceMetrics: PerformanceMetric[]
  categoryBreakdown: CategoryMetric[]
}

export type HeatmapData = {
  date: string
  value: number
}

export type PerformanceMetric = {
  label: string
  value: number
  change: number
}

export type CategoryMetric = {
  name: string
  visits: number
  percentage: number
  color: string
}

export type TimeTrackingData = {
  dailyAverage: number
  totalHours: number
  focusSessions: number
  efficiency: number
  weeklyPattern: WeeklyPattern[]
  peakHours: PeakHour[]
  sessionBreakdown: SessionBreakdown[]
}

export type WeeklyPattern = {
  day: string
  hours: number
}

export type PeakHour = {
  hour: number
  activity: number
}

export type SessionBreakdown = {
  category: string
  duration: number
  percentage: number
}