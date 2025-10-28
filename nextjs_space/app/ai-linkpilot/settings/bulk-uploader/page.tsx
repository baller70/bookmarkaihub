
"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, FileText, Link2, FolderInput, AlertCircle, RotateCcw, Save, Star, Settings as SettingsIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function BulkUploaderPage() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true)
  const [autoCategorize, setAutoCategorize] = useState(true)
  const [autoPriority, setAutoPriority] = useState(true)
  const [runInBackground, setRunInBackground] = useState(true)
  const [privacy, setPrivacy] = useState('private')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Magic Bulk Link Uploader</h2>
        <p className="text-sm text-gray-600 mt-1">
          Import multiple links at once with intelligent categorization and batch processing
        </p>
      </div>

      {/* Unsaved Changes Alert */}
      {hasUnsavedChanges && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm text-yellow-800">You have unsaved changes</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8">
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
              <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white">
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Import Links */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Import Links</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="drag-drop" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="drag-drop" className="text-xs">
                    <Upload className="h-3 w-3 mr-1" />
                    Drag & Drop
                  </TabsTrigger>
                  <TabsTrigger value="paste-text" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    Paste Text
                  </TabsTrigger>
                  <TabsTrigger value="single-url" className="text-xs">
                    <Link2 className="h-3 w-3 mr-1" />
                    Single URL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="drag-drop" className="mt-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-600 mb-1">DROP YOUR FILES HERE</h3>
                        <p className="text-sm text-gray-600">Drag and drop CSV files or paste URLs directly</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          CSV Files
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Text URLs
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          Bulk Import
                        </span>
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <FolderInput className="h-4 w-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="paste-text" className="mt-4">
                  <div className="space-y-2">
                    <Label>Paste URLs (one per line)</Label>
                    <textarea
                      className="w-full min-h-[200px] p-3 border border-gray-300 rounded-lg resize-none"
                      placeholder="https://example.com&#10;https://another-site.com"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="single-url" className="mt-4">
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input placeholder="https://example.com" />
                    <Button className="mt-4">Add URL</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Preview & Edit */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Preview & Edit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">No links added yet. Use the tabs above to import links.</p>
              </div>
            </CardContent>
          </Card>

          {/* Import Button */}
          <Button disabled className="w-full h-12 bg-gray-400 text-white cursor-not-allowed">
            <Upload className="h-4 w-4 mr-2" />
            Import 0 Links
          </Button>

          {/* Upload Summary */}
          <Card className="bg-white">
            <CardContent className="py-12 text-center">
              <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <h3 className="font-semibold text-gray-700 mb-1">No uploads yet</h3>
              <p className="text-sm text-gray-500">
                Start by importing some links above to see your upload summary here
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Batch Settings */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                <CardTitle className="text-base font-semibold">Batch Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Batch Size */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Batch Size</Label>
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

              {/* Import Preset */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Import Preset</Label>
                <div className="flex gap-2">
                  <Select defaultValue="">
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select preset..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Star className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Overrides */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-3">Overrides</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Extra tag for all</Label>
                    <Input placeholder="e.g., imported-2024" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Force into folder</Label>
                    <Select defaultValue="auto">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-categorize</SelectItem>
                        <SelectItem value="inbox">Inbox</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div className="pt-4 border-t">
                <Label className="text-sm font-medium mb-3 block">Privacy</Label>
                <RadioGroup value={privacy} onValueChange={setPrivacy}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private" className="text-sm font-normal cursor-pointer">
                      🔒 Private
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="text-sm font-normal cursor-pointer">
                      👁️ Public
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Additional Settings */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Auto-categorize</Label>
                  <Switch checked={autoCategorize} onCheckedChange={setAutoCategorize} />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Auto-priority</Label>
                  <Switch checked={autoPriority} onCheckedChange={setAutoPriority} />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Run in background</Label>
                  <Switch checked={runInBackground} onCheckedChange={setRunInBackground} />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Duplicate strategy</Label>
                  <Select defaultValue="auto-merge">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto-merge">Auto-merge</SelectItem>
                      <SelectItem value="skip">Skip</SelectItem>
                      <SelectItem value="overwrite">Overwrite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
