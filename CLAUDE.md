# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Destructure is a blog platform frontend built with Next.js 16 (App Router), React 19, and TypeScript. It connects to a separate backend API for data persistence. The project uses Bun as the package manager.

## Commands

```bash
# Development
bun run dev              # Start dev server
bun run build            # Build for production
bun run start            # Start production server

# Code Quality
bun run lint             # Run ESLint
bun run typecheck        # Run TypeScript type checking (tsc --noEmit)
bun run format:check     # Check formatting with Prettier
bun run format           # Format code with Prettier
```

## Environment Variables

Copy `.env.sample` to `.env.local` and set:
- `NEXT_PUBLIC_API_URL` - Backend API base URL
- `JWT_EXPIRY` - JWT token expiry in days

## Architecture

### Data Flow
- **API Client** (`lib/api-client.ts`): Centralized fetch wrapper with typed responses. All API calls return `ApiResponse<T>` structure. GET requests that return 404 automatically call Next.js `notFound()`.
- **Server Actions** (`lib/actions.ts`): All mutations (create/update/delete blog, upload media) use Next.js Server Actions with JWT auth from cookies.
- **Auth**: Google OAuth callback at `/api/auth`. JWT stored in httpOnly cookie, accessed via `getTokenFromCookie()` from `lib/utils.server.ts`.

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
- Extracts image dimensions from URL params

### Styling
- Tailwind CSS v4 with PostCSS
- Global styles in `app/globals.css`
- `cn()` utility combines clsx + tailwind-merge for conditional classes
- Uses `@base-ui/react` for accessible primitive components

### Path Aliases
`@/*` maps to project root (configured in `tsconfig.json`)
