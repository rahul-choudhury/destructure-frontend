import { rehype } from "rehype";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import { toString } from "hast-util-to-string";
import { visit } from "unist-util-visit";

import type { Element, Root } from "hast";

// Table of Contents
export interface TocEntry {
  id: string;
  title: string;
  level: number;
}

function rehypeExternalLinks() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "a") {
        const className = node.properties?.className;
        const isHeadingAnchor =
          Array.isArray(className) && className.includes("heading-anchor");
        if (isHeadingAnchor) return;

        node.properties = node.properties || {};
        node.properties.target = "_blank";
        node.properties.rel = "noopener noreferrer";
      }
    });
  };
}

function rehypeImageDimensions() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "img") {
        const src = node.properties?.src;
        if (typeof src !== "string") return;

        try {
          const url = new URL(src);
          const width = url.searchParams.get("width");
          const height = url.searchParams.get("height");

          node.properties = node.properties || {};
          if (width) node.properties.width = width;
          if (height) node.properties.height = height;
        } catch {
          // skip invalid urls
        }
      }
    });
  };
}

export interface ProcessHtmlResult {
  html: string;
  toc: TocEntry[];
}

export async function processHtml(html: string): Promise<ProcessHtmlResult> {
  const toc: TocEntry[] = [];

  const result = await rehype()
    .data("settings", { fragment: true })
    .use(rehypeSlug)
    .use(() => (tree: Root) => {
      visit(tree, "element", (node: Element) => {
        const match = node.tagName.match(/^h([1-6])$/);
        if (match && node.properties?.id) {
          toc.push({
            id: String(node.properties.id),
            title: toString(node),
            level: parseInt(match[1], 10),
          });
        }
      });
    })
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: {
        className: ["heading-anchor"],
        ariaLabel: "Link to this section",
      },
      content: {
        type: "element",
        tagName: "span",
        properties: { className: ["anchor-icon"] },
        children: [{ type: "text", value: "#" }],
      },
    })
    .use(rehypeExternalLinks)
    .use(rehypeImageDimensions)
    .process(html);

  return { html: String(result), toc };
}
