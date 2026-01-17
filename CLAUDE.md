## Project Overview

Destructure is a blog platform frontend built with Next.js 16 (App Router), React 19, and TypeScript. It connects to a separate backend API for data persistence. The project uses Bun as the package manager.

## Commands

```bash
bun run lint             # Run ESLint
bun run typecheck        # Run TypeScript type checking (tsc --noEmit)
```

## Architecture

### Data Flow

- **API Client** (`lib/api-client.ts`): Centralized fetch wrapper with typed responses. All API calls return `ApiResponse<T>` structure. GET requests that return 404 automatically call Next.js `notFound()`.
- **Server Actions** (`lib/actions.ts`): All mutations (create/update/delete blog, upload media) use Next.js Server Actions with JWT auth from cookies.
- **Auth**: Google OAuth callback at `/api/auth`. JWT stored in httpOnly cookie, accessed via `getTokenFromCookie()` from `lib/session.ts`.

### Key Routes

- `/` - Public blog listing
- `/[slug]` - Public blog post with static generation via `generateStaticParams`
- `/admin` - Protected admin dashboard
- `/admin/blogs/create` - Create new blog
- `/admin/blogs/[slug]` - View/manage single blog
- `/admin/blogs/[slug]/edit` - Edit blog

### Rich Text Editor

Located in `components/rich-text-editor/`, built with Lexical editor:

- Custom nodes: `ImageNode`, `VideoNode`, `CustomCodeHighlightNode`
- Plugins for code highlighting (Shiki), media upload, and link handling
- Exports HTML via `getHtml()` method on editor ref

### HTML Processing

Blog content is processed server-side (`lib/process-html.ts`) using rehype plugins:

- Auto-generates heading IDs and anchor links
- Opens external links in new tabs
- Extracts media dimensions from URL params

### Component Library

The project uses Base UI components. To browse their docs, use the `md` version of the link. For ex: use `https://base-ui.com/react/components/accordion.md` instead of `https://base-ui.com/react/components/accordion`.
