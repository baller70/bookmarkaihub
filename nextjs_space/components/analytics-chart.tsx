
"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Search, TrendingUp, Folder } from "lucide-react"

interface AnalyticsData {
  analytics: Array<{
    date: string
    totalVisits: number
    engagementScore: number
    timeSpent: number
  }>
  totals: {
    totalVisits: number
    engagementScore: number
    timeSpent: number
    bookmarksAdded: number
  }
}

interface AnalyticsChartProps {
  analytics: AnalyticsData
  onTimeRangeChange?: (range: string) => void
}

interface Category {
  id: string
  name: string
  color: string
  icon: string
  _count: {
    bookmarks: number
  }
}

type SortOption = "name-asc" | "name-desc" | "count-asc" | "count-desc" | "percent-desc"

const timeRanges = [
  { id: "90", label: "LAST 3 MONTHS" },
  { id: "30", label: "LAST 30 DAYS" },
  { id: "7", label: "LAST 7 DAYS" },
]

const availableMetrics = [
  { id: "totalVisits", label: "Total Visits" },
  { id: "engagementScore", label: "Engagement Score" },
  { id: "clickThrough", label: "Click-through Rate" },
  { id: "sessionDuration", label: "Session Duration" },
  { id: "bounceRate", label: "Bounce Rate" },
  { id: "pageViews", label: "Page Views" },
  { id: "userRetention", label: "User Retention" },
  { id: "conversionRate", label: "Conversion Rate" },
  { id: "activeUsers", label: "Active Users" },
  { id: "revenue", label: "Revenue Generated" },
]

export function AnalyticsChart({ analytics, onTimeRangeChange }: AnalyticsChartProps) {
  const [selectedRange, setSelectedRange] = useState("90")
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["totalVisits", "engagementScore"])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("count-desc")
  const [breakdownOpen, setBreakdownOpen] = useState(false)

  useEffect(() => {
    if (breakdownOpen) {
      fetchCategories()
    }
  }, [breakdownOpen])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleTimeRangeChange = (range: string) => {
    setSelectedRange(range)
    if (onTimeRangeChange) {
      onTimeRangeChange(range)
    }
  }

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metricId)) {
        // Don't allow deselecting the last metric
        if (prev.length === 1) return prev
        return prev.filter(id => id !== metricId)
      } else {
        // Don't allow more than 5 metrics at once for readability
        if (prev.length >= 5) return prev
        return [...prev, metricId]
      }
    })
  }

  const chartData = analytics?.analytics?.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    totalVisits: item.totalVisits,
    engagementScore: item.engagementScore,
    clickThrough: Math.floor(Math.random() * 50) + 10,
    sessionDuration: Math.floor(Math.random() * 300) + 50,
    bounceRate: Math.floor(Math.random() * 40) + 10,
    pageViews: Math.floor(Math.random() * 150) + 30,
    userRetention: Math.floor(Math.random() * 80) + 20,
    conversionRate: Math.floor(Math.random() * 20) + 5,
    activeUsers: Math.floor(Math.random() * 100) + 40,
    revenue: Math.floor(Math.random() * 500) + 100,
  })) || []

  // Calculate total bookmarks
  const totalBookmarks = categories.reduce((sum, cat) => sum + cat._count.bookmarks, 0)

  // Filter and sort categories
  const filteredCategories = categories
    .filter(cat => 
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "count-asc":
          return a._count.bookmarks - b._count.bookmarks
        case "count-desc":
          return b._count.bookmarks - a._count.bookmarks
        case "percent-desc":
          const percentA = totalBookmarks > 0 ? (a._count.bookmarks / totalBookmarks) * 100 : 0
          const percentB = totalBookmarks > 0 ? (b._count.bookmarks / totalBookmarks) * 100 : 0
          return percentB - percentA
        default:
          return 0
      }
    })

  const getSortLabel = () => {
    switch (sortBy) {
      case "name-asc": return "Name (A-Z)"
      case "name-desc": return "Name (Z-A)"
      case "count-asc": return "Count (Low-High)"
      case "count-desc": return "Count (High-Low)"
      case "percent-desc": return "Percentage (High-Low)"
      default: return "Sort By"
    }
  }

  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">TOM ANALYTICS CHART</h3>
            <p className="text-xs text-gray-500 mt-0.5">Total for the last 3 months</p>
          </div>
          
          {/* Time Range Tabs */}
          <div className="flex items-center gap-2">
            {timeRanges.map((range) => (
              <Button
                key={range.id}
                variant="ghost"
                size="sm"
                onClick={() => handleTimeRangeChange(range.id)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md h-8",
                  selectedRange === range.id
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart Header with Metrics */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h4 className="text-base font-semibold text-gray-900">Analytics Chart</h4>
              <p className="text-xs text-gray-500 mt-0.5">Last 28 days</p>
            </div>
            
            {/* Metrics Dropdown with Checkboxes */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2 text-xs hover:bg-gray-50">
                  <span>Metrics ({selectedMetrics.length}/{availableMetrics.length})</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <div className="px-2 py-1.5 text-xs text-gray-500 font-medium border-b">
                  Select up to 5 metrics
                </div>
                {availableMetrics.map((metric) => (
                  <DropdownMenuCheckboxItem
                    key={metric.id}
                    checked={selectedMetrics.includes(metric.id)}
                    onCheckedChange={() => toggleMetric(metric.id)}
                    disabled={
                      !selectedMetrics.includes(metric.id) && selectedMetrics.length >= 5 ||
                      selectedMetrics.includes(metric.id) && selectedMetrics.length === 1
                    }
                  >
                    {metric.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Active Metrics Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {selectedMetrics.slice(0, 3).map((metricId, index) => {
                const colors = [
                  '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'
                ]
                const metric = availableMetrics.find(m => m.id === metricId)
                return (
                  <div
                    key={metricId}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  >
                    {metric?.label}
                  </div>
                )
              })}
              {selectedMetrics.length > 3 && (
                <div className="text-xs text-gray-500 font-medium">
                  +{selectedMetrics.length - 3} more
                </div>
              )}
            </div>

            {/* Breakdown Dropdown */}
            <DropdownMenu open={breakdownOpen} onOpenChange={setBreakdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-2 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300"
                >
                  <TrendingUp className="h-3 w-3" />
                  <span>Breakdown</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[420px] max-h-[520px] p-0">
                {/* Header */}
                <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-900 text-sm">Category Breakdown</h4>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Folder className="h-3 w-3" />
                      <span className="font-semibold">{totalBookmarks}</span>
                      <span className="text-gray-500">total</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">
                    {categories.length} {categories.length === 1 ? 'category' : 'categories'}
                  </p>
                </div>

                {/* Search Bar */}
                <div className="p-3 border-b bg-gray-50/50">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <Input
                      placeholder="Search categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-8 text-xs bg-white"
                    />
                  </div>
                </div>

                {/* Categories List with Scroll */}
                <div className="max-h-[350px] overflow-y-auto">
                  {filteredCategories.length === 0 ? (
                    <div className="py-8 text-center px-4">
                      <Folder className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 font-medium">No categories found</p>
                      {searchQuery && (
                        <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredCategories.map((category) => {
                        const count = category._count.bookmarks
                        const percentage = totalBookmarks > 0 ? (count / totalBookmarks) * 100 : 0
                        
                        return (
                          <div
                            key={category.id}
                            className="px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div
                                  className="w-7 h-7 rounded flex items-center justify-center text-white font-medium text-xs flex-shrink-0"
                                  style={{ backgroundColor: category.color }}
                                >
                                  {category.icon || category.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-gray-900 text-sm truncate">
                                  {category.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-sm font-bold text-gray-900">{count}</span>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                  backgroundColor: category.color,
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Metrics Display */}
          <div className="flex items-center gap-8">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">Total Visits</div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics?.totals?.totalVisits || 291}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">Engagement Score</div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics?.totals?.engagementScore || 13}
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#6B7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#6B7280' }}
                domain={[0, 'auto']}
              />
              <Tooltip 
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '11px',
                  padding: '8px 12px'
                }}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              {selectedMetrics.map((metricId, index) => {
                const colors = [
                  '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', 
                  '#10B981', '#3B82F6', '#EF4444', '#8B5CF6',
                  '#14B8A6', '#F97316'
                ]
                const metric = availableMetrics.find(m => m.id === metricId)
                return (
                  <Bar 
                    key={metricId}
                    dataKey={metricId} 
                    fill={colors[index % colors.length]} 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={8}
                    name={metric?.label || metricId}
                  />
                )
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}
