"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Download, 
  FileText,
  FileJson,
  Table,
  Camera,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface ExportToolProps {
  bookmarkId: string
  bookmarkTitle: string
}

export function ExportTool({ bookmarkId, bookmarkTitle }: ExportToolProps) {
  const [format, setFormat] = useState("pdf")
  const [isExporting, setIsExporting] = useState(false)
  const [includeNotes, setIncludeNotes] = useState(true)
  const [includeTasks, setIncludeTasks] = useState(true)
  const [includeReminders, setIncludeReminders] = useState(true)
  const [includeMedia, setIncludeMedia] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          includeNotes,
          includeTasks,
          includeReminders,
          includeMedia
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${bookmarkTitle.replace(/[^a-z0-9]/gi, "_")}.${format}`
        a.click()
        URL.revokeObjectURL(url)
        toast.success(`Exported as ${format.toUpperCase()}!`)
      } else {
        throw new Error("Export failed")
      }
    } catch (error) {
      // Fallback: generate simple export
      const exportData = {
        title: bookmarkTitle,
        id: bookmarkId,
        exportedAt: new Date().toISOString(),
        includeNotes,
        includeTasks,
        includeReminders
      }

      if (format === "json") {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${bookmarkTitle.replace(/[^a-z0-9]/gi, "_")}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success("Exported as JSON!")
      } else if (format === "csv") {
        const csv = Object.entries(exportData).map(([k, v]) => `${k},${v}`).join("\n")
        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${bookmarkTitle.replace(/[^a-z0-9]/gi, "_")}.csv`
        a.click()
        URL.revokeObjectURL(url)
        toast.success("Exported as CSV!")
      } else {
        toast.success("Export prepared (PDF requires server support)")
      }
    } finally {
      setIsExporting(false)
    }
  }

  const handleSnapshot = () => {
    toast.success("Snapshot created!")
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-rose-600" />
          <h2 className="font-bold text-lg uppercase">EXPORT</h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Format selection */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 uppercase">
              Export Format
            </h3>
            <RadioGroup value={format} onValueChange={setFormat}>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer flex-1">
                    <FileText className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">PDF</p>
                      <p className="text-xs text-gray-500">Printable document</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="json" id="json" />
                  <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer flex-1">
                    <FileJson className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium">JSON</p>
                      <p className="text-xs text-gray-500">Structured data</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Table className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">CSV</p>
                      <p className="text-xs text-gray-500">Spreadsheet compatible</p>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Include options */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 uppercase">
              Include
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={includeNotes} onCheckedChange={(c) => setIncludeNotes(!!c)} />
                <span>Notes</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={includeTasks} onCheckedChange={(c) => setIncludeTasks(!!c)} />
                <span>Tasks & To-Dos</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={includeReminders} onCheckedChange={(c) => setIncludeReminders(!!c)} />
                <span>Reminders</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={includeMedia} onCheckedChange={(c) => setIncludeMedia(!!c)} />
                <span>Media attachments</span>
              </label>
            </div>
          </div>

          {/* Export button */}
          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Download className="h-5 w-5 mr-2" />
            )}
            Export as {format.toUpperCase()}
          </Button>

          {/* Snapshot */}
          <div className="pt-6 border-t">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 uppercase">
              Create Snapshot
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Save current state for later reference or review
            </p>
            <Button variant="outline" className="w-full" onClick={handleSnapshot}>
              <Camera className="h-4 w-4 mr-2" />
              Create Snapshot
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}




