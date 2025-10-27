
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { RefreshCw, Download, Heart, Grid3x3, List, Table, LayoutGrid } from 'lucide-react'
import { ViewMode, SortOption, FavoriteStats } from '@/lib/types'

type Bookmark = {
  id: string
  title: string
  url: string
  favicon?: string
  description?: string
  totalVisits: number
  lastVisited?: Date
  categories: any[]
  tags: any[]
}

export default function FavoritesView() {
  const [favorites, setFavorites] = useState<Bookmark[]>([])
  const [stats, setStats] = useState<FavoriteStats>({
    totalFavorites: 0,
    totalVisits: 0,
    avgVisits: 0,
    mostVisited: { title: 'N/A', visits: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('dateAdded')

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
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'mostVisited':
        return b.totalVisits - a.totalVisits
      case 'lastUpdated':
        return new Date(b.lastVisited || 0).getTime() - new Date(a.lastVisited || 0).getTime()
      default:
        return 0
    }
  })

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading favorites...</div>
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold uppercase">Favorites</h1>
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
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalFavorites}</div>
            <div className="text-sm text-muted-foreground">Total Favorites</div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalVisits}</div>
            <div className="text-sm text-muted-foreground">Total Visits</div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.avgVisits}</div>
            <div className="text-sm text-muted-foreground">Avg Visits</div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold truncate">{stats.mostVisited.title}</div>
            <div className="text-sm text-muted-foreground">Most Visited ({stats.mostVisited.visits} visits)</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
            <List className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === 'compact' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('compact')}>
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('table')}>
            <Table className="w-4 h-4" />
          </Button>
        </div>
        <div className="w-48">
          <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="dateAdded">Date Added</SelectItem>
              <SelectItem value="lastUpdated">Last Updated</SelectItem>
              <SelectItem value="mostVisited">Most Visited</SelectItem>
              <SelectItem value="folder">Folder</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bookmarks Grid/List */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-3 gap-4">
          {sortedFavorites.map(bookmark => (
            <Card key={bookmark.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    {bookmark.favicon ? (
                      <img src={bookmark.favicon} alt="" className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 bg-primary/10 rounded" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{bookmark.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{bookmark.url}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                      <span className="text-xs text-muted-foreground">{bookmark.totalVisits} visits</span>
                    </div>
                  </div>
                </div>
                {bookmark.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {bookmark.categories.map(cat => (
                      <Badge key={cat.categoryId} variant="secondary" className="text-xs">
                        {cat.category.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="space-y-2">
          {sortedFavorites.map(bookmark => (
            <Card key={bookmark.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    {bookmark.favicon ? (
                      <img src={bookmark.favicon} alt="" className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 bg-primary/10 rounded" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{bookmark.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{bookmark.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    <span className="text-sm text-muted-foreground">{bookmark.totalVisits} visits</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === 'compact' && (
        <div className="grid grid-cols-2 gap-2">
          {sortedFavorites.map(bookmark => (
            <div key={bookmark.id} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted cursor-pointer">
              <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                {bookmark.favicon ? (
                  <img src={bookmark.favicon} alt="" className="w-5 h-5" />
                ) : (
                  <div className="w-5 h-5 bg-primary/10 rounded" />
                )}
              </div>
              <span className="text-sm font-medium truncate flex-1">{bookmark.title}</span>
              <Heart className="w-3 h-3 fill-red-500 text-red-500 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {viewMode === 'table' && (
        <div className="border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 text-sm font-semibold">Title</th>
                <th className="text-left p-3 text-sm font-semibold">URL</th>
                <th className="text-left p-3 text-sm font-semibold">Visits</th>
                <th className="text-left p-3 text-sm font-semibold">Last Visited</th>
              </tr>
            </thead>
            <tbody>
              {sortedFavorites.map(bookmark => (
                <tr key={bookmark.id} className="border-t hover:bg-muted/30 cursor-pointer">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        {bookmark.favicon ? (
                          <img src={bookmark.favicon} alt="" className="w-4 h-4" />
                        ) : (
                          <div className="w-4 h-4 bg-primary/10 rounded" />
                        )}
                      </div>
                      <span className="text-sm truncate">{bookmark.title}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground truncate max-w-xs">{bookmark.url}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                      <span className="text-sm">{bookmark.totalVisits}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {bookmark.lastVisited ? new Date(bookmark.lastVisited).toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {favorites.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2 uppercase">No favorites yet</h3>
          <p className="text-muted-foreground">Start favoriting bookmarks to see them here</p>
        </div>
      )}
    </div>
  )
}
