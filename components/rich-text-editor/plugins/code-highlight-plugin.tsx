import { useEffect, useSyncExternalStore } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { registerCodeHighlighting, ShikiTokenizer } from "@lexical/code-shiki";
import { $nodesOfType } from "lexical";
import { CodeNode } from "@lexical/code";

type CodeTheme = "vitesse-light" | "vitesse-dark";

const darkQuery = "(prefers-color-scheme: dark)";

function subscribeToColorScheme(callback: () => void) {
  const media = window.matchMedia(darkQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getColorSchemeSnapshot(): CodeTheme {
  return window.matchMedia(darkQuery).matches ? "vitesse-dark" : "vitesse-light";
}

function getColorSchemeServerSnapshot(): CodeTheme {
  return "vitesse-light";
}

export function CodeHighlightPlugin() {
  const [editor] = useLexicalComposerContext();
  const theme = useSyncExternalStore(
    subscribeToColorScheme,
    getColorSchemeSnapshot,
    getColorSchemeServerSnapshot,
  );

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
