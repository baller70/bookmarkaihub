
"use client"

import { DashboardAuth } from "@/components/dashboard-auth"
import { Card } from "@/components/ui/card"
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
import { useState } from "react"
import Link from "next/link"

export default function AILinkPilotPage() {
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
      <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between max-w-7xl">
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm">Back to Dashboard</span>
                </Link>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-700" />
                  <h1 className="text-xl font-semibold text-gray-900">AI LinkPilot</h1>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex max-w-7xl mx-auto">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] p-4">
              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === item.id
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8">
              {activeTab === "auto-processing" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Auto-Processing</h2>
                      <p className="text-sm text-gray-500 mt-1">autoProcessing.description</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select defaultValue="english">
                        <SelectTrigger className="w-40">
                          <div className="flex items-center gap-2">
                            <span>🇺🇸</span>
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <History className="h-4 w-4 mr-2" />
                        autoProcessing.history
                      </Button>
                    </div>
                  </div>

                  {/* Tag Cloud Snapshot Card */}
                  <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Tag Cloud Snapshot</h3>
                    <p className="text-sm text-gray-600">Top tags from the past 7 days</p>
                  </Card>

                  {/* Intake Scope */}
                  <Card className="overflow-hidden bg-white border-gray-200">
                    <button
                      onClick={() => toggleSection("intake")}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="h-5 w-5 text-gray-700" />
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">Intake Scope</h3>
                          <p className="text-sm text-gray-500">Control which types of link additions trigger auto-processing</p>
                        </div>
                      </div>
                      {expandedSections.intake ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {expandedSections.intake && (
                      <div className="px-6 pb-6 space-y-4 bg-white">
                        <div className="grid grid-cols-2 gap-4">
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
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <Wand2 className="h-5 w-5 text-gray-700" />
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">Auto-Tagging & Metadata</h3>
                          <p className="text-sm text-gray-500">Configure automatic tag generation and content analysis</p>
                        </div>
                      </div>
                      {expandedSections.tagging ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {expandedSections.tagging && (
                      <div className="px-6 pb-6 space-y-6 bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Enable auto-tagging</p>
                            <p className="text-sm text-gray-500">Automatically generate tags for new links</p>
                          </div>
                          <Switch checked={autoTagging} onCheckedChange={setAutoTagging} />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <Label>Confidence threshold</Label>
                            <span className="text-sm text-gray-500">~{confidenceThreshold[0]}% of links will auto-apply</span>
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

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="mb-2 block">Preferred tag style</Label>
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
                            <Label className="mb-2 block">Language mode</Label>
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
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">Filtering & Categorization</h3>
                          <p className="text-sm text-gray-500">Configure content filtering, duplicate handling, and smart categorization</p>
                        </div>
                      </div>
                      {expandedSections.filtering ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {expandedSections.filtering && (
                      <div className="px-6 pb-6 space-y-6 bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Strip tracking parameters</p>
                            <p className="text-sm text-gray-500">Remove UTM codes and tracking parameters from URLs</p>
                          </div>
                          <Switch checked={stripTracking} onCheckedChange={setStripTracking} />
                        </div>

                        <div>
                          <Label className="mb-2 block">Domain blacklist</Label>
                          <Textarea
                            value={domainBlacklist}
                            onChange={(e) => setDomainBlacklist(e.target.value)}
                            placeholder="Enter domains to exclude, one per line..."
                            className="h-24 resize-none"
                          />
                          <p className="text-xs text-gray-500 mt-2">Links from these domains will be automatically rejected</p>
                        </div>

                        <div>
                          <Label className="mb-2 block">Minimum content length</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={minContentLength}
                              onChange={(e) => setMinContentLength(e.target.value)}
                              className="w-32"
                            />
                            <span className="text-sm text-gray-500">words</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Reject pages with less content than this threshold</p>
                        </div>

                        <div>
                          <Label className="mb-3 block">Duplicate handling</Label>
                          <RadioGroup value={duplicateHandling} onValueChange={setDuplicateHandling} className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="skip" id="skip" />
                              <Label htmlFor="skip" className="font-normal cursor-pointer">
                                Skip - Ignore duplicate URLs
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="overwrite" id="overwrite" />
                              <Label htmlFor="overwrite" className="font-normal cursor-pointer">
                                Overwrite - Update existing entry
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="keep-both" id="keep-both" />
                              <Label htmlFor="keep-both" className="font-normal cursor-pointer">
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

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="mb-2 block">Fallback folder</Label>
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
                            <Label className="mb-2 block">Draft expiration</Label>
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
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">Rule Builder</h3>
                          <p className="text-sm text-gray-500">Create custom rules for automatic link processing</p>
                        </div>
                      </div>
                      {expandedSections.rules ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {expandedSections.rules && (
                      <div className="px-6 pb-6 bg-white">
                        <div className="text-center py-8">
                          <p className="text-sm text-gray-500 mb-4">0 rules configured</p>
                          <Button className="bg-black text-white hover:bg-gray-800">
                            <span className="mr-2">+</span>
                            Add Rule
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Import/Export Settings */}
                  <Card className="p-6 bg-white border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Import / Export Settings</h3>
                    <p className="text-sm text-gray-500 mb-4">Backup or restore your auto-processing configuration</p>
                    <div className="flex gap-3">
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
                <div className="text-center py-12">
                  <Wand2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Discovery</h3>
                  <p className="text-gray-500">This feature is coming soon</p>
                </div>
              )}

              {activeTab === "bulk-uploader" && (
                <div className="text-center py-12">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Bulk Link Uploader</h3>
                  <p className="text-gray-500">This feature is coming soon</p>
                </div>
              )}

              {activeTab === "link-validator" && (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Link Validator</h3>
                  <p className="text-gray-500">This feature is coming soon</p>
                </div>
              )}

              {activeTab === "browser-launcher" && (
                <div className="text-center py-12">
                  <Chrome className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Browser Launcher</h3>
                  <p className="text-gray-500">This feature is coming soon</p>
                </div>
              )}
            </div>
          </div>
        </div>
    </DashboardAuth>
  )
}
