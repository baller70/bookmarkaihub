
"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowLeft, Settings as SettingsIcon, Upload, AlertTriangle, FileText, Link as LinkIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function BulkUploaderPage() {
  const router = useRouter()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true)

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
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold">AI LinkPilot</h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="p-4 space-y-1">
                <Link href="/settings/ai/auto-processing">
                  <Button variant="ghost" className="w-full justify-start">
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
                  <Button variant="ghost" className="w-full justify-start bg-blue-50 text-blue-600">
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
            <div className="lg:col-span-3 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Magic Bulk Link Uploader</h2>
                <p className="text-gray-600">Import multiple links at once with intelligent categorization and batch processing</p>
              </div>

              {hasUnsavedChanges && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <p className="text-sm text-yellow-800">You have unsaved changes</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setHasUnsavedChanges(false)}>
                        Reset
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Import Links Section */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">Import Links</h3>

                    <Tabs defaultValue="drag-drop" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="drag-drop">
                          <Upload className="h-4 w-4 mr-2" />
                          Drag & Drop
                        </TabsTrigger>
                        <TabsTrigger value="paste-text">
                          <FileText className="h-4 w-4 mr-2" />
                          Paste Text
                        </TabsTrigger>
                        <TabsTrigger value="single-url">
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Single URL
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="drag-drop" className="mt-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-700">●</Badge>
                          </div>
                          <div className="flex justify-center mb-4">
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                              <Upload className="h-8 w-8 text-white" />
                            </div>
                          </div>
                          <h4 className="text-lg font-semibold text-blue-600 mb-2">DROP YOUR FILES HERE</h4>
                          <p className="text-sm text-gray-600 mb-4">Drag and drop CSV files or paste URLs directly</p>
                          <div className="flex justify-center gap-4 text-xs text-gray-500">
                            <Badge variant="secondary" className="gap-1">
                              <span className="text-green-600">●</span> CSV Files
                            </Badge>
                            <Badge variant="secondary" className="gap-1">
                              <span className="text-blue-600">●</span> Text URLs
                            </Badge>
                            <Badge variant="secondary" className="gap-1">
                              <span className="text-purple-600">●</span> Bulk Import
                            </Badge>
                          </div>
                          <Button className="mt-6 bg-blue-600 hover:bg-blue-700">
                            <Upload className="h-4 w-4 mr-2" />
                            Choose Files
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="paste-text" className="mt-6">
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={10}
                          placeholder="Paste URLs here, one per line..."
                        />
                        <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700">
                          Import URLs
                        </Button>
                      </TabsContent>

                      <TabsContent value="single-url" className="mt-6">
                        <Input
                          placeholder="https://example.com"
                          className="mb-4"
                        />
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Add URL
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </Card>

                  {/* Preview & Edit Section */}
                  <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">Preview & Edit</h3>
                    <div className="text-center py-12 text-gray-500">
                      <div className="flex justify-center mb-4">
                        <Upload className="h-12 w-12 text-gray-300" />
                      </div>
                      <p className="text-sm">No links added yet. Use the tabs above to import links.</p>
                    </div>
                  </Card>

                  {/* Import Button */}
                  <Button disabled className="w-full bg-gray-400 text-white cursor-not-allowed">
                    <Upload className="h-4 w-4 mr-2" />
                    Import 0 Links
                  </Button>

                  {/* No Uploads Yet Section */}
                  <Card className="p-6">
                    <div className="text-center py-12 text-gray-500">
                      <div className="flex justify-center mb-4">
                        <Upload className="h-12 w-12 text-gray-300" />
                      </div>
                      <h4 className="font-semibold text-gray-700 mb-2">No uploads yet</h4>
                      <p className="text-sm">Start by importing some links above to see your upload summary here</p>
                    </div>
                  </Card>
                </div>

                {/* Batch Settings */}
                <div>
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <SettingsIcon className="h-5 w-5" />
                      <h3 className="text-lg font-bold">Batch Settings</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2 block">Batch Size</Label>
                        <Select defaultValue="20">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 links</SelectItem>
                            <SelectItem value="20">20 links</SelectItem>
                            <SelectItem value="50">50 links</SelectItem>
                            <SelectItem value="100">100 links</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="mb-2 block">Import Preset</Label>
                        <Select defaultValue="default">
                          <SelectTrigger>
                            <SelectValue placeholder="Select preset..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="minimal">Minimal processing</SelectItem>
                            <SelectItem value="full">Full analysis</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="ghost" className="mt-2 w-full">
                          + Create New Preset
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 mt-6">
                    <h3 className="text-lg font-bold mb-4">Overrides</h3>

                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2 block text-gray-900">Extra tag for all</Label>
                        <Input placeholder="e.g., imported-2024" />
                      </div>

                      <div>
                        <Label className="mb-2 block text-gray-900">Force into folder</Label>
                        <Select defaultValue="auto">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto-categorize</SelectItem>
                            <SelectItem value="inbox">📥 Inbox</SelectItem>
                            <SelectItem value="reading">📚 Reading List</SelectItem>
                            <SelectItem value="archive">🗄️ Archive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="mb-4 block text-gray-900">Privacy</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="privacy"
                              id="private"
                              value="private"
                              defaultChecked
                              className="w-4 h-4"
                            />
                            <Label htmlFor="private" className="cursor-pointer flex items-center gap-2 text-gray-900">
                              🔒 Private
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="privacy"
                              id="public"
                              value="public"
                              className="w-4 h-4"
                            />
                            <Label htmlFor="public" className="cursor-pointer flex items-center gap-2 text-gray-900">
                              👁️ Public
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-900">Auto-categorize</Label>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-gray-900">Auto-priority</Label>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-gray-900">Run in background</Label>
                          <Switch defaultChecked />
                        </div>
                      </div>

                      <div>
                        <Label className="mb-2 block text-gray-900">Duplicate strategy</Label>
                        <Select defaultValue="auto-merge">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto-merge">Auto-merge</SelectItem>
                            <SelectItem value="skip">Skip duplicates</SelectItem>
                            <SelectItem value="replace">Replace existing</SelectItem>
                            <SelectItem value="keep-both">Keep both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
