"use client";

import { useState, useRef } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isLinkNode, $toggleLink } from "@lexical/link";
import {
  $getSelection,
  $isRangeSelection,
  $getNodeByKey,
  $isTextNode,
} from "lexical";
import { X } from "lucide-react";

import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

type LinkDialogContentProps = {
  initialUrl: string;
  initialLabel: string;
  isEditing: boolean;
  linkNodeKey: string | null;
  onClose: () => void;
};

function LinkDialogContent({
  initialUrl,
  initialLabel,
  isEditing,
  linkNodeKey,
  onClose,
}: LinkDialogContentProps) {
  const [editor] = useLexicalComposerContext();
  const [url, setUrl] = useState(initialUrl);
  const [label, setLabel] = useState(initialLabel);
  const [error, setError] = useState<string | null>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!url.trim()) {
      setError("URL is required");
      return;
    }

    const normalizedUrl = normalizeUrl(url);

    editor.update(() => {
      if (isEditing && linkNodeKey) {
        const node = $getNodeByKey(linkNodeKey);
        if ($isLinkNode(node)) {
          node.setURL(normalizedUrl);
          const textNode = node.getFirstChild();
          if ($isTextNode(textNode) && label !== textNode.getTextContent()) {
            textNode.setTextContent(label);
          }
        }
      } else {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const currentText = selection.getTextContent();
          if (!selection.isCollapsed() && label && label !== currentText) {
            selection.removeText();
            selection.insertText(label);
          } else if (selection.isCollapsed() && label) {
            selection.insertText(label);
          }
          $toggleLink(normalizedUrl);
        }
      }
    });

    onClose();
  };

  const handleRemove = () => {
    editor.update(() => {
      if (linkNodeKey) {
        const node = $getNodeByKey(linkNodeKey);
        if ($isLinkNode(node)) {
          const children = node.getChildren();
          for (const child of children) {
            node.insertBefore(child);
          }
          node.remove();
        }
      }
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSave();
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Dialog.Title className="text-lg font-medium text-foreground">
          {isEditing ? "Edit Link" : "Insert Link"}
        </Dialog.Title>
        <Dialog.Close className="rounded p-1 text-foreground-60 hover:bg-foreground-10 hover:text-foreground">
          <X size={18} />
        </Dialog.Close>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field>
          <Field.Label htmlFor="link-url">URL</Field.Label>
          <Field.Input
            ref={urlInputRef}
            id="link-url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            autoFocus
            aria-invalid={!!error}
            aria-describedby={error ? "link-url-error" : undefined}
          />
          {error && <Field.Error id="link-url-error">{error}</Field.Error>}
        </Field>

        <Field>
          <Field.Label htmlFor="link-label">Label</Field.Label>
          <Field.Input
            id="link-label"
            type="text"
            placeholder="Link text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </Field>

        <div className="flex justify-end gap-2">
          {isEditing && (
            <Button type="button" variant="ghost" onClick={handleRemove}>
              Remove Link
            </Button>
          )}
          <Button type="submit">{isEditing ? "Save" : "Insert"}</Button>
        </div>
      </form>
    </>
  );
}

type LinkDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  initialUrl: string;
  initialLabel: string;
  linkNodeKey: string | null;
};

export function LinkDialog({
  open,
  onOpenChange,
  isEditing,
  initialUrl,
  initialLabel,
  linkNodeKey,
}: LinkDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-foreground-20 bg-background p-6 shadow-xl transition-all duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          {open && (
            <LinkDialogContent
              key={`${initialUrl}-${initialLabel}`}
              initialUrl={initialUrl}
              initialLabel={initialLabel}
              isEditing={isEditing}
              linkNodeKey={linkNodeKey}
              onClose={() => onOpenChange(false)}
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
