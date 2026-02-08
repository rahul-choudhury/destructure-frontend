import { $isCodeNode, CodeNode } from "@lexical/code";
import { $isLinkNode } from "@lexical/link";
import { $isListNode, ListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import { $getNearestNodeOfType } from "@lexical/utils";
import { $getSelection, $isRangeSelection } from "lexical";
import { useEffect, useState } from "react";

export type ToolbarState = {
  isBold: boolean;
  isItalic: boolean;
  isCode: boolean;
  headingTag: string | null;
  listType: string | null;
  isQuote: boolean;
  isCodeBlock: boolean;
  codeNodeKey: string | null;
  currentLanguage: string;
  isLink: boolean;
  linkUrl: string | null;
  linkText: string | null;
  selectedText: string;
  linkNodeKey: string | null;
};

const DEFAULT_STATE: ToolbarState = {
  isBold: false,
  isItalic: false,
  isCode: false,
  headingTag: null,
  listType: null,
  isQuote: false,
  isCodeBlock: false,
  codeNodeKey: null,
  currentLanguage: "javascript",
  isLink: false,
  linkUrl: null,
  linkText: null,
  selectedText: "",
  linkNodeKey: null,
};

export function useToolbarState(): ToolbarState {
  const [editor] = useLexicalComposerContext();
  const [state, setState] = useState<ToolbarState>(DEFAULT_STATE);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setState((prev) => (prev === DEFAULT_STATE ? prev : DEFAULT_STATE));
          return;
        }

        const anchorNode = selection.anchor.getNode();
        const element =
          anchorNode.getKey() === "root"
            ? anchorNode
            : anchorNode.getTopLevelElementOrThrow();

        const codeNode = $getNearestNodeOfType(anchorNode, CodeNode);
        const listNode = $getNearestNodeOfType(anchorNode, ListNode);
        const parent = anchorNode.getParent();
        const isLinkNode = $isLinkNode(parent);

        const next: ToolbarState = {
          isBold: selection.hasFormat("bold"),
          isItalic: selection.hasFormat("italic"),
          isCode: selection.hasFormat("code"),
          headingTag: $isHeadingNode(element) ? element.getTag() : null,
          listType: $isListNode(listNode) ? listNode.getListType() : null,
          isQuote: $isQuoteNode(element),
          isCodeBlock: $isCodeNode(codeNode),
          codeNodeKey: $isCodeNode(codeNode) ? codeNode.getKey() : null,
          currentLanguage: $isCodeNode(codeNode)
            ? codeNode.getLanguage() || "javascript"
            : "javascript",
          isLink: isLinkNode,
          linkUrl: isLinkNode ? parent.getURL() : null,
          linkText: isLinkNode ? parent.getTextContent() : null,
          selectedText: selection.getTextContent(),
          linkNodeKey: isLinkNode ? parent.getKey() : null,
        };

        setState((prev) => {
          for (const key in next) {
            if (
              prev[key as keyof ToolbarState] !==
              next[key as keyof ToolbarState]
            ) {
              return next;
            }
          }
          return prev;
        });
      });
    });
  }, [editor]);

  return state;
}
