
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardAuth } from '@/components/dashboard-auth'
import AboutYou from '@/components/dna-profile/about-you'
import FavoritesView from '@/components/dna-profile/favorites-view'
import { AnalyticsContent } from '@/components/analytics-content'
import { TimeCapsuleContent } from '@/components/time-capsule/time-capsule-content'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Heart, BarChart3, Clock, ArrowLeft, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Section = 'about-you' | 'favorites' | 'analytics' | 'time-capsule'

const sections = [
  { id: 'about-you' as Section, label: 'About You', icon: User },
  { id: 'favorites' as Section, label: 'Favorites', icon: Heart },
  { id: 'analytics' as Section, label: 'Analytics', icon: BarChart3 },
  { id: 'time-capsule' as Section, label: 'Time Capsule', icon: Clock },
]

export default function DnaProfilePage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<Section>('about-you')
  const [completedSections, setCompletedSections] = useState<Section[]>([])

  useEffect(() => {
    // Fetch profile completion status
    const fetchCompletionStatus = async () => {
      try {
        const res = await fetch('/api/dna-profile')
        if (res.ok) {
          const data = await res.json()
          const completed: Section[] = []
          
          // Check which sections are completed based on data
          if (data.industry && data.role && data.goals && data.goals.length > 0) {
            completed.push('about-you')
          }
          if (data.favoriteWebsites && data.favoriteWebsites.length > 0) {
            completed.push('favorites')
          }
          // Add more completion checks as needed
          
          setCompletedSections(completed)
        }
      } catch (error) {
        console.error('Failed to fetch completion status:', error)
      }
    }
    
    fetchCompletionStatus()
  }, [])

  const progressPercentage = (completedSections.length / sections.length) * 100

  const handleSaveProfile = async () => {
    toast.success('Profile saved successfully!')
  }

  const getCurrentSectionLabel = () => {
    return sections.find(s => s.id === activeSection)?.label || 'About You'
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'about-you':
        return <AboutYou />
      case 'favorites':
        return <FavoritesView />
      case 'analytics':
        return <AnalyticsContent showTitle={false} />
      case 'time-capsule':
        return <TimeCapsuleContent showTitle={false} />
      default:
        return <AboutYou />
    }
  }

  return (
    <DashboardAuth>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4">
          {/* Main bordered container */}
          <div className="border border-gray-300 rounded-lg p-4 sm:p-6 bg-white">
            {/* Top Navigation Bar */}
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4">
            <div className="flex items-center gap-4 sm:gap-8 flex-wrap w-full sm:w-auto">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="gap-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 px-0"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2 sm:gap-3">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base font-semibold">DNA Profile</span>
                <span className="text-gray-400 hidden sm:inline">-</span>
                <span className="text-sm sm:text-base text-gray-700 hidden sm:inline">{getCurrentSectionLabel()}</span>
              </div>
            </div>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100 text-xs">
              AI-Powered
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left sidebar - DNA Profile Sections */}
            <div className="lg:col-span-1 space-y-6">
              {/* DNA Profile Sections */}
              <Card className="bg-white border shadow-sm">
                <CardHeader className="pb-4">
                  <h2 className="text-xl font-bold text-black mb-2 uppercase">DNA Profile</h2>
                  <p className="text-sm text-gray-600">Build your personalized AI profile</p>
                </CardHeader>
                <CardContent className="space-y-2 pb-6">
                  {sections.map((section) => {
                    const Icon = section.icon
                    const isActive = activeSection === section.id
                    const isCompleted = completedSections.includes(section.id)
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                          isActive 
                            ? "bg-black text-white font-medium" 
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="flex-1">{section.label}</span>
                        {isCompleted && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </button>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Progress */}
              <Card className="bg-white border shadow-sm">
                <CardHeader className="pb-4">
                  <h3 className="text-base font-semibold text-black uppercase">PROGRESS</h3>
                </CardHeader>
                <CardContent className="space-y-4 pb-6">
                  <div className="space-y-2">
                    <Progress value={progressPercentage} className="h-2 bg-gray-200" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Complete all sections for better AI recommendations
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main content area */}
            <div className="lg:col-span-2">
              {renderSection()}
            </div>
          </div>
          </div>
        </div>
      </div>
    </DashboardAuth>
  )
}
