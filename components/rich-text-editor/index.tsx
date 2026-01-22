"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
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
  $isHeadingNode,
  $isQuoteNode,
} from "@lexical/rich-text";
import {
  ListNode,
  ListItemNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  $isListNode,
} from "@lexical/list";
import { LinkNode } from "@lexical/link";
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
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  FORMAT_TEXT_COMMAND,
  KEY_DOWN_COMMAND,
} from "lexical";
import { $getNearestNodeOfType } from "@lexical/utils";
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
  TextQuote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeHighlightPlugin } from "./plugins/code-highlight-plugin";
import { useCodeBlockState } from "./hooks/use-code-block-state";
import { useLinkState } from "./hooks/use-link-state";
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
  code: "PlaygroundEditorTheme__code relative bg-[#0b0e14] p-4 rounded-lg overflow-x-auto mb-6 font-mono text-sm block",
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
};

function ToolbarPlugin({
  linkDialogState,
  onLinkDialogChange,
}: ToolbarPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [headingTag, setHeadingTag] = useState<string | null>(null);
  const [listType, setListType] = useState<string | null>(null);
  const [isQuote, setIsQuote] = useState(false);
  const { isCodeBlock, codeNodeKey, currentLanguage } = useCodeBlockState();
  const { isLink, linkUrl, linkText, linkNodeKey, selectedText } =
    useLinkState();

  const handleLanguageChange = useCallback(
    (language: string | null) => {
      if (!codeNodeKey || !language) return;

      loadCodeLanguage(language, editor, codeNodeKey);

      editor.update(() => {
        const node = $getNodeByKey(codeNodeKey);
        if ($isCodeNode(node)) {
          node.setLanguage(language);
        }
      });
    },
    [editor, codeNodeKey],
  );

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          onLinkDialogChange({
            open: true,
            isEditing: isLink,
            initialUrl: isLink ? (linkUrl ?? "") : "",
            initialLabel: isLink ? (linkText ?? "") : selectedText,
            linkNodeKey: isLink ? linkNodeKey : null,
          });
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [
    editor,
    isLink,
    linkUrl,
    linkText,
    linkNodeKey,
    selectedText,
    onLinkDialogChange,
  ]);

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

        setIsQuote($isQuoteNode(element));
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

      {/* Secondary buttons - visible on desktop only */}
      <Toggle
        aria-label="Bullet List"
        className={cn(toolbarButtonClass, "hidden md:flex")}
        pressed={listType === "bullet"}
        onPressedChange={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
      >
        <List size={18} />
      </Toggle>
      <Toggle
        aria-label="Numbered List"
        className={cn(toolbarButtonClass, "hidden md:flex")}
        pressed={listType === "number"}
        onPressedChange={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
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
                    INSERT_UNORDERED_LIST_COMMAND,
                    undefined,
                  )
                }
                className={menuItemClass}
              >
                <List size={18} /> Bullet List
              </Menu.Item>
              <Menu.Item
                onClick={() =>
                  editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
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
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      {isCodeBlock && (
        <Select.Root
          value={currentLanguage}
          onValueChange={handleLanguageChange}
        >
          <Select.Trigger className="ml-auto flex items-center gap-1 rounded bg-foreground-10 px-2 py-1 text-xs text-foreground-60 transition-colors hover:bg-foreground-20 hover:text-foreground focus:outline-none">
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

  const handleEditLink = useCallback((data: LinkEditData) => {
    setLinkDialogState({
      open: true,
      isEditing: true,
      initialUrl: data.url,
      initialLabel: data.text,
      linkNodeKey: data.nodeKey,
    });
  }, []);

  return (
    <div
      className={cn(
        "w-full rounded-md border border-foreground-20 bg-transparent text-sm text-foreground focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-accent",
        className,
      )}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin
          linkDialogState={linkDialogState}
          onLinkDialogChange={setLinkDialogState}
        />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                id={id}
                aria-labelledby={ariaLabelledby}
                className="h-64 overflow-y-auto px-3 py-2 outline-none"
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
