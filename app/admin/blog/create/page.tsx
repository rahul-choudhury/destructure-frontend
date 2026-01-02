"use client";

import { RefreshCcw } from "lucide-react";
import { Tooltip } from "@base-ui/react/tooltip";

import { useRef, useState, useMemo, useTransition, FormEvent } from "react";
import { checkSlugUniqueness, generateUniqueSlug } from "@/lib/actions";
import { cn, debounce } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  RichTextEditor,
  type RichTextEditorRef,
} from "@/components/rich-text-editor";
import { PageTitle } from "@/components/page-title";

export default function Page() {
  const editorRef = useRef<RichTextEditorRef>(null);
  const [values, setValues] = useState({
    title: "",
    slug: "",
  });
  const [slugError, setSlugError] = useState("");
  const [isPending, startTransition] = useTransition();

  const checkSlug = useMemo(
    () =>
      debounce(async (value: string) => {
        if (!value) {
          setSlugError("");
          return;
        }

        const isUnique = await checkSlugUniqueness(value);
        if (!isUnique) {
          setSlugError("This slug is already in use");
        } else {
          setSlugError("");
        }
      }),
    [],
  );

  const generateSlug = () => {
    startTransition(async () => {
      const slug = await generateUniqueSlug(values.title);
      if (slug) {
        setValues((prev) => ({ ...prev, slug }));
        setSlugError("");
      }
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValues((prev) => ({ ...prev, slug: value }));
    setSlugError("");
    checkSlug(value);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const content = editorRef.current?.getHtml();
    if (!content) {
      return;
    }

    const data = { ...values, content };
    console.log(data);
  };

  return (
    <Tooltip.Provider>
      <PageTitle>New Blog</PageTitle>
      <form
        className="mt-8 max-w-2xl space-y-6 pb-10"
        onSubmit={handleFormSubmit}
      >
        <Field>
          <Field.Label htmlFor="title">Title</Field.Label>
          <Field.Input
            id="title"
            name="title"
            placeholder="Blog post title"
            value={values.title}
            onChange={handleTitleChange}
            required
          />
        </Field>

        <Field>
          <Field.Label htmlFor="slug">Slug</Field.Label>
          <div className="relative w-full">
            <Field.Input
              id="slug"
              name="slug"
              placeholder="blog-post-slug"
              value={values.slug}
              onChange={handleSlugChange}
              aria-invalid={!!slugError}
              aria-describedby={slugError ? "slug-error" : undefined}
              className="pr-10"
              required
            />
            {values.title && slugError && (
              <Tooltip.Root>
                <Tooltip.Trigger
                  render={(props) => (
                    <Button
                      {...props}
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 size-auto -translate-y-1/2 p-1"
                      aria-label="Generate unique slug"
                      onClick={generateSlug}
                      disabled={isPending}
                    >
                      <RefreshCcw
                        size={18}
                        className={cn(isPending && "animate-spin")}
                      />
                    </Button>
                  )}
                />
                <Tooltip.Portal>
                  <Tooltip.Positioner sideOffset={8}>
                    <Tooltip.Popup className="origin-(--transform-origin) rounded-md bg-background px-2 py-1 text-sm text-foreground shadow-md outline outline-foreground/10 transition-all duration-200 data-ending-style:opacity-0 data-ending-style:scale-95 data-starting-style:opacity-0 data-starting-style:scale-95">
                      Generate unique slug
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            )}
          </div>
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
            ref={editorRef}
            id="content-editor"
            aria-labelledby="content-label"
            placeholder="Blog post content..."
          />
        </Field>

        <Button type="submit">Create Blog</Button>
      </form>
    </Tooltip.Provider>
  );
}
