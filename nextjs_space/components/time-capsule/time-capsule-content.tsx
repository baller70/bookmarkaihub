
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  FileText, 
  Folder, 
  Heart,
  GitCompare,
  Camera,
  Calendar as CalendarIcon,
  List,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Download,
  Share2
} from 'lucide-react'
import { ScheduleModal } from './schedule-modal'
import { CompareModal } from './compare-modal'
import { CreateSnapshotModal } from './create-snapshot-modal'

interface Capsule {
  id: string
  title: string
  description: string
  status: 'active' | 'inactive'
  type: 'manual' | 'scheduled'
  bookmarks: number
  folders: number
  favorites: number
  size: string
  date: string
  stats: {
    folders: number
    links: number
    tags: number
  }
  aiSummary: string
}

// Sample data
const sampleCapsules: Capsule[] = [
  {
    id: '1',
    title: 'Q4 2024 Development Resources',
    description: 'Snapshot of all development-related bookmarks at the end of Q4',
    status: 'active',
    type: 'manual',
    bookmarks: 1247,
    folders: 12,
    favorites: 89,
    size: '15.6 MB',
    date: 'Jan 20, 2024',
    stats: { folders: 23, links: 12, tags: 5 },
    aiSummary: 'This snapshot captures a significant expansion in React and TypeScript resources, with notable additions in AI/ML tooling and design systems. The collection shows a 18% growth in development bookmarks with improved organization.'
  },
  {
    id: '2',
    title: 'Weekly Auto-Backup',
    description: 'Automated weekly snapshot',
    status: 'active',
    type: 'scheduled',
    bookmarks: 1183,
    folders: 11,
    favorites: 82,
    size: '14.2 MB',
    date: 'Jan 15, 2024',
    stats: { folders: 21, links: 11, tags: 4 },
    aiSummary: 'Automated weekly backup showing consistent bookmark collection growth.'
  },
  {
    id: '3',
    title: 'Pre-Migration Backup',
    description: 'Backup before major system migration',
    status: 'inactive',
    type: 'manual',
    bookmarks: 10238,
    folders: 10,
    favorites: 76,
    size: '12.8 MB',
    date: 'Jan 1, 2024',
    stats: { folders: 19, links: 10, tags: 3 },
    aiSummary: 'Complete backup before system migration, preserving all bookmarks and folders.'
  }
]

interface TimeCapsuleContentProps {
  showTitle?: boolean
}

export function TimeCapsuleContent({ showTitle = true }: TimeCapsuleContentProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const totalSize = sampleCapsules.reduce((acc, capsule) => {
    const size = parseFloat(capsule.size)
    return acc + size
  }, 0)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))
  }

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)
    const days = []
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December']

    // Empty cells before the first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDays = new Date(year, month, 0).getDate()
      const day = prevMonthDays - startingDayOfWeek + i + 1
      days.push(
        <div key={`prev-${i}`} className="text-center py-2 text-muted-foreground/40 text-sm">
          {day}
        </div>
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isToday = date.toDateString() === new Date().toDateString()
      
      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`text-center py-2 text-sm cursor-pointer rounded hover:bg-muted ${
            isToday ? 'bg-white text-black border hover:bg-gray-50' : ''
          }`}
        >
          {day}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold uppercase">Calendar View</h3>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-muted rounded">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold">{monthNames[month]} {year}</span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-muted rounded">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days}
          </div>
        </div>
      </div>
    )
  }

  const renderCapsuleDetail = () => {
    if (!selectedCapsule) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <Clock className="w-16 h-16 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-2 uppercase">Select a Capsule</h3>
          <p className="text-sm text-muted-foreground">Choose a time capsule to view details</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1 truncate text-black uppercase">{selectedCapsule.title}</h3>
            <Badge className="bg-white text-black border hover:bg-gray-50">
              {selectedCapsule.type}
            </Badge>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2 text-black uppercase">Description</h4>
          <p className="text-sm text-muted-foreground">{selectedCapsule.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-semibold mb-1 text-black">Created</div>
            <div className="text-sm text-muted-foreground">{selectedCapsule.date}</div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-1 text-black">Size</div>
            <div className="text-sm text-muted-foreground">{selectedCapsule.size}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-semibold mb-1 text-black">Bookmarks</div>
            <div className="text-sm text-muted-foreground">{selectedCapsule.bookmarks}</div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-1 text-black">Folders</div>
            <div className="text-sm text-muted-foreground">{selectedCapsule.folders}</div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-black uppercase">
            <Sparkles className="w-4 h-4" />
            AI Summary
          </h4>
          <p className="text-sm text-muted-foreground">{selectedCapsule.aiSummary}</p>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <Button className="w-full bg-white text-black border hover:bg-gray-50">
            <RotateCcw className="w-4 h-4 mr-2" />
            Restore
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" className="w-full">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div>
          <h1 className="text-3xl font-bold mb-2 uppercase">Time Capsule</h1>
          <p className="text-muted-foreground">
            Explore your digital journey and see how your interests evolved over time
          </p>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 uppercase">Time Capsule</h2>
            <p className="text-sm text-muted-foreground">
              Versioned snapshots of your bookmark collection
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowScheduleModal(true)}>
              <Clock className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowCompareModal(true)}>
              <GitCompare className="w-4 h-4 mr-2" />
              Compare
            </Button>
            <Button 
              size="sm" 
              className="bg-white text-black border hover:bg-gray-50"
              onClick={() => setShowCreateModal(true)}
            >
              <Camera className="w-4 h-4 mr-2" />
              Create Snapshot
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">View:</span>
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className={viewMode === 'list' ? 'bg-white text-black border-0 hover:bg-gray-50' : ''}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                className={viewMode === 'calendar' ? 'bg-white text-black border-0 hover:bg-gray-50' : ''}
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Calendar
              </Button>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            {sampleCapsules.length} capsules • {totalSize.toFixed(1)} MB total
          </span>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className={selectedCapsule ? 'col-span-8' : 'col-span-12'}>
            {viewMode === 'list' ? (
              <div className="space-y-4">
                {sampleCapsules.map((capsule) => (
                  <Card
                    key={capsule.id}
                    className={`p-6 cursor-pointer transition-all hover:shadow-md bg-white ${
                      selectedCapsule?.id === capsule.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedCapsule(capsule)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            capsule.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 text-black uppercase">{capsule.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {capsule.description}
                          </p>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              <span>{capsule.bookmarks}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Folder className="w-4 h-4" />
                              <span>{capsule.folders}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              <span>{capsule.favorites}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="bg-white text-black border hover:bg-gray-50">
                          {capsule.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{capsule.date}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">{capsule.size}</div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Folder className="w-4 h-4" />
                          <span>{capsule.stats.folders}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{capsule.stats.links}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">★</span>
                          <span>{capsule.stats.tags}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 bg-white">
                {renderCalendar()}
              </Card>
            )}
          </div>

          {selectedCapsule && (
            <div className="col-span-4">
              <Card className="p-6 sticky top-6 bg-white">
                {renderCapsuleDetail()}
              </Card>
            </div>
          )}

          {viewMode === 'calendar' && selectedDate && (
            <div className="col-span-4">
              <Card className="p-6 bg-white">
                <h3 className="font-semibold mb-4 uppercase">
                  Capsules on {selectedDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </h3>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No capsules created on this date</p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      <ScheduleModal open={showScheduleModal} onOpenChange={setShowScheduleModal} />
      <CompareModal open={showCompareModal} onOpenChange={setShowCompareModal} capsules={sampleCapsules} />
      <CreateSnapshotModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  )
}
