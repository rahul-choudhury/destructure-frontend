"use client";

import { useCallback, useEffect, useImperativeHandle, useState } from "react";
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
import { CodeNode, CodeHighlightNode, $createCodeNode } from "@lexical/code";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
} from "lexical";
import { $getNearestNodeOfType } from "@lexical/utils";
import { Toggle } from "@base-ui/react/toggle";
import {
  Bold,
  Code,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeHighlightPlugin } from "./plugins/code-highlight-plugin";
import { CodeActionMenuPlugin } from "./plugins/code-action-menu-plugin";
import { useCodeBlockState } from "./hooks/use-code-block-state";

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
  code: "PlaygroundEditorTheme__code relative bg-[#0b0e14] p-4 rounded-lg overflow-x-auto mb-6 font-mono text-sm block",
  quote: "border-l-4 border-foreground/20 pl-4 italic text-foreground/60 mb-5",
};

const toolbarButtonClass =
  "p-2 rounded text-foreground/60 hover:text-foreground hover:bg-foreground/10 focus:outline-2 focus:outline-accent focus:-outline-offset-1 data-[pressed]:text-accent data-[pressed]:bg-foreground/10";

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [headingTag, setHeadingTag] = useState<string | null>(null);
  const [listType, setListType] = useState<string | null>(null);
  const { isCodeBlock } = useCodeBlockState();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        setIsBold(selection.hasFormat("bold"));
        setIsItalic(selection.hasFormat("italic"));

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

  const formatCodeBlock = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (isCodeBlock) {
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createCodeNode("javascript"));
        }
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
        aria-label="Code Block"
        className={toolbarButtonClass}
        pressed={isCodeBlock}
        onPressedChange={formatCodeBlock}
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

function EditorRefPlugin({
  editorRef,
}: {
  editorRef?: React.Ref<RichTextEditorRef>;
}) {
  const [editor] = useLexicalComposerContext();

  useImperativeHandle(
    editorRef,
    () => ({
      getHtml: () => {
        let html = "";
        editor.getEditorState().read(() => {
          html = $generateHtmlFromNodes(editor);
        });
        return html.replace(/\s*class="[^"]*"/g, "");
      },
    }),
    [editor],
  );

  return null;
}

export type RichTextEditorRef = {
  getHtml: () => string;
};

export type RichTextEditorProps = {
  id?: string;
  className?: string;
  placeholder?: string;
  ref?: React.Ref<RichTextEditorRef>;
  "aria-labelledby"?: string;
};

export function RichTextEditor({
  id,
  className,
  placeholder = "Start writing...",
  ref,
  "aria-labelledby": ariaLabelledby,
}: RichTextEditorProps) {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onFloatingAnchorRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      setFloatingAnchorElem(node);
    }
  }, []);

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

  return (
    <div
      className={cn(
        "w-full rounded-md border border-foreground/20 bg-transparent text-sm text-foreground focus-within:outline-2 focus-within:outline-accent focus-within:-outline-offset-1",
        className,
      )}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative" ref={onFloatingAnchorRef}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                id={id}
                aria-labelledby={ariaLabelledby}
                className="h-64 overflow-y-auto px-3 py-2 outline-none"
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
        <EditorRefPlugin editorRef={ref} />
        <CodeHighlightPlugin />
        {floatingAnchorElem && (
          <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
        )}
      </LexicalComposer>
    </div>
  );
}
