
"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Store, 
  Search, 
  TrendingUp, 
  Star, 
  Download, 
  Users,
  Zap,
  Target,
  Layout,
  FileText
} from "lucide-react"
import { useState } from "react"

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const templates = [
    {
      id: 1,
      name: "Developer Essentials",
      description: "Curated collection of development tools, documentation, and resources",
      author: "DevTools Team",
      downloads: 1243,
      rating: 4.8,
      price: "Free",
      category: "Development",
      icon: "💻",
      color: "blue",
    },
    {
      id: 2,
      name: "Design Resources Pro",
      description: "Premium design tools, inspiration sites, and asset libraries",
      author: "DesignHub",
      downloads: 892,
      rating: 4.9,
      price: "$9.99",
      category: "Design",
      icon: "🎨",
      color: "purple",
    },
    {
      id: 3,
      name: "Marketing Stack",
      description: "Complete marketing toolkit with analytics, SEO, and social media tools",
      author: "MarketingPro",
      downloads: 2156,
      rating: 4.7,
      price: "Free",
      category: "Marketing",
      icon: "📈",
      color: "green",
    },
    {
      id: 4,
      name: "Productivity Boost",
      description: "Time management, note-taking, and project management applications",
      author: "ProductivityLab",
      downloads: 1789,
      rating: 4.6,
      price: "$4.99",
      category: "Productivity",
      icon: "⚡",
      color: "yellow",
    },
    {
      id: 5,
      name: "Learning Resources",
      description: "Educational platforms, courses, and documentation sites",
      author: "EduCollective",
      downloads: 967,
      rating: 4.8,
      price: "Free",
      category: "Education",
      icon: "📚",
      color: "orange",
    },
    {
      id: 6,
      name: "Finance Tracker",
      description: "Financial tools, crypto trackers, and investment resources",
      author: "FinanceHub",
      downloads: 1432,
      rating: 4.5,
      price: "$7.99",
      category: "Finance",
      icon: "💰",
      color: "emerald",
    },
  ]

  const categories = [
    { name: "All", count: templates.length, icon: Layout },
    { name: "Development", count: 1, icon: Target },
    { name: "Design", count: 1, icon: Zap },
    { name: "Marketing", count: 1, icon: TrendingUp },
    { name: "Productivity", count: 1, icon: FileText },
  ]

  const handleSearch = () => {
    // Search is handled by the filteredTemplates below
  }

  const handleInstall = (templateId: number) => {
    alert(`Installing template ${templateId}...`)
  }

  // Filter templates based on search query and selected category
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = searchQuery === "" || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">MARKETPLACE</h1>
                <p className="text-gray-600">Discover and install bookmark collections and templates</p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search templates, collections, and tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-12"
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.name)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                  <Badge variant="secondary" className="ml-1">
                    {category.count}
                  </Badge>
                </Button>
              )
            })}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-12 h-12 bg-${template.color}-100 rounded-xl flex items-center justify-center text-2xl`}
                    >
                      {template.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500">{template.author}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4">
                  {template.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{template.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>{template.downloads}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Active</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{template.category}</Badge>
                    <Badge 
                      variant={template.price === "Free" ? "default" : "secondary"}
                      className={template.price === "Free" ? "bg-green-100 text-green-800" : ""}
                    >
                      {template.price}
                    </Badge>
                  </div>
                  <Button 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleInstall(template.id)
                    }}
                  >
                    Install
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State for Search */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 mt-8">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-gray-600">Try adjusting your search to find what you're looking for</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
