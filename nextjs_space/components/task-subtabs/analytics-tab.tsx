"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, CheckCircle, Clock, Target } from "lucide-react"

interface AnalyticsTabProps {
  bookmarkId: string
}

export function AnalyticsTab({ bookmarkId }: AnalyticsTabProps) {
  const [todos, setTodos] = useState<any[]>([])
  const [taskLists, setTaskLists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (bookmarkId) {
      fetchData()
    }
  }, [bookmarkId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [todosRes, listsRes] = await Promise.all([
        fetch(`/api/todos/${bookmarkId}`),
        fetch(`/api/task-lists/${bookmarkId}`)
      ])

      if (todosRes.ok) {
        const todosData = await todosRes.json()
        setTodos(todosData)
      }

      if (listsRes.ok) {
        const listsData = await listsRes.json()
        setTaskLists(listsData)
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalTasks = todos.length
  const completedTasks = todos.filter(t => t.completed).length
  const pendingTasks = totalTasks - completedTasks
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const highPriorityTasks = todos.filter(t => t.priority === 'HIGH').length
  const mediumPriorityTasks = todos.filter(t => t.priority === 'MEDIUM').length
  const lowPriorityTasks = todos.filter(t => t.priority === 'LOW').length

  const totalLists = taskLists.length
  const totalTasksInLists = taskLists.reduce((sum, list) => sum + (list.items?.length || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Total Tasks</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{totalTasks}</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-green-700">Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{completedTasks}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-700">Pending</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">{pendingTasks}</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">Completion</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{completionRate}%</p>
        </div>
      </div>

      {/* Completion Progress */}
      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 uppercase">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          COMPLETION PROGRESS
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600 uppercase">Overall Progress</span>
            <span className="font-semibold text-gray-900">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase">PRIORITY BREAKDOWN</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-700">High Priority</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{highPriorityTasks}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Medium Priority</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{mediumPriorityTasks}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Low Priority</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{lowPriorityTasks}</span>
          </div>
        </div>
      </div>

      {/* Lists Overview */}
      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase">LISTS OVERVIEW</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Lists</p>
            <p className="text-3xl font-bold text-blue-600">{totalLists}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Tasks in Lists</p>
            <p className="text-3xl font-bold text-purple-600">{totalTasksInLists}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity (Placeholder) */}
      <div className="border rounded-lg p-6 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 uppercase">RECENT ACTIVITY</h3>
        <p className="text-sm text-gray-500">Detailed activity tracking coming soon!</p>
      </div>
    </div>
  )
}
