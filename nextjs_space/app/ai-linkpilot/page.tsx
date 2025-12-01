
"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardAuth } from "@/components/dashboard-auth"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { 
  Settings, 
  Wand2, 
  Upload, 
  CheckCircle2, 
  Chrome,
  ChevronDown,
  ChevronUp,
  Download,
  ArrowLeft,
  History,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Sparkles,
  FileText,
  RefreshCw,
  RotateCcw
} from "lucide-react"

export default function AILinkPilotPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("auto-processing")
  const [discoverySubTab, setDiscoverySubTab] = useState("recommendations")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    intake: true,
    tagging: true,
    filtering: true,
    rules: true
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Bulk Uploader States
  const [uploadMethod, setUploadMethod] = useState<"drag-drop" | "paste-text" | "single-url">("drag-drop")
  const [pasteText, setPasteText] = useState("")
  const [singleUrl, setSingleUrl] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Enhanced Bulk Uploader States
  type LinkStatus = 'queued' | 'processing' | 'success' | 'failed' | 'perfect'
  type ParsedLink = {
    id: string
    url: string
    domain: string
    category: string
    status: LinkStatus
    error?: string
  }
  
  const [parsedLinks, setParsedLinks] = useState<ParsedLink[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set())
  const [previewTab, setPreviewTab] = useState<'all' | 'web'>('all')
  
  // Relevant Bulk Upload Settings
  const [validateUrls, setValidateUrls] = useState(true)
  const [checkDuplicates, setCheckDuplicates] = useState(true)
  const [fetchMetadata, setFetchMetadata] = useState(true)
  const [fetchFavicons, setFetchFavicons] = useState(true)
  const [autoRetryFailed, setAutoRetryFailed] = useState(false)
  const [maxRetries, setMaxRetries] = useState("3")
  const [processingMode, setProcessingMode] = useState<"sequential" | "parallel">("parallel")
  const [concurrentLimit, setConcurrentLimit] = useState("5")
  const [defaultPriority, setDefaultPriority] = useState("MEDIUM")
  const [defaultPrivacy, setDefaultPrivacy] = useState("PRIVATE")
  const [defaultCategory, setDefaultCategory] = useState("")
  const [autoApplyTags, setAutoApplyTags] = useState("")
  const [skipExisting, setSkipExisting] = useState(true)
  const [logImports, setLogImports] = useState(true)
  
  // Upload Statistics
  const [uploadStats, setUploadStats] = useState({
    total: 0,
    perfect: 0,
    queued: 0,
    processing: 0,
    success: 0,
    failed: 0,
    successRate: 0
  })

  // Categories for default category dropdown
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])
  
  // Upload history
  const [showUploadHistory, setShowUploadHistory] = useState(false)
  const [uploadHistory, setUploadHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Fetch upload history
  const fetchUploadHistory = async () => {
    setLoadingHistory(true)
    try {
      const response = await fetch('/api/ai-linkpilot/bulk-upload-log?limit=20')
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

  // Open history modal
  const handleShowHistory = () => {
    setShowUploadHistory(true)
    fetchUploadHistory()
  }

  // Auto-Processing States
  const [manualSaves, setManualSaves] = useState(true)
  const [bulkUploads, setBulkUploads] = useState(true)
  const [browserCapture, setBrowserCapture] = useState(true)
  const [pauseProcessing, setPauseProcessing] = useState(false)
  const [autoTagging, setAutoTagging] = useState(true)
  const [confidenceThreshold, setConfidenceThreshold] = useState([48])
  const [tagStyle, setTagStyle] = useState("singular")
  const [languageMode, setLanguageMode] = useState("auto-detect")
  const [synonymMapping, setSynonymMapping] = useState(false)
  const [normalization, setNormalization] = useState(true)
  const [manualReview, setManualReview] = useState(true)
  const [stripTracking, setStripTracking] = useState(true)
  const [domainBlacklist, setDomainBlacklist] = useState("")
  const [minContentLength, setMinContentLength] = useState("100")
  const [duplicateHandling, setDuplicateHandling] = useState("skip")
  const [suggestFolder, setSuggestFolder] = useState(true)
  const [autoFile, setAutoFile] = useState(false)
  const [smartContext, setSmartContext] = useState(true)
  const [fallbackFolder, setFallbackFolder] = useState("inbox")
  const [draftExpiration, setDraftExpiration] = useState("7-days")

  // Bulk Uploader Functions
  const normalizeUrl = (url: string): string => {
    let normalized = url.trim()
    // Auto-add https:// if missing protocol
    if (!normalized.match(/^https?:\/\//i)) {
      normalized = 'https://' + normalized
    }
    return normalized
  }

  const extractUrlsFromText = (text: string): string[] => {
    // Match URLs with or without protocol
    const urlRegex = /(https?:\/\/[^\s]+|(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/g
    const matches = text.match(urlRegex) || []
    const normalized = matches.map(url => normalizeUrl(url))
    return [...new Set(normalized)] // Remove duplicates
  }

  const parseCSV = (text: string): string[] => {
    const lines = text.split('\n')
    const urls: string[] = []
    
    lines.forEach(line => {
      const cells = line.split(',')
      cells.forEach(cell => {
        const trimmed = cell.trim().replace(/["']/g, '')
        // Check if it looks like a URL
        if (trimmed.match(/^(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/)) {
          urls.push(normalizeUrl(trimmed))
        }
      })
    })
    
    return [...new Set(urls)] // Remove duplicates
  }

  const createBookmarksFromUrls = async (urls: string[]) => {
    if (urls.length === 0) {
      toast.error('No valid URLs found')
      return
    }

    // Show progress toast
    const loadingToast = toast.loading(`Importing ${urls.length} bookmark${urls.length > 1 ? 's' : ''}...`)
    setIsUploading(true)
    
    let successCount = 0
    let failCount = 0
    let duplicateCount = 0
    const errors: string[] = []

    try {
      // Process in batches of 5 for better performance
      const batchSize = 5
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize)
        const promises = batch.map(async (url) => {
          try {
            // Validate URL format
            new URL(url) // Throws if invalid
            
            const response = await fetch('/api/bookmarks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url,
                title: new URL(url).hostname.replace('www.', '').toUpperCase(),
                priority: 'MEDIUM'
              })
            })

            if (response.ok) {
              successCount++
              return { success: true }
            } else {
              const errorData = await response.json()
              
              // Check if it's a duplicate error
              if (response.status === 409 || errorData.error?.includes('already exists') || errorData.error?.includes('duplicate')) {
                duplicateCount++
                return { success: false, duplicate: true }
              }
              
              failCount++
              errors.push(`${url}: ${errorData.error || 'Unknown error'}`)
              return { success: false, error: errorData.error }
            }
          } catch (error: any) {
            failCount++
            const errorMsg = error instanceof Error ? error.message : 'Invalid URL'
            errors.push(`${url}: ${errorMsg}`)
            return { success: false, error: errorMsg }
          }
        })

        await Promise.all(promises)
        
        // Update progress toast
        const processed = Math.min(i + batchSize, urls.length)
        toast.loading(`Imported ${processed}/${urls.length} bookmarks...`, { id: loadingToast })
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast)

      // Show detailed results
      if (successCount > 0) {
        let message = `✅ Successfully imported ${successCount} bookmark${successCount > 1 ? 's' : ''}`
        if (duplicateCount > 0) {
          message += `\n⚠️ ${duplicateCount} duplicate${duplicateCount > 1 ? 's' : ''} skipped`
        }
        if (failCount > 0) {
          message += `\n❌ ${failCount} failed`
        }
        toast.success(message)
        
        // Reset forms
        setPasteText("")
        setSingleUrl("")
      } else if (duplicateCount > 0) {
        toast.warning(`All ${duplicateCount} bookmark${duplicateCount > 1 ? 's were' : ' was'} already in your collection`)
      } else {
        toast.error(`Failed to import bookmarks. ${errors.length > 0 ? errors.slice(0, 3).join('\n') : 'Please check the URLs and try again.'}`)
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error('Error importing bookmarks: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsUploading(false)
    }
  }

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

      await createBookmarksFromUrls(urls)
    }
    reader.readAsText(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handlePasteTextImport = () => {
    const urls = extractUrlsFromText(pasteText)
    createBookmarksFromUrls(urls)
  }

  const handleSingleUrlImport = () => {
    if (!singleUrl.trim()) {
      toast.error('Please enter a URL')
      return
    }
    
    // Normalize the URL (auto-add https:// if missing)
    const normalizedUrl = normalizeUrl(singleUrl)
    
    // Validate it's a proper URL
    try {
      new URL(normalizedUrl)
      createBookmarksFromUrls([normalizedUrl])
    } catch (error) {
      toast.error('Please enter a valid URL (e.g., google.com or https://google.com)')
    }
  }

  // Enhanced Parse Function
  const handleParseLinks = () => {
    let urls: string[] = []
    
    if (uploadMethod === "paste-text") {
      urls = extractUrlsFromText(pasteText)
    } else if (uploadMethod === "single-url") {
      if (singleUrl.trim()) {
        const normalized = normalizeUrl(singleUrl)
        try {
          new URL(normalized)
          urls = [normalized]
        } catch (error) {
          toast.error('Invalid URL format')
          return
        }
      }
    }

    if (urls.length === 0) {
      toast.error('No valid URLs found')
      return
    }

    // Parse URLs into structured data
    const parsed: ParsedLink[] = urls.map((url, index) => {
      try {
        const urlObj = new URL(url)
        return {
          id: `link-${index}-${Date.now()}`,
          url,
          domain: urlObj.hostname.replace('www.', ''),
          category: 'General',
          status: 'queued' as LinkStatus
        }
      } catch (error) {
        return {
          id: `link-${index}-${Date.now()}`,
          url,
          domain: url,
          category: 'General',
          status: 'failed' as LinkStatus,
          error: 'Invalid URL format'
        }
      }
    })

    setParsedLinks(parsed)
    setSelectedLinks(new Set(parsed.map(l => l.id)))
    setShowPreview(true)

    // Update stats
    setUploadStats({
      total: parsed.length,
      perfect: 0,
      queued: parsed.filter(l => l.status === 'queued').length,
      processing: 0,
      success: 0,
      failed: parsed.filter(l => l.status === 'failed').length,
      successRate: 0
    })

    toast.success(`Parsed ${parsed.length} link${parsed.length > 1 ? 's' : ''}`)
  }

  // Enhanced Import Function with Status Tracking
  const handleImportSelectedLinks = async () => {
    const linksToImport = parsedLinks.filter(link => selectedLinks.has(link.id) && link.status !== 'failed')
    
    if (linksToImport.length === 0) {
      toast.error('No valid links selected')
      return
    }

    setIsUploading(true)
    const loadingToast = toast.loading(`Importing ${linksToImport.length} link${linksToImport.length > 1 ? 's' : ''}...`)

    let successCount = 0
    let failCount = 0
    let duplicateCount = 0
    let skippedCount = 0

    // Prepare tags from autoApplyTags setting
    const tagsToApply = autoApplyTags
      ? autoApplyTags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : []

    try {
      // Process links
      for (const link of linksToImport) {
        // Skip if duplicates should be skipped and URL exists
        if (skipExisting && checkDuplicates) {
          try {
            const checkResponse = await fetch(`/api/bookmarks?search=${encodeURIComponent(link.url)}`)
            if (checkResponse.ok) {
              const checkData = await checkResponse.json()
              if (checkData.bookmarks?.some((b: any) => b.url === link.url)) {
                skippedCount++
                setParsedLinks(prev => 
                  prev.map(l => l.id === link.id ? { ...l, status: 'success' as LinkStatus, error: 'Skipped (exists)' } : l)
                )
                continue
              }
            }
          } catch (error) {
            // If check fails, continue with import
          }
        }

        // Update status to processing
        setParsedLinks(prev => 
          prev.map(l => l.id === link.id ? { ...l, status: 'processing' as LinkStatus } : l)
        )

        try {
          const response = await fetch('/api/bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: link.url,
              title: link.domain.toUpperCase(),
              priority: defaultPriority,
              tags: tagsToApply.length > 0 ? tagsToApply : undefined
            })
          })

          if (response.ok) {
            successCount++
            setParsedLinks(prev => 
              prev.map(l => l.id === link.id ? { ...l, status: 'perfect' as LinkStatus } : l)
            )
          } else {
            const errorData = await response.json()
            if (response.status === 409 || errorData.error?.includes('already exists')) {
              duplicateCount++
              setParsedLinks(prev => 
                prev.map(l => l.id === link.id ? { ...l, status: 'success' as LinkStatus, error: 'Duplicate' } : l)
              )
            } else {
              failCount++
              setParsedLinks(prev => 
                prev.map(l => l.id === link.id ? { ...l, status: 'failed' as LinkStatus, error: errorData.error } : l)
              )
            }
          }
        } catch (error) {
          failCount++
          setParsedLinks(prev => 
            prev.map(l => l.id === link.id ? { ...l, status: 'failed' as LinkStatus, error: 'Network error' } : l)
          )
        }
      }

      toast.dismiss(loadingToast)

      // Update final stats
      const finalStats = {
        total: parsedLinks.length,
        perfect: parsedLinks.filter(l => l.status === 'perfect').length + successCount,
        queued: parsedLinks.filter(l => l.status === 'queued').length - linksToImport.length,
        processing: 0,
        success: successCount,
        failed: failCount,
        successRate: Math.round((successCount / linksToImport.length) * 100)
      }
      setUploadStats(finalStats)

      // Log the upload if enabled
      if (logImports) {
        try {
          await fetch('/api/ai-linkpilot/bulk-upload-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              totalLinks: linksToImport.length,
              successCount,
              failedCount: failCount,
              duplicateCount,
              skippedCount,
              settings: {
                validateUrls,
                checkDuplicates,
                fetchMetadata,
                fetchFavicons,
                autoRetryFailed,
                maxRetries,
                processingMode,
                concurrentLimit,
                defaultPriority,
                defaultPrivacy,
                defaultCategory,
                autoApplyTags,
                skipExisting
              },
              source: 'bulk_uploader',
              importMethod: uploadMethod,
              linksData: parsedLinks
            })
          })
        } catch (logError) {
          console.error('Failed to log upload:', logError)
        }
      }

      if (successCount > 0) {
        let message = `✅ Successfully imported ${successCount} link${successCount > 1 ? 's' : ''}`
        if (skippedCount > 0) {
          message += `\n⏭️ ${skippedCount} skipped (already exist)`
        }
        if (duplicateCount > 0) {
          message += `\n⚠️ ${duplicateCount} duplicate${duplicateCount > 1 ? 's' : ''}`
        }
        if (failCount > 0) {
          message += `\n❌ ${failCount} failed`
        }
        toast.success(message)
      } else if (duplicateCount > 0 || skippedCount > 0) {
        toast.warning(`All ${duplicateCount + skippedCount} link${(duplicateCount + skippedCount) > 1 ? 's were' : ' was'} already in your collection`)
      } else {
        toast.error('Failed to import links')
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error('Error importing links: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsUploading(false)
    }
  }

  // Toggle link selection
  const toggleLinkSelection = (id: string) => {
    setSelectedLinks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // Toggle all links
  const toggleAllLinks = () => {
    if (selectedLinks.size === parsedLinks.length) {
      setSelectedLinks(new Set())
    } else {
      setSelectedLinks(new Set(parsedLinks.map(l => l.id)))
    }
  }

  // Export functionality
  const handleExportSummary = () => {
    const csvContent = [
      ['URL', 'Domain', 'Category', 'Status', 'Error'],
      ...parsedLinks.map(link => [
        link.url,
        link.domain,
        link.category,
        link.status,
        link.error || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bulk-upload-summary-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Summary exported successfully')
  }

  // Retry failed links
  const handleRetryFailed = () => {
    const failedLinks = parsedLinks.filter(l => l.status === 'failed')
    if (failedLinks.length === 0) {
      toast.info('No failed links to retry')
      return
    }
    
    setParsedLinks(prev => 
      prev.map(l => l.status === 'failed' ? { ...l, status: 'queued' as LinkStatus, error: undefined } : l)
    )
    
    setUploadStats(prev => ({
      ...prev,
      queued: prev.queued + failedLinks.length,
      failed: 0
    }))
    
    toast.success(`${failedLinks.length} failed link${failedLinks.length > 1 ? 's' : ''} queued for retry`)
  }

  const sidebarItems = [
    { id: "auto-processing", icon: Settings, label: "Auto-Processing" },
    { id: "content-discovery", icon: Wand2, label: "Content Discovery" },
    { id: "bulk-uploader", icon: Upload, label: "Bulk Link Uploader" },
    { id: "link-validator", icon: CheckCircle2, label: "Link Validator" },
    { id: "browser-launcher", icon: Chrome, label: "Browser Launcher" }
  ]

  return (
    <DashboardAuth>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4">
          {/* Main bordered container */}
          <div className="border border-gray-300 rounded-lg p-3 sm:p-4 md:p-6 bg-white overflow-hidden">
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
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base font-semibold">AI LINKPILOT</span>
                  {activeTab !== "auto-processing" && (
                    <>
                      <span className="text-gray-400 hidden sm:inline">-</span>
                      <span className="text-sm sm:text-base text-gray-700 hidden sm:inline">
                        {sidebarItems.find(item => item.id === activeTab)?.label}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100 text-xs">
                AI-Powered
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Left sidebar - AI LinkPilot Sections */}
              <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                {/* AI LinkPilot Sections Card */}
                <Card className="bg-white border shadow-sm overflow-hidden">
                  <CardHeader className="pb-4">
                    <h2 className="text-lg sm:text-lg sm:text-xl font-bold text-black mb-2 uppercase">AI LinkPilot</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Automate and optimize your bookmarks</p>
                  </CardHeader>
                  <CardContent className="space-y-2 pb-6">
                    {sidebarItems.map((item) => {
                      const Icon = item.icon
                      const isActive = activeTab === item.id
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                            isActive 
                              ? "bg-black text-white font-medium" 
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span className="flex-1">{item.label}</span>
                        </button>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Main content area */}
              <div className="lg:col-span-2 min-w-0">
              {activeTab === "auto-processing" && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-xl sm:text-2xl font-bold text-gray-900 uppercase">AUTO-PROCESSING</h2>
                      <p className="text-xs sm:text-xs sm:text-sm text-gray-500 mt-1">autoProcessing.description</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <Select defaultValue="english">
                        <SelectTrigger className="w-32 sm:w-40">
                          <div className="flex items-center gap-2">
                            <span>🇺🇸</span>
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" className="hidden sm:flex">
                        <History className="h-4 w-4 mr-2" />
                        autoProcessing.history
                      </Button>
                    </div>
                  </div>

                  {/* Tag Cloud Snapshot Card */}
                  <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 overflow-hidden">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">TAG CLOUD SNAPSHOT</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Top tags from the past 7 days</p>
                  </Card>

                  {/* Intake Scope */}
                  <Card className="overflow-hidden bg-white border-gray-200">
                    <button
                      onClick={() => toggleSection("intake")}
                      className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors bg-white"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 flex-shrink-0" />
                        <div className="text-left min-w-0">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900">INTAKE SCOPE</h3>
                          <p className="text-xs sm:text-xs sm:text-sm text-gray-500 line-clamp-1">Control which types of link additions trigger auto-processing</p>
                        </div>
                      </div>
                      {expandedSections.intake ? (
                        <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {expandedSections.intake && (
                      <div className="px-4 sm:px-6 pb-6 space-y-4 bg-white">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Manual saves</p>
                              <p className="text-xs text-gray-500">Process links saved manually</p>
                            </div>
                            <Switch checked={manualSaves} onCheckedChange={setManualSaves} />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Bulk uploads</p>
                              <p className="text-xs text-gray-500">Process bulk imported links</p>
                            </div>
                            <Switch checked={bulkUploads} onCheckedChange={setBulkUploads} />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Browser capture</p>
                              <p className="text-xs text-gray-500">Process browser extension saves</p>
                            </div>
                            <Switch checked={browserCapture} onCheckedChange={setBrowserCapture} />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Pause all processing</p>
                              <p className="text-xs text-gray-500">Temporarily disable auto-processing</p>
                            </div>
                            <Switch checked={pauseProcessing} onCheckedChange={setPauseProcessing} />
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Auto-Tagging & Metadata */}
                  <Card className="overflow-hidden bg-white border-gray-200">
                    <button
                      onClick={() => toggleSection("tagging")}
                      className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors bg-white"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Wand2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 flex-shrink-0" />
                        <div className="text-left min-w-0">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900">AUTO-TAGGING & METADATA</h3>
                          <p className="text-xs sm:text-xs sm:text-sm text-gray-500 line-clamp-1">Configure automatic tag generation and content analysis</p>
                        </div>
                      </div>
                      {expandedSections.tagging ? (
                        <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {expandedSections.tagging && (
                      <div className="px-4 sm:px-6 pb-6 space-y-4 sm:space-y-6 bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Enable auto-tagging</p>
                            <p className="text-xs sm:text-sm text-gray-500">Automatically generate tags for new links</p>
                          </div>
                          <Switch checked={autoTagging} onCheckedChange={setAutoTagging} />
                        </div>

                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <Label className="text-gray-900 text-sm sm:text-base">Confidence threshold</Label>
                            <span className="text-xs sm:text-xs sm:text-sm text-gray-500">~{confidenceThreshold[0]}% of links will auto-apply</span>
                          </div>
                          <Slider
                            value={confidenceThreshold}
                            onValueChange={setConfidenceThreshold}
                            max={100}
                            step={1}
                            className="mb-2"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Conservative</span>
                            <span>50%</span>
                            <span>Aggressive</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <Label className="mb-2 block text-gray-900">Preferred tag style</Label>
                            <Select value={tagStyle} onValueChange={setTagStyle}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="singular">Singular (tag)</SelectItem>
                                <SelectItem value="plural">Plural (tags)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="mb-2 block text-gray-900">Language mode</Label>
                            <Select value={languageMode} onValueChange={setLanguageMode}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="auto-detect">Auto-detect</SelectItem>
                                <SelectItem value="english">English</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Synonym mapping</p>
                              <p className="text-xs text-gray-500">Group related tags together</p>
                            </div>
                            <Switch checked={synonymMapping} onCheckedChange={setSynonymMapping} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Normalization engine</p>
                              <p className="text-xs text-gray-500">Standardize tag formats and remove duplicates</p>
                            </div>
                            <Switch checked={normalization} onCheckedChange={setNormalization} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Manual review below threshold</p>
                              <p className="text-xs text-gray-500">Queue low-confidence tags for manual approval</p>
                            </div>
                            <Switch checked={manualReview} onCheckedChange={setManualReview} />
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Filtering & Categorization */}
                  <Card className="overflow-hidden bg-white border-gray-200">
                    <button
                      onClick={() => toggleSection("filtering")}
                      className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors bg-white"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <div className="text-left min-w-0">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900">FILTERING & CATEGORIZATION</h3>
                          <p className="text-xs sm:text-xs sm:text-sm text-gray-500 line-clamp-1">Configure content filtering, duplicate handling, and smart categorization</p>
                        </div>
                      </div>
                      {expandedSections.filtering ? (
                        <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {expandedSections.filtering && (
                      <div className="px-4 sm:px-6 pb-6 space-y-4 sm:space-y-6 bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Strip tracking parameters</p>
                            <p className="text-xs sm:text-sm text-gray-500">Remove UTM codes and tracking parameters from URLs</p>
                          </div>
                          <Switch checked={stripTracking} onCheckedChange={setStripTracking} />
                        </div>

                        <div>
                          <Label className="mb-2 block text-gray-900">Domain blacklist</Label>
                          <Textarea
                            value={domainBlacklist}
                            onChange={(e) => setDomainBlacklist(e.target.value)}
                            placeholder="Enter domains to exclude, one per line..."
                            className="h-24 resize-none"
                          />
                          <p className="text-xs text-gray-500 mt-2">Links from these domains will be automatically rejected</p>
                        </div>

                        <div>
                          <Label className="mb-2 block text-gray-900">Minimum content length</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={minContentLength}
                              onChange={(e) => setMinContentLength(e.target.value)}
                              className="w-32"
                            />
                            <span className="text-xs sm:text-sm text-gray-500">words</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Reject pages with less content than this threshold</p>
                        </div>

                        <div>
                          <Label className="mb-3 block text-gray-900">Duplicate handling</Label>
                          <RadioGroup value={duplicateHandling} onValueChange={setDuplicateHandling} className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="skip" id="skip" />
                              <Label htmlFor="skip" className="font-normal cursor-pointer text-gray-900">
                                Skip - Ignore duplicate URLs
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="overwrite" id="overwrite" />
                              <Label htmlFor="overwrite" className="font-normal cursor-pointer text-gray-900">
                                Overwrite - Update existing entry
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="keep-both" id="keep-both" />
                              <Label htmlFor="keep-both" className="font-normal cursor-pointer text-gray-900">
                                Keep both - Allow multiple versions
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Suggest folder path</p>
                              <p className="text-xs text-gray-500">AI recommends appropriate folders for new links</p>
                            </div>
                            <Switch checked={suggestFolder} onCheckedChange={setSuggestFolder} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Auto-file into suggested folder</p>
                              <p className="text-xs text-gray-500">Automatically move links to suggested folders</p>
                            </div>
                            <Switch checked={autoFile} onCheckedChange={setAutoFile} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Smart folder context</p>
                              <p className="text-xs text-gray-500">Consider existing folder contents for better suggestions</p>
                            </div>
                            <Switch checked={smartContext} onCheckedChange={setSmartContext} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <Label className="mb-2 block text-gray-900 text-sm">Fallback folder</Label>
                            <Select value={fallbackFolder} onValueChange={setFallbackFolder}>
                              <SelectTrigger>
                                <div className="flex items-center gap-2">
                                  <span>📥</span>
                                  <SelectValue />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="inbox">Inbox</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="mb-2 block text-gray-900 text-sm">Draft expiration</Label>
                            <Select value={draftExpiration} onValueChange={setDraftExpiration}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7-days">7 days</SelectItem>
                                <SelectItem value="14-days">14 days</SelectItem>
                                <SelectItem value="30-days">30 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Rule Builder */}
                  <Card className="overflow-hidden bg-white border-gray-200">
                    <button
                      onClick={() => toggleSection("rules")}
                      className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors bg-white"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <div className="text-left min-w-0">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900">RULE BUILDER</h3>
                          <p className="text-xs sm:text-xs sm:text-sm text-gray-500 line-clamp-1">Create custom rules for automatic link processing</p>
                        </div>
                      </div>
                      {expandedSections.rules ? (
                        <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {expandedSections.rules && (
                      <div className="px-4 sm:px-6 pb-6 bg-white">
                        <div className="text-center py-8">
                          <p className="text-xs sm:text-xs sm:text-sm text-gray-500 mb-4">0 rules configured</p>
                          <Button className="bg-black text-white hover:bg-gray-800 text-sm">
                            <span className="mr-2">+</span>
                            Add Rule
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Import/Export Settings */}
                  <Card className="p-4 sm:p-6 bg-white border-gray-200 overflow-hidden">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">IMPORT / EXPORT SETTINGS</h3>
                    <p className="text-xs sm:text-xs sm:text-sm text-gray-500 mb-4">Backup or restore your auto-processing configuration</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Export JSON
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Upload className="h-4 w-4 mr-2" />
                        Import JSON
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === "content-discovery" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 uppercase">AI CONTENT DISCOVERY</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Personalized recommendations and intelligent link finding powered by AI</p>
                  </div>

                  {/* Sub-tabs */}
                  <div className="flex gap-2 border-b border-gray-200">
                    <button 
                      onClick={() => setDiscoverySubTab("recommendations")}
                      className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        discoverySubTab === "recommendations"
                          ? "text-gray-900 border-black"
                          : "text-gray-500 hover:text-gray-900 border-transparent"
                      )}
                    >
                      Recommendations
                    </button>
                    <button 
                      onClick={() => setDiscoverySubTab("link-finder")}
                      className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        discoverySubTab === "link-finder"
                          ? "text-gray-900 border-black"
                          : "text-gray-500 hover:text-gray-900 border-transparent"
                      )}
                    >
                      Link Finder
                    </button>
                  </div>

                  {/* Recommendations Tab Content */}
                  {discoverySubTab === "recommendations" && (
                    <>
                      {/* Personalized Recommendations */}
                      <Card className="p-4 sm:p-6 bg-white border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                          <Wand2 className="h-5 w-5 text-gray-700" />
                          <h3 className="font-semibold text-gray-900">PERSONALIZED RECOMMENDATIONS</h3>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-6">AI-powered suggestions based on your interests and reading habits</p>

                        <div className="space-y-6">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <Label>Suggestions per refresh</Label>
                              <span className="text-sm font-medium text-gray-900">5</span>
                            </div>
                            <Slider defaultValue={[5]} max={10} step={1} className="mb-2" />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <Label>Serendipity Level</Label>
                              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <Slider defaultValue={[50]} max={100} step={1} className="mb-2" />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Focused</span>
                              <span>Diverse</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Include trending links</p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Auto-include after selection</p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Show TL;DR summaries</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </Card>

                      {/* Generate Recommendations Button */}
                      <Card className="p-4 sm:p-6 bg-white border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-2">GENERATE RECOMMENDATIONS</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mb-4">Get AI-powered content suggestions</p>
                        <Button className="bg-black text-white hover:bg-gray-800">
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate
                        </Button>
                      </Card>
                    </>
                  )}

                  {/* Link Finder Tab Content */}
                  {discoverySubTab === "link-finder" && (
                    <Card className="p-4 sm:p-6 bg-white border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="font-semibold text-gray-900">AI LINK FINDER</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-6">Discover relevant links using AI-powered search</p>

                      <div className="space-y-6">
                        <div>
                          <Label className="mb-2 block">Topic / Keywords</Label>
                          <Input placeholder="e.g., artificial intelligence, web development" />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            <Label>Use my profile interests</Label>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div>
                          <Label className="mb-2 block">Date Range</Label>
                          <Select defaultValue="past-week">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="past-week">Past week</SelectItem>
                              <SelectItem value="past-month">Past month</SelectItem>
                              <SelectItem value="past-year">Past year</SelectItem>
                              <SelectItem value="all-time">All time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="mb-2 block">Link Types</Label>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Article</Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Video</Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">PDF</Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Repo</Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Dataset</Badge>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <Label>Max results</Label>
                            <span className="text-sm font-medium text-gray-900">20</span>
                          </div>
                          <Slider defaultValue={[20]} min={5} max={50} step={5} />
                        </div>

                        <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white">
                          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Find Links
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === "bulk-uploader" && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl sm:text-xl sm:text-2xl font-bold text-gray-900 uppercase">MAGIC BULK LINK UPLOADER</h2>
                      <p className="text-xs sm:text-xs sm:text-sm text-gray-500 mt-1">Import multiple links at once with intelligent categorization and batch processing</p>
                    </div>
                    {showPreview && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-md">
                        <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-sm font-medium text-yellow-700">You have unsaved changes</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Import Links Section */}
                    <Card className="lg:col-span-2 p-4 sm:p-6 bg-white border-gray-200 overflow-hidden">
                      <h3 className="font-semibold text-gray-900 mb-4">IMPORT LINKS</h3>
                      
                      {/* Upload Method Tabs */}
                      <div className="flex gap-4 mb-6 border-b">
                        <button
                          onClick={() => {
                            setUploadMethod("drag-drop")
                            setShowPreview(false)
                            setParsedLinks([])
                          }}
                          className={cn(
                            "flex items-center gap-2 text-sm font-medium pb-2 border-b-2 transition-colors",
                            uploadMethod === "drag-drop"
                              ? "text-gray-900 border-blue-500"
                              : "text-gray-500 hover:text-gray-900 border-transparent"
                          )}
                        >
                          <Upload className="h-4 w-4" />
                          Drag & Drop
                        </button>
                        <button
                          onClick={() => {
                            setUploadMethod("paste-text")
                            setShowPreview(false)
                            setParsedLinks([])
                          }}
                          className={cn(
                            "flex items-center gap-2 text-sm font-medium pb-2 border-b-2 transition-colors",
                            uploadMethod === "paste-text"
                              ? "text-gray-900 border-blue-500"
                              : "text-gray-500 hover:text-gray-900 border-transparent"
                          )}
                        >
                          <FileText className="h-4 w-4" />
                          Paste Text
                        </button>
                        <button
                          onClick={() => {
                            setUploadMethod("single-url")
                            setShowPreview(false)
                            setParsedLinks([])
                          }}
                          className={cn(
                            "flex items-center gap-2 text-sm font-medium pb-2 border-b-2 transition-colors",
                            uploadMethod === "single-url"
                              ? "text-gray-900 border-blue-500"
                              : "text-gray-500 hover:text-gray-900 border-transparent"
                          )}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          Single URL
                        </button>
                      </div>

                      {/* Paste Text View */}
                      {uploadMethod === "paste-text" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">PASTE URLS</Label>
                            <Textarea
                              placeholder="Paste multiple URLs (one per line or space-separated)&#10;&#10;https://example.com&#10;google.com&#10;www.github.com"
                              value={pasteText}
                              onChange={(e) => setPasteText(e.target.value)}
                              className="min-h-[200px] font-mono text-sm bg-gray-50"
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button
                              onClick={handleParseLinks}
                              disabled={!pasteText || isUploading}
                              className="bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600"
                            >
                              <Sparkles className="h-4 w-4 mr-2" />
                              Parse {pasteText ? extractUrlsFromText(pasteText).length : 0} Link{extractUrlsFromText(pasteText).length !== 1 ? 's' : ''}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Single URL View */}
                      {uploadMethod === "single-url" && (
                        <div className="space-y-4">
                          <div>
                            <Label className="mb-2 block text-sm font-medium">ENTER URL</Label>
                            <Input
                              type="url"
                              placeholder="https://example.com or just example.com"
                              value={singleUrl}
                              onChange={(e) => setSingleUrl(e.target.value)}
                              className="font-mono"
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button
                              onClick={handleParseLinks}
                              disabled={!singleUrl || isUploading}
                              className="bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600"
                            >
                              <Sparkles className="h-4 w-4 mr-2" />
                              Parse 1 Link
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Drag & Drop View */}
                      {uploadMethod === "drag-drop" && (
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
                              "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
                              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                            )}
                          >
                            <div className="flex justify-center mb-4">
                              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                                <Upload className="h-8 w-8 text-white" />
                              </div>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-blue-500 mb-2">
                              DROP YOUR FILES HERE
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 mb-4">
                              Drag and drop CSV or TXT files with URLs
                            </p>
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="bg-blue-500 text-white hover:bg-blue-600"
                            >
                              Choose Files
                            </Button>
                          </div>
                        </>
                      )}

                      {/* Preview & Edit Section */}
                      {showPreview && parsedLinks.length > 0 && (
                        <div className="mt-6 space-y-4">
                          <Separator />
                          
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">PREVIEW & EDIT</h4>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleAllLinks}
                              >
                                {selectedLinks.size === parsedLinks.length ? 'Deselect All' : `Select All (${parsedLinks.length})`}
                              </Button>
                            </div>
                          </div>

                          {/* Preview Tabs */}
                          <div className="flex gap-2 border-b">
                            <button
                              onClick={() => setPreviewTab('all')}
                              className={cn(
                                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                                previewTab === 'all'
                                  ? "text-gray-900 border-blue-500"
                                  : "text-gray-500 hover:text-gray-900 border-transparent"
                              )}
                            >
                              All ({parsedLinks.length})
                            </button>
                            <button
                              onClick={() => setPreviewTab('web')}
                              className={cn(
                                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                                previewTab === 'web'
                                  ? "text-gray-900 border-blue-500"
                                  : "text-gray-500 hover:text-gray-900 border-transparent"
                              )}
                            >
                              Web ({parsedLinks.length})
                            </button>
                          </div>

                          {/* Link List */}
                          <div className="max-h-[400px] overflow-y-auto space-y-2">
                            {parsedLinks.map((link) => (
                              <div
                                key={link.id}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                                  selectedLinks.has(link.id) ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedLinks.has(link.id)}
                                  onChange={() => toggleLinkSelection(link.id)}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{link.domain}</span>
                                    {link.status === 'queued' && (
                                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                        <Clock className="h-3 w-3 mr-1" />
                                        queued
                                      </Badge>
                                    )}
                                    {link.status === 'processing' && (
                                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        processing
                                      </Badge>
                                    )}
                                    {link.status === 'perfect' && (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        perfect
                                      </Badge>
                                    )}
                                    {link.status === 'success' && (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        success
                                      </Badge>
                                    )}
                                    {link.status === 'failed' && (
                                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        failed
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 truncate">{link.url}</p>
                                  {link.error && (
                                    <p className="text-xs text-red-600 mt-1">{link.error}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">{link.category}</Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Import Button */}
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowPreview(false)
                                setParsedLinks([])
                                setPasteText("")
                                setSingleUrl("")
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleImportSelectedLinks}
                              disabled={selectedLinks.size === 0 || isUploading}
                              className="bg-black text-white hover:bg-gray-800"
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
                        </div>
                      )}
                    </Card>

                    {/* Batch Settings Section */}
                    {/* Batch Settings Section - RELEVANT TO BULK UPLOAD */}
                    <Card className="p-4 sm:p-6 bg-white border-gray-200 overflow-hidden">
                      <div className="flex items-center gap-2 mb-4">
                        <Settings className="h-5 w-5 text-gray-700" />
                        <h3 className="font-semibold text-gray-900">IMPORT SETTINGS</h3>
                      </div>

                      <div className="space-y-4">
                        {/* URL Validation */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 text-sm">URL Validation</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Validate URLs</Label>
                              <Switch checked={validateUrls} onCheckedChange={setValidateUrls} />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Check for duplicates</Label>
                              <Switch checked={checkDuplicates} onCheckedChange={setCheckDuplicates} />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Skip existing URLs</Label>
                              <Switch checked={skipExisting} onCheckedChange={setSkipExisting} />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Content Fetching */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 text-sm">Content Fetching</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Auto-fetch metadata</Label>
                              <Switch checked={fetchMetadata} onCheckedChange={setFetchMetadata} />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Fetch favicons/logos</Label>
                              <Switch checked={fetchFavicons} onCheckedChange={setFetchFavicons} />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Processing Mode */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 text-sm">Processing</h4>
                          <div className="space-y-3">
                            <div>
                              <Label className="mb-2 block text-sm">Processing mode</Label>
                              <Select value={processingMode} onValueChange={(value: "sequential" | "parallel") => setProcessingMode(value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="parallel">Parallel (Faster)</SelectItem>
                                  <SelectItem value="sequential">Sequential (Safer)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {processingMode === "parallel" && (
                              <div>
                                <Label className="mb-2 block text-sm">Concurrent limit</Label>
                                <Select value={concurrentLimit} onValueChange={setConcurrentLimit}>
                                  <SelectTrigger>
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

                        {/* Retry Settings */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 text-sm">Error Handling</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Auto-retry failed</Label>
                              <Switch checked={autoRetryFailed} onCheckedChange={setAutoRetryFailed} />
                            </div>
                            
                            {autoRetryFailed && (
                              <div>
                                <Label className="mb-2 block text-sm">Max retries</Label>
                                <Select value={maxRetries} onValueChange={setMaxRetries}>
                                  <SelectTrigger>
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
                        </div>

                        <Separator />

                        {/* Default Bookmark Settings */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 text-sm">Default Bookmark Settings</h4>
                          <div className="space-y-3">
                            <div>
                              <Label className="mb-2 block text-sm">Default priority</Label>
                              <Select value={defaultPriority} onValueChange={setDefaultPriority}>
                                <SelectTrigger>
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
                              <Label className="mb-2 block text-sm">Default privacy</Label>
                              <Select value={defaultPrivacy} onValueChange={setDefaultPrivacy}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PRIVATE">Private</SelectItem>
                                  <SelectItem value="PUBLIC">Public</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="mb-2 block text-sm">Default category</Label>
                              <Select value={defaultCategory} onValueChange={setDefaultCategory}>
                                <SelectTrigger>
                                  <SelectValue placeholder="None (uncategorized)" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">None</SelectItem>
                                  {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                      {cat.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="mb-2 block text-sm">Auto-apply tags</Label>
                              <Input 
                                placeholder="e.g., imported, 2024"
                                value={autoApplyTags}
                                onChange={(e) => setAutoApplyTags(e.target.value)}
                              />
                              <p className="text-xs text-gray-500 mt-1">Comma-separated tags</p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Logging */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 text-sm">History & Logging</h4>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Keep upload history</Label>
                              <p className="text-xs text-gray-500">Track when links were added</p>
                            </div>
                            <Switch checked={logImports} onCheckedChange={setLogImports} />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Upload Summary */}
                  {(uploadStats.total > 0 || parsedLinks.length > 0) && (
                    <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                      <h3 className="font-semibold text-gray-900 mb-4">UPLOAD SUMMARY</h3>
                      <p className="text-xs text-gray-600 mb-4">Your recent upload activity and statistics</p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-white rounded-lg border">
                          <div className="text-2xl font-bold text-green-600">{uploadStats.perfect}</div>
                          <div className="text-xs text-gray-600">Perfect</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border">
                          <div className="text-2xl font-bold text-yellow-600">{uploadStats.queued}</div>
                          <div className="text-xs text-gray-600">Queued</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border">
                          <div className="text-2xl font-bold text-blue-600">{uploadStats.processing}</div>
                          <div className="text-xs text-gray-600">Processing</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border">
                          <div className="text-2xl font-bold text-red-600">{uploadStats.failed}</div>
                          <div className="text-xs text-gray-600">Failed</div>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Links Processed:</span>
                          <span className="font-semibold">{uploadStats.total}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Successfully Saved (Complete):</span>
                          <span className="font-semibold text-green-600">{uploadStats.success}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Overall Success Rate:</span>
                          <span className={cn(
                            "font-semibold",
                            uploadStats.successRate >= 80 ? "text-green-600" : uploadStats.successRate >= 50 ? "text-yellow-600" : "text-red-600"
                          )}>
                            {uploadStats.successRate}%
                          </span>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Content Types</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-white">Web ({parsedLinks.length})</Badge>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Success Rate</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full transition-all",
                                uploadStats.successRate >= 80 ? "bg-green-500" : uploadStats.successRate >= 50 ? "bg-yellow-500" : "bg-red-500"
                              )}
                              style={{ width: `${uploadStats.successRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{uploadStats.successRate}%</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExportSummary}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Summary
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRetryFailed}
                          disabled={uploadStats.failed === 0}
                          className="flex-1"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Retry Failed
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* Upload History Button */}
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={handleShowHistory}
                      className="flex items-center gap-2"
                    >
                      <History className="h-4 w-4" />
                      View Upload History
                    </Button>
                  </div>

                  {/* Upload History Dialog */}
                  <Dialog open={showUploadHistory} onOpenChange={setShowUploadHistory}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Bulk Upload History</DialogTitle>
                      </DialogHeader>
                      
                      {loadingHistory ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                      ) : uploadHistory.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No upload history found</p>
                          <p className="text-sm text-gray-400">Your bulk upload logs will appear here</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {uploadHistory.map((log) => (
                            <Card key={log.id} className="p-4 border-l-4 border-l-blue-500">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {log.source}
                                    </Badge>
                                    {log.importMethod && (
                                      <Badge variant="secondary" className="text-xs">
                                        {log.importMethod}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(log.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-gray-900">
                                    {log.totalLinks}
                                  </div>
                                  <div className="text-xs text-gray-500">Total Links</div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                                <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                                  <div className="text-lg font-bold text-green-600">{log.successCount}</div>
                                  <div className="text-xs text-gray-600">Success</div>
                                </div>
                                <div className="text-center p-2 bg-red-50 rounded border border-red-200">
                                  <div className="text-lg font-bold text-red-600">{log.failedCount}</div>
                                  <div className="text-xs text-gray-600">Failed</div>
                                </div>
                                <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-200">
                                  <div className="text-lg font-bold text-yellow-600">{log.duplicateCount}</div>
                                  <div className="text-xs text-gray-600">Duplicates</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                                  <div className="text-lg font-bold text-gray-600">{log.skippedCount}</div>
                                  <div className="text-xs text-gray-600">Skipped</div>
                                </div>
                              </div>

                              {log.settings && Object.keys(log.settings).length > 0 && (
                                <details className="mt-4">
                                  <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                                    View Settings Used
                                  </summary>
                                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono overflow-x-auto">
                                    <pre>{JSON.stringify(log.settings, null, 2)}</pre>
                                  </div>
                                </details>
                              )}
                            </Card>
                          ))}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {activeTab === "link-validator" && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Header */}
                  <div>
                    <h2 className="text-xl sm:text-xl sm:text-2xl font-bold text-gray-900 uppercase">LINK VALIDATOR</h2>
                    <p className="text-xs sm:text-xs sm:text-sm text-gray-500 mt-1">Monitor and maintain the health of your bookmarked links with automated validation</p>
                  </div>

                  {/* Validation Summary */}
                  <Card className="p-4 sm:p-6 bg-white border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 mb-6">
                      <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <h3 className="font-semibold text-gray-900">VALIDATION SUMMARY</h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <svg className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1 uppercase">0</div>
                        <div className="text-xs sm:text-sm text-gray-500">Total Links</div>
                      </div>

                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 uppercase">0</div>
                        <div className="text-xs sm:text-xs sm:text-sm text-gray-500">Healthy</div>
                      </div>

                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <svg className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1 uppercase">0</div>
                        <div className="text-xs sm:text-sm text-gray-500">Broken</div>
                      </div>

                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1 uppercase">0</div>
                        <div className="text-xs sm:text-sm text-gray-500">Redirects</div>
                      </div>

                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1 uppercase">0</div>
                        <div className="text-xs sm:text-sm text-gray-500">Timeouts</div>
                      </div>

                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1 uppercase">0</div>
                        <div className="text-xs sm:text-sm text-gray-500">Phishing</div>
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Scope & Input */}
                    <Card className="p-4 sm:p-6 bg-white border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <h3 className="font-semibold text-gray-900">SCOPE & INPUT</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="mb-3 block text-sm">Validation Scope</Label>
                          <RadioGroup defaultValue="all" className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="all" id="all" />
                              <Label htmlFor="all" className="font-normal cursor-pointer">
                                All links in my bookmarks
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="specific" id="specific" />
                              <Label htmlFor="specific" className="font-normal cursor-pointer">
                                Select specific folders/bookmarks
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <Label className="mb-2 block text-sm">Add extra links (optional)</Label>
                          <Textarea
                            placeholder="https://example.com https://another-site.com"
                            className="h-24 resize-none text-sm"
                          />
                          <p className="text-xs text-gray-500 mt-2">+ will be added</p>
                        </div>
                      </div>
                    </Card>

                    {/* Schedule & Options */}
                    <Card className="p-4 sm:p-6 bg-white border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="font-semibold text-gray-900">SCHEDULE & OPTIONS</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="mb-2 block text-sm">Automatic Schedule</Label>
                          <Select defaultValue="weekly">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <Label className="font-normal cursor-pointer">Email me summary</Label>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">+</span>
                            <Label className="font-normal cursor-pointer text-sm">
                              Auto-move broken links to "broken" folder
                            </Label>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </Card>

                    {/* Status Distribution */}
                    <Card className="p-4 sm:p-6 bg-white border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-4">STATUS DISTRIBUTION</h3>
                      <div className="flex items-center justify-center h-40">
                        <p className="text-xs sm:text-sm text-gray-500">No data available</p>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "browser-launcher" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-blue-500 uppercase">BROWSER LAUNCHER</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Capture tabs from your browser and automatically convert them into organized, tagged bookmarks</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Main Capture Area */}
                    <Card className="col-span-2 p-12 bg-white border-gray-200">
                      <div className="text-center">
                        <div className="flex justify-center mb-6">
                          <svg className="h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 uppercase">READY TO CAPTURE TABS</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mb-6">
                          Use the browser extension or keyboard shortcut to capture your<br />
                          current tabs and convert them into bookmarks.
                        </p>

                        <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg mb-2">
                          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Alt</kbd>
                          <span className="text-gray-400">+</span>
                          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Shift</kbd>
                          <span className="text-gray-400">+</span>
                          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">B</kbd>
                        </div>
                        <p className="text-xs text-gray-500 mb-6">Keyboard shortcut to capture tabs</p>

                        <Button variant="outline" className="gap-2">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          View Extension Guide
                        </Button>
                      </div>
                    </Card>

                    {/* Settings Sidebar */}
                    <Card className="p-4 sm:p-6 bg-white border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Settings className="h-5 w-5 text-gray-700" />
                        <h3 className="font-semibold text-gray-900">SETTINGS</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="mb-2 block text-sm">Duplicate Handling</Label>
                          <Select defaultValue="skip">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="skip">Skip duplicates</SelectItem>
                              <SelectItem value="overwrite">Overwrite</SelectItem>
                              <SelectItem value="keep">Keep both</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="mb-2 block text-sm">Max tabs per capture:</Label>
                          <Input type="number" defaultValue="40" />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Auto-tagging:</Label>
                          <Badge className="bg-green-500 text-white hover:bg-green-600">Enabled</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Auto-categorization:</Label>
                          <Badge className="bg-green-500 text-white hover:bg-green-600">Enabled</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Undo window:</Label>
                          <span className="text-sm font-medium text-gray-900">8 seconds</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
            </div>
          </div>
        </div>
    </DashboardAuth>
  )
}
