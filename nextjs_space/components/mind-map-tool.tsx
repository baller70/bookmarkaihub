"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  GitFork, 
  Plus, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Move,
  Circle,
  Save,
  Undo,
  Redo,
  Download,
  Palette
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface MindMapNode {
  id: string
  text: string
  x: number
  y: number
  color: string
  parentId: string | null
  children: string[]
}

interface MindMapToolProps {
  bookmarkId: string
}

const NODE_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F97316", // Orange
]

export function MindMapTool({ bookmarkId }: MindMapToolProps) {
  const [nodes, setNodes] = useState<MindMapNode[]>([
    {
      id: "root",
      text: "Main Idea",
      x: 400,
      y: 250,
      color: "#3B82F6",
      parentId: null,
      children: []
    }
  ])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [history, setHistory] = useState<MindMapNode[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Load mind map data
  useEffect(() => {
    loadMindMap()
  }, [bookmarkId])

  const loadMindMap = async () => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}/mind-map`)
      if (response.ok) {
        const data = await response.json()
        if (data && data.nodes && data.nodes.length > 0) {
          setNodes(data.nodes)
          setHistory([data.nodes])
        }
      }
    } catch (error) {
      console.error("Error loading mind map:", error)
    }
  }

  const saveMindMap = async () => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}/mind-map`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes })
      })
      if (response.ok) {
        toast.success("Mind map saved!")
      }
    } catch (error) {
      toast.error("Failed to save mind map")
    }
  }

  const addToHistory = (newNodes: MindMapNode[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newNodes)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setNodes(history[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setNodes(history[historyIndex + 1])
    }
  }

  const addNode = (parentId: string) => {
    const parent = nodes.find(n => n.id === parentId)
    if (!parent) return

    const newId = `node-${Date.now()}`
    const angle = (parent.children.length * 45 + 45) * (Math.PI / 180)
    const distance = 150
    
    const newNode: MindMapNode = {
      id: newId,
      text: "New Idea",
      x: parent.x + Math.cos(angle) * distance,
      y: parent.y + Math.sin(angle) * distance,
      color: NODE_COLORS[nodes.length % NODE_COLORS.length],
      parentId: parentId,
      children: []
    }

    const newNodes = nodes.map(n => 
      n.id === parentId 
        ? { ...n, children: [...n.children, newId] }
        : n
    )
    newNodes.push(newNode)
    
    setNodes(newNodes)
    addToHistory(newNodes)
    setSelectedNode(newId)
    setEditingNode(newId)
    setEditText("New Idea")
  }

  const deleteNode = (nodeId: string) => {
    if (nodeId === "root") {
      toast.error("Cannot delete root node")
      return
    }

    const nodeToDelete = nodes.find(n => n.id === nodeId)
    if (!nodeToDelete) return

    // Get all descendant IDs
    const getDescendants = (id: string): string[] => {
      const node = nodes.find(n => n.id === id)
      if (!node) return []
      return [id, ...node.children.flatMap(getDescendants)]
    }

    const idsToDelete = getDescendants(nodeId)
    
    const newNodes = nodes
      .filter(n => !idsToDelete.includes(n.id))
      .map(n => ({
        ...n,
        children: n.children.filter(c => !idsToDelete.includes(c))
      }))

    setNodes(newNodes)
    addToHistory(newNodes)
    setSelectedNode(null)
  }

  const updateNodeText = (nodeId: string, text: string) => {
    const newNodes = nodes.map(n =>
      n.id === nodeId ? { ...n, text } : n
    )
    setNodes(newNodes)
    addToHistory(newNodes)
  }

  const updateNodeColor = (nodeId: string, color: string) => {
    const newNodes = nodes.map(n =>
      n.id === nodeId ? { ...n, color } : n
    )
    setNodes(newNodes)
    addToHistory(newNodes)
  }

  const handleNodeDrag = (nodeId: string, deltaX: number, deltaY: number) => {
    const newNodes = nodes.map(n =>
      n.id === nodeId ? { ...n, x: n.x + deltaX, y: n.y + deltaY } : n
    )
    setNodes(newNodes)
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      setSelectedNode(null)
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleCanvasMouseUp = () => {
    if (isDragging) {
      addToHistory(nodes)
    }
    setIsDragging(false)
  }

  const exportAsPNG = () => {
    // Simplified export - would need html2canvas for real implementation
    toast.success("Export feature coming soon!")
  }

  // Draw lines between connected nodes
  const renderConnections = () => {
    return nodes.map(node => {
      if (!node.parentId) return null
      const parent = nodes.find(n => n.id === node.parentId)
      if (!parent) return null

      return (
        <svg
          key={`line-${node.id}`}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <line
            x1={parent.x * zoom + pan.x}
            y1={parent.y * zoom + pan.y}
            x2={node.x * zoom + pan.x}
            y2={node.y * zoom + pan.y}
            stroke={node.color}
            strokeWidth={2}
            strokeOpacity={0.5}
          />
        </svg>
      )
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <GitFork className="h-5 w-5 text-blue-600" />
          <h2 className="font-bold text-lg uppercase">MIND MAP</h2>
          <Badge variant="outline" className="ml-2">
            {nodes.length} nodes
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={undo}
            disabled={historyIndex <= 0}
            className="h-8 w-8 p-0"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="h-8 w-8 p-0"
          >
            <Redo className="h-4 w-4" />
          </Button>
          
          <div className="h-4 w-px bg-gray-300 mx-2" />
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(z => Math.min(z + 0.1, 2))}
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
            onClick={exportAsPNG}
            className="h-8 px-3"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={saveMindMap}
            className="h-8 px-3"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      >
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        />

        {/* Connections */}
        {renderConnections()}

        {/* Nodes */}
        {nodes.map(node => (
          <div
            key={node.id}
            className={cn(
              "absolute transform -translate-x-1/2 -translate-y-1/2 transition-shadow cursor-move",
              selectedNode === node.id && "ring-2 ring-offset-2 ring-blue-500"
            )}
            style={{
              left: node.x * zoom + pan.x,
              top: node.y * zoom + pan.y,
              zIndex: selectedNode === node.id ? 10 : 1
            }}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedNode(node.id)
            }}
            onDoubleClick={(e) => {
              e.stopPropagation()
              setEditingNode(node.id)
              setEditText(node.text)
            }}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("nodeId", node.id)
              e.dataTransfer.effectAllowed = "move"
            }}
            onDrag={(e) => {
              if (e.clientX === 0 && e.clientY === 0) return
              const rect = canvasRef.current?.getBoundingClientRect()
              if (!rect) return
              const newX = (e.clientX - rect.left - pan.x) / zoom
              const newY = (e.clientY - rect.top - pan.y) / zoom
              handleNodeDrag(node.id, newX - node.x, newY - node.y)
            }}
            onDragEnd={() => addToHistory(nodes)}
          >
            <div
              className="px-4 py-2 rounded-xl shadow-lg min-w-[120px] max-w-[200px]"
              style={{ 
                backgroundColor: node.color,
                transform: `scale(${zoom})`
              }}
            >
              {editingNode === node.id ? (
                <Input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => {
                    updateNodeText(node.id, editText)
                    setEditingNode(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateNodeText(node.id, editText)
                      setEditingNode(null)
                    }
                    if (e.key === "Escape") {
                      setEditingNode(null)
                    }
                  }}
                  className="h-6 text-sm bg-white/90 border-0 text-center"
                  autoFocus
                />
              ) : (
                <p className="text-white text-sm font-medium text-center truncate">
                  {node.text}
                </p>
              )}
            </div>
            
            {/* Add child button */}
            {selectedNode === node.id && (
              <button
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  addNode(node.id)
                }}
              >
                <Plus className="h-4 w-4 text-gray-600" />
              </button>
            )}
          </div>
        ))}

        {/* Help text */}
        <div className="absolute bottom-4 left-4 text-xs text-gray-400 space-y-1">
          <p>• Double-click node to edit text</p>
          <p>• Click + button to add child node</p>
          <p>• Drag nodes to reposition</p>
          <p>• Drag canvas to pan</p>
        </div>
      </div>

      {/* Selected node toolbar */}
      {selectedNode && (
        <div className="p-4 border-t bg-white dark:bg-gray-900 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Selected: {nodes.find(n => n.id === selectedNode)?.text}
            </span>
            
            <div className="flex items-center gap-1">
              <Palette className="h-4 w-4 text-gray-400 mr-1" />
              {NODE_COLORS.map(color => (
                <button
                  key={color}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                    nodes.find(n => n.id === selectedNode)?.color === color 
                      ? "border-gray-900 dark:border-white" 
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => updateNodeColor(selectedNode, color)}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => addNode(selectedNode)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Child
            </Button>
            {selectedNode !== "root" && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => deleteNode(selectedNode)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}




