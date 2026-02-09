# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Build (runs prisma generate first)
npm run lint         # ESLint
npm run db:seed      # Seed database
npm run db:studio    # Prisma Studio GUI
```

## Tech Stack

Next.js 16.1.6, React 19, TypeScript 5, Tailwind CSS 4, Prisma 5.22 (PostgreSQL), Framer Motion 12. React Compiler is enabled in next.config.ts. Import alias: `@/*` → `./src/*`.

## Architecture

### Route Groups

- `(public)` — Public pages with shared Header/Footer layout. Homepage (`page.tsx`) renders all portfolio sections. Blog at `/blog` and `/blog/[slug]`.
- `(admin)/admin/(dashboard)` — Admin dashboard with ProtectedRoute + Sidebar. The `(dashboard)` nesting keeps `/admin/login` outside the protected wrapper.

### Content System

All portfolio content lives in `src/dictionaries/en.json`, loaded via `src/get-dictionary.ts`. Sections receive typed props from the dictionary — interfaces are in `src/app/models/`. Currently English only but structured for i18n expansion.

### Section Components

Portfolio sections live in `src/app/_sections/portfolio/` (HeroSection, AboutSection, ExperienceSection, ProjectsSection, SkillsSection, ContactSection). Each is a folder with `index.tsx`.

### Authentication

Middleware (`middleware.ts`) only checks cookie presence (Edge Runtime — no Node.js `crypto`). Full session validation happens in API routes (Node.js runtime). Sessions are stored in-memory via a Map in `src/app/lib/auth.ts` — not persistent across restarts.

### Database

PostgreSQL via Prisma. Schema at `prisma/schema.prisma`. Models: AdminUser, Author, Post, Category, Tag. Prisma client singleton in `src/app/lib/db.ts`. Prisma must stay in `dependencies` (not devDependencies).

### API Routes

REST endpoints under `src/app/api/`:
- `/api/auth/*` — login, logout, me
- `/api/blog/*` — CRUD for posts, categories, tags, search

Blog list supports pagination (9/page), search (case-insensitive via PostgreSQL), and category/tag filtering.

## Design System

**Responsive:** vw-based fluid sizing. Mobile-first with breakpoints at `tablet: 481px`, `desktop: 1024px`.

**Colors:** background `#0A0A0F`, accent-cyan `#06B6D4`, accent-purple `#A855F7`, accent-emerald `#10B981`.

**Typography (mobile / tablet / desktop):**
- h1: `10.667vw` / `6vw` / `3.333vw`
- h2: `8.533vw` / `4vw` / `2.083vw`
- p: `4.267vw` / `2vw` / `0.833vw`

**Custom utilities:** `.gradient-text`, `.glow-cyan`, `.glow-purple`, `.btn-gradient`, `.section-pt`, `.section-pb`, `.no-scrollbar`. Defined in `src/app/styles/tailwind.css`.

**Animations:** Framer Motion variants in `src/app/lib/animations.ts` — `fadeUp`, `fadeLeft`, `fadeRight`, `scaleUp`, `staggerContainer`. Default viewport: `{ once: true, amount: 0.3 }`.

## Critical Constraints

- Use `next/link` (`Link`) instead of `<a>` for all navigational links. Use `next/image` (`Image`) instead of `<img>`. Exception: `mailto:` and `tel:` hrefs must use plain `<a>` since Link doesn't support non-HTTP protocols.
- `searchParams` is a Promise in Next.js 16 — must be awaited
- Server components cannot have event handlers — extract interactive parts to `"use client"` components
- Edge Runtime (middleware) cannot import Node.js `crypto`
- `mode: "insensitive"` in Prisma requires PostgreSQL provider
- `.env` must use a PostgreSQL connection URL to match `schema.prisma`

## Environment Variables

```
DATABASE_URL=postgresql://...
SESSION_SECRET=...
NEXT_PUBLIC_SITE_URL=https://youssefnesafe.com
```
