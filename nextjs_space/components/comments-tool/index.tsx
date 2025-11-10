
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Plus, Search, ThumbsUp, Reply, Trash2, Edit2, Check, Pin, MoreVertical } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface Comment {
  id: string
  userId: string
  content: string
  isResolved: boolean
  isPinned: boolean
  tags: string[]
  replies: Reply[]
  createdAt: string
  updatedAt: string
}

interface Reply {
  id: string
  userId: string
  content: string
  createdAt: string
}

interface CommentsToolProps {
  bookmarkId: string
}

export function CommentsTool({ bookmarkId }: CommentsToolProps) {
  const { data: session } = useSession() || {}
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showResolved, setShowResolved] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest")
  
  // Form state
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  useEffect(() => {
    fetchComments()
  }, [bookmarkId, showResolved])

  const fetchComments = async () => {
    try {
      const url = new URL(`/api/comments/${bookmarkId}`, window.location.origin)
      if (showResolved) {
        url.searchParams.append("showResolved", "true")
      }
      
      const res = await fetch(url.toString())
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty")
      return
    }

    try {
      const res = await fetch(`/api/comments/${bookmarkId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      })

      if (res.ok) {
        toast.success("Comment added")
        setNewComment("")
        setShowForm(false)
        fetchComments()
      } else {
        toast.error("Failed to add comment")
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("An error occurred")
    }
  }

  const handleAddReply = async (commentId: string) => {
    if (!replyContent.trim()) {
      toast.error("Reply cannot be empty")
      return
    }

    try {
      const res = await fetch(`/api/comments/${bookmarkId}/${commentId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent }),
      })

      if (res.ok) {
        toast.success("Reply added")
        setReplyContent("")
        setReplyTo(null)
        fetchComments()
      } else {
        toast.error("Failed to add reply")
      }
    } catch (error) {
      console.error("Error adding reply:", error)
      toast.error("An error occurred")
    }
  }

  const handleToggleResolved = async (commentId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/comments/${bookmarkId}/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isResolved: !currentStatus }),
      })

      if (res.ok) {
        toast.success(currentStatus ? "Comment reopened" : "Comment resolved")
        fetchComments()
      } else {
        toast.error("Failed to update comment")
      }
    } catch (error) {
      console.error("Error updating comment:", error)
      toast.error("An error occurred")
    }
  }

  const handleTogglePin = async (commentId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/comments/${bookmarkId}/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !currentStatus }),
      })

      if (res.ok) {
        toast.success(currentStatus ? "Comment unpinned" : "Comment pinned")
        fetchComments()
      } else {
        toast.error("Failed to update comment")
      }
    } catch (error) {
      console.error("Error updating comment:", error)
      toast.error("An error occurred")
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return

    try {
      const res = await fetch(`/api/comments/${bookmarkId}/${commentId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Comment deleted")
        fetchComments()
      } else {
        toast.error("Failed to delete comment")
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast.error("An error occurred")
    }
  }

  const filteredComments = comments.filter(c =>
    c.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedComments = [...filteredComments].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }
  })

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-bold uppercase">COMMENTS</h3>
          <Badge variant="outline">{comments.length}</Badge>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="outline"
          className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900 uppercase"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? "Cancel" : "Add Comment"}
        </Button>
      </div>

      {/* Add Comment Form */}
      {showForm && (
        <form onSubmit={handleAddComment} className="border rounded-lg p-4 bg-gray-50">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="!bg-white mb-3"
            rows={4}
          />
          <div className="flex gap-2">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              POST COMMENT
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              CANCEL
            </Button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 !bg-white border-gray-300"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setSortBy(sortBy === "newest" ? "oldest" : "newest")}
          className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900 uppercase"
        >
          {sortBy === "newest" ? "NEWEST" : "OLDEST"}
        </Button>
        <label className="flex items-center gap-2 px-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 bg-white">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm uppercase">Show Resolved</span>
        </label>
      </div>

      {/* Comments List */}
      {sortedComments.length === 0 ? (
        <div className="text-center py-16 border rounded-lg">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="font-medium mb-2 uppercase">NO COMMENTS YET</h4>
          <p className="text-sm text-gray-500 mb-6">
            Be the first to share your thoughts about this bookmark.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            variant="outline"
            className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900 uppercase"
          >
            ADD FIRST COMMENT
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <div
              key={comment.id}
              className={`border rounded-lg p-4 ${
                comment.isPinned ? "border-blue-500 bg-blue-50" : "bg-white"
              } ${comment.isResolved ? "opacity-60" : ""}`}
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {session?.user?.name?.[0] || "U"}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{session?.user?.name || "User"}</p>
                    <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
                  </div>
                  {comment.isPinned && (
                    <Badge className="bg-blue-600 text-white">
                      <Pin className="w-3 h-3 mr-1" />
                      PINNED
                    </Badge>
                  )}
                  {comment.isResolved && (
                    <Badge className="bg-green-600 text-white">
                      <Check className="w-3 h-3 mr-1" />
                      RESOLVED
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTogglePin(comment.id, comment.isPinned)}
                    className="text-gray-600 hover:text-blue-600"
                    title={comment.isPinned ? "Unpin" : "Pin"}
                  >
                    <Pin className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleResolved(comment.id, comment.isResolved)}
                    className="text-gray-600 hover:text-green-600"
                    title={comment.isResolved ? "Reopen" : "Resolve"}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-gray-600 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Comment Content */}
              <p className="text-gray-800 mb-3 whitespace-pre-wrap">{comment.content}</p>

              {/* Comment Actions */}
              <div className="flex items-center gap-4 text-sm">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 -ml-2"
                >
                  <Reply className="w-4 h-4 mr-1" />
                  REPLY ({comment.replies.length})
                </Button>
              </div>

              {/* Reply Form */}
              {replyTo === comment.id && (
                <div className="mt-3 pl-8 border-l-2 border-blue-200">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="!bg-white mb-2"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAddReply(comment.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      POST REPLY
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReplyTo(null)
                        setReplyContent("")
                      }}
                    >
                      CANCEL
                    </Button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="mt-4 pl-8 border-l-2 border-gray-200 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                          {session?.user?.name?.[0] || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{session?.user?.name || "User"}</p>
                          <p className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
