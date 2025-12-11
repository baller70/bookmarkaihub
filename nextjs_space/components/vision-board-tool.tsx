"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { 
  LayoutGrid, 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  Type,
  Target,
  Quote,
  Save,
  Upload,
  Link2,
  Palette,
  GripVertical,
  X,
  ZoomIn,
  ZoomOut,
  Maximize
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface VisionItem {
  id: string
  type: "image" | "text" | "goal" | "quote"
  content: string
  title?: string
  x: number
  y: number
  width: number
  height: number
  color?: string
  completed?: boolean
}

interface VisionBoardToolProps {
  bookmarkId: string
}

const BOARD_COLORS = [
  "#F3F4F6", // Light Gray
  "#FEF3C7", // Cream
  "#DBEAFE", // Light Blue
  "#D1FAE5", // Light Green
  "#FCE7F3", // Light Pink
  "#EDE9FE", // Light Purple
  "#1F2937", // Dark (for dark mode)
]

const ITEM_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
]

export function VisionBoardTool({ bookmarkId }: VisionBoardToolProps) {
  const [items, setItems] = useState<VisionItem[]>([])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [boardColor, setBoardColor] = useState("#F3F4F6")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addType, setAddType] = useState<VisionItem["type"]>("image")
  const [newItemContent, setNewItemContent] = useState("")
  const [newItemTitle, setNewItemTitle] = useState("")
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const boardRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load vision board data
  useEffect(() => {
    loadVisionBoard()
  }, [bookmarkId])

  const loadVisionBoard = async () => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}/vision-board`)
      if (response.ok) {
        const data = await response.json()
        if (data) {
          if (data.items) setItems(data.items)
          if (data.boardColor) setBoardColor(data.boardColor)
        }
      }
    } catch (error) {
      console.error("Error loading vision board:", error)
    }
  }

  const saveVisionBoard = async () => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}/vision-board`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, boardColor })
      })
      if (response.ok) {
        toast.success("Vision board saved!")
      }
    } catch (error) {
      toast.error("Failed to save vision board")
    }
  }

  const addItem = () => {
    if (!newItemContent.trim() && addType !== "goal") {
      toast.error("Please enter content")
      return
    }

    const newItem: VisionItem = {
      id: `item-${Date.now()}`,
      type: addType,
      content: newItemContent,
      title: newItemTitle,
      x: 50 + Math.random() * 200,
      y: 50 + Math.random() * 200,
      width: addType === "image" ? 200 : 180,
      height: addType === "image" ? 150 : addType === "quote" ? 120 : 100,
      color: ITEM_COLORS[items.length % ITEM_COLORS.length],
      completed: false
    }

    setItems([...items, newItem])
    setShowAddDialog(false)
    setNewItemContent("")
    setNewItemTitle("")
  }

  const deleteItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId))
    setSelectedItem(null)
  }

  const toggleGoalComplete = (itemId: string) => {
    setItems(items.map(i =>
      i.id === itemId ? { ...i, completed: !i.completed } : i
    ))
  }

  const handleDrag = (itemId: string, e: React.DragEvent) => {
    if (e.clientX === 0 && e.clientY === 0) return
    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const newX = (e.clientX - rect.left) / zoom - 100
    const newY = (e.clientY - rect.top) / zoom - 50
    
    setItems(items.map(i =>
      i.id === itemId ? { ...i, x: Math.max(0, newX), y: Math.max(0, newY) } : i
    ))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setNewItemContent(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const getItemIcon = (type: VisionItem["type"]) => {
    switch (type) {
      case "image": return <ImageIcon className="h-4 w-4" />
      case "text": return <Type className="h-4 w-4" />
      case "goal": return <Target className="h-4 w-4" />
      case "quote": return <Quote className="h-4 w-4" />
    }
  }

  return (
    <div className={cn(
      "h-full flex flex-col",
      isFullscreen && "fixed inset-0 z-50 bg-white dark:bg-gray-900"
    )}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-purple-600" />
          <h2 className="font-bold text-lg uppercase">VISION BOARD</h2>
          <Badge variant="outline" className="ml-2">
            {items.length} items
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Board color picker */}
          <div className="flex items-center gap-1 mr-2">
            <Palette className="h-4 w-4 text-gray-400" />
            {BOARD_COLORS.map(color => (
              <button
                key={color}
                className={cn(
                  "w-5 h-5 rounded border-2 transition-transform hover:scale-110",
                  boardColor === color 
                    ? "border-blue-500" 
                    : "border-gray-300"
                )}
                style={{ backgroundColor: color }}
                onClick={() => setBoardColor(color)}
              />
            ))}
          </div>

          <div className="h-4 w-px bg-gray-300 mx-2" />
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <div className="h-4 w-px bg-gray-300 mx-2" />

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 p-0"
          >
            <Maximize className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddDialog(true)}
            className="h-8 px-3"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
          <Button
            size="sm"
            onClick={saveVisionBoard}
            className="h-8 px-3"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Board */}
      <div
        ref={boardRef}
        className="flex-1 relative overflow-auto"
        style={{ backgroundColor: boardColor }}
        onClick={() => setSelectedItem(null)}
      >
        <div
          className="relative min-h-full min-w-full"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            minWidth: "800px",
            minHeight: "600px"
          }}
        >
          {/* Empty state */}
          {items.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <LayoutGrid className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">
                  YOUR VISION BOARD IS EMPTY
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Add images, goals, quotes, and text to visualize your dreams
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            </div>
          )}

          {/* Items */}
          {items.map(item => (
            <div
              key={item.id}
              className={cn(
                "absolute rounded-lg shadow-lg cursor-move transition-shadow overflow-hidden",
                selectedItem === item.id && "ring-2 ring-blue-500 ring-offset-2"
              )}
              style={{
                left: item.x,
                top: item.y,
                width: item.width,
                height: item.height,
                backgroundColor: item.type === "image" ? "transparent" : "white"
              }}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedItem(item.id)
              }}
              draggable
              onDrag={(e) => handleDrag(item.id, e)}
            >
              {/* Image */}
              {item.type === "image" && (
                <img
                  src={item.content}
                  alt={item.title || "Vision board image"}
                  className="w-full h-full object-cover rounded-lg"
                  draggable={false}
                />
              )}

              {/* Text */}
              {item.type === "text" && (
                <div className="p-3 h-full flex flex-col">
                  {item.title && (
                    <h4 className="font-semibold text-sm mb-1 text-gray-900">
                      {item.title}
                    </h4>
                  )}
                  <p className="text-sm text-gray-700 flex-1 overflow-hidden">
                    {item.content}
                  </p>
                </div>
              )}

              {/* Goal */}
              {item.type === "goal" && (
                <div 
                  className={cn(
                    "p-3 h-full flex items-center gap-3 rounded-lg transition-opacity",
                    item.completed && "opacity-60"
                  )}
                  style={{ backgroundColor: item.color }}
                >
                  <button
                    className={cn(
                      "w-6 h-6 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0",
                      item.completed && "bg-white"
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleGoalComplete(item.id)
                    }}
                  >
                    {item.completed && (
                      <Target className="h-4 w-4" style={{ color: item.color }} />
                    )}
                  </button>
                  <span className={cn(
                    "text-white font-medium text-sm",
                    item.completed && "line-through"
                  )}>
                    {item.content || item.title}
                  </span>
                </div>
              )}

              {/* Quote */}
              {item.type === "quote" && (
                <div 
                  className="p-4 h-full flex flex-col justify-center italic rounded-lg"
                  style={{ backgroundColor: item.color + "20", borderLeft: `4px solid ${item.color}` }}
                >
                  <Quote className="h-4 w-4 mb-2" style={{ color: item.color }} />
                  <p className="text-sm text-gray-700">"{item.content}"</p>
                  {item.title && (
                    <p className="text-xs text-gray-500 mt-2 text-right">— {item.title}</p>
                  )}
                </div>
              )}

              {/* Delete button */}
              {selectedItem === item.id && (
                <button
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full shadow-md flex items-center justify-center hover:bg-red-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteItem(item.id)
                  }}
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="uppercase">ADD TO VISION BOARD</DialogTitle>
          </DialogHeader>

          {/* Type selector */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {(["image", "text", "goal", "quote"] as const).map(type => (
              <button
                key={type}
                className={cn(
                  "p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-colors",
                  addType === type 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => setAddType(type)}
              >
                {getItemIcon(type)}
                <span className="text-xs font-medium capitalize">{type}</span>
              </button>
            ))}
          </div>

          {/* Content inputs based on type */}
          <div className="space-y-4">
            {addType === "image" && (
              <>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Button
                    variant="outline"
                    className="w-full h-24 border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center">
                      <Upload className="h-6 w-6 mb-2 text-gray-400" />
                      <span className="text-sm text-gray-500">Upload Image</span>
                    </div>
                  </Button>
                </div>
                <div className="text-center text-sm text-gray-400">or</div>
                <Input
                  placeholder="Paste image URL..."
                  value={newItemContent}
                  onChange={(e) => setNewItemContent(e.target.value)}
                />
                {newItemContent && (
                  <img 
                    src={newItemContent} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
              </>
            )}

            {addType === "text" && (
              <>
                <Input
                  placeholder="Title (optional)"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Your text..."
                  value={newItemContent}
                  onChange={(e) => setNewItemContent(e.target.value)}
                  className="min-h-[100px]"
                />
              </>
            )}

            {addType === "goal" && (
              <Input
                placeholder="Your goal..."
                value={newItemContent}
                onChange={(e) => setNewItemContent(e.target.value)}
              />
            )}

            {addType === "quote" && (
              <>
                <Textarea
                  placeholder="The quote..."
                  value={newItemContent}
                  onChange={(e) => setNewItemContent(e.target.value)}
                  className="min-h-[80px]"
                />
                <Input
                  placeholder="Author (optional)"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                />
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addItem}>
              Add to Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




