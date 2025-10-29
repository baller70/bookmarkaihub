
"use client"

import { useState } from "react"
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
import { cn } from "@/lib/utils"
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
  History
} from "lucide-react"

export default function AILinkPilotPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("auto-processing")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    intake: true,
    tagging: true,
    filtering: true,
    rules: true
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
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
              <div className="flex items-center gap-3 sm:gap-6 flex-wrap w-full sm:w-auto">
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
                      <h2 className="text-xl sm:text-xl sm:text-2xl font-bold text-gray-900">AUTO-PROCESSING</h2>
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
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">AI CONTENT DISCOVERY</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Personalized recommendations and intelligent link finding powered by AI</p>
                  </div>

                  {/* Sub-tabs */}
                  <div className="flex gap-2 border-b border-gray-200">
                    <button className="px-4 py-2 text-sm font-medium text-gray-900 border-b-2 border-black">
                      Recommendations
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                      Link Finder
                    </button>
                  </div>

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
                </div>
              )}

              {activeTab === "bulk-uploader" && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Header */}
                  <div>
                    <h2 className="text-xl sm:text-xl sm:text-2xl font-bold text-gray-900">MAGIC BULK LINK UPLOADER</h2>
                    <p className="text-xs sm:text-xs sm:text-sm text-gray-500 mt-1">Import multiple links at once with intelligent categorization and batch processing</p>
                  </div>

                  {/* Warning Banner */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-yellow-700">You have unsaved changes</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset
                      </Button>
                      <Button size="sm" className="bg-blue-500 text-white hover:bg-blue-600">
                        Save
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Import Links Section */}
                    <Card className="lg:col-span-2 p-4 sm:p-6 bg-white border-gray-200 overflow-hidden">
                      <h3 className="font-semibold text-gray-900 mb-4">IMPORT LINKS</h3>
                      
                      {/* Upload Method Tabs */}
                      <div className="flex gap-4 mb-6">
                        <button className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <Upload className="h-4 w-4" />
                          Drag & Drop
                        </button>
                        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Paste Text
                        </button>
                        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          Single URL
                        </button>
                      </div>

                      {/* Drop Zone */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                        <div className="flex justify-center mb-4">
                          <div className="relative">
                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                              <Upload className="h-8 w-8 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-blue-500 mb-2">DROP YOUR FILES HERE</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mb-4">Drag and drop CSV files or paste URLs directly</p>
                        <div className="flex justify-center gap-4 text-xs text-gray-500 mb-6">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            CSV Files
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Text URLs
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            Bulk Import
                          </div>
                        </div>
                        <Button className="bg-blue-500 text-white hover:bg-blue-600">
                          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          Choose Files
                        </Button>
                      </div>
                    </Card>

                    {/* Batch Settings Section */}
                    <Card className="p-4 sm:p-6 bg-white border-gray-200 overflow-hidden">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        <h3 className="font-semibold text-gray-900">BATCH SETTINGS</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="mb-2 block text-sm">Batch Size</Label>
                          <Select defaultValue="20">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="20">20 links</SelectItem>
                              <SelectItem value="50">50 links</SelectItem>
                              <SelectItem value="100">100 links</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="mb-2 block text-sm">Import Preset</Label>
                          <Select defaultValue="">
                            <SelectTrigger>
                              <SelectValue placeholder="Select preset..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Default</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="sm" className="mt-2 w-full">
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </Button>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Overrides</h4>
                          
                          <div className="space-y-3">
                            <div>
                              <Label className="mb-2 block text-sm">Extra tag for all</Label>
                              <Input placeholder="e.g., imported-2024" />
                            </div>

                            <div>
                              <Label className="mb-2 block text-sm">Force into folder</Label>
                              <Select defaultValue="auto">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="auto">Auto-categorize</SelectItem>
                                  <SelectItem value="inbox">Inbox</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Privacy</h4>
                          <RadioGroup defaultValue="private" className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="private" id="private" />
                              <Label htmlFor="private" className="font-normal cursor-pointer flex items-center gap-1">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Private
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="public" id="public" />
                              <Label htmlFor="public" className="font-normal cursor-pointer flex items-center gap-1">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Public
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "link-validator" && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Header */}
                  <div>
                    <h2 className="text-xl sm:text-xl sm:text-2xl font-bold text-gray-900">LINK VALIDATOR</h2>
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
                        <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
                        <div className="text-xs sm:text-sm text-gray-500">Total Links</div>
                      </div>

                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">0</div>
                        <div className="text-xs sm:text-xs sm:text-sm text-gray-500">Healthy</div>
                      </div>

                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <svg className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
                        <div className="text-xs sm:text-sm text-gray-500">Broken</div>
                      </div>

                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
                        <div className="text-xs sm:text-sm text-gray-500">Redirects</div>
                      </div>

                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
                        <div className="text-xs sm:text-sm text-gray-500">Timeouts</div>
                      </div>

                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
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
                    <h2 className="text-xl sm:text-2xl font-bold text-blue-500">BROWSER LAUNCHER</h2>
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
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">READY TO CAPTURE TABS</h3>
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
