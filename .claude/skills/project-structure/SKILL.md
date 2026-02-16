---
name: project-structure
description: Reference for the project's folder structure, architecture patterns, dictionary system, models, and component organization. Use when creating new components, sections, or modifying the project architecture.
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Grep, Glob
---

# Project Structure Reference

A portfolio + blog platform built with Next.js 16 App Router, featuring a public portfolio, public blog, and admin panel with authentication.

## Directory Tree

```
Portfolio-V2/
├── tailwind.config.ts                 # Breakpoints, colors, fonts, keyframes
├── postcss.config.mjs                 # PostCSS with @tailwindcss/postcss
├── tsconfig.json                      # TypeScript config (paths: @/* → ./src/*)
├── next.config.ts                     # Next.js config
├── middleware.ts                      # Edge Runtime: cookie check + security headers
├── package.json
│
├── prisma/
│   ├── schema.prisma                  # 6 models: AdminUser, Session, Author, Post, Category, Tag
│   └── seed.ts                        # Seeds admin user (admin@example.com / admin123)
│
└── src/
    ├── get-dictionary.ts              # Dictionary loader (async, server-side)
    │
    ├── dictionaries/
    │   └── en.json                    # ALL text content, structured by section
    │
    └── app/
        ├── layout.tsx                 # Root layout: fonts, metadata, CSS import
        │
        ├── styles/
        │   └── tailwind.css           # @config + @import tailwindcss + base/component layers
        │
        ├── (public)/                  # Public pages with Header/Footer layout
        │   ├── page.tsx               # Portfolio homepage (loads dict, composes sections)
        │   ├── layout.tsx             # Header + Footer wrapper
        │   └── blog/
        │       ├── page.tsx           # Blog listing with filters
        │       ├── layout.tsx         # Blog layout
        │       ├── loading.tsx        # Suspense fallback
        │       ├── error.tsx          # Error boundary
        │       ├── build-query-string.ts
        │       ├── [slug]/
        │       │   ├── page.tsx       # Blog post detail
        │       │   ├── reading-time.ts
        │       │   └── sanitize-config.ts
        │       └── components/
        │           ├── BlogCard.tsx
        │           ├── BlogFilters.tsx
        │           ├── blog-filters/          # Sub-modules
        │           │   ├── LoadingBar.tsx
        │           │   ├── SelectedChips.tsx
        │           │   ├── types.ts
        │           │   └── useBlogFilters.ts  # Filter state + debounced search
        │           ├── MultiSelectDropdown.tsx
        │           └── multi-select/          # Sub-modules
        │               ├── DropdownPanel.tsx
        │               ├── DropdownTrigger.tsx
        │               ├── types.ts
        │               └── useDropdown.ts
        │
        ├── (admin)/admin/             # Admin panel
        │   ├── login/                 # Login page (outside ProtectedRoute)
        │   ├── (dashboard)/           # Protected routes with Sidebar layout
        │   │   ├── layout.tsx         # ProtectedRoute + Sidebar wrapper
        │   │   ├── page.tsx           # Dashboard home
        │   │   ├── loading.tsx
        │   │   ├── error.tsx
        │   │   ├── posts/
        │   │   │   ├── page.tsx       # Post list
        │   │   │   ├── loading.tsx
        │   │   │   ├── new/page.tsx   # Create post
        │   │   │   ├── [id]/page.tsx  # Edit post
        │   │   │   └── components/
        │   │   │       ├── PostActions.tsx
        │   │   │       ├── PostForm.tsx
        │   │   │       └── post-form/         # Sub-modules
        │   │   │           ├── CategorySelector.tsx
        │   │   │           ├── FormActions.tsx
        │   │   │           ├── FormAlerts.tsx
        │   │   │           ├── PublishToggle.tsx
        │   │   │           ├── TagSelector.tsx
        │   │   │           ├── types.ts
        │   │   │           └── usePostForm.ts # Post editor state + API calls
        │   │   ├── categories/        # Category CRUD
        │   │   └── tags/              # Tag CRUD
        │   └── components/
        │       ├── ProtectedRoute.tsx # Calls /api/auth/me to verify session
        │       ├── Sidebar.tsx
        │       └── shared/
        │           ├── admin-styles.ts    # Shared inputClass/labelClass
        │           └── useCrudManager.ts  # Generic CRUD state hook
        │
        ├── api/
        │   ├── auth/
        │   │   ├── login/             # POST: authenticate + create session
        │   │   ├── logout/            # POST: destroy session
        │   │   └── me/               # GET: verify current session
        │   └── blog/
        │       ├── route.ts           # GET list / POST create
        │       ├── [id]/              # GET / PUT / DELETE single post
        │       ├── categories/        # Category CRUD endpoints
        │       ├── tags/              # Tag CRUD endpoints
        │       ├── search/            # GET: search posts
        │       └── helpers/
        │           ├── index.ts
        │           ├── crud-route-factory.ts  # DRY category/tag endpoint factory
        │           ├── prisma-includes.ts     # Shared Prisma query includes
        │           ├── parse-pagination.ts
        │           └── resolve-slug.ts
        │
        ├── _sections/                 # Page sections (portfolio homepage)
        │   └── portfolio/
        │       ├── HeroSection/
        │       ├── AboutSection/
        │       ├── ExperienceSection/
        │       ├── SkillsSection/
        │       ├── ProjectsSection/
        │       └── ContactSection/
        │
        ├── components/                # Reusable UI components
        │   ├── layout/
        │   │   ├── Header/
        │   │   └── Footer/
        │   └── ui/
        │       ├── AnimatedText/      # Typewriter character-by-character reveal
        │       ├── FloatingElements/  # Floating decorative elements
        │       ├── GlowCard/          # Card with neon hover glow effect
        │       ├── GradientBlob/      # Floating gradient background decoration
        │       ├── GridBackground/    # Dot grid background pattern
        │       ├── ScrollProgress/    # Fixed top scroll progress bar
        │       ├── Section/           # Wrapper with section padding
        │       ├── SectionHeading/    # Label + title + gradient underline
        │       ├── TechBadge/         # Skill badge with brand icon
        │       ├── Terminal/          # Terminal/code-block container
        │       └── TimelineItem/      # Experience timeline entry
        │
        ├── hooks/
        │   └── useScrollSpy.ts        # Active section detection for nav
        │
        ├── models/                    # TypeScript interfaces
        │   ├── IDictionary.ts         # Master dictionary interface
        │   ├── Hero.ts, About.ts, Experience.ts, Skills.ts, Contact.ts
        │   ├── Projects.ts           # IProjectsSection
        │   ├── Layout.ts             # ILayout, IHeader, IFooter
        │   ├── Blog.ts               # Blog post, category, tag interfaces
        │   └── common/
        │       └── index.ts           # Shared types: NavItem, Stat, Skill, etc.
        │
        ├── utils/
        │   ├── cn.ts                  # clsx + tailwind-merge class merger
        │   ├── getBpClassName.ts      # Programmatic tablet:/desktop: prefixing
        │   └── slugify.ts            # slugify() + generateUniqueSlug()
        │
        └── lib/
            ├── animations.ts          # Framer Motion reusable variants
            ├── api-utils.ts           # requireAuth(), requireJson(), errorResponse(), successResponse()
            ├── auth.ts                # Re-exports from auth-crypto + auth-session
            ├── auth-crypto.ts         # Password hashing, token generation (Node.js crypto)
            ├── auth-session.ts        # Session create/validate/delete (Prisma)
            ├── build-post-filter.ts   # Prisma where-clause builder for post queries
            ├── constants.ts           # App-wide constants
            ├── db.ts                  # Prisma client singleton
            └── schemas.ts            # Zod validation schemas for all API input
```

## Architecture Patterns

### 1. Auth Split: Edge vs Node.js Runtime

- **Middleware** (`middleware.ts`): Edge Runtime — only checks session cookie presence, adds security headers (X-Content-Type-Options, X-Frame-Options, HSTS). Cannot use Node.js `crypto`.
- **API routes**: Node.js runtime — full session validation via `requireAuth()` in `src/app/lib/api-utils.ts`, which calls `auth-session.ts`.
- **Client**: `ProtectedRoute` component calls `/api/auth/me` to verify sessions.
- Sessions stored in PostgreSQL (`Session` model), not in-memory.

### 2. CRUD Route Factory

`src/app/api/blog/helpers/crud-route-factory.ts` provides:
- `createListAndCreateHandlers()` — generates GET (list) and POST (create) handlers
- `createUpdateAndDeleteHandlers()` — generates PUT and DELETE handlers

Used by categories and tags API routes to avoid duplicating CRUD logic.

### 3. Custom Hooks

| Hook | Location | Purpose |
|------|----------|---------|
| `useCrudManager` | `admin/components/shared/` | Generic admin CRUD state (list, create, update, delete) |
| `useBlogFilters` | `blog/components/blog-filters/` | Blog filter state + debounced search + URL sync |
| `usePostForm` | `admin/.../post-form/` | Post editor state, validation, API calls |
| `useScrollSpy` | `app/hooks/` | Active nav section detection |
| `useDropdown` | `blog/components/multi-select/` | Dropdown open/close + click outside |

### 4. API Validation

All API input validated with Zod schemas in `src/app/lib/schemas.ts`. API utility functions in `api-utils.ts`:
- `requireAuth()` — validates session, returns admin user or 401
- `requireJson()` — parses + validates request body against Zod schema
- `errorResponse()` / `successResponse()` — consistent JSON response format
- `isPrismaUniqueError()` — handles unique constraint violations

### 5. Dictionary Pattern (Text Management)

All portfolio text content is separated from components into `src/dictionaries/en.json`.

**JSON structure** — organized by section:
```json
{
  "layout": { "header": {...}, "footer": {...} },
  "hero": { "greeting": "...", "name": "...", ... },
  "about": { "sectionLabel": "...", "title": "...", "terminal": {...}, "stats": [...] },
  "experience": { "sectionLabel": "...", "title": "...", "items": [...] },
  "skills": { "sectionLabel": "...", "title": "...", "categories": [...] },
  "projects": { "sectionLabel": "...", "title": "...", "items": [...] },
  "contact": { "sectionLabel": "...", "title": "...", "items": [...], ... }
}
```

**Loading** — `src/get-dictionary.ts`:
```ts
import type { IDictionary } from "./app/models/IDictionary";
const dictionary = import("./dictionaries/en.json").then((m) => m.default as unknown as IDictionary);
export async function getDictionary(): Promise<IDictionary> { return dictionary; }
```

**Consumption** — in `page.tsx` (server component):
```tsx
const dict = await getDictionary();
return (
  <>
    <Header {...dict.layout.header} />
    <HeroSection {...dict.hero} />
    <AboutSection {...dict.about} />
    ...
  </>
);
```

### 6. Models (Type Safety)

Master interface at `src/app/models/IDictionary.ts` imports all section interfaces:
```ts
export interface IDictionary {
  layout: ILayout;
  hero: IHeroSection;
  about: IAboutSection;
  experience: IExperienceSection;
  skills: ISkillsSection;
  projects: IProjectsSection;
  contact: IContactSection;
}
```

Shared types in `src/app/models/common/index.ts`:
- `NavItem`, `SocialLink`, `ContactItem`, `Stat`
- `Skill`, `SkillCategory`, `ExperienceItem`
- `CTA`, `TerminalBlock`, `Language`, `Education`

Blog types in `src/app/models/Blog.ts` — post, category, tag interfaces for API responses.

### 7. Component Organization

**Naming:** Each component lives in its own folder with `index.tsx`:
```
components/ui/GlowCard/index.tsx    → import GlowCard from "@/app/components/ui/GlowCard"
```

**Client vs Server:**
- `page.tsx` and `layout.tsx` — **Server Components** (data fetching)
- All components in `_sections/`, `components/` — **Client Components** (`"use client"`)
- Dictionary is loaded server-side and passed as props to client components

### 8. Section Pattern

Sections receive typed props from the dictionary:
```tsx
"use client";
import type { IAboutSection } from "@/app/models/About";

export default function AboutSection(props: IAboutSection) {
  // props.sectionLabel, props.title, props.terminal, props.stats
}
```

Each section uses:
- `<Section>` wrapper for consistent padding
- `<SectionHeading>` for label + title + gradient underline
- Framer Motion `whileInView` animations with `defaultViewport`

### 9. Animations Pattern

All reusable variants in `src/app/lib/animations.ts`:
```tsx
import { fadeUp, staggerContainer, defaultViewport } from "@/app/lib/animations";

<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={defaultViewport}   // { once: true, amount: 0.3 }
  variants={staggerContainer}  // staggers children by 0.1s
>
  <motion.div variants={fadeUp}>...</motion.div>
</motion.div>
```

## Database (Prisma)

Schema at `prisma/schema.prisma` with 6 models:

| Model | Purpose |
|-------|---------|
| `AdminUser` | Admin panel credentials |
| `Session` | Auth sessions (cascade-deletes with AdminUser) |
| `Author` | Blog post authors |
| `Post` | Blog posts (title, slug, content, excerpt, published, coverImage) |
| `Category` | Blog categories (many-to-many with Post) |
| `Tag` | Blog tags (many-to-many with Post) |

Prisma singleton: `src/app/lib/db.ts`
Seed command: `npm run db:seed`

## Adding New Content

### New Portfolio Section
1. Add text to `src/dictionaries/en.json` under a new key
2. Create interface in `src/app/models/NewSection.ts`
3. Add to `IDictionary` interface
4. Create `src/app/_sections/portfolio/NewSection/index.tsx`
5. Add to `page.tsx`: `<NewSection {...dict.newSection} />`

### New UI Component
1. Create `src/app/components/ui/ComponentName/index.tsx`
2. Mark as `"use client"` if it uses hooks, state, or Framer Motion
3. Use `cn()` for class merging, vw units for all sizing

### New Blog Feature
1. Add Zod schema in `src/app/lib/schemas.ts` for any new API input
2. Create API route in `src/app/api/blog/`
3. Use `requireAuth()` for protected endpoints, `requireJson()` for body parsing
4. Add UI in `src/app/(public)/blog/` or `src/app/(admin)/admin/(dashboard)/`
5. Call `revalidatePath()` in mutations to bust cache

### New Admin CRUD Resource
1. Add Prisma model to `prisma/schema.prisma`, run migration
2. Create API routes — consider using `crud-route-factory.ts` for standard CRUD
3. Create admin page under `(dashboard)/`
4. Use `useCrudManager` hook for state management

### New Text/Content
1. Add to appropriate section in `src/dictionaries/en.json`
2. Update the corresponding model interface
3. The component receives it automatically via props spread

## Import Aliases

```ts
@/*  →  ./src/*

// Examples:
import { cn } from "@/app/utils/cn";
import { getDictionary } from "@/get-dictionary";
import type { IDictionary } from "@/app/models/IDictionary";
import { fadeUp } from "@/app/lib/animations";
import { requireAuth } from "@/app/lib/api-utils";
import prisma from "@/app/lib/db";
```

## Key Dependencies

| Package          | Purpose                          |
|------------------|----------------------------------|
| `framer-motion`  | Scroll/view animations           |
| `react-icons`    | Brand icons (si/*) + UI (fi/*)   |
| `clsx`           | Conditional class joining        |
| `tailwind-merge` | Tailwind class conflict resolver |
| `@prisma/client` | Database ORM (must be in dependencies, not devDependencies) |
| `zod`            | API input validation             |
| `sanitize-html`  | Blog post HTML sanitization      |
