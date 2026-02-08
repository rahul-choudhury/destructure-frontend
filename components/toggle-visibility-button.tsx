"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { toggleBlogVisibility } from "@/lib/actions";
import { cn } from "@/lib/utils";

type ToggleVisibilityButtonProps = {
  slug: string;
  isPublic: boolean;
};

export function ToggleVisibilityButton({
  slug,
  isPublic,
}: ToggleVisibilityButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleBlogVisibility(slug, !isPublic);
    });
  };

  return (
    <button
      type="button"
      className="bg-transparent border-0 p-0"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <AlertDialog.Root>
        <AlertDialog.Trigger
          className={cn(
            "rounded bg-foreground-10 px-1.5 py-0.5 font-mono text-xs text-foreground-50 transition-opacity hover:opacity-80",
            isPublic && "bg-accent-10 text-accent-80",
          )}
        >
          {isPublic ? "Public" : "Private"}
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 bg-black/50 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <AlertDialog.Popup className="fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-foreground-20 bg-background p-6 shadow-xl transition-all duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <AlertDialog.Title className="mb-2 text-lg font-medium text-foreground">
              {isPublic ? "Make Blog Private" : "Make Blog Public"}
            </AlertDialog.Title>
            <AlertDialog.Description className="mb-6 text-sm text-foreground-60">
              {isPublic
                ? "Make this blog private? It will only be visible to you."
                : "Make this blog public? It will be visible to everyone."}
            </AlertDialog.Description>
            <div className="flex justify-end gap-3">
              <AlertDialog.Close
                render={
                  <Button variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                }
              />
              <Button
                onClick={handleToggle}
                disabled={isPending}
                className="group"
              >
                <Loader2 className="absolute animate-spin group-enabled:opacity-0" />
                <span className="group-disabled:opacity-0">
                  {isPublic ? "Make Private" : "Make Public"}
                </span>
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </button>
  );
}
