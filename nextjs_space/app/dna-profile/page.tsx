
"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { 
  User,
  TrendingUp,
  Clock,
  Star,
  Target,
  Zap,
  Award,
  Calendar,
  Globe,
  Heart,
  Bookmark,
  Tag,
  Settings
} from "lucide-react"

export default function DnaProfilePage() {
  const { data: session } = useSession() || {}

  const userStats = {
    totalBookmarks: 15,
    categoriesUsed: 8,
    tagsCreated: 12,
    totalVisits: 342,
    avgTimeSpent: 45,
    favoriteCategory: "Development",
    mostUsedTag: "Design",
    productivity: 87,
    organizationScore: 92,
    consistencyScore: 78,
  }

  const usagePatterns = [
    { day: "Mon", bookmarks: 12, visits: 45 },
    { day: "Tue", bookmarks: 8, visits: 32 },
    { day: "Wed", bookmarks: 15, visits: 58 },
    { day: "Thu", bookmarks: 10, visits: 41 },
    { day: "Fri", bookmarks: 14, visits: 52 },
    { day: "Sat", bookmarks: 6, visits: 24 },
    { day: "Sun", bookmarks: 9, visits: 35 },
  ]

  const achievements = [
    { id: 1, name: "Early Adopter", description: "Joined BookmarkHub", icon: "🎉", earned: true },
    { id: 2, name: "Organizer", description: "Created 10+ categories", icon: "📂", earned: true },
    { id: 3, name: "Power User", description: "100+ bookmarks saved", icon: "⚡", earned: false },
    { id: 4, name: "Consistent", description: "7-day streak", icon: "🔥", earned: true },
    { id: 5, name: "Explorer", description: "Tried all view modes", icon: "🌟", earned: true },
    { id: 6, name: "Social", description: "Shared 5+ collections", icon: "🤝", earned: false },
  ]

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{session?.user?.name || "User"}</h1>
                <p className="text-gray-600 mb-3">{session?.user?.email}</p>
                <div className="flex gap-2">
                  <Badge className="bg-blue-100 text-blue-800">Pro Member</Badge>
                  <Badge className="bg-green-100 text-green-800">Active User</Badge>
                  <Badge className="bg-purple-100 text-purple-800">Verified</Badge>
                </div>
              </div>
              <Button size="lg">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Bookmark className="h-6 w-6 text-blue-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{userStats.totalBookmarks}</h3>
              <p className="text-sm text-gray-600">Total Bookmarks</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{userStats.totalVisits}</h3>
              <p className="text-sm text-gray-600">Total Visits</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{userStats.avgTimeSpent}m</h3>
              <p className="text-sm text-gray-600">Avg. Time Spent</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{userStats.categoriesUsed}</h3>
              <p className="text-sm text-gray-600">Categories Used</p>
            </Card>
          </div>

          {/* DNA Scores */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold mb-6">Your BookmarkHub DNA</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">Productivity</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{userStats.productivity}%</span>
                </div>
                <Progress value={userStats.productivity} className="h-3" />
                <p className="text-sm text-gray-600 mt-2">How efficiently you use your bookmarks</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Organization</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{userStats.organizationScore}%</span>
                </div>
                <Progress value={userStats.organizationScore} className="h-3" />
                <p className="text-sm text-gray-600 mt-2">How well you organize your content</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold">Consistency</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">{userStats.consistencyScore}%</span>
                </div>
                <Progress value={userStats.consistencyScore} className="h-3" />
                <p className="text-sm text-gray-600 mt-2">Your daily activity patterns</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weekly Activity */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Weekly Activity</h2>
              <div className="space-y-4">
                {usagePatterns.map((pattern) => (
                  <div key={pattern.day}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{pattern.day}</span>
                      <span className="text-sm text-gray-600">{pattern.visits} visits</span>
                    </div>
                    <Progress value={(pattern.visits / 60) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Achievements */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Achievements</h2>
              <div className="grid grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      achievement.earned
                        ? "border-blue-200 bg-blue-50/50"
                        : "border-gray-200 bg-gray-50/50 opacity-50"
                    )}
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <h3 className="font-semibold text-sm mb-1">{achievement.name}</h3>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                    {achievement.earned && (
                      <Badge className="mt-2 bg-green-100 text-green-800 text-xs">
                        Earned
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Favorite Categories */}
          <Card className="p-6 mt-8">
            <h2 className="text-xl font-bold mb-6">Top Interests</h2>
            <div className="flex flex-wrap gap-3">
              <Badge className="px-4 py-2 text-sm bg-blue-100 text-blue-800">
                <Heart className="h-3 w-3 mr-2" />
                {userStats.favoriteCategory}
              </Badge>
              <Badge className="px-4 py-2 text-sm bg-purple-100 text-purple-800">
                <Tag className="h-3 w-3 mr-2" />
                {userStats.mostUsedTag}
              </Badge>
              <Badge className="px-4 py-2 text-sm bg-green-100 text-green-800">
                <Award className="h-3 w-3 mr-2" />
                High Performer
              </Badge>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
