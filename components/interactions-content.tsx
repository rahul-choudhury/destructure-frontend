"use client";

import Image from "next/image";
import { startTransition, useOptimistic } from "react";
import { Button } from "@/components/ui/button";
import {
  addComment,
  addReply,
  deleteComment,
  editComment,
  logout,
  toggleCommentReaction,
  toggleReaction,
} from "@/lib/actions";
import { API_URL } from "@/lib/config";
import type {
  Comment,
  ReactionCount,
  ReactionsData,
  ReactionType,
  User,
} from "@/lib/definitions";
import { CommentForm } from "./comments/comment-form";
import { CommentList } from "./comments/comment-list";
import { GoogleIcon } from "./google-icon";

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
          <Button
            key={type}
            variant="reaction"
            size="sm"
            onClick={() => handleReaction(type)}
            disabled={!isAuthenticated}
            data-active={reactions.givenStatus === type || undefined}
          >
            <span>{emoji}</span>
            <span className="min-w-4 tabular-nums">
              {reactions.count[type]}
            </span>
          </Button>
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
              render={<a href={loginUrl.toString()}>Login to interact</a>}
            >
              <GoogleIcon className="h-4 w-4" />
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
