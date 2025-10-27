"use client"

import { useRouter } from "next/navigation"
import { DashboardAuth } from "@/components/dashboard-auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { 
  ArrowLeft, 
  Sparkles, 
  Palette, 
  Brain, 
  Mic, 
  FileText, 
  Wrench, 
  Settings
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type OracleSection = "appearance" | "behavior" | "voice" | "context" | "tools" | "advanced"

export default function OracleSettingsPage() {
  const router = useRouter()
  const [oracleActivated, setOracleActivated] = useState(true)

  const handleSave = () => {
    toast.success("Oracle settings saved!")
  }

  return (
    <DashboardAuth>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
        {/* Purple Header */}
        <div className="bg-purple-600 text-white py-4 shadow-lg">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/settings")}
                className="text-white hover:bg-purple-700 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Settings
              </Button>
              <div className="h-6 w-px bg-purple-400" />
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <h1 className="text-xl font-semibold">Oracle Settings</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Oracle AI Control Card */}
          <Card className="p-6 mb-6 border-purple-200">
            <div className="flex items-start gap-3 mb-2">
              <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">Oracle AI Control</h2>
                <p className="text-sm text-gray-600">Master control to activate or deactivate Oracle AI functionality</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 p-4 bg-purple-50/50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Oracle AI Activated</p>
                <p className="text-sm text-gray-600">Oracle AI is currently active and ready to assist you</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={oracleActivated}
                  onCheckedChange={setOracleActivated}
                />
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="col-span-3">
              <Card className="p-2">
                <nav className="space-y-1">
                  <button
                    onClick={() => router.push("/settings/oracle/appearance")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Palette className="h-4 w-4" />
                    Appearance
                  </button>
                  <button
                    onClick={() => router.push("/settings/oracle/behavior")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Brain className="h-4 w-4" />
                    Behavior
                  </button>
                  <button
                    onClick={() => toast.info("Voice settings coming soon")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Mic className="h-4 w-4" />
                    Voice
                  </button>
                  <button
                    onClick={() => toast.info("Context settings coming soon")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Context
                  </button>
                  <button
                    onClick={() => toast.info("Tools settings coming soon")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Wrench className="h-4 w-4" />
                    Tools
                  </button>
                  <button
                    onClick={() => toast.info("Advanced settings coming soon")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Advanced
                  </button>
                </nav>
              </Card>
            </div>

            {/* Content Area */}
            <div className="col-span-9">
              <Card className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                <Sparkles className="h-16 w-16 text-purple-600 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Oracle AI Settings</h2>
                <p className="text-gray-600 text-center max-w-md">
                  Select a category from the sidebar to customize your Oracle AI experience
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardAuth>
  )
}
