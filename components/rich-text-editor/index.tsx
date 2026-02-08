"use client";

import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $convertToMarkdownString,
  $convertFromMarkdownString,
} from "@lexical/markdown";
import { BLOG_TRANSFORMERS } from "./transformers";
import {
  HeadingNode,
  QuoteNode,
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import {
  ListNode,
  ListItemNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { LinkNode, $isLinkNode } from "@lexical/link";
import {
  CodeNode,
  CodeHighlightNode,
  $createCodeNode,
  $isCodeNode,
} from "@lexical/code";
import { loadCodeLanguage } from "@lexical/code-shiki";
import { CustomCodeHighlightNode } from "./nodes/custom-code-highlight-node";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $addUpdateTag,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $setSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  FORMAT_TEXT_COMMAND,
  KEY_DOWN_COMMAND,
  SKIP_SELECTION_FOCUS_TAG,
} from "lexical";
import { Toggle } from "@base-ui/react/toggle";
import { Select } from "@base-ui/react/select";
import { Menu } from "@base-ui/react/menu";
import {
  Bold,
  Check,
  ChevronDown,
  Code,
  CodeXml,
  Ellipsis,
  Italic,
  Heading2,
  Heading3,
  Link,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  TextQuote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeHighlightPlugin } from "./plugins/code-highlight-plugin";
import { useToolbarState } from "./hooks/use-toolbar-state";
import { LinkDialog } from "./components/link-dialog";
import {
  LinkClickPlugin,
  type LinkEditData,
} from "./plugins/link-click-plugin";
import { ImageNode } from "./nodes/image-node";
import { VideoNode } from "./nodes/video-node";
import { ImagePlugin } from "./plugins/image-plugin";
import { VideoPlugin } from "./plugins/video-plugin";
import { MediaUploadDialog } from "./components/media-upload-dialog";
import { CODE_LANGUAGE_OPTIONS } from "@/lib/config";

const editorTheme = {
  paragraph: "text-foreground-70 mb-5",
  heading: {
    h2: "text-3xl font-medium mt-10 mb-4",
    h3: "text-xl font-medium text-foreground mt-8 mb-3",
  },
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "font-mono text-sm text-accent bg-foreground-10 px-1.5 py-0.5 rounded",
  },
  link: "text-accent underline underline-offset-4 transition-opacity duration-200 hover:opacity-80",
  list: {
    ul: "list-disc list-inside mb-5 pl-4 space-y-1",
    ol: "list-decimal list-inside mb-5 pl-4 space-y-1",
    listitem: "text-foreground-70",
    nested: {
      listitem: "list-none",
    },
  },
  code: "PlaygroundEditorTheme__code relative bg-foreground-5 p-4 rounded-lg overflow-x-auto mb-6 font-mono text-sm block",
  quote: "border-l-4 border-foreground-20 pl-4 italic text-foreground-60 mb-5",
};

export const toolbarButtonClass =
  "p-2 rounded text-foreground-60 hover:text-foreground hover:bg-foreground-10 focus:outline-2 focus:outline-accent focus:-outline-offset-1 data-[pressed]:text-accent data-[pressed]:bg-foreground-10";

const menuItemClass =
  "flex items-center gap-2 px-3 py-2 text-sm text-foreground-70 outline-none cursor-default rounded data-highlighted:bg-foreground-10 data-highlighted:text-foreground";

type LinkDialogState = {
  open: boolean;
  isEditing: boolean;
  initialUrl: string;
  initialLabel: string;
  linkNodeKey: string | null;
};

type ToolbarPluginProps = {
  linkDialogState: LinkDialogState;
  onLinkDialogChange: (state: LinkDialogState) => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
};

function ToolbarPlugin({
  linkDialogState,
  onLinkDialogChange,
  isFullscreen,
  onFullscreenToggle,
}: ToolbarPluginProps) {
  const [editor] = useLexicalComposerContext();
  const {
    isBold,
    isItalic,
    isCode,
    headingTag,
    listType,
    isQuote,
    isCodeBlock,
    codeNodeKey,
    currentLanguage,
    isLink,
    linkUrl,
    linkText,
    linkNodeKey,
    selectedText,
  } = useToolbarState();

  const handleLanguageChange = (language: string | null) => {
    if (!codeNodeKey || !language) return;

    loadCodeLanguage(language, editor, codeNodeKey);

    editor.update(() => {
      const node = $getNodeByKey(codeNodeKey);
      if ($isCodeNode(node)) {
        node.setLanguage(language);
      }
    });
  };

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();

          editor.getEditorState().read(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;

            const anchorNode = selection.anchor.getNode();
            const parent = anchorNode.getParent();
            const isLinkNow = $isLinkNode(parent);

            onLinkDialogChange({
              open: true,
              isEditing: isLinkNow,
              initialUrl: isLinkNow ? parent.getURL() : "",
              initialLabel: isLinkNow
                ? parent.getTextContent()
                : selection.getTextContent(),
              linkNodeKey: isLinkNow ? parent.getKey() : null,
            });
          });

          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor, onLinkDialogChange]);

  const formatHeading = (tag: "h2" | "h3", pressed: boolean) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (pressed) {
          $setBlocksType(selection, () => $createHeadingNode(tag));
        } else {
          $setBlocksType(selection, () => $createParagraphNode());
        }
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

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (isQuote) {
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      }
    });
  };

  const openLinkDialog = () => {
    onLinkDialogChange({
      open: true,
      isEditing: isLink,
      initialUrl: isLink ? (linkUrl ?? "") : "",
      initialLabel: isLink ? (linkText ?? "") : selectedText,
      linkNodeKey: isLink ? linkNodeKey : null,
    });
  };

  return (
    <div className="flex flex-wrap gap-1 border-b border-foreground-20 p-2">
      {/* Primary buttons - always visible */}
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
        onPressedChange={(pressed) => formatHeading("h2", pressed)}
      >
        <Heading2 size={18} />
      </Toggle>
      <Toggle
        aria-label="Heading 3"
        className={toolbarButtonClass}
        pressed={headingTag === "h3"}
        onPressedChange={(pressed) => formatHeading("h3", pressed)}
      >
        <Heading3 size={18} />
      </Toggle>

      {/* Secondary buttons - visible on desktop only */}
      <Toggle
        aria-label="Bullet List"
        className={cn(toolbarButtonClass, "hidden md:flex")}
        pressed={listType === "bullet"}
        onPressedChange={(pressed) =>
          editor.dispatchCommand(
            pressed ? INSERT_UNORDERED_LIST_COMMAND : REMOVE_LIST_COMMAND,
            undefined,
          )
        }
      >
        <List size={18} />
      </Toggle>
      <Toggle
        aria-label="Numbered List"
        className={cn(toolbarButtonClass, "hidden md:flex")}
        pressed={listType === "number"}
        onPressedChange={(pressed) =>
          editor.dispatchCommand(
            pressed ? INSERT_ORDERED_LIST_COMMAND : REMOVE_LIST_COMMAND,
            undefined,
          )
        }
      >
        <ListOrdered size={18} />
      </Toggle>
      <Toggle
        aria-label="Inline Code"
        className={cn(toolbarButtonClass, "hidden md:flex")}
        pressed={isCode}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")
        }
      >
        <CodeXml size={18} />
      </Toggle>
      <Toggle
        aria-label="Code Block"
        className={cn(toolbarButtonClass, "hidden md:flex")}
        pressed={isCodeBlock}
        onPressedChange={formatCodeBlock}
      >
        <Code size={18} />
      </Toggle>
      <Toggle
        aria-label="Blockquote"
        className={cn(toolbarButtonClass, "hidden md:flex")}
        pressed={isQuote}
        onPressedChange={formatQuote}
      >
        <TextQuote size={18} />
      </Toggle>
      <Toggle
        aria-label="Link"
        className={cn(toolbarButtonClass, "hidden md:flex")}
        pressed={isLink}
        onPressedChange={openLinkDialog}
      >
        <Link size={18} />
      </Toggle>
      <div className="hidden md:block">
        <MediaUploadDialog toolbarButtonClass={toolbarButtonClass} />
      </div>

      {/* Fullscreen toggle - right side */}
      <Toggle
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        className={cn(toolbarButtonClass, "ml-auto hidden md:flex")}
        pressed={isFullscreen}
        onPressedChange={onFullscreenToggle}
      >
        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </Toggle>

      {/* Overflow menu - visible on mobile only */}
      <Menu.Root>
        <Menu.Trigger className={cn(toolbarButtonClass, "md:hidden")}>
          <Ellipsis size={18} />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={4}>
            <Menu.Popup className="min-w-40 origin-(--transform-origin) rounded-md border border-foreground-20 bg-background p-1 shadow-lg transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
              <Menu.Item
                onClick={() =>
                  editor.dispatchCommand(
                    listType === "bullet"
                      ? REMOVE_LIST_COMMAND
                      : INSERT_UNORDERED_LIST_COMMAND,
                    undefined,
                  )
                }
                className={menuItemClass}
              >
                <List size={18} /> Bullet List
              </Menu.Item>
              <Menu.Item
                onClick={() =>
                  editor.dispatchCommand(
                    listType === "number"
                      ? REMOVE_LIST_COMMAND
                      : INSERT_ORDERED_LIST_COMMAND,
                    undefined,
                  )
                }
                className={menuItemClass}
              >
                <ListOrdered size={18} /> Numbered List
              </Menu.Item>
              <Menu.Item
                onClick={() =>
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")
                }
                className={menuItemClass}
              >
                <CodeXml size={18} /> Inline Code
              </Menu.Item>
              <Menu.Item onClick={formatCodeBlock} className={menuItemClass}>
                <Code size={18} /> Code Block
              </Menu.Item>
              <Menu.Item onClick={formatQuote} className={menuItemClass}>
                <TextQuote size={18} /> Blockquote
              </Menu.Item>
              <Menu.Item onClick={openLinkDialog} className={menuItemClass}>
                <Link size={18} /> Link
              </Menu.Item>
              <MediaUploadDialog toolbarButtonClass={menuItemClass}>
                Media
              </MediaUploadDialog>
              <Menu.Item onClick={onFullscreenToggle} className={menuItemClass}>
                {isFullscreen ? (
                  <Minimize2 size={18} />
                ) : (
                  <Maximize2 size={18} />
                )}
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      {isCodeBlock && (
        <Select.Root
          value={currentLanguage}
          onValueChange={handleLanguageChange}
        >
          <Select.Trigger className="flex items-center gap-1 rounded bg-foreground-10 px-2 py-1 text-xs text-foreground-60 transition-colors hover:bg-foreground-20 hover:text-foreground focus:outline-none">
            <Select.Value>
              {(value) =>
                CODE_LANGUAGE_OPTIONS.find((opt) => opt.value === value)
                  ?.label ?? value
              }
            </Select.Value>
            <ChevronDown size={12} />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner
              sideOffset={4}
              align="end"
              alignItemWithTrigger={false}
            >
              <Select.Popup className="max-h-64 w-40 origin-(--transform-origin) overflow-y-auto rounded-md border border-foreground-20 bg-background shadow-lg transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
                {CODE_LANGUAGE_OPTIONS.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    className="flex items-center justify-between px-3 py-1.5 text-sm text-foreground-70 transition-colors outline-none data-highlighted:bg-foreground-10 data-selected:text-accent"
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator>
                      <Check size={14} />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      )}
      <LinkDialog
        open={linkDialogState.open}
        onOpenChange={(open) =>
          onLinkDialogChange({ ...linkDialogState, open })
        }
        isEditing={linkDialogState.isEditing}
        initialUrl={linkDialogState.initialUrl}
        initialLabel={linkDialogState.initialLabel}
        linkNodeKey={linkDialogState.linkNodeKey}
      />
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

function FocusResetPlugin() {
  const [editor] = useLexicalComposerContext();
  const pathname = usePathname();

  useEffect(() => {
    editor.update(() => {
      $addUpdateTag(SKIP_SELECTION_FOCUS_TAG);
      $setSelection(null);
    });
    editor.blur();
  }, [editor, pathname]);

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
      getMarkdown: () => {
        let markdown = "";
        editor.getEditorState().read(() => {
          markdown = $convertToMarkdownString(BLOG_TRANSFORMERS);
        });
        return markdown;
      },
      setMarkdown: (markdown: string) => {
        editor.update(() => {
          $getRoot().clear();
          if (markdown) {
            $convertFromMarkdownString(markdown, BLOG_TRANSFORMERS);
          } else {
            $getRoot().append($createParagraphNode());
          }
        });

        if (!markdown) {
          const rootElement = editor.getRootElement();
          if (rootElement instanceof HTMLElement) {
            rootElement.blur();
          }
        }
      },
    }),
    [editor],
  );

  return null;
}

function InitialContentPlugin({ initialContent }: { initialContent?: string }) {
  const [editor] = useLexicalComposerContext();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (initialContent && !isInitialized.current) {
      isInitialized.current = true;
      editor.update(() => {
        $getRoot().clear();
        $convertFromMarkdownString(initialContent, BLOG_TRANSFORMERS);
      });
    }
  }, [editor, initialContent]);

  return null;
}

export type RichTextEditorRef = {
  getMarkdown: () => string;
  setMarkdown: (markdown: string) => void;
};

export type RichTextEditorProps = {
  id?: string;
  className?: string;
  placeholder?: string;
  initialContent?: string;
  ref?: React.Ref<RichTextEditorRef>;
  "aria-labelledby"?: string;
};

function handleLexicalError(error: Error) {
  console.error("Lexical error:", error);
}

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
    CustomCodeHighlightNode,
    {
      replace: CodeHighlightNode,
      with: (node: CodeHighlightNode) =>
        new CustomCodeHighlightNode(
          node.__text,
          node.__highlightType ?? undefined,
        ),
      withKlass: CustomCodeHighlightNode,
    },
    ImageNode,
    VideoNode,
  ],
  onError: handleLexicalError,
};

export function RichTextEditor({
  id,
  className,
  placeholder = "Start writing...",
  initialContent,
  ref,
  "aria-labelledby": ariaLabelledby,
}: RichTextEditorProps) {
  const [linkDialogState, setLinkDialogState] = useState<LinkDialogState>({
    open: false,
    isEditing: false,
    initialUrl: "",
    initialLabel: "",
    linkNodeKey: null,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleEditLink = (data: LinkEditData) => {
    setLinkDialogState({
      open: true,
      isEditing: true,
      initialUrl: data.url,
      initialLabel: data.text,
      linkNodeKey: data.nodeKey,
    });
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen((prev) => !prev);
  };

  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  return (
    <div
      className={cn(
        "w-full rounded-md border border-foreground-20 bg-transparent text-sm text-foreground focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-accent",
        isFullscreen &&
          "fixed inset-4 z-50 flex w-auto flex-col bg-background shadow-2xl md:inset-8",
        className,
      )}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin
          linkDialogState={linkDialogState}
          onLinkDialogChange={setLinkDialogState}
          isFullscreen={isFullscreen}
          onFullscreenToggle={handleFullscreenToggle}
        />
        <div
          className={cn(
            "relative",
            isFullscreen && "min-h-0 flex-1 overflow-hidden",
          )}
        >
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                id={id}
                aria-labelledby={ariaLabelledby}
                className={cn(
                  "overflow-y-auto px-3 py-2 outline-none",
                  isFullscreen ? "absolute inset-0" : "h-64",
                )}
              />
            }
            placeholder={
              <div className="pointer-events-none absolute top-2 left-3 text-foreground-40">
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
        <FocusResetPlugin />
        <EditorRefPlugin editorRef={ref} />
        <CodeHighlightPlugin />
        <InitialContentPlugin initialContent={initialContent} />
        <ImagePlugin />
        <VideoPlugin />
        <LinkClickPlugin onEditLink={handleEditLink} />
      </LexicalComposer>
    </div>
  );
}
