"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Share2, 
  Plus, 
  Copy,
  Link2,
  Mail,
  Eye,
  Edit,
  MessageSquare,
  Trash2,
  Check
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SharedUser {
  id: string
  email: string
  name?: string
  permission: "view" | "comment" | "edit"
  sharedAt: Date
}

interface SharingToolProps {
  bookmarkId: string
  bookmarkTitle: string
}

export function SharingTool({ bookmarkId, bookmarkTitle }: SharingToolProps) {
  const [sharedWith, setSharedWith] = useState<SharedUser[]>([])
  const [newEmail, setNewEmail] = useState("")
  const [newPermission, setNewPermission] = useState<"view" | "comment" | "edit">("view")
  const [shareLink, setShareLink] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    loadSharedUsers()
    generateShareLink()
  }, [bookmarkId])

  const loadSharedUsers = async () => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}/sharing`)
      if (response.ok) {
        const data = await response.json()
        setSharedWith(data.map((s: any) => ({
          ...s,
          sharedAt: new Date(s.sharedAt)
        })))
      }
    } catch (error) {
      console.error("Error loading shared users:", error)
    }
  }

  const generateShareLink = () => {
    const link = `${window.location.origin}/shared/${bookmarkId}`
    setShareLink(link)
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    setLinkCopied(true)
    toast.success("Link copied!")
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const shareWithUser = async () => {
    if (!newEmail.trim()) {
      toast.error("Please enter an email")
      return
    }

    const existing = sharedWith.find(s => s.email === newEmail)
    if (existing) {
      toast.error("Already shared with this user")
      return
    }

    const newShare: SharedUser = {
      id: `share-${Date.now()}`,
      email: newEmail,
      permission: newPermission,
      sharedAt: new Date()
    }

    setSharedWith([...sharedWith, newShare])
    setNewEmail("")
    toast.success(`Shared with ${newEmail}!`)
  }

  const updatePermission = (id: string, permission: "view" | "comment" | "edit") => {
    setSharedWith(sharedWith.map(s =>
      s.id === id ? { ...s, permission } : s
    ))
    toast.success("Permission updated")
  }

  const removeShare = (id: string) => {
    setSharedWith(sharedWith.filter(s => s.id !== id))
    toast.success("Access removed")
  }

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case "view": return <Eye className="h-3 w-3" />
      case "comment": return <MessageSquare className="h-3 w-3" />
      case "edit": return <Edit className="h-3 w-3" />
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="h-5 w-5 text-blue-600" />
          <h2 className="font-bold text-lg uppercase">SHARING</h2>
          <Badge variant="outline" className="ml-2">
            {sharedWith.length} people
          </Badge>
        </div>

        {/* Share link */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
            <Link2 className="h-4 w-4" /> Share Link
          </h3>
          <div className="flex gap-2">
            <Input value={shareLink} readOnly className="flex-1 font-mono text-sm" />
            <Button onClick={copyShareLink}>
              {linkCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* Invite people */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
            <Mail className="h-4 w-4" /> Invite People
          </h3>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1"
            />
            <Select value={newPermission} onValueChange={(v) => setNewPermission(v as any)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">Can view</SelectItem>
                <SelectItem value="comment">Can comment</SelectItem>
                <SelectItem value="edit">Can edit</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={shareWithUser}>
              <Plus className="h-4 w-4 mr-1" /> Share
            </Button>
          </div>
        </div>

        {/* Shared with */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
            Shared With
          </h3>
          
          {sharedWith.length === 0 ? (
            <div className="text-center py-8">
              <Share2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Not shared with anyone yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sharedWith.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-white dark:bg-gray-800"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      Shared {user.sharedAt.toLocaleDateString()}
                    </p>
                  </div>
                  <Select
                    value={user.permission}
                    onValueChange={(v) => updatePermission(user.id, v as any)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">Can view</SelectItem>
                      <SelectItem value="comment">Can comment</SelectItem>
                      <SelectItem value="edit">Can edit</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeShare(user.id)}
                    className="h-8 w-8 p-0 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}




