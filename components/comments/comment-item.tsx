import { useState } from "react"
import Image from "next/image"
import { AlertDialog } from "@base-ui/react/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Comment, ReactionType } from "@/lib/definitions"
import { CommentForm } from "./comment-form"
import { ReplyList } from "./reply-list"

type CommentItemProps = {
  comment: Comment
  isAuthenticated: boolean
  onReact: (commentId: string, reaction: ReactionType) => Promise<void>
  onEdit: (commentId: string, content: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
  onReply: (parentId: string, content: string) => Promise<void>
  isReply?: boolean
}

const REACTIONS: { type: ReactionType; emoji: string }[] = [
  { type: "LIKE", emoji: "\u{1F44D}" },
  { type: "DISLIKE", emoji: "\u{1F44E}" },
]

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

export function CommentItem({
  comment,
  isAuthenticated,
  onReact,
  onEdit,
  onDelete,
  onReply,
  isReply = false,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isReacting, setIsReacting] = useState(false)
  const [localReactions, setLocalReactions] = useState(comment.reactions)
  const [showReplies, setShowReplies] = useState(false)
  const [localReplyCount, setLocalReplyCount] = useState(comment.replies)

  const isEdited = comment.createdAt !== comment.updatedAt

  async function handleReact(reaction: ReactionType) {
    if (!isAuthenticated || isReacting) return

    setIsReacting(true)
    const previousReactions = { ...localReactions }

    // optimistic update
    if (localReactions.givenStatus === reaction) {
      setLocalReactions({
        givenStatus: null,
        count: {
          ...localReactions.count,
          [reaction]: Math.max(0, localReactions.count[reaction] - 1),
        },
      })
    } else {
      const newCount = { ...localReactions.count }
      if (localReactions.givenStatus) {
        newCount[localReactions.givenStatus] = Math.max(
          0,
          newCount[localReactions.givenStatus] - 1,
        )
      }
      newCount[reaction] = newCount[reaction] + 1
      setLocalReactions({
        givenStatus: reaction,
        count: newCount,
      })
    }

    try {
      await onReact(comment._id, reaction)
    } catch {
      setLocalReactions(previousReactions)
    } finally {
      setIsReacting(false)
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editContent.trim() || isEditSubmitting) return

    setIsEditSubmitting(true)
    try {
      await onEdit(comment._id, editContent.trim())
      setIsEditing(false)
    } finally {
      setIsEditSubmitting(false)
    }
  }

  async function handleDelete() {
    if (isDeleting) return

    setIsDeleting(true)
    try {
      await onDelete(comment._id)
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleReply(content: string) {
    await onReply(comment._id, content)
    setShowReplyForm(false)
    setLocalReplyCount((prev) => prev + 1)
    setShowReplies(true)
  }

  function handleReplyDeleted() {
    setLocalReplyCount((prev) => Math.max(0, prev - 1))
  }

  const hasReactions = Object.values(localReactions.count).some(
    (count) => count > 0,
  )

  return (
    <div className={cn(isReply && "ml-10 border-l border-foreground-10 pl-4")}>
      <div className="flex gap-3">
        <Image
          src={comment.user.picture}
          alt={comment.user.name}
          width={isReply ? 28 : 36}
          height={isReply ? 28 : 36}
          className={cn(
            "shrink-0 rounded-full object-cover",
            isReply ? "size-7" : "size-9",
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{comment.user.name}</span>
            <span className="text-xs text-foreground-50">
              {formatRelativeTime(comment.createdAt)}
            </span>
            {isEdited && (
              <span className="text-xs text-foreground-40">(edited)</span>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                autoFocus
                className={cn(
                  "w-full resize-none rounded-lg border border-foreground-10 bg-transparent px-3 py-2 text-sm",
                  "focus:border-accent focus:outline-none",
                )}
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false)
                    setEditContent(comment.content)
                  }}
                  disabled={isEditSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!editContent.trim() || isEditSubmitting}
                >
                  {isEditSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          ) : (
            <p className="mt-1 text-sm wrap-break-word whitespace-pre-wrap text-foreground-80">
              {comment.content}
            </p>
          )}

          {!isEditing && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {/* Reactions */}
              <div className="flex flex-wrap gap-1">
                {REACTIONS.filter(
                  ({ type }) =>
                    hasReactions || localReactions.givenStatus === type,
                ).map(({ type, emoji }) => {
                  const count = localReactions.count[type] || 0
                  if (count === 0 && localReactions.givenStatus !== type)
                    return null
                  return (
                    <button
                      key={type}
                      onClick={() => handleReact(type)}
                      disabled={!isAuthenticated || isReacting}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
                        localReactions.givenStatus === type
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-foreground-10 hover:border-foreground-20",
                        !isAuthenticated && "cursor-not-allowed opacity-60",
                      )}
                    >
                      <span>{emoji}</span>
                      <span className="tabular-nums">{count}</span>
                    </button>
                  )
                })}
                {isAuthenticated && !hasReactions && (
                  <div className="flex gap-1">
                    {REACTIONS.map(({ type, emoji }) => (
                      <button
                        key={type}
                        onClick={() => handleReact(type)}
                        disabled={isReacting}
                        className="inline-flex items-center rounded-full border border-foreground-10 px-2 py-0.5 text-xs transition-colors hover:border-foreground-20"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 text-xs">
                {isAuthenticated && !isReply && (
                  <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="px-2 py-0.5 text-foreground-50 transition-colors hover:text-foreground"
                  >
                    Reply
                  </button>
                )}
                {comment.isCommentOwner && (
                  <>
                    <button
                      onClick={() => {
                        setEditContent(comment.content)
                        setIsEditing(true)
                      }}
                      className="px-2 py-0.5 text-foreground-50 transition-colors hover:text-foreground"
                    >
                      Edit
                    </button>
                    <AlertDialog.Root>
                      <AlertDialog.Trigger className="px-2 py-0.5 text-foreground-50 transition-colors hover:text-red-500">
                        Delete
                      </AlertDialog.Trigger>
                      <AlertDialog.Portal>
                        <AlertDialog.Backdrop className="fixed inset-0 bg-black/50 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
                        <AlertDialog.Popup className="fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-foreground-20 bg-background p-6 shadow-xl transition-all duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
                          <AlertDialog.Title className="mb-2 text-lg font-medium text-foreground">
                            Delete Comment
                          </AlertDialog.Title>
                          <AlertDialog.Description className="mb-6 text-sm text-foreground-60">
                            Are you sure you want to delete this comment? This
                            action cannot be undone.
                          </AlertDialog.Description>
                          <div className="flex justify-end gap-3">
                            <AlertDialog.Close
                              render={
                                <Button variant="outline" disabled={isDeleting}>
                                  Cancel
                                </Button>
                              }
                            />
                            <Button
                              variant="destructive"
                              onClick={handleDelete}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </AlertDialog.Popup>
                      </AlertDialog.Portal>
                    </AlertDialog.Root>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                onSubmit={handleReply}
                placeholder="Write a reply..."
                submitLabel="Reply"
                autoFocus
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}

          {/* Replies Section */}
          {!isReply && localReplyCount > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-sm text-accent hover:opacity-80"
              >
                <span
                  className={cn(
                    "transition-transform",
                    showReplies && "rotate-90",
                  )}
                >
                  &#9656;
                </span>
                {localReplyCount} {localReplyCount === 1 ? "reply" : "replies"}
              </button>
              {showReplies && (
                <ReplyList
                  parentId={comment._id}
                  isAuthenticated={isAuthenticated}
                  onReact={onReact}
                  onEdit={onEdit}
                  onDelete={async (replyId) => {
                    await onDelete(replyId)
                    handleReplyDeleted()
                  }}
                  onReply={onReply}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
