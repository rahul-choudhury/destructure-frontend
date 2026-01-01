"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isCodeNode, CodeNode } from "@lexical/code";
import { loadCodeLanguage } from "@lexical/code-shiki";
import { $getNodeByKey, $getSelection, $isRangeSelection } from "lexical";
import { $getNearestNodeOfType } from "@lexical/utils";
import { Select } from "@base-ui/react/select";
import { ChevronDown, Check } from "lucide-react";

const CODE_LANGUAGE_OPTIONS = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "go", label: "Go" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
];

function CodeActionMenu({
  codeElement,
  anchorElement,
  currentLanguage,
  onLanguageChange,
}: {
  codeElement: HTMLElement;
  anchorElement: HTMLElement;
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}) {
  const [position, setPosition] = useState<{
    top: number;
    right: number;
  } | null>({ top: 0, right: 0 });

  useEffect(() => {
    const updatePosition = () => {
      const codeRect = codeElement.getBoundingClientRect();
      const anchorRect = anchorElement.getBoundingClientRect();

      // NOTE: hide if code block top is above the anchor (scrolled out of view)
      const isVisible = codeRect.top >= anchorRect.top - 10;

      if (isVisible) {
        setPosition({
          top: codeRect.top - anchorRect.top + 8,
          right: anchorRect.right - codeRect.right + 8,
        });
      } else {
        setPosition(null);
      }
    };

    updatePosition();

    // NOTE: listen to scroll events on the contenteditable
    const scrollContainer = anchorElement.querySelector("[contenteditable]");
    scrollContainer?.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);

    return () => {
      scrollContainer?.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [codeElement, anchorElement]);

  if (!position) {
    return null;
  }

  return (
    <div
      className="absolute z-10"
      style={{ top: position.top, right: position.right }}
    >
      <Select.Root
        value={currentLanguage}
        onValueChange={onLanguageChange}
      >
        <Select.Trigger className="flex items-center gap-1 rounded bg-foreground/10 px-2 py-1 text-xs text-foreground/60 transition-colors hover:bg-foreground/20 hover:text-foreground focus:outline-none">
          <Select.Value>
            {(value) => CODE_LANGUAGE_OPTIONS.find((opt) => opt.value === value)?.label ?? value}
          </Select.Value>
          <ChevronDown size={12} />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner sideOffset={4} align="end" alignItemWithTrigger={false}>
            <Select.Popup className="max-h-64 w-40 overflow-y-auto rounded-md border border-foreground/20 bg-background shadow-lg origin-(--transform-origin) transition-all duration-150 data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95">
              {CODE_LANGUAGE_OPTIONS.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="flex items-center justify-between px-3 py-1.5 text-sm text-foreground/70 transition-colors outline-none data-[highlighted]:bg-foreground/10 data-[selected]:text-accent"
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
    </div>
  );
}

export function CodeActionMenuPlugin({
  anchorElem,
}: {
  anchorElem: HTMLElement;
}) {
  const [editor] = useLexicalComposerContext();
  const [codeElement, setCodeElement] = useState<HTMLElement | null>(null);
  const [codeNodeKey, setCodeNodeKey] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>("javascript");

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setCodeElement(null);
          setCodeNodeKey(null);
          return;
        }

        const anchorNode = selection.anchor.getNode();
        const codeNode = $getNearestNodeOfType(anchorNode, CodeNode);

        if ($isCodeNode(codeNode)) {
          const key = codeNode.getKey();
          const element = editor.getElementByKey(key);
          if (element) {
            setCodeElement(element);
            setCodeNodeKey(key);
            setCurrentLanguage(codeNode.getLanguage() || "javascript");
          }
        } else {
          setCodeElement(null);
          setCodeNodeKey(null);
        }
      });
    });
  }, [editor]);

  const handleLanguageChange = useCallback(
    (language: string) => {
      if (!codeNodeKey) return;

      loadCodeLanguage(language, editor, codeNodeKey);

      editor.update(() => {
        const node = $getNodeByKey(codeNodeKey);
        if ($isCodeNode(node)) {
          node.setLanguage(language);
        }
      });

      setCurrentLanguage(language);
    },
    [editor, codeNodeKey],
  );

  if (!codeElement || !codeNodeKey) {
    return null;
  }

  return createPortal(
    <CodeActionMenu
      codeElement={codeElement}
      anchorElement={anchorElem}
      currentLanguage={currentLanguage}
      onLanguageChange={handleLanguageChange}
    />,
    anchorElem,
  );
}
