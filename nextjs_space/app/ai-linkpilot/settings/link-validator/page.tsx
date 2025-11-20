
"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Globe, CheckCircle, XCircle, ArrowRight, Clock, AlertTriangle, Shield, Calendar, Play } from 'lucide-react'

export default function LinkValidatorPage() {
  const [emailSummary, setEmailSummary] = useState(true)
  const [autoMoveBroken, setAutoMoveBroken] = useState(false)
  const [validationScope, setValidationScope] = useState('all')

  const stats = [
    { icon: Globe, label: 'Total Links', value: '0', color: 'text-blue-500' },
    { icon: CheckCircle, label: 'Healthy', value: '0', color: 'text-green-500' },
    { icon: XCircle, label: 'Broken', value: '0', color: 'text-red-500' },
    { icon: ArrowRight, label: 'Redirects', value: '0', color: 'text-yellow-500' },
    { icon: Clock, label: 'Timeouts', value: '0', color: 'text-orange-500' },
    { icon: AlertTriangle, label: 'Missing', value: '0', color: 'text-red-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 uppercase">Link Validator</h2>
        <p className="text-sm text-gray-600 mt-1">
          Monitor and maintain the health of your bookmarked links with automated validation
        </p>
      </div>

      {/* Validation Summary */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle className="text-base font-semibold">Validation Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold text-gray-900 uppercase">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scope & Input */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <CardTitle className="text-base font-semibold">Scope & Input</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Validation Scope</Label>
              <RadioGroup value={validationScope} onValueChange={setValidationScope}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="text-sm font-normal cursor-pointer">
                    All links in my bookmarks
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific" id="specific" />
                  <Label htmlFor="specific" className="text-sm font-normal cursor-pointer">
                    Select specific folders/bookmarks
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Add extra links (optional)</Label>
              <Textarea
                placeholder="https://example.com https://another-site.com"
                className="min-h-[100px]"
              />
              <p className="text-xs text-gray-500">
                One URL per line. Valid URLs will be added as new bookmarks.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Options */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle className="text-base font-semibold">Schedule & Options</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Automatic Schedule</Label>
              <Select defaultValue="off">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off (manual only)</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Email me summary</Label>
              <Switch checked={emailSummary} onCheckedChange={setEmailSummary} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">Auto-move broken links to</span>
                <span className="text-xs text-gray-600">"Broken" folder</span>
              </div>
              <Switch checked={autoMoveBroken} onCheckedChange={setAutoMoveBroken} />
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center text-sm text-gray-400">
              No data available
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scan Now Button */}
      <Button className="w-full h-12 bg-black hover:bg-gray-800 text-white gap-2">
        <Play className="h-5 w-5" />
        Scan Now
      </Button>

      {/* Empty State */}
      <Card className="bg-white">
        <CardContent className="py-12 text-center">
          <Shield className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600">
            No validation results yet. Run a scan to see link health status.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Broken Links Trend */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Broken Links Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center text-sm text-gray-400">
              No trend data yet
            </div>
          </CardContent>
        </Card>

        {/* Recent Scans */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle className="text-base font-semibold">Recent Scans</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center text-sm text-gray-400">
              No scan history yet
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
