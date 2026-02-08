import { Comment, ReactionType } from "@/lib/definitions"
import { CommentItem } from "./comment-item"

type CommentListProps = {
  comments: Comment[]
  isAuthenticated: boolean
  onReact: (commentId: string, reaction: ReactionType) => Promise<void>
  onEdit: (commentId: string, content: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
  onReply: (parentId: string, content: string) => Promise<void>
}

export function CommentList({
  comments,
  isAuthenticated,
  onReact,
  onEdit,
  onDelete,
  onReply,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-foreground-50">
        No comments yet. Be the first to comment!
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem
          key={comment._id}
          comment={comment}
          isAuthenticated={isAuthenticated}
          onReact={onReact}
          onEdit={onEdit}
          onDelete={onDelete}
          onReply={onReply}
        />
      ))}
    </div>
  )
}
