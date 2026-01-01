"use client";

import { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isCodeNode, CodeNode } from "@lexical/code";
import { $getSelection, $isRangeSelection } from "lexical";
import { $getNearestNodeOfType } from "@lexical/utils";

export type CodeBlockState = {
  isCodeBlock: boolean;
  codeElement: HTMLElement | null;
  codeNodeKey: string | null;
  currentLanguage: string;
};

export function useCodeBlockState(): CodeBlockState {
  const [editor] = useLexicalComposerContext();
  const [state, setState] = useState<CodeBlockState>({
    isCodeBlock: false,
    codeElement: null,
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
            codeElement: null,
            codeNodeKey: null,
            currentLanguage: "javascript",
          });
          return;
        }

        const anchorNode = selection.anchor.getNode();
        const codeNode = $getNearestNodeOfType(anchorNode, CodeNode);

        if ($isCodeNode(codeNode)) {
          const key = codeNode.getKey();
          const element = editor.getElementByKey(key);
          if (element) {
            setState({
              isCodeBlock: true,
              codeElement: element,
              codeNodeKey: key,
              currentLanguage: codeNode.getLanguage() || "javascript",
            });
            return;
          }
        }

        setState({
          isCodeBlock: false,
          codeElement: null,
          codeNodeKey: null,
          currentLanguage: "javascript",
        });
      });
    });
  }, [editor]);

  return state;
}
