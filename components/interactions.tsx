import { Suspense } from "react";
import {
  getBlogComments,
  getBlogReactions,
  getCurrentUser,
} from "@/lib/data.dynamic";
import { InteractionsContent } from "./interactions-content";
import { InteractionsSkeleton } from "./interactions-skeleton";

type InteractionsProps = {
  slug: string;
};

async function InteractionsLoader({ slug }: InteractionsProps) {
  const [reactionsData, comments, user] = await Promise.all([
    getBlogReactions(slug),
    getBlogComments(slug),
    getCurrentUser(),
  ]);

  return (
    <InteractionsContent
      slug={slug}
      initialReactions={reactionsData.reactions}
      initialComments={comments}
      isAuthenticated={reactionsData.isAuthenticated}
      user={user}
    />
  );
}

export function Interactions({ slug }: InteractionsProps) {
  return (
    <Suspense fallback={<InteractionsSkeleton />}>
      <InteractionsLoader slug={slug} />
    </Suspense>
  );
}
