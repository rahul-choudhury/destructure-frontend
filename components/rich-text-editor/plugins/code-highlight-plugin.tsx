import { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { registerCodeHighlighting, ShikiTokenizer } from "@lexical/code-shiki";
import { $nodesOfType } from "lexical";
import { CodeNode } from "@lexical/code";

export function CodeHighlightPlugin() {
  const [editor] = useLexicalComposerContext();
  const [theme, setTheme] = useState<"vitesse-light" | "vitesse-dark">(
    "vitesse-light",
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = () =>
      setTheme(media.matches ? "vitesse-dark" : "vitesse-light");

    updateTheme();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", updateTheme);
      return () => media.removeEventListener("change", updateTheme);
    }

    media.addListener(updateTheme);
    return () => media.removeListener(updateTheme);
  }, []);

  useEffect(() => {
    return registerCodeHighlighting(editor, {
      ...ShikiTokenizer,
      defaultTheme: theme,
    });
  }, [editor, theme]);

  useEffect(() => {
    editor.update(() => {
      const nodes = $nodesOfType(CodeNode);
      for (const node of nodes) {
        node.setTheme(theme);
      }
    });
  }, [editor, theme]);

  return null;
}
