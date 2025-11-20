"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Edit2, Save, X } from "lucide-react"
import { toast } from "sonner"

interface QuickNote {
  id: string
  title?: string | null
  content: string
  createdAt: Date
  updatedAt: Date
}

interface QuickNotesToolProps {
  bookmarkId: string
}

export function QuickNotesTool({ bookmarkId }: QuickNotesToolProps) {
  const [notes, setNotes] = useState<QuickNote[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [newNoteContent, setNewNoteContent] = useState("")
  
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")

  useEffect(() => {
    if (bookmarkId) {
      fetchNotes()
    }
  }, [bookmarkId])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/quick-notes/${bookmarkId}`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) {
      toast.error('Please enter note content')
      return
    }

    try {
      const response = await fetch(`/api/quick-notes/${bookmarkId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newNoteTitle.trim() || null,
          content: newNoteContent.trim()
        })
      })

      if (response.ok) {
        const newNote = await response.json()
        setNotes([newNote, ...notes])
        setNewNoteTitle("")
        setNewNoteContent("")
        setShowAddForm(false)
        toast.success('Note created!')
      }
    } catch (error) {
      console.error('Error adding note:', error)
      toast.error('Failed to create note')
    }
  }

  const handleStartEdit = (note: QuickNote) => {
    setEditingNoteId(note.id)
    setEditTitle(note.title || "")
    setEditContent(note.content)
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
    setEditTitle("")
    setEditContent("")
  }

  const handleSaveEdit = async (noteId: string) => {
    if (!editContent.trim()) {
      toast.error('Note content cannot be empty')
      return
    }

    try {
      const response = await fetch(`/api/quick-notes/${bookmarkId}/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim() || null,
          content: editContent.trim()
        })
      })

      if (response.ok) {
        const updatedNote = await response.json()
        setNotes(notes.map(n => n.id === noteId ? updatedNote : n))
        setEditingNoteId(null)
        toast.success('Note updated!')
      }
    } catch (error) {
      console.error('Error updating note:', error)
      toast.error('Failed to update note')
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const response = await fetch(`/api/quick-notes/${bookmarkId}/${noteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotes(notes.filter(n => n.id !== noteId))
        toast.success('Note deleted')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Failed to delete note')
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-4">Loading notes...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 uppercase">Quick Notes</h3>
          <p className="text-sm text-gray-500">{notes.length} notes</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Add note form */}
      {showAddForm && (
        <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <Input
            placeholder="Note title (optional)..."
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            className="!bg-white border-gray-300"
          />
          <Textarea
            placeholder="Start typing your note..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            className="!bg-white border-gray-300 min-h-[120px]"
          />
          <div className="flex gap-2">
            <Button onClick={handleAddNote} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Save Note
            </Button>
            <Button variant="outline" onClick={() => {
              setShowAddForm(false)
              setNewNoteTitle("")
              setNewNoteContent("")
            }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-2">No notes yet</h4>
          <p className="text-sm text-gray-500 mb-4">
            Click "New Note" to create your first note
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              {editingNoteId === note.id ? (
                <div className="space-y-3">
                  <Input
                    placeholder="Note title (optional)..."
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="!bg-white border-gray-300"
                  />
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="!bg-white border-gray-300 min-h-[120px]"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleSaveEdit(note.id)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-3 w-3 mr-2" />
                      Save
                    </Button>
                    <Button 
                      onClick={handleCancelEdit}
                      variant="outline"
                      size="sm"
                    >
                      <X className="h-3 w-3 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    {note.title && (
                      <h4 className="font-medium text-gray-900">{note.title}</h4>
                    )}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStartEdit(note)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteNote(note.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Last updated: {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
