
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Settings, GripVertical, Search, Sparkles, Briefcase, Palette, FileText, Users, Wrench, Brain } from "lucide-react"
import { toast } from "sonner"
import * as LucideIcons from "lucide-react"
import { cn } from "@/lib/utils"

interface Tool {
  key: string
  label: string
  description?: string
  icon: string
  category?: string
  isSystem: boolean
  isEnabled: boolean
  order: number
}

interface ManageToolsModalProps {
  bookmarkId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onToolsUpdated: () => void
}

const CATEGORY_INFO: Record<string, { label: string; icon: any; color: string }> = {
  core: { label: "Core", icon: Settings, color: "bg-gray-100 text-gray-600" },
  productivity: { label: "Productivity", icon: Briefcase, color: "bg-blue-100 text-blue-600" },
  creativity: { label: "Creativity", icon: Palette, color: "bg-purple-100 text-purple-600" },
  documents: { label: "Documents", icon: FileText, color: "bg-amber-100 text-amber-600" },
  collaboration: { label: "Collaboration", icon: Users, color: "bg-green-100 text-green-600" },
  content: { label: "Content", icon: FileText, color: "bg-cyan-100 text-cyan-600" },
  ai: { label: "AI Powered", icon: Sparkles, color: "bg-violet-100 text-violet-600" },
  utility: { label: "Utility", icon: Wrench, color: "bg-orange-100 text-orange-600" }
}

export function ManageToolsModal({ 
  bookmarkId, 
  open, 
  onOpenChange,
  onToolsUpdated 
}: ManageToolsModalProps) {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    if (open && bookmarkId) {
      fetchTools()
    }
  }, [open, bookmarkId])

  const fetchTools = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/bookmark-tools/${bookmarkId}`)
      if (response.ok) {
        const data = await response.json()
        setTools(data)
      }
    } catch (error) {
      console.error('Error fetching tools:', error)
      toast.error('Failed to load tools')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTool = async (toolKey: string, currentlyEnabled: boolean) => {
    try {
      const response = await fetch(`/api/bookmark-tools/${bookmarkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolKey,
          isEnabled: !currentlyEnabled
        })
      })

      if (response.ok) {
        setTools(tools.map(t => 
          t.key === toolKey ? { ...t, isEnabled: !currentlyEnabled } : t
        ))
        toast.success(!currentlyEnabled ? 'Tool enabled' : 'Tool disabled')
        onToolsUpdated()
      }
    } catch (error) {
      console.error('Error toggling tool:', error)
      toast.error('Failed to update tool')
    }
  }

  const enableAll = () => {
    tools.forEach(tool => {
      if (!tool.isEnabled) {
        handleToggleTool(tool.key, false)
      }
    })
  }

  const disableOptional = () => {
    tools.forEach(tool => {
      if (tool.isEnabled && !tool.isSystem) {
        handleToggleTool(tool.key, true)
      }
    })
  }

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName]
    return Icon ? Icon : Settings
  }

  // Group tools by category
  const groupedTools = tools.reduce((acc, tool) => {
    const category = tool.category || 'utility'
    if (!acc[category]) acc[category] = []
    acc[category].push(tool)
    return acc
  }, {} as Record<string, Tool[]>)

  // Filter tools
  const filteredTools = tools.filter(tool => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!tool.label.toLowerCase().includes(query) && 
          !tool.description?.toLowerCase().includes(query)) {
        return false
      }
    }
    if (selectedCategory && tool.category !== selectedCategory) {
      return false
    }
    return true
  })

  const enabledCount = tools.filter(t => t.isEnabled).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold uppercase flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Manage Tools
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Customize which tools appear in your bookmark tabs. You have {enabledCount} of {tools.length} tools enabled.
          </p>
        </DialogHeader>

        {/* Search and Quick Actions */}
        <div className="py-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" onClick={enableAll}>
              Enable All
            </Button>
            <Button variant="outline" size="sm" onClick={disableOptional}>
              Reset
            </Button>
          </div>

          {/* Category filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="h-8"
            >
              All
            </Button>
            {Object.entries(CATEGORY_INFO).map(([key, { label, icon: Icon, color }]) => {
              const count = groupedTools[key]?.length || 0
              if (count === 0) return null
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className="h-8"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {label}
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {count}
                  </Badge>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Tools List */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-4">Loading tools...</p>
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No tools found</p>
            </div>
          ) : selectedCategory ? (
            // Show filtered by single category
            <div className="space-y-2">
              {filteredTools.map((tool) => (
                <ToolCard 
                  key={tool.key} 
                  tool={tool} 
                  getIcon={getIcon} 
                  onToggle={handleToggleTool}
                />
              ))}
            </div>
          ) : (
            // Show grouped by category
            <div className="space-y-6">
              {Object.entries(groupedTools).map(([category, categoryTools]) => {
                const info = CATEGORY_INFO[category] || CATEGORY_INFO.utility
                const visibleTools = categoryTools.filter(t => 
                  !searchQuery || 
                  t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  t.description?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                
                if (visibleTools.length === 0) return null

                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-3 sticky top-0 bg-white dark:bg-gray-900 py-2 z-10">
                      <div className={cn("p-1.5 rounded", info.color)}>
                        <info.icon className="h-4 w-4" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white uppercase text-sm">
                        {info.label}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {visibleTools.filter(t => t.isEnabled).length}/{visibleTools.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {visibleTools.map((tool) => (
                        <ToolCard 
                          key={tool.key} 
                          tool={tool} 
                          getIcon={getIcon} 
                          onToggle={handleToggleTool}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Tool Card Component
function ToolCard({ 
  tool, 
  getIcon, 
  onToggle 
}: { 
  tool: Tool
  getIcon: (name: string) => any
  onToggle: (key: string, enabled: boolean) => void
}) {
  const Icon = getIcon(tool.icon)
  const categoryInfo = CATEGORY_INFO[tool.category || 'utility']

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border rounded-lg transition-all",
        tool.isEnabled 
          ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" 
          : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-60"
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        <GripVertical className="h-5 w-5 text-gray-400 cursor-move flex-shrink-0" />
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          categoryInfo.color
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {tool.label}
            </h4>
            {tool.isSystem && (
              <Badge variant="secondary" className="text-xs">
                Core
              </Badge>
            )}
          </div>
          {tool.description && (
            <p className="text-sm text-gray-500 line-clamp-1">
              {tool.description}
            </p>
          )}
        </div>
      </div>

      <Switch
        checked={tool.isEnabled}
        onCheckedChange={() => onToggle(tool.key, tool.isEnabled)}
      />
    </div>
  )
}
