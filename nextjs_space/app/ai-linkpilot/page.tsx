
"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Search, TrendingUp, Zap, Clock, Star, ExternalLink, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import Image from "next/image"

export default function AILinkPilotPage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [organizing, setOrganizing] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchSummary, setSearchSummary] = useState("")
  const [mode, setMode] = useState<"suggest" | "search">("search")

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    setSearchResults([])
    setSearchSummary("")
    setSuggestions([])
    setMode("search")
    
    try {
      const response = await fetch('/api/ai-linkpilot/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) throw new Error('Search failed')
      
      const data = await response.json()
      setSearchResults(data.results || [])
      setSearchSummary(data.summary || '')
      
      if (data.results?.length === 0) {
        toast.info('No matching bookmarks found')
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Failed to search bookmarks')
    } finally {
      setLoading(false)
    }
  }

  const handleSuggest = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    setSuggestions([])
    setSearchResults([])
    setMode("suggest")
    
    try {
      const response = await fetch('/api/ai-linkpilot/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let partialRead = ''

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        partialRead += decoder.decode(value, { stream: true })
        let lines = partialRead.split('\n')
        partialRead = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              return
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.status === 'completed') {
                setSuggestions(parsed.result.suggestions || [])
                setLoading(false)
                return
              } else if (parsed.status === 'error') {
                throw new Error(parsed.message || 'Suggestion failed')
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Suggest error:', error)
      toast.error('Failed to generate suggestions')
    } finally {
      setLoading(false)
    }
  }

  const handleAutoOrganize = async () => {
    if (organizing) return
    
    setOrganizing(true)
    toast.info('Starting auto-organization...')
    
    try {
      const response = await fetch('/api/ai-linkpilot/auto-organize', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Auto-organize failed')
      
      const data = await response.json()
      toast.success(data.message)
      
      if (data.organized > 0) {
        // Optionally refresh or show organized bookmarks
      }
    } catch (error) {
      console.error('Auto-organize error:', error)
      toast.error('Failed to auto-organize bookmarks')
    } finally {
      setOrganizing(false)
    }
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
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Search
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleSuggest}
                  disabled={loading}
                  variant="outline"
                  className="h-12 px-8"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Suggest
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

            <Card 
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={handleAutoOrganize}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg">Auto-Organize</h3>
              </div>
              <p className="text-gray-600 text-sm">
                {organizing ? 'Organizing...' : 'AI automatically categorizes and tags your bookmarks'}
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">Smart Search</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Find bookmarks using natural language queries
              </p>
            </Card>
          </div>

          {/* Search Results */}
          {mode === "search" && searchResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Search Results</h2>
                <Badge variant="secondary">{searchResults.length} found</Badge>
              </div>
              {searchSummary && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <p className="text-sm text-blue-900">{searchSummary}</p>
                </Card>
              )}
              <div className="grid gap-4">
                {searchResults.map((result: any, index: number) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="relative w-12 h-12 flex-shrink-0">
                        {result.favicon ? (
                          <Image
                            src={result.favicon}
                            alt=""
                            fill
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ExternalLink className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-1">{result.title}</h3>
                            <p className="text-sm text-gray-500 mb-2 truncate">{result.url}</p>
                          </div>
                          <Badge variant="outline" className="flex-shrink-0">
                            {Math.round((result.relevanceScore || 0) * 100)}% match
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-gray-600 mb-3">{result.description}</p>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          {result.category && (
                            <Badge>{result.category}</Badge>
                          )}
                          {result.tags?.map((tag: string, i: number) => (
                            <Badge key={i} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                        {result.reasoning && (
                          <p className="text-sm text-blue-600 italic">💡 {result.reasoning}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(result.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {mode === "suggest" && suggestions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">AI Suggestions</h2>
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <h3 className="text-xl font-semibold">{suggestion.title}</h3>
                        <Badge variant="outline" className="ml-2">
                          {suggestion.bookmarks?.length || 0} bookmarks
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{suggestion.description}</p>
                      <Badge className="mb-3">{suggestion.category}</Badge>
                      {suggestion.reasoning && (
                        <p className="text-sm text-blue-600 italic mt-2">
                          💡 {suggestion.reasoning}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!suggestions.length && !searchResults.length && !loading && (
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
