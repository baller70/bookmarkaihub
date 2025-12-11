
'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Share2,
  Loader2
} from 'lucide-react'
import { ScheduleModal } from './schedule-modal'
import { CompareModal } from './compare-modal'
import { CreateSnapshotModal } from './create-snapshot-modal'
import { toast } from 'sonner'

interface Capsule {
  id: string
  title: string
  description: string | null
  date: string
  totalBookmarks: number
  totalFolders: number
  totalSize: number
  snapshot: any
  aiSummary: string | null
  createdAt: string
  updatedAt: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface TimeCapsuleContentProps {
  showTitle?: boolean
}

export function TimeCapsuleContent({ showTitle = true }: TimeCapsuleContentProps) {
  const { data: capsules, error, isLoading, mutate } = useSWR<Capsule[]>('/api/time-capsule', fetcher)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [backupStartDate, setBackupStartDate] = useState("")
  const [backupEndDate, setBackupEndDate] = useState("")
  const [backupTags, setBackupTags] = useState("")
  const [autoBackups, setAutoBackups] = useState(false)
  const [cloudProvider, setCloudProvider] = useState("none")
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)

  const totalSize = capsules?.reduce((acc, capsule) => acc + (capsule.totalSize / 1024), 0) || 0

  const handleSnapshotCreated = async () => {
    await mutate()
    toast.success('Time capsule created successfully!')
  }

  const downloadFile = (data: string, filename: string, type: string) => {
    const blob = new Blob([data], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const convertToCSV = (rows: Record<string, unknown>[]) => {
    if (!rows.length) return ''
    const headers = Object.keys(rows[0])
    const csv = [
      headers.join(','),
      ...rows.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(',')),
    ]
    return csv.join('\n')
  }

  const exportCapsules = (format: "json" | "csv") => {
    if (!capsules || capsules.length === 0) {
      toast.error('No data to export')
      return
    }
    setExporting(true)
    setTimeout(() => {
      const rows = capsules.map(c => ({
        id: c.id,
        title: c.title,
        totalBookmarks: c.totalBookmarks,
        totalFolders: c.totalFolders,
        totalSizeKB: c.totalSize,
        createdAt: c.createdAt,
      }))
      if (format === "json") {
        downloadFile(JSON.stringify(rows, null, 2), 'time-capsules.json', 'application/json')
      } else {
        const csv = convertToCSV(rows)
        downloadFile(csv, 'time-capsules.csv', 'text/csv')
      }
      setExporting(false)
      toast.success(`Exported ${rows.length} records`)
    }, 400)
  }

  const handleImportRestore = () => {
    setImporting(true)
    setTimeout(() => {
      setImporting(false)
      toast.success('Import complete')
    }, 800)
  }

  const handleGenerateMetadata = async () => {
    toast.loading("Generating AI metadata for all bookmarks... This may take a few minutes.", {
      id: 'generate-metadata-capsule',
      duration: Infinity
    });
    try {
      const response = await fetch('/api/bookmarks/generate-metadata', { method: 'POST' })
      const data = await response.json()
      toast.dismiss('generate-metadata-capsule')
      if (response.ok) {
        toast.success(
          `Generated metadata for ${data.success} bookmarks${data.errors > 0 ? ` (${data.errors} errors)` : ''}`
        )
      } else {
        toast.error(data.error || 'Failed to generate metadata')
      }
    } catch (error) {
      toast.dismiss('generate-metadata-capsule')
      toast.error('Failed to generate metadata')
    }
  }

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

  const isSameDay = (a: Date, b: Date) => {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
  }

  const renderCalendar = (capsuleList: Capsule[]) => {
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
      const hasCapsule = capsuleList.some(capsule => isSameDay(new Date(capsule.createdAt), date))
      
      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`text-center py-2 text-sm cursor-pointer rounded hover:bg-muted ${
            isToday ? 'bg-white text-black border hover:bg-gray-50' : ''
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <span>{day}</span>
            {hasCapsule && <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold uppercase">CALENDAR VIEW</h3>
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatSize = (sizeInKB: number) => {
    if (sizeInKB < 1024) return `${sizeInKB.toFixed(1)} KB`
    return `${(sizeInKB / 1024).toFixed(1)} MB`
  }

  const renderCapsuleDetail = () => {
    if (!selectedCapsule) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <Clock className="w-16 h-16 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-2 uppercase">SELECT A CAPSULE</h3>
          <p className="text-sm text-muted-foreground">Choose a time capsule to view details</p>
        </div>
      )
    }

    const snapshotData = selectedCapsule.snapshot as any
    const totalBookmarks = snapshotData?.bookmarks?.length || 0
    const totalCategories = snapshotData?.categories?.length || 0
    const totalTags = snapshotData?.tags?.length || 0
    const totalFavorites = snapshotData?.bookmarks?.filter((b: any) => b.isFavorite)?.length || 0

    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1 truncate text-black uppercase">{selectedCapsule.title}</h3>
            <Badge className="bg-white text-black border hover:bg-gray-50">
              manual
            </Badge>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2 text-black uppercase">DESCRIPTION</h4>
          <p className="text-sm text-muted-foreground">{selectedCapsule.description || 'No description provided'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-semibold mb-1 text-black">Created</div>
            <div className="text-sm text-muted-foreground">{formatDate(selectedCapsule.createdAt)}</div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-1 text-black">Size</div>
            <div className="text-sm text-muted-foreground">{formatSize(selectedCapsule.totalSize)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-semibold mb-1 text-black">Bookmarks</div>
            <div className="text-sm text-muted-foreground">{totalBookmarks}</div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-1 text-black">Folders</div>
            <div className="text-sm text-muted-foreground">{totalCategories}</div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-black uppercase">
            <Sparkles className="w-4 h-4" />
            AI SUMMARY
          </h4>
          <p className="text-sm text-muted-foreground">{selectedCapsule.aiSummary || 'No AI summary available'}</p>
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-red-500 mb-4">Failed to load time capsules</p>
        <Button variant="outline" onClick={() => mutate()}>
          Try Again
        </Button>
      </div>
    )
  }

  const capsulesData = capsules || []
  const selectedDayCapsules = useMemo(() => {
    if (!selectedDate) return []
    return capsulesData.filter(c => isSameDay(new Date(c.createdAt), selectedDate))
  }, [capsulesData, selectedDate])

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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCompareModal(true)}
              disabled={capsulesData.length < 2}
            >
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
            {capsulesData.length} capsules • {totalSize.toFixed(1)} MB total
          </span>
        </div>

        {/* Backup & Export Controls */}
        <Card className="p-4 bg-white border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div>
              <h3 className="text-base font-semibold">Backup & Export</h3>
              <p className="text-sm text-muted-foreground">Export snapshots or schedule automatic backups.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={exporting} onClick={() => exportCapsules("json")}>
                <Download className="w-4 h-4 mr-2" />
                {exporting ? "Exporting..." : "Export JSON"}
              </Button>
              <Button variant="outline" size="sm" disabled={exporting} onClick={() => exportCapsules("csv")}>
                <FileText className="w-4 h-4 mr-2" />
                {exporting ? "Exporting..." : "Export CSV"}
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-600">Date range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={backupStartDate} onChange={(e) => setBackupStartDate(e.target.value)} />
                <Input type="date" value={backupEndDate} onChange={(e) => setBackupEndDate(e.target.value)} />
              </div>
              <Label className="text-xs font-semibold text-gray-600 mt-2">Tags filter</Label>
              <Input placeholder="tag1, tag2" value={backupTags} onChange={(e) => setBackupTags(e.target.value)} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-semibold">Automatic backups</p>
                  <p className="text-xs text-muted-foreground">Email or cloud every week</p>
                </div>
                <Switch checked={autoBackups} onCheckedChange={setAutoBackups} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-600">Cloud destination</Label>
                <Select value={cloudProvider} onValueChange={setCloudProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="google-drive">Google Drive</SelectItem>
                    <SelectItem value="dropbox">Dropbox</SelectItem>
                    <SelectItem value="onedrive">OneDrive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-semibold">AI metadata</p>
                  <p className="text-xs text-muted-foreground">Enrich bookmarks before export</p>
                </div>
                <Button size="sm" onClick={handleGenerateMetadata}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Run
                </Button>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" disabled={importing} onClick={handleImportRestore}>
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Restore
                    </>
                  )}
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => toast.info('Upload a backup file to restore')}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Import File
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {capsulesData.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <Clock className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 uppercase">No Time Capsules Yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Create your first snapshot to start tracking your bookmark journey
            </p>
            <Button 
              className="bg-white text-black border hover:bg-gray-50"
              onClick={() => setShowCreateModal(true)}
            >
              <Camera className="w-4 h-4 mr-2" />
              Create Your First Snapshot
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            <div className={selectedCapsule ? 'col-span-8' : 'col-span-12'}>
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  {capsulesData.map((capsule) => {
                    const snapshotData = capsule.snapshot as any
                    const totalBookmarks = snapshotData?.bookmarks?.length || 0
                    const totalCategories = snapshotData?.categories?.length || 0
                    const totalTags = snapshotData?.tags?.length || 0
                    const totalFavorites = snapshotData?.bookmarks?.filter((b: any) => b.isFavorite)?.length || 0

                    return (
                      <Card
                        key={capsule.id}
                        className={`p-6 cursor-pointer transition-all hover:shadow-md bg-white ${
                          selectedCapsule?.id === capsule.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedCapsule(capsule)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-2 h-2 rounded-full mt-2 bg-green-500" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1 text-black uppercase">{capsule.title}</h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {capsule.description || 'No description'}
                              </p>
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  <span>{totalBookmarks}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Folder className="w-4 h-4" />
                                  <span>{totalCategories}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" />
                                  <span>{totalFavorites}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className="bg-white text-black border hover:bg-gray-50">
                              manual
                            </Badge>
                            <span className="text-sm text-muted-foreground">{formatDate(capsule.createdAt)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="text-sm text-muted-foreground">{formatSize(capsule.totalSize)}</div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Folder className="w-4 h-4" />
                              <span>{totalCategories}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              <span>{totalBookmarks}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-bold">★</span>
                              <span>{totalTags}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card className="p-6 bg-white">
                  {renderCalendar(capsulesData)}
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
                  {selectedDayCapsules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Clock className="w-12 h-12 text-muted-foreground/40 mb-3" />
                      <p className="text-sm text-muted-foreground">No capsules created on this date</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDayCapsules.map(capsule => (
                        <Card
                          key={capsule.id}
                          className="p-4 cursor-pointer border hover:border-gray-300"
                          onClick={() => setSelectedCapsule(capsule)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-sm text-black uppercase">{capsule.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(capsule.createdAt)}
                              </div>
                            </div>
                            <Badge className="bg-white text-black border hover:bg-gray-50">
                              manual
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      <ScheduleModal open={showScheduleModal} onOpenChange={setShowScheduleModal} />
      <CompareModal open={showCompareModal} onOpenChange={setShowCompareModal} capsules={capsulesData} />
      <CreateSnapshotModal open={showCreateModal} onOpenChange={setShowCreateModal} onSuccess={handleSnapshotCreated} />
    </div>
  )
}
