"use client";

import { Field } from "@base-ui/react/field";
import { Input } from "@/components/ui/input";
import { PageTitle } from "@/components/page-title";

export default function Page() {
  return (
    <>
      <PageTitle>New Blog</PageTitle>
      <form className="mt-8 max-w-2xl space-y-6 pb-10">
        <Field.Root className="flex flex-col items-start gap-1.5">
          <Field.Label className="text-sm font-medium text-foreground">
            Title
          </Field.Label>
          <Field.Control
            render={(props) => (
              <Input {...props} placeholder="Blog post title" name="title" />
            )}
          />
        </Field.Root>

        <Field.Root className="flex flex-col items-start gap-1.5">
          <Field.Label className="text-sm font-medium text-foreground">
            Slug
          </Field.Label>
          <Field.Control
            render={(props) => (
              <Input {...props} placeholder="blog-post-slug" name="slug" />
            )}
          />
        </Field.Root>

        <Field.Root className="flex flex-col items-start gap-1.5">
          <Field.Label className="text-sm font-medium text-foreground">
            Content
          </Field.Label>
          <Field.Control
            render={(props) => (
              <textarea
                {...props}
                className="h-64 w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-2 focus:outline-accent focus:-outline-offset-1 resize-none"
                placeholder="Blog post content..."
                name="content"
              />
            )}
          />
        </Field.Root>

        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background focus:outline-2 focus:outline-accent focus:-outline-offset-1"
        >
          Create Post
        </button>
      </form>
    </>
  );
}
