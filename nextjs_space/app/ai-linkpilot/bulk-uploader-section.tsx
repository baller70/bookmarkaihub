'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { BulkUploadLog, Category } from '@/types/bookmark'
import {
  Upload,
  FileText,
  Link2,
  Settings,
  History,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Trash2,
  FolderDown,
  FileJson,
  FileSpreadsheet,
  Filter,
  Search,
  RefreshCw,
  Globe,
  Calendar,
  Tag
} from 'lucide-react'

type LinkStatus = 'queued' | 'processing' | 'perfect' | 'success' | 'failed' | 'duplicate' | 'skipped'

interface ParsedLink {
  id: string
  url: string
  domain: string
  title: string
  category: string
  status: LinkStatus
  error?: string
  favicon?: string
  description?: string
  tags?: string[]
  createdAt?: string
}

interface UploadStats {
  total: number
  perfect: number
  queued: number
  processing: number
  success: number
  failed: number
  duplicate: number
  skipped: number
  successRate: number
}

interface BulkUploaderSectionProps {
  categories: Pick<Category, 'id' | 'name'>[]
}

export function BulkUploaderSection({ categories }: BulkUploaderSectionProps) {
  // Upload method
  const [uploadMethod, setUploadMethod] = useState<'drag-drop' | 'paste-text' | 'single-url'>('drag-drop')
  const [pasteText, setPasteText] = useState('')
  const [singleUrl, setSingleUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  // Parsed links and preview
  const [parsedLinks, setParsedLinks] = useState<ParsedLink[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set())
  const [previewTab, setPreviewTab] = useState<'all' | 'success' | 'failed' | 'pending'>('all')
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStats, setUploadStats] = useState<UploadStats>({
    total: 0,
    perfect: 0,
    queued: 0,
    processing: 0,
    success: 0,
    failed: 0,
    duplicate: 0,
    skipped: 0,
    successRate: 0
  })
  
  // Detailed breakdown
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false)
  const [uploadedLinks, setUploadedLinks] = useState<ParsedLink[]>([])
  
  // Import settings
  const [validateUrls, setValidateUrls] = useState(true)
  const [checkDuplicates, setCheckDuplicates] = useState(true)
  const [skipExisting, setSkipExisting] = useState(true)
  const [fetchMetadata, setFetchMetadata] = useState(true)
  const [fetchFavicons, setFetchFavicons] = useState(true)
  const [processingMode, setProcessingMode] = useState<'sequential' | 'parallel'>('parallel')
  const [concurrentLimit, setConcurrentLimit] = useState('5')
  const [autoRetryFailed, setAutoRetryFailed] = useState(true)
  const [maxRetries, setMaxRetries] = useState('3')
  const [defaultPriority, setDefaultPriority] = useState('MEDIUM')
  const [defaultPrivacy, setDefaultPrivacy] = useState('PRIVATE')
  const [defaultCategory, setDefaultCategory] = useState('')
  const [autoApplyTags, setAutoApplyTags] = useState('')
  const [logImports, setLogImports] = useState(true)
  
  // History
  const [showUploadHistory, setShowUploadHistory] = useState(false)
  const [uploadHistory, setUploadHistory] = useState<BulkUploadLog[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyFilter, setHistoryFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [historySearch, setHistorySearch] = useState('')
  
  // Settings panel
  const [settingsExpanded, setSettingsExpanded] = useState(true)

  // Normalize URL
  const normalizeUrl = (url: string): string => {
    let normalized = url.trim()
    if (!normalized.match(/^https?:\/\//i)) {
      normalized = 'https://' + normalized
    }
    return normalized
  }

  // Extract domain
  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(normalizeUrl(url))
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  // Extract URLs from text
  const extractUrlsFromText = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+|(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/g
    const matches = text.match(urlRegex) || []
    const normalized = matches.map(url => normalizeUrl(url))
    return [...new Set(normalized)]
  }

  // Parse CSV
  const parseCSV = (text: string): string[] => {
    const lines = text.split('\n')
    const urls: string[] = []
    lines.forEach(line => {
      const cells = line.split(',')
      cells.forEach(cell => {
        const trimmed = cell.trim().replace(/["']/g, '')
        if (trimmed.match(/^(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/)) {
          urls.push(normalizeUrl(trimmed))
        }
      })
    })
    return [...new Set(urls)]
  }

  // Handle parse links
  const handleParseLinks = () => {
    let urls: string[] = []
    
    if (uploadMethod === 'paste-text') {
      urls = extractUrlsFromText(pasteText)
    } else if (uploadMethod === 'single-url') {
      if (singleUrl.trim()) {
        urls = [normalizeUrl(singleUrl)]
      }
    }
    
    if (urls.length === 0) {
      toast.error('No valid URLs found')
      return
    }
    
    const links: ParsedLink[] = urls.map((url, idx) => ({
      id: `link-${Date.now()}-${idx}`,
      url,
      domain: extractDomain(url),
      title: extractDomain(url).toUpperCase(),
      category: 'Uncategorized',
      status: 'queued' as LinkStatus
    }))
    
    setParsedLinks(links)
    setSelectedLinks(new Set(links.map(l => l.id)))
    setShowPreview(true)
    
    setUploadStats(prev => ({
      ...prev,
      total: links.length,
      queued: links.length,
      perfect: 0,
      processing: 0,
      success: 0,
      failed: 0,
      duplicate: 0,
      skipped: 0
    }))
    
    toast.success(`Found ${urls.length} link${urls.length !== 1 ? 's' : ''}`)
  }

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target?.result as string
      let urls: string[] = []
      
      if (file.name.endsWith('.csv')) {
        urls = parseCSV(text)
      } else if (file.name.endsWith('.txt')) {
        urls = extractUrlsFromText(text)
      } else {
        toast.error('Please upload a .csv or .txt file')
        return
      }
      
      if (urls.length === 0) {
        toast.error('No valid URLs found in file')
        return
      }
      
      const links: ParsedLink[] = urls.map((url, idx) => ({
        id: `link-${Date.now()}-${idx}`,
        url,
        domain: extractDomain(url),
        title: extractDomain(url).toUpperCase(),
        category: 'Uncategorized',
        status: 'queued' as LinkStatus
      }))
      
      setParsedLinks(links)
      setSelectedLinks(new Set(links.map(l => l.id)))
      setShowPreview(true)
      
      setUploadStats(prev => ({
        ...prev,
        total: links.length,
        queued: links.length
      }))
      
      toast.success(`Parsed ${urls.length} link${urls.length !== 1 ? 's' : ''} from ${file.name}`)
    }
    reader.readAsText(file)
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  // Import selected links
  const handleImportSelectedLinks = async () => {
    const linksToImport = parsedLinks.filter(l => selectedLinks.has(l.id))
    if (linksToImport.length === 0) {
      toast.error('No links selected')
      return
    }
    
    setIsUploading(true)
    setUploadProgress(0)
    
    const tagsToApply = autoApplyTags
      ? autoApplyTags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : []
    const categoryIds = defaultCategory && defaultCategory !== 'none' ? [defaultCategory] : []
    
    let successCount = 0
    let failCount = 0
    let duplicateCount = 0
    let skippedCount = 0
    const results: ParsedLink[] = []
    
    const batchSize = processingMode === 'parallel' ? parseInt(concurrentLimit) : 1
    
    for (let i = 0; i < linksToImport.length; i += batchSize) {
      const batch = linksToImport.slice(i, i + batchSize)
      
      const promises = batch.map(async (link) => {
        try {
          // Update status to processing
          setParsedLinks(prev => prev.map(l => 
            l.id === link.id ? { ...l, status: 'processing' as LinkStatus } : l
          ))
          
          const response = await fetch('/api/bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: link.url,
              title: link.title,
              priority: defaultPriority,
              categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
              tags: tagsToApply.length > 0 ? tagsToApply : undefined
            })
          })
          
          if (response.ok) {
            const data = await response.json()
            successCount++
            return { ...link, status: 'success' as LinkStatus, title: data.title || link.title }
          } else {
            const errorData = await response.json()
            if (response.status === 409 || errorData.error?.includes('duplicate')) {
              duplicateCount++
              return { ...link, status: 'duplicate' as LinkStatus, error: 'Already exists' }
            }
            failCount++
            return { ...link, status: 'failed' as LinkStatus, error: errorData.error || 'Unknown error' }
          }
        } catch (error: any) {
          failCount++
          return { ...link, status: 'failed' as LinkStatus, error: error.message || 'Network error' }
        }
      })
      
      const batchResults = await Promise.all(promises)
      results.push(...batchResults)
      
      // Update progress
      const progress = Math.round(((i + batch.length) / linksToImport.length) * 100)
      setUploadProgress(progress)
      
      // Update parsed links with results
      setParsedLinks(prev => {
        const updated = [...prev]
        batchResults.forEach(result => {
          const idx = updated.findIndex(l => l.id === result.id)
          if (idx !== -1) updated[idx] = result
        })
        return updated
      })
    }
    
    // Final stats
    const finalStats: UploadStats = {
      total: linksToImport.length,
      perfect: 0,
      queued: 0,
      processing: 0,
      success: successCount,
      failed: failCount,
      duplicate: duplicateCount,
      skipped: skippedCount,
      successRate: Math.round((successCount / linksToImport.length) * 100)
    }
    
    setUploadStats(finalStats)
    setUploadedLinks(results)
    setShowDetailedBreakdown(true)
    setIsUploading(false)
    
    // Log the import
    if (logImports) {
      try {
        await fetch('/api/ai-linkpilot/bulk-upload-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: uploadMethod,
            importMethod: uploadMethod,
            totalLinks: linksToImport.length,
            successCount,
            failedCount: failCount,
            duplicateCount,
            skippedCount,
            linksData: results.map(r => ({
              url: r.url,
              title: r.title,
              status: r.status,
              error: r.error
            })),
            settings: {
              validateUrls,
              checkDuplicates,
              skipExisting,
              fetchMetadata,
              fetchFavicons,
              processingMode,
              concurrentLimit,
              defaultPriority,
              defaultCategory,
              autoApplyTags
            }
          })
        })
      } catch (error) {
        console.error('Failed to log import:', error)
      }
    }
    
    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} bookmark${successCount !== 1 ? 's' : ''}`)
    }
    if (failCount > 0) {
      toast.error(`${failCount} bookmark${failCount !== 1 ? 's' : ''} failed to import`)
    }
  }

  // Fetch upload history
  const fetchUploadHistory = async () => {
    setLoadingHistory(true)
    try {
      const response = await fetch('/api/ai-linkpilot/bulk-upload-log?limit=50')
      if (response.ok) {
        const data = await response.json()
        setUploadHistory(data.logs || [])
      }
    } catch (error) {
      console.error('Failed to fetch upload history:', error)
      toast.error('Failed to load upload history')
    } finally {
      setLoadingHistory(false)
    }
  }

  // Download all bookmarks
  const handleDownloadAllBookmarks = async (format: 'json' | 'csv') => {
    toast.loading('Preparing download...')
    try {
      const response = await fetch('/api/bookmarks?limit=10000')
      if (!response.ok) throw new Error('Failed to fetch bookmarks')
      
      const data = await response.json()
      const bookmarks = data.bookmarks || []
      
      if (bookmarks.length === 0) {
        toast.dismiss()
        toast.error('No bookmarks to export')
        return
      }
      
      let content: string
      let filename: string
      let mimeType: string
      
      if (format === 'json') {
        content = JSON.stringify(bookmarks, null, 2)
        filename = `bookmarks-export-${new Date().toISOString().split('T')[0]}.json`
        mimeType = 'application/json'
      } else {
        const headers = ['Title', 'URL', 'Description', 'Priority', 'Created At', 'Categories', 'Tags']
        const rows = bookmarks.map((b: any) => [
          b.title || '',
          b.url || '',
          (b.description || '').replace(/"/g, '""'),
          b.priority || '',
          b.createdAt || '',
          (b.categories?.map((c: any) => c.category?.name).join('; ')) || '',
          (b.tags?.map((t: any) => t.tag?.name).join('; ')) || ''
        ])
        content = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
        filename = `bookmarks-export-${new Date().toISOString().split('T')[0]}.csv`
        mimeType = 'text/csv'
      }
      
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      
      toast.dismiss()
      toast.success(`Exported ${bookmarks.length} bookmarks as ${format.toUpperCase()}`)
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to export bookmarks')
    }
  }

  // Filter history
  const filteredHistory = uploadHistory.filter(log => {
    if (historySearch) {
      const searchLower = historySearch.toLowerCase()
      const matchesSearch = log.source?.toLowerCase().includes(searchLower) ||
        log.linksData?.some((link: any) => link.url?.toLowerCase().includes(searchLower))
      if (!matchesSearch) return false
    }
    
    if (historyFilter !== 'all') {
      const logDate = new Date(log.createdAt)
      const now = new Date()
      
      if (historyFilter === 'today') {
        return logDate.toDateString() === now.toDateString()
      } else if (historyFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return logDate >= weekAgo
      } else if (historyFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return logDate >= monthAgo
      }
    }
    
    return true
  })

  const toggleLinkSelection = (id: string) => {
    setSelectedLinks(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllLinks = () => {
    if (selectedLinks.size === parsedLinks.length) {
      setSelectedLinks(new Set())
    } else {
      setSelectedLinks(new Set(parsedLinks.map(l => l.id)))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header - Clean professional design */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 dark:bg-slate-950 p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1 uppercase tracking-wide">BULK LINK UPLOADER</h2>
              <p className="text-slate-400 text-sm">
                Import multiple links with intelligent categorization
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowUploadHistory(true)
                  fetchUploadHistory()
                }}
                className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700 text-xs uppercase"
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadAllBookmarks('json')}
                className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700 text-xs uppercase"
              >
                <FolderDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          {/* Quick stats - Compact horizontal */}
          {uploadStats.total > 0 && (
            <div className="mt-4 flex items-center gap-4 pt-4 border-t border-slate-700">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm font-semibold">{uploadStats.success}</span>
                <span className="text-xs text-slate-400">success</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-semibold">{uploadStats.failed}</span>
                <span className="text-xs text-slate-400">failed</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-semibold">{uploadStats.duplicate}</span>
                <span className="text-xs text-slate-400">duplicates</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Import Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Upload Methods Card */}
          <Card className="overflow-hidden border-2 border-gray-100 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Upload className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Import Links</h3>
                    <p className="text-xs text-gray-500">Choose your import method</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Method Tabs */}
              <div className="border-b bg-white">
                <div className="flex">
                  <button
                    onClick={() => setUploadMethod('drag-drop')}
                    className={cn(
                      "flex-1 py-3 px-4 text-sm font-medium transition-all border-b-2",
                      uploadMethod === 'drag-drop'
                        ? "text-indigo-600 border-indigo-600 bg-indigo-50/50"
                        : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <Upload className="h-4 w-4 inline mr-2" />
                    File Upload
                  </button>
                  <button
                    onClick={() => setUploadMethod('paste-text')}
                    className={cn(
                      "flex-1 py-3 px-4 text-sm font-medium transition-all border-b-2",
                      uploadMethod === 'paste-text'
                        ? "text-indigo-600 border-indigo-600 bg-indigo-50/50"
                        : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <FileText className="h-4 w-4 inline mr-2" />
                    Paste URLs
                  </button>
                  <button
                    onClick={() => setUploadMethod('single-url')}
                    className={cn(
                      "flex-1 py-3 px-4 text-sm font-medium transition-all border-b-2",
                      uploadMethod === 'single-url'
                        ? "text-indigo-600 border-indigo-600 bg-indigo-50/50"
                        : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <Link2 className="h-4 w-4 inline mr-2" />
                    Single URL
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Drag & Drop */}
                {uploadMethod === 'drag-drop' && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer",
                        isDragging 
                          ? "border-indigo-500 bg-indigo-50" 
                          : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                      )}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                          <Upload className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Drop your files here
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        or click to browse • CSV, TXT files supported
                      </p>
                      <Button variant="outline" className="pointer-events-none">
                        Choose Files
                      </Button>
                    </div>
                  </>
                )}

                {/* Paste Text */}
                {uploadMethod === 'paste-text' && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Paste your URLs</Label>
                      <Textarea
                        placeholder="Paste URLs here (one per line or separated by spaces)&#10;&#10;https://example.com&#10;google.com&#10;www.github.com/repo"
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        className="min-h-[200px] font-mono text-sm bg-gray-50 resize-none"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {extractUrlsFromText(pasteText).length} URL{extractUrlsFromText(pasteText).length !== 1 ? 's' : ''} detected
                      </span>
                      <Button
                        onClick={handleParseLinks}
                        disabled={!pasteText || isUploading}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Parse Links
                      </Button>
                    </div>
                  </div>
                )}

                {/* Single URL */}
                {uploadMethod === 'single-url' && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Enter URL</Label>
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          placeholder="https://example.com or example.com"
                          value={singleUrl}
                          onChange={(e) => setSingleUrl(e.target.value)}
                          className="flex-1 font-mono"
                        />
                        <Button
                          onClick={handleParseLinks}
                          disabled={!singleUrl || isUploading}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview & Progress */}
          {showPreview && parsedLinks.length > 0 && (
            <Card className="overflow-hidden border-2 border-gray-100 shadow-sm">
              <CardHeader className="bg-gray-50/50 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Preview & Import</h3>
                      <p className="text-xs text-gray-500">{parsedLinks.length} links ready</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleAllLinks}
                    >
                      {selectedLinks.size === parsedLinks.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Progress bar */}
                {isUploading && (
                  <div className="p-4 border-b bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Importing...</span>
                      <span className="text-sm text-blue-700">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Links list */}
                <div className="max-h-[400px] overflow-y-auto">
                  {parsedLinks.map((link, idx) => (
                    <div
                      key={link.id}
                      className={cn(
                        "flex items-center gap-3 p-4 border-b last:border-b-0 transition-colors",
                        selectedLinks.has(link.id) ? "bg-indigo-50/50" : "bg-white hover:bg-gray-50"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedLinks.has(link.id)}
                        onChange={() => toggleLinkSelection(link.id)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                        {idx + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">{link.domain}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              link.status === 'queued' && "border-yellow-300 text-yellow-700 bg-yellow-50",
                              link.status === 'processing' && "border-blue-300 text-blue-700 bg-blue-50",
                              link.status === 'success' && "border-green-300 text-green-700 bg-green-50",
                              link.status === 'failed' && "border-red-300 text-red-700 bg-red-50",
                              link.status === 'duplicate' && "border-orange-300 text-orange-700 bg-orange-50"
                            )}
                          >
                            {link.status === 'processing' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                            {link.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {link.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                            {link.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{link.url}</p>
                        {link.error && (
                          <p className="text-xs text-red-600 mt-1">{link.error}</p>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(link.url, '_blank')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPreview(false)
                      setParsedLinks([])
                      setPasteText('')
                      setSingleUrl('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImportSelectedLinks}
                    disabled={selectedLinks.size === 0 || isUploading}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        Import {selectedLinks.size} Link{selectedLinks.size !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Breakdown */}
          {showDetailedBreakdown && uploadedLinks.length > 0 && (
            <Card className="overflow-hidden border-2 border-green-100 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Import Complete</h3>
                      <p className="text-xs text-gray-500">Detailed breakdown of {uploadedLinks.length} links</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const csvContent = [
                        ['URL', 'Title', 'Status', 'Error'].join(','),
                        ...uploadedLinks.map(link => [
                          `"${link.url}"`,
                          `"${link.title}"`,
                          link.status,
                          `"${link.error || ''}"`
                        ].join(','))
                      ].join('\n')
                      
                      const blob = new Blob([csvContent], { type: 'text/csv' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `import-results-${new Date().toISOString().split('T')[0]}.csv`
                      a.click()
                      URL.revokeObjectURL(url)
                      toast.success('Results exported')
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-4 p-4 border-b bg-white">
                  <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{uploadStats.success}</div>
                    <div className="text-xs text-gray-600">Success</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="text-2xl font-bold text-red-600">{uploadStats.failed}</div>
                    <div className="text-xs text-gray-600">Failed</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">{uploadStats.duplicate}</div>
                    <div className="text-xs text-gray-600">Duplicates</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="text-2xl font-bold text-gray-600">{uploadStats.successRate}%</div>
                    <div className="text-xs text-gray-600">Success Rate</div>
                  </div>
                </div>

                {/* Filter tabs */}
                <div className="flex border-b bg-gray-50">
                  {(['all', 'success', 'failed', 'pending'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setPreviewTab(tab)}
                      className={cn(
                        "flex-1 py-2 text-sm font-medium transition-colors",
                        previewTab === tab ? "text-indigo-600 bg-white border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Links list */}
                <div className="max-h-[400px] overflow-y-auto divide-y">
                  {uploadedLinks
                    .filter(link => {
                      if (previewTab === 'all') return true
                      if (previewTab === 'success') return link.status === 'success'
                      if (previewTab === 'failed') return link.status === 'failed' || link.status === 'duplicate'
                      return link.status === 'queued' || link.status === 'processing'
                    })
                    .map((link, idx) => (
                      <div key={link.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            link.status === 'success' && "bg-green-100",
                            link.status === 'failed' && "bg-red-100",
                            link.status === 'duplicate' && "bg-yellow-100"
                          )}>
                            {link.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {link.status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                            {link.status === 'duplicate' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">{link.title || link.domain}</span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs capitalize",
                                  link.status === 'success' && "border-green-300 text-green-700",
                                  link.status === 'failed' && "border-red-300 text-red-700",
                                  link.status === 'duplicate' && "border-yellow-300 text-yellow-700"
                                )}
                              >
                                {link.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 truncate">{link.url}</p>
                            {link.error && (
                              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {link.error}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(link.url)
                                toast.success('URL copied')
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(link.url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Retry failed */}
                {uploadStats.failed > 0 && (
                  <div className="p-4 border-t bg-red-50 flex items-center justify-between">
                    <span className="text-sm text-red-700">{uploadStats.failed} links failed to import</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const failedLinks = uploadedLinks.filter(l => l.status === 'failed')
                        setParsedLinks(failedLinks.map(l => ({ ...l, status: 'queued' as LinkStatus })))
                        setSelectedLinks(new Set(failedLinks.map(l => l.id)))
                        setShowPreview(true)
                        setShowDetailedBreakdown(false)
                        toast.info('Retry the failed links')
                      }}
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Retry Failed
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          {/* Import Settings */}
          <Card className="overflow-hidden border-2 border-gray-100 shadow-sm">
            <button
              onClick={() => setSettingsExpanded(!settingsExpanded)}
              className="w-full p-4 flex items-center justify-between bg-gray-50/50 border-b hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Settings className="h-4 w-4 text-gray-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Import Settings</h3>
                  <p className="text-xs text-gray-500">Configure how links are processed</p>
                </div>
              </div>
              {settingsExpanded ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
            </button>
            
            {settingsExpanded && (
              <CardContent className="p-4 space-y-6">
                {/* URL Validation */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    URL Validation
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-gray-600">Validate URLs</Label>
                      <Switch checked={validateUrls} onCheckedChange={setValidateUrls} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-gray-600">Check duplicates</Label>
                      <Switch checked={checkDuplicates} onCheckedChange={setCheckDuplicates} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-gray-600">Skip existing</Label>
                      <Switch checked={skipExisting} onCheckedChange={setSkipExisting} />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Content Fetching */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-gray-400" />
                    Content Fetching
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-gray-600">Auto-fetch metadata</Label>
                      <Switch checked={fetchMetadata} onCheckedChange={setFetchMetadata} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-gray-600">Fetch favicons</Label>
                      <Switch checked={fetchFavicons} onCheckedChange={setFetchFavicons} />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Processing */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-gray-400" />
                    Processing
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Mode</Label>
                      <Select value={processingMode} onValueChange={(v: any) => setProcessingMode(v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="parallel">Parallel (Faster)</SelectItem>
                          <SelectItem value="sequential">Sequential (Safer)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {processingMode === 'parallel' && (
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block">Concurrent limit</Label>
                        <Select value={concurrentLimit} onValueChange={setConcurrentLimit}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 at a time</SelectItem>
                            <SelectItem value="5">5 at a time</SelectItem>
                            <SelectItem value="10">10 at a time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Error Handling */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-gray-400" />
                    Error Handling
                  </h4>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-gray-600">Auto-retry failed</Label>
                    <Switch checked={autoRetryFailed} onCheckedChange={setAutoRetryFailed} />
                  </div>
                  {autoRetryFailed && (
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Max retries</Label>
                      <Select value={maxRetries} onValueChange={setMaxRetries}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 retry</SelectItem>
                          <SelectItem value="3">3 retries</SelectItem>
                          <SelectItem value="5">5 retries</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Default Settings */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    Default Bookmark Settings
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Priority</Label>
                      <Select value={defaultPriority} onValueChange={setDefaultPriority}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="LOW">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Privacy</Label>
                      <Select value={defaultPrivacy} onValueChange={setDefaultPrivacy}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRIVATE">Private</SelectItem>
                          <SelectItem value="PUBLIC">Public</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Category</Label>
                      <Select value={defaultCategory || 'none'} onValueChange={(v) => setDefaultCategory(v === 'none' ? '' : v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Auto-apply tags</Label>
                      <Input
                        placeholder="tag1, tag2, tag3"
                        value={autoApplyTags}
                        onChange={(e) => setAutoApplyTags(e.target.value)}
                      />
                      <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* History & Logging */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <History className="h-4 w-4 text-gray-400" />
                    History & Logging
                  </h4>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-gray-600">Keep upload history</Label>
                    <Switch checked={logImports} onCheckedChange={setLogImports} />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Master Download Card */}
          <Card className="overflow-hidden border-2 border-indigo-100 shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <FolderDown className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Export All Bookmarks</h3>
                  <p className="text-xs text-gray-500">Download your entire collection</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadAllBookmarks('json')}
                  className="w-full"
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadAllBookmarks('csv')}
                  className="w-full"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload History Dialog */}
      <Dialog open={showUploadHistory} onOpenChange={setShowUploadHistory}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Upload History
              </DialogTitle>
            </div>
          </DialogHeader>
          
          {/* Filters */}
          <div className="flex items-center gap-4 py-4 border-b">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by URL or source..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={historyFilter} onValueChange={(v: any) => setHistoryFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No upload history found</p>
                <p className="text-sm text-gray-400">Your bulk upload logs will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((log) => (
                  <Card key={log.id} className="overflow-hidden border-l-4 border-l-indigo-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {log.source}
                            </Badge>
                            {log.importMethod && (
                              <Badge variant="secondary" className="text-xs">
                                {log.importMethod}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {new Date(log.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{log.totalLinks}</div>
                          <div className="text-xs text-gray-500">Total Links</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
                          <div className="text-lg font-bold text-green-600">{log.successCount}</div>
                          <div className="text-xs text-gray-600">Success</div>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded-lg border border-red-200">
                          <div className="text-lg font-bold text-red-600">{log.failedCount}</div>
                          <div className="text-xs text-gray-600">Failed</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="text-lg font-bold text-yellow-600">{log.duplicateCount}</div>
                          <div className="text-xs text-gray-600">Duplicates</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-lg font-bold text-gray-600">{log.skippedCount}</div>
                          <div className="text-xs text-gray-600">Skipped</div>
                        </div>
                      </div>

                      {/* Expandable links list */}
                      {log.linksData && log.linksData.length > 0 && (
                        <details className="group">
                          <summary className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 group-open:rotate-90 transition-transform" />
                            View {log.linksData.length} imported links
                          </summary>
                          <div className="mt-3 max-h-64 overflow-y-auto space-y-2 pl-6">
                            {log.linksData.map((link: any, idx: number) => (
                              <div
                                key={idx}
                                className={cn(
                                  "p-2 rounded-lg border text-sm flex items-start gap-2",
                                  link.status === 'success' && "bg-green-50 border-green-200",
                                  link.status === 'duplicate' && "bg-yellow-50 border-yellow-200",
                                  link.status === 'skipped' && "bg-gray-50 border-gray-200",
                                  link.status === 'failed' && "bg-red-50 border-red-200"
                                )}
                              >
                                <div className={cn(
                                  "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                                  link.status === 'success' && "bg-green-500",
                                  link.status === 'duplicate' && "bg-yellow-500",
                                  link.status === 'skipped' && "bg-gray-400",
                                  link.status === 'failed' && "bg-red-500"
                                )} />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate">{link.url}</div>
                                  {link.title && <div className="text-gray-600 text-xs">{link.title}</div>}
                                  {link.error && <div className="text-red-600 text-xs">{link.error}</div>}
                                </div>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs capitalize flex-shrink-0",
                                    link.status === 'success' && "border-green-500 text-green-700",
                                    link.status === 'duplicate' && "border-yellow-500 text-yellow-700",
                                    link.status === 'skipped' && "border-gray-400 text-gray-600",
                                    link.status === 'failed' && "border-red-500 text-red-700"
                                  )}
                                >
                                  {link.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}

                      {/* Settings used */}
                      {log.settings && Object.keys(log.settings).length > 0 && (
                        <details className="group mt-3">
                          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-700 flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            View settings used
                          </summary>
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs font-mono overflow-x-auto">
                            <pre>{JSON.stringify(log.settings, null, 2)}</pre>
                          </div>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

