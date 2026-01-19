import { MDXRemote } from "next-mdx-remote-client/rsc";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";
import { visit } from "unist-util-visit";
import { VideoPlayer } from "./video-player";

import type { Root } from "hast";
import type { MDXComponents } from "mdx/types";

// add target="_blank" to external links
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

const components: MDXComponents = {
  VideoPlayer,
};

export async function MdxContent({ source }: { source: string }) {
  "use cache";

  return (
    <article className="blog-content min-w-0">
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            rehypePlugins: [
              rehypeSlug,
              [
                rehypeAutolinkHeadings,
                {
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
                },
              ],
              [rehypeShiki, { theme: "ayu-dark" }],
              rehypeExternalLinks,
              rehypeImageDimensions,
            ],
          },
        }}
        components={components}
      />
    </article>
  );
}
