
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardAuth } from "@/components/dashboard-auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  Settings as SettingsIcon, 
  Palette, 
  Bell, 
  Shield, 
  Download, 
  CreditCard,
  Sparkles,
  Sun,
  Mail,
  Smartphone,
  Chrome,
  Lock,
  LogOut,
  Trash2,
  Upload,
  FileJson,
  FileText,
  Globe,
  Clock,
  Check,
  RotateCcw
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type SettingsTab = "appearance" | "notifications" | "privacy" | "backup" | "billing" | "oracle"

const ACCENT_COLORS = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Cyan", value: "#06B6D4" },
]

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<SettingsTab>("appearance")
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false)
  const [settings, setSettings] = useState({
    theme: "light",
    autoScheduleThemes: false,
    accentColor: "#3B82F6",
    fontSize: 16,
    dyslexiaFont: false,
    emailNotifications: true,
    inAppNotifications: true,
    pushNotifications: false,
    newAIRecommendations: true,
    weeklyDigest: true,
    timeCapsuleReminders: true,
    collaborativeInvites: true,
    analyticsAlerts: false,
    quietHours: false,
    digestFrequency: "weekly",
    digestDay: "monday",
    digestTime: "09:00",
    enable2FA: false,
    autoBackups: false,
    cloudProvider: "none",
    autoRenewal: true,
  })

  const handleSave = () => {
    toast.success("Settings saved successfully!")
  }

  const handleReset = () => {
    toast.info("Settings reset to defaults")
  }

  return (
    <DashboardAuth>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header */}
        <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  <h1 className="text-xl font-semibold">SETTINGS</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Bordered Container */}
          <div className="border border-gray-300 rounded-lg p-6 bg-white">
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="col-span-3">
              <Card className="p-2">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab("appearance")}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      activeTab === "appearance"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <Palette className="h-4 w-4" />
                    Appearance
                  </button>
                  <button
                    onClick={() => setActiveTab("notifications")}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      activeTab === "notifications"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <Bell className="h-4 w-4" />
                    Notifications
                  </button>
                  <button
                    onClick={() => setActiveTab("privacy")}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      activeTab === "privacy"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <Shield className="h-4 w-4" />
                    Privacy & Security
                  </button>
                  <button
                    onClick={() => setActiveTab("backup")}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      activeTab === "backup"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <Download className="h-4 w-4" />
                    Backup & Export
                  </button>
                  <button
                    onClick={() => setActiveTab("billing")}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      activeTab === "billing"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <CreditCard className="h-4 w-4" />
                    Billing & Subscription
                  </button>
                  <button
                    onClick={() => router.push("/settings/oracle")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Sparkles className="h-4 w-4" />
                    Oracle AI Chat Bot
                  </button>
                </nav>
              </Card>
            </div>

            {/* Content Area */}
            <div className="col-span-9">
              {/* Appearance Tab */}
              {activeTab === "appearance" && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold">APPEARANCE</h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">Personalize the look and feel to match your taste and environment</p>

                  <div className="space-y-8">
                    {/* Theme Selection */}
                    <div>
                      <h3 className="font-semibold mb-4">THEME SELECTION</h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-normal text-gray-700">Theme</Label>
                          <Select value={settings.theme} onValueChange={(value) => setSettings({ ...settings, theme: value })}>
                            <SelectTrigger className="w-full mt-1">
                              <SelectValue>
                                <div className="flex items-center gap-2">
                                  <Sun className="h-4 w-4" />
                                  {settings.theme === "light" ? "Light" : settings.theme === "dark" ? "Dark" : "Auto"}
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">
                                <div className="flex items-center gap-2">
                                  <Sun className="h-4 w-4" />
                                  Light
                                </div>
                              </SelectItem>
                              <SelectItem value="dark">
                                <div className="flex items-center gap-2">
                                  <Sun className="h-4 w-4" />
                                  Dark
                                </div>
                              </SelectItem>
                              <SelectItem value="auto">
                                <div className="flex items-center gap-2">
                                  <Sun className="h-4 w-4" />
                                  Auto
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Auto-schedule themes</p>
                            <p className="text-sm text-gray-600">Switch themes on a custom time schedule</p>
                          </div>
                          <Switch
                            checked={settings.autoScheduleThemes}
                            onCheckedChange={(checked) => setSettings({ ...settings, autoScheduleThemes: checked })}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Accent & Highlight Colors */}
                    <div>
                      <h3 className="font-semibold mb-4">ACCENT & HIGHLIGHT COLORS</h3>
                      <div className="space-y-3">
                        <Label className="text-sm font-normal text-gray-700">Color Palette</Label>
                        <div className="flex gap-3 flex-wrap">
                          {ACCENT_COLORS.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => setSettings({ ...settings, accentColor: color.value })}
                              className={cn(
                                "w-16 h-12 rounded-lg transition-all",
                                settings.accentColor === color.value
                                  ? "ring-2 ring-offset-2 ring-blue-600"
                                  : "hover:scale-105"
                              )}
                              style={{ backgroundColor: color.value }}
                            />
                          ))}
                          <div className="relative">
                            <button
                              onClick={() => setShowCustomColorPicker(!showCustomColorPicker)}
                              className="w-16 h-12 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-600 hover:border-gray-400 transition-colors"
                            >
                              Custom
                            </button>
                            {showCustomColorPicker && (
                              <div className="absolute top-full mt-2 z-10 p-3 bg-white rounded-lg shadow-lg border">
                                <input
                                  type="color"
                                  value={settings.accentColor}
                                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                                  className="w-32 h-32 border-0 cursor-pointer"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full mt-2"
                                  onClick={() => setShowCustomColorPicker(false)}
                                >
                                  Done
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Font & Text Size */}
                    <div>
                      <h3 className="font-semibold mb-4">FONT & TEXT SIZE</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-normal text-gray-700">Font Size</Label>
                            <span className="text-sm font-medium">{settings.fontSize}px</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-500">Small</span>
                            <Slider
                              value={[settings.fontSize]}
                              onValueChange={([value]) => setSettings({ ...settings, fontSize: value })}
                              min={12}
                              max={20}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-xs text-gray-500">Large</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Dyslexia-friendly font</p>
                            <p className="text-sm text-gray-600">Use OpenDyslexic font for better readability</p>
                          </div>
                          <Switch
                            checked={settings.dyslexiaFont}
                            onCheckedChange={(checked) => setSettings({ ...settings, dyslexiaFont: checked })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold">NOTIFICATIONS</h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">Manage how and when the app communicates updates, reminders, and alerts</p>

                  <div className="space-y-8">
                    {/* Notification Channels */}
                    <div>
                      <h3 className="font-semibold mb-4">NOTIFICATION CHANNELS</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium text-sm">Email</p>
                              <p className="text-sm text-gray-600">Receive notifications via email</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={settings.emailNotifications}
                              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                            />
                            <Button variant="outline" size="sm">Test</Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Smartphone className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium text-sm">In-app</p>
                              <p className="text-sm text-gray-600">Show badges and toast notifications</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={settings.inAppNotifications}
                              onCheckedChange={(checked) => setSettings({ ...settings, inAppNotifications: checked })}
                            />
                            <Button variant="outline" size="sm">Test</Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Chrome className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium text-sm">Push (Browser)</p>
                              <p className="text-sm text-gray-600">Permission denied - enable in browser settings</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={settings.pushNotifications}
                              onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                            />
                            <Button variant="outline" size="sm">Test</Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Event Types */}
                    <div>
                      <h3 className="font-semibold mb-4">EVENT TYPES</h3>
                      <div className="space-y-4">
                        {[
                          { 
                            label: "New AI Recommendations", 
                            description: "When AI suggests new bookmarks or insights",
                            checked: settings.newAIRecommendations,
                            onChange: (checked: boolean) => setSettings({ ...settings, newAIRecommendations: checked })
                          },
                          { 
                            label: "Weekly Digest", 
                            description: "Summary of your activity and insights",
                            checked: settings.weeklyDigest,
                            onChange: (checked: boolean) => setSettings({ ...settings, weeklyDigest: checked })
                          },
                          { 
                            label: "Time Capsule Reminders", 
                            description: "Reminders to create or review time capsules",
                            checked: settings.timeCapsuleReminders,
                            onChange: (checked: boolean) => setSettings({ ...settings, timeCapsuleReminders: checked })
                          },
                          { 
                            label: "Collaborative Playbook Invites", 
                            description: "When someone invites you to collaborate",
                            checked: settings.collaborativeInvites,
                            onChange: (checked: boolean) => setSettings({ ...settings, collaborativeInvites: checked })
                          },
                          { 
                            label: "Analytics Alerts", 
                            description: "Traffic spikes and unusual activity",
                            checked: settings.analyticsAlerts,
                            onChange: (checked: boolean) => setSettings({ ...settings, analyticsAlerts: checked })
                          },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{item.label}</p>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                            <Switch checked={item.checked} onCheckedChange={item.onChange} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Quiet Hours */}
                    <div>
                      <h3 className="font-semibold mb-4">QUIET HOURS</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Enable Quiet Hours</p>
                          <p className="text-sm text-gray-600">Silence non-critical alerts during specified times</p>
                        </div>
                        <Switch
                          checked={settings.quietHours}
                          onCheckedChange={(checked) => setSettings({ ...settings, quietHours: checked })}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Digest Scheduling */}
                    <div>
                      <h3 className="font-semibold mb-4">DIGEST SCHEDULING</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-normal text-gray-700 mb-2 block">Frequency</Label>
                          <Select value={settings.digestFrequency} onValueChange={(value) => setSettings({ ...settings, digestFrequency: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-normal text-gray-700 mb-2 block">Day</Label>
                          <Select value={settings.digestDay} onValueChange={(value) => setSettings({ ...settings, digestDay: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monday">Monday</SelectItem>
                              <SelectItem value="tuesday">Tuesday</SelectItem>
                              <SelectItem value="wednesday">Wednesday</SelectItem>
                              <SelectItem value="thursday">Thursday</SelectItem>
                              <SelectItem value="friday">Friday</SelectItem>
                              <SelectItem value="saturday">Saturday</SelectItem>
                              <SelectItem value="sunday">Sunday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-normal text-gray-700 mb-2 block">Time</Label>
                          <Input type="time" value={settings.digestTime} onChange={(e) => setSettings({ ...settings, digestTime: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Privacy & Security Tab */}
              {activeTab === "privacy" && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold">PRIVACY & SECURITY</h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">Control your data, sessions, and account safety</p>

                  <div className="space-y-8">
                    {/* Password Management */}
                    <div>
                      <h3 className="font-semibold mb-4">PASSWORD MANAGEMENT</h3>
                      <Button variant="outline">
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </div>

                    <Separator />

                    {/* Two-Factor Authentication */}
                    <div>
                      <h3 className="font-semibold mb-4">TWO-FACTOR AUTHENTICATION</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Enable 2FA</p>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <Switch
                          checked={settings.enable2FA}
                          onCheckedChange={(checked) => setSettings({ ...settings, enable2FA: checked })}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Session & Device Management */}
                    <div>
                      <h3 className="font-semibold mb-4">SESSION & DEVICE MANAGEMENT</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">Current Session</p>
                            <p className="text-sm text-gray-600">MacBook Pro • Chrome • 192.168.1.200 • Active now</p>
                          </div>
                          <Badge>Current</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">iPhone 15 Pro</p>
                            <p className="text-sm text-gray-600">Safari • 192.168.1.156 • 2 hours ago</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <LogOut className="h-3 w-3 mr-1" />
                            Sign Out
                          </Button>
                        </div>
                        <Button variant="destructive" className="w-full">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out All Other Sessions
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Privacy Policy & Data Export */}
                    <div>
                      <h3 className="font-semibold mb-4">PRIVACY POLICY & DATA EXPORT</h3>
                      <div className="flex gap-3">
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download My Data (JSON)
                        </Button>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Request Account Deletion
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Backup & Export Tab */}
              {activeTab === "backup" && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold">BACKUP & EXPORT</h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">Ensure your data is safe and can be moved freely</p>

                  <div className="space-y-8">
                    {/* Manual Export */}
                    <div>
                      <h3 className="font-semibold mb-4">MANUAL EXPORT</h3>
                      <div className="flex gap-3 mb-4">
                        <Button variant="outline">
                          <FileJson className="h-4 w-4 mr-2" />
                          Export JSON
                        </Button>
                        <Button variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Export CSV
                        </Button>
                        <Button variant="outline">
                          <Globe className="h-4 w-4 mr-2" />
                          Export HTML
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-normal text-gray-700 mb-2 block">Select Date Range</Label>
                          <div className="grid grid-cols-2 gap-3">
                            <Input type="date" placeholder="mm/dd/yyyy" />
                            <Input type="date" placeholder="mm/dd/yyyy" />
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-normal text-gray-700 mb-2 block">Filter by tags:</Label>
                          <Input placeholder="Enter tags separated by commas" />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Scheduled Backups */}
                    <div>
                      <h3 className="font-semibold mb-4">SCHEDULED BACKUPS</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Enable automatic backups</p>
                          <p className="text-sm text-gray-600">Schedule regular exports to email or cloud</p>
                        </div>
                        <Switch
                          checked={settings.autoBackups}
                          onCheckedChange={(checked) => setSettings({ ...settings, autoBackups: checked })}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Cloud Sync Destinations */}
                    <div>
                      <h3 className="font-semibold mb-4">CLOUD SYNC DESTINATIONS</h3>
                      <div>
                        <Label className="text-sm font-normal text-gray-700 mb-2 block">Cloud Provider</Label>
                        <Select value={settings.cloudProvider} onValueChange={(value) => setSettings({ ...settings, cloudProvider: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="google-drive">Google Drive</SelectItem>
                            <SelectItem value="dropbox">Dropbox</SelectItem>
                            <SelectItem value="onedrive">OneDrive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    {/* Import & Restore */}
                    <div>
                      <h3 className="font-semibold mb-4">IMPORT & RESTORE</h3>
                      <div className="flex gap-3">
                        <Button>
                          <Upload className="h-4 w-4 mr-2" />
                          Import from File
                        </Button>
                        <Button variant="outline">
                          <Clock className="h-4 w-4 mr-2" />
                          Restore from Backup
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Billing & Subscription Tab */}
              {activeTab === "billing" && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold">BILLING & SUBSCRIPTION</h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">Manage your subscription, usage, and billing information</p>

                  <div className="space-y-8">
                    {/* Current Plan */}
                    <div>
                      <h3 className="font-semibold mb-4">CURRENT PLAN</h3>
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50/50">
                        <div>
                          <p className="font-semibold text-blue-900">Free Plan</p>
                          <p className="text-sm text-blue-700">Perfect for getting started</p>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Upgrade to Pro
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Usage Statistics */}
                    <div>
                      <h3 className="font-semibold mb-4">USAGE STATISTICS</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Topics</p>
                            <p className="text-sm font-semibold">1/1</p>
                          </div>
                          <Progress value={100} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Favorites</p>
                            <p className="text-sm font-semibold">45/100</p>
                          </div>
                          <Progress value={45} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Time Capsules</p>
                            <p className="text-sm font-semibold">3/5</p>
                          </div>
                          <Progress value={60} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Available Plans */}
                    <div>
                      <h3 className="font-semibold mb-4">AVAILABLE PLANS</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {/* Free Plan */}
                        <Card className="p-5 relative">
                          <div className="text-center mb-4">
                            <p className="font-semibold text-gray-900">Free</p>
                            <div className="flex items-baseline justify-center my-3">
                              <span className="text-3xl font-bold">$0</span>
                              <span className="text-sm text-gray-600 ml-1">per month</span>
                            </div>
                          </div>
                          <ul className="space-y-2 mb-4 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="text-gray-600">• 1 Topic</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-gray-600">• 100 favorites</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-gray-600">• 5 time capsules</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-gray-600">• Basic analytics</span>
                            </li>
                          </ul>
                          <Badge variant="outline" className="w-full justify-center">Current Plan</Badge>
                        </Card>

                        {/* Pro Plan */}
                        <Card className="p-5 relative border-blue-600 border-2">
                          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600">Popular</Badge>
                          <div className="text-center mb-4">
                            <p className="font-semibold text-gray-900">Pro</p>
                            <div className="flex items-baseline justify-center my-3">
                              <span className="text-3xl font-bold">$9</span>
                              <span className="text-sm text-gray-600 ml-1">per month</span>
                            </div>
                          </div>
                          <ul className="space-y-2 mb-4 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="text-gray-600">• 3 Topics</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-gray-600">• Unlimited favorites</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-gray-600">• Unlimited capsules</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-gray-600">• Advanced analytics</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-gray-600">• Priority support</span>
                            </li>
                          </ul>
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">Upgrade to Pro</Button>
                        </Card>

                        {/* Elite Plan */}
                        <Card className="p-5">
                          <div className="text-center mb-4">
                            <p className="font-semibold text-gray-900">Elite</p>
                            <div className="flex items-baseline justify-center my-3">
                              <span className="text-3xl font-bold">$19</span>
                              <span className="text-sm text-gray-600 ml-1">per month</span>
                            </div>
                          </div>
                          <ul className="space-y-2 mb-4 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="text-gray-600">• 5 Topics</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-gray-600">• Everything in Pro</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-gray-600">• Custom AI models</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-gray-600">• API access</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-gray-600">• White-label options</span>
                            </li>
                          </ul>
                          <Button variant="outline" className="w-full">Upgrade to Elite</Button>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    {/* Billing Settings */}
                    <div>
                      <h3 className="font-semibold mb-4">BILLING SETTINGS</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Auto-renewal</p>
                            <p className="text-sm text-gray-600">Automatically renew subscription</p>
                          </div>
                          <Switch
                            checked={settings.autoRenewal}
                            onCheckedChange={(checked) => setSettings({ ...settings, autoRenewal: checked })}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Input placeholder="Enter promo code" className="flex-1" />
                          <Button variant="outline">Apply</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </DashboardAuth>
  )
}
