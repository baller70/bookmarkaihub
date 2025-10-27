
"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowLeft, Settings as SettingsIcon, Tag, FolderKanban, Search, Upload, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function ContentDiscoveryPage() {
  const router = useRouter()
  const [suggestionsPerRefresh, setSuggestionsPerRefresh] = useState([5])
  const [serendipityLevel, setSerendipityLevel] = useState([50])
  const [maxResults, setMaxResults] = useState([20])

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
                  <Button variant="ghost" className="w-full justify-start bg-blue-50 text-blue-600">
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
            <div className="lg:col-span-3 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">AI Content Discovery</h2>
                <p className="text-gray-600">Personalized recommendations and intelligent link finding powered by AI</p>
              </div>

              <Tabs defaultValue="recommendations" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="recommendations">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Recommendations
                  </TabsTrigger>
                  <TabsTrigger value="link-finder">
                    <Search className="h-4 w-4 mr-2" />
                    Link Finder
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="recommendations" className="space-y-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="h-5 w-5" />
                      <h3 className="text-lg font-bold">Personalized Recommendations</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">AI-powered suggestions based on your interests and reading habits</p>

                    <div className="space-y-6">
                      <div>
                        <Label className="mb-2 block">Suggestions per refresh</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={suggestionsPerRefresh}
                            onValueChange={setSuggestionsPerRefresh}
                            min={1}
                            max={20}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium w-8 text-right">
                            {suggestionsPerRefresh[0]}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label className="mb-2 block">Serendipity Level</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={serendipityLevel}
                            onValueChange={setSerendipityLevel}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Focused</span>
                          <span>Diverse</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <Label>Include trending links</Label>
                            <p className="text-xs text-gray-500">Show popular content from your network</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <Label>Auto-include after selection</Label>
                            <p className="text-xs text-gray-500">Automatically add selected recommendations</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <Label>Show TL;DR summaries</Label>
                            <p className="text-xs text-gray-500">Display AI-generated summaries for each recommendation</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Generate Recommendations</h4>
                        <p className="text-sm text-gray-600">Get AI-powered content suggestions</p>
                      </div>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2">
                        <Sparkles className="h-4 w-4" />
                        Generate
                      </Button>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="link-finder" className="space-y-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Search className="h-5 w-5" />
                      <h3 className="text-lg font-bold">AI Link Finder</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">Discover relevant links using AI-powered search</p>

                    <div className="space-y-6">
                      <div>
                        <Label className="mb-2 block text-gray-900 font-medium">Topic / Keywords</Label>
                        <Input
                          placeholder="e.g., artificial intelligence, web development"
                          className="mb-2"
                        />
                        <div className="flex items-center gap-2 mt-3">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          <Label className="text-sm text-gray-900 cursor-pointer">Use my profile interests</Label>
                          <Switch defaultChecked className="ml-auto" />
                        </div>
                      </div>

                      <div>
                        <Label className="mb-2 block text-gray-900 font-medium">Date Range</Label>
                        <Select defaultValue="past-week">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="past-day">Past 24 hours</SelectItem>
                            <SelectItem value="past-week">Past week</SelectItem>
                            <SelectItem value="past-month">Past month</SelectItem>
                            <SelectItem value="past-year">Past year</SelectItem>
                            <SelectItem value="all-time">All time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="mb-3 block text-gray-900 font-medium">Link Types</Label>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="secondary" size="sm" className="bg-gray-900 text-white hover:bg-gray-800">
                            📄 Article
                          </Button>
                          <Button variant="outline" size="sm" className="hover:bg-gray-100">
                            🎥 Video
                          </Button>
                          <Button variant="outline" size="sm" className="hover:bg-gray-100">
                            📑 Pdf
                          </Button>
                          <Button variant="outline" size="sm" className="hover:bg-gray-100">
                            📦 Repo
                          </Button>
                          <Button variant="outline" size="sm" className="hover:bg-gray-100">
                            📊 Dataset
                          </Button>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-gray-900 font-medium">Max results</Label>
                          <span className="text-sm font-medium text-gray-900">{maxResults[0]}</span>
                        </div>
                        <Slider
                          value={maxResults}
                          onValueChange={setMaxResults}
                          min={5}
                          max={50}
                          step={5}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2 text-gray-900">Find Links</h4>
                        <p className="text-sm text-gray-600">Search for relevant content</p>
                      </div>
                      <Button className="bg-gray-600 hover:bg-gray-700 gap-2">
                        <Search className="h-4 w-4" />
                        Find Links
                      </Button>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
