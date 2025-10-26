
"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Save
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type SettingsSection = "profile" | "notifications" | "privacy" | "appearance" | "data"

export default function SettingsPage() {
  const { data: session } = useSession() || {}
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile")
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light")

  const handleSave = () => {
    toast.success("Settings saved successfully!")
  }

  const handleChangeAvatar = () => {
    toast.info("Avatar upload coming soon!")
  }

  const handleThemeChange = (newTheme: "light" | "dark" | "auto") => {
    setTheme(newTheme)
    toast.success(`Theme changed to ${newTheme}`)
  }

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl">
                <SettingsIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-gray-600">Manage your account and preferences</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="p-4 space-y-1">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start",
                    activeSection === "profile" && "bg-blue-50 text-blue-600"
                  )}
                  onClick={() => setActiveSection("profile")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start",
                    activeSection === "notifications" && "bg-blue-50 text-blue-600"
                  )}
                  onClick={() => setActiveSection("notifications")}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start",
                    activeSection === "privacy" && "bg-blue-50 text-blue-600"
                  )}
                  onClick={() => setActiveSection("privacy")}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy
                </Button>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start",
                    activeSection === "appearance" && "bg-blue-50 text-blue-600"
                  )}
                  onClick={() => setActiveSection("appearance")}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Appearance
                </Button>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start",
                    activeSection === "data" && "bg-blue-50 text-blue-600"
                  )}
                  onClick={() => setActiveSection("data")}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Data & Storage
                </Button>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Section */}
              {activeSection === "profile" && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="h-5 w-5" />
                    <h2 className="text-xl font-bold">Profile Settings</h2>
                  </div>
                  <Separator className="mb-6" />

                  <div className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={session?.user?.image || ""} />
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Button size="sm" variant="outline" onClick={handleChangeAvatar}>
                          Change Avatar
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 2MB</p>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        defaultValue={session?.user?.name || ""}
                        placeholder="Enter your name"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={session?.user?.email || ""}
                        placeholder="Enter your email"
                      />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Tell us about yourself"
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Bell className="h-5 w-5" />
                    <h2 className="text-xl font-bold">Notification Preferences</h2>
                  </div>
                  <Separator className="mb-6" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive email updates about your bookmarks</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-gray-600">Get notified about important updates</p>
                      </div>
                      <Switch />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Digest</p>
                        <p className="text-sm text-gray-600">Receive a weekly summary of your activity</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </Card>
              )}

              {/* Privacy Section */}
              {activeSection === "privacy" && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="h-5 w-5" />
                    <h2 className="text-xl font-bold">Privacy Settings</h2>
                  </div>
                  <Separator className="mb-6" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Profile Visibility</p>
                        <p className="text-sm text-gray-600">Make your profile visible to others</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Show Activity Status</p>
                        <p className="text-sm text-gray-600">Let others see when you're active</p>
                      </div>
                      <Switch />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Data Collection</p>
                        <p className="text-sm text-gray-600">Allow anonymous data collection for improvements</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </Card>
              )}

              {/* Appearance Section */}
              {activeSection === "appearance" && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Palette className="h-5 w-5" />
                    <h2 className="text-xl font-bold">Appearance</h2>
                  </div>
                  <Separator className="mb-6" />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <Button 
                          variant="outline" 
                          className={cn(
                            "h-20 flex-col",
                            theme === "light" && "border-blue-500 bg-blue-50"
                          )}
                          onClick={() => handleThemeChange("light")}
                        >
                          <div className="w-8 h-8 bg-white border rounded mb-2"></div>
                          Light
                        </Button>
                        <Button 
                          variant="outline" 
                          className={cn(
                            "h-20 flex-col",
                            theme === "dark" && "border-blue-500 bg-blue-50"
                          )}
                          onClick={() => handleThemeChange("dark")}
                        >
                          <div className="w-8 h-8 bg-gray-900 rounded mb-2"></div>
                          Dark
                        </Button>
                        <Button 
                          variant="outline" 
                          className={cn(
                            "h-20 flex-col",
                            theme === "auto" && "border-blue-500 bg-blue-50"
                          )}
                          onClick={() => handleThemeChange("auto")}
                        >
                          <div className="w-8 h-8 bg-gradient-to-r from-white to-gray-900 rounded mb-2"></div>
                          Auto
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Compact Mode</p>
                        <p className="text-sm text-gray-600">Show more content on screen</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </Card>
              )}

              {/* Data & Storage Section */}
              {activeSection === "data" && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Database className="h-5 w-5" />
                    <h2 className="text-xl font-bold">Data & Storage</h2>
                  </div>
                  <Separator className="mb-6" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto Backup</p>
                        <p className="text-sm text-gray-600">Automatically backup your bookmarks</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Clear Cache</p>
                        <p className="text-sm text-gray-600">Free up space by clearing cached data</p>
                      </div>
                      <Button size="sm" variant="outline">Clear</Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Export Data</p>
                        <p className="text-sm text-gray-600">Download all your bookmarks</p>
                      </div>
                      <Button size="sm" variant="outline">Export</Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Save Button */}
              <Button 
                onClick={handleSave}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
