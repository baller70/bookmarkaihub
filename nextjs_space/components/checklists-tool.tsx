"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { 
  ClipboardCheck, 
  Plus, 
  Trash2,
  Copy,
  Edit,
  CheckCircle2,
  Circle,
  MoreVertical,
  Save,
  RotateCcw
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

interface Checklist {
  id: string
  name: string
  items: ChecklistItem[]
  isTemplate: boolean
  createdAt: Date
}

interface ChecklistsToolProps {
  bookmarkId: string
}

// Pre-built templates
const TEMPLATES: Omit<Checklist, "id" | "createdAt">[] = [
  {
    name: "Project Launch",
    isTemplate: true,
    items: [
      { id: "1", text: "Define project scope", completed: false },
      { id: "2", text: "Create timeline", completed: false },
      { id: "3", text: "Assign team members", completed: false },
      { id: "4", text: "Set up communication channels", completed: false },
      { id: "5", text: "Create documentation", completed: false },
      { id: "6", text: "Schedule kickoff meeting", completed: false }
    ]
  },
  {
    name: "Code Review",
    isTemplate: true,
    items: [
      { id: "1", text: "Check code style consistency", completed: false },
      { id: "2", text: "Review error handling", completed: false },
      { id: "3", text: "Verify tests coverage", completed: false },
      { id: "4", text: "Check for security issues", completed: false },
      { id: "5", text: "Review documentation", completed: false },
      { id: "6", text: "Performance considerations", completed: false }
    ]
  },
  {
    name: "Content Publishing",
    isTemplate: true,
    items: [
      { id: "1", text: "Proofread content", completed: false },
      { id: "2", text: "Add meta descriptions", completed: false },
      { id: "3", text: "Optimize images", completed: false },
      { id: "4", text: "Set up SEO tags", completed: false },
      { id: "5", text: "Schedule publication", completed: false },
      { id: "6", text: "Prepare social media posts", completed: false }
    ]
  },
  {
    name: "Meeting Prep",
    isTemplate: true,
    items: [
      { id: "1", text: "Define agenda", completed: false },
      { id: "2", text: "Send invites", completed: false },
      { id: "3", text: "Prepare presentation", completed: false },
      { id: "4", text: "Gather supporting materials", completed: false },
      { id: "5", text: "Set up meeting room/link", completed: false }
    ]
  }
]

export function ChecklistsTool({ bookmarkId }: ChecklistsToolProps) {
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [showTemplates, setShowTemplates] = useState(false)
  const [showNewChecklist, setShowNewChecklist] = useState(false)
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null)
  const [newChecklistName, setNewChecklistName] = useState("")
  const [newItemText, setNewItemText] = useState("")

  useEffect(() => {
    loadChecklists()
  }, [bookmarkId])

  const loadChecklists = async () => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}/checklists`)
      if (response.ok) {
        const data = await response.json()
        setChecklists(data.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt)
        })))
      }
    } catch (error) {
      console.error("Error loading checklists:", error)
    }
  }

  const createFromTemplate = (template: typeof TEMPLATES[0]) => {
    const newChecklist: Checklist = {
      id: `checklist-${Date.now()}`,
      name: template.name,
      items: template.items.map(item => ({
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2)}`
      })),
      isTemplate: false,
      createdAt: new Date()
    }
    setChecklists([newChecklist, ...checklists])
    setShowTemplates(false)
    toast.success("Checklist created from template!")
  }

  const createNewChecklist = () => {
    if (!newChecklistName.trim()) {
      toast.error("Please enter a name")
      return
    }

    const newChecklist: Checklist = {
      id: `checklist-${Date.now()}`,
      name: newChecklistName,
      items: [],
      isTemplate: false,
      createdAt: new Date()
    }

    setChecklists([newChecklist, ...checklists])
    setNewChecklistName("")
    setShowNewChecklist(false)
    setEditingChecklist(newChecklist)
    toast.success("Checklist created!")
  }

  const deleteChecklist = (id: string) => {
    setChecklists(checklists.filter(c => c.id !== id))
    if (editingChecklist?.id === id) {
      setEditingChecklist(null)
    }
    toast.success("Checklist deleted")
  }

  const duplicateChecklist = (checklist: Checklist) => {
    const duplicate: Checklist = {
      ...checklist,
      id: `checklist-${Date.now()}`,
      name: `${checklist.name} (Copy)`,
      items: checklist.items.map(item => ({
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        completed: false
      })),
      createdAt: new Date()
    }
    setChecklists([duplicate, ...checklists])
    toast.success("Checklist duplicated!")
  }

  const resetChecklist = (id: string) => {
    setChecklists(checklists.map(c =>
      c.id === id
        ? { ...c, items: c.items.map(item => ({ ...item, completed: false })) }
        : c
    ))
    toast.success("Checklist reset!")
  }

  const toggleItem = (checklistId: string, itemId: string) => {
    setChecklists(checklists.map(c =>
      c.id === checklistId
        ? {
            ...c,
            items: c.items.map(item =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            )
          }
        : c
    ))
  }

  const addItem = (checklistId: string) => {
    if (!newItemText.trim()) return

    setChecklists(checklists.map(c =>
      c.id === checklistId
        ? {
            ...c,
            items: [
              ...c.items,
              {
                id: `item-${Date.now()}`,
                text: newItemText,
                completed: false
              }
            ]
          }
        : c
    ))
    setNewItemText("")
  }

  const deleteItem = (checklistId: string, itemId: string) => {
    setChecklists(checklists.map(c =>
      c.id === checklistId
        ? { ...c, items: c.items.filter(item => item.id !== itemId) }
        : c
    ))
  }

  const getProgress = (checklist: Checklist) => {
    if (checklist.items.length === 0) return 0
    return (checklist.items.filter(i => i.completed).length / checklist.items.length) * 100
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-teal-600" />
            <h2 className="font-bold text-lg uppercase">CHECKLISTS</h2>
            <Badge variant="outline" className="ml-2">
              {checklists.length} lists
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowTemplates(true)}>
              <Copy className="h-4 w-4 mr-1" />
              Templates
            </Button>
            <Button size="sm" onClick={() => setShowNewChecklist(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New List
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Checklists List */}
        <div className={cn(
          "border-r overflow-auto transition-all",
          editingChecklist ? "w-64" : "flex-1"
        )}>
          <div className="p-4 space-y-3">
            {checklists.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">
                  NO CHECKLISTS
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Create checklists or use templates
                </p>
                <div className="flex flex-col gap-2 items-center">
                  <Button onClick={() => setShowNewChecklist(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New
                  </Button>
                  <Button variant="outline" onClick={() => setShowTemplates(true)}>
                    <Copy className="h-4 w-4 mr-2" />
                    From Template
                  </Button>
                </div>
              </div>
            ) : (
              checklists.map(checklist => {
                const progress = getProgress(checklist)
                const isEditing = editingChecklist?.id === checklist.id
                const completedCount = checklist.items.filter(i => i.completed).length

                return (
                  <div
                    key={checklist.id}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-all bg-white dark:bg-gray-800",
                      isEditing ? "ring-2 ring-blue-500" : "hover:shadow-md"
                    )}
                    onClick={() => setEditingChecklist(checklist)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {checklist.name}
                      </h4>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateChecklist(checklist)
                          }}
                          className="h-7 w-7 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            resetChecklist(checklist.id)
                          }}
                          className="h-7 w-7 p-0"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteChecklist(checklist.id)
                          }}
                          className="h-7 w-7 p-0 text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={progress} className="flex-1 h-2" />
                      <span className="text-xs text-gray-500">
                        {completedCount}/{checklist.items.length}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Checklist Editor */}
        {editingChecklist && (
          <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white uppercase">
                  {editingChecklist.name}
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingChecklist(null)}
                >
                  Close
                </Button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={getProgress(editingChecklist)} className="flex-1 h-2" />
                <span className="text-sm text-gray-500">
                  {editingChecklist.items.filter(i => i.completed).length} of {editingChecklist.items.length}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-2">
              {editingChecklist.items.map(item => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    item.completed 
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200" 
                      : "bg-white dark:bg-gray-800"
                  )}
                >
                  <button
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                      item.completed
                        ? "border-green-500 bg-green-500"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                    onClick={() => toggleItem(editingChecklist.id, item.id)}
                  >
                    {item.completed && (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    )}
                  </button>
                  <span className={cn(
                    "flex-1 text-gray-700 dark:text-gray-300",
                    item.completed && "line-through text-gray-400"
                  )}>
                    {item.text}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteItem(editingChecklist.id, item.id)}
                    className="h-7 w-7 p-0 text-red-600 opacity-0 hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {/* Add new item */}
              <div className="flex items-center gap-2 mt-4">
                <Input
                  placeholder="Add new item..."
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addItem(editingChecklist.id)
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => addItem(editingChecklist.id)}
                  disabled={!newItemText.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="uppercase">Choose Template</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            {TEMPLATES.map((template, i) => (
              <button
                key={i}
                className="p-4 border rounded-lg text-left hover:shadow-md hover:border-blue-500 transition-all"
                onClick={() => createFromTemplate(template)}
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {template.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {template.items.length} items
                </p>
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplates(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Checklist Dialog */}
      <Dialog open={showNewChecklist} onOpenChange={setShowNewChecklist}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="uppercase">New Checklist</DialogTitle>
          </DialogHeader>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Name
            </label>
            <Input
              placeholder="My Checklist"
              value={newChecklistName}
              onChange={(e) => setNewChecklistName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  createNewChecklist()
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewChecklist(false)}>
              Cancel
            </Button>
            <Button onClick={createNewChecklist}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




