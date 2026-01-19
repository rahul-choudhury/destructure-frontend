# MDX Processing

Blog content is rendered as MDX via `components/mdx-content.tsx`.

## Rehype Plugins

- `rehypeSlug` - generates heading IDs
- `rehypeAutolinkHeadings` - adds anchor links to headings
- `rehypeShiki` - code syntax highlighting (ayu-dark theme)
- `rehypeExternalLinks` - opens external links in new tabs
- `rehypeImageDimensions` - extracts width/height from URL params

## TOC Extraction

`lib/process-markdown.ts` extracts table of contents from markdown using remark/rehype.
