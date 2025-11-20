
'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { DashboardAuth } from '@/components/dashboard-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Search as SearchIcon, History, Sparkles, Filter, X, Clock } from 'lucide-react'
import type { SearchHistoryItem } from '@/lib/types'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showAiAssist, setShowAiAssist] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/dna-profile/search-history')
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (error) {
      console.error('Failed to load search history')
    }
  }

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      // Search bookmarks
      const res = await fetch(`/api/bookmarks?search=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.bookmarks || [])
        
        // Save to history
        await fetch('/api/dna-profile/search-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            results: data.bookmarks?.length || 0
          })
        })
        
        fetchHistory()
      }
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = async () => {
    try {
      const res = await fetch('/api/dna-profile/search-history', { method: 'DELETE' })
      if (res.ok) {
        toast.success('History cleared')
        setHistory([])
        setShowHistory(false)
      }
    } catch (error) {
      toast.error('Failed to clear history')
    }
  }

  const suggestions = [
    'Show me my most visited bookmarks',
    'Find articles about AI',
    'Search for bookmarks added last week',
    'Show bookmarks in Development category'
  ]

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-6 p-6">
          <h1 className="text-3xl font-bold uppercase">SEARCH</h1>

          {/* Search Bar */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search your bookmarks..."
                    className="pl-10 pr-4 h-12 text-lg"
                  />
                </div>
                <Button size="lg" onClick={handleSearch} disabled={loading}>
                  <SearchIcon className="w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline">
                  <Filter className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Dialog open={showHistory} onOpenChange={setShowHistory}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <History className="w-4 h-4 mr-2" />
                      History
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center justify-between">
                        <span>Search History</span>
                        <Button variant="ghost" size="sm" onClick={clearHistory}>
                          Clear All
                        </Button>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {history.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted"
                          onClick={() => {
                            setQuery(item.query)
                            setShowHistory(false)
                          }}
                        >
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium">{item.query}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.results} results • {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      {history.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No search history yet
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showAiAssist} onOpenChange={setShowAiAssist}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Assist
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>AI Search Assistant</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Try these AI-powered search suggestions:
                      </p>
                      <div className="space-y-2">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors"
                            onClick={() => {
                              setQuery(suggestion)
                              setShowAiAssist(false)
                            }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Searching...</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold uppercase">{results.length} Results</h2>
                <Button variant="ghost" size="sm" onClick={() => setResults([])}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Results
                </Button>
              </div>
              
              {results.map(bookmark => (
                <Card key={bookmark.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {bookmark.favicon ? (
                          <img src={bookmark.favicon} alt="" className="w-8 h-8" />
                        ) : (
                          <div className="w-8 h-8 bg-primary/10 rounded" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{bookmark.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{bookmark.url}</p>
                        {bookmark.description && (
                          <p className="text-sm text-muted-foreground mb-3">{bookmark.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          {bookmark.categories?.map((cat: any) => (
                            <Badge key={cat.categoryId} variant="secondary">
                              {cat.category.name}
                            </Badge>
                          ))}
                          {bookmark.tags?.map((tag: any) => (
                            <Badge key={tag.tagId} variant="outline">
                              {tag.tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {bookmark.totalVisits} visits
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">NO RESULTS FOUND</h3>
                <p className="text-muted-foreground">Try adjusting your search query</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
