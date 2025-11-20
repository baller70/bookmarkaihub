
"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowLeft, Settings as SettingsIcon, Tag, FolderKanban, Filter, AlertTriangle, Download, Upload, Globe, History } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function AutoProcessingPage() {
  const router = useRouter()
  const [confidenceThreshold, setConfidenceThreshold] = useState([50])
  const [duplicateHandling, setDuplicateHandling] = useState("skip")

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SettingsIcon className="h-6 w-6" />
                <h1 className="text-2xl font-bold uppercase">AI LinkPilot</h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_280px] gap-6">
            {/* Sidebar Navigation */}
            <div>
              <Card className="p-4 space-y-1">
                <Link href="/settings/ai/auto-processing">
                  <Button variant="ghost" className="w-full justify-start bg-blue-50 text-blue-600">
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Auto-Processing
                  </Button>
                </Link>
                <Link href="/settings/ai/recommendations">
                  <Button variant="ghost" className="w-full justify-start">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Content Discovery
                  </Button>
                </Link>
                <Link href="/settings/ai/bulk-uploader">
                  <Button variant="ghost" className="w-full justify-start">
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Link Uploader
                  </Button>
                </Link>
                <Link href="/settings/ai/link-validator">
                  <Button variant="ghost" className="w-full justify-start">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Link Validator
                  </Button>
                </Link>
                <Link href="/settings/ai/browser-launcher">
                  <Button variant="ghost" className="w-full justify-start">
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Browser Launcher
                  </Button>
                </Link>
              </Card>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 uppercase">Auto-Processing</h2>
                <p className="text-gray-600">autoProcessing.description</p>
              </div>

              {/* Intake Scope */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <SettingsIcon className="h-5 w-5" />
                  <h3 className="text-lg font-bold">INTAKE SCOPE</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">Control which types of link additions trigger auto-processing</p>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Manual saves</Label>
                      <Switch defaultChecked />
                    </div>
                    <p className="text-xs text-gray-500">Process links saved manually</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Bulk uploads</Label>
                      <Switch defaultChecked />
                    </div>
                    <p className="text-xs text-gray-500">Process bulk imported links</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Browser capture</Label>
                      <Switch defaultChecked />
                    </div>
                    <p className="text-xs text-gray-500">Process browser extension saves</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Pause all processing</Label>
                      <Switch />
                    </div>
                    <p className="text-xs text-gray-500">Temporarily disable auto-processing</p>
                  </div>
                </div>
              </Card>

              {/* Auto-Tagging & Metadata */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Tag className="h-5 w-5" />
                  <h3 className="text-lg font-bold">AUTO-TAGGING & METADATA</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">Configure automatic tag generation and content analysis</p>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Label>Enable auto-tagging</Label>
                        <p className="text-xs text-gray-500">Automatically generate tags for new links</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block text-gray-900">Confidence threshold</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={confidenceThreshold}
                        onValueChange={setConfidenceThreshold}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-16 text-right">
                        ~{confidenceThreshold[0]}% of links will auto-apply
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Conservative</span>
                      <span>50%</span>
                      <span>Aggressive</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block text-gray-900">Preferred tag style</Label>
                      <Select defaultValue="singular">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="singular">Singular (tag)</SelectItem>
                          <SelectItem value="plural">Plural (tags)</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-2 block text-gray-900">Language mode</Label>
                      <Select defaultValue="auto">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto-detect</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Label>Synonym mapping</Label>
                        <p className="text-xs text-gray-500">Group related tags together</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Label>Normalization engine</Label>
                        <p className="text-xs text-gray-500">Standardize tag formats and remove duplicates</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Label>View below threshold</Label>
                        <p className="text-xs text-gray-500">Show low-confidence tags for manual approval</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Filtering & Categorization */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Filter className="h-5 w-5" />
                  <h3 className="text-lg font-bold">FILTERING & CATEGORIZATION</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">Configure content filtering, duplicate handling, and smart categorization</p>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Label>Strip tracking parameters</Label>
                        <p className="text-xs text-gray-500">Remove UTM codes and tracking parameters from URLs</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block text-gray-900">Domain blacklist</Label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      rows={3}
                      placeholder="Enter domains to exclude, one per line..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Links from these domains will be automatically rejected</p>
                  </div>

                  <div>
                    <Label className="mb-2 block text-gray-900">Minimum content length</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue={100} className="w-24" />
                      <span className="text-sm text-gray-600">words</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Reject pages with less content than this threshold</p>
                  </div>

                  <div>
                    <Label className="mb-2 block text-gray-900">Duplicate handling</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="duplicate"
                          id="skip"
                          value="skip"
                          checked={duplicateHandling === "skip"}
                          onChange={(e) => setDuplicateHandling(e.target.value)}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="skip" className="cursor-pointer text-gray-900">
                          Skip - Ignore duplicate URLs
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="duplicate"
                          id="overwrite"
                          value="overwrite"
                          checked={duplicateHandling === "overwrite"}
                          onChange={(e) => setDuplicateHandling(e.target.value)}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="overwrite" className="cursor-pointer text-gray-900">
                          Overwrite - Update existing entry
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="duplicate"
                          id="keep-both"
                          value="keep-both"
                          checked={duplicateHandling === "keep-both"}
                          onChange={(e) => setDuplicateHandling(e.target.value)}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="keep-both" className="cursor-pointer text-gray-900">
                          Keep both - Allow multiple versions
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Label>Suggest folder path</Label>
                        <p className="text-xs text-gray-500">AI recommends appropriate folders for new links</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Label>Auto-file into suggested folder</Label>
                        <p className="text-xs text-gray-500">Automatically move links to suggested folders</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Label>Smart folder context</Label>
                        <p className="text-xs text-gray-500">Consider existing folder contents for better suggestions</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block text-gray-900">Fallback folder</Label>
                      <Select defaultValue="inbox">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inbox">📥 Inbox</SelectItem>
                          <SelectItem value="unsorted">📂 Unsorted</SelectItem>
                          <SelectItem value="to-review">👀 To Review</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-2 block text-gray-900">Draft expiration</Label>
                      <Select defaultValue="7">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 days</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Rule Builder */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="text-lg font-bold">RULE BUILDER</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">Create custom rules for automatic link processing</p>

                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">0 rules configured</p>
                  <Button variant="outline" className="gap-2">
                    <span>+</span> Add Rule
                  </Button>
                </div>
              </Card>

              {/* Import / Export Settings */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-2">IMPORT / EXPORT SETTINGS</h3>
                <p className="text-sm text-gray-600 mb-6">Backup or restore your auto-processing configuration</p>

                <div className="flex gap-4">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export JSON
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Import JSON
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Language Selector */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Language</span>
                <Select defaultValue="en">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                    <SelectItem value="fr">🇫🇷 French</SelectItem>
                    <SelectItem value="de">🇩🇪 German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* History Button */}
              <Button variant="outline" className="w-full justify-start gap-2">
                <History className="h-4 w-4" />
                autoProcessing.history
              </Button>

              {/* Tag Cloud Snapshot */}
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-2">TAG CLOUD SNAPSHOT</h3>
                <p className="text-xs text-gray-500 mb-4">Top tags from the past 7 days</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">javascript</Badge>
                  <Badge variant="secondary" className="text-xs">react</Badge>
                  <Badge variant="secondary" className="text-xs">design</Badge>
                  <Badge variant="secondary" className="text-xs">productivity</Badge>
                  <Badge variant="secondary" className="text-xs">ai</Badge>
                  <Badge variant="secondary" className="text-xs">tutorial</Badge>
                  <Badge variant="secondary" className="text-xs">tools</Badge>
                  <Badge variant="secondary" className="text-xs">web-dev</Badge>
                  <Badge variant="secondary" className="text-xs">css</Badge>
                  <Badge variant="secondary" className="text-xs">api</Badge>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
