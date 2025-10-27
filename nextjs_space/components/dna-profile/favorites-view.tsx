
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { RefreshCw, Download, Heart, Grid3x3, List, Table, LayoutGrid, ArrowLeft, Eye, TrendingUp, Star, ArrowUpDown, Calendar, FileText } from 'lucide-react'
import { ViewMode, SortOption, FavoriteStats } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

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
  const [stats, setStats] = useState<FavoriteStats>({
    totalFavorites: 0,
    totalVisits: 0,
    avgVisits: 0,
    mostVisited: { title: 'N/A', visits: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('lastUpdated')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

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
        setStats(data.stats)
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

  const sortedFavorites = [...favorites].sort((a, b) => {
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
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-4xl font-bold uppercase tracking-tight">Favorites</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {favorites.length} {favorites.length === 1 ? 'bookmark' : 'bookmarks'} marked as favorite
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchFavorites}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportFavorites}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.totalFavorites}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Bookmarks marked as favorite
                </div>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.totalVisits}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Combined visits to favorites
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.avgVisits}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Average visits per favorite
                </div>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.mostVisited.visits}</div>
                <div className="text-sm text-muted-foreground mt-1 truncate">
                  {stats.mostVisited.title}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <div className="flex gap-1">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('grid')}
              className="p-2"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('list')}
              className="p-2"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'compact' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('compact')}
              className="p-2"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'table' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('table')}
              className="p-2"
            >
              <Table className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort:</span>
          <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastUpdated">Last Updated</SelectItem>
              <SelectItem value="dateAdded">Date Added</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="mostVisited">Most Visited</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2"
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

      {/* Bookmarks Table View */}
      {viewMode === 'table' && (
        <Card className="bg-white border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Title</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">URL</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Category</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Visits</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Last Visited</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFavorites.map(bookmark => (
                    <tr key={bookmark.id} className="border-b hover:bg-gray-50 cursor-pointer">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            {bookmark.favicon ? (
                              <img src={bookmark.favicon} alt="" className="w-5 h-5" />
                            ) : (
                              <FileText className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <span className="font-medium text-sm truncate max-w-xs">
                            {bookmark.title}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground truncate max-w-xs block">
                          {bookmark.url}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {bookmark.categories.length > 0 
                            ? bookmark.categories[0]?.category?.name || 'Uncategorized'
                            : 'Uncategorized'
                          }
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{bookmark.totalVisits}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(bookmark.lastVisited)}
                        </span>
                      </td>
                      <td className="p-4">
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {favorites.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
          <p className="text-muted-foreground">
            Start favoriting bookmarks to see them here
          </p>
        </div>
      )}
    </div>
  )
}
