
"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, ArrowLeft, Settings as SettingsIcon, Upload, AlertTriangle, Globe, CheckCircle, XCircle, ArrowRight, Clock, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LinkValidatorPage() {
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
                  <Button variant="ghost" className="w-full justify-start bg-blue-50 text-blue-600">
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
                <h2 className="text-2xl font-bold mb-2">Link Validator</h2>
                <p className="text-gray-600">Monitor and maintain the health of your bookmarked links with automated validation</p>
              </div>

              {/* Validation Summary */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="text-lg font-bold">Validation Summary</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <Globe className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold mb-1">0</div>
                    <div className="text-sm text-gray-600">Total Links</div>
                  </div>

                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold mb-1">0</div>
                    <div className="text-sm text-gray-600">Healthy</div>
                  </div>

                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="text-3xl font-bold mb-1">0</div>
                    <div className="text-sm text-gray-600">Broken</div>
                  </div>

                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <ArrowRight className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="text-3xl font-bold mb-1">0</div>
                    <div className="text-sm text-gray-600">Redirects</div>
                  </div>

                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <Clock className="h-8 w-8 text-amber-600" />
                    </div>
                    <div className="text-3xl font-bold mb-1">0</div>
                    <div className="text-sm text-gray-600">Timeouts</div>
                  </div>

                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <AlertCircle className="h-8 w-8 text-gray-600" />
                    </div>
                    <div className="text-3xl font-bold mb-1">0</div>
                    <div className="text-sm text-gray-600">Missing</div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scope & Input */}
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <SettingsIcon className="h-5 w-5" />
                    <h3 className="text-lg font-bold">Scope & Input</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="mb-3 block">Validation Scope</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="scope"
                            id="all-bookmarks"
                            value="all"
                            defaultChecked
                            className="w-4 h-4"
                          />
                          <Label htmlFor="all-bookmarks" className="cursor-pointer">
                            All links in my bookmarks
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="scope"
                            id="specific-folders"
                            value="specific"
                            className="w-4 h-4"
                          />
                          <Label htmlFor="specific-folders" className="cursor-pointer">
                            Select specific folders/bookmarks
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">Add extra links (optional)</Label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        rows={3}
                        placeholder="https://example.com https://another-site.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">+ will be added</p>
                    </div>
                  </div>
                </Card>

                {/* Schedule & Options */}
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-5 w-5" />
                    <h3 className="text-lg font-bold">Schedule & Options</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="mb-2 block">Automatic Schedule</Label>
                      <Select defaultValue="weekly">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="manual">Manual only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Label>Email me summary</Label>
                          <p className="text-xs text-gray-500">Get validation results via email</p>
                        </div>
                        <Switch />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Label>Auto-move broken links to "Broken" folder</Label>
                          <p className="text-xs text-gray-500">Organize broken links automatically</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Status Distribution */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Status Distribution</h3>
                <div className="text-center py-12 text-gray-500">
                  No data available
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Run Validation Now
                </Button>
                <Button variant="outline">View History</Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
