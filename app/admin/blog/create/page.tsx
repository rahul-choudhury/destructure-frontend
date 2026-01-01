"use client";

import { useState, useMemo } from "react";
import { checkSlugUniqueness } from "@/lib/actions";
import { debounce } from "@/lib/utils";
import { Field } from "@/components/ui/field";
import { RichTextEditor } from "@/components/rich-text-editor";
import { PageTitle } from "@/components/page-title";

export default function Page() {
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  const checkSlug = useMemo(
    () =>
      debounce(async (value: string) => {
        if (!value) {
          setSlugError("");
          setIsCheckingSlug(false);
          return;
        }

        setIsCheckingSlug(true);
        const isUnique = await checkSlugUniqueness(value);
        setIsCheckingSlug(false);

        if (!isUnique) {
          setSlugError("This slug is already in use");
        } else {
          setSlugError("");
        }
      }),
    [],
  );

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSlug(value);
    setSlugError("");
    setIsCheckingSlug(true);
    checkSlug(value);
  };

  return (
    <>
      <PageTitle>New Blog</PageTitle>
      <form className="mt-8 max-w-2xl space-y-6 pb-10">
        <Field>
          <Field.Label htmlFor="title">Title</Field.Label>
          <Field.Input id="title" placeholder="Blog post title" name="title" />
        </Field>

        <Field>
          <Field.Label htmlFor="slug">Slug</Field.Label>
          <Field.Input
            id="slug"
            name="slug"
            placeholder="blog-post-slug"
            value={slug}
            onChange={handleSlugChange}
            aria-invalid={!!slugError}
            aria-describedby={slugError ? "slug-error" : undefined}
            aria-busy={isCheckingSlug}
          />
          {slugError && <Field.Error id="slug-error">{slugError}</Field.Error>}
        </Field>

        <Field>
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
        </Field>

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
