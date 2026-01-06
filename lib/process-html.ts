import { rehype } from "rehype";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import { visit } from "unist-util-visit";

import type { Root } from "hast";

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

export async function processHtml(html: string): Promise<string> {
  const result = await rehype()
    .use(rehypeSlug)
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

  return String(result);
}
