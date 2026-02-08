import { CodeHighlightNode } from "@lexical/code"
import type {
  DOMConversionMap,
  DOMExportOutput,
  LexicalEditor,
  NodeKey,
} from "lexical"

export class CustomCodeHighlightNode extends CodeHighlightNode {
  static getType(): string {
    return "custom-code-highlight"
  }

  static clone(node: CustomCodeHighlightNode): CustomCodeHighlightNode {
    return new CustomCodeHighlightNode(
      node.__text,
      node.__highlightType ?? undefined,
      node.__key,
    )
  }

  static importDOM(): DOMConversionMap | null {
    return CodeHighlightNode.importDOM()
  }

  constructor(text: string = "", highlightType?: string, key?: NodeKey) {
    super(text, highlightType, key)
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const result = super.exportDOM(editor)
    const element = result.element as HTMLElement | null

    // NOTE: removes the white-space: pre-wrap that TextNode.exportDOM adds
    // lexical does the pre-wrap by default. makes the code wrap at weird places on mobile.
    if (element?.style) {
      element.style.removeProperty("white-space")
    }

    return result
  }
}
