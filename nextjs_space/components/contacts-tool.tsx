"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  Plus, 
  Search,
  Mail,
  Phone,
  Building,
  Briefcase,
  Trash2,
  Edit,
  User,
  Star,
  ExternalLink,
  Copy
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  role?: string
  type: "client" | "vendor" | "partner" | "team" | "other"
  notes?: string
  isFavorite: boolean
  createdAt: Date
}

interface ContactsToolProps {
  bookmarkId: string
}

const TYPE_COLORS = {
  client: "bg-blue-100 text-blue-700",
  vendor: "bg-purple-100 text-purple-700",
  partner: "bg-green-100 text-green-700",
  team: "bg-amber-100 text-amber-700",
  other: "bg-gray-100 text-gray-700"
}

export function ContactsTool({ bookmarkId }: ContactsToolProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [showDialog, setShowDialog] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    type: "other" as Contact["type"],
    notes: ""
  })

  useEffect(() => {
    loadContacts()
  }, [bookmarkId])

  const loadContacts = async () => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}/contacts`)
      if (response.ok) {
        const data = await response.json()
        setContacts(data.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt)
        })))
      }
    } catch (error) {
      console.error("Error loading contacts:", error)
    }
  }

  const saveContact = async () => {
    if (!formData.name) {
      toast.error("Name is required")
      return
    }

    const contact: Contact = {
      id: editingContact?.id || `contact-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      role: formData.role,
      type: formData.type,
      notes: formData.notes,
      isFavorite: editingContact?.isFavorite || false,
      createdAt: editingContact?.createdAt || new Date()
    }

    if (editingContact) {
      setContacts(contacts.map(c => c.id === editingContact.id ? contact : c))
      toast.success("Contact updated!")
    } else {
      setContacts([contact, ...contacts])
      toast.success("Contact added!")
    }

    resetForm()

    // Save to API
    try {
      await fetch(`/api/bookmarks/${bookmarkId}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact)
      })
    } catch (error) {
      console.error("Error saving contact:", error)
    }
  }

  const deleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id))
    toast.success("Contact deleted")
  }

  const toggleFavorite = (id: string) => {
    setContacts(contacts.map(c =>
      c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
    ))
  }

  const editContact = (contact: Contact) => {
    setFormData({
      name: contact.name,
      email: contact.email || "",
      phone: contact.phone || "",
      company: contact.company || "",
      role: contact.role || "",
      type: contact.type,
      notes: contact.notes || ""
    })
    setEditingContact(contact)
    setShowDialog(true)
  }

  const resetForm = () => {
    setShowDialog(false)
    setEditingContact(null)
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      role: "",
      type: "other",
      notes: ""
    })
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
  }

  const filteredContacts = contacts
    .filter(c => {
      if (filterType !== "all" && c.type !== filterType) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          c.name.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.company?.toLowerCase().includes(query)
        )
      }
      return true
    })
    .sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1
      return a.name.localeCompare(b.name)
    })

  const stats = {
    total: contacts.length,
    clients: contacts.filter(c => c.type === "client").length,
    team: contacts.filter(c => c.type === "team").length,
    favorites: contacts.filter(c => c.isFavorite).length
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-600" />
            <h2 className="font-bold text-lg uppercase">CONTACTS</h2>
            <Badge variant="outline" className="ml-2">
              {stats.total} contacts
            </Badge>
          </div>
          <Button size="sm" onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Contact
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="client">Clients</SelectItem>
              <SelectItem value="vendor">Vendors</SelectItem>
              <SelectItem value="partner">Partners</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-auto p-4">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">
              {searchQuery || filterType !== "all" ? "NO CONTACTS FOUND" : "NO CONTACTS YET"}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {searchQuery || filterType !== "all"
                ? "Try adjusting your search or filter"
                : "Add stakeholders and contacts for this bookmark"}
            </p>
            {!searchQuery && filterType === "all" && (
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Contact
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredContacts.map(contact => (
              <div
                key={contact.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg font-bold">
                      {contact.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {contact.name}
                          </h4>
                          {contact.isFavorite && (
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        {(contact.role || contact.company) && (
                          <p className="text-sm text-gray-500">
                            {contact.role}
                            {contact.role && contact.company && " at "}
                            {contact.company}
                          </p>
                        )}
                      </div>
                      <Badge className={cn("text-xs uppercase", TYPE_COLORS[contact.type])}>
                        {contact.type}
                      </Badge>
                    </div>

                    <div className="mt-3 space-y-1">
                      {contact.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{contact.email}</span>
                          <button
                            className="opacity-0 group-hover:opacity-100 hover:text-blue-600"
                            onClick={() => copyToClipboard(contact.email!, "Email")}
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="h-3 w-3" />
                          <span>{contact.phone}</span>
                          <button
                            className="opacity-0 group-hover:opacity-100 hover:text-blue-600"
                            onClick={() => copyToClipboard(contact.phone!, "Phone")}
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleFavorite(contact.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Star className={cn(
                          "h-4 w-4",
                          contact.isFavorite ? "text-amber-500 fill-amber-500" : "text-gray-400"
                        )} />
                      </Button>
                      {contact.email && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => window.open(`mailto:${contact.email}`)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => editContact(contact)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteContact(contact.id)}
                        className="h-8 w-8 p-0 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={resetForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="uppercase flex items-center gap-2">
              <User className="h-5 w-5" />
              {editingContact ? "Edit Contact" : "New Contact"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Name *
              </label>
              <Input
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Phone
                </label>
                <Input
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Company
                </label>
                <Input
                  placeholder="Acme Inc."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Role
                </label>
                <Input
                  placeholder="Product Manager"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Type
              </label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="team">Team Member</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Notes
              </label>
              <Textarea
                placeholder="Add notes about this contact..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={saveContact}>
              {editingContact ? "Update" : "Add"} Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




