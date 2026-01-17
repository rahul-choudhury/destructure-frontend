import { Comment, ReactionType } from "@/lib/definitions";
import { CommentItem } from "./comment-item";

type CommentListProps = {
  comments: Comment[];
  isAuthenticated: boolean;
  isLoading: boolean;
  onReact: (commentId: string, reaction: ReactionType) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onReply: (parentId: string, content: string) => Promise<void>;
};

export function CommentList({
  comments,
  isAuthenticated,
  isLoading,
  onReact,
  onEdit,
  onDelete,
  onReply,
}: CommentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-3">
              <div className="h-9 w-9 rounded-full bg-foreground-10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-foreground-10" />
                <div className="h-3 w-full rounded bg-foreground-10" />
                <div className="h-3 w-2/3 rounded bg-foreground-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="text-sm text-foreground-50">
        No comments yet. Be the first to comment!
      </p>
    );
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
  );
}
