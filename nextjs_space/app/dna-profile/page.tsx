
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardAuth } from '@/components/dashboard-auth'
import AboutYou from '@/components/dna-profile/about-you'
import FavoritesView from '@/components/dna-profile/favorites-view'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { User, Heart, BookOpen, Search, BarChart3, Clock, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

type Section = 'about-you' | 'favorites' | 'playbooks' | 'search' | 'analytics' | 'time-capsule'

const sections = [
  { id: 'about-you' as Section, label: 'About You', icon: User },
  { id: 'favorites' as Section, label: 'Favorites', icon: Heart },
  { id: 'playbooks' as Section, label: 'Playbooks', icon: BookOpen },
  { id: 'search' as Section, label: 'Search', icon: Search },
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

  const renderSection = () => {
    switch (activeSection) {
      case 'about-you':
        return <AboutYou />
      case 'favorites':
        return <FavoritesView />
      case 'playbooks':
        return (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Playbooks</CardTitle>
              <CardDescription>Create and manage your workflow playbooks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Playbooks feature coming soon...</p>
            </CardContent>
          </Card>
        )
      case 'search':
        return (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Search Preferences</CardTitle>
              <CardDescription>Customize your search experience</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Search preferences coming soon...</p>
            </CardContent>
          </Card>
        )
      case 'analytics':
        return (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View your bookmark insights</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics feature coming soon...</p>
            </CardContent>
          </Card>
        )
      case 'time-capsule':
        return (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Time Capsule</CardTitle>
              <CardDescription>Preserve bookmarks for future reference</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Time Capsule feature coming soon...</p>
            </CardContent>
          </Card>
        )
      default:
        return <AboutYou />
    }
  }

  return (
    <DashboardAuth>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto py-8 px-4">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left sidebar - DNA Profile Sections */}
            <div className="lg:col-span-1 space-y-6">
              {/* DNA Profile Sections */}
              <Card className="bg-white border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">DNA Profile Sections</CardTitle>
                  <CardDescription className="text-muted-foreground">Build your personalized AI profile</CardDescription>
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
                          "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-foreground",
                          isActive 
                            ? "bg-black text-white font-medium" 
                            : "hover:bg-gray-100"
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

              {/* Profile Completion */}
              <Card className="bg-white border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Profile Completion</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">{completedSections.length}/{sections.length} sections</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2 bg-gray-200" />
                  </div>
                  <p className="text-sm text-muted-foreground">
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
    </DashboardAuth>
  )
}
