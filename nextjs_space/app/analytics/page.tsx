
'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { DashboardAuth } from '@/components/dashboard-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Clock, Target, Zap, Activity } from 'lucide-react'
import type { AnalyticsTab } from '@/lib/types'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview')
  const [loading, setLoading] = useState(true)

  // Mock data - in a real app, this would come from the API
  const overviewStats = {
    totalBookmarks: 127,
    totalVisits: 1543,
    engagementScore: 87,
    activeTime: 156 // hours
  }

  const activityData = [
    { date: 'Mon', visits: 45 },
    { date: 'Tue', visits: 52 },
    { date: 'Wed', visits: 38 },
    { date: 'Thu', visits: 65 },
    { date: 'Fri', visits: 58 },
    { date: 'Sat', visits: 30 },
    { date: 'Sun', visits: 42 }
  ]

  const categoryData = [
    { name: 'Development', value: 35, color: '#3b82f6' },
    { name: 'Design', value: 25, color: '#8b5cf6' },
    { name: 'Marketing', value: 20, color: '#10b981' },
    { name: 'Research', value: 15, color: '#f59e0b' },
    { name: 'Other', value: 5, color: '#ef4444' }
  ]

  const timeTrackingData = {
    dailyAverage: 2.8,
    totalHours: 156,
    focusSessions: 42,
    efficiency: 85
  }

  const weeklyPattern = [
    { day: 'Mon', hours: 3.2 },
    { day: 'Tue', hours: 2.8 },
    { day: 'Wed', hours: 3.5 },
    { day: 'Thu', hours: 2.1 },
    { day: 'Fri', hours: 3.9 },
    { day: 'Sat', hours: 1.5 },
    { day: 'Sun', hours: 2.0 }
  ]

  const peakHours = [
    { hour: '9AM', activity: 35 },
    { hour: '10AM', activity: 45 },
    { hour: '11AM', activity: 52 },
    { hour: '12PM', activity: 30 },
    { hour: '1PM', activity: 25 },
    { hour: '2PM', activity: 48 },
    { hour: '3PM', activity: 60 },
    { hour: '4PM', activity: 38 }
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500)
  }, [])

  if (loading) {
    return (
      <DashboardAuth>
        <DashboardLayout>
          <div className="flex items-center justify-center p-8">Loading analytics...</div>
        </DashboardLayout>
      </DashboardAuth>
    )
  }

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6 p-6">
          <h1 className="text-3xl font-bold">Analytics</h1>

          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as AnalyticsTab)}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeTracking">Time Tracking</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="w-8 h-8 text-blue-500" />
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold">{overviewStats.totalBookmarks}</div>
                    <div className="text-sm text-muted-foreground">Total Bookmarks</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-8 h-8 text-purple-500" />
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold">{overviewStats.totalVisits}</div>
                    <div className="text-sm text-muted-foreground">Total Visits</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <Zap className="w-8 h-8 text-yellow-500" />
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold">{overviewStats.engagementScore}%</div>
                    <div className="text-sm text-muted-foreground">Engagement Score</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="w-8 h-8 text-green-500" />
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold">{overviewStats.activeTime}h</div>
                    <div className="text-sm text-muted-foreground">Active Time</div>
                  </CardContent>
                </Card>
              </div>

              {/* Activity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visits" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeTracking" className="space-y-6">
              {/* Time Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{timeTrackingData.dailyAverage}h</div>
                    <div className="text-sm text-muted-foreground">Daily Average</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{timeTrackingData.totalHours}h</div>
                    <div className="text-sm text-muted-foreground">Total Hours</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{timeTrackingData.focusSessions}</div>
                    <div className="text-sm text-muted-foreground">Focus Sessions</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{timeTrackingData.efficiency}%</div>
                    <div className="text-sm text-muted-foreground">Efficiency</div>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Pattern */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Pattern</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyPattern}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="hours" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Peak Hours */}
              <Card>
                <CardHeader>
                  <CardTitle>Peak Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={peakHours}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="activity" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">Most Visited Bookmark</span>
                      <span className="text-muted-foreground">234 visits</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">Most Active Category</span>
                      <span className="text-muted-foreground">Development</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">Best Engagement Day</span>
                      <span className="text-muted-foreground">Thursday</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Underperformers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">Unused Bookmarks</span>
                      <span className="text-muted-foreground">12 items</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">Low Engagement Category</span>
                      <span className="text-muted-foreground">Research</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryData.map((category) => (
                      <div key={category.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.name}</span>
                          <span className="text-muted-foreground">{category.value}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full"
                            style={{ width: `${category.value}%`, backgroundColor: category.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Project tracking coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cleanup Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium mb-1">Remove unused bookmarks</div>
                      <div className="text-sm text-muted-foreground">
                        12 bookmarks haven't been visited in over 90 days
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium mb-1">Organize uncategorized items</div>
                      <div className="text-sm text-muted-foreground">
                        5 bookmarks are not assigned to any category
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Optimization Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium mb-1">Create more playbooks</div>
                      <div className="text-sm text-muted-foreground">
                        Playbooks can help you work more efficiently
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium mb-1">Use tags for better organization</div>
                      <div className="text-sm text-muted-foreground">
                        Only 30% of your bookmarks have tags
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
