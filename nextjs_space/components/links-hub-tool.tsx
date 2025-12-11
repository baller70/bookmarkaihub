"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Link2, 
  Plus, 
  ExternalLink,
  Trash2,
  Star,
  Clock,
  Folder
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface RelatedLink {
  id: string
  url: string
  title: string
  category: string
  isPinned: boolean
  lastVisited?: Date
  createdAt: Date
}

interface LinksHubToolProps {
  bookmarkId: string
}

const CATEGORIES = ["Docs", "GitHub", "Figma", "Jira", "PR", "Other"]

export function LinksHubTool({ bookmarkId }: LinksHubToolProps) {
  const [links, setLinks] = useState<RelatedLink[]>([])
  const [newUrl, setNewUrl] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [newCategory, setNewCategory] = useState("Other")

  useEffect(() => {
    loadLinks()
  }, [bookmarkId])

  const loadLinks = async () => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}/links-hub`)
      if (response.ok) {
        const data = await response.json()
        setLinks(data.map((l: any) => ({
          ...l,
          createdAt: new Date(l.createdAt),
          lastVisited: l.lastVisited ? new Date(l.lastVisited) : undefined
        })))
      }
    } catch (error) {
      console.error("Error loading links:", error)
    }
  }

  const addLink = async () => {
    if (!newUrl.trim()) {
      toast.error("Please enter a URL")
      return
    }

    const link: RelatedLink = {
      id: `link-${Date.now()}`,
      url: newUrl.startsWith("http") ? newUrl : `https://${newUrl}`,
      title: newTitle || new URL(newUrl.startsWith("http") ? newUrl : `https://${newUrl}`).hostname,
      category: newCategory,
      isPinned: false,
      createdAt: new Date()
    }

    setLinks([link, ...links])
    setNewUrl("")
    setNewTitle("")
    toast.success("Link added!")
  }

  const deleteLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id))
    toast.success("Link removed")
  }

  const togglePin = (id: string) => {
    setLinks(links.map(l =>
      l.id === id ? { ...l, isPinned: !l.isPinned } : l
    ))
  }

  const visitLink = (link: RelatedLink) => {
    setLinks(links.map(l =>
      l.id === link.id ? { ...l, lastVisited: new Date() } : l
    ))
    window.open(link.url, "_blank")
  }

  const sortedLinks = [...links].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  const groupedLinks = sortedLinks.reduce((acc, link) => {
    if (!acc[link.category]) acc[link.category] = []
    acc[link.category].push(link)
    return acc
  }, {} as Record<string, RelatedLink[]>)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="h-5 w-5 text-sky-600" />
          <h2 className="font-bold text-lg uppercase">LINKS HUB</h2>
          <Badge variant="outline" className="ml-2">{links.length} links</Badge>
        </div>

        {/* Add new link */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="URL"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Title (optional)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-32"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 h-10 rounded-md border px-3 text-sm"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Button onClick={addLink}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>
      </div>

      {/* Links list */}
      <div className="flex-1 overflow-auto p-4">
        {links.length === 0 ? (
          <div className="text-center py-12">
            <Link2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">NO LINKS YET</h3>
            <p className="text-sm text-gray-400">Add related links and references</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                  <Folder className="h-4 w-4" /> {category}
                </h3>
                <div className="space-y-2">
                  {categoryLinks.map(link => (
                    <div
                      key={link.id}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-white dark:bg-gray-800 hover:shadow-sm"
                    >
                      <button onClick={() => togglePin(link.id)}>
                        <Star className={cn(
                          "h-4 w-4",
                          link.isPinned ? "text-amber-500 fill-amber-500" : "text-gray-300"
                        )} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {link.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{link.url}</p>
                      </div>
                      {link.lastVisited && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {link.lastVisited.toLocaleDateString()}
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => visitLink(link)}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteLink(link.id)}
                        className="h-8 w-8 p-0 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}




