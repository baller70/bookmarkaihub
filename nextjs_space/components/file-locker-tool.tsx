"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  FolderLock, 
  Plus, 
  Upload,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  Folder,
  Trash2,
  Download,
  Eye,
  Search,
  Grid,
  List,
  MoreVertical
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface LockerFile {
  id: string
  name: string
  type: "file" | "folder"
  mimeType?: string
  size?: number
  parentId: string | null
  uploadedAt: Date
  url?: string
}

interface FileLockerToolProps {
  bookmarkId: string
}

const FILE_ICONS: Record<string, any> = {
  "image": FileImage,
  "video": FileVideo,
  "audio": FileAudio,
  "text": FileText,
  "application/pdf": FileText,
  "default": File
}

const STORAGE_LIMIT = 100 * 1024 * 1024 // 100MB

export function FileLockerTool({ bookmarkId }: FileLockerToolProps) {
  const [files, setFiles] = useState<LockerFile[]>([])
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadFiles()
  }, [bookmarkId])

  const loadFiles = async () => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}/file-locker`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data.map((f: any) => ({
          ...f,
          uploadedAt: new Date(f.uploadedAt)
        })))
      }
    } catch (error) {
      console.error("Error loading files:", error)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = e.target.files
    if (!uploadFiles || uploadFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    const totalFiles = uploadFiles.length
    let completedFiles = 0

    for (const file of Array.from(uploadFiles)) {
      // Check file size
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`)
        continue
      }

      const newFile: LockerFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        type: "file",
        mimeType: file.type,
        size: file.size,
        parentId: currentFolder,
        uploadedAt: new Date(),
        url: URL.createObjectURL(file)
      }

      setFiles(prev => [...prev, newFile])
      completedFiles++
      setUploadProgress((completedFiles / totalFiles) * 100)

      // Save to API
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("parentId", currentFolder || "")

        await fetch(`/api/bookmarks/${bookmarkId}/file-locker`, {
          method: "POST",
          body: formData
        })
      } catch (error) {
        console.error("Error uploading file:", error)
      }
    }

    setIsUploading(false)
    setUploadProgress(0)
    toast.success(`${completedFiles} file(s) uploaded`)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const createFolder = () => {
    const name = prompt("Folder name:")
    if (!name) return

    const newFolder: LockerFile = {
      id: `folder-${Date.now()}`,
      name,
      type: "folder",
      parentId: currentFolder,
      uploadedAt: new Date()
    }

    setFiles([...files, newFolder])
    toast.success("Folder created")
  }

  const deleteFile = (id: string) => {
    // If folder, delete all children
    const file = files.find(f => f.id === id)
    if (!file) return

    if (file.type === "folder") {
      const getDescendants = (parentId: string): string[] => {
        const children = files.filter(f => f.parentId === parentId)
        return children.flatMap(c => [c.id, ...getDescendants(c.id)])
      }
      const idsToDelete = [id, ...getDescendants(id)]
      setFiles(files.filter(f => !idsToDelete.includes(f.id)))
    } else {
      setFiles(files.filter(f => f.id !== id))
    }

    toast.success("Deleted")
  }

  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolder(folderId)
  }

  const getBreadcrumbs = () => {
    const breadcrumbs: { id: string | null; name: string }[] = [{ id: null, name: "Root" }]
    let current = currentFolder
    
    while (current) {
      const folder = files.find(f => f.id === current)
      if (folder) {
        breadcrumbs.splice(1, 0, { id: folder.id, name: folder.name })
        current = folder.parentId
      } else {
        break
      }
    }

    return breadcrumbs
  }

  const currentFiles = files.filter(f => {
    if (f.parentId !== currentFolder) return false
    if (searchQuery) {
      return f.name.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  const totalUsed = files.reduce((acc, f) => acc + (f.size || 0), 0)
  const usagePercent = (totalUsed / STORAGE_LIMIT) * 100

  const getFileIcon = (file: LockerFile) => {
    if (file.type === "folder") return Folder
    if (!file.mimeType) return File
    
    const type = file.mimeType.split("/")[0]
    return FILE_ICONS[file.mimeType] || FILE_ICONS[type] || FILE_ICONS.default
  }

  const formatSize = (bytes?: number) => {
    if (!bytes) return "—"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderLock className="h-5 w-5 text-emerald-600" />
            <h2 className="font-bold text-lg uppercase">FILE LOCKER</h2>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={createFolder}
            >
              <Folder className="h-4 w-4 mr-1" />
              New Folder
            </Button>
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload
            </Button>
          </div>
        </div>

        {/* Storage usage */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500">Storage Used</span>
            <span className="text-gray-700 dark:text-gray-300">
              {formatSize(totalUsed)} / {formatSize(STORAGE_LIMIT)}
            </span>
          </div>
          <Progress value={usagePercent} className="h-2" />
        </div>

        {/* Search & View toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="px-4 py-2 border-b flex items-center gap-2 text-sm">
        {getBreadcrumbs().map((crumb, i, arr) => (
          <div key={crumb.id || "root"} className="flex items-center gap-2">
            <button
              className={cn(
                "hover:text-blue-600 transition-colors",
                i === arr.length - 1 ? "font-semibold text-gray-900 dark:text-white" : "text-gray-500"
              )}
              onClick={() => navigateToFolder(crumb.id)}
            >
              {crumb.name}
            </button>
            {i < arr.length - 1 && <span className="text-gray-300">/</span>}
          </div>
        ))}
      </div>

      {/* Upload progress */}
      {isUploading && (
        <div className="px-4 py-2 border-b bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-3">
            <Upload className="h-4 w-4 text-blue-600 animate-pulse" />
            <Progress value={uploadProgress} className="flex-1 h-2" />
            <span className="text-sm text-blue-600">{Math.round(uploadProgress)}%</span>
          </div>
        </div>
      )}

      {/* Files */}
      <div className="flex-1 overflow-auto p-4">
        {currentFiles.length === 0 ? (
          <div className="text-center py-12">
            <FolderLock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">
              {searchQuery ? "NO FILES FOUND" : "NO FILES YET"}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {searchQuery ? "Try a different search" : "Upload files to keep them organized"}
            </p>
            {!searchQuery && (
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {currentFiles.map(file => {
              const Icon = getFileIcon(file)
              return (
                <div
                  key={file.id}
                  className={cn(
                    "p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer group bg-white dark:bg-gray-800",
                    file.type === "folder" && "hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                  onClick={() => file.type === "folder" && navigateToFolder(file.id)}
                  onDoubleClick={() => file.type === "file" && file.url && window.open(file.url)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center mb-2",
                      file.type === "folder" ? "bg-amber-100 dark:bg-amber-900/30" : "bg-gray-100 dark:bg-gray-700"
                    )}>
                      <Icon className={cn(
                        "h-6 w-6",
                        file.type === "folder" ? "text-amber-600" : "text-gray-500"
                      )} />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate w-full">
                      {file.name}
                    </p>
                    {file.type === "file" && (
                      <p className="text-xs text-gray-400 mt-1">
                        {formatSize(file.size)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {file.type === "file" && file.url && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(file.url)
                          }}
                          className="h-7 w-7 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteFile(file.id)
                      }}
                      className="h-7 w-7 p-0 text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-1">
            {currentFiles.map(file => {
              const Icon = getFileIcon(file)
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-white dark:bg-gray-800"
                  onClick={() => file.type === "folder" && navigateToFolder(file.id)}
                  onDoubleClick={() => file.type === "file" && file.url && window.open(file.url)}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    file.type === "folder" ? "bg-amber-100 dark:bg-amber-900/30" : "bg-gray-100 dark:bg-gray-700"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5",
                      file.type === "folder" ? "text-amber-600" : "text-gray-500"
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {file.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>

                  {file.type === "file" && (
                    <span className="text-sm text-gray-400">
                      {formatSize(file.size)}
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    {file.type === "file" && file.url && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(file.url)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteFile(file.id)
                      }}
                      className="h-8 w-8 p-0 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}




