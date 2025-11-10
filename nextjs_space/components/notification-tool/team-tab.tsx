
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Users, Trash2, Crown, Shield, Eye } from "lucide-react"
import { toast } from "sonner"

interface TeamMember {
  id: string
  memberEmail: string
  memberName?: string
  role: string
  canEdit: boolean
  canDelete: boolean
  createdAt: string
}

interface TeamTabProps {
  bookmarkId: string
}

export function TeamTab({ bookmarkId }: TeamTabProps) {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  // Form state
  const [memberEmail, setMemberEmail] = useState("")
  const [memberName, setMemberName] = useState("")
  const [role, setRole] = useState("VIEWER")
  const [canEdit, setCanEdit] = useState(false)
  const [canDelete, setCanDelete] = useState(false)

  useEffect(() => {
    fetchTeam()
  }, [bookmarkId])

  const fetchTeam = async () => {
    try {
      const res = await fetch(`/api/notifications/team/${bookmarkId}`)
      if (res.ok) {
        const data = await res.json()
        setTeam(data)
      }
    } catch (error) {
      console.error("Error fetching team:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!memberEmail.trim()) {
      toast.error("Email is required")
      return
    }

    try {
      const res = await fetch(`/api/notifications/team/${bookmarkId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberEmail,
          memberName,
          role,
          canEdit,
          canDelete,
        }),
      })

      if (res.ok) {
        toast.success("Team member added")
        resetForm()
        fetchTeam()
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to add team member")
      }
    } catch (error) {
      console.error("Error adding team member:", error)
      toast.error("An error occurred")
    }
  }

  const handleDelete = async (memberId: string) => {
    if (!confirm("Remove this team member?")) return

    try {
      const res = await fetch(`/api/notifications/team/${bookmarkId}/${memberId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Team member removed")
        fetchTeam()
      } else {
        toast.error("Failed to remove team member")
      }
    } catch (error) {
      console.error("Error removing team member:", error)
      toast.error("An error occurred")
    }
  }

  const resetForm = () => {
    setMemberEmail("")
    setMemberName("")
    setRole("VIEWER")
    setCanEdit(false)
    setCanDelete(false)
    setShowForm(false)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Crown className="w-4 h-4 text-amber-600" />
      case "ADMIN":
        return <Shield className="w-4 h-4 text-blue-600" />
      case "EDITOR":
        return <Shield className="w-4 h-4 text-green-600" />
      case "VIEWER":
        return <Eye className="w-4 h-4 text-gray-600" />
      default:
        return <Eye className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Premium Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-3 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded">
              PREMIUM FEATURE
            </span>
          </div>
          <div>
            <h4 className="font-bold text-amber-900">COLLABORATIVE NOTIFICATIONS</h4>
            <p className="text-sm text-amber-800 mt-1">
              Share bookmark notifications with your team. Upgrade to Premium to invite team members and collaborate on reminders.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold uppercase">TEAM MEMBERS</h3>
          <p className="text-sm text-gray-500">Manage who can view and edit notifications</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          disabled
          className="!bg-gray-300 !text-gray-600 cursor-not-allowed uppercase"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {team.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50 opacity-60">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="font-medium mb-2">NO TEAM MEMBERS</h4>
          <p className="text-sm text-gray-500">
            Upgrade to Premium to invite team members
          </p>
        </div>
      ) : (
        <div className="space-y-2 opacity-60">
          {team.map((member) => (
            <div key={member.id} className="border rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">
                      {member.memberName?.[0] || member.memberEmail[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h5 className="font-bold">{member.memberName || member.memberEmail}</h5>
                    <p className="text-sm text-gray-500">{member.memberEmail}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleIcon(member.role)}
                      <span className="text-xs text-gray-600 uppercase">{member.role}</span>
                      {member.canEdit && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">CAN EDIT</span>
                      )}
                      {member.canDelete && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded">CAN DELETE</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
