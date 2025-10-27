"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

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
        <div className="flex items-center gap-4">
          <div>
            <h4 className="text-base font-semibold text-gray-900">Analytics Chart</h4>
            <p className="text-xs text-gray-500 mt-0.5">Last 28 days</p>
          </div>
          
          {/* Metrics Dropdown with Checkboxes */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-2 text-xs hover:bg-gray-50"
                aria-label="Select metrics"
                type="button"
              >
                <span>Metrics ({selectedMetrics.length}/{availableMetrics.length})</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56" sideOffset={5}>
              <div className="px-2 py-1.5 text-xs text-gray-500 font-medium border-b">
                Select up to 5 metrics
              </div>
              {availableMetrics.map((metric) => (
                <DropdownMenuCheckboxItem
                  key={metric.id}
                  checked={selectedMetrics.includes(metric.id)}
                  onCheckedChange={() => toggleMetric(metric.id)}
                  disabled={
                    (!selectedMetrics.includes(metric.id) && selectedMetrics.length >= 5) ||
                    (selectedMetrics.includes(metric.id) && selectedMetrics.length === 1)
                  }
                  className="text-sm"
                >
                  {metric.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
