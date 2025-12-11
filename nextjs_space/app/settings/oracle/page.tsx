"use client"

import { useRouter } from "next/navigation"
import { DashboardAuth } from "@/components/dashboard-auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Sparkles, 
  MessageSquare, 
  Zap, 
  Brain, 
  Volume2, 
  Lightbulb,
  BookOpen,
  Settings,
  Keyboard,
  Shield,
  RefreshCw,
  Check
} from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface OracleSettings {
  // General
  enabled: boolean
  keyboardShortcut: string
  
  // Personality
  personality: 'friendly' | 'professional' | 'concise'
  useEmojis: boolean
  
  // Response Style
  responseLength: 'brief' | 'detailed' | 'comprehensive'
  includeExamples: boolean
  showStepNumbers: boolean
  
  // Context
  accessBookmarks: boolean
  accessCategories: boolean
  accessTags: boolean
  accessStats: boolean
  rememberConversation: boolean
  
  // Proactive Features
  proactiveSuggestions: boolean
  tipOfTheDay: boolean
  onboardingHelp: boolean
  
  // Advanced
  debugMode: boolean
}

const defaultSettings: OracleSettings = {
  enabled: true,
  keyboardShortcut: '⌘K',
  personality: 'friendly',
  useEmojis: true,
  responseLength: 'detailed',
  includeExamples: true,
  showStepNumbers: true,
  accessBookmarks: true,
  accessCategories: true,
  accessTags: true,
  accessStats: true,
  rememberConversation: true,
  proactiveSuggestions: true,
  tipOfTheDay: true,
  onboardingHelp: true,
  debugMode: false
}

export default function OracleSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<OracleSettings>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem('oracleSettings')
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) })
      } catch (e) {
        console.error('Failed to load Oracle settings:', e)
      }
    }
  }, [])

  const updateSetting = <K extends keyof OracleSettings>(key: K, value: OracleSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    localStorage.setItem('oracleSettings', JSON.stringify(settings))
    setHasChanges(false)
    toast.success("Oracle settings saved!")
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    setHasChanges(true)
    toast.info("Settings reset to defaults")
  }

  return (
    <DashboardAuth>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950">
        {/* Purple Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white py-5 shadow-lg">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/settings")}
                  className="text-white hover:bg-white/20 flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Settings
                </Button>
                <div className="h-6 w-px bg-purple-400/50" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold uppercase tracking-wide">The Oracle</h1>
                    <p className="text-xs text-purple-200">AI Assistant Settings</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleReset}
                  className="text-white hover:bg-white/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="bg-white text-purple-700 hover:bg-purple-50"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid gap-6">
            
            {/* Master Control */}
            <Card className="p-6 border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Oracle AI</h2>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Your intelligent guide to BookmarkHub
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {settings.enabled ? 'Active' : 'Disabled'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Press {settings.keyboardShortcut} to open
                    </p>
                  </div>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(checked) => updateSetting('enabled', checked)}
                  />
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Personality */}
              <Card className="p-6 bg-white dark:bg-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white uppercase">Personality</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 block">
                      Communication Style
                    </Label>
                    <RadioGroup
                      value={settings.personality}
                      onValueChange={(value) => updateSetting('personality', value as any)}
                      className="grid gap-2"
                    >
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                        <RadioGroupItem value="friendly" id="friendly" />
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">Friendly</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">Warm, encouraging, uses simple language</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                        <RadioGroupItem value="professional" id="professional" />
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">Professional</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">Formal, precise, business-like tone</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                        <RadioGroupItem value="concise" id="concise" />
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">Concise</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">Brief, to-the-point responses</p>
                        </div>
                      </label>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Use Emojis</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Add emojis for warmth</p>
                    </div>
                    <Switch
                      checked={settings.useEmojis}
                      onCheckedChange={(checked) => updateSetting('useEmojis', checked)}
                    />
                  </div>
                </div>
              </Card>

              {/* Response Style */}
              <Card className="p-6 bg-white dark:bg-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white uppercase">Response Style</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 block">
                      Response Length
                    </Label>
                    <RadioGroup
                      value={settings.responseLength}
                      onValueChange={(value) => updateSetting('responseLength', value as any)}
                      className="grid gap-2"
                    >
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                        <RadioGroupItem value="brief" id="brief" />
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">Brief</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">Quick, essential answers only</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                        <RadioGroupItem value="detailed" id="detailed" />
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">Detailed</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">Thorough explanations with context</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                        <RadioGroupItem value="comprehensive" id="comprehensive" />
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">Comprehensive</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">In-depth with examples and tips</p>
                        </div>
                      </label>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Include Examples</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Show practical examples</p>
                    </div>
                    <Switch
                      checked={settings.includeExamples}
                      onCheckedChange={(checked) => updateSetting('includeExamples', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Numbered Steps</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Use numbered lists for instructions</p>
                    </div>
                    <Switch
                      checked={settings.showStepNumbers}
                      onCheckedChange={(checked) => updateSetting('showStepNumbers', checked)}
                    />
                  </div>
                </div>
              </Card>

              {/* Context Access */}
              <Card className="p-6 bg-white dark:bg-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white uppercase">Context Access</h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                  Control what data Oracle can access to personalize responses
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-900 dark:text-white">Bookmarks</span>
                    </div>
                    <Switch
                      checked={settings.accessBookmarks}
                      onCheckedChange={(checked) => updateSetting('accessBookmarks', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-900 dark:text-white">Categories</span>
                    </div>
                    <Switch
                      checked={settings.accessCategories}
                      onCheckedChange={(checked) => updateSetting('accessCategories', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">#</span>
                      <span className="text-sm text-gray-900 dark:text-white">Tags</span>
                    </div>
                    <Switch
                      checked={settings.accessTags}
                      onCheckedChange={(checked) => updateSetting('accessTags', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-900 dark:text-white">Statistics</span>
                    </div>
                    <Switch
                      checked={settings.accessStats}
                      onCheckedChange={(checked) => updateSetting('accessStats', checked)}
                    />
                  </div>
                </div>
              </Card>

              {/* Proactive Features */}
              <Card className="p-6 bg-white dark:bg-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white uppercase">Proactive Features</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Proactive Suggestions</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Get contextual tips while browsing</p>
                    </div>
                    <Switch
                      checked={settings.proactiveSuggestions}
                      onCheckedChange={(checked) => updateSetting('proactiveSuggestions', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Tip of the Day</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Daily feature discovery tips</p>
                    </div>
                    <Switch
                      checked={settings.tipOfTheDay}
                      onCheckedChange={(checked) => updateSetting('tipOfTheDay', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Onboarding Help</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Guide new users through features</p>
                    </div>
                    <Switch
                      checked={settings.onboardingHelp}
                      onCheckedChange={(checked) => updateSetting('onboardingHelp', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Remember Conversations</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Keep conversation history</p>
                    </div>
                    <Switch
                      checked={settings.rememberConversation}
                      onCheckedChange={(checked) => updateSetting('rememberConversation', checked)}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Keyboard Shortcuts */}
            <Card className="p-6 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Keyboard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white uppercase">Keyboard Shortcuts</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-xs font-mono border dark:border-slate-600">⌘</kbd>
                    <span className="text-gray-500">+</span>
                    <kbd className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-xs font-mono border dark:border-slate-600">K</kbd>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Open The Oracle</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-xs font-mono border dark:border-slate-600">Esc</kbd>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Close The Oracle</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-xs font-mono border dark:border-slate-600">Enter</kbd>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Send Message</p>
                </div>
              </div>
            </Card>

            {/* Try Oracle Now */}
            <Card className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Ready to Try The Oracle?</h3>
                  <p className="text-purple-200 text-sm">
                    Press ⌘K anywhere in the app to start a conversation
                  </p>
                </div>
                <Button 
                  className="bg-white text-purple-700 hover:bg-purple-50"
                  onClick={() => {
                    // Simulate keyboard event to open Oracle
                    const event = new KeyboardEvent('keydown', {
                      key: 'k',
                      metaKey: true,
                      bubbles: true
                    })
                    window.dispatchEvent(event)
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Open Oracle
                </Button>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </DashboardAuth>
  )
}
