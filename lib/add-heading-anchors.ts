import { rehype } from "rehype";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";

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
    .process(html);

  return String(result);
}
