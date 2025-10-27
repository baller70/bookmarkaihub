
"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, ArrowLeft, Settings as SettingsIcon, Upload, AlertTriangle, Monitor } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function BrowserLauncherPage() {
  const router = useRouter()

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
                  <Button variant="ghost" className="w-full justify-start bg-blue-50 text-blue-600">
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Browser Launcher
                  </Button>
                </Link>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-blue-600">Browser Launcher</h2>
                <p className="text-gray-600">
                  Capture tabs from your browser and automatically convert them into organized, tagged bookmarks
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Capture Interface */}
                <div className="lg:col-span-2">
                  <Card className="p-8 text-center">
                    <div className="flex justify-center mb-6">
                      <div className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full">
                        <Monitor className="h-16 w-16 text-blue-600" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-3">Ready to capture tabs</h3>
                    <p className="text-gray-600 mb-6">
                      Use the browser extension or keyboard shortcut to capture your current tabs and convert them into bookmarks.
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <kbd className="px-3 py-1.5 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded shadow-sm">
                          Alt
                        </kbd>
                        <span className="text-gray-600">+</span>
                        <kbd className="px-3 py-1.5 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded shadow-sm">
                          Shift
                        </kbd>
                        <span className="text-gray-600">+</span>
                        <kbd className="px-3 py-1.5 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded shadow-sm">
                          B
                        </kbd>
                      </div>
                      <p className="text-sm text-gray-600">Keyboard shortcut to capture tabs</p>
                    </div>

                    <Button variant="outline" className="gap-2">
                      <Monitor className="h-4 w-4" />
                      View Extension Guide
                    </Button>
                  </Card>
                </div>

                {/* Settings Panel */}
                <div>
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <SettingsIcon className="h-5 w-5" />
                      <h3 className="text-lg font-bold">Settings</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2 block">Duplicate Handling</Label>
                        <Select defaultValue="skip">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="skip">Skip duplicates</SelectItem>
                            <SelectItem value="update">Update existing</SelectItem>
                            <SelectItem value="keep-both">Keep both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="mb-2 block">Max tabs per capture:</Label>
                        <Input type="number" defaultValue={40} />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <Label>Auto-tagging:</Label>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Enabled
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <Label>Auto-categorization:</Label>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Enabled
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <Label>Undo window:</Label>
                          </div>
                          <Badge variant="secondary">
                            8 seconds
                          </Badge>
                        </div>
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
