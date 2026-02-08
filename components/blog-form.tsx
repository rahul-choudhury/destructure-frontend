"use client";

import { Tooltip } from "@base-ui/react/tooltip";
import { Loader2, RefreshCcw } from "lucide-react";
import {
  type FormEvent,
  startTransition,
  useActionState,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  RichTextEditor,
  type RichTextEditorRef,
} from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  checkSlugUniqueness,
  createBlog,
  generateUniqueSlug,
  updateBlog,
} from "@/lib/actions";
import type { Blog } from "@/lib/definitions";
import { cn, debounce } from "@/lib/utils";

export type BlogFormProps = {
  data?: Blog;
};

export function BlogForm({ data }: BlogFormProps) {
  const isEditMode = !!data;
  const editorRef = useRef<RichTextEditorRef>(null);
  const [values, setValues] = useState({
    title: data?.title ?? "",
    slug: data?.slug ?? "",
  });
  const [slugError, setSlugError] = useState("");
  const [isPendingSlugGen, startSlugGenTransition] = useTransition();

  const [, formAction, isPendingSubmit] = useActionState(
    isEditMode ? updateBlog.bind(null, data.slug) : createBlog,
    undefined,
  );

  const checkSlug = debounce(async (value: string) => {
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
  });

  const generateSlug = () => {
    startSlugGenTransition(async () => {
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

    const content = editorRef.current?.getMarkdown();
    if (!content) {
      return;
    }

    const formData = { ...values, content };
    startTransition(() => formAction(formData));
  };

  return (
    <Tooltip.Provider>
      <form className="mt-8 max-w-2xl space-y-6" onSubmit={handleFormSubmit}>
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
              className={cn("pr-10", isEditMode && "opacity-50")}
              disabled={isEditMode}
              required
            />
            {values.title && !isEditMode && (
              <Tooltip.Root>
                <Tooltip.Trigger
                  render={(props) => (
                    <Button
                      {...props}
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1/2 right-2 size-auto -translate-y-1/2 p-1"
                      aria-label="Generate unique slug"
                      onClick={generateSlug}
                      disabled={isPendingSlugGen}
                    >
                      <RefreshCcw
                        size={18}
                        className={cn(isPendingSlugGen && "animate-spin")}
                      />
                    </Button>
                  )}
                />
                <Tooltip.Portal>
                  <Tooltip.Positioner sideOffset={8}>
                    <Tooltip.Popup className="origin-(--transform-origin) rounded-md bg-background px-2 py-1 text-sm text-foreground shadow-md outline outline-foreground/10 transition-all duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
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
          <button
            id="content-label"
            type="button"
            className="cursor-default text-sm font-medium text-foreground bg-transparent border-0 p-0"
            onClick={() => document.getElementById("content-editor")?.focus()}
          >
            Content
          </button>
          <RichTextEditor
            ref={editorRef}
            id="content-editor"
            aria-labelledby="content-label"
            placeholder="Blog post content..."
            initialContent={data?.content}
          />
        </Field>

        <Button type="submit" disabled={isPendingSubmit} className="group">
          <Loader2 className="absolute animate-spin group-enabled:opacity-0" />
          <span className="group-disabled:opacity-0">
            {isEditMode ? "Update Blog" : "Create Blog"}
          </span>
        </Button>
      </form>
    </Tooltip.Provider>
  );
}
