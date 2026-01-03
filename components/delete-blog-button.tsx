"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteBlog } from "@/lib/actions";

type DeleteBlogButtonProps = {
  slug: string;
};

export function DeleteBlogButton({ slug }: DeleteBlogButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteBlog(slug);
    });
  };

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger className="inline-flex items-center gap-1 transition-colors hover:text-accent">
        <Trash2 className="size-3" />
        delete
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 bg-black/50 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-foreground/20 bg-background p-6 shadow-xl transition-all duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <AlertDialog.Title className="mb-2 text-lg font-medium text-foreground">
            Delete Blog
          </AlertDialog.Title>
          <AlertDialog.Description className="mb-6 text-sm text-foreground/60">
            Are you sure you want to delete this blog? This action cannot be
            undone.
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
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              className="group"
            >
              <Loader2 className="absolute animate-spin group-enabled:opacity-0" />
              <span className="group-disabled:opacity-0">Delete</span>
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
