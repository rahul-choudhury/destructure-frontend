# MDX Processing

Blog content is rendered as MDX via `components/mdx-content.tsx`.

## Rehype Plugins

- `rehypeSlug` - generates heading IDs
- `rehypeAutolinkHeadings` - adds anchor links to headings
- `rehypeShiki` - code syntax highlighting (ayu-light/ayu-dark themes)
- `rehypeExternalLinks` - opens external links in new tabs
- `rehypeImageDimensions` - extracts width/height from URL params

## TOC Extraction

TOC is extracted inline in `components/mdx-content.tsx` via `rehypeExtractToc()` plugin.
