import {
  TRANSFORMERS,
  ElementTransformer,
  type Transformer,
} from "@lexical/markdown";
import type { LexicalNode } from "lexical";
import { ImageNode, $createImageNode, $isImageNode } from "./nodes/image-node";
import { VideoNode, $createVideoNode, $isVideoNode } from "./nodes/video-node";

const IMAGE_TRANSFORMER: ElementTransformer = {
  dependencies: [ImageNode],
  export: (node: LexicalNode) => {
    if (!$isImageNode(node)) return null;
    const alt = node.__alt || "";
    const src = node.__src;
    return `![${alt}](${src})`;
  },
  regExp: /^!\[([^\]]*)\]\(([^)]+)\)\s*$/,
  replace: (parentNode, _children, match) => {
    const [, alt, src] = match;
    const imageNode = $createImageNode(src, alt);
    parentNode.replace(imageNode);
  },
  type: "element",
};

const VIDEO_TRANSFORMER: ElementTransformer = {
  dependencies: [VideoNode],
  export: (node: LexicalNode) => {
    if (!$isVideoNode(node)) return null;
    const src = node.__src;
    return `<VideoPlayer src="${src}" />`;
  },
  regExp: /^<VideoPlayer\s+src="([^"]+)"[^>]*\/?>\s*$/,
  replace: (parentNode, _children, match) => {
    const [, src] = match;
    const videoNode = $createVideoNode(src);
    parentNode.replace(videoNode);
  },
  type: "element",
};

// Filter out the default horizontal rule transformer if we don't need it
// and add our custom transformers
export const BLOG_TRANSFORMERS: Transformer[] = [
  IMAGE_TRANSFORMER,
  VIDEO_TRANSFORMER,
  ...TRANSFORMERS,
];
