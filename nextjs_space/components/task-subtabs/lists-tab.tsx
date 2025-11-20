"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Folder, ListTodo, PlusCircle, X, Clock, List } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ListsTabProps {
  bookmarkId: string
}

export function ListsTab({ bookmarkId }: ListsTabProps) {
  const [taskLists, setTaskLists] = useState<any[]>([])
  const [todos, setTodos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [todosLoading, setTodosLoading] = useState(false)
  const [showAddListForm, setShowAddListForm] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [newListDesc, setNewListDesc] = useState("")
  const [newListColor, setNewListColor] = useState("#3B82F6")
  const [selectedList, setSelectedList] = useState<any>(null)
  const [showAddToListDropdown, setShowAddToListDropdown] = useState<string | null>(null)

  useEffect(() => {
    if (bookmarkId) {
      fetchLists()
      fetchTodos()
    }
  }, [bookmarkId])

  const fetchLists = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/task-lists/${bookmarkId}`)
      if (response.ok) {
        const data = await response.json()
        setTaskLists(data)
      }
    } catch (error) {
      console.error('Error fetching lists:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTodos = async () => {
    try {
      setTodosLoading(true)
      const response = await fetch(`/api/todos/${bookmarkId}`)
      if (response.ok) {
        const data = await response.json()
        setTodos(data)
      }
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setTodosLoading(false)
    }
  }

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error('Please enter a list name')
      return
    }

    try {
      const response = await fetch(`/api/task-lists/${bookmarkId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newListName.trim(),
          description: newListDesc.trim() || null,
          color: newListColor
        })
      })

      if (response.ok) {
        const newList = await response.json()
        setTaskLists([...taskLists, newList])
        setNewListName("")
        setNewListDesc("")
        setNewListColor("#3B82F6")
        setShowAddListForm(false)
        toast.success('List created!')
      }
    } catch (error) {
      console.error('Error creating list:', error)
      toast.error('Failed to create list')
    }
  }

  const handleDeleteList = async (listId: string) => {
    try {
      const response = await fetch(`/api/task-lists/${bookmarkId}/${listId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTaskLists(taskLists.filter(l => l.id !== listId))
        if (selectedList?.id === listId) {
          setSelectedList(null)
        }
        toast.success('List deleted')
      }
    } catch (error) {
      console.error('Error deleting list:', error)
      toast.error('Failed to delete list')
    }
  }

  const handleAddTaskToList = async (listId: string, todoId: string) => {
    try {
      const response = await fetch(`/api/task-lists/${bookmarkId}/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todoItemId: todoId })
      })

      if (response.ok) {
        await fetchLists()
        toast.success('Task added to list!')
      }
    } catch (error) {
      console.error('Error adding task to list:', error)
      toast.error('Failed to add task to list')
    }
  }

  const handleRemoveTaskFromList = async (listId: string, todoId: string) => {
    try {
      const response = await fetch(`/api/task-lists/${bookmarkId}/${listId}/items?todoItemId=${todoId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchLists()
        toast.success('Task removed from list')
      }
    } catch (error) {
      console.error('Error removing task from list:', error)
      toast.error('Failed to remove task from list')
    }
  }

  const handleAddListToQueue = async (listId: string) => {
    const list = taskLists.find(l => l.id === listId)
    if (!list || !list.items || list.items.length === 0) {
      toast.error('List is empty')
      return
    }

    try {
      // Add all tasks in the list to the timer queue
      for (const item of list.items) {
        await fetch(`/api/timer-queue/${bookmarkId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ todoItemId: item.todoItem.id })
        })
      }
      toast.success(`Added ${list.items.length} tasks to timer queue!`)
    } catch (error) {
      console.error('Error adding list to queue:', error)
      toast.error('Failed to add list to timer queue')
    }
  }

  const colors = [
    { name: "Blue", value: "#3B82F6" },
    { name: "Green", value: "#10B981" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Red", value: "#EF4444" },
    { name: "Yellow", value: "#F59E0B" },
    { name: "Pink", value: "#EC4899" }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide uppercase">List Manager</h2>
            <p className="text-sm text-gray-600 mt-1">Create focused lists of 4-5 tasks for timer sessions</p>
          </div>
          <Button onClick={() => setShowAddListForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create List
          </Button>
        </div>
      </div>

      {/* Add List Form */}
      {showAddListForm && (
        <div className="p-4 border rounded-lg space-y-3 bg-gray-50">
          <Input
            placeholder="List name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="bg-white"
          />
          <Textarea
            placeholder="Description (optional)"
            value={newListDesc}
            onChange={(e) => setNewListDesc(e.target.value)}
            className="bg-white"
            rows={2}
          />
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Color</label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setNewListColor(color.value)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    newListColor === color.value ? "border-gray-900 scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateList} className="flex-1">Create List</Button>
            <Button variant="outline" onClick={() => setShowAddListForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Lists Content */}
      {taskLists.length === 0 && !showAddListForm ? (
        <div className="border-2 border-dashed rounded-lg py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-gray-400 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lists Created</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md">
              Create your first focused task list to get started with organized pomodoro sessions.
            </p>
            <Button onClick={() => setShowAddListForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First List
            </Button>
          </div>
        </div>
      ) : taskLists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {taskLists.map((list) => (
            <div
              key={list.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: list.color }}
                  />
                  <h4 className="font-semibold text-gray-900">{list.name}</h4>
                  <span className="text-xs text-gray-500">
                    ({list.items?.length || 0})
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddListToQueue(list.id)}
                    className="h-7 w-7 p-0"
                    title="Add list to timer queue"
                  >
                    <Clock className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteList(list.id)}
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {list.description && (
                <p className="text-sm text-gray-600 mb-3">{list.description}</p>
              )}

              {/* Tasks in List */}
              <div className="space-y-2 mb-3">
                {list.items && list.items.length > 0 ? (
                  list.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                    >
                      <span className="text-gray-700 flex-1">{item.todoItem.title}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveTaskFromList(list.id, item.todoItem.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-2">No tasks in this list</p>
                )}
              </div>

              {/* Add Task to List */}
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddToListDropdown(
                    showAddToListDropdown === list.id ? null : list.id
                  )}
                  className="w-full text-xs"
                >
                  <PlusCircle className="w-3 h-3 mr-1" />
                  Add Task
                </Button>

                {showAddToListDropdown === list.id && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {todosLoading ? (
                      <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
                    ) : todos.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">No tasks available</div>
                    ) : (
                      todos
                        .filter(todo => !list.items?.some((item: any) => item.todoItem.id === todo.id))
                        .map(todo => (
                          <button
                            key={todo.id}
                            onClick={() => {
                              handleAddTaskToList(list.id, todo.id)
                              setShowAddToListDropdown(null)
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b last:border-b-0"
                          >
                            {todo.title}
                          </button>
                        ))
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
