"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { registerCodeHighlighting, ShikiTokenizer } from "@lexical/code-shiki";

export function CodeHighlightPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return registerCodeHighlighting(editor, {
      ...ShikiTokenizer,
      defaultTheme: "ayu-dark",
    });
  }, [editor]);

  return null;
}
