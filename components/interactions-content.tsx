"use client";

import { useOptimistic, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  toggleReaction,
  addComment,
  editComment,
  deleteComment,
  addReply,
  toggleCommentReaction,
  logout,
} from "@/lib/actions";
import {
  Comment,
  ReactionsData,
  ReactionType,
  User,
  ReactionCount,
} from "@/lib/definitions";
import { CommentForm } from "./comments/comment-form";
import { CommentList } from "./comments/comment-list";

type InteractionsContentProps = {
  slug: string;
  initialReactions: ReactionsData;
  initialComments: Comment[];
  isAuthenticated: boolean;
  user: User | null;
};

const REACTIONS: { type: ReactionType; emoji: string }[] = [
  { type: "LIKE", emoji: "\u{1F44D}" },
  { type: "FIRE", emoji: "\u{1F525}" },
  { type: "SMILE", emoji: "\u{1F60A}" },
  { type: "LAUGHING", emoji: "\u{1F602}" },
  { type: "HEART", emoji: "\u{2764}\u{FE0F}" },
  { type: "THINKING", emoji: "\u{1F914}" },
  { type: "DISLIKE", emoji: "\u{1F44E}" },
];

type ReactionAction = {
  type: "toggle";
  reaction: ReactionType;
  previousStatus: ReactionType | null;
};

function reactionReducer(
  state: ReactionsData,
  action: ReactionAction,
): ReactionsData {
  const { reaction, previousStatus } = action;
  const isRemoving = previousStatus === reaction;

  const newCount: ReactionCount = { ...state.count };

  if (isRemoving) {
    // Removing existing reaction
    newCount[reaction] = Math.max(0, newCount[reaction] - 1);
    return {
      givenStatus: null,
      count: newCount,
    };
  } else {
    // Adding new reaction (possibly replacing old one)
    if (previousStatus) {
      newCount[previousStatus] = Math.max(0, newCount[previousStatus] - 1);
    }
    newCount[reaction] = newCount[reaction] + 1;
    return {
      givenStatus: reaction,
      count: newCount,
    };
  }
}

type CommentAction =
  | { type: "add"; comment: Comment }
  | { type: "edit"; id: string; content: string }
  | { type: "delete"; id: string }
  | { type: "incrementReplies"; id: string };

function commentReducer(state: Comment[], action: CommentAction): Comment[] {
  switch (action.type) {
    case "add":
      return [action.comment, ...state];
    case "edit":
      return state.map((c) =>
        c._id === action.id
          ? {
              ...c,
              content: action.content,
              updatedAt: new Date().toISOString(),
            }
          : c,
      );
    case "delete":
      return state.filter((c) => c._id !== action.id);
    case "incrementReplies":
      return state.map((c) =>
        c._id === action.id ? { ...c, replies: c.replies + 1 } : c,
      );
    default:
      return state;
  }
}

export function InteractionsContent({
  slug,
  initialReactions,
  initialComments,
  isAuthenticated,
  user,
}: InteractionsContentProps) {
  const [isPending, startTransition] = useTransition();

  // Optimistic reactions
  const [reactions, setOptimisticReaction] = useOptimistic(
    initialReactions,
    reactionReducer,
  );

  // Optimistic comments
  const [comments, setOptimisticComment] = useOptimistic(
    initialComments,
    commentReducer,
  );

  function handleReaction(reaction: ReactionType) {
    if (!isAuthenticated) return;

    startTransition(async () => {
      setOptimisticReaction({
        type: "toggle",
        reaction,
        previousStatus: reactions.givenStatus,
      });
      await toggleReaction(slug, reaction);
    });
  }

  async function handleAddComment(content: string) {
    if (!user) return;

    // Create optimistic comment
    const optimisticComment: Comment = {
      _id: `temp-${Date.now()}`,
      user: {
        _id: user._id,
        name: user.name,
        picture: user.picture,
      },
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reactions: {
        givenStatus: null,
        count: {
          LIKE: 0,
          FIRE: 0,
          SMILE: 0,
          LAUGHING: 0,
          HEART: 0,
          THINKING: 0,
          DISLIKE: 0,
        },
      },
      replies: 0,
      isCommentOwner: true,
    };

    startTransition(async () => {
      setOptimisticComment({ type: "add", comment: optimisticComment });
      await addComment(slug, content);
    });
  }

  async function handleCommentReact(commentId: string, reaction: ReactionType) {
    await toggleCommentReaction(commentId, reaction);
  }

  async function handleCommentEdit(commentId: string, content: string) {
    startTransition(async () => {
      setOptimisticComment({ type: "edit", id: commentId, content });
      await editComment(slug, commentId, content);
    });
  }

  async function handleCommentDelete(commentId: string) {
    startTransition(async () => {
      setOptimisticComment({ type: "delete", id: commentId });
      await deleteComment(slug, commentId);
    });
  }

  async function handleReply(parentId: string, content: string) {
    startTransition(async () => {
      setOptimisticComment({ type: "incrementReplies", id: parentId });
      await addReply(slug, parentId, content);
    });
  }

  const loginUrl = new URL("/api/auth/login", API_URL);
  loginUrl.searchParams.append("state", `/${slug}`);

  return (
    <div className="mt-12 border-t border-foreground-10 pt-8">
      <p className="mb-4 text-sm text-foreground-50">
        Made it this far? Drop a reaction or leave a comment below.
      </p>

      {/* Reactions Section */}
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map(({ type, emoji }) => (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            disabled={!isAuthenticated || isPending}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
              reactions.givenStatus === type
                ? "border-accent bg-accent/10 text-accent"
                : "border-foreground-10 hover:border-foreground-20",
              !isAuthenticated && "cursor-not-allowed opacity-60",
            )}
          >
            <span>{emoji}</span>
            <span className="min-w-4 tabular-nums">
              {reactions.count[type]}
            </span>
          </button>
        ))}
      </div>

      {/* Comments Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Comments</h3>
          {!isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<a href={loginUrl.toString()} />}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Login to interact
            </Button>
          )}
        </div>

        {/* User Profile with Comment Form */}
        {isAuthenticated && (
          <div className="mt-4 space-y-4">
            {user && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src={user.picture}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="size-8 shrink-0 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <form action={() => logout(slug)}>
                  <Button variant="ghost" size="sm" type="submit">
                    Logout
                  </Button>
                </form>
              </div>
            )}
            <CommentForm onSubmit={handleAddComment} />
          </div>
        )}

        {/* Comments List */}
        <div className="mt-6">
          <CommentList
            comments={comments}
            isAuthenticated={isAuthenticated}
            onReact={handleCommentReact}
            onEdit={handleCommentEdit}
            onDelete={handleCommentDelete}
            onReply={handleReply}
          />
        </div>
      </div>
    </div>
  );
}
