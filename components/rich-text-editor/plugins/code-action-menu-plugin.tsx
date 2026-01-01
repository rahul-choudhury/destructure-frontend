"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isCodeNode, CodeNode } from "@lexical/code";
import { loadCodeLanguage } from "@lexical/code-shiki";
import { $getNodeByKey, $getSelection, $isRangeSelection } from "lexical";
import { $getNearestNodeOfType } from "@lexical/utils";
import { ChevronDown } from "lucide-react";

const CODE_LANGUAGE_OPTIONS: [string, string][] = [
  ["javascript", "JavaScript"],
  ["typescript", "TypeScript"],
  ["go", "Go"],
  ["python", "Python"],
  ["java", "Java"],
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
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    right: number;
  } | null>({ top: 0, right: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLabel = useMemo(() => {
    const option = CODE_LANGUAGE_OPTIONS.find(
      ([value]) => value === currentLanguage,
    );
    return option ? option[1] : currentLanguage;
  }, [currentLanguage]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!position) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="absolute z-10"
      style={{ top: position.top, right: position.right }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 rounded bg-foreground/10 px-2 py-1 text-xs text-foreground/60 transition-colors hover:bg-foreground/20 hover:text-foreground"
      >
        {currentLabel}
        <ChevronDown size={12} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 max-h-64 w-40 overflow-y-auto rounded-md border border-foreground/20 bg-background shadow-lg">
          {CODE_LANGUAGE_OPTIONS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                onLanguageChange(value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-foreground/10 ${
                value === currentLanguage
                  ? "bg-foreground/10 text-accent"
                  : "text-foreground/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
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
