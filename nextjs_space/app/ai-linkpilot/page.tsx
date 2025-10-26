
"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Search, TrendingUp, Zap, Clock, Star } from "lucide-react"
import { useState } from "react"

export default function AILinkPilotPage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    // Simulate AI search - in real app, this would call an AI API
    setTimeout(() => {
      setSuggestions([
        {
          title: "Top Design Resources",
          description: "AI-curated collection of the best design tools and resources",
          count: 12,
          category: "Design",
        },
        {
          title: "Developer Tools",
          description: "Essential tools every developer should bookmark",
          count: 8,
          category: "Development",
        },
        {
          title: "Productivity Apps",
          description: "Apps to boost your productivity and workflow",
          count: 15,
          category: "Productivity",
        },
      ])
      setLoading(false)
    }, 1000)
  }

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI LinkPilot
            </h1>
            <p className="text-gray-600 text-lg">
              Your intelligent bookmark assistant powered by AI
            </p>
          </div>

          {/* Search Section */}
          <Card className="p-6 mb-8">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Ask AI to find, organize, or suggest bookmarks..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="h-12 text-base"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="h-12 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Try: "Find my most visited bookmarks" or "Organize my design tools"
              </p>
            </div>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg">Smart Suggestions</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Get personalized bookmark recommendations based on your interests
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg">Auto-Organize</h3>
              </div>
              <p className="text-gray-600 text-sm">
                AI automatically categorizes and tags your bookmarks
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">Smart Reminders</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Get reminded about bookmarks at the perfect time
              </p>
            </Card>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">AI Suggestions</h2>
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <h3 className="text-xl font-semibold">{suggestion.title}</h3>
                        <Badge variant="outline" className="ml-2">
                          {suggestion.count} bookmarks
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{suggestion.description}</p>
                      <Badge>{suggestion.category}</Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      View Collection
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!suggestions.length && !loading && (
            <Card className="p-12 text-center">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Start Your AI Journey</h3>
              <p className="text-gray-600">
                Ask AI LinkPilot to help you find, organize, or discover new bookmarks
              </p>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
