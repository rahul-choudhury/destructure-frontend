# Data Layer

## API Client

Location: `lib/api-client.ts`

- GET requests that return 404 automatically call Next.js `notFound()`

## Server Actions

Location: `lib/actions.ts`

- Blog mutations (create/update/delete, toggle visibility)
- Media upload
- Interactions (reactions, comments, replies)

All use JWT auth from cookies.

## Auth

- Google OAuth callback at `/api/auth`
- JWT stored in httpOnly cookie, accessed via `getTokenFromCookie()` from `lib/session.ts`
