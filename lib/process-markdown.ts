import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";

import type { Element, Root } from "hast";

export interface TocEntry {
  id: string;
  title: string;
  level: number;
}

export async function extractToc(markdown: string): Promise<TocEntry[]> {
  const toc: TocEntry[] = [];

  await unified()
    .use(remarkParse)
    .use(remarkRehype)
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
    .use(rehypeStringify)
    .process(markdown);

  return toc;
}
