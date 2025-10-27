
"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Search, Settings as SettingsIcon, HelpCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ContentDiscoveryPage() {
  const [suggestionsPerRefresh, setSuggestionsPerRefresh] = useState([5])
  const [serendipityLevel, setSerendipityLevel] = useState([50])
  const [includeTrending, setIncludeTrending] = useState(true)
  const [autoInclude, setAutoInclude] = useState(true)
  const [showSummaries, setShowSummaries] = useState(true)
  const [useProfileInterests, setUseProfileInterests] = useState(true)
  const [maxResults, setMaxResults] = useState([20])
  const [topicKeywords, setTopicKeywords] = useState('')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Content Discovery</h2>
          <p className="text-sm text-gray-600 mt-1">
            Personalized recommendations and intelligent link finding powered by AI
          </p>
        </div>
        <Button variant="ghost" size="sm" className="gap-2">
          <SettingsIcon className="h-4 w-4" />
          AI LinkPilot
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100">
          <TabsTrigger value="recommendations" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="link-finder" className="gap-2">
            <Search className="h-4 w-4" />
            Link Finder
          </TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="mt-6">
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <CardTitle className="text-base font-semibold">Personalized Recommendations</CardTitle>
              </div>
              <CardDescription className="text-sm">
                AI-powered suggestions based on your interests and reading habits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Suggestions per refresh */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Suggestions per refresh</Label>
                <Slider
                  value={suggestionsPerRefresh}
                  onValueChange={setSuggestionsPerRefresh}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1</span>
                  <span className="font-medium text-gray-900">{suggestionsPerRefresh[0]}</span>
                  <span>20</span>
                </div>
              </div>

              {/* Serendipity Level */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Serendipity Level</Label>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </div>
                <Slider
                  value={serendipityLevel}
                  onValueChange={setSerendipityLevel}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Focused</span>
                  <span>Diverse</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Include trending links</Label>
                  </div>
                  <Switch checked={includeTrending} onCheckedChange={setIncludeTrending} />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Auto-include after selection</Label>
                  <Switch checked={autoInclude} onCheckedChange={setAutoInclude} />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Show TL;DR summaries</Label>
                  <Switch checked={showSummaries} onCheckedChange={setShowSummaries} />
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-4">
                <Button className="w-full bg-black hover:bg-gray-800 text-white gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Recommendations
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Get AI-powered content suggestions
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Link Finder Tab */}
        <TabsContent value="link-finder" className="mt-6">
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <CardTitle className="text-base font-semibold">AI Link Finder</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Discover relevant links using AI-powered search
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Topic/Keywords */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Topic / Keywords</Label>
                <Input
                  placeholder="e.g., artificial intelligence, web development"
                  value={topicKeywords}
                  onChange={(e) => setTopicKeywords(e.target.value)}
                />
              </div>

              {/* Use profile interests */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <Label className="text-sm font-medium">Use my profile interests</Label>
                </div>
                <Switch checked={useProfileInterests} onCheckedChange={setUseProfileInterests} />
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date Range</Label>
                <Select defaultValue="past-week">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="past-week">Past week</SelectItem>
                    <SelectItem value="past-month">Past month</SelectItem>
                    <SelectItem value="past-year">Past year</SelectItem>
                    <SelectItem value="all-time">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Link Types */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Link Types</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default" className="bg-black hover:bg-gray-800 cursor-pointer">
                    📄 Article
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer">
                    🎥 Video
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer">
                    📑 PDF
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer">
                    💻 Repo
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer">
                    📊 Dataset
                  </Badge>
                </div>
              </div>

              {/* Max results */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Max results: {maxResults[0]}</Label>
                <Slider
                  value={maxResults}
                  onValueChange={setMaxResults}
                  min={5}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Find Links Button */}
              <div className="pt-4">
                <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white gap-2">
                  <Search className="h-4 w-4" />
                  Find Links
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Search for relevant content
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
