'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { DashboardAuth } from '@/components/dashboard-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  BookmarkIcon, Eye, TrendingUp, Clock, Target, Zap, 
  Activity, Calendar, Lightbulb, Users, BarChart3, 
  PieChart, Trash2, FileText, AlertTriangle, CheckCircle,
  Timer, FolderOpen, Star
} from 'lucide-react'

type Tab = 'overview' | 'timeTracking' | 'insights' | 'categories' | 'projects' | 'recommendations'

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [timePeriod, setTimePeriod] = useState('30d')

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Comprehensive insights into your bookmark usage and productivity patterns
            </p>
          </div>

          {/* Main Card */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              {/* Title and Time Filters */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Comprehensive Analytics</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Deep insights into your bookmark usage and productivity
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
              <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-6">
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
                      className={`pb-3 text-sm font-medium transition-colors relative ${
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
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'timeTracking' && <TimeTrackingTab />}
              {activeTab === 'insights' && <InsightsTab />}
              {activeTab === 'categories' && <CategoriesTab />}
              {activeTab === 'projects' && <ProjectsTab />}
              {activeTab === 'recommendations' && <RecommendationsTab />}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}

// Overview Tab Component
function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white border border-blue-200">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <BookmarkIcon className="w-4 h-4 text-blue-500" />
                  <span>Total Bookmarks</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">235</div>
                <div className="text-xs text-gray-600 mt-1">+2% this month</div>
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
                <div className="text-3xl font-bold text-gray-900">291</div>
                <div className="text-xs text-gray-600 mt-1">Last 30 days</div>
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
                <div className="text-3xl font-bold text-gray-900">12.4%</div>
                <div className="text-xs text-gray-600 mt-1">Above average</div>
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
                <div className="text-3xl font-bold text-gray-900">8.4h</div>
                <div className="text-xs text-gray-600 mt-1">Today</div>
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
            <h3 className="text-lg font-semibold text-gray-900">Activity Heatmap - Last 30 Days</h3>
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
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  {Array.from({ length: 4 }).map((_, j) => {
                    const level = Math.floor(Math.random() * 5)
                    return (
                      <div
                        key={j}
                        className={`h-8 rounded ${
                          level === 0 ? 'bg-gray-100' :
                          level === 1 ? 'bg-green-100' :
                          level === 2 ? 'bg-green-300' :
                          level === 3 ? 'bg-green-500' :
                          'bg-green-700'
                        }`}
                      />
                    )
                  })}
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
              <h3 className="text-lg font-semibold text-gray-900">Performance Summary</h3>
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
              <h3 className="text-lg font-semibold text-gray-900">Top Categories</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Development', time: '8.4h', percent: 35 },
                { name: 'Research', time: '6.2h', percent: 26 },
                { name: 'Learning', time: '4.8h', percent: 20 },
                { name: 'Design', time: '2.9h', percent: 12 },
                { name: 'Others', time: '1.7h', percent: 7 },
              ].map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{cat.name}</span>
                    <span className="text-gray-900 font-semibold">{cat.time}</span>
                  </div>
                  <Progress value={cat.percent} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">Quick Insights</h3>
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
function TimeTrackingTab() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white border border-blue-200">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Daily Average</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">0h</div>
                <div className="text-xs text-gray-600 mt-1">+0.5h vs last week</div>
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
                <div className="text-3xl font-bold text-gray-900">8.4h</div>
                <div className="text-xs text-gray-600 mt-1">This month</div>
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
                  <span>Focus Sessions</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">23</div>
                <div className="text-xs text-gray-600 mt-1">Avg 1.5h each</div>
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
                <div className="text-3xl font-bold text-gray-900">0%</div>
                <div className="text-xs text-gray-600 mt-1">Peak performance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Pattern and Peak Hours */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Weekly Pattern</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Your bookmark usage throughout the week</p>
            <div className="space-y-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{day}</span>
                    <span className="text-gray-900 font-semibold">0h</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">0%</div>
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
              <h3 className="text-lg font-semibold text-gray-900">Peak Hours Analysis</h3>
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
              <h3 className="text-lg font-semibold text-gray-900">Session Breakdown</h3>
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
              <h3 className="text-lg font-semibold text-gray-900">Distraction Analysis</h3>
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
              <h3 className="text-lg font-semibold text-gray-900">Time Goals</h3>
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
function InsightsTab() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-12 pb-12 text-center">
          <Star className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-12 pb-12 text-center">
          <TrendingUp className="w-12 h-12 text-red-500 mx-auto mb-3 rotate-180" />
          <h3 className="text-lg font-semibold text-gray-900">Underperformers</h3>
        </CardContent>
      </Card>
    </div>
  )
}

// Categories Tab Component
function CategoriesTab() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-12 pb-12 text-center">
          <FolderOpen className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Category Efficiency</h3>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-12 pb-12 text-center">
          <PieChart className="w-12 h-12 text-purple-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Productivity by Category</h3>
        </CardContent>
      </Card>
    </div>
  )
}

// Projects Tab Component
function ProjectsTab() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-12 pb-12 text-center">
          <Users className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-12 pb-12 text-center">
          <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Resource Allocation</h3>
        </CardContent>
      </Card>
    </div>
  )
}

// Recommendations Tab Component
function RecommendationsTab() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-12 pb-12 text-center">
          <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Cleanup Suggestions</h3>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-12 pb-12 text-center">
          <Lightbulb className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Optimization Tips</h3>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-12 pb-12 text-center">
          <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Trending Items</h3>
        </CardContent>
      </Card>
    </div>
  )
}
