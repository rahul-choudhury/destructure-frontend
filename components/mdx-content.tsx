import { evaluate } from "next-mdx-remote-client/rsc"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeShiki from "@shikijs/rehype"
import { visit } from "unist-util-visit"
import { toString } from "hast-util-to-string"
import { VideoPlayer } from "./video-player"
import { TableOfContents } from "./table-of-contents"

import type { Element, Root } from "hast"
import type { MDXComponents } from "mdx/types"
import { cacheLife } from "next/cache"

export interface TocEntry {
  id: string
  title: string
  level: number
}

// add target="_blank" to external links
function rehypeExternalLinks() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "a") {
        const className = node.properties?.className
        const isHeadingAnchor =
          Array.isArray(className) && className.includes("heading-anchor")
        if (isHeadingAnchor) return

        node.properties = node.properties || {}
        node.properties.target = "_blank"
        node.properties.rel = "noopener noreferrer"
      }
    })
  }
}

function rehypeImageDimensions() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "img") {
        const src = node.properties?.src
        if (typeof src !== "string") return

        try {
          const url = new URL(src)
          const width = url.searchParams.get("width")
          const height = url.searchParams.get("height")

          node.properties = node.properties || {}
          if (width) node.properties.width = width
          if (height) node.properties.height = height
        } catch {
          // skip invalid urls
        }
      }
    })
  }
}

const components: MDXComponents = {
  VideoPlayer,
}

export async function MdxContent({ source }: { source: string }) {
  "use cache"
  cacheLife("max")

  const toc: TocEntry[] = []

  function rehypeExtractToc() {
    return (tree: Root) => {
      visit(tree, "element", (node: Element) => {
        const match = node.tagName.match(/^h([1-6])$/)
        if (match && node.properties?.id) {
          toc.push({
            id: String(node.properties.id),
            title: toString(node),
            level: parseInt(match[1], 10),
          })
        }
      })
    }
  }

  const { content } = await evaluate({
    source,
    options: {
      mdxOptions: {
        rehypePlugins: [
          rehypeSlug,
          rehypeExtractToc,
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
          [
            rehypeShiki,
            {
              themes: { light: "vitesse-light", dark: "vitesse-dark" },
              defaultColor: "light-dark()",
            },
          ],
          rehypeExternalLinks,
          rehypeImageDimensions,
        ],
      },
    },
    components,
  })

  return (
    <>
      <TableOfContents toc={toc} />
      <article className="blog-content min-w-0">{content}</article>
    </>
  )
}
