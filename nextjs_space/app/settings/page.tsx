
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { DashboardAuth } from "@/components/dashboard-auth"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
  RotateCcw,
  Plus,
  Sparkles as SparklesIcon,
  BarChart3,
  Timer,
  Users,
  LineChart,
  Link2Off,
  BookmarkCheck,
  ShieldCheck
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type SettingsTab = "appearance" | "notifications" | "privacy" | "billing" | "oracle"

const ACCENT_COLORS = [
  { name: "Default", value: "#000000" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Pink", value: "#EC4899" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Amber", value: "#F59E0B" },
]

const FONT_OPTIONS = [
  { name: "System Default", value: "system" },
  { name: "Saira (Default)", value: "saira" },
  { name: "Inter", value: "inter" },
  { name: "Roboto", value: "roboto" },
]

const settingsSections = [
  { id: "appearance" as SettingsTab, label: "Appearance", icon: Palette },
  { id: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
  { id: "privacy" as SettingsTab, label: "Privacy & Security", icon: Shield },
  { id: "billing" as SettingsTab, label: "Billing & Subscription", icon: CreditCard },
]

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<SettingsTab>("appearance")
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [show2FADialog, setShow2FADialog] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [exporting, setExporting] = useState(false)
  const [sessions, setSessions] = useState([
    { id: "current", name: "MacBook Pro", device: "Chrome • macOS", ip: "192.168.1.200", lastActive: "Active now", current: true },
    { id: "iphone", name: "iPhone 15 Pro", device: "Safari • iOS", ip: "192.168.1.156", lastActive: "2 hours ago", current: false },
  ])
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' })
  const [qrCode, setQrCode] = useState('')
  const [settings, setSettings] = useState({
    // Appearance
    theme: "light",
    autoScheduleThemes: false,
    accentColor: "#000000",
    fontSize: 16,
    fontFamily: "saira",
    dyslexiaFont: false,
    reducedMotion: false,
    highContrast: false,
    compactMode: false,
    animatedBackgrounds: true,
    sidebarPosition: "left",
    
    // Notification Channels
    emailNotifications: true,
    inAppNotifications: true,
    pushNotifications: false,
    soundEnabled: true,
    notificationEmail: "",
    underlineLinks: false,
    monochromeMode: false,
    softShadows: true,
    notificationEmail: "",
    
    // Event Types
    newAIRecommendations: true,
    weeklyDigest: true,
    timeCapsuleReminders: true,
    collaborativeInvites: true,
    analyticsAlerts: false,
    brokenLinkAlerts: true,
    bookmarkReminders: true,
    securityAlerts: true,
    
    // Quiet Hours
    quietHours: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
    quietHoursWeekends: true,
    
    // Do Not Disturb
    dndEnabled: false,
    
    // Digest Scheduling
    digestFrequency: "weekly",
    digestDay: "monday",
    digestTime: "09:00",
    emailDigest: true,
    
    // Privacy & Security
    enable2FA: false,
    autoRenewal: true,
  })

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
        
        // Apply saved accent color
        if (parsed.accentColor) {
          applyAccentColor(parsed.accentColor)
        }
        
        // Apply saved font size
        if (parsed.fontSize) {
          applyFontSize(parsed.fontSize)
        }
        
        // Apply saved dyslexia font
        if (parsed.dyslexiaFont !== undefined) {
          applyDyslexiaFont(parsed.dyslexiaFont)
        }
        
        // Apply saved reduced motion
        if (parsed.reducedMotion !== undefined) {
          applyReducedMotion(parsed.reducedMotion)
        }
        
        // Apply saved high contrast
        if (parsed.highContrast !== undefined) {
          applyHighContrast(parsed.highContrast)
        }
        
        // Apply saved compact mode
        if (parsed.compactMode !== undefined) {
          applyCompactMode(parsed.compactMode)
        }

        if (parsed.underlineLinks !== undefined) {
          applyUnderlineLinks(parsed.underlineLinks)
        }

        if (parsed.monochromeMode !== undefined) {
          applyMonochromeMode(parsed.monochromeMode)
        }

        if (parsed.softShadows !== undefined) {
          applySoftShadows(parsed.softShadows)
        }
      } catch (e) {
        console.error('Failed to parse saved settings:', e)
      }
    }
    
    // Also load notification settings from API
    const loadNotificationSettings = async () => {
      try {
        const response = await fetch('/api/settings/notifications')
        if (response.ok) {
          const notifSettings = await response.json()
          setSettings(prev => ({ ...prev, ...notifSettings }))
        }
      } catch (error) {
        console.error('Failed to load notification settings:', error)
      }
    }
    loadNotificationSettings()
  }, [])

  // Sync settings.theme with next-themes
  useEffect(() => {
    if (theme) {
      setSettings(prev => ({ ...prev, theme }))
    }
  }, [theme])

  // Utility to convert hex to RGB
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result) {
      return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    }
    return '59, 130, 246'
  }
  
  // Calculate the best foreground color (white or black) based on background
  const getContrastColor = (hexColor: string): string => {
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#000000' : '#ffffff'
  }

  // Apply accent color globally
  const applyAccentColor = (color: string) => {
    document.documentElement.style.setProperty('--user-accent', color)
    document.documentElement.style.setProperty('--user-accent-rgb', hexToRgb(color))
    document.documentElement.style.setProperty('--user-accent-foreground', getContrastColor(color))
    document.documentElement.style.setProperty('--accent-color', color)
    document.documentElement.style.setProperty('--accent-color-hover', adjustColorBrightness(color, -10))
    document.documentElement.style.setProperty('--accent-color-light', adjustColorBrightness(color, 20))
    // Apply accent class to body
    document.body.classList.add('accent-applied')
  }

  // Apply font size globally
  const applyFontSize = (size: number) => {
    document.documentElement.style.setProperty('--user-font-size', `${size}px`)
    document.documentElement.style.fontSize = `${size}px`
  }

  // Apply dyslexia font
  const applyDyslexiaFont = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('dyslexia-font')
    } else {
      document.documentElement.classList.remove('dyslexia-font')
    }
  }

  const applyUnderlineLinks = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('underline-links')
    } else {
      document.documentElement.classList.remove('underline-links')
    }
  }

  const applyMonochromeMode = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('monochrome-mode')
    } else {
      document.documentElement.classList.remove('monochrome-mode')
    }
  }

  const applySoftShadows = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('soft-shadows')
    } else {
      document.documentElement.classList.remove('soft-shadows')
    }
  }

  // Apply reduced motion
  const applyReducedMotion = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('reduced-motion')
    } else {
      document.documentElement.classList.remove('reduced-motion')
    }
  }

  // Apply high contrast
  const applyHighContrast = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }

  // Apply compact mode
  const applyCompactMode = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('compact-mode')
    } else {
      document.documentElement.classList.remove('compact-mode')
    }
  }

  // Utility to adjust color brightness
  const adjustColorBrightness = (color: string, percent: number) => {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.max(0, Math.min(255, (num >> 16) + amt))
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt))
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt))
    return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1)
  }

  // Handle theme change immediately
  const handleThemeChange = (newTheme: string) => {
    setSettings({ ...settings, theme: newTheme })
    setTheme(newTheme)
    toast.success(`Theme changed to ${newTheme}`)
  }

  // Handle accent color change immediately
  const handleAccentColorChange = (color: string) => {
    setSettings({ ...settings, accentColor: color })
    applyAccentColor(color)
    toast.success('Accent color updated')
  }

  // Handle font size change immediately
  const handleFontSizeChange = (size: number) => {
    setSettings({ ...settings, fontSize: size })
    applyFontSize(size)
  }

  // Handle dyslexia font change immediately
  const handleDyslexiaFontChange = (enabled: boolean) => {
    setSettings({ ...settings, dyslexiaFont: enabled })
    applyDyslexiaFont(enabled)
    toast.success(enabled ? 'Dyslexia font enabled' : 'Dyslexia font disabled')
  }

  // Test email notification
  const handleTestEmail = async () => {
    if (!settings.emailNotifications) {
      toast.error('Email notifications are disabled. Enable them first.')
      return
    }
    if (!settings.notificationEmail) {
      toast.error('Enter a notification email first.')
      return
    }
    
    toast.loading('Sending test email...', { id: 'test-email' })
    
    try {
      const response = await fetch('/api/settings/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'email', email: settings.notificationEmail })
      })
      
      toast.dismiss('test-email')
      
      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || 'Test email sent! Check your inbox.', {
          description: 'If you don\'t see it, check your spam folder.',
          duration: 5000,
        })
      } else {
        toast.error('Failed to send test email')
      }
    } catch (error) {
      toast.dismiss('test-email')
      toast.error('Failed to send test email')
    }
  }

  // Test in-app notification
  const handleTestInApp = () => {
    if (!settings.inAppNotifications) {
      toast.error('In-app notifications are disabled. Enable them first.')
      return
    }
    
    // Show different types of toasts
    toast.success('✨ Success notification', {
      description: 'This is how success messages will appear.',
      duration: 3000,
    })
    
    setTimeout(() => {
      toast.info('📌 Info notification', {
        description: 'This is how informational messages appear.',
        duration: 3000,
      })
    }, 500)
    
    setTimeout(() => {
      toast.warning('⚠️ Warning notification', {
        description: 'This is how warnings appear.',
        duration: 3000,
      })
    }, 1000)
  }

  // Test push notification
  const handleTestPush = async () => {
    if (!settings.pushNotifications) {
      toast.error('Push notifications are disabled. Enable them first.')
      return
    }
    
    if (!('Notification' in window)) {
      toast.error('Push notifications are not supported in your browser')
      return
    }

    if (Notification.permission === 'denied') {
      toast.error('Push notifications are blocked. Please enable them in your browser settings.')
      return
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('Push notification permission denied')
        return
      }
    }

    // Create the notification
    const notification = new Notification('BookmarkHub Test 🔔', {
      body: 'Your push notifications are working correctly! You\'ll receive alerts like this.',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'test-notification',
      requireInteraction: false,
    })
    
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
    
    toast.success('Test push notification sent!')
  }
  
  // Save notification settings to API
  const saveNotificationSettings = async () => {
    try {
      const notificationSettings = {
        emailNotifications: settings.emailNotifications,
        inAppNotifications: settings.inAppNotifications,
        pushNotifications: settings.pushNotifications,
        soundEnabled: settings.soundEnabled,
        newAIRecommendations: settings.newAIRecommendations,
        weeklyDigest: settings.weeklyDigest,
        timeCapsuleReminders: settings.timeCapsuleReminders,
        collaborativeInvites: settings.collaborativeInvites,
        analyticsAlerts: settings.analyticsAlerts,
        brokenLinkAlerts: settings.brokenLinkAlerts,
        bookmarkReminders: settings.bookmarkReminders,
        securityAlerts: settings.securityAlerts,
        quietHours: settings.quietHours,
        quietHoursStart: settings.quietHoursStart,
        quietHoursEnd: settings.quietHoursEnd,
        quietHoursWeekends: settings.quietHoursWeekends,
        dndEnabled: settings.dndEnabled,
        digestFrequency: settings.digestFrequency,
        digestDay: settings.digestDay,
        digestTime: settings.digestTime,
        emailDigest: settings.emailDigest,
      }
      
      await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationSettings)
      })
    } catch (error) {
      console.error('Failed to save notification settings:', error)
    }
  }

  // Handle password change
  const handleChangePassword = async () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error('Please fill in all password fields')
      return
    }

    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.new.length < 8) {
      toast.error('New password must be at least 8 characters long')
      return
    }

    toast.loading('Changing password...')
    
    // Simulate API call
    setTimeout(() => {
      toast.dismiss()
      toast.success('Password changed successfully!')
      setShowPasswordDialog(false)
      setPasswordData({ current: '', new: '', confirm: '' })
    }, 1500)
  }

  const signOutSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id || s.current))
    toast.success(id === "current" ? "Signed out" : "Session signed out")
  }

  const signOutOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.current))
    toast.success("Signed out all other sessions")
  }

  const downloadFile = (data: string, filename: string, type: string) => {
    const blob = new Blob([data], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const convertToCSV = (rows: Record<string, unknown>[]) => {
    if (!rows.length) return ''
    const headers = Object.keys(rows[0])
    const csv = [
      headers.join(','),
      ...rows.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(',')),
    ]
    return csv.join('\n')
  }

  const handleExportData = async (format: "json" | "csv") => {
    try {
      setExporting(true)
      const res = await fetch('/api/bookmarks')
      if (!res.ok) throw new Error('Failed to fetch bookmarks')
      const data = await res.json()
      const rows = Array.isArray(data) ? data : data.bookmarks || []
      if (format === "json") {
        downloadFile(JSON.stringify(rows, null, 2), 'bookmarks-export.json', 'application/json')
      } else {
        const csv = convertToCSV(rows)
        downloadFile(csv, 'bookmarks-export.csv', 'text/csv')
      }
      toast.success(`Exported ${rows.length} bookmarks`)
    } catch (error) {
      console.error(error)
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  // Handle 2FA toggle
  const handle2FAToggle = async (enabled: boolean) => {
    if (enabled) {
      // Generate mock QR code (in a real app, this would come from the backend)
      setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/BookmarkAI:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=BookmarkAI')
      setVerificationCode("")
      setShow2FADialog(true)
    } else {
      // Disable 2FA
      toast.loading('Disabling 2FA...')
      setTimeout(() => {
        toast.dismiss()
        setSettings({ ...settings, enable2FA: false })
        toast.success('Two-factor authentication disabled')
      }, 1000)
      setVerificationCode("")
    }
  }

  // Confirm 2FA setup
  const confirm2FASetup = () => {
    if (!/^[0-9]{6}$/.test(verificationCode)) {
      toast.error('Enter the 6-digit code from your authenticator app')
      return
    }
    toast.success('Two-factor authentication enabled successfully!')
    setSettings({ ...settings, enable2FA: true })
    setVerificationCode("")
    setShow2FADialog(false)
  }

  const handleSave = async () => {
    // Save all settings to localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings))
    
    // Apply theme
    setTheme(settings.theme)
    
    // Apply accent color
    applyAccentColor(settings.accentColor)
    
    // Apply font size
    applyFontSize(settings.fontSize)
    
    // Apply dyslexia font
    applyDyslexiaFont(settings.dyslexiaFont)
    
    // Apply reduced motion
    applyReducedMotion(settings.reducedMotion)
    
    // Apply high contrast
    applyHighContrast(settings.highContrast)
    
    // Apply compact mode
    applyCompactMode(settings.compactMode)

    // Apply new appearance options
    applyUnderlineLinks(settings.underlineLinks)
    applyMonochromeMode(settings.monochromeMode)
    applySoftShadows(settings.softShadows)
    
    // Save notification settings to API
    await saveNotificationSettings()
    
    toast.success("Settings saved successfully!")
  }

  const handleReset = () => {
    toast.info("Settings reset to defaults")
  }

  const getCurrentSectionLabel = () => {
    return settingsSections.find(s => s.id === activeTab)?.label || 'Appearance'
  }

  return (
    <DashboardAuth>
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4">
          {/* Main bordered container */}
          <div className="border border-gray-300 dark:border-slate-700 rounded-lg p-4 sm:p-6 bg-white dark:bg-slate-800">
            {/* Top Navigation Bar */}
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-4 sm:gap-8 flex-wrap w-full sm:w-auto">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/dashboard')}
                  className="gap-2 text-xs sm:text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white px-0"
                >
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  Back to Dashboard
                </Button>
                <div className="flex items-center gap-2 sm:gap-3">
                  <SettingsIcon className="h-4 w-4 sm:h-5 sm:w-5 dark:text-white" />
                  <span className="text-sm sm:text-base font-semibold dark:text-white">SETTINGS</span>
                  <span className="text-gray-400 dark:text-slate-500 hidden sm:inline">-</span>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-slate-300 hidden sm:inline">{getCurrentSectionLabel()}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button variant="outline" size="sm" onClick={handleReset} className="hidden sm:flex text-xs">
                  <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Reset
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm px-3" onClick={handleSave}>
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Save</span>
                  <span className="sm:hidden">Save</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left sidebar - Settings Sections */}
              <div className="lg:col-span-1 space-y-6">
                {/* Settings Sections Card */}
                <Card className="bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm">
                  <CardHeader className="pb-4">
                    <h2 className="text-xl font-bold text-black dark:text-white mb-2 uppercase">Settings</h2>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Customize your experience</p>
                  </CardHeader>
                  <CardContent className="space-y-2 pb-6">
                    {settingsSections.map((section) => {
                      const Icon = section.icon
                      const isActive = activeTab === section.id
                      
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveTab(section.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                            isActive 
                              ? "bg-black dark:bg-slate-700 text-white font-medium" 
                              : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                          )}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span className="flex-1">{section.label}</span>
                        </button>
                      )
                    })}
                    <button
                      onClick={() => router.push("/settings/oracle")}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      <Sparkles className="h-5 w-5 flex-shrink-0" />
                      <span className="flex-1">Oracle AI Chat Bot</span>
                    </button>
                  </CardContent>
                </Card>
              </div>

              {/* Main content area */}
              <div className="lg:col-span-2">
              {/* Appearance Tab */}
              {activeTab === "appearance" && (
                <Card className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Palette className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">APPEARANCE</h2>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Customize the look and feel</p>

                  <div className="space-y-5">
                    {/* Theme Selection - Compact */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Theme</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleThemeChange("light")}
                          className={cn(
                            "flex-1 py-2 px-3 rounded border text-sm font-medium transition-all flex items-center justify-center gap-2",
                            settings.theme === "light"
                              ? "border-gray-900 bg-gray-100 dark:border-white dark:bg-gray-800"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          )}
                        >
                          <div className="w-4 h-4 rounded-full bg-white border border-gray-300"></div>
                          Light
                        </button>
                        <button
                          onClick={() => handleThemeChange("dark")}
                          className={cn(
                            "flex-1 py-2 px-3 rounded border text-sm font-medium transition-all flex items-center justify-center gap-2",
                            settings.theme === "dark"
                              ? "border-gray-900 bg-gray-100 dark:border-white dark:bg-gray-800"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          )}
                        >
                          <div className="w-4 h-4 rounded-full bg-gray-900 dark:bg-gray-100"></div>
                          Dark
                        </button>
                        <button
                          onClick={() => handleThemeChange("system")}
                          className={cn(
                            "flex-1 py-2 px-3 rounded border text-sm font-medium transition-all flex items-center justify-center gap-2",
                            settings.theme === "system"
                              ? "border-gray-900 bg-gray-100 dark:border-white dark:bg-gray-800"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          )}
                        >
                          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-white to-gray-900 border border-gray-300"></div>
                          System
                        </button>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Accent Color - Compact */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Accent Color</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {ACCENT_COLORS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => handleAccentColorChange(color.value)}
                            title={color.name}
                            className={cn(
                              "w-7 h-7 rounded-md transition-all",
                              settings.accentColor === color.value
                                ? "ring-2 ring-offset-1 ring-gray-900 dark:ring-white"
                                : "hover:scale-110"
                            )}
                            style={{ backgroundColor: color.value }}
                          >
                            {settings.accentColor === color.value && (
                              <Check className="h-3 w-3 text-white mx-auto drop-shadow" />
                            )}
                          </button>
                        ))}
                        {/* Custom color picker */}
                        <div className="relative">
                          <button
                            onClick={() => setShowCustomColorPicker(!showCustomColorPicker)}
                            className="w-7 h-7 rounded-md border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:border-gray-400 transition-colors"
                          >
                            <span className="text-sm">+</span>
                          </button>
                          {showCustomColorPicker && (
                            <div className="absolute top-full mt-1 left-0 z-10 p-2 bg-white dark:bg-gray-800 rounded shadow-lg border dark:border-gray-700">
                              <input
                                type="color"
                                value={settings.accentColor}
                                onChange={(e) => handleAccentColorChange(e.target.value)}
                                className="w-24 h-24 border-0 cursor-pointer rounded"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full mt-1 h-7 text-xs"
                                onClick={() => setShowCustomColorPicker(false)}
                              >
                                Done
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Applied to buttons, links, and highlights
                      </p>
                    </div>

                    <Separator className="my-4" />

                    {/* Font Size - Compact */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Font Size</h3>
                        <span className="text-xs font-mono text-gray-500">{settings.fontSize}px</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">A</span>
                        <Slider
                          value={[settings.fontSize]}
                          onValueChange={([value]) => handleFontSizeChange(value)}
                          min={12}
                          max={22}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-400">A</span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Accessibility Options - Compact list */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Accessibility</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Dyslexia-friendly font</span>
                          <Switch
                            checked={settings.dyslexiaFont}
                            onCheckedChange={handleDyslexiaFontChange}
                          />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Reduced motion</span>
                          <Switch
                            checked={settings.reducedMotion}
                            onCheckedChange={(checked) => {
                              setSettings({ ...settings, reducedMotion: checked })
                              applyReducedMotion(checked)
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-700 dark:text-gray-300">High contrast</span>
                          <Switch
                            checked={settings.highContrast}
                            onCheckedChange={(checked) => {
                              setSettings({ ...settings, highContrast: checked })
                              applyHighContrast(checked)
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Compact mode</span>
                          <Switch
                            checked={settings.compactMode}
                            onCheckedChange={(checked) => {
                              setSettings({ ...settings, compactMode: checked })
                              applyCompactMode(checked)
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Visual Tweaks */}
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Underline links</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Show underlines on hover</p>
                          </div>
                          <Switch
                            checked={settings.underlineLinks}
                            onCheckedChange={(checked) => {
                              setSettings({ ...settings, underlineLinks: checked })
                              applyUnderlineLinks(checked)
                            }}
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Soft shadows</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Slightly elevated cards</p>
                          </div>
                          <Switch
                            checked={settings.softShadows}
                            onCheckedChange={(checked) => {
                              setSettings({ ...settings, softShadows: checked })
                              applySoftShadows(checked)
                            }}
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Calm colors</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Slightly reduced saturation</p>
                          </div>
                          <Switch
                            checked={settings.monochromeMode}
                            onCheckedChange={(checked) => {
                              setSettings({ ...settings, monochromeMode: checked })
                              applyMonochromeMode(checked)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <Card className="p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 uppercase">NOTIFICATIONS</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Control channels, events, quiet hours, and digests</p>
                    </div>
                  </div>

                  {/* Channels & Event Types (stacked) */}
                  <div className="space-y-4">
                    {/* Channels */}
                    <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 shadow-sm">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Channels</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">How you receive notifications</p>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-slate-800">3 channels</span>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        {/* Email Channel */}
                        <div className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all",
                          settings.emailNotifications 
                            ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-700 dark:bg-emerald-900/30" 
                            : "border-gray-200 dark:border-gray-700"
                        )}>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-9 h-9 rounded-lg flex items-center justify-center",
                                  settings.emailNotifications ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-800/80 dark:text-emerald-200" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                )}>
                                  <Mail className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Email</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Inbox notifications</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {settings.emailNotifications && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={handleTestEmail}
                                    className="h-8 text-xs"
                                  >
                                    Test
                                  </Button>
                                )}
                                <Switch
                                  checked={settings.emailNotifications}
                                  onCheckedChange={(checked) => {
                                    setSettings({ ...settings, emailNotifications: checked })
                                    toast.success(checked ? 'Email enabled' : 'Email disabled')
                                  }}
                                />
                              </div>
                            </div>
                            {settings.emailNotifications && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div className="sm:col-span-2">
                                  <Input 
                                    type="email"
                                    placeholder="you@example.com"
                                    value={settings.notificationEmail}
                                    onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                                    className="h-9 text-sm"
                                  />
                                </div>
                                <div className="flex items-center text-[11px] text-gray-500 dark:text-gray-400">
                                  This address receives email notifications
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* In-App Channel */}
                        <div className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all",
                          settings.inAppNotifications 
                            ? "border-blue-200 bg-blue-50/70 dark:border-blue-700 dark:bg-blue-900/30" 
                            : "border-gray-200 dark:border-gray-700"
                        )}>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center",
                              settings.inAppNotifications ? "bg-blue-100 text-blue-700 dark:bg-blue-800/80 dark:text-blue-200" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                            )}>
                              <Smartphone className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">In-App</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Toast & badge alerts</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {settings.inAppNotifications && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleTestInApp}
                                className="h-8 text-xs"
                              >
                                Test
                              </Button>
                            )}
                            <Switch
                              checked={settings.inAppNotifications}
                              onCheckedChange={(checked) => {
                                setSettings({ ...settings, inAppNotifications: checked })
                                toast.success(checked ? 'In-app enabled' : 'In-app disabled')
                              }}
                            />
                          </div>
                        </div>

                        {/* Push Notifications Channel */}
                        <div className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all",
                          settings.pushNotifications 
                            ? "border-purple-200 bg-purple-50/70 dark:border-purple-700 dark:bg-purple-900/30" 
                            : "border-gray-200 dark:border-gray-700"
                        )}>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center",
                              settings.pushNotifications ? "bg-purple-100 text-purple-700 dark:bg-purple-800/80 dark:text-purple-200" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                            )}>
                              <Chrome className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Push (Browser)</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {typeof window !== 'undefined' && 'Notification' in window
                                  ? Notification.permission === 'denied' 
                                    ? 'Blocked in settings'
                                    : Notification.permission === 'granted'
                                    ? 'Enabled'
                                    : 'Click to enable'
                                  : 'Not supported'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {settings.pushNotifications && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleTestPush}
                                className="h-8 text-xs"
                              >
                                Test
                              </Button>
                            )}
                            <Switch
                              checked={settings.pushNotifications}
                              onCheckedChange={async (checked) => {
                                if (checked) {
                                  if ('Notification' in window) {
                                    if (Notification.permission === 'denied') {
                                      toast.error('Push blocked. Enable in browser settings.')
                                      return
                                    }
                                    if (Notification.permission === 'default') {
                                      const permission = await Notification.requestPermission()
                                      if (permission !== 'granted') {
                                        toast.error('Permission denied')
                                        return
                                      }
                                    }
                                  } else {
                                    toast.error('Not supported in this browser')
                                    return
                                  }
                                }
                                setSettings({ ...settings, pushNotifications: checked })
                                toast.success(checked ? 'Push enabled' : 'Push disabled')
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Event Types */}
                    <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 shadow-sm">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Event Types</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Choose what you get notified about</p>
                        </div>
                        <button 
                          onClick={() => {
                            setSettings({
                              ...settings,
                              newAIRecommendations: true,
                              weeklyDigest: true,
                              timeCapsuleReminders: true,
                              collaborativeInvites: true,
                              analyticsAlerts: true,
                              brokenLinkAlerts: true,
                              bookmarkReminders: true,
                              securityAlerts: true,
                            })
                            toast.success('All enabled')
                          }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Enable all
                        </button>
                      </div>

                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { key: 'newAIRecommendations', label: "AI Recommendations", description: "New suggestions & recs", icon: <SparklesIcon className="h-4 w-4" />, checked: settings.newAIRecommendations },
                          { key: 'weeklyDigest', label: "Weekly Digest", description: "Summary each week", icon: <BarChart3 className="h-4 w-4" />, checked: settings.weeklyDigest },
                          { key: 'timeCapsuleReminders', label: "Time Capsule", description: "Snapshot reminders", icon: <Timer className="h-4 w-4" />, checked: settings.timeCapsuleReminders },
                          { key: 'collaborativeInvites', label: "Collaboration", description: "Playbook invites", icon: <Users className="h-4 w-4" />, checked: settings.collaborativeInvites },
                          { key: 'analyticsAlerts', label: "Analytics", description: "Engagement alerts", icon: <LineChart className="h-4 w-4" />, checked: settings.analyticsAlerts },
                          { key: 'brokenLinkAlerts', label: "Broken Links", description: "Link health issues", icon: <Link2Off className="h-4 w-4" />, checked: settings.brokenLinkAlerts !== false },
                          { key: 'bookmarkReminders', label: "Reminders", description: "Bookmark follow-ups", icon: <BookmarkCheck className="h-4 w-4" />, checked: settings.bookmarkReminders !== false },
                          { key: 'securityAlerts', label: "Security", description: "Account security", icon: <ShieldCheck className="h-4 w-4" />, checked: settings.securityAlerts !== false },
                        ].map((item) => (
                          <div 
                            key={item.key} 
                            className={cn(
                              "flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer",
                              item.checked 
                                ? "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/60" 
                                : "border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100"
                            )}
                            onClick={() => {
                              const newValue = !item.checked
                              setSettings({ ...settings, [item.key]: newValue })
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center",
                                item.checked ? "bg-blue-100 text-blue-700 dark:bg-blue-800/80 dark:text-blue-200" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                              )}>
                                {item.icon}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.label}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{item.description}</span>
                              </div>
                            </div>
                            <Switch 
                              checked={item.checked} 
                              onCheckedChange={(checked) => setSettings({ ...settings, [item.key]: checked })}
                              className="scale-90"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quiet hours & Digest */}
                  <div className="grid lg:grid-cols-2 gap-4">
                    {/* Quiet Hours */}
                    <div className={cn(
                      "rounded-2xl border p-4 transition-all shadow-sm",
                      settings.quietHours 
                        ? "border-amber-200 bg-amber-50/70 dark:border-amber-700 dark:bg-amber-900/30" 
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900/50"
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center",
                            settings.quietHours ? "bg-amber-100 text-amber-700 dark:bg-amber-800/80 dark:text-amber-200" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          )}>
                            <Clock className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Quiet hours</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Silence alerts during set times</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.quietHours}
                          onCheckedChange={(checked) => {
                            setSettings({ ...settings, quietHours: checked })
                            toast.success(checked ? 'Quiet hours on' : 'Quiet hours off')
                          }}
                        />
                      </div>

                      {settings.quietHours && (
                        <div className="mt-4 grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Start</Label>
                            <Input 
                              type="time" 
                              value={settings.quietHoursStart || '22:00'} 
                              onChange={(e) => setSettings({ ...settings, quietHoursStart: e.target.value })}
                              className="h-9 text-xs mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500 dark:text-gray-400">End</Label>
                            <Input 
                              type="time" 
                              value={settings.quietHoursEnd || '07:00'} 
                              onChange={(e) => setSettings({ ...settings, quietHoursEnd: e.target.value })}
                              className="h-9 text-xs mt-1"
                            />
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.quietHoursWeekends !== false}
                                onChange={(e) => setSettings({ ...settings, quietHoursWeekends: e.target.checked })}
                                className="rounded border-gray-300 dark:border-gray-600"
                              />
                              Weekends
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Digest Scheduling */}
                    <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Digest Schedule</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Control summary delivery</p>
                        </div>
                        <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400">
                          {settings.digestFrequency ? settings.digestFrequency : 'off'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs text-gray-500 dark:text-gray-400">Frequency</Label>
                          <Select 
                            value={settings.digestFrequency} 
                            onValueChange={(value) => setSettings({ ...settings, digestFrequency: value })}
                          >
                            <SelectTrigger className="h-9 text-sm mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="never">Never</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {settings.digestFrequency !== 'daily' && settings.digestFrequency !== 'never' && (
                          <div>
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Day</Label>
                            <Select 
                              value={settings.digestDay} 
                              onValueChange={(value) => setSettings({ ...settings, digestDay: value })}
                            >
                              <SelectTrigger className="h-9 text-sm mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => (
                                  <SelectItem key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {settings.digestFrequency !== 'never' && (
                          <div>
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Time</Label>
                            <Input 
                              type="time" 
                              value={settings.digestTime} 
                              onChange={(e) => setSettings({ ...settings, digestTime: e.target.value })} 
                              className="h-9 text-sm mt-1"
                            />
                          </div>
                        )}
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
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">Control your data, sessions, and account safety</p>

                  <div className="space-y-8">
                    {/* Password Management */}
                    <div>
                      <h3 className="font-semibold mb-4">PASSWORD MANAGEMENT</h3>
                      <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
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
                          onCheckedChange={handle2FAToggle}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Session & Device Management */}
                    <div>
                      <h3 className="font-semibold mb-4">SESSION & DEVICE MANAGEMENT</h3>
                      <div className="space-y-3">
                        {sessions.map((sessionItem) => (
                          <div key={sessionItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{sessionItem.name}</p>
                              <p className="text-sm text-gray-600">
                                {sessionItem.device} • {sessionItem.ip} • {sessionItem.lastActive}
                              </p>
                            </div>
                            {sessionItem.current ? (
                              <Badge>Current</Badge>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => signOutSession(sessionItem.id)}>
                                <LogOut className="h-3 w-3 mr-1" />
                                Sign Out
                              </Button>
                            )}
                          </div>
                        ))}
                        {sessions.some(s => !s.current) && (
                          <Button variant="destructive" className="w-full" onClick={signOutOtherSessions}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out All Other Sessions
                          </Button>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Privacy Policy & Data Export */}
                    <div>
                      <h3 className="font-semibold mb-4">PRIVACY POLICY & DATA EXPORT</h3>
                      <div className="flex gap-3 flex-wrap">
                        <Button variant="outline" disabled={exporting} onClick={() => handleExportData("json")}>
                          <Download className="h-4 w-4 mr-2" />
                          {exporting ? "Preparing..." : "Download My Data (JSON)"}
                        </Button>
                        <Button variant="outline" disabled={exporting} onClick={() => handleExportData("csv")}>
                          <FileText className="h-4 w-4 mr-2" />
                          {exporting ? "Preparing..." : "Download CSV"}
                        </Button>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Request Account Deletion
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Backup & Export moved to Time Capsule */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border rounded-lg bg-gray-50 dark:bg-slate-800/60">
                      <div>
                        <p className="font-semibold text-sm">Backups live in Time Capsule</p>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          Manage snapshots, scheduled backups, imports, and exports directly from Time Capsule.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push("/time-capsule")}>
                          <Clock className="h-4 w-4 mr-2" />
                          Open Time Capsule
                        </Button>
                        <Button onClick={() => router.push("/time-capsule")} className="bg-blue-600 hover:bg-blue-700">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Create Snapshot
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
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">Manage your subscription, usage, and billing information</p>

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
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card className="md:col-span-2 border-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 shadow-xl">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] opacity-80">Current Plan</p>
                            <p className="text-3xl font-bold mt-1">FREE PLAN</p>
                            <p className="text-sm opacity-90">Perfect for getting started</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <p className="text-lg font-semibold">$0 / month</p>
                            <Button className="bg-white text-blue-700 hover:bg-slate-100">
                              <Sparkles className="h-4 w-4 mr-2" />
                              UPGRADE TO PRO
                            </Button>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm">
                          <div className="bg-white/10 rounded-lg p-3">
                            <p className="text-xs uppercase opacity-80">Topics</p>
                            <p className="text-lg font-semibold">1 / 1</p>
                            <Progress value={100} className="h-1.5 mt-2" />
                          </div>
                          <div className="bg-white/10 rounded-lg p-3">
                            <p className="text-xs uppercase opacity-80">Favorites</p>
                            <p className="text-lg font-semibold">45 / 100</p>
                            <Progress value={45} className="h-1.5 mt-2" />
                          </div>
                          <div className="bg-white/10 rounded-lg p-3">
                            <p className="text-xs uppercase opacity-80">Time Capsules</p>
                            <p className="text-lg font-semibold">3 / 5</p>
                            <Progress value={60} className="h-1.5 mt-2" />
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4 border border-blue-100 dark:border-slate-700">
                        <p className="text-sm font-semibold mb-2">Next Invoice</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">$0.00</p>
                        <p className="text-xs text-gray-500 mb-3">Billed monthly • Cancel anytime</p>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-slate-300">
                          <p className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> No card on file</p>
                          <p className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Unlimited AI reminders</p>
                          <p className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Basic analytics</p>
                        </div>
                      </Card>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">CHOOSE YOUR PLAN</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <Card className="p-5 border border-gray-200 dark:border-slate-700">
                          <p className="font-semibold text-gray-900 dark:text-white">Free</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">$0</p>
                          <p className="text-sm text-gray-500">Forever</p>
                          <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-slate-300">
                            <li>• 1 Topic</li>
                            <li>• 100 Favorites</li>
                            <li>• 5 Time Capsules</li>
                            <li>• Community Support</li>
                          </ul>
                          <Button variant="outline" className="w-full mt-5">Current Plan</Button>
                        </Card>

                        <Card className="p-5 border border-blue-200 shadow-lg shadow-blue-100 dark:border-blue-700 relative overflow-hidden">
                          <Badge className="absolute -top-3 right-3 bg-blue-600 text-white">POPULAR</Badge>
                          <p className="font-semibold text-gray-900 dark:text-white">Pro</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">$15</p>
                          <p className="text-sm text-gray-500">Per month</p>
                          <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-slate-300">
                            <li>• Unlimited Topics</li>
                            <li>• 5,000 Favorites</li>
                            <li>• Unlimited Time Capsules</li>
                            <li>• AI Summaries</li>
                            <li>• Priority Support</li>
                          </ul>
                          <Button className="w-full mt-5 bg-blue-600 hover:bg-blue-700">Upgrade</Button>
                        </Card>

                        <Card className="p-5 border border-gray-200 dark:border-slate-700">
                          <p className="font-semibold text-gray-900 dark:text-white">Enterprise</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">Custom</p>
                          <p className="text-sm text-gray-500">Tailored</p>
                          <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-slate-300">
                            <li>• Dedicated Success Manager</li>
                            <li>• SSO & Compliance</li>
                            <li>• Advanced Analytics</li>
                            <li>• Custom Limits</li>
                          </ul>
                          <Button variant="outline" className="w-full mt-5">Talk to Sales</Button>
                        </Card>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="p-4 border dark:border-slate-700">
                        <h3 className="font-semibold mb-3">PAYMENT METHOD</h3>
                        <div className="flex items-center justify-between p-3 border rounded-lg dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-7 rounded bg-gradient-to-r from-blue-500 to-blue-700 text-white flex items-center justify-center text-xs font-bold">
                              VISA
                            </div>
                            <div>
                              <p className="font-semibold text-sm">Visa ending in 4242</p>
                              <p className="text-xs text-gray-500">Expires 12/27</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Set Default</Button>
                            <Button variant="destructive" size="sm">Remove</Button>
                          </div>
                        </div>
                        <Button variant="outline" className="mt-3">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Payment Method
                        </Button>
                      </Card>

                      <Card className="p-4 border dark:border-slate-700">
                        <h3 className="font-semibold mb-3">BILLING HISTORY</h3>
                        <div className="space-y-3">
                          {["Pro Plan - Jan 2025", "Pro Plan - Dec 2024"].map((item, idx) => (
                            <div key={item} className="flex items-center justify-between p-3 border rounded-lg dark:border-slate-700">
                              <div>
                                <p className="font-medium text-sm">{item}</p>
                                <p className="text-xs text-gray-500">Invoice #{idx === 0 ? "12345" : "12344"}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Paid</Badge>
                                <span className="font-semibold">$15.00</span>
                                <Button variant="outline" size="sm">Download</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>

                    <Card className="p-4 border dark:border-slate-700">
                      <h3 className="font-semibold mb-3">AUTO-RENEWAL & PROMOS</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg dark:border-slate-700">
                          <div>
                            <p className="font-medium text-sm">Auto-renewal</p>
                            <p className="text-sm text-gray-600 dark:text-slate-400">Automatically renew subscription</p>
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
                    </Card>
                  </div>
                </Card>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                placeholder="Enter new password (min 8 characters)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg border">
                {qrCode && (
                  <img 
                    src={qrCode} 
                    alt="2FA QR Code" 
                    className="w-48 h-48"
                  />
                )}
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">Or enter this code manually:</p>
                <code className="text-xs bg-gray-100 px-3 py-2 rounded">
                  JBSWY3DPEHPK3PXP
                </code>
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <p className="text-xs text-gray-600">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShow2FADialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirm2FASetup}>
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardAuth>
  )
}
