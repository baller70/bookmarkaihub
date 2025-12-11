"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { 
  PenLine, 
  Plus, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle,
  FileText,
  Mail,
  User,
  Calendar,
  RefreshCw,
  Eye,
  Trash2,
  Download
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SignatureRequest {
  id: string
  documentName: string
  recipientEmail: string
  recipientName: string
  status: "pending" | "signed" | "declined" | "expired"
  sentAt: Date
  signedAt?: Date
  expiresAt?: Date
  message?: string
}

interface ESignaturesToolProps {
  bookmarkId: string
}

export function ESignaturesTool({ bookmarkId }: ESignaturesToolProps) {
  const [requests, setRequests] = useState<SignatureRequest[]>([])
  const [showNewRequest, setShowNewRequest] = useState(false)
  const [newRequest, setNewRequest] = useState({
    documentName: "",
    recipientEmail: "",
    recipientName: "",
    message: "",
    expiresInDays: 7
  })
  const [filter, setFilter] = useState<"all" | "pending" | "signed" | "declined">("all")

  useEffect(() => {
    loadRequests()
  }, [bookmarkId])

  const loadRequests = async () => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}/e-signatures`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data.map((r: any) => ({
          ...r,
          sentAt: new Date(r.sentAt),
          signedAt: r.signedAt ? new Date(r.signedAt) : undefined,
          expiresAt: r.expiresAt ? new Date(r.expiresAt) : undefined
        })))
      }
    } catch (error) {
      console.error("Error loading signature requests:", error)
    }
  }

  const sendRequest = async () => {
    if (!newRequest.documentName || !newRequest.recipientEmail) {
      toast.error("Please fill in all required fields")
      return
    }

    const request: SignatureRequest = {
      id: `sig-${Date.now()}`,
      documentName: newRequest.documentName,
      recipientEmail: newRequest.recipientEmail,
      recipientName: newRequest.recipientName || newRequest.recipientEmail.split("@")[0],
      status: "pending",
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + newRequest.expiresInDays * 24 * 60 * 60 * 1000),
      message: newRequest.message
    }

    setRequests([request, ...requests])
    setShowNewRequest(false)
    setNewRequest({
      documentName: "",
      recipientEmail: "",
      recipientName: "",
      message: "",
      expiresInDays: 7
    })

    toast.success("Signature request sent!")

    // Save to API
    try {
      await fetch(`/api/bookmarks/${bookmarkId}/e-signatures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      })
    } catch (error) {
      console.error("Error saving signature request:", error)
    }
  }

  const deleteRequest = (id: string) => {
    setRequests(requests.filter(r => r.id !== id))
    toast.success("Request deleted")
  }

  const resendRequest = (id: string) => {
    setRequests(requests.map(r =>
      r.id === id ? { ...r, sentAt: new Date() } : r
    ))
    toast.success("Reminder sent!")
  }

  const filteredRequests = requests.filter(r => {
    if (filter === "all") return true
    return r.status === filter
  })

  const getStatusIcon = (status: SignatureRequest["status"]) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-amber-500" />
      case "signed": return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "declined": return <XCircle className="h-4 w-4 text-red-500" />
      case "expired": return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: SignatureRequest["status"]) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700",
      signed: "bg-green-100 text-green-700",
      declined: "bg-red-100 text-red-700",
      expired: "bg-gray-100 text-gray-500"
    }
    return (
      <Badge className={cn("uppercase", styles[status])}>
        {status}
      </Badge>
    )
  }

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    signed: requests.filter(r => r.status === "signed").length,
    declined: requests.filter(r => r.status === "declined").length
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PenLine className="h-5 w-5 text-indigo-600" />
            <h2 className="font-bold text-lg uppercase">E-SIGNATURES</h2>
          </div>
          <Button size="sm" onClick={() => setShowNewRequest(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Request
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <button
            className={cn(
              "p-3 rounded-lg border text-left transition-colors",
              filter === "all" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => setFilter("all")}
          >
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            <div className="text-xs text-gray-500 uppercase">Total</div>
          </button>
          <button
            className={cn(
              "p-3 rounded-lg border text-left transition-colors",
              filter === "pending" ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => setFilter("pending")}
          >
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-xs text-gray-500 uppercase">Pending</div>
          </button>
          <button
            className={cn(
              "p-3 rounded-lg border text-left transition-colors",
              filter === "signed" ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => setFilter("signed")}
          >
            <div className="text-2xl font-bold text-green-600">{stats.signed}</div>
            <div className="text-xs text-gray-500 uppercase">Signed</div>
          </button>
          <button
            className={cn(
              "p-3 rounded-lg border text-left transition-colors",
              filter === "declined" ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => setFilter("declined")}
          >
            <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
            <div className="text-xs text-gray-500 uppercase">Declined</div>
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="flex-1 overflow-auto p-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <PenLine className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">
              NO SIGNATURE REQUESTS
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Send documents for signature and track their status
            </p>
            <Button onClick={() => setShowNewRequest(true)}>
              <Send className="h-4 w-4 mr-2" />
              Send First Request
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map(request => (
              <div
                key={request.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                          {request.documentName}
                        </h4>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {request.recipientName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {request.recipientEmail}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Sent {request.sentAt.toLocaleDateString()}
                        </span>
                        {request.signedAt && (
                          <span className="text-green-600">
                            Signed {request.signedAt.toLocaleDateString()}
                          </span>
                        )}
                        {request.status === "pending" && request.expiresAt && (
                          <span className="text-amber-600">
                            Expires {request.expiresAt.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {request.status === "pending" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => resendRequest(request.id)}
                        className="h-8 w-8 p-0"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    {request.status === "signed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteRequest(request.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Request Dialog */}
      <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="uppercase flex items-center gap-2">
              <Send className="h-5 w-5" />
              Request Signature
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Document Name *
              </label>
              <Input
                placeholder="Contract Agreement"
                value={newRequest.documentName}
                onChange={(e) => setNewRequest({ ...newRequest, documentName: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Recipient Email *
              </label>
              <Input
                type="email"
                placeholder="client@example.com"
                value={newRequest.recipientEmail}
                onChange={(e) => setNewRequest({ ...newRequest, recipientEmail: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Recipient Name
              </label>
              <Input
                placeholder="John Doe"
                value={newRequest.recipientName}
                onChange={(e) => setNewRequest({ ...newRequest, recipientName: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Message (optional)
              </label>
              <Input
                placeholder="Please sign this document..."
                value={newRequest.message}
                onChange={(e) => setNewRequest({ ...newRequest, message: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Expires in (days)
              </label>
              <Input
                type="number"
                min={1}
                max={30}
                value={newRequest.expiresInDays}
                onChange={(e) => setNewRequest({ ...newRequest, expiresInDays: parseInt(e.target.value) || 7 })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRequest(false)}>
              Cancel
            </Button>
            <Button onClick={sendRequest}>
              <Send className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




