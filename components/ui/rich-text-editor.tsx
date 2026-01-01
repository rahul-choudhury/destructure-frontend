"use client";

import { useCallback, useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes } from "@lexical/html";
import {
  HeadingNode,
  QuoteNode,
  $createHeadingNode,
  $isHeadingNode,
} from "@lexical/rich-text";
import {
  ListNode,
  ListItemNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  $isListNode,
} from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { $setBlocksType } from "@lexical/selection";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
} from "lexical";
import { $getNearestNodeOfType } from "@lexical/utils";
import { Toggle } from "@base-ui/react/toggle";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
} from "lucide-react";
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

const toolbarButtonClass =
  "p-2 rounded text-foreground/60 hover:text-foreground hover:bg-foreground/10 focus:outline-2 focus:outline-accent focus:-outline-offset-1 data-[pressed]:text-accent data-[pressed]:bg-foreground/10";

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [headingTag, setHeadingTag] = useState<string | null>(null);
  const [listType, setListType] = useState<string | null>(null);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        setIsBold(selection.hasFormat("bold"));
        setIsItalic(selection.hasFormat("italic"));
        setIsCode(selection.hasFormat("code"));

        const anchorNode = selection.anchor.getNode();
        const element =
          anchorNode.getKey() === "root"
            ? anchorNode
            : anchorNode.getTopLevelElementOrThrow();

        if ($isHeadingNode(element)) {
          setHeadingTag(element.getTag());
        } else {
          setHeadingTag(null);
        }

        const listNode = $getNearestNodeOfType(anchorNode, ListNode);
        if ($isListNode(listNode)) {
          setListType(listNode.getListType());
        } else {
          setListType(null);
        }
      });
    });
  }, [editor]);

  const formatHeading = (tag: "h2" | "h3") => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag));
      }
    });
  };

  return (
    <div className="flex gap-1 border-b border-foreground/20 p-2">
      <Toggle
        aria-label="Bold"
        className={toolbarButtonClass}
        pressed={isBold}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
        }
      >
        <Bold size={18} />
      </Toggle>
      <Toggle
        aria-label="Italic"
        className={toolbarButtonClass}
        pressed={isItalic}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
        }
      >
        <Italic size={18} />
      </Toggle>
      <Toggle
        aria-label="Heading 2"
        className={toolbarButtonClass}
        pressed={headingTag === "h2"}
        onPressedChange={() => formatHeading("h2")}
      >
        <Heading2 size={18} />
      </Toggle>
      <Toggle
        aria-label="Heading 3"
        className={toolbarButtonClass}
        pressed={headingTag === "h3"}
        onPressedChange={() => formatHeading("h3")}
      >
        <Heading3 size={18} />
      </Toggle>
      <Toggle
        aria-label="Bullet List"
        className={toolbarButtonClass}
        pressed={listType === "bullet"}
        onPressedChange={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
      >
        <List size={18} />
      </Toggle>
      <Toggle
        aria-label="Numbered List"
        className={toolbarButtonClass}
        pressed={listType === "number"}
        onPressedChange={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
      >
        <ListOrdered size={18} />
      </Toggle>
      <Toggle
        aria-label="Inline Code"
        className={toolbarButtonClass}
        pressed={isCode}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")
        }
      >
        <Code size={18} />
      </Toggle>
    </div>
  );
}

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
  id?: string;
  className?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
  "aria-labelledby"?: string;
};

export function RichTextEditor({
  id,
  className,
  placeholder = "Start writing...",
  onChange,
  "aria-labelledby": ariaLabelledby,
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
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                id={id}
                aria-labelledby={ariaLabelledby}
                className="min-h-64 px-3 py-2 outline-none"
              />
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
