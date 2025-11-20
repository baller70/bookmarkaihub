"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Calendar, Flag } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface TodoItem {
  id: string
  title: string
  description?: string | null
  completed: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate?: Date | null
  createdAt: Date
}

interface TodoToolProps {
  bookmarkId: string
}

export function TodoTool({ bookmarkId }: TodoToolProps) {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newTodoTitle, setNewTodoTitle] = useState("")
  const [newTodoDesc, setNewTodoDesc] = useState("")
  const [newTodoPriority, setNewTodoPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [showAddForm, setShowAddForm] = useState(false)

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

  const handleAddTodo = async () => {
    if (!newTodoTitle.trim()) {
      toast.error('Please enter a task title')
      return
    }

    try {
      const response = await fetch(`/api/todos/${bookmarkId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTodoTitle.trim(),
          description: newTodoDesc.trim() || null,
          priority: newTodoPriority
        })
      })

      if (response.ok) {
        const newTodo = await response.json()
        setTodos([...todos, newTodo])
        setNewTodoTitle("")
        setNewTodoDesc("")
        setNewTodoPriority('MEDIUM')
        setShowAddForm(false)
        toast.success('Task added!')
      }
    } catch (error) {
      console.error('Error adding todo:', error)
      toast.error('Failed to add task')
    }
  }

  const handleToggleTodo = async (todoId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/todos/${bookmarkId}/${todoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      })

      if (response.ok) {
        const updatedTodo = await response.json()
        setTodos(todos.map(t => t.id === todoId ? updatedTodo : t))
        toast.success(updatedTodo.completed ? 'Task completed!' : 'Task reopened')
      }
    } catch (error) {
      console.error('Error toggling todo:', error)
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTodo = async (todoId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/todos/${bookmarkId}/${todoId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTodos(todos.filter(t => t.id !== todoId))
        toast.success('Task deleted')
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
      toast.error('Failed to delete task')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50'
      case 'LOW': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const completedTodos = todos.filter(t => t.completed).length
  const totalTodos = todos.length
  const progress = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-4">Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header with progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 uppercase">To-Do List</h3>
            <p className="text-sm text-gray-500">
              {completedTodos} of {totalTodos} tasks completed
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Progress bar */}
        {totalTodos > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Add todo form */}
      {showAddForm && (
        <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <Input
            placeholder="Task title..."
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            className="!bg-white border-gray-300"
          />
          <Textarea
            placeholder="Description (optional)..."
            value={newTodoDesc}
            onChange={(e) => setNewTodoDesc(e.target.value)}
            className="!bg-white border-gray-300 min-h-[80px]"
          />
          <div className="flex items-center gap-2">
            <Select value={newTodoPriority} onValueChange={(value: any) => setNewTodoPriority(value)}>
              <SelectTrigger className="w-[150px] !bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low Priority</SelectItem>
                <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                <SelectItem value="HIGH">High Priority</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddTodo} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Add Task
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Todo list */}
      {todos.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-2">No tasks yet</h4>
          <p className="text-sm text-gray-500 mb-4">
            Click "Add Task" to create your first to-do item
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={cn(
                "flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors",
                todo.completed && "opacity-60"
              )}
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => handleToggleTodo(todo.id, todo.completed)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  "font-medium text-gray-900",
                  todo.completed && "line-through"
                )}>
                  {todo.title}
                </h4>
                {todo.description && (
                  <p className="text-sm text-gray-500 mt-1">{todo.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    getPriorityColor(todo.priority)
                  )}>
                    {todo.priority}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteTodo(todo.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
