
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Flag, Clock, GripVertical } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface TasksTabProps {
  bookmarkId: string
}

export function TasksTab({ bookmarkId }: TasksTabProps) {
  const [todos, setTodos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDesc, setNewTaskDesc] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  useEffect(() => {
    if (bookmarkId) {
      fetchTodos()
    }
  }, [bookmarkId])

  const fetchTodos = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/todos/${bookmarkId}`)
      if (response.ok) {
        const data = await response.json()
        setTodos(data)
      }
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task title')
      return
    }

    try {
      const response = await fetch(`/api/todos/${bookmarkId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          description: newTaskDesc.trim() || null,
          priority: newTaskPriority
        })
      })

      if (response.ok) {
        const newTodo = await response.json()
        setTodos([...todos, newTodo])
        setNewTaskTitle("")
        setNewTaskDesc("")
        setNewTaskPriority('MEDIUM')
        setShowAddForm(false)
        toast.success('Task added!')
      }
    } catch (error) {
      console.error('Error adding task:', error)
      toast.error('Failed to add task')
    }
  }

  const handleToggleComplete = async (todoId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/todos/${bookmarkId}/${todoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      })

      if (response.ok) {
        setTodos(todos.map(t => 
          t.id === todoId ? { ...t, completed: !completed } : t
        ))
      }
    } catch (error) {
      console.error('Error toggling task:', error)
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (todoId: string) => {
    try {
      const response = await fetch(`/api/todos/${bookmarkId}/${todoId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTodos(todos.filter(t => t.id !== todoId))
        toast.success('Task deleted')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  const handleAddToQueue = async (todoId: string) => {
    try {
      const response = await fetch(`/api/timer-queue/${bookmarkId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todoItemId: todoId })
      })

      if (response.ok) {
        toast.success('Added to timer queue!')
      }
    } catch (error) {
      console.error('Error adding to queue:', error)
      toast.error('Failed to add to timer queue')
    }
  }

  const handleDragStart = (e: React.DragEvent, todoId: string) => {
    setDraggedItem(todoId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedItem || draggedItem === targetId) return

    const draggedIndex = todos.findIndex(t => t.id === draggedItem)
    const targetIndex = todos.findIndex(t => t.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newTodos = [...todos]
    const [removed] = newTodos.splice(draggedIndex, 1)
    newTodos.splice(targetIndex, 0, removed)

    setTodos(newTodos)
    setDraggedItem(null)

    // TODO: Update order in database if needed
    toast.success('Task reordered')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const completedCount = todos.filter(t => t.completed).length
  const totalCount = todos.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{completedCount}/{totalCount} tasks completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Task Form */}
      {showAddForm && (
        <div className="p-4 border rounded-lg space-y-3 bg-gray-50">
          <Input
            placeholder="Task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="bg-white"
          />
          <Textarea
            placeholder="Description (optional)"
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
            className="bg-white"
            rows={2}
          />
          <div className="flex items-center gap-2">
            <Select value={newTaskPriority} onValueChange={(value: any) => setNewTaskPriority(value)}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddTask} className="flex-1">Add Task</Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Add Task Button */}
      {!showAddForm && (
        <Button onClick={() => setShowAddForm(true)} className="w-full" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add New Task
        </Button>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {todos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ListTodo className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No tasks yet. Add your first task above!</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              draggable
              onDragStart={(e) => handleDragStart(e, todo.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, todo.id)}
              className={cn(
                "group p-4 border rounded-lg transition-all duration-200",
                todo.completed ? "bg-gray-50 opacity-60" : "bg-white hover:border-blue-300 hover:shadow-sm",
                draggedItem === todo.id && "opacity-50"
              )}
            >
              <div className="flex items-start gap-3">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-move mt-0.5" />
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => handleToggleComplete(todo.id, todo.completed)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-medium text-gray-900",
                    todo.completed && "line-through text-gray-500"
                  )}>
                    {todo.title}
                  </h4>
                  {todo.description && (
                    <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={cn("text-xs", getPriorityColor(todo.priority))}>
                      <Flag className="w-3 h-3 mr-1" />
                      {todo.priority}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddToQueue(todo.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Clock className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTask(todo.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border", className)}>
      {children}
    </span>
  )
}

function ListTodo({ className }: { className?: string }) {
  return <div className={className}></div>
}
