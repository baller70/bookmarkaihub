
"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookmarkDetailModal } from "@/components/bookmark-detail-modal"
import { Bookmark, TrendingUp, Folder } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookmarkListCardProps {
  bookmark: any
  onUpdate: () => void
}

const priorityColors = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800", 
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
}

export function BookmarkListCard({ bookmark, onUpdate }: BookmarkListCardProps) {
  const [showDetail, setShowDetail] = useState(false)

  // Calculate engagement percentage
  const engagementPercentage = bookmark.usagePercentage || (bookmark.visitCount * 1) || 0

  // Check if visits increased recently (for trending indicator)
  const hasTrendingVisits = (bookmark.visitCount || 0) > 0

  return (
    <>
      <Card 
        className={cn(
          "group relative overflow-hidden cursor-pointer transition-all duration-200",
          "border-2 border-gray-200 hover:border-blue-500",
          "bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20",
          "rounded-xl"
        )}
        onClick={() => setShowDetail(true)}
      >
        {/* Background Logo - Faint watermark */}
        {bookmark.favicon && (
          <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end pr-12 pointer-events-none overflow-hidden">
            <div className="relative w-full h-full">
              <Image
                src={bookmark.favicon}
                alt=""
                fill
                className="opacity-[0.08] object-cover"
                style={{ filter: 'grayscale(20%)' }}
                unoptimized
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="relative flex items-start p-6 gap-6">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <div className="relative w-14 h-14 bg-black rounded-lg overflow-hidden shadow-sm border-2 border-gray-200">
              {bookmark.favicon ? (
                <Image
                  src={bookmark.favicon}
                  alt={bookmark.title}
                  fill
                  className="object-cover p-2"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                  {bookmark.title?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
          
          {/* Middle: Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title and Priority Badge */}
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight font-audiowide">
                {bookmark.title}
              </h3>
              <Badge 
                className={cn(
                  "text-xs px-2 py-0.5 rounded font-medium",
                  priorityColors[bookmark.priority as keyof typeof priorityColors] || "bg-yellow-100 text-yellow-800"
                )}
              >
                {bookmark.priority?.toLowerCase() || "medium"}
              </Badge>
            </div>

            {/* Category Tag */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Folder className="h-4 w-4" />
              <span className="font-medium">{bookmark.category?.name || "Uncategorized"}</span>
            </div>

            {/* URL */}
            <a 
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              {bookmark.url?.replace(/^https?:\/\/(www\.)?/, '')}
            </a>

            {/* Description */}
            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed font-saira">
              {bookmark.description || "No description available"}
            </p>

            {/* Visit Count */}
            <div className="flex items-center gap-2 pt-1">
              <Bookmark className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {bookmark.visitCount || 0} VISITS
              </span>
              {hasTrendingVisits && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                </div>
              )}
              {bookmark.visitCount > 5 && (
                <TrendingUp className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>

          {/* Right: Engagement Percentage */}
          <div className="flex-shrink-0 flex items-center">
            <div className="relative">
              <svg width="70" height="70" viewBox="0 0 70 70" className="transform">
                <polygon 
                  points="35,8 58,21 58,49 35,62 12,49 12,21" 
                  fill="none" 
                  stroke="#EF4444" 
                  strokeWidth="2.5"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-red-500 font-audiowide">
                  {engagementPercentage.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/10 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-100/10 rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/3" />
        </div>
      </Card>

      {/* Bookmark Detail Modal */}
      <BookmarkDetailModal
        bookmark={bookmark}
        open={showDetail}
        onOpenChange={setShowDetail}
        onUpdate={onUpdate}
      />
    </>
  )
}
