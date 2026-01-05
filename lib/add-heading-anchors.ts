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

export async function addHeadingAnchors(html: string): Promise<string> {
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
    .process(html);

  return String(result);
}
