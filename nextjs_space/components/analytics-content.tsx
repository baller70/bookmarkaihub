'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  BookmarkIcon, Eye, TrendingUp, Clock, Target, Zap, 
  Activity, Calendar, Lightbulb, Users, BarChart3, 
  PieChart, Trash2, FileText, AlertTriangle, CheckCircle,
  Timer, FolderOpen, Star, Loader2
} from 'lucide-react'

type Tab = 'overview' | 'timeTracking' | 'insights' | 'categories' | 'projects' | 'recommendations'

interface AnalyticsContentProps {
  showTitle?: boolean
}

interface AnalyticsData {
  overview: {
    totalBookmarks: number
    totalVisits: number
    engagementScore: number
    activeTime: string
    bookmarksAdded: number
  }
  topCategories: Array<{
    name: string
    time: string
    percent: number
    bookmarks: number
    visits: number
    color: string
  }>
  topPerformers: Array<{
    title: string
    visits: number
    engagement: number
    category: string
  }>
  underperformers: Array<{
    title: string
    visits: number
    engagement: number
    category: string
  }>
  weeklyPattern: Array<{
    day: string
    hours: number
    percentage: number
  }>
  heatmapData: Array<{
    date: string
    visits: number
    level: number
  }>
  categoryStats: Array<{
    name: string
    bookmarks: number
    visits: number
    timeSpent: number
    color: string
  }>
}

export function AnalyticsContent({ showTitle = true }: AnalyticsContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [timePeriod, setTimePeriod] = useState('30d')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [timePeriod])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const days = timePeriod === '7d' ? 7 : timePeriod === '30d' ? 30 : timePeriod === '90d' ? 90 : 365
      const response = await fetch(`/api/analytics/comprehensive?range=${days}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase">Analytics Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive Insights Into Your Bookmark Usage And Productivity Patterns
          </p>
        </div>
      )}

      {/* Main Card */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-6">
          {/* Title and Time Filters */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 uppercase">Comprehensive Analytics</h2>
              <p className="text-sm text-gray-600 mt-1">
                Deep Insights Into Your Bookmark Usage And Productivity
              </p>
            </div>
            <div className="flex gap-2">
              {['7d', '30d', '90d', '1y'].map((period) => (
                <Button
                  key={period}
                  variant={timePeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod(period)}
                  className={timePeriod !== period ? 'bg-white border-gray-300 text-gray-700 hover:!bg-gray-100 hover:!text-gray-900' : ''}
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6 -mx-6 px-6 md:mx-0 md:px-0">
            <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'timeTracking', label: 'Time Tracking' },
                { id: 'insights', label: 'Insights' },
                { id: 'categories', label: 'Categories' },
                { id: 'projects', label: 'Projects' },
                { id: 'recommendations', label: 'Recommendations' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && <OverviewTab data={analyticsData} />}
          {activeTab === 'timeTracking' && <TimeTrackingTab data={analyticsData} />}
          {activeTab === 'insights' && <InsightsTab data={analyticsData} />}
          {activeTab === 'categories' && <CategoriesTab data={analyticsData} />}
          {activeTab === 'projects' && <ProjectsTab />}
          {activeTab === 'recommendations' && <RecommendationsTab data={analyticsData} />}
        </CardContent>
      </Card>
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ data }: { data: AnalyticsData | null }) {
  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-white border border-blue-200">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <BookmarkIcon className="w-4 h-4 text-blue-500" />
                  <span>Total Bookmarks</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{data.overview.totalBookmarks}</div>
                <div className="text-xs text-gray-600 mt-1">+{data.overview.bookmarksAdded} this period</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-green-200">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Eye className="w-4 h-4 text-green-500" />
                  <span>Total Visits</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{data.overview.totalVisits}</div>
                <div className="text-xs text-gray-600 mt-1">All time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-purple-200">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span>Engagement Score</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{data.overview.engagementScore.toFixed(1)}%</div>
                <div className="text-xs text-gray-600 mt-1">Average</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-orange-200">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Active Time</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{data.overview.activeTime}h</div>
                <div className="text-xs text-gray-600 mt-1">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900 uppercase">ACTIVITY HEATMAP - LAST 30 DAYS</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Less active</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`w-3 h-3 rounded-sm ${
                      level === 1 ? 'bg-green-100' :
                      level === 2 ? 'bg-green-300' :
                      level === 3 ? 'bg-green-500' :
                      'bg-green-700'
                    }`}
                  />
                ))}
              </div>
              <span>More active</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {data.heatmapData.map((day, i) => (
                <div key={i} className="space-y-1">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div
                      key={j}
                      className={`h-8 rounded ${
                        day.level === 0 ? 'bg-gray-100' :
                        day.level === 1 ? 'bg-green-100' :
                        day.level === 2 ? 'bg-green-300' :
                        day.level === 3 ? 'bg-green-500' :
                        'bg-green-700'
                      }`}
                      title={`${new Date(day.date).toLocaleDateString()}: ${day.visits} visits`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Performance Summary */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 uppercase">PERFORMANCE SUMMARY</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">Productivity Score</span>
                  <span className="text-green-600 font-semibold">0%</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">Focus Time</span>
                  <span className="text-gray-900 font-semibold">4.2h avg</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">Distraction Rate</span>
                  <span className="text-gray-900 font-semibold">12%</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">Goal Achievement</span>
                  <span className="text-green-600 font-semibold">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900 uppercase">TOP CATEGORIES</h3>
            </div>
            <div className="space-y-3">
              {data.topCategories.length > 0 ? (
                data.topCategories.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{cat.name}</span>
                      <span className="text-gray-900 font-semibold">{cat.time}</span>
                    </div>
                    <Progress value={cat.percent} className="h-2" />
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">
                  No category data available yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 uppercase">QUICK INSIGHTS</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-sm font-semibold text-blue-900 mb-1">Most Productive Hour</div>
                <div className="text-xs text-blue-700">10:00 AM - 11:00 AM (92% efficiency)</div>
              </div>
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="text-sm font-semibold text-green-900 mb-1">Streak Record</div>
                <div className="text-xs text-green-700">14 days consecutive bookmark usage</div>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                <div className="text-sm font-semibold text-purple-900 mb-1">Favorite Domain</div>
                <div className="text-xs text-purple-700">github.com (127 visits this month)</div>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="text-sm font-semibold text-orange-900 mb-1">Time Saved</div>
                <div className="text-xs text-orange-700">~2.3h saved with quick access</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Time Tracking Tab Component
function TimeTrackingTab({ data }: { data: AnalyticsData | null }) {
  if (!data) return null

  const dailyAverage = data.weeklyPattern.length > 0
    ? (data.weeklyPattern.reduce((sum, d) => sum + d.hours, 0) / data.weeklyPattern.length).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-white border border-blue-200">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Daily Average</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{dailyAverage}h</div>
                <div className="text-xs text-gray-600 mt-1">Last 7 days</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-orange-200">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Timer className="w-4 h-4 text-orange-500" />
                  <span>Total Hours</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{data.overview.activeTime}h</div>
                <div className="text-xs text-gray-600 mt-1">All time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-purple-200">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Target className="w-4 h-4 text-purple-500" />
                  <span>Total Visits</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{data.overview.totalVisits}</div>
                <div className="text-xs text-gray-600 mt-1">All bookmarks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-green-200">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>Efficiency</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{data.overview.engagementScore.toFixed(0)}%</div>
                <div className="text-xs text-gray-600 mt-1">Engagement score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Pattern and Peak Hours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900 uppercase">WEEKLY PATTERN</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Your bookmark usage throughout the week</p>
            <div className="space-y-3">
              {data.weeklyPattern.map((dayData) => (
                <div key={dayData.day}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{dayData.day}</span>
                    <span className="text-gray-900 font-semibold">{dayData.hours.toFixed(1)}h</span>
                  </div>
                  <Progress value={dayData.percentage} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">{dayData.percentage}%</div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-700">
                  You're most productive on <strong>Tuesdays and Wednesdays</strong>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900 uppercase">PEAK HOURS ANALYSIS</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">When you're most effective with bookmarks</p>
            <div className="space-y-3">
              {['9-10 AM', '2-3 PM', '10-11 AM'].map((time) => (
                <div key={time} className="p-3 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-900">{time}</span>
                    <span className="text-xs text-gray-600">0% efficiency</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span className="text-xs text-gray-600">Low energy</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Breakdown, Distraction Analysis, Time Goals */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900 uppercase">SESSION BREAKDOWN</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Short sessions (&lt;30min)</span>
                <span className="text-2xl font-bold text-gray-900">15</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Medium sessions (30min-2h)</span>
                <span className="text-2xl font-bold text-gray-900">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Long sessions (&gt;2h)</span>
                <span className="text-2xl font-bold text-gray-900">5</span>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                <span className="text-xs text-yellow-700">
                  Your optimal session length is <strong>1.8 hours</strong>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 uppercase">DISTRACTION ANALYSIS</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Tab switching rate</span>
                <span className="text-2xl font-bold text-gray-900">12/hour</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Focus streaks</span>
                <span className="text-2xl font-bold text-gray-900">6 avg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Break frequency</span>
                <span className="text-2xl font-bold text-gray-900">Every 45min</span>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-xs text-red-700">
                  Consider <strong>25min focused work blocks</strong>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 uppercase">TIME GOALS</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">Daily Goal (5h)</span>
                  <span className="text-green-600 font-semibold">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">Weekly Goal (30h)</span>
                  <span className="text-green-600 font-semibold">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700">
                  On track to <strong>exceed monthly goal</strong>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Insights Tab Component
function InsightsTab({ data }: { data: AnalyticsData | null }) {
  if (!data) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Top Performers */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 uppercase">TOP PERFORMERS</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Bookmarks with highest engagement</p>
          <div className="space-y-3">
            {data.topPerformers.length > 0 ? (
              data.topPerformers.map((item, index) => (
                <div key={index} className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 mb-1">{item.title}</div>
                      <div className="text-xs text-gray-600">{item.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-semibold text-green-600">{item.engagement}%</div>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Eye className="w-3 h-3" />
                    <span>{item.visits} visits</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 text-center py-8">
                No performance data available yet. Start using your bookmarks to see insights!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Underperformers */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-red-500 rotate-180" />
            <h3 className="text-lg font-semibold text-gray-900 uppercase">UNDERPERFORMERS</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Bookmarks that need attention</p>
          <div className="space-y-3">
            {data.underperformers.length > 0 ? (
              data.underperformers.map((item, index) => (
                <div key={index} className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 mb-1">{item.title}</div>
                      <div className="text-xs text-gray-600">{item.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-semibold text-red-600">{item.engagement}%</div>
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Eye className="w-3 h-3" />
                    <span>{item.visits} visits</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 text-center py-8">
                All your bookmarks are performing well!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Categories Tab Component
function CategoriesTab({ data }: { data: AnalyticsData | null }) {
  if (!data) return null

  // Calculate category efficiency from real data
  const categoryEfficiency = data.categoryStats.map((cat, index) => {
    const avgTime = cat.bookmarks > 0 ? (cat.timeSpent / cat.bookmarks).toFixed(1) : '0.0'
    const efficiency = cat.visits > 0 ? Math.min(Math.round((cat.visits / cat.bookmarks) * 10), 100) : 0
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-yellow-500']
    
    return {
      name: cat.name,
      bookmarks: cat.bookmarks,
      avgTime: `${avgTime}m`,
      efficiency,
      color: colors[index % colors.length],
    }
  }).slice(0, 6)

  // Calculate productivity by category
  const totalTime = data.categoryStats.reduce((sum, cat) => sum + cat.timeSpent, 0)
  const productivityByCategory = data.categoryStats.map((cat, index) => {
    const hours = (cat.timeSpent / 60).toFixed(1)
    const percentage = totalTime > 0 ? Math.round((cat.timeSpent / totalTime) * 100) : 0
    const colors = ['bg-blue-500', 'bg-orange-500', 'bg-green-500', 'bg-purple-500', 'bg-gray-500']
    
    return {
      name: cat.name,
      hours: parseFloat(hours),
      percentage,
      visits: cat.visits,
      color: colors[index % colors.length],
    }
  }).slice(0, 5)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Category Efficiency */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 uppercase">CATEGORY EFFICIENCY</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Performance metrics by category</p>
          <div className="space-y-4">
            {categoryEfficiency.map((cat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                    <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{cat.efficiency}%</div>
                </div>
                <Progress value={cat.efficiency} className="h-2" />
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{cat.bookmarks} bookmarks</span>
                  <span>{cat.avgTime} avg time</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Productivity by Category */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900 uppercase">Productivity By Category</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Time distribution across categories</p>
          
          {/* Pie Chart Visualization */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {productivityByCategory.map((cat, index) => {
                  const startAngle = productivityByCategory.slice(0, index).reduce((sum, c) => sum + c.percentage * 3.6, 0)
                  const endAngle = startAngle + cat.percentage * 3.6
                  const largeArc = cat.percentage > 50 ? 1 : 0
                  
                  const x1 = 50 + 45 * Math.cos((startAngle - 90) * Math.PI / 180)
                  const y1 = 50 + 45 * Math.sin((startAngle - 90) * Math.PI / 180)
                  const x2 = 50 + 45 * Math.cos((endAngle - 90) * Math.PI / 180)
                  const y2 = 50 + 45 * Math.sin((endAngle - 90) * Math.PI / 180)
                  
                  return (
                    <path
                      key={index}
                      d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={cat.color.replace('bg-', '#')}
                      className={cat.color.replace('bg-', 'fill-')}
                      opacity="0.8"
                    />
                  )
                })}
                <circle cx="50" cy="50" r="20" fill="white" />
              </svg>
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-3">
            {productivityByCategory.map((cat, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{cat.name}</div>
                    <div className="text-xs text-gray-600">{cat.visits} visits</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{cat.hours}h</div>
                  <div className="text-xs text-gray-600">{cat.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Projects Tab Component
function ProjectsTab() {
  const activeProjects = [
    { 
      name: 'Website Redesign', 
      bookmarks: 28, 
      hours: 42.5, 
      progress: 75, 
      team: 4,
      deadline: '2 weeks',
      status: 'On Track',
      color: 'bg-blue-500'
    },
    { 
      name: 'Mobile App Development', 
      bookmarks: 35, 
      hours: 38.2, 
      progress: 60, 
      team: 6,
      deadline: '1 month',
      status: 'On Track',
      color: 'bg-green-500'
    },
    { 
      name: 'Marketing Campaign', 
      bookmarks: 18, 
      hours: 22.8, 
      progress: 45, 
      team: 3,
      deadline: '3 weeks',
      status: 'At Risk',
      color: 'bg-orange-500'
    },
    { 
      name: 'Data Analytics Platform', 
      bookmarks: 42, 
      hours: 56.3, 
      progress: 30, 
      team: 5,
      deadline: '2 months',
      status: 'Behind',
      color: 'bg-red-500'
    },
    { 
      name: 'API Integration', 
      bookmarks: 22, 
      hours: 28.5, 
      progress: 85, 
      team: 3,
      deadline: '1 week',
      status: 'On Track',
      color: 'bg-purple-500'
    },
  ]

  const resourceAllocation = [
    { category: 'Development', hours: 156, percentage: 42, bookmarks: 128 },
    { category: 'Design', hours: 98, percentage: 26, bookmarks: 82 },
    { category: 'Research', hours: 72, percentage: 19, bookmarks: 64 },
    { category: 'Planning', hours: 48, percentage: 13, bookmarks: 38 },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Active Projects */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900 uppercase">ACTIVE PROJECTS</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Current project status and progress</p>
          <div className="space-y-4">
            {activeProjects.map((project, index) => (
              <div key={index} className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 mb-1">{project.name}</div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <BookmarkIcon className="w-3 h-3" />
                        {project.bookmarks}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {project.hours}h
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {project.team}
                      </span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${
                    project.status === 'On Track' ? 'bg-green-100 text-green-700' :
                    project.status === 'At Risk' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {project.status}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-gray-900">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <div className="text-xs text-gray-600">Due in {project.deadline}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Allocation */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 uppercase">RESOURCE ALLOCATION</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Time and resource distribution</p>
          
          {/* Total Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-2xl font-bold text-blue-900">
                {resourceAllocation.reduce((sum, r) => sum + r.hours, 0)}h
              </div>
              <div className="text-xs text-blue-700 mt-1">Total Hours</div>
            </div>
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="text-2xl font-bold text-green-900">
                {resourceAllocation.reduce((sum, r) => sum + r.bookmarks, 0)}
              </div>
              <div className="text-xs text-green-700 mt-1">Total Bookmarks</div>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
              <div className="text-2xl font-bold text-purple-900">
                {activeProjects.length}
              </div>
              <div className="text-xs text-purple-700 mt-1">Active Projects</div>
            </div>
          </div>

          {/* Resource Breakdown */}
          <div className="space-y-4">
            {resourceAllocation.map((resource, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" style={{
                      backgroundColor: index === 0 ? '#3b82f6' : 
                                      index === 1 ? '#8b5cf6' : 
                                      index === 2 ? '#10b981' : '#f59e0b'
                    }} />
                    <span className="text-sm font-medium text-gray-900">{resource.category}</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{resource.hours}h</div>
                </div>
                <Progress value={resource.percentage} className="h-2" />
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{resource.bookmarks} bookmarks</span>
                  <span>{resource.percentage}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-700">
                <strong>Development</strong> is consuming the most resources this month
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Recommendations Tab Component
function RecommendationsTab({ data }: { data: AnalyticsData | null }) {
  if (!data) return null

  const cleanupSuggestions = [
    { 
      title: 'Remove Low-Use Bookmarks',
      description: `${data.underperformers.length} bookmarks have very low engagement`,
      action: 'Review Links',
      priority: 'Medium',
      impact: 'Improve organization'
    },
    { 
      title: 'Organize By Category',
      description: `Focus on ${data.topCategories.length} main categories for better structure`,
      action: 'Organize',
      priority: 'Low',
      impact: 'Better categorization'
    },
  ]

  const optimizationTips = [
    {
      title: 'Use Categories Effectively',
      description: `You have ${data.topCategories.length} active categories. Consider organizing bookmarks into these for better management.`,
      icon: <Target className="w-5 h-5 text-yellow-600" />,
      action: 'Organize Now'
    },
    {
      title: 'Track Your Usage',
      description: 'Keep visiting your bookmarks regularly to maintain accurate analytics and insights.',
      icon: <Activity className="w-5 h-5 text-yellow-600" />,
      action: 'View Dashboard'
    },
    {
      title: 'Leverage Top Performers',
      description: `Your top ${data.topPerformers.length} bookmarks drive the most value. Consider adding similar resources.`,
      icon: <Star className="w-5 h-5 text-yellow-600" />,
      action: 'Explore Similar'
    },
    {
      title: 'Set Weekly Goals',
      description: 'Establish consistent bookmark usage patterns to maximize productivity.',
      icon: <Target className="w-5 h-5 text-yellow-600" />,
      action: 'Set Goals'
    },
  ]

  const trendingItems = data.topPerformers.slice(0, 5).map((item, index) => ({
    title: item.title,
    category: item.category,
    growth: `+${item.engagement}%`,
    trend: 'up',
    visits: item.visits
  }))

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Cleanup Suggestions */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 uppercase">CLEANUP SUGGESTIONS</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Actions to improve your bookmark collection</p>
          <div className="space-y-3">
            {cleanupSuggestions.map((suggestion, index) => (
              <div key={index} className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 mb-1">{suggestion.title}</div>
                    <div className="text-xs text-gray-600 mb-2">{suggestion.description}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${
                    suggestion.priority === 'High' ? 'bg-red-100 text-red-700' :
                    suggestion.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {suggestion.priority}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">{suggestion.impact}</div>
                  <Button size="sm" variant="outline" className="h-7 text-xs bg-white border-gray-300 text-gray-700 hover:!bg-gray-100 hover:!text-gray-900">
                    {suggestion.action}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Tips */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 uppercase">OPTIMIZATION TIPS</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Improve your bookmark management</p>
          <div className="space-y-3">
            {optimizationTips.map((tip, index) => (
              <div key={index} className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 hover:border-yellow-300 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-yellow-100">
                    {tip.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 mb-1">{tip.title}</div>
                    <div className="text-xs text-gray-600">{tip.description}</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs w-full bg-white border-yellow-300 text-yellow-700 hover:!bg-yellow-100 hover:!text-yellow-800">
                  {tip.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trending Items */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900 uppercase">TRENDING ITEMS</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Your most accessed bookmarks this week</p>
          <div className="space-y-3">
            {trendingItems.map((item, index) => (
              <div key={index} className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 mb-1">{item.title}</div>
                    <div className="text-xs text-gray-600">{item.category}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-semibold text-green-600">{item.growth}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Progress value={Math.min((item.visits / 100) * 100, 100)} className="h-1" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Eye className="w-3 h-3" />
                    <span>{item.visits}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700">
                Your engagement is <strong>up 45%</strong> this week!
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
