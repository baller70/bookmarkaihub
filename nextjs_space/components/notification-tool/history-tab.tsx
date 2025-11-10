
"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"

interface HistoryItem {
  id: string
  sentAt: string
  status: string
  sentVia: string
  errorMessage?: string
  schedule: {
    title: string
    description?: string
  }
}

interface HistoryTabProps {
  bookmarkId: string
}

export function HistoryTab({ bookmarkId }: HistoryTabProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [bookmarkId])

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/notifications/history/${bookmarkId}`)
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (error) {
      console.error("Error fetching history:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SENT":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "FAILED":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "PENDING":
        return <Clock className="w-5 h-5 text-amber-600" />
      case "CANCELLED":
        return <AlertCircle className="w-5 h-5 text-gray-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-green-100 text-green-800"
      case "FAILED":
        return "bg-red-100 text-red-800"
      case "PENDING":
        return "bg-amber-100 text-amber-800"
      case "CANCELLED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold uppercase">NOTIFICATION HISTORY</h3>
        <p className="text-sm text-gray-500">Track all sent notifications</p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="font-medium mb-2">NO HISTORY YET</h4>
          <p className="text-sm text-gray-500">
            Notification history will appear here once reminders are sent
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                {getStatusIcon(item.status)}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-bold">{item.schedule.title}</h5>
                      {item.schedule.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.schedule.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>
                      {new Date(item.sentAt).toLocaleString()}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs uppercase">
                      {item.sentVia}
                    </span>
                  </div>
                  {item.errorMessage && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      {item.errorMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
