'use client';

import React, { useState } from 'react';
import { FolderKanban, ChevronRight, Star, ExternalLink, Grid3X3, Columns, Layers, Table, Move, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Sample data for preview
const sampleFolders = [
  { id: '1', name: 'Social Media', color: '#FF6B6B', bookmarks: 24, featured: true },
  { id: '2', name: 'AI Tools', color: '#4ECDC4', bookmarks: 18, featured: true },
  { id: '3', name: 'Development', color: '#6366f1', bookmarks: 32, featured: false },
  { id: '4', name: 'Design', color: '#EC4899', bookmarks: 15, featured: false },
  { id: '5', name: 'Marketing', color: '#F59E0B', bookmarks: 8, featured: false },
  { id: '6', name: 'Finance', color: '#10B981', bookmarks: 12, featured: false },
];

const sampleBookmarks = [
  { id: '1', title: 'Twitter/X', favicon: '🐦', url: 'twitter.com' },
  { id: '2', title: 'LinkedIn', favicon: '💼', url: 'linkedin.com' },
  { id: '3', title: 'Instagram', favicon: '📷', url: 'instagram.com' },
  { id: '4', title: 'Facebook', favicon: '👥', url: 'facebook.com' },
];

export default function FolderPreviewPage() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
            Folders Design Preview
          </h1>
          <p className="text-gray-400 text-lg">Click on any design to see it expanded</p>
        </div>

        {/* Design Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Option A: Bento Box Dashboard */}
          <div 
            className="group cursor-pointer"
            onClick={() => setActiveDemo('bento')}
          >
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:border-purple-500/50 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                  <Grid3X3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Bento Box Dashboard</h3>
                  <p className="text-xs text-gray-400">Apple-style modern grid</p>
                </div>
              </div>
              
              {/* Mini Preview */}
              <div className="bg-black/30 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 row-span-2 bg-gradient-to-br from-pink-500/30 to-orange-500/30 rounded-lg p-3 h-24">
                    <div className="text-xs font-bold">Social Media</div>
                    <div className="text-[10px] text-gray-400">24 bookmarks</div>
                    <div className="flex gap-1 mt-2">
                      <div className="w-4 h-4 bg-white/20 rounded"></div>
                      <div className="w-4 h-4 bg-white/20 rounded"></div>
                      <div className="w-4 h-4 bg-white/20 rounded"></div>
                    </div>
                  </div>
                  <div className="bg-teal-500/30 rounded-lg p-2 h-11">
                    <div className="text-[8px] font-bold">AI Tools</div>
                  </div>
                  <div className="bg-indigo-500/30 rounded-lg p-2 h-11">
                    <div className="text-[8px] font-bold">Dev</div>
                  </div>
                  <div className="bg-amber-500/30 rounded-lg p-2 h-11">
                    <div className="text-[8px]">Marketing</div>
                  </div>
                  <div className="bg-emerald-500/30 rounded-lg p-2 h-11">
                    <div className="text-[8px]">Finance</div>
                  </div>
                  <div className="bg-pink-500/30 rounded-lg p-2 h-11">
                    <div className="text-[8px]">Design</div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-400">Featured folders are larger. Shows bookmark previews, progress rings, and quick actions.</p>
            </div>
          </div>

          {/* Option B: Column Navigator */}
          <div 
            className="group cursor-pointer"
            onClick={() => setActiveDemo('columns')}
          >
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:border-blue-500/50 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Columns className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Column Navigator</h3>
                  <p className="text-xs text-gray-400">Finder-style drill-down</p>
                </div>
              </div>
              
              {/* Mini Preview */}
              <div className="bg-black/30 rounded-xl p-4 mb-4">
                <div className="flex gap-2 h-28">
                  <div className="flex-1 bg-white/5 rounded-lg p-2 border-r border-white/10">
                    <div className="text-[8px] text-gray-400 mb-1">FOLDERS</div>
                    <div className="space-y-1">
                      <div className="bg-blue-500/30 rounded px-2 py-1 text-[8px]">Social Media</div>
                      <div className="bg-white/5 rounded px-2 py-1 text-[8px]">AI Tools</div>
                      <div className="bg-white/5 rounded px-2 py-1 text-[8px]">Development</div>
                    </div>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-lg p-2 border-r border-white/10">
                    <div className="text-[8px] text-gray-400 mb-1">BOOKMARKS</div>
                    <div className="space-y-1">
                      <div className="bg-white/10 rounded px-2 py-1 text-[8px]">Twitter/X</div>
                      <div className="bg-white/10 rounded px-2 py-1 text-[8px]">LinkedIn</div>
                      <div className="bg-white/10 rounded px-2 py-1 text-[8px]">Instagram</div>
                    </div>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-lg p-2">
                    <div className="text-[8px] text-gray-400 mb-1">PREVIEW</div>
                    <div className="bg-white/10 rounded p-2 h-16">
                      <div className="text-[8px] font-bold">Twitter/X</div>
                      <div className="text-[6px] text-gray-400">twitter.com</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-400">Multi-column navigation with smooth sliding animations and breadcrumb trail.</p>
            </div>
          </div>

          {/* Option C: Card Stack Gallery */}
          <div 
            className="group cursor-pointer"
            onClick={() => setActiveDemo('stacks')}
          >
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:border-amber-500/50 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Card Stack Gallery</h3>
                  <p className="text-xs text-gray-400">Stackable folder cards</p>
                </div>
              </div>
              
              {/* Mini Preview */}
              <div className="bg-black/30 rounded-xl p-4 mb-4">
                <div className="flex gap-4 justify-center h-28">
                  {/* Stack 1 */}
                  <div className="relative w-20">
                    <div className="absolute bottom-0 left-1 w-full h-16 bg-pink-500/20 rounded-lg transform rotate-2"></div>
                    <div className="absolute bottom-1 left-0.5 w-full h-16 bg-pink-500/30 rounded-lg transform rotate-1"></div>
                    <div className="absolute bottom-2 w-full h-16 bg-gradient-to-br from-pink-500/50 to-red-500/50 rounded-lg p-2">
                      <div className="text-[8px] font-bold">Social</div>
                      <div className="text-[6px] text-gray-300">24 items</div>
                    </div>
                  </div>
                  {/* Stack 2 */}
                  <div className="relative w-20">
                    <div className="absolute bottom-0 left-1 w-full h-16 bg-teal-500/20 rounded-lg transform rotate-2"></div>
                    <div className="absolute bottom-1 left-0.5 w-full h-16 bg-teal-500/30 rounded-lg transform rotate-1"></div>
                    <div className="absolute bottom-2 w-full h-16 bg-gradient-to-br from-teal-500/50 to-cyan-500/50 rounded-lg p-2">
                      <div className="text-[8px] font-bold">AI Tools</div>
                      <div className="text-[6px] text-gray-300">18 items</div>
                    </div>
                  </div>
                  {/* Stack 3 */}
                  <div className="relative w-20">
                    <div className="absolute bottom-0 left-1 w-full h-16 bg-indigo-500/20 rounded-lg transform rotate-2"></div>
                    <div className="absolute bottom-1 left-0.5 w-full h-16 bg-indigo-500/30 rounded-lg transform rotate-1"></div>
                    <div className="absolute bottom-2 w-full h-16 bg-gradient-to-br from-indigo-500/50 to-purple-500/50 rounded-lg p-2">
                      <div className="text-[8px] font-bold">Dev</div>
                      <div className="text-[6px] text-gray-300">32 items</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-400">Click to fan out bookmarks. Stacked cards show depth. Drag to reorder.</p>
            </div>
          </div>

          {/* Option D: Modern Table + Preview */}
          <div 
            className="group cursor-pointer"
            onClick={() => setActiveDemo('table')}
          >
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:border-emerald-500/50 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Table className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Modern Table + Preview</h3>
                  <p className="text-xs text-gray-400">Clean data view with sidebar</p>
                </div>
              </div>
              
              {/* Mini Preview */}
              <div className="bg-black/30 rounded-xl p-4 mb-4">
                <div className="flex gap-2 h-28">
                  <div className="flex-[2] bg-white/5 rounded-lg p-2">
                    <div className="flex text-[6px] text-gray-400 border-b border-white/10 pb-1 mb-1">
                      <span className="flex-1">NAME</span>
                      <span className="w-12 text-center">COUNT</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-[8px] bg-emerald-500/20 rounded px-1 py-0.5">
                        <span className="w-2 h-2 rounded bg-pink-500 mr-1"></span>
                        <span className="flex-1">Social Media</span>
                        <span className="w-12 text-center">24</span>
                      </div>
                      <div className="flex items-center text-[8px] px-1 py-0.5">
                        <span className="w-2 h-2 rounded bg-teal-500 mr-1"></span>
                        <span className="flex-1">AI Tools</span>
                        <span className="w-12 text-center">18</span>
                      </div>
                      <div className="flex items-center text-[8px] px-1 py-0.5">
                        <span className="w-2 h-2 rounded bg-indigo-500 mr-1"></span>
                        <span className="flex-1">Development</span>
                        <span className="w-12 text-center">32</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-lg p-2">
                    <div className="text-[8px] font-bold mb-1">Social Media</div>
                    <div className="space-y-1">
                      <div className="bg-white/10 rounded px-1 py-0.5 text-[6px]">Twitter/X</div>
                      <div className="bg-white/10 rounded px-1 py-0.5 text-[6px]">LinkedIn</div>
                      <div className="bg-white/10 rounded px-1 py-0.5 text-[6px]">Instagram</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-400">Sortable table with large preview panel. Toggle compact/expanded rows.</p>
            </div>
          </div>

          {/* Option E: Visual Canvas Board */}
          <div 
            className="group cursor-pointer"
            onClick={() => setActiveDemo('canvas')}
          >
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:border-violet-500/50 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <Move className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Visual Canvas Board</h3>
                  <p className="text-xs text-gray-400">Refined hierarchy with glass</p>
                </div>
              </div>
              
              {/* Mini Preview */}
              <div className="bg-black/30 rounded-xl p-4 mb-4">
                <div className="space-y-3 h-28">
                  <div className="flex items-center justify-center">
                    <div className="px-3 py-1 bg-violet-500/30 rounded-full text-[8px] font-bold">TOP LEVEL</div>
                  </div>
                  <div className="flex justify-center gap-2">
                    <div className="w-16 h-10 bg-white/10 backdrop-blur rounded-lg border border-white/20 p-1">
                      <div className="text-[6px] font-bold">Social</div>
                    </div>
                    <div className="w-16 h-10 bg-white/10 backdrop-blur rounded-lg border border-white/20 p-1">
                      <div className="text-[6px] font-bold">AI Tools</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="h-4 w-px bg-violet-500/50"></div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="px-3 py-1 bg-pink-500/30 rounded-full text-[8px] font-bold">SECOND</div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-400">Glassmorphism cards, smooth animations, mini-map navigator.</p>
            </div>
          </div>

        </div>

        {/* Expanded Demo Modal */}
        {activeDemo && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="bg-slate-900 rounded-3xl border border-white/10 w-full max-w-6xl max-h-[85vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-xl font-bold">
                  {activeDemo === 'bento' && 'Bento Box Dashboard'}
                  {activeDemo === 'columns' && 'Column Navigator'}
                  {activeDemo === 'stacks' && 'Card Stack Gallery'}
                  {activeDemo === 'table' && 'Modern Table + Preview'}
                  {activeDemo === 'canvas' && 'Visual Canvas Board'}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveDemo(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-6 overflow-auto max-h-[calc(85vh-80px)]">
                {/* Bento Box Demo */}
                {activeDemo === 'bento' && (
                  <div className="grid grid-cols-4 gap-4">
                    {/* Featured Large Card */}
                    <div className="col-span-2 row-span-2 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-2xl border border-pink-500/30 p-6 hover:border-pink-500/60 transition-all cursor-pointer group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center text-2xl shadow-lg shadow-pink-500/30">
                          📱
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 rounded-full border-4 border-pink-500 flex items-center justify-center text-xs font-bold">
                            85%
                          </div>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-1">Social Media</h3>
                      <p className="text-gray-400 mb-4">24 bookmarks</p>
                      <div className="flex gap-2 flex-wrap">
                        {sampleBookmarks.map((b) => (
                          <div key={b.id} className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                            <span>{b.favicon}</span>
                            <span className="text-sm">{b.title}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="secondary">Open</Button>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>
                    
                    {/* Smaller Cards */}
                    {sampleFolders.slice(1).map((folder) => (
                      <div 
                        key={folder.id}
                        className="bg-white/5 rounded-2xl border border-white/10 p-4 hover:border-white/30 transition-all cursor-pointer"
                        style={{ borderLeftColor: folder.color, borderLeftWidth: '4px' }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                            style={{ backgroundColor: folder.color + '30' }}
                          >
                            📁
                          </div>
                          <span className="text-xs text-gray-400">{folder.bookmarks}</span>
                        </div>
                        <h4 className="font-bold truncate">{folder.name}</h4>
                        <div className="w-full bg-white/10 rounded-full h-1 mt-2">
                          <div 
                            className="h-1 rounded-full"
                            style={{ width: `${(folder.bookmarks / 40) * 100}%`, backgroundColor: folder.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Column Navigator Demo */}
                {activeDemo === 'columns' && (
                  <div className="flex gap-1 h-[500px] bg-black/20 rounded-2xl overflow-hidden">
                    {/* Column 1: Folders */}
                    <div className="w-72 bg-white/5 border-r border-white/10 flex flex-col">
                      <div className="p-3 border-b border-white/10">
                        <h3 className="text-xs font-bold text-gray-400 uppercase">Folders</h3>
                      </div>
                      <div className="flex-1 overflow-auto p-2 space-y-1">
                        {sampleFolders.map((folder, i) => (
                          <div 
                            key={folder.id}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${i === 0 ? 'bg-blue-500/30 border border-blue-500/50' : 'hover:bg-white/5'}`}
                          >
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: folder.color + '30' }}
                            >
                              <FolderKanban className="w-4 h-4" style={{ color: folder.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{folder.name}</div>
                              <div className="text-xs text-gray-400">{folder.bookmarks} items</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Column 2: Bookmarks */}
                    <div className="w-72 bg-white/5 border-r border-white/10 flex flex-col">
                      <div className="p-3 border-b border-white/10">
                        <h3 className="text-xs font-bold text-gray-400 uppercase">Social Media</h3>
                      </div>
                      <div className="flex-1 overflow-auto p-2 space-y-1">
                        {sampleBookmarks.map((bookmark, i) => (
                          <div 
                            key={bookmark.id}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${i === 0 ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5'}`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-lg">
                              {bookmark.favicon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{bookmark.title}</div>
                              <div className="text-xs text-gray-400">{bookmark.url}</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Column 3: Preview */}
                    <div className="flex-1 bg-white/5 flex flex-col">
                      <div className="p-3 border-b border-white/10">
                        <h3 className="text-xs font-bold text-gray-400 uppercase">Preview</h3>
                      </div>
                      <div className="flex-1 p-6 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-4xl mb-4 shadow-lg shadow-blue-500/30">
                          🐦
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Twitter/X</h2>
                        <p className="text-gray-400 mb-4">twitter.com</p>
                        <div className="flex gap-2">
                          <Button size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Star className="w-4 h-4 mr-2" />
                            Favorite
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Stack Gallery Demo */}
                {activeDemo === 'stacks' && (
                  <div className="flex gap-8 justify-center items-end py-12 flex-wrap">
                    {sampleFolders.map((folder, index) => (
                      <div 
                        key={folder.id}
                        className="relative cursor-pointer group"
                        style={{ width: '180px', height: '220px' }}
                      >
                        {/* Stacked cards behind */}
                        <div 
                          className="absolute bottom-0 left-2 w-full h-48 rounded-2xl transform rotate-3 transition-transform group-hover:rotate-6"
                          style={{ backgroundColor: folder.color + '20' }}
                        />
                        <div 
                          className="absolute bottom-2 left-1 w-full h-48 rounded-2xl transform rotate-1.5 transition-transform group-hover:rotate-3"
                          style={{ backgroundColor: folder.color + '40' }}
                        />
                        {/* Main card */}
                        <div 
                          className="absolute bottom-4 w-full h-48 rounded-2xl p-4 transition-all group-hover:scale-105 group-hover:-translate-y-2 border border-white/20"
                          style={{ 
                            background: `linear-gradient(135deg, ${folder.color}60, ${folder.color}30)`,
                            boxShadow: `0 20px 40px ${folder.color}30`
                          }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                              <FolderKanban className="w-5 h-5" />
                            </div>
                          </div>
                          <h3 className="text-lg font-bold mb-1">{folder.name}</h3>
                          <p className="text-sm text-white/70">{folder.bookmarks} bookmarks</p>
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex gap-1">
                              {[1,2,3].map((i) => (
                                <div key={i} className="w-6 h-6 rounded bg-white/20" />
                              ))}
                              <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs">
                                +{folder.bookmarks - 3}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Modern Table Demo */}
                {activeDemo === 'table' && (
                  <div className="flex gap-4 h-[500px]">
                    {/* Table */}
                    <div className="flex-[2] bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex flex-col">
                      <div className="flex items-center text-sm font-bold text-gray-400 p-4 border-b border-white/10 bg-white/5">
                        <span className="w-8"></span>
                        <span className="flex-1">NAME</span>
                        <span className="w-24 text-center">BOOKMARKS</span>
                        <span className="w-24 text-center">ACTIVITY</span>
                        <span className="w-20"></span>
                      </div>
                      <div className="flex-1 overflow-auto">
                        {sampleFolders.map((folder, i) => (
                          <div 
                            key={folder.id}
                            className={`flex items-center p-4 border-b border-white/5 cursor-pointer transition-all ${i === 0 ? 'bg-emerald-500/10' : 'hover:bg-white/5'}`}
                          >
                            <div 
                              className="w-3 h-3 rounded mr-4"
                              style={{ backgroundColor: folder.color }}
                            />
                            <div className="flex-1 flex items-center gap-3">
                              <FolderKanban className="w-5 h-5" style={{ color: folder.color }} />
                              <span className="font-medium">{folder.name}</span>
                            </div>
                            <span className="w-24 text-center text-gray-400">{folder.bookmarks}</span>
                            <div className="w-24 flex justify-center">
                              <div className="w-16 bg-white/10 rounded-full h-1.5">
                                <div 
                                  className="h-1.5 rounded-full"
                                  style={{ width: `${(folder.bookmarks / 40) * 100}%`, backgroundColor: folder.color }}
                                />
                              </div>
                            </div>
                            <div className="w-20 flex justify-end">
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Preview Panel */}
                    <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div 
                          className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: sampleFolders[0].color + '30' }}
                        >
                          <FolderKanban className="w-8 h-8" style={{ color: sampleFolders[0].color }} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{sampleFolders[0].name}</h3>
                          <p className="text-gray-400">{sampleFolders[0].bookmarks} bookmarks</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {sampleBookmarks.map((bookmark) => (
                          <div key={bookmark.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">
                              {bookmark.favicon}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{bookmark.title}</div>
                              <div className="text-xs text-gray-400">{bookmark.url}</div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Visual Canvas Demo */}
                {activeDemo === 'canvas' && (
                  <div className="relative h-[500px] bg-gradient-to-br from-slate-800/50 to-purple-900/30 rounded-2xl overflow-hidden">
                    {/* Grid background */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                      backgroundSize: '30px 30px'
                    }} />
                    
                    {/* Level 1 */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2">
                      <div className="px-6 py-2 bg-gradient-to-r from-violet-500/30 to-purple-500/30 rounded-full border border-violet-500/50 backdrop-blur-sm">
                        <span className="font-bold text-violet-300 uppercase tracking-wider">Executive Level</span>
                      </div>
                    </div>
                    
                    {/* Level 1 Cards */}
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 flex gap-6">
                      {sampleFolders.slice(0, 2).map((folder) => (
                        <div 
                          key={folder.id}
                          className="w-48 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4 hover:scale-105 transition-all cursor-pointer shadow-xl"
                          style={{ boxShadow: `0 0 30px ${folder.color}20` }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: folder.color + '30' }}
                            >
                              <FolderKanban className="w-5 h-5" style={{ color: folder.color }} />
                            </div>
                            <div>
                              <div className="font-bold text-sm">{folder.name}</div>
                              <div className="text-xs text-gray-400">{folder.bookmarks} items</div>
                            </div>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1">
                            <div 
                              className="h-1 rounded-full"
                              style={{ width: '70%', backgroundColor: folder.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Connecting line */}
                    <div className="absolute top-56 left-1/2 w-px h-12 bg-gradient-to-b from-violet-500 to-pink-500" />
                    
                    {/* Level 2 */}
                    <div className="absolute top-72 left-1/2 -translate-x-1/2">
                      <div className="px-6 py-2 bg-gradient-to-r from-pink-500/30 to-red-500/30 rounded-full border border-pink-500/50 backdrop-blur-sm">
                        <span className="font-bold text-pink-300 uppercase tracking-wider">Management Level</span>
                      </div>
                    </div>
                    
                    {/* Level 2 Cards */}
                    <div className="absolute top-[340px] left-1/2 -translate-x-1/2 flex gap-4">
                      {sampleFolders.slice(2, 5).map((folder) => (
                        <div 
                          key={folder.id}
                          className="w-40 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-3 hover:scale-105 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: folder.color + '30' }}
                            >
                              <FolderKanban className="w-4 h-4" style={{ color: folder.color }} />
                            </div>
                            <div className="font-bold text-sm truncate">{folder.name}</div>
                          </div>
                          <div className="text-xs text-gray-400">{folder.bookmarks} items</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Mini-map */}
                    <div className="absolute bottom-4 right-4 w-32 h-20 bg-black/40 backdrop-blur rounded-lg border border-white/10 p-2">
                      <div className="text-[8px] text-gray-400 mb-1">MINI MAP</div>
                      <div className="w-full h-full relative">
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-violet-500/50 rounded" />
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-1 bg-pink-500/50 rounded" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-white/10 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setActiveDemo(null)}>Close Preview</Button>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Use This Design
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

