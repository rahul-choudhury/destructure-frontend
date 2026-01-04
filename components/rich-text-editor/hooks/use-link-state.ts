"use client";

import { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isLinkNode } from "@lexical/link";
import { $getSelection, $isRangeSelection } from "lexical";

export type LinkState = {
  isLink: boolean;
  linkUrl: string | null;
  linkText: string | null;
  selectedText: string;
  linkNodeKey: string | null;
};

export function useLinkState(): LinkState {
  const [editor] = useLexicalComposerContext();
  const [state, setState] = useState<LinkState>({
    isLink: false,
    linkUrl: null,
    linkText: null,
    selectedText: "",
    linkNodeKey: null,
  });

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setState({
            isLink: false,
            linkUrl: null,
            linkText: null,
            selectedText: "",
            linkNodeKey: null,
          });
          return;
        }

        const selectedText = selection.getTextContent();
        const anchorNode = selection.anchor.getNode();
        const parent = anchorNode.getParent();

        if ($isLinkNode(parent)) {
          setState({
            isLink: true,
            linkUrl: parent.getURL(),
            linkText: parent.getTextContent(),
            selectedText,
            linkNodeKey: parent.getKey(),
          });
        } else {
          setState({
            isLink: false,
            linkUrl: null,
            linkText: null,
            selectedText,
            linkNodeKey: null,
          });
        }
      });
    });
  }, [editor]);

  return state;
}
