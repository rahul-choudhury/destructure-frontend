"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  ApiResponse,
  ReactionCount,
  ReactionsData,
  ReactionType,
} from "@/lib/definitions";

type InteractionsProps = {
  slug: string;
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

const DEFAULT_COUNTS: ReactionCount = {
  LIKE: 0,
  FIRE: 0,
  SMILE: 0,
  LAUGHING: 0,
  HEART: 0,
  THINKING: 0,
  DISLIKE: 0,
};

export function Interactions({ slug }: InteractionsProps) {
  const [count, setCount] = useState<ReactionCount>(DEFAULT_COUNTS);
  const [givenStatus, setGivenStatus] = useState<ReactionType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchReactions() {
      try {
        const response = await fetch(`/api/blogs/${slug}/reactions`);
        if (!response.ok) {
          throw new Error("Failed to fetch reactions");
        }
        const data: ApiResponse<ReactionsData> & { isAuthenticated: boolean } =
          await response.json();
        setCount(data.data.count);
        setGivenStatus(data.data.givenStatus);
        setIsAuthenticated(data.isAuthenticated);
      } catch (error) {
        console.error("Error fetching reactions:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReactions();
  }, [slug]);

  async function handleReaction(reaction: ReactionType) {
    if (!isAuthenticated || isSubmitting) return;

    setIsSubmitting(true);

    const previousGivenStatus = givenStatus;
    const previousCount = { ...count };

    // Optimistic update
    if (givenStatus === reaction) {
      // Toggle off - remove reaction
      setGivenStatus(null);
      setCount((prev) => ({
        ...prev,
        [reaction]: Math.max(0, prev[reaction] - 1),
      }));
    } else {
      // Switch or add reaction
      if (givenStatus) {
        // Decrement old reaction
        setCount((prev) => ({
          ...prev,
          [givenStatus]: Math.max(0, prev[givenStatus] - 1),
        }));
      }
      // Increment new reaction
      setCount((prev) => ({
        ...prev,
        [reaction]: prev[reaction] + 1,
      }));
      setGivenStatus(reaction);
    }

    try {
      const response = await fetch("/api/reactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: slug,
          to: "BLOG",
          reaction,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit reaction");
      }
    } catch (error) {
      // Rollback on error
      console.error("Error submitting reaction:", error);
      setGivenStatus(previousGivenStatus);
      setCount(previousCount);
    } finally {
      setIsSubmitting(false);
    }
  }

  const loginUrl = new URL("/api/auth/login", API_URL);
  loginUrl.searchParams.append("state", `/${slug}`);

  return (
    <div className="mt-12 border-t border-foreground-10 pt-8">
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map(({ type, emoji }) => (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            disabled={!isAuthenticated || isSubmitting}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
              givenStatus === type
                ? "border-accent bg-accent/10 text-accent"
                : "border-foreground-10 hover:border-foreground-20",
              !isAuthenticated && "cursor-not-allowed opacity-60",
              isLoading && "animate-pulse",
            )}
          >
            <span>{emoji}</span>
            <span className="min-w-4 tabular-nums">{count[type]}</span>
          </button>
        ))}
      </div>

      {!isAuthenticated && !isLoading && (
        <div className="mt-4">
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
            Login to react
          </Button>
        </div>
      )}
    </div>
  );
}
