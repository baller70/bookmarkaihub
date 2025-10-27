
"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Inbox, Download, Upload, Plus, Clock, Tag, Settings as SettingsIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AutoProcessingPage() {
  const [manualSaves, setManualSaves] = useState(true)
  const [browserCapture, setBrowserCapture] = useState(true)
  const [bulkUploads, setBulkUploads] = useState(true)
  const [pauseProcessing, setPauseProcessing] = useState(false)
  const [autoTagging, setAutoTagging] = useState(true)
  const [confidenceThreshold, setConfidenceThreshold] = useState([50])
  const [synonymMapping, setSynonymMapping] = useState(false)
  const [normalizationEngine, setNormalizationEngine] = useState(true)
  const [manualReview, setManualReview] = useState(true)
  const [stripTracking, setStripTracking] = useState(true)
  const [suggestFolder, setSuggestFolder] = useState(true)
  const [autoFile, setAutoFile] = useState(false)
  const [smartContext, setSmartContext] = useState(true)
  const [duplicateHandling, setDuplicateHandling] = useState('skip')
  const [domainBlacklist, setDomainBlacklist] = useState('')
  const [minContentLength, setMinContentLength] = useState('100')
  
  const [intakeExpanded, setIntakeExpanded] = useState(true)
  const [taggingExpanded, setTaggingExpanded] = useState(true)
  const [filteringExpanded, setFilteringExpanded] = useState(true)
  const [ruleBuilderExpanded, setRuleBuilderExpanded] = useState(true)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Auto-Processing</h2>
          <p className="text-sm text-gray-600 mt-1">autoProcessing.description</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="en">
            <SelectTrigger className="w-40">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇺🇸</span>
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">
                <div className="flex items-center gap-2">
                  <span>🇺🇸</span>
                  <span>English</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2">
            <Clock className="h-4 w-4" />
            autoProcessing.history
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Intake Scope */}
          <Card className="bg-white">
            <CardHeader className="cursor-pointer" onClick={() => setIntakeExpanded(!intakeExpanded)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Inbox className="h-5 w-5" />
                  <CardTitle className="text-base font-semibold">Intake Scope</CardTitle>
                </div>
                {intakeExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
              <CardDescription className="text-sm">
                Control which types of link additions trigger auto-processing
              </CardDescription>
            </CardHeader>
            {intakeExpanded && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Manual saves</Label>
                      <p className="text-xs text-gray-500">Process links saved manually</p>
                    </div>
                    <Switch checked={manualSaves} onCheckedChange={setManualSaves} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Bulk uploads</Label>
                      <p className="text-xs text-gray-500">Process bulk imported links</p>
                    </div>
                    <Switch checked={bulkUploads} onCheckedChange={setBulkUploads} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Browser capture</Label>
                      <p className="text-xs text-gray-500">Process browser extension saves</p>
                    </div>
                    <Switch checked={browserCapture} onCheckedChange={setBrowserCapture} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Pause all processing</Label>
                      <p className="text-xs text-gray-500">Temporarily disable auto-processing</p>
                    </div>
                    <Switch checked={pauseProcessing} onCheckedChange={setPauseProcessing} />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Auto-Tagging & Metadata */}
          <Card className="bg-white">
            <CardHeader className="cursor-pointer" onClick={() => setTaggingExpanded(!taggingExpanded)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  <CardTitle className="text-base font-semibold">Auto-Tagging & Metadata</CardTitle>
                </div>
                {taggingExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
              <CardDescription className="text-sm">
                Configure automatic tag generation and content analysis
              </CardDescription>
            </CardHeader>
            {taggingExpanded && (
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable auto-tagging</Label>
                    <p className="text-xs text-gray-500">Automatically generate tags for new links</p>
                  </div>
                  <Switch checked={autoTagging} onCheckedChange={setAutoTagging} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Confidence threshold</Label>
                    <span className="text-xs text-gray-600">~{confidenceThreshold[0]}% of links will auto-apply</span>
                  </div>
                  <Slider
                    value={confidenceThreshold}
                    onValueChange={setConfidenceThreshold}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Conservative</span>
                    <span>50%</span>
                    <span>Aggressive</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Preferred tag style</Label>
                    <Select defaultValue="singular">
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
                    <Label className="text-sm font-medium mb-2 block">Language mode</Label>
                    <Select defaultValue="auto">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-detect</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Synonym mapping</Label>
                      <p className="text-xs text-gray-500">Group related tags together</p>
                    </div>
                    <Switch checked={synonymMapping} onCheckedChange={setSynonymMapping} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Normalization engine</Label>
                      <p className="text-xs text-gray-500">Standardize tag formats and remove duplicates</p>
                    </div>
                    <Switch checked={normalizationEngine} onCheckedChange={setNormalizationEngine} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Manual review below threshold</Label>
                      <p className="text-xs text-gray-500">Queue low-confidence tags for manual approval</p>
                    </div>
                    <Switch checked={manualReview} onCheckedChange={setManualReview} />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Filtering & Categorization */}
          <Card className="bg-white">
            <CardHeader className="cursor-pointer" onClick={() => setFilteringExpanded(!filteringExpanded)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Inbox className="h-5 w-5" />
                  <CardTitle className="text-base font-semibold">Filtering & Categorization</CardTitle>
                </div>
                {filteringExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
              <CardDescription className="text-sm">
                Configure content filtering, duplicate handling, and smart categorization
              </CardDescription>
            </CardHeader>
            {filteringExpanded && (
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Strip tracking parameters</Label>
                    <p className="text-xs text-gray-500">Remove UTM codes and tracking parameters from URLs</p>
                  </div>
                  <Switch checked={stripTracking} onCheckedChange={setStripTracking} />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Domain blacklist</Label>
                  <Textarea
                    placeholder="Enter domains to exclude, one per line..."
                    value={domainBlacklist}
                    onChange={(e) => setDomainBlacklist(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Links from these domains will be automatically rejected</p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Minimum content length</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={minContentLength}
                      onChange={(e) => setMinContentLength(e.target.value)}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-600">words</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Reject pages with less content than this threshold</p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Duplicate handling</Label>
                  <RadioGroup value={duplicateHandling} onValueChange={setDuplicateHandling}>
                    <div className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value="skip" id="skip" />
                      <Label htmlFor="skip" className="text-sm font-normal cursor-pointer">
                        Skip - Ignore duplicate URLs
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value="overwrite" id="overwrite" />
                      <Label htmlFor="overwrite" className="text-sm font-normal cursor-pointer">
                        Overwrite - Update existing entry
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="keep-both" id="keep-both" />
                      <Label htmlFor="keep-both" className="text-sm font-normal cursor-pointer">
                        Keep both - Allow multiple versions
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Suggest folder path</Label>
                      <p className="text-xs text-gray-500">AI recommends appropriate folders for new links</p>
                    </div>
                    <Switch checked={suggestFolder} onCheckedChange={setSuggestFolder} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Auto-file into suggested folder</Label>
                      <p className="text-xs text-gray-500">Automatically move links to suggested folders</p>
                    </div>
                    <Switch checked={autoFile} onCheckedChange={setAutoFile} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Smart folder context</Label>
                      <p className="text-xs text-gray-500">Consider existing folder contents for better suggestions</p>
                    </div>
                    <Switch checked={smartContext} onCheckedChange={setSmartContext} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Fallback folder</Label>
                    <Select defaultValue="inbox">
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Inbox className="h-4 w-4" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inbox">Inbox</SelectItem>
                        <SelectItem value="unsorted">Unsorted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Draft expiration</Label>
                    <Select defaultValue="7days">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">7 days</SelectItem>
                        <SelectItem value="14days">14 days</SelectItem>
                        <SelectItem value="30days">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Rule Builder */}
          <Card className="bg-white">
            <CardHeader className="cursor-pointer" onClick={() => setRuleBuilderExpanded(!ruleBuilderExpanded)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  <CardTitle className="text-base font-semibold">Rule Builder</CardTitle>
                </div>
                {ruleBuilderExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
              <CardDescription className="text-sm">
                Create custom rules for automatic link processing
              </CardDescription>
            </CardHeader>
            {ruleBuilderExpanded && (
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">0 rules configured</span>
                  <Button size="sm" className="gap-2 bg-black hover:bg-gray-800 text-white">
                    <Plus className="h-4 w-4" />
                    Add Rule
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Import / Export Settings */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Import / Export Settings</CardTitle>
              <CardDescription className="text-sm">
                Backup or restore your auto-processing configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export JSON
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Tag Cloud */}
        <div className="lg:col-span-1">
          <Card className="bg-white sticky top-6">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Tag Cloud Snapshot</CardTitle>
              <CardDescription className="text-xs">Top tags from the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-sm text-gray-400">
                No tag data available
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
