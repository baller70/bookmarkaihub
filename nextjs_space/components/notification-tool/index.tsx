
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Timer, Settings, History, Users, Badge } from "lucide-react"
import { SchedulerTab } from "./scheduler-tab"
import { PreferenceTab } from "./preference-tab"
import { HistoryTab } from "./history-tab"
import { TeamTab } from "./team-tab"

interface NotificationToolProps {
  bookmarkId: string
  bookmarkTitle: string
}

export function NotificationTool({ bookmarkId, bookmarkTitle }: NotificationToolProps) {
  const [activeTab, setActiveTab] = useState<"scheduler" | "preference" | "history" | "team">("scheduler")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] min-h-[400px] lg:h-[600px]">
      {/* Sidebar */}
      <div className="border-b lg:border-r lg:border-b-0 bg-gray-50 p-3 sm:p-4">
        <div className="text-xs sm:text-sm font-bold mb-3 hidden lg:block">NOTIFICATION SETTINGS</div>
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible scrollbar-hide">
          <Button
            onClick={() => setActiveTab("scheduler")}
            className={`justify-start text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "scheduler"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            variant={activeTab === "scheduler" ? "default" : "ghost"}
          >
            <Timer className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            SCHEDULER
          </Button>
          <Button
            onClick={() => setActiveTab("preference")}
            variant={activeTab === "preference" ? "default" : "ghost"}
            className={`justify-start text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "preference"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            PREFERENCES
          </Button>
          <Button
            onClick={() => setActiveTab("history")}
            variant={activeTab === "history" ? "default" : "ghost"}
            className={`justify-start text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "history"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <History className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            HISTORY
          </Button>
          <Button
            onClick={() => setActiveTab("team")}
            variant={activeTab === "team" ? "default" : "ghost"}
            className={`justify-start text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "team"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            TEAM
            <span className="ml-auto text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded">Premium</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 overflow-y-auto">
        {activeTab === "scheduler" && <SchedulerTab bookmarkId={bookmarkId} bookmarkTitle={bookmarkTitle} />}
        {activeTab === "preference" && <PreferenceTab bookmarkId={bookmarkId} />}
        {activeTab === "history" && <HistoryTab bookmarkId={bookmarkId} />}
        {activeTab === "team" && <TeamTab bookmarkId={bookmarkId} />}
      </div>
    </div>
  )
}
