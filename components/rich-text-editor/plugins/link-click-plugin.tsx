import { $isLinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { useEffect } from "react";

export type LinkEditData = {
  url: string;
  text: string;
  nodeKey: string;
};

type LinkClickPluginProps = {
  onEditLink: (data: LinkEditData) => void;
};

export function LinkClickPlugin({ onEditLink }: LinkClickPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    const setModKey = (active: boolean) => {
      rootElement.toggleAttribute("data-mod-key", active);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        setModKey(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Meta" || event.key === "Control") {
        setModKey(false);
      }
    };

    const handleBlur = () => {
      setModKey(false);
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const linkElement = target.closest("a");

      if (linkElement && rootElement.contains(linkElement)) {
        event.preventDefault();

        if (event.metaKey || event.ctrlKey) {
          const href = linkElement.getAttribute("href");
          if (href) {
            window.open(href, "_blank", "noopener,noreferrer");
          }
          return;
        }

        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;

          const anchorNode = selection.anchor.getNode();
          const parent = anchorNode.getParent();

          if ($isLinkNode(parent)) {
            onEditLink({
              url: parent.getURL(),
              text: parent.getTextContent(),
              nodeKey: parent.getKey(),
            });
          }
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    rootElement.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      rootElement.removeEventListener("click", handleClick);
      setModKey(false);
    };
  }, [editor, onEditLink]);

  return null;
}
