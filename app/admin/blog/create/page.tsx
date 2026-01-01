"use client";

import { useState } from "react";
import { Field } from "@base-ui/react/field";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { PageTitle } from "@/components/page-title";

export default function Page() {
  const [content, setContent] = useState("");

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

        <div className="flex flex-col items-start gap-1.5">
          <span
            id="content-label"
            className="text-sm font-medium text-foreground cursor-default"
            onClick={() => document.getElementById("content-editor")?.focus()}
          >
            Content
          </span>
          <RichTextEditor
            id="content-editor"
            aria-labelledby="content-label"
            placeholder="Blog post content..."
            onChange={setContent}
          />
          <input type="hidden" name="content" value={content} />
        </div>

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
