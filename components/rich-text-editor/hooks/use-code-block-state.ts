"use client";

import { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isCodeNode, CodeNode } from "@lexical/code";
import { $getSelection, $isRangeSelection } from "lexical";
import { $getNearestNodeOfType } from "@lexical/utils";

export type CodeBlockState = {
  isCodeBlock: boolean;
  codeNodeKey: string | null;
  currentLanguage: string;
};

export function useCodeBlockState(): CodeBlockState {
  const [editor] = useLexicalComposerContext();
  const [state, setState] = useState<CodeBlockState>({
    isCodeBlock: false,
    codeNodeKey: null,
    currentLanguage: "javascript",
  });

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setState({
            isCodeBlock: false,
            codeNodeKey: null,
            currentLanguage: "javascript",
          });
          return;
        }

        const anchorNode = selection.anchor.getNode();
        const codeNode = $getNearestNodeOfType(anchorNode, CodeNode);

        if ($isCodeNode(codeNode)) {
          setState({
            isCodeBlock: true,
            codeNodeKey: codeNode.getKey(),
            currentLanguage: codeNode.getLanguage() || "javascript",
          });
          return;
        }

        setState({
          isCodeBlock: false,
          codeNodeKey: null,
          currentLanguage: "javascript",
        });
      });
    });
  }, [editor]);

  return state;
}
