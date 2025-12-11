'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Globe,
  Link2,
  LinkIcon,
  Unlink,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Play,
  Pause,
  RefreshCw,
  Search,
  Filter,
  Settings,
  Calendar,
  Mail,
  Trash2,
  Archive,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Zap,
  Timer,
  History,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  MoreHorizontal,
  Download,
  ArrowUpRight,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react'

type LinkStatus = 'healthy' | 'broken' | 'redirect' | 'timeout' | 'unknown' | 'checking'

interface ValidatedLink {
  id: string
  url: string
  title: string
  domain: string
  status: LinkStatus
  statusCode?: number
  responseTime?: number
  lastChecked?: string
  redirectUrl?: string
  error?: string
}

interface ValidationStats {
  total: number
  healthy: number
  broken: number
  redirects: number
  timeouts: number
  unknown: number
  lastValidation?: string
  avgResponseTime?: number
}

interface ValidationHistory {
  id: string
  timestamp: string
  total: number
  healthy: number
  broken: number
  redirects: number
  timeouts: number
  duration: number
}

export function LinkValidatorSection() {
  // Bookmarks data
  const [bookmarks, setBookmarks] = useState<ValidatedLink[]>([])
  const [loadingBookmarks, setLoadingBookmarks] = useState(true)
  
  // Validation state
  const [isValidating, setIsValidating] = useState(false)
  const [validationProgress, setValidationProgress] = useState(0)
  const [currentlyChecking, setCurrentlyChecking] = useState<string | null>(null)
  const [validatedLinks, setValidatedLinks] = useState<ValidatedLink[]>([])
  
  // Stats
  const [stats, setStats] = useState<ValidationStats>({
    total: 0,
    healthy: 0,
    broken: 0,
    redirects: 0,
    timeouts: 0,
    unknown: 0
  })
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | LinkStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'status' | 'domain' | 'responseTime'>('status')
  
  // Settings
  const [validationScope, setValidationScope] = useState<'all' | 'selected' | 'unchecked'>('all')
  const [schedule, setSchedule] = useState<'manual' | 'daily' | 'weekly' | 'monthly'>('weekly')
  const [emailSummary, setEmailSummary] = useState(true)
  const [autoArchiveBroken, setAutoArchiveBroken] = useState(false)
  const [concurrentChecks, setConcurrentChecks] = useState('5')
  const [timeoutSeconds, setTimeoutSeconds] = useState('10')
  
  // UI state
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState({
    settings: false,
    history: false
  })
  const [showResultsDetail, setShowResultsDetail] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  
  // Validation history
  const [validationHistory, setValidationHistory] = useState<ValidationHistory[]>([])

  // Logo enhancement state
  const [isEnhancingLogos, setIsEnhancingLogos] = useState(false)
  const [logoEnhanceProgress, setLogoEnhanceProgress] = useState(0)
  const [logoEnhanceStats, setLogoEnhanceStats] = useState({
    total: 0,
    withFavicon: 0,
    withoutFavicon: 0,
    lowQuality: 0,
    highQuality: 0,
    needsEnhancement: 0
  })
  const [logoEnhanceResults, setLogoEnhanceResults] = useState<{
    improved: number
    unchanged: number
    failed: number
  } | null>(null)

  // Fetch logo stats on mount
  useEffect(() => {
    fetchLogoStats()
  }, [])

  const fetchLogoStats = async () => {
    try {
      const response = await fetch('/api/bookmarks/enhance-all')
      if (response.ok) {
        const data = await response.json()
        setLogoEnhanceStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch logo stats:', error)
    }
  }

  const runLogoEnhancement = async (mode: 'all' | 'missing' | 'lowQuality') => {
    setIsEnhancingLogos(true)
    setLogoEnhanceProgress(0)
    setLogoEnhanceResults(null)

    const limit = 20 // Process in batches
    let skip = 0
    let totalImproved = 0
    let totalUnchanged = 0
    let totalFailed = 0
    let hasMore = true

    const params = new URLSearchParams({ limit: String(limit) })
    if (mode === 'missing') params.set('onlyMissing', 'true')
    if (mode === 'lowQuality') params.set('onlyLowQuality', 'true')

    try {
      while (hasMore) {
        params.set('skip', String(skip))
        
        const response = await fetch(`/api/bookmarks/enhance-all?${params}`, {
          method: 'POST'
        })
        
        if (!response.ok) {
          throw new Error('Enhancement request failed')
        }
        
        const data = await response.json()
        
        totalImproved += data.summary.improved
        totalUnchanged += data.summary.unchanged
        totalFailed += data.summary.failed
        
        // Update progress
        const processed = skip + data.summary.processed
        const total = data.summary.total
        setLogoEnhanceProgress(Math.round((processed / total) * 100))
        
        hasMore = data.summary.hasMore
        skip = data.summary.nextSkip
        
        // Update results in real-time
        setLogoEnhanceResults({
          improved: totalImproved,
          unchanged: totalUnchanged,
          failed: totalFailed
        })
      }

      toast.success(`Enhanced ${totalImproved} bookmark logos!`)
      
      // Refresh stats
      await fetchLogoStats()
      
    } catch (error) {
      console.error('Logo enhancement error:', error)
      toast.error('Failed to enhance logos. Please try again.')
    } finally {
      setIsEnhancingLogos(false)
      setLogoEnhanceProgress(100)
    }
  }

  // Fetch bookmarks on mount
  useEffect(() => {
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    setLoadingBookmarks(true)
    try {
      const response = await fetch('/api/bookmarks?limit=1000')
      if (response.ok) {
        const data = await response.json()
        const links: ValidatedLink[] = (data.bookmarks || []).map((b: any) => ({
          id: b.id,
          url: b.url,
          title: b.title || extractDomain(b.url),
          domain: extractDomain(b.url),
          status: 'unknown' as LinkStatus,
          lastChecked: b.lastValidated
        }))
        setBookmarks(links)
        setValidatedLinks(links)
        setStats(prev => ({ ...prev, total: links.length, unknown: links.length }))
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error)
      toast.error('Failed to load bookmarks')
    } finally {
      setLoadingBookmarks(false)
    }
  }

  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  // Simulate link validation (in production, this would call a real API)
  const validateLink = async (link: ValidatedLink): Promise<ValidatedLink> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
    
    // Simulate different outcomes based on URL patterns
    const url = link.url.toLowerCase()
    let status: LinkStatus = 'healthy'
    let statusCode = 200
    let responseTime = Math.floor(100 + Math.random() * 400)
    let redirectUrl: string | undefined
    let error: string | undefined
    
    // Simulate various scenarios
    if (url.includes('broken') || url.includes('404') || Math.random() < 0.05) {
      status = 'broken'
      statusCode = 404
      error = 'Page not found'
    } else if (url.includes('redirect') || Math.random() < 0.1) {
      status = 'redirect'
      statusCode = 301
      redirectUrl = url.replace('http://', 'https://')
    } else if (url.includes('slow') || Math.random() < 0.05) {
      status = 'timeout'
      responseTime = 10000
      error = 'Connection timed out'
    } else if (Math.random() < 0.03) {
      status = 'broken'
      statusCode = 500
      error = 'Server error'
    }
    
    return {
      ...link,
      status,
      statusCode,
      responseTime,
      redirectUrl,
      error,
      lastChecked: new Date().toISOString()
    }
  }

  const runValidation = async () => {
    const linksToValidate = validationScope === 'unchecked' 
      ? validatedLinks.filter(l => l.status === 'unknown')
      : validationScope === 'selected' && selectedLinks.size > 0
      ? validatedLinks.filter(l => selectedLinks.has(l.id))
      : validatedLinks
    
    if (linksToValidate.length === 0) {
      toast.error('No links to validate')
      return
    }
    
    setIsValidating(true)
    setValidationProgress(0)
    
    const startTime = Date.now()
    const results: ValidatedLink[] = [...validatedLinks]
    const batchSize = parseInt(concurrentChecks)
    
    let healthy = 0
    let broken = 0
    let redirects = 0
    let timeouts = 0
    
    for (let i = 0; i < linksToValidate.length; i += batchSize) {
      const batch = linksToValidate.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (link) => {
        setCurrentlyChecking(link.url)
        
        // Update status to checking
        const idx = results.findIndex(l => l.id === link.id)
        if (idx !== -1) {
          results[idx] = { ...results[idx], status: 'checking' }
          setValidatedLinks([...results])
        }
        
        const validated = await validateLink(link)
        
        // Update with result
        if (idx !== -1) {
          results[idx] = validated
        }
        
        // Count results
        if (validated.status === 'healthy') healthy++
        else if (validated.status === 'broken') broken++
        else if (validated.status === 'redirect') redirects++
        else if (validated.status === 'timeout') timeouts++
        
        return validated
      })
      
      await Promise.all(batchPromises)
      setValidatedLinks([...results])
      
      const progress = Math.round(((i + batch.length) / linksToValidate.length) * 100)
      setValidationProgress(progress)
    }
    
    const duration = Date.now() - startTime
    
    // Update stats
    const newStats: ValidationStats = {
      total: validatedLinks.length,
      healthy,
      broken,
      redirects,
      timeouts,
      unknown: validatedLinks.length - healthy - broken - redirects - timeouts,
      lastValidation: new Date().toISOString(),
      avgResponseTime: Math.round(results.reduce((sum, l) => sum + (l.responseTime || 0), 0) / results.length)
    }
    setStats(newStats)
    
    // Add to history
    setValidationHistory(prev => [{
      id: `val-${Date.now()}`,
      timestamp: new Date().toISOString(),
      total: linksToValidate.length,
      healthy,
      broken,
      redirects,
      timeouts,
      duration
    }, ...prev.slice(0, 9)])
    
    setIsValidating(false)
    setCurrentlyChecking(null)
    setShowResultsDetail(true)
    
    if (broken > 0) {
      toast.warning(`Found ${broken} broken link${broken > 1 ? 's' : ''}`)
    } else {
      toast.success('All links are healthy!')
    }
  }

  const handleBulkAction = async (action: 'delete' | 'archive' | 'recheck') => {
    const selected = validatedLinks.filter(l => selectedLinks.has(l.id))
    
    if (action === 'recheck') {
      setValidationScope('selected')
      await runValidation()
    } else if (action === 'delete') {
      toast.loading(`Deleting ${selected.length} bookmark${selected.length > 1 ? 's' : ''}...`)
      // In production, call API to delete
      await new Promise(resolve => setTimeout(resolve, 1000))
      setValidatedLinks(prev => prev.filter(l => !selectedLinks.has(l.id)))
      setSelectedLinks(new Set())
      toast.dismiss()
      toast.success(`Deleted ${selected.length} bookmark${selected.length > 1 ? 's' : ''}`)
    } else if (action === 'archive') {
      toast.loading(`Archiving ${selected.length} bookmark${selected.length > 1 ? 's' : ''}...`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.dismiss()
      toast.success(`Archived ${selected.length} bookmark${selected.length > 1 ? 's' : ''}`)
    }
    
    setShowBulkActions(false)
  }

  // Filter and sort links
  const filteredLinks = validatedLinks
    .filter(link => {
      if (statusFilter !== 'all' && link.status !== statusFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return link.url.toLowerCase().includes(query) || 
               link.title.toLowerCase().includes(query) ||
               link.domain.toLowerCase().includes(query)
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'status') {
        const statusOrder = { broken: 0, timeout: 1, redirect: 2, unknown: 3, checking: 4, healthy: 5 }
        return statusOrder[a.status] - statusOrder[b.status]
      }
      if (sortBy === 'domain') return a.domain.localeCompare(b.domain)
      if (sortBy === 'responseTime') return (b.responseTime || 0) - (a.responseTime || 0)
      return 0
    })

  const toggleLinkSelection = (id: string) => {
    setSelectedLinks(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const getStatusIcon = (status: LinkStatus) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'broken': return <XCircle className="h-4 w-4 text-red-500" />
      case 'redirect': return <ArrowUpRight className="h-4 w-4 text-orange-500" />
      case 'timeout': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'checking': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: LinkStatus) => {
    const styles = {
      healthy: 'bg-green-100 text-green-700 border-green-200',
      broken: 'bg-red-100 text-red-700 border-red-200',
      redirect: 'bg-orange-100 text-orange-700 border-orange-200',
      timeout: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      checking: 'bg-blue-100 text-blue-700 border-blue-200',
      unknown: 'bg-gray-100 text-gray-600 border-gray-200'
    }
    return styles[status]
  }

  return (
    <div className="space-y-6">
      {/* Hero Header - Professional monochromatic */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 dark:bg-slate-950 p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-wide">LINK VALIDATOR</h2>
              </div>
              <p className="text-slate-400 text-sm max-w-xl">
                Monitor and maintain the health of your bookmarked links with automated validation.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setValidationScope('all')
                  runValidation()
                }}
                disabled={isValidating || loadingBookmarks}
                className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700 text-xs uppercase"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retest All ({stats.total})
              </Button>
              <Button
                size="sm"
                onClick={runValidation}
                disabled={isValidating || loadingBookmarks}
                className="bg-white text-slate-900 hover:bg-slate-100 text-xs uppercase"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Validation
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Progress bar during validation */}
          {isValidating && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Checking links...</span>
                <span className="font-medium">{validationProgress}%</span>
              </div>
              <Progress value={validationProgress} className="h-2 bg-slate-700" />
              {currentlyChecking && (
                <p className="text-xs text-slate-500 mt-2 truncate">
                  Currently checking: {currentlyChecking}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md border-2",
            statusFilter === 'all' ? "border-gray-900 bg-gray-50" : "border-transparent"
          )}
          onClick={() => setStatusFilter('all')}
        >
          <CardContent className="p-4 text-center">
            <Globe className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Total Links</div>
          </CardContent>
        </Card>
        
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md border-2",
            statusFilter === 'healthy' ? "border-green-500 bg-green-50" : "border-transparent"
          )}
          onClick={() => setStatusFilter('healthy')}
        >
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-3xl font-bold text-green-600">{stats.healthy}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Healthy</div>
          </CardContent>
        </Card>
        
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md border-2",
            statusFilter === 'broken' ? "border-red-500 bg-red-50" : "border-transparent"
          )}
          onClick={() => setStatusFilter('broken')}
        >
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <div className="text-3xl font-bold text-red-600">{stats.broken}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Broken</div>
          </CardContent>
        </Card>
        
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md border-2",
            statusFilter === 'redirect' ? "border-orange-500 bg-orange-50" : "border-transparent"
          )}
          onClick={() => setStatusFilter('redirect')}
        >
          <CardContent className="p-4 text-center">
            <ArrowUpRight className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-3xl font-bold text-orange-600">{stats.redirects}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Redirects</div>
          </CardContent>
        </Card>
        
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md border-2",
            statusFilter === 'timeout' ? "border-yellow-500 bg-yellow-50" : "border-transparent"
          )}
          onClick={() => setStatusFilter('timeout')}
        >
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-3xl font-bold text-yellow-600">{stats.timeouts}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Timeouts</div>
          </CardContent>
        </Card>
        
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md border-2",
            statusFilter === 'unknown' ? "border-gray-500 bg-gray-50" : "border-transparent"
          )}
          onClick={() => setStatusFilter('unknown')}
        >
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <div className="text-3xl font-bold text-gray-600">{stats.unknown}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Unchecked</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Links List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filter Bar */}
          <Card className="border-2 border-gray-100">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search links by URL, title, or domain..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="status">Sort by Status</SelectItem>
                      <SelectItem value="domain">Sort by Domain</SelectItem>
                      <SelectItem value="responseTime">Sort by Speed</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedLinks.size > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setShowBulkActions(true)}
                    >
                      Actions ({selectedLinks.size})
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Quick filters */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setStatusFilter('all')}
                >
                  All ({stats.total})
                </Badge>
                <Badge
                  variant={statusFilter === 'broken' ? 'default' : 'outline'}
                  className={cn("cursor-pointer", statusFilter === 'broken' && "bg-red-500")}
                  onClick={() => setStatusFilter('broken')}
                >
                  Broken ({stats.broken})
                </Badge>
                <Badge
                  variant={statusFilter === 'redirect' ? 'default' : 'outline'}
                  className={cn("cursor-pointer", statusFilter === 'redirect' && "bg-orange-500")}
                  onClick={() => setStatusFilter('redirect')}
                >
                  Redirects ({stats.redirects})
                </Badge>
                <Badge
                  variant={statusFilter === 'timeout' ? 'default' : 'outline'}
                  className={cn("cursor-pointer", statusFilter === 'timeout' && "bg-yellow-500")}
                  onClick={() => setStatusFilter('timeout')}
                >
                  Timeouts ({stats.timeouts})
                </Badge>
                <Badge
                  variant={statusFilter === 'unknown' ? 'default' : 'outline'}
                  className={cn("cursor-pointer", statusFilter === 'unknown' && "bg-gray-500")}
                  onClick={() => setStatusFilter('unknown')}
                >
                  Unchecked ({stats.unknown})
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Links List */}
          <Card className="border-2 border-gray-100 overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedLinks.size === filteredLinks.length && filteredLinks.length > 0}
                    onChange={() => {
                      if (selectedLinks.size === filteredLinks.length) {
                        setSelectedLinks(new Set())
                      } else {
                        setSelectedLinks(new Set(filteredLinks.map(l => l.id)))
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {filteredLinks.length} link{filteredLinks.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchBookmarks}
                  disabled={loadingBookmarks}
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", loadingBookmarks && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingBookmarks ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredLinks.length === 0 ? (
                <div className="text-center py-12">
                  <Globe className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No links found</p>
                  <p className="text-sm text-gray-400">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto divide-y">
                  {filteredLinks.map((link) => (
                    <div
                      key={link.id}
                      className={cn(
                        "flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors",
                        selectedLinks.has(link.id) && "bg-blue-50"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedLinks.has(link.id)}
                        onChange={() => toggleLinkSelection(link.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {getStatusIcon(link.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 truncate">{link.title}</span>
                          <Badge variant="outline" className={cn("text-xs", getStatusBadge(link.status))}>
                            {link.status}
                          </Badge>
                          {link.statusCode && (
                            <Badge variant="outline" className="text-xs">
                              {link.statusCode}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="truncate">{link.url}</span>
                          {link.responseTime && (
                            <span className={cn(
                              "flex-shrink-0",
                              link.responseTime < 300 ? "text-green-600" : 
                              link.responseTime < 1000 ? "text-yellow-600" : "text-red-600"
                            )}>
                              {link.responseTime}ms
                            </span>
                          )}
                        </div>
                        {link.error && (
                          <p className="text-xs text-red-600 mt-1">{link.error}</p>
                        )}
                        {link.redirectUrl && (
                          <p className="text-xs text-orange-600 mt-1">
                            Redirects to: {link.redirectUrl}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(link.url, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            const result = await validateLink(link)
                            setValidatedLinks(prev => prev.map(l => l.id === link.id ? result : l))
                            toast.success(`Link is ${result.status}`)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Stats Card */}
          <Card className="border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-emerald-600" />
                <h3 className="font-semibold text-gray-900">Health Score</h3>
              </div>
              
              {stats.total > 0 && stats.healthy > 0 ? (
                <>
                  <div className="text-center mb-4">
                    <div className="text-5xl font-bold text-emerald-600">
                      {Math.round((stats.healthy / stats.total) * 100)}%
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {stats.healthy} of {stats.total} links healthy
                    </p>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                      style={{ width: `${(stats.healthy / stats.total) * 100}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">Run a validation to see your health score</p>
                </div>
              )}
              
              {stats.lastValidation && (
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Last checked: {new Date(stats.lastValidation).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Logo Enhancement Card */}
          <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Logo Quality</h3>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-2 rounded-lg bg-white/60 dark:bg-gray-800/60 text-center">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {logoEnhanceStats.highQuality}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">High Quality</p>
                </div>
                <div className="p-2 rounded-lg bg-white/60 dark:bg-gray-800/60 text-center">
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {logoEnhanceStats.needsEnhancement}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Needs Upgrade</p>
                </div>
              </div>

              {/* Quality Breakdown */}
              {logoEnhanceStats.total > 0 && (
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Missing logos</span>
                    <span className="font-medium">{logoEnhanceStats.withoutFavicon}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Low quality</span>
                    <span className="font-medium">{logoEnhanceStats.lowQuality}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all"
                      style={{ width: `${logoEnhanceStats.total > 0 ? (logoEnhanceStats.highQuality / logoEnhanceStats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    {logoEnhanceStats.total > 0 ? Math.round((logoEnhanceStats.highQuality / logoEnhanceStats.total) * 100) : 0}% high quality logos
                  </p>
                </div>
              )}

              {/* Enhancement Progress */}
              {isEnhancingLogos && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Enhancing...</span>
                    <span>{logoEnhanceProgress}%</span>
                  </div>
                  <Progress value={logoEnhanceProgress} className="h-2" />
                  {logoEnhanceResults && (
                    <div className="flex gap-2 text-xs mt-2 justify-center">
                      <span className="text-green-600">✓ {logoEnhanceResults.improved}</span>
                      <span className="text-gray-500">– {logoEnhanceResults.unchanged}</span>
                      <span className="text-red-500">✗ {logoEnhanceResults.failed}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Enhancement Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => runLogoEnhancement('all')}
                  disabled={isEnhancingLogos || logoEnhanceStats.total === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  size="sm"
                >
                  {isEnhancingLogos ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Enhance All Logos
                    </>
                  )}
                </Button>
                
                {logoEnhanceStats.needsEnhancement > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runLogoEnhancement('missing')}
                      disabled={isEnhancingLogos || logoEnhanceStats.withoutFavicon === 0}
                      className="flex-1 text-xs"
                    >
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Missing ({logoEnhanceStats.withoutFavicon})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runLogoEnhancement('lowQuality')}
                      disabled={isEnhancingLogos || logoEnhanceStats.lowQuality === 0}
                      className="flex-1 text-xs"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Low ({logoEnhanceStats.lowQuality})
                    </Button>
                  </div>
                )}
              </div>

              {/* Results Summary */}
              {logoEnhanceResults && !isEnhancingLogos && (
                <div className="mt-3 p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-700 dark:text-green-300 text-center">
                    ✨ Enhanced {logoEnhanceResults.improved} logos successfully!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validation Settings */}
          <Card className="border-2 border-gray-100 overflow-hidden">
            <button
              onClick={() => setExpandedSections(prev => ({ ...prev, settings: !prev.settings }))}
              className="w-full p-4 flex items-center justify-between bg-gray-50/50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Settings</span>
              </div>
              {expandedSections.settings ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
            </button>
            
            {expandedSections.settings && (
              <CardContent className="p-4 space-y-4 border-t">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Validation Scope</Label>
                  <RadioGroup value={validationScope} onValueChange={(v: any) => setValidationScope(v)} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="scope-all" />
                      <Label htmlFor="scope-all" className="font-normal text-sm cursor-pointer">All bookmarks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unchecked" id="scope-unchecked" />
                      <Label htmlFor="scope-unchecked" className="font-normal text-sm cursor-pointer">Only unchecked</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="selected" id="scope-selected" />
                      <Label htmlFor="scope-selected" className="font-normal text-sm cursor-pointer">Selected only</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Auto Schedule</Label>
                  <Select value={schedule} onValueChange={(v: any) => setSchedule(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual only</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Concurrent checks</Label>
                    <Select value={concurrentChecks} onValueChange={setConcurrentChecks}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Timeout (seconds)</Label>
                    <Select value={timeoutSeconds} onValueChange={setTimeoutSeconds}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5s</SelectItem>
                        <SelectItem value="10">10s</SelectItem>
                        <SelectItem value="30">30s</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Email summary</Label>
                      <p className="text-xs text-gray-500">Get notified after validation</p>
                    </div>
                    <Switch checked={emailSummary} onCheckedChange={setEmailSummary} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Auto-archive broken</Label>
                      <p className="text-xs text-gray-500">Move broken links to archive</p>
                    </div>
                    <Switch checked={autoArchiveBroken} onCheckedChange={setAutoArchiveBroken} />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Validation History */}
          <Card className="border-2 border-gray-100 overflow-hidden">
            <button
              onClick={() => setExpandedSections(prev => ({ ...prev, history: !prev.history }))}
              className="w-full p-4 flex items-center justify-between bg-gray-50/50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-gray-600" />
                <span className="font-semibold text-gray-900">History</span>
              </div>
              {expandedSections.history ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
            </button>
            
            {expandedSections.history && (
              <CardContent className="p-4 border-t">
                {validationHistory.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <History className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No validation history yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {validationHistory.map((entry) => (
                      <div key={entry.id} className="p-3 rounded-lg bg-gray-50 border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(entry.duration / 1000)}s
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-green-600">{entry.healthy} ✓</span>
                          <span className="text-red-600">{entry.broken} ✗</span>
                          <span className="text-orange-600">{entry.redirects} →</span>
                          <span className="text-yellow-600">{entry.timeouts} ⏱</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              {selectedLinks.size} link{selectedLinks.size !== 1 ? 's' : ''} selected
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleBulkAction('recheck')}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-validate selected
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleBulkAction('archive')}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive selected
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete selected
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkActions(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

