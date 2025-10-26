
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  { id: "7", label: "LAST 7 DAYS" },
  { id: "30", label: "LAST 30 DAYS" },
  { id: "90", label: "LAST 3 MONTHS" },
]

export function AnalyticsChart({ analytics }: AnalyticsChartProps) {
  const [selectedRange, setSelectedRange] = useState("30")

  const chartData = analytics?.analytics?.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    visits: item.totalVisits,
    engagement: item.engagementScore,
  })) || []

  return (
    <Card className="p-6 bg-gradient-to-r from-white via-gray-50/20 to-white border border-gray-200 hover:border-blue-300 transition-colors duration-300 shadow-lg hover:shadow-xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">TOM ANALYTICS CHART</h3>
            <p className="text-sm text-gray-500">
              Filtering data for {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
          
          {/* Time Range Filters */}
          <div className="flex items-center gap-2">
            {timeRanges.map((range) => (
              <Button
                key={range.id}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRange(range.id)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md",
                  selectedRange === range.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.totals?.totalVisits || 0}
            </div>
            <div className="text-sm text-gray-500">Total Visits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.totals?.engagementScore || 0}
            </div>
            <div className="text-sm text-gray-500">Engagement Score</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '11px'
                }}
              />
              <Bar 
                dataKey="visits" 
                fill="#3B82F6" 
                radius={[2, 2, 0, 0]}
                name="Total Visits"
              />
              <Bar 
                dataKey="engagement" 
                fill="#10B981" 
                radius={[2, 2, 0, 0]}
                name="Engagement Score"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}
