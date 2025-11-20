
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Settings, GripVertical } from "lucide-react"
import { toast } from "sonner"
import * as LucideIcons from "lucide-react"

interface Tool {
  key: string
  label: string
  icon: string
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

export function ManageToolsModal({ 
  bookmarkId, 
  open, 
  onOpenChange,
  onToolsUpdated 
}: ManageToolsModalProps) {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)

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

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName]
    return Icon ? Icon : Settings
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold uppercase">Manage Tools</DialogTitle>
          <p className="text-sm text-gray-500">
            Customize which tools appear in your bookmark tabs
          </p>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-4">Loading tools...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tools.map((tool) => {
              const Icon = getIcon(tool.icon)
              return (
                <div
                  key={tool.key}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{tool.label}</h4>
                        {tool.isSystem && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            System
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {tool.isSystem
                          ? 'Default tool - can be toggled on/off'
                          : 'Optional tool - can be toggled on/off'}
                      </p>
                    </div>
                  </div>

                  <Switch
                    checked={tool.isEnabled}
                    onCheckedChange={() => handleToggleTool(tool.key, tool.isEnabled)}
                  />
                </div>
              )
            })}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
