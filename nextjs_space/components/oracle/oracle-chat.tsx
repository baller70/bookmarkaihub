'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { 
  X, 
  Send, 
  Sparkles, 
  Lightbulb, 
  BookOpen, 
  Zap,
  MessageSquare,
  ChevronRight,
  Bot,
  User,
  Loader2,
  Minimize2,
  Maximize2,
  Settings,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface OracleChatProps {
  isOpen: boolean
  onClose: () => void
  initialPrompt?: string
}

const QUICK_PROMPTS = [
  { icon: BookOpen, label: "How do I organize my bookmarks?", category: "Getting Started" },
  { icon: Zap, label: "What are fitness rings?", category: "Features" },
  { icon: Lightbulb, label: "Show me my stats", category: "Insights" },
  { icon: MessageSquare, label: "What can you help me with?", category: "Help" },
]

const SUGGESTED_TOPICS = [
  "Creating categories",
  "Using AI LinkPilot",
  "Time Capsule snapshots",
  "Keyboard shortcuts",
  "Bulk operations",
  "Marketplace playbooks"
]

export function OracleChat({ isOpen, onClose, initialPrompt }: OracleChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [stats, setStats] = useState({ bookmarkCount: 0, categoryCount: 0 })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      fetchStats()
    }
  }, [isOpen])

  // Handle initial prompt
  useEffect(() => {
    if (initialPrompt && isOpen) {
      setInputValue(initialPrompt)
    }
  }, [initialPrompt, isOpen])

  // Keyboard shortcut to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/oracle')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats || { bookmarkCount: 0, categoryCount: 0 })
      }
    } catch (error) {
      console.error('Failed to fetch Oracle stats:', error)
    }
  }

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
          context: {
            currentPage: pathname,
          }
        })
      })

      if (!res.ok) throw new Error('Failed to get response')

      const data = await res.json()

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      toast.error('Failed to get response from The Oracle')
      console.error('Oracle error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, messages, pathname])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt)
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('Copied to clipboard')
  }

  const clearConversation = () => {
    setMessages([])
    toast.success('Conversation cleared')
  }

  const formatMessage = (content: string) => {
    // Convert markdown-style formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-purple-100 dark:bg-purple-900/30 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br />')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      />

      {/* Oracle Panel */}
      <div 
        className={cn(
          "fixed top-3 bottom-3 right-3 md:top-6 md:bottom-6 md:right-6",
          "bg-white dark:bg-slate-900 shadow-2xl z-[101] transition-all duration-300 ease-out flex flex-col rounded-2xl",
          isExpanded 
            ? "w-[calc(100%-24px)] sm:w-[90vw] md:w-[720px] lg:w-[760px]" 
            : "w-[calc(100%-24px)] sm:w-[88vw] md:w-[520px] lg:w-[560px]"
        )}
        style={{ maxWidth: "96vw" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-purple-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold uppercase tracking-wide">The Oracle</h2>
                <p className="text-xs text-purple-200">Your AI Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.href = '/settings/oracle'}
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-3 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
              <BookOpen className="h-3 w-3" />
              <span>{stats.bookmarkCount} bookmarks</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
              <Zap className="h-3 w-3" />
              <span>{stats.categoryCount} categories</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Ready to help</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="space-y-6">
              {/* Welcome Message */}
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Welcome to The Oracle
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 max-w-sm mx-auto">
                  I'm your intelligent guide to BookmarkHub. Ask me anything about organizing, 
                  navigating, or optimizing your bookmark experience!
                </p>
              </div>

              {/* Quick Prompts */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Quick Questions
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickPrompt(prompt.label)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                        <prompt.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {prompt.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {prompt.category}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggested Topics */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Suggested Topics
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TOPICS.map((topic, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickPrompt(`Tell me about ${topic.toLowerCase()}`)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Conversation */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' ? "flex-row-reverse" : ""
                  )}
                >
                  {/* Avatar */}
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    message.role === 'user' 
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" 
                      : "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
                  )}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={cn(
                    "max-w-[80%] group",
                    message.role === 'user' ? "text-right" : ""
                  )}>
                    <div className={cn(
                      "rounded-2xl px-4 py-3 relative",
                      message.role === 'user'
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-tr-sm"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-tl-sm"
                    )}>
                      <div 
                        className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                      />
                      
                      {/* Copy Button - Only for assistant */}
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700"
                        >
                          {copiedId === message.id ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3 text-gray-500" />
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 px-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                      <span className="text-sm text-gray-600 dark:text-slate-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-slate-700 p-4 flex-shrink-0 bg-gray-50 dark:bg-slate-800/50">
          {messages.length > 0 && (
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {messages.length} messages in this conversation
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearConversation}
                className="text-xs text-gray-500 hover:text-red-600 h-7"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask The Oracle anything..."
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-slate-500">
                ⌘K
              </div>
            </div>
            <Button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>

          <p className="text-[10px] text-center text-gray-400 dark:text-slate-500 mt-3">
            The Oracle has knowledge of all your bookmarks and app features. Press Escape to close.
          </p>
        </div>
      </div>
    </>
  )
}
