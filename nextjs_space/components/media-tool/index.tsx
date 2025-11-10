
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FolderPlus, Image, Video, Music, FileText, Folder, Search, Grid, List } from "lucide-react"
import { toast } from "sonner"

interface MediaFile {
  id: string
  fileName: string
  originalName: string
  fileType: string
  fileSize: number
  mimeType: string
  cloudStoragePath: string
  thumbnailPath?: string
  tags: string[]
  description?: string
  folderId?: string
  folder?: {
    id: string
    name: string
    color: string
  }
  createdAt: string
}

interface MediaFolder {
  id: string
  name: string
  color: string
  _count: {
    media: number
  }
  createdAt: string
}

interface MediaToolProps {
  bookmarkId: string
}

export function MediaTool({ bookmarkId }: MediaToolProps) {
  const [media, setMedia] = useState<MediaFile[]>([])
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    fetchMedia()
    fetchFolders()
  }, [bookmarkId, activeFilter])

  const fetchMedia = async () => {
    try {
      const url = new URL(`/api/media/files/${bookmarkId}`, window.location.origin)
      if (activeFilter) {
        url.searchParams.append("fileType", activeFilter)
      }
      
      const res = await fetch(url.toString())
      if (res.ok) {
        const data = await res.json()
        setMedia(data)
      }
    } catch (error) {
      console.error("Error fetching media:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFolders = async () => {
    try {
      const res = await fetch(`/api/media/folders/${bookmarkId}`)
      if (res.ok) {
        const data = await res.json()
        setFolders(data)
      }
    } catch (error) {
      console.error("Error fetching folders:", error)
    }
  }

  const handleCreateFolder = async () => {
    const name = prompt("Enter folder name:")
    if (!name?.trim()) return

    try {
      const res = await fetch(`/api/media/folders/${bookmarkId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      if (res.ok) {
        toast.success("Folder created")
        fetchFolders()
      } else {
        toast.error("Failed to create folder")
      }
    } catch (error) {
      console.error("Error creating folder:", error)
      toast.error("An error occurred")
    }
  }

  const handleUploadClick = () => {
    toast.info("File upload functionality requires cloud storage configuration")
  }

  const getMediaTypeCount = (type: string) => {
    return media.filter(m => m.fileType === type).length
  }

  const filteredMedia = media.filter(m =>
    m.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "IMAGE":
        return <Image className="w-5 h-5 text-blue-600" />
      case "VIDEO":
        return <Video className="w-5 h-5 text-purple-600" />
      case "AUDIO":
        return <Music className="w-5 h-5 text-green-600" />
      case "DOCUMENT":
        return <FileText className="w-5 h-5 text-orange-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold uppercase">MEDIA HUB</h2>
        <p className="text-sm text-gray-500">Manage your files, documents, and rich content</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { icon: "🖼️", label: "IMAGES", count: getMediaTypeCount("IMAGE"), type: "IMAGE" },
          { icon: "🎥", label: "VIDEOS", count: getMediaTypeCount("VIDEO"), type: "VIDEO" },
          { icon: "🎵", label: "AUDIO", count: getMediaTypeCount("AUDIO"), type: "AUDIO" },
          { icon: "📄", label: "DOCUMENTS", count: getMediaTypeCount("DOCUMENT"), type: "DOCUMENT" },
          { icon: "📁", label: "FOLDERS", count: folders.length, type: null },
        ].map((item) => (
          <div
            key={item.label}
            onClick={() => item.type && setActiveFilter(activeFilter === item.type ? null : item.type)}
            className={`border rounded-lg p-4 sm:p-6 text-center transition-all cursor-pointer ${
              activeFilter === item.type
                ? "border-blue-500 bg-blue-50"
                : "hover:border-blue-500 hover:shadow-md"
            }`}
          >
            <div className="text-4xl mb-2">{item.icon}</div>
            <div className="text-2xl font-bold">{item.count}</div>
            <div className="text-sm text-gray-600 uppercase">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search files, folders, and documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 !bg-white border-gray-300"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              variant="outline"
              className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900"
            >
              {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleUploadClick}
            variant="outline"
            className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900 uppercase"
          >
            <Upload className="w-4 h-4 mr-2" />
            UPLOAD FILES
          </Button>
          <Button
            onClick={handleCreateFolder}
            variant="outline"
            className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900 uppercase"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            NEW FOLDER
          </Button>
        </div>
      </div>

      {/* Folders Section */}
      {folders.length > 0 && !activeFilter && (
        <div>
          <h3 className="font-bold mb-3 uppercase">FOLDERS ({folders.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                style={{ borderColor: folder.color + "40", backgroundColor: folder.color + "10" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Folder className="w-5 h-5" style={{ color: folder.color }} />
                  <span className="font-medium text-sm truncate">{folder.name}</span>
                </div>
                <p className="text-xs text-gray-500">{folder._count.media} files</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Library */}
      <div>
        <h3 className="font-bold mb-3 uppercase">
          MEDIA LIBRARY ({filteredMedia.length})
          {activeFilter && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              - Filtered by {activeFilter}
            </span>
          )}
        </h3>

        {filteredMedia.length === 0 ? (
          <div className="text-center py-16 border rounded-lg">
            <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="font-medium mb-2 uppercase">NO FILES YET</h4>
            <p className="text-sm text-gray-500">
              Upload your first files or create a folder to get started
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredMedia.map((file) => (
              <div key={file.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {file.thumbnailPath ? (
                    <img src={file.thumbnailPath} alt={file.originalName} className="w-full h-full object-cover" />
                  ) : (
                    getFileIcon(file.fileType)
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{file.originalName}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatFileSize(file.fileSize)}</p>
                  {file.folder && (
                    <span className="inline-block mt-2 text-xs px-2 py-1 rounded" style={{ backgroundColor: file.folder.color + "20", color: file.folder.color }}>
                      {file.folder.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg divide-y">
            {filteredMedia.map((file) => (
              <div key={file.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  {getFileIcon(file.fileType)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.originalName}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.fileSize)} • {new Date(file.createdAt).toLocaleDateString()}</p>
                  </div>
                  {file.folder && (
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: file.folder.color + "20", color: file.folder.color }}>
                      {file.folder.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
