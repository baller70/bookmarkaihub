
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { RefreshCw, Download, Heart, Grid3x3, List, LayoutGrid, Folder, Eye, TrendingUp, ArrowUpDown, Calendar, FileText, Filter } from 'lucide-react'
import { ViewMode, SortOption, FavoriteStats } from '@/lib/types'

type Bookmark = {
  id: string
  title: string
  url: string
  favicon?: string
  description?: string
  totalVisits: number
  lastVisited?: Date
  createdAt: Date
  categories: any[]
  tags: any[]
}

export default function FavoritesView() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('lastUpdated')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [minVisits, setMinVisits] = useState<number>(0)
  const [recency, setRecency] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dna-profile/favorites')
      if (res.ok) {
        const data = await res.json()
        setFavorites(data.favorites)
      } else {
        toast.error('Failed to load favorites')
      }
    } catch (error) {
      toast.error('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  const exportFavorites = () => {
    const csv = ['Title,URL,Visits,Last Visited',
      ...favorites.map(b => `"${b.title}","${b.url}",${b.totalVisits},"${b.lastVisited || 'N/A'}"`)
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'favorites.csv'
    a.click()
    toast.success('Favorites exported!')
  }

  // Analytics tied strictly to the favorites in this section
  const computedStats: FavoriteStats = (() => {
    if (!favorites || favorites.length === 0) {
      return {
        totalFavorites: 0,
        totalVisits: 0,
        avgVisits: 0,
        mostVisited: { title: 'N/A', visits: 0 }
      }
    }
    const totalFavorites = favorites.length
    const totalVisits = favorites.reduce((sum, f) => sum + (f.totalVisits || 0), 0)
    const avgVisits = Math.round(totalVisits / totalFavorites) || 0
    const mostVisitedBookmark = favorites
      .slice()
      .sort((a, b) => (b.totalVisits || 0) - (a.totalVisits || 0))[0]

    return {
      totalFavorites,
      totalVisits,
      avgVisits,
      mostVisited: {
        title: mostVisitedBookmark?.title || 'N/A',
        visits: mostVisitedBookmark?.totalVisits || 0
      }
    }
  })()

  const applyFilters = (items: Bookmark[]) => {
    const now = Date.now()
    return items.filter((bookmark) => {
      if (filterCategory !== 'all') {
        const cat = bookmark.categories?.[0]?.category?.name || 'Uncategorized'
        if (cat !== filterCategory) return false
      }
      if (minVisits > 0 && (bookmark.totalVisits || 0) < minVisits) return false
      if (recency !== 'all' && bookmark.lastVisited) {
        const days = parseInt(recency, 10)
        const diffDays = (now - new Date(bookmark.lastVisited).getTime()) / (1000 * 60 * 60 * 24)
        if (diffDays > days) return false
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        if (
          !bookmark.title.toLowerCase().includes(term) &&
          !bookmark.url.toLowerCase().includes(term)
        ) {
          return false
        }
      }
      return true
    })
  }

  const filteredFavorites = applyFilters(favorites)

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'mostVisited':
        comparison = b.totalVisits - a.totalVisits
        break
      case 'lastUpdated':
        comparison = new Date(b.lastVisited || 0).getTime() - new Date(a.lastVisited || 0).getTime()
        break
      case 'dateAdded':
        comparison = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        break
      case 'folder':
        comparison =
          (a.categories?.[0]?.category?.name || 'Uncategorized').localeCompare(
            b.categories?.[0]?.category?.name || 'Uncategorized'
          )
        break
      default:
        return 0
    }
    return sortOrder === 'desc' ? comparison : -comparison
  })

  const formatDate = (date?: Date) => {
    if (!date) return 'Never'
    const d = new Date(date)
    const month = d.toLocaleString('en', { month: 'short' })
    const day = d.getDate()
    const year = d.getFullYear()
    return `${month} ${day}, ${year}`
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading favorites...</div>
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-tight uppercase">Favorites</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {favorites.length} {favorites.length === 1 ? 'bookmark' : 'bookmarks'} marked as favorite
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchFavorites} className="bg-white border-gray-300 text-gray-700 hover:!bg-gray-100 hover:!text-gray-900">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportFavorites} className="bg-white border-gray-300 text-gray-700 hover:!bg-gray-100 hover:!text-gray-900">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900 uppercase">{computedStats.totalFavorites}</div>
                <div className="text-sm text-gray-600 mt-1">
                  Bookmarks marked as favorite
                </div>
              </div>
              <div className="p-3 rounded-lg bg-red-50 flex-shrink-0">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900 uppercase">{computedStats.totalVisits}</div>
                <div className="text-sm text-gray-600 mt-1">
                  Combined visits to favorites
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 flex-shrink-0">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900 uppercase">{computedStats.avgVisits}</div>
                <div className="text-sm text-gray-600 mt-1">
                  Average visits per favorite
                </div>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">View:</span>
          <div className="flex gap-1">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode !== 'grid' ? 'bg-white border-gray-300 text-gray-700 hover:!bg-gray-100 hover:!text-gray-900' : ''}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode !== 'list' ? 'bg-white border-gray-300 text-gray-700 hover:!bg-gray-100 hover:!text-gray-900' : ''}`}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'compact' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('compact')}
              className={`p-2 ${viewMode !== 'compact' ? 'bg-white border-gray-300 text-gray-700 hover:!bg-gray-100 hover:!text-gray-900' : ''}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'folder' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('folder')}
              className={`p-2 ${viewMode !== 'folder' ? 'bg-white border-gray-300 text-gray-700 hover:!bg-gray-100 hover:!text-gray-900' : ''}`}
            >
              <Folder className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white border-gray-300 text-gray-700 hover:!bg-gray-100 hover:!text-gray-900 gap-2">
                <Filter className="w-4 h-4" /> Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <DropdownMenuLabel>Filter favorites</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1 space-y-3">
                <div className="space-y-1">
                  <div className="text-xs text-gray-600">Category</div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {[...new Set(favorites.map(f => f.categories?.[0]?.category?.name || 'Uncategorized'))].map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-600">Minimum visits</div>
                  <Input
                    type="number"
                    min={0}
                    value={minVisits}
                    onChange={(e) => setMinVisits(Number(e.target.value) || 0)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-600">Recency</div>
                  <Select value={recency} onValueChange={setRecency}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="All time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-600">Search</div>
                  <Input
                    placeholder="Title or URL"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex justify-between pt-1">
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
                    setFilterCategory('all')
                    setMinVisits(0)
                    setRecency('all')
                    setSearchTerm('')
                  }}>Clear</Button>
                  <Button variant="default" size="sm" className="text-xs">Apply</Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="text-sm text-gray-600">Sort:</span>
          <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
            <SelectTrigger className="w-44 h-9 bg-white border-gray-300 text-gray-700 hover:bg-gray-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="lastUpdated">Last Updated</SelectItem>
              <SelectItem value="dateAdded">Date Added</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="mostVisited">Most Visited</SelectItem>
              <SelectItem value="folder">Folder</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-white border-gray-300 text-gray-700 hover:!bg-gray-100 hover:!text-gray-900"
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Bookmarks Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-3 gap-4">
          {sortedFavorites.map(bookmark => (
            <Card key={bookmark.id} className="bg-white border-border hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {bookmark.favicon ? (
                        <img src={bookmark.favicon} alt="" className="w-6 h-6" />
                      ) : (
                        <FileText className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">{bookmark.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{bookmark.url}</p>
                    </div>
                  </div>
                  <Heart className="w-5 h-5 fill-red-500 text-red-500 flex-shrink-0 ml-2" />
                </div>
                
                {bookmark.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {bookmark.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {bookmark.totalVisits} visits
                    </span>
                    {bookmark.categories.length > 0 && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {bookmark.categories[0]?.category?.name || 'Uncategorized'}
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(bookmark.lastVisited)}
                  </span>
                </div>
                
                {bookmark.tags && bookmark.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {bookmark.tags.slice(0, 3).map((tag: any) => (
                      <Badge key={tag.tagId} variant="secondary" className="text-xs">
                        {tag.tag?.name || 'Tag'}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bookmarks List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {sortedFavorites.map(bookmark => (
            <Card key={bookmark.id} className="bg-white border-border hover:shadow-sm transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {bookmark.favicon ? (
                        <img src={bookmark.favicon} alt="" className="w-6 h-6" />
                      ) : (
                        <FileText className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate mb-1">{bookmark.title}</h3>
                      <p className="text-sm text-muted-foreground truncate mb-2">{bookmark.url}</p>
                      {bookmark.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {bookmark.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {bookmark.totalVisits} visits
                        </span>
                        {bookmark.categories.length > 0 && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {bookmark.categories[0]?.category?.name || 'Uncategorized'}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(bookmark.lastVisited)}
                        </span>
                      </div>
                      {bookmark.tags && bookmark.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {bookmark.tags.slice(0, 5).map((tag: any) => (
                            <Badge key={tag.tagId} variant="secondary" className="text-xs">
                              {tag.tag?.name || 'Tag'}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Heart className="w-5 h-5 fill-red-500 text-red-500 flex-shrink-0 ml-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bookmarks Compact View */}
      {viewMode === 'compact' && (
        <div className="space-y-2">
          {sortedFavorites.map(bookmark => (
            <Card key={bookmark.id} className="bg-white border-border hover:shadow-sm transition-shadow cursor-pointer">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {bookmark.favicon ? (
                        <img src={bookmark.favicon} alt="" className="w-5 h-5" />
                      ) : (
                        <FileText className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{bookmark.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{bookmark.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {bookmark.totalVisits} visits
                      </span>
                      {bookmark.categories.length > 0 && (
                        <span>{bookmark.categories[0]?.category?.name || 'Uncategorized'}</span>
                      )}
                    </div>
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bookmarks Folder View */}
      {viewMode === 'folder' && (
        <div className="space-y-4">
          {Object.entries(
            sortedFavorites.reduce<Record<string, Bookmark[]>>((acc, bookmark) => {
              const folderName = bookmark.categories?.[0]?.category?.name || 'Uncategorized'
              acc[folderName] = acc[folderName] || []
              acc[folderName].push(bookmark)
              return acc
            }, {})
          ).map(([folderName, items]) => {
            const folderVisits = items.reduce((sum, b) => sum + (b.totalVisits || 0), 0)
            return (
              <Card key={folderName} className="bg-white border-border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Folder className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{folderName}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {items.length} item{items.length === 1 ? '' : 's'} · {folderVisits} visits
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                      {items.length} favorites
                    </Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((bookmark) => (
                      <Card key={bookmark.id} className="border border-gray-200 hover:shadow-sm transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3 mb-2">
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              {bookmark.favicon ? (
                                <img src={bookmark.favicon} alt="" className="w-5 h-5" />
                              ) : (
                                <FileText className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-sm truncate">{bookmark.title}</h4>
                              <p className="text-xs text-muted-foreground truncate">{bookmark.url}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {bookmark.totalVisits} visits
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(bookmark.lastVisited)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {favorites.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">NO FAVORITES YET</h3>
          <p className="text-muted-foreground">
            Start favoriting bookmarks to see them here
          </p>
        </div>
      )}
    </div>
  )
}
