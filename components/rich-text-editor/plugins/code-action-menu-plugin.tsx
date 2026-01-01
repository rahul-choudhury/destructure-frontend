"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isCodeNode } from "@lexical/code";
import { loadCodeLanguage } from "@lexical/code-shiki";
import { $getNodeByKey, $getNearestNodeFromDOMNode } from "lexical";
import { ChevronDown } from "lucide-react";
import { debounce } from "@/lib/utils";

const CODE_LANGUAGE_OPTIONS: [string, string][] = [
  ["javascript", "JavaScript"],
  ["typescript", "TypeScript"],
  ["go", "Go"],
  ["python", "Python"],
  ["java", "Java"],
];

type Position = {
  top: number;
  right: number;
};

function CodeActionMenu({
  position,
  currentLanguage,
  onLanguageChange,
}: {
  position: Position;
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLabel = useMemo(() => {
    const option = CODE_LANGUAGE_OPTIONS.find(
      ([value]) => value === currentLanguage,
    );
    return option ? option[1] : currentLanguage;
  }, [currentLanguage]);

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

  return (
    <div
      ref={menuRef}
      className="absolute z-10"
      style={{ top: position.top + 8, right: position.right + 8 }}
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
  const [position, setPosition] = useState<Position | null>(null);
  const [codeNodeKey, setCodeNodeKey] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>("javascript");

  const updatePosition = useCallback(
    (codeElement: HTMLElement) => {
      const anchorRect = anchorElem.getBoundingClientRect();
      const codeRect = codeElement.getBoundingClientRect();

      setPosition({
        top: codeRect.top - anchorRect.top,
        right: anchorRect.right - codeRect.right,
      });
    },
    [anchorElem],
  );

  useEffect(() => {
    const onMouseMove = debounce((event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const codeElement = target.closest("code.PlaygroundEditorTheme__code");

      if (codeElement instanceof HTMLElement) {
        editor.read(() => {
          const node = $getNearestNodeFromDOMNode(codeElement);
          if ($isCodeNode(node)) {
            setCodeNodeKey(node.getKey());
            setCurrentLanguage(node.getLanguage() || "javascript");
            updatePosition(codeElement);
          }
        });
      } else {
        setPosition(null);
        setCodeNodeKey(null);
      }
    }, 50);

    const editorElement = editor.getRootElement();
    if (editorElement) {
      editorElement.addEventListener("mousemove", onMouseMove);
    }

    return () => {
      if (editorElement) {
        editorElement.removeEventListener("mousemove", onMouseMove);
      }
    };
  }, [editor, updatePosition]);

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

  if (!position || !codeNodeKey) {
    return null;
  }

  return createPortal(
    <CodeActionMenu
      position={position}
      currentLanguage={currentLanguage}
      onLanguageChange={handleLanguageChange}
    />,
    anchorElem,
  );
}
