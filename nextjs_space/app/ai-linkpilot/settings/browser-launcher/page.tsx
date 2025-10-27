
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Monitor, HelpCircle, Settings as SettingsIcon } from 'lucide-react'

export default function BrowserLauncherPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-blue-600">Browser Launcher</h2>
        <p className="text-sm text-gray-600 mt-1">
          Capture tabs from your browser and automatically convert them into organized, tagged bookmarks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="bg-white">
            <CardContent className="py-12">
              <div className="max-w-md mx-auto text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 border-4 border-gray-300 rounded-xl flex items-center justify-center">
                    <Monitor className="h-10 w-10 text-gray-400" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to capture tabs</h3>
                  <p className="text-sm text-gray-600">
                    Use the browser extension or keyboard shortcut to capture your current tabs and convert them into bookmarks.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono shadow-sm">
                    Alt
                  </kbd>
                  <span className="text-gray-500">+</span>
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono shadow-sm">
                    Shift
                  </kbd>
                  <span className="text-gray-500">+</span>
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono shadow-sm">
                    B
                  </kbd>
                </div>
                <p className="text-xs text-gray-500">Keyboard shortcut to capture tabs</p>

                <Button variant="outline" className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  View Extension Guide
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                <CardTitle className="text-base font-semibold">Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Duplicate Handling */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Duplicate Handling</Label>
                <Select defaultValue="skip">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">Skip duplicates</SelectItem>
                    <SelectItem value="merge">Merge with existing</SelectItem>
                    <SelectItem value="keep">Keep both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max tabs per capture */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Max tabs per capture:</Label>
                <div className="text-2xl font-bold text-gray-900">40</div>
              </div>

              {/* Auto-tagging */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Auto-tagging:</Label>
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  Enabled
                </Badge>
              </div>

              {/* Auto-categorization */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Auto-categorization:</Label>
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  Enabled
                </Badge>
              </div>

              {/* Undo window */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Undo window:</Label>
                <span className="text-sm font-semibold text-gray-900">8 seconds</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
