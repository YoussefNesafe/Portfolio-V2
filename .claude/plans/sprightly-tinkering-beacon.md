# Blog Implementation Plan for Portfolio-V2

## Overview

Implement a full-featured blog system with PostgreSQL database, Prisma ORM, integrated admin dashboard, search, categories/tags, and a rich text editor.

**Tech Stack:**

- Database: PostgreSQL (Cloud-hosted via Vercel, Railway, or Supabase)
- ORM: Prisma
- Rich Editor: TipTap or Draft.js
- Authentication: Session-based with HTTP-only cookies
- Framework: Next.js 16.1.6, React 19, TypeScript

---

## Architecture Overview

### Route Structure

```
Public Routes (grouped under (public)):
  /blog                          - Blog listing with filters/search
  /blog?category=...&tag=...     - Filtered posts
  /blog?search=...               - Search results
  /blog/[slug]                   - Individual post with dynamic metadata

Admin Routes (grouped under (admin)):
  /admin/login                   - Admin login page
  /admin                         - Dashboard
  /admin/posts                   - Posts management list
  /admin/posts/new               - Create new post
  /admin/posts/[id]              - Edit post
  /admin/categories              - Manage categories
  /admin/tags                    - Manage tags

API Routes:
  GET  /api/blog                 - List posts with pagination
  POST /api/blog                 - Create post (admin)
  GET  /api/blog/[id]            - Get single post
  PUT  /api/blog/[id]            - Update post (admin)
  DELETE /api/blog/[id]          - Delete post (admin)
  GET  /api/blog/search?q=...    - Search posts
  GET  /api/blog/categories      - List categories
  POST /api/blog/categories      - Create category
  GET  /api/blog/tags            - List tags
  POST /api/blog/tags            - Create tag
  POST /api/auth/login           - Admin login
  POST /api/auth/logout          - Admin logout
  GET  /api/auth/me              - Current user
```

---

## Implementation Phases

### PHASE 1: Database Setup (2-3 hours)

**Objective:** Set up PostgreSQL connection and Prisma schema

**Tasks:**

1. Install Prisma dependencies

   ```bash
   npm install @prisma/client
   npm install -D prisma
   ```

2. Initialize Prisma

   ```bash
   npx prisma init
   ```

3. Create `.env.local` with cloud PostgreSQL connection string
   - Choose provider: Supabase (recommended), Railway, Vercel, or other
   - Get DATABASE_URL from provider dashboard

4. Create `prisma/schema.prisma` with models:
   - **Post**: id, slug, title, description, content, coverImage, published, publishedAt, createdAt, updatedAt, authorId, categories[], tags[]
   - **Category**: id, name, slug, description, posts[]
   - **Tag**: id, name, slug, posts[]
   - **Author**: id, email, name, avatar, posts[]
   - **AdminUser**: id, email, password (hashed), name, role, createdAt
   - **PostCategory & PostTag**: Junction tables for many-to-many relations

5. Configure indexes on: Post(slug unique, published, publishedAt DESC), Category(slug unique), Tag(slug unique), AdminUser(email unique)

6. Run initial migration

   ```bash
   npx prisma migrate dev --name init
   ```

7. Create `src/app/lib/db.ts` - Prisma client singleton for all components

**Critical Files:**

- `/prisma/schema.prisma` (CREATE NEW)
- `src/app/lib/db.ts` (CREATE NEW)
- `.env.local` (CREATE NEW - add DATABASE_URL)

**Verification:**

- Run `npx prisma db push` successfully
- Database tables visible in cloud provider dashboard
- Prisma client imports work without errors

---

### PHASE 2: Core API Routes (4-6 hours)

**Objective:** Implement all CRUD API endpoints for blog content

**Tasks (in order):**

1. **`src/app/api/blog/route.ts`** - List & create posts
   - GET: Return paginated posts (9 per page), filter by published=true, sort by publishedAt DESC
   - POST: Create post (admin only), validate required fields, generate slug, return created post
   - Query params: page, limit, category, tag, search

2. **`src/app/api/blog/[id]/route.ts`** - Get, update, delete post
   - GET: Return single post by ID with full content
   - PUT: Update post (admin), validate input, prevent slug conflicts
   - DELETE: Delete post and cascade relationships (admin)

3. **`src/app/api/blog/search/route.ts`** - Search functionality
   - Query param: q (search term)
   - Return posts where published=true AND (title ILIKE '%q%' OR description ILIKE '%q%')
   - Return max 20 results
   - Note: Can upgrade to PostgreSQL full-text search later

4. **`src/app/api/blog/categories/route.ts`**
   - GET: List all categories with post count
   - POST: Create new category (admin)

5. **`src/app/api/blog/categories/[id]/route.ts`**
   - PUT: Update category (admin)
   - DELETE: Delete category (admin, cascade to posts)

6. **`src/app/api/blog/tags/route.ts`**
   - GET: List all tags with post count
   - POST: Create new tag (admin)

7. **`src/app/api/blog/tags/[id]/route.ts`**
   - PUT: Update tag (admin)
   - DELETE: Delete tag (admin)

**Error Handling:**

- Return proper HTTP status codes (200, 201, 400, 401, 404, 500)
- Validate input, return validation errors
- Handle database errors gracefully

**Critical Files:**

- `src/app/api/blog/route.ts` (CREATE NEW)
- `src/app/api/blog/[id]/route.ts` (CREATE NEW)
- `src/app/api/blog/search/route.ts` (CREATE NEW)
- `src/app/api/blog/categories/route.ts` (CREATE NEW)
- `src/app/api/blog/categories/[id]/route.ts` (CREATE NEW)
- `src/app/api/blog/tags/route.ts` (CREATE NEW)
- `src/app/api/blog/tags/[id]/route.ts` (CREATE NEW)

**Verification:**

- Test each endpoint with Postman/curl
- GET /api/blog returns empty or seed data
- POST creates post successfully
- PUT/DELETE work correctly
- Search endpoint filters properly

---

### PHASE 3: Authentication & Admin Middleware (3-4 hours)

**Objective:** Protect admin routes and implement login system

**Tasks:**

1. **`src/app/lib/auth.ts`** - Auth utilities
   - `hashPassword(password)` - Use bcrypt or crypto module
   - `verifyPassword(password, hash)` - Compare password with hash
   - `generateSessionToken()` - Create secure random token
   - `validateSession(token)` - Check token validity and return admin user

2. **`middleware.ts`** - Root middleware for route protection
   - Intercept all `/admin/*` requests
   - Check for session cookie
   - If missing/invalid, redirect to /admin/login
   - Allow /admin/login without session
   - Add user info to request headers for component access

3. **`src/app/api/auth/login/route.ts`** - Admin login endpoint
   - POST: Accept email and password
   - Find admin user by email in DB
   - Verify password hash
   - Create session token and store in HTTP-only cookie
   - Return redirect to /admin dashboard
   - Return 401 if credentials invalid

4. **`src/app/api/auth/logout/route.ts`** - Logout endpoint
   - POST: Clear session cookie
   - Redirect to /admin/login

5. **`src/app/api/auth/me/route.ts`** - Get current user
   - GET: Read session cookie, return current admin user info
   - Return 401 if not authenticated

6. **Add auth checks to API routes:**
   - POST endpoints (create) check `validateSession()`
   - PUT endpoints (update) check `validateSession()`
   - DELETE endpoints check `validateSession()`

7. **Create `src/app/(admin)/admin/components/ProtectedRoute.tsx`**
   - Client component wrapper for admin pages
   - Fallback auth check before rendering sensitive content

**Environment Variables:**

- Add to `.env.local`: `SESSION_SECRET="your-random-string-min-32-chars"`

**Critical Files:**

- `src/app/lib/auth.ts` (CREATE NEW)
- `middleware.ts` (CREATE NEW - root level)
- `src/app/api/auth/login/route.ts` (CREATE NEW)
- `src/app/api/auth/logout/route.ts` (CREATE NEW)
- `src/app/api/auth/me/route.ts` (CREATE NEW)
- `src/app/(admin)/admin/components/ProtectedRoute.tsx` (CREATE NEW)

**Verification:**

- Unauthenticated request to /admin redirects to /admin/login
- Login with valid credentials creates session and redirects to /admin
- Session cookie is HTTP-only and secure
- Logout clears cookie and redirects to login
- /api/auth/me returns current user when authenticated
- API POST/PUT/DELETE return 401 without valid session

---

### PHASE 4: Public Blog Pages (5-7 hours)

**Objective:** Create blog listing and individual post pages

**Tasks:**

1. **`src/app/(public)/blog/page.tsx`** - Blog listing page
   - Server component that fetches initial posts
   - Display BlogGrid with BlogCard components
   - Include SearchBar component
   - Include CategoryFilter and TagFilter components
   - Include Pagination component
   - Support URL query params: page, category, tag, search
   - SEO metadata for blog landing page

2. **`src/app/(public)/blog/layout.tsx`** - Blog section layout
   - Shared layout for blog routes
   - Nice header/intro section
   - Basic styling matching portfolio theme

3. **`src/app/(public)/blog/[slug]/page.tsx`** - Individual post page
   - Fetch post by slug using Prisma
   - Display full post content with formatting
   - Show metadata: author, date, reading time, category, tags
   - Include related posts section (same category)
   - Generate dynamic metadata for SEO: title, description, image, Open Graph
   - Add structured data (JSON-LD) for search engines
   - Return 404 if post not found or not published

4. **Create components in `src/app/(public)/blog/components/`:**
   - **BlogCard.tsx**: Post preview with image, title, excerpt, category badge, date
     - Use GlowCard pattern for consistency
     - Hover animations with Framer Motion
   - **BlogGrid.tsx**: Responsive grid (1 col mobile, 2 tablet, 3 desktop)
     - Stagger animations on load using fadeUp and staggerContainer
   - **SearchBar.tsx**: Input with debounced search (300ms delay)
     - Updates URL query param `?search=...`
     - Shows loading state during search
   - **CategoryFilter.tsx**: Checkbox-based category selection
     - Shows all categories with post counts
     - Multiple selection allowed
     - Updates URL query params
   - **TagFilter.tsx**: Similar to category filter for tags
   - **Pagination.tsx**: Previous/Next buttons with page numbers
     - Disabled state on edge pages
     - Updates URL query param `?page=...`

5. **Create hooks in `src/app/(public)/blog/hooks/`:**
   - **useBlogSearch.ts**: Handle search state and debouncing
     - Trigger API call on search term change
     - Update URL query params
     - Manage loading/error states
   - **useBlogFilter.ts**: Manage active categories and tags
     - Track selected items
     - Update URL query params
     - Trigger component re-render

6. **Create utility functions:**
   - `src/app/utils/slugify.ts`: Convert title to URL slug
   - `src/app/utils/formatDate.ts`: Format dates for display
   - `src/app/utils/calculateReadingTime.ts`: Estimate reading time from content

7. **Design System Integration:**
   - Use VW-based responsive sizing (mobile default, tablet:, desktop: prefixes)
   - Apply accent colors: cyan (primary), purple (secondary), emerald (tertiary)
   - Use existing animations: fadeUp, fadeLeft, fastStaggerContainer
   - Follow spacing utilities: section-mt, section-mb, section-pt, section-pb
   - Use GlowCard pattern for post cards

**Critical Files:**

- `src/app/(public)/blog/page.tsx` (CREATE NEW)
- `src/app/(public)/blog/layout.tsx` (CREATE NEW)
- `src/app/(public)/blog/[slug]/page.tsx` (CREATE NEW)
- `src/app/(public)/blog/components/BlogCard.tsx` (CREATE NEW)
- `src/app/(public)/blog/components/BlogGrid.tsx` (CREATE NEW)
- `src/app/(public)/blog/components/SearchBar.tsx` (CREATE NEW)
- `src/app/(public)/blog/components/CategoryFilter.tsx` (CREATE NEW)
- `src/app/(public)/blog/components/TagFilter.tsx` (CREATE NEW)
- `src/app/(public)/blog/components/Pagination.tsx` (CREATE NEW)
- `src/app/(public)/blog/hooks/useBlogSearch.ts` (CREATE NEW)
- `src/app/(public)/blog/hooks/useBlogFilter.ts` (CREATE NEW)
- `src/app/utils/slugify.ts` (CREATE NEW)
- `src/app/utils/formatDate.ts` (CREATE NEW)

**Verification:**

- /blog page loads and displays posts from database
- Search filters posts by title/description
- Category/tag filters work correctly
- Pagination navigates through pages
- Individual post page loads with correct content
- 404 shown for invalid slug
- SEO metadata visible in page source
- Responsive design works on mobile/tablet/desktop
- Animations work smoothly with Framer Motion

---

### PHASE 5: Admin Dashboard (6-8 hours)

**Objective:** Create admin interface for managing blog content

**Tasks:**

1. **`src/app/(admin)/admin/layout.tsx`** - Admin layout
   - Sidebar navigation with links: Dashboard, Posts, Categories, Tags, Logout
   - Main content area
   - Mobile responsive sidebar toggle
   - Active route highlighting

2. **`src/app/(admin)/admin/page.tsx`** - Dashboard home
   - Stats cards: Total posts, published, drafts, categories, tags
   - Recent posts list (5 latest)
   - Quick action buttons: New post, new category
   - Use card components for statistics

3. **`src/app/(admin)/admin/posts/page.tsx`** - Posts management
   - Table/list of all posts with: title, status (draft/published), date, category, actions
   - Delete button for each post
   - Publish/Unpublish toggle
   - Edit link to individual post
   - Create new post button
   - Search/filter posts in list

4. **`src/app/(admin)/admin/posts/new/page.tsx`** - Create post
   - PostForm component (reusable for create/edit)
   - Success notification on create
   - Redirect to edit page after creation

5. **`src/app/(admin)/admin/posts/[id]/page.tsx`** - Edit post
   - Pre-fill PostForm with existing post data
   - Show last updated timestamp
   - Delete button
   - Publish/Unpublish toggle at top
   - Success notification on save

6. **Create `src/app/(admin)/admin/posts/components/`:**
   - **PostForm.tsx**: Reusable form for create/edit
     - Title input (required, 255 char limit)
     - Slug input (auto-generate from title, allow manual edit)
     - Description input (required, 500 char max)
     - Category select dropdown
     - Tags multi-select (searchable)
     - Cover image URL input (optional)
     - Rich content editor (TipTap or Draft.js)
     - Metadata/SEO fields: Custom title, description, keywords
     - Form validation (client-side, highlight errors)
     - Submit/Save button with loading state
     - Cancel button
   - **RichTextEditor.tsx**: TipTap or Draft.js editor
     - Toolbar with formatting options: bold, italic, underline, heading, lists, etc
     - Paste rich content support
     - Character count display
     - Auto-save to localStorage (optional)
     - Preview mode toggle showing rendered HTML
   - **MetadataForm.tsx**: SEO fields
     - Meta title override
     - Meta description preview and character count
     - Keywords input
     - Open Graph title, description, image preview
     - Canonical URL

7. **`src/app/(admin)/admin/categories/page.tsx`** - Categories management
   - Table with categories: name, slug, post count, actions
   - Delete category button
   - Edit category button/modal
   - Create new category button

8. **`src/app/(admin)/admin/categories/new/page.tsx`** - Create category
   - Simple form: name, slug, description

9. **`src/app/(admin)/admin/categories/[id]/page.tsx`** - Edit category
   - Pre-fill form with existing data
   - Update and delete buttons

10. **`src/app/(admin)/admin/tags/page.tsx`** - Tags management
    - Similar to categories (table, create, edit, delete)
    - Form: name, slug, optional description

11. **Create `src/app/(admin)/admin/components/`:**
    - **Sidebar.tsx**: Navigation sidebar
      - Logo/app name
      - Navigation links with icons (react-icons)
      - Active route indicator
      - Logout button
      - Mobile hamburger toggle
    - **ProtectedRoute.tsx**: Already created in Phase 3

12. **Styling & UX:**
    - Use existing design system (Tailwind, color palette)
    - Admin dashboard should feel clean and functional
    - Form validation errors inline
    - Success/error toast notifications
    - Loading states on buttons
    - Confirmation dialogs for destructive actions (delete)

**Rich Text Editor Choice:**

- **TipTap** (recommended)
  - Install: `npm install @tiptap/react @tiptap/starter-kit`
  - Provides headless editor with good documentation
  - Flexible and extensible
  - Outputs clean HTML
- **Draft.js** (alternative)
  - More mature but bigger learning curve
  - Better for complex use cases

**Critical Files:**

- `src/app/(admin)/admin/layout.tsx` (CREATE NEW)
- `src/app/(admin)/admin/page.tsx` (CREATE NEW)
- `src/app/(admin)/admin/posts/page.tsx` (CREATE NEW)
- `src/app/(admin)/admin/posts/new/page.tsx` (CREATE NEW)
- `src/app/(admin)/admin/posts/[id]/page.tsx` (CREATE NEW)
- `src/app/(admin)/admin/posts/components/PostForm.tsx` (CREATE NEW)
- `src/app/(admin)/admin/posts/components/RichTextEditor.tsx` (CREATE NEW)
- `src/app/(admin)/admin/posts/components/MetadataForm.tsx` (CREATE NEW)
- `src/app/(admin)/admin/components/Sidebar.tsx` (CREATE NEW)
- `src/app/(admin)/admin/categories/page.tsx` (CREATE NEW)
- `src/app/(admin)/admin/categories/new/page.tsx` (CREATE NEW)
- `src/app/(admin)/admin/categories/[id]/page.tsx` (CREATE NEW)
- `src/app/(admin)/admin/tags/page.tsx` (CREATE NEW)
- `src/app/(admin)/admin/tags/new/page.tsx` (CREATE NEW)
- `src/app/(admin)/admin/tags/[id]/page.tsx` (CREATE NEW)

**Verification:**

- Admin dashboard loads with correct statistics
- Post list displays all posts with correct data
- Create post form validates and saves successfully
- Edit post pre-fills data correctly
- Rich editor accepts and saves content
- Categories and tags can be created/edited/deleted
- Delete confirmations prevent accidental deletion
- Form errors display correctly
- Responsive on mobile devices

---

### PHASE 6: Admin Login (2-3 hours)

**Objective:** Create login page for admin access

**Tasks:**

1. **`src/app/(admin)/login/page.tsx`** - Login page
   - Email and password input fields
   - Submit button
   - Error message display (invalid credentials, server errors)
   - Link to dashboard if already logged in
   - Styling matching portfolio design

2. **Implement login flow:**
   - Form submission to `/api/auth/login`
   - Display loading state during submission
   - Show error messages if login fails
   - Redirect to /admin on successful login
   - Server-side validation of credentials

3. **Create initial admin user:**
   - Option 1: Prisma seed script in `prisma/seed.ts`
     - Run: `npx prisma db seed`
     - Creates default admin user with email/password
   - Option 2: Manual creation via Prisma Studio
     - Run: `npx prisma studio`
     - Create AdminUser record manually

**Critical Files:**

- `src/app/(admin)/login/page.tsx` (CREATE NEW)
- `prisma/seed.ts` (CREATE NEW - optional but recommended)

**Verification:**

- Login page loads and displays correctly
- Can login with valid credentials
- Login creates session cookie
- Successful login redirects to /admin
- Invalid credentials show error message
- Logout clears session and redirects to login
- Cannot access /admin without valid session

---

### PHASE 7: Enhanced Integration (2-3 hours)

**Objective:** Connect blog to main portfolio and finalize integration

**Tasks:**

1. **Update `src/app/layout.tsx`:**
   - Add blog link to main navigation
   - Include in header nav menu

2. **Update `src/app/page.tsx`:**
   - Optional: Add recent blog posts preview section
   - Link to full blog page

3. **Update navigation dictionary in `src/dictionaries/en.json`:**
   - Add blog navigation labels
   - Add blog section labels/titles

4. **Create TypeScript models:**
   - `src/app/models/Blog.ts` - Blog post interfaces
   - `src/app/models/Category.ts` - Category interfaces
   - `src/app/models/Tag.ts` - Tag interfaces

5. **Blog sitemap for SEO:**
   - Create `src/app/sitemap.ts`
   - Include all published blog posts in sitemap
   - Include blog landing page

6. **Open Graph/Social sharing:**
   - Ensure blog posts have OG images
   - Auto-generate OG images with post title (optional)

7. **Performance optimization:**
   - Enable ISR (Incremental Static Regeneration) on blog pages
   - Revalidate: 3600 (1 hour) for blog listing
   - Revalidate: 86400 (24 hours) for individual posts
   - Revalidate on admin POST/PUT for immediate updates

**Critical Files:**

- `src/app/layout.tsx` (UPDATE EXISTING)
- `src/app/page.tsx` (UPDATE EXISTING - optional)
- `src/dictionaries/en.json` (UPDATE EXISTING)
- `src/app/models/Blog.ts` (CREATE NEW)
- `src/app/models/Category.ts` (CREATE NEW)
- `src/app/models/Tag.ts` (CREATE NEW)
- `src/app/sitemap.ts` (CREATE NEW)

**Verification:**

- Blog link appears in main navigation
- Blog pages properly cached with ISR
- SEO sitemap includes all posts
- Meta tags correct for sharing

---

## Environment Variables Setup

Add these to `.env.local`:

```env
# PostgreSQL Connection (from cloud provider)
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Session Management
SESSION_SECRET="your-random-string-min-32-characters"

# Optional
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

---

## Testing Strategy (Optional but Recommended)

### Priority Order

1. **API Routes** (Jest + supertest)
   - Test CRUD operations
   - Test search and filtering
   - Test authentication

2. **Components** (React Testing Library)
   - Test filters and search
   - Test form submissions
   - Test pagination

3. **Database** (Prisma test utilities)
   - Test migrations
   - Test relationships
   - Test cascading deletes

---

## Key Design Decisions

| Decision        | Choice                                  | Rationale                                      |
| --------------- | --------------------------------------- | ---------------------------------------------- |
| Authentication  | Session-based HTTP-only cookies         | Simple, secure for admin area                  |
| Search          | PostgreSQL ILIKE (upgrade to FTS later) | Easy to implement, sufficient for < 1000 posts |
| Rich Editor     | TipTap                                  | Modern, flexible, good documentation           |
| Image Storage   | External URLs only                      | No storage complexity, use CDN                 |
| Pagination Type | Offset-based                            | Simpler implementation                         |
| Database        | Cloud PostgreSQL                        | Easy deployment, no local setup needed         |
| Admin Routes    | Integrated in Next.js                   | Simpler than separate app                      |

---

## Critical Files Summary

| File                                                  | Purpose                     | Status          |
| ----------------------------------------------------- | --------------------------- | --------------- |
| `/prisma/schema.prisma`                               | Database schema definition  | CREATE NEW      |
| `src/app/lib/db.ts`                                   | Prisma client singleton     | CREATE NEW      |
| `src/app/lib/auth.ts`                                 | Authentication utilities    | CREATE NEW      |
| `middleware.ts`                                       | Route protection middleware | CREATE NEW      |
| `src/app/api/blog/route.ts`                           | Blog CRUD endpoints         | CREATE NEW      |
| `src/app/api/blog/search/route.ts`                    | Search endpoint             | CREATE NEW      |
| `src/app/api/auth/login/route.ts`                     | Admin login                 | CREATE NEW      |
| `src/app/(public)/blog/page.tsx`                      | Blog listing page           | CREATE NEW      |
| `src/app/(public)/blog/[slug]/page.tsx`               | Individual post page        | CREATE NEW      |
| `src/app/(admin)/admin/layout.tsx`                    | Admin dashboard layout      | CREATE NEW      |
| `src/app/(admin)/admin/posts/components/PostForm.tsx` | Post creation/edit form     | CREATE NEW      |
| `src/app/(admin)/login/page.tsx`                      | Admin login page            | CREATE NEW      |
| `src/app/layout.tsx`                                  | Root layout                 | UPDATE EXISTING |
| `src/dictionaries/en.json`                            | Content dictionary          | UPDATE EXISTING |

---

## Implementation Verification Checklist

### Phase 1 - Database

- [ ] PostgreSQL cloud account created and connected
- [ ] Prisma schema defined with all models
- [ ] Database migrations run successfully
- [ ] Prisma client imports work

### Phase 2 - API Routes

- [ ] All 10 API routes created and tested
- [ ] CRUD operations work correctly
- [ ] Search filters posts properly
- [ ] Error handling returns correct status codes

### Phase 3 - Auth

- [ ] Login endpoint works with valid credentials
- [ ] Invalid credentials return 401
- [ ] Session cookie created and HTTP-only
- [ ] Middleware protects /admin routes
- [ ] Logout clears session
- [ ] /api/auth/me returns current user

### Phase 4 - Public Pages

- [ ] /blog loads and displays posts
- [ ] Search filters by title/description
- [ ] Category/tag filters work
- [ ] Pagination works
- [ ] /blog/[slug] loads individual posts
- [ ] Invalid slug shows 404
- [ ] SEO metadata present
- [ ] Responsive on all devices

### Phase 5 - Admin

- [ ] /admin dashboard loads
- [ ] Can create new post
- [ ] Can edit existing post
- [ ] Can delete post with confirmation
- [ ] Can manage categories and tags
- [ ] Rich text editor works
- [ ] Form validation works
- [ ] Success/error notifications show

### Phase 6 - Login

- [ ] /admin/login loads
- [ ] Can login with valid credentials
- [ ] Invalid login shows error
- [ ] Session persists across pages
- [ ] Can logout

### Phase 7 - Integration

- [ ] Blog link in main navigation
- [ ] Blog posts in sitemap
- [ ] Open Graph metadata correct
- [ ] ISR caching working

---

## Post-Implementation Features (Phase 8 - Optional)

These can be added after core functionality is working:

1. **Image Upload**
   - Integrate Cloudinary or similar CDN
   - Auto-resize and optimize images
   - Generate OG images automatically

2. **Advanced SEO**
   - Generate text previews automatically
   - Schema.org markup extensions
   - Meta robots tags for drafts

3. **Content Features**
   - Markdown import/export
   - Post scheduling
   - Draft collaboration
   - Revision history

4. **Analytics**
   - Post view counts
   - Popular posts section
   - Reading analytics

5. **Comments System**
   - Comment moderation
   - Email notifications
   - Spam filtering

6. **Social Integration**
   - Social sharing buttons
   - Twitter card optimization
   - LinkedIn preview

---

## Deployment Checklist

Before going to production:

- [ ] Database backup strategy in place
- [ ] All environment variables configured in production
- [ ] Admin user created in production database
- [ ] Error logging configured (Sentry, etc.)
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in production build
- [ ] SSL/HTTPS enforced
- [ ] Rate limiting on API routes
- [ ] Admin login works in production
- [ ] Blog pages load correctly
- [ ] Search functionality works
- [ ] SEO metadata visible (Open Graph, meta tags)
- [ ] Image loading optimized
- [ ] Mobile responsiveness verified
- [ ] Analytics configured (if needed)

---

## Estimated Timeline

| Phase                | Duration        | Difficulty  |
| -------------------- | --------------- | ----------- |
| 1. Database Setup    | 2-3 hours       | Medium      |
| 2. API Routes        | 4-6 hours       | Medium      |
| 3. Auth & Middleware | 3-4 hours       | Medium      |
| 4. Public Blog Pages | 5-7 hours       | Medium-High |
| 5. Admin Dashboard   | 6-8 hours       | High        |
| 6. Admin Login       | 2-3 hours       | Low         |
| 7. Integration       | 2-3 hours       | Low         |
| **Total**            | **24-34 hours** | **Medium**  |

**Note:** Timeline assumes some experience with Next.js. Actual time may vary based on familiarity with:

- Prisma ORM
- REST API design
- Form validation and handling
- React hooks and state management
- Authentication concepts
