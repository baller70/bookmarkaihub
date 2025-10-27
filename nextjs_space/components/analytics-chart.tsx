
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { cn } from "@/lib/utils"

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
}

const timeRanges = [
  { id: "90", label: "LAST 3 MONTHS" },
  { id: "30", label: "LAST 30 DAYS" },
  { id: "7", label: "LAST 7 DAYS" },
]

export function AnalyticsChart({ analytics }: AnalyticsChartProps) {
  const [selectedRange, setSelectedRange] = useState("90")
  const [selectedMetrics, setSelectedMetrics] = useState("2")

  const chartData = analytics?.analytics?.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    visits: item.totalVisits,
    engagement: item.engagementScore,
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
                onClick={() => setSelectedRange(range.id)}
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
            
            {/* Metrics Dropdown */}
            <Select value={selectedMetrics} onValueChange={setSelectedMetrics}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Metrics (2)</SelectItem>
                <SelectItem value="1">Metric (1)</SelectItem>
                <SelectItem value="3">Metrics (3)</SelectItem>
              </SelectContent>
            </Select>
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
              <Bar 
                dataKey="visits" 
                fill="#6366F1" 
                radius={[4, 4, 0, 0]}
                maxBarSize={8}
                name="Visits"
              />
              <Bar 
                dataKey="engagement" 
                fill="#8B5CF6" 
                radius={[4, 4, 0, 0]}
                maxBarSize={8}
                name="Engagement"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}
