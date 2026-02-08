import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { DecoratorNode } from "lexical";
import type { JSX } from "react";

export type SerializedVideoNode = Spread<
  {
    src: string;
  },
  SerializedLexicalNode
>;

export class VideoNode extends DecoratorNode<JSX.Element> {
  __src: string;

  static getType(): string {
    return "video";
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__src, node.__key);
  }

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    return $createVideoNode(serializedNode.src);
  }

  static importDOM(): DOMConversionMap | null {
    return {
      video: () => ({
        conversion: (element: HTMLElement): DOMConversionOutput | null => {
          const video = element as HTMLVideoElement;
          if (!video.src) {
            return null;
          }
          return {
            node: $createVideoNode(video.src),
          };
        },
        priority: 0,
      }),
    };
  }

  constructor(src: string, key?: NodeKey) {
    super(key);
    this.__src = src;
  }

  exportJSON(): SerializedVideoNode {
    return {
      type: "video",
      version: 1,
      src: this.__src,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "editor-video";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const video = document.createElement("video");
    video.src = this.__src;
    video.controls = true;
    return { element: video };
  }

  decorate(): JSX.Element {
    return (
      // biome-ignore lint/a11y/useMediaCaption: Videos in blog posts are user-provided and may not have captions available
      <video
        src={this.__src}
        controls
        className="my-4 h-auto max-w-full rounded-lg"
      />
    );
  }

  isInline(): boolean {
    return false;
  }
}

export function $createVideoNode(src: string): VideoNode {
  return new VideoNode(src);
}

export function $isVideoNode(
  node: LexicalNode | null | undefined,
): node is VideoNode {
  return node instanceof VideoNode;
}
