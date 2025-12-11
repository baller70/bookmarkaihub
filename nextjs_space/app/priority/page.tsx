"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Target, 
  Search, 
  RefreshCw, 
  ChevronRight,
  Zap,
  BookOpen,
  BarChart3,
  Flame,
  ArrowUpRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface Bookmark {
  id: string
  title: string
  url: string
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
}

export default function PriorityPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/bookmarks')
      if (response.ok) {
        const data = await response.json()
        setBookmarks(data)
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const priorityConfig = {
    URGENT: {
      label: "Urgent",
      description: "Requires immediate attention",
      color: "from-red-500 to-rose-600",
      bgColor: "bg-red-500",
      lightBg: "bg-red-100 dark:bg-red-900/30",
      textColor: "text-red-600 dark:text-red-400",
      borderColor: "border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700",
      icon: AlertTriangle,
      count: bookmarks.filter(b => b.priority === 'URGENT').length
    },
    HIGH: {
      label: "High",
      description: "Important, handle soon",
      color: "from-orange-500 to-amber-600",
      bgColor: "bg-orange-500",
      lightBg: "bg-orange-100 dark:bg-orange-900/30",
      textColor: "text-orange-600 dark:text-orange-400",
      borderColor: "border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700",
      icon: TrendingUp,
      count: bookmarks.filter(b => b.priority === 'HIGH').length
    },
    MEDIUM: {
      label: "Medium",
      description: "Standard priority items",
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-yellow-500",
      lightBg: "bg-yellow-100 dark:bg-yellow-900/30",
      textColor: "text-yellow-600 dark:text-yellow-400",
      borderColor: "border-yellow-200 dark:border-yellow-800 hover:border-yellow-300 dark:hover:border-yellow-700",
      icon: Clock,
      count: bookmarks.filter(b => b.priority === 'MEDIUM').length
    },
    LOW: {
      label: "Low",
      description: "Can wait, no rush",
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-500",
      lightBg: "bg-emerald-100 dark:bg-emerald-900/30",
      textColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700",
      icon: Target,
      count: bookmarks.filter(b => b.priority === 'LOW').length
    }
  }

  const handleFolderClick = (priority: string) => {
    router.push(`/priority/${priority.toLowerCase()}`)
  }

  const filteredPriorities = Object.entries(priorityConfig).filter(([_, config]) =>
    config.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalBookmarks = bookmarks.length
  const urgentCount = priorityConfig.URGENT.count
  const highCount = priorityConfig.HIGH.count

  if (loading) {
    return (
      <DashboardAuth>
        <DashboardLayout>
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading priorities...</p>
            </div>
          </div>
        </DashboardLayout>
      </DashboardAuth>
    )
  }

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="p-4 md:p-6 lg:p-8">
          {/* Main Container with light black background */}
          <div className="max-w-7xl mx-auto bg-gray-900/5 dark:bg-gray-950/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/25">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                    Priority
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Manage bookmarks by importance level
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBookmarks}
                className="h-9"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Bookmarks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalBookmarks}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Urgent</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{urgentCount}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">High Priority</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{highCount}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Needs Attention</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{urgentCount + highCount}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>
          </div>

          {/* Distribution Overview */}
          {totalBookmarks > 0 && (
            <Card className="mb-8 p-5 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Priority Distribution
              </h3>
              <div className="space-y-3">
                {Object.entries(priorityConfig).map(([key, config]) => {
                  const percent = totalBookmarks > 0 ? (config.count / totalBookmarks) * 100 : 0
                  return (
                    <div key={key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={cn("h-2.5 w-2.5 rounded-full", config.bgColor)} />
                          <span className="text-gray-700 dark:text-gray-300">{config.label}</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {config.count} ({percent.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-500", config.bgColor)}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search priority levels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Priority Levels Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Priority Levels
              </h2>
              <Badge variant="secondary" className="text-xs">
                4 levels
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPriorities.map(([priority, config]) => {
                const Icon = config.icon
                const percent = totalBookmarks > 0 ? (config.count / totalBookmarks) * 100 : 0
                
                return (
                  <Card
                    key={priority}
                    className={cn(
                      "group p-5 bg-white dark:bg-slate-800 hover:shadow-lg transition-all cursor-pointer",
                      config.borderColor
                    )}
                    onClick={() => handleFolderClick(priority)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-lg",
                        config.color
                      )}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {config.label}
                          </h3>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                          {config.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {config.count} bookmark{config.count !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", config.lightBg, config.textColor)}
                          >
                            {percent.toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Empty State */}
          {totalBookmarks === 0 && (
            <Card className="mt-8 p-12 text-center bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Bookmarks Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                Create bookmarks and assign priorities to get started
              </p>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </Card>
          )}
          </div>
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
