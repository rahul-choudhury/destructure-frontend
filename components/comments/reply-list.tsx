import { useEffect, useState } from "react"
import { ApiResponse, Comment, ReactionType } from "@/lib/definitions"
import { CommentItem } from "./comment-item"

type ReplyListProps = {
  parentId: string
  isAuthenticated: boolean
  onReact: (commentId: string, reaction: ReactionType) => Promise<void>
  onEdit: (commentId: string, content: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
  onReply: (parentId: string, content: string) => Promise<void>
}

export function ReplyList({
  parentId,
  isAuthenticated,
  onReact,
  onEdit,
  onDelete,
  onReply,
}: ReplyListProps) {
  const [replies, setReplies] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    setIsLoading(true)
    setError(null)

    async function fetchReplies() {
      try {
        const response = await fetch(`/api/comments/${parentId}/replies`)
        if (!response.ok) {
          throw new Error("Failed to fetch replies")
        }
        const data: ApiResponse<Comment[]> = await response.json()
        if (!ignore) {
          setReplies(data.data)
        }
      } catch (err) {
        console.error("Error fetching replies:", err)
        if (!ignore) {
          setError("Failed to load replies")
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    fetchReplies()
    return () => {
      ignore = true
    }
  }, [parentId])

  async function handleEdit(replyId: string, content: string) {
    await onEdit(replyId, content)
    setReplies((prev) =>
      prev.map((reply) =>
        reply._id === replyId
          ? { ...reply, content, updatedAt: new Date().toISOString() }
          : reply,
      ),
    )
  }

  async function handleDelete(replyId: string) {
    await onDelete(replyId)
    setReplies((prev) => prev.filter((reply) => reply._id !== replyId))
  }

  if (isLoading) {
    return (
      <div className="mt-3 space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="ml-10 animate-pulse border-l border-foreground-10 pl-4"
          >
            <div className="flex gap-3">
              <div className="h-7 w-7 rounded-full bg-foreground-10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 rounded bg-foreground-10" />
                <div className="h-3 w-3/4 rounded bg-foreground-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <p className="mt-3 ml-10 border-l border-foreground-10 pl-4 text-sm text-red-500">
        {error}
      </p>
    )
  }

  if (replies.length === 0) {
    return null
  }

  return (
    <div className="mt-3 space-y-4">
      {replies.map((reply) => (
        <CommentItem
          key={reply._id}
          comment={reply}
          isAuthenticated={isAuthenticated}
          onReact={onReact}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReply={onReply}
          isReply
        />
      ))}
    </div>
  )
}
