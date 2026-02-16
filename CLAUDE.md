# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Generate Prisma client + build for production
npm run lint         # Run ESLint (flat config)
npm run db:seed      # Seed database (admin@example.com / admin123)
npm run db:studio    # Open Prisma Studio GUI
npx prisma migrate dev --name <name>  # Create and apply a migration
npx prisma generate  # Regenerate Prisma client after schema changes
```

## Tech Stack

Next.js 16.1.6 (App Router), React 19, TypeScript 5, Tailwind CSS 4, Prisma 5.22 (PostgreSQL), Framer Motion, Zod 4, React Compiler enabled.

## Architecture

### Route Groups

```
src/app/
├── (public)/              # Public pages with Header/Footer layout
│   ├── page.tsx           # Portfolio homepage
│   └── blog/              # Blog listing + [slug] detail
├── (admin)/admin/         # Admin panel
│   ├── login/             # Login page (outside ProtectedRoute)
│   └── (dashboard)/       # Protected routes with Sidebar layout
│       ├── posts/         # Post CRUD
│       ├── categories/    # Category management
│       └── tags/          # Tag management
├── _sections/portfolio/   # Homepage sections (Hero, About, Experience, etc.)
├── api/auth/              # Login, logout, session check
└── api/blog/              # Blog CRUD + search
```

The `(admin)/admin/(dashboard)/` nesting keeps the login page outside the `ProtectedRoute` wrapper while dashboard routes get sidebar + auth protection.

### Auth Split: Edge vs Node.js Runtime

- **Middleware** (`middleware.ts`): Edge Runtime — only checks session cookie presence, adds security headers. Cannot use Node.js `crypto`.
- **API routes**: Node.js runtime — full session validation via `requireAuth()` in `src/app/lib/api-utils.ts`.
- **Client**: `ProtectedRoute` component calls `/api/auth/me` to verify sessions.
- Sessions stored in PostgreSQL (`Session` model), not in-memory.

### Key Modules

| Module | Location |
|--------|----------|
| Auth (crypto + session) | `src/app/lib/auth.ts` → re-exports from `auth-crypto.ts`, `auth-session.ts` |
| API utilities | `src/app/lib/api-utils.ts` — `requireAuth()`, `requireJson()`, `errorResponse()`, `successResponse()` |
| Zod schemas | `src/app/lib/schemas.ts` — all API input validation |
| Prisma singleton | `src/app/lib/db.ts` |
| Post filter builder | `src/app/lib/build-post-filter.ts` |
| Prisma query includes | `src/app/api/blog/helpers/prisma-includes.ts` |
| CRUD route factory | `src/app/api/blog/helpers/crud-route-factory.ts` — DRY category/tag endpoints |
| Animations | `src/app/lib/animations.ts` |
| Dictionary (i18n) | `src/dictionaries/en.json`, loaded via `src/get-dictionary.ts` |
| TypeScript models | `src/app/models/` |

### Patterns

- **CRUD route factory**: `createListAndCreateHandlers()` / `createUpdateAndDeleteHandlers()` in `crud-route-factory.ts` for DRY category/tag API routes.
- **Custom hooks for state**: `useCrudManager` (admin CRUD), `useBlogFilters` (filter state + debounced search), `usePostForm` (post editor).
- **Server components by default**: Only add `"use client"` when state/effects/event handlers are needed.
- **Revalidation**: Blog listing uses `revalidate = 3600`. API mutations call `revalidatePath()`.
- **Optimistic UI**: Blog filters use React transitions for instant feedback; URL search updates debounced 300ms.
- **Slug generation**: `src/app/utils/slugify.ts` — `slugify()` and `generateUniqueSlug()` with uniqueness check callback.
- **Class merging**: `cn()` utility in `src/app/utils/cn.ts` (clsx + tailwind-merge).

## Design System

**vw-based responsive** — mobile-first, breakpoints at `tablet: 481px` and `desktop: 1024px`.

**Colors**: background `#0A0A0F`, accent-cyan `#06B6D4`, accent-purple `#A855F7`, accent-emerald `#10B981`.

### Styling Rules

**Always use arbitrary vw values** with the three-breakpoint pattern for all sizing (text, padding, margin, gap, width, height, etc.):

```
text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]
p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw]
gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw]
mb-[4vw] tablet:mb-[2vw] desktop:mb-[0.833vw]
```

**Do NOT use:**
- Tailwind's predefined size classes (`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, etc.)
- Predefined spacing (`p-4`, `m-8`, `gap-6`, etc.)
- Predefined width/height (`w-64`, `h-12`, etc.)
- `rem`, `px`, or `em` units for sizing — always use `vw`

**Do use** Tailwind's non-size utilities normally: colors (`text-text-muted`, `bg-background`), flex/grid, borders, transitions, opacity, etc.

### Custom Utility Classes

Defined in `src/app/styles/tailwind.css`:
- `.section-mt`, `.section-mb`, `.section-pt`, `.section-pb` — responsive section spacing
- `.gradient-text` — cyan→purple gradient, `.gradient-text-emerald` — emerald→cyan
- `.glow-cyan` — box-shadow glow
- `.gradient-border` — animated gradient border via CSS mask
- `.btn-gradient` — gradient button with hover animation

**Admin form styles**: Shared `inputClass`/`labelClass` in `src/app/(admin)/admin/components/shared/admin-styles.ts`.

## Prisma Schema

Six models: `AdminUser`, `Session` (auth), `Author`, `Post`, `Category`, `Tag` (blog). Posts have many-to-many relations with categories and tags. Sessions cascade-delete with their AdminUser.

## Gotchas

- `searchParams` is a **Promise** in Next.js 16 — must be `await`ed.
- Middleware (Edge Runtime) **cannot import** Node.js `crypto` — auth split exists for this reason.
- `@prisma/client` must be in `dependencies`, not `devDependencies`.
- Prisma `mode: "insensitive"` only works with PostgreSQL provider.
- `.env` must have a PostgreSQL `DATABASE_URL` (not SQLite) to match the schema provider.

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (required)
- `NEXT_PUBLIC_SITE_URL` — site URL for metadata
- `NODE_ENV` — affects security headers and cookie settings
