"use client";

import { useCallback, useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes } from "@lexical/html";
import { HeadingNode, QuoteNode, $createHeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { cn } from "@/lib/utils";

const editorTheme = {
  paragraph: "text-foreground/70 mb-5",
  heading: {
    h2: "text-3xl font-medium mt-10 mb-4",
    h3: "text-xl font-medium text-foreground mt-8 mb-3",
  },
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "font-mono text-sm text-accent bg-foreground/10 px-1.5 py-0.5 rounded",
  },
  link: "text-accent underline underline-offset-4 transition-opacity duration-200 hover:opacity-80",
  list: {
    ul: "list-disc list-inside mb-5 pl-4 space-y-1",
    ol: "list-decimal list-inside mb-5 pl-4 space-y-1",
    listitem: "text-foreground/70",
    nested: {
      listitem: "list-none",
    },
  },
  code: "bg-foreground/5 p-4 rounded-lg overflow-x-auto mb-6 font-mono text-sm text-foreground block",
  quote: "border-l-4 border-foreground/20 pl-4 italic text-foreground/60 mb-5",
};

function RestrictHeadingsPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerNodeTransform(HeadingNode, (node) => {
      const tag = node.getTag();
      if (tag !== "h2" && tag !== "h3") {
        node.replace($createHeadingNode("h2"));
      }
    });
  }, [editor]);

  return null;
}

function OnChangePlugin({ onChange }: { onChange?: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!onChange) return;

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor);
        onChange(html);
      });
    });
  }, [editor, onChange]);

  return null;
}

export type RichTextEditorProps = {
  className?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
};

export function RichTextEditor({
  className,
  placeholder = "Start writing...",
  onChange,
}: RichTextEditorProps) {
  const initialConfig = {
    namespace: "BlogEditor",
    theme: editorTheme,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      CodeNode,
      CodeHighlightNode,
    ],
    onError: (error: Error) => {
      console.error("Lexical error:", error);
    },
  };

  const handleChange = useCallback(
    (html: string) => {
      onChange?.(html);
    },
    [onChange],
  );

  return (
    <div
      className={cn(
        "min-h-64 w-full rounded-md border border-foreground/20 bg-transparent text-sm text-foreground focus-within:outline-2 focus-within:outline-accent focus-within:-outline-offset-1",
        className,
      )}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-64 px-3 py-2 outline-none" />
            }
            placeholder={
              <div className="pointer-events-none absolute left-3 top-2 text-foreground/40">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <RestrictHeadingsPlugin />
        <OnChangePlugin onChange={handleChange} />
      </LexicalComposer>
    </div>
  );
}
