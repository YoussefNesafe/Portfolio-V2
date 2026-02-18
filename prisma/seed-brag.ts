import { db } from "../src/app/lib/db";

async function main() {
  console.log("Seeding brag data...");

  // Ensure categories exist
  const categoryData = [
    { name: "Projects", slug: "projects", color: "#06B6D4", sortOrder: 0 },
    { name: "Bug Fixes", slug: "bug-fixes", color: "#EF4444", sortOrder: 1 },
    { name: "Learning", slug: "learning", color: "#A855F7", sortOrder: 2 },
    { name: "Collaboration", slug: "collaboration", color: "#F59E0B", sortOrder: 3 },
    { name: "Design/Architecture", slug: "design-architecture", color: "#10B981", sortOrder: 4 },
    { name: "DevOps/Infra", slug: "devops-infra", color: "#3B82F6", sortOrder: 5 },
  ];

  const categories = await Promise.all(
    categoryData.map((cat) =>
      db.bragCategory.upsert({
        where: { name: cat.name },
        update: {},
        create: cat,
      }),
    ),
  );
  console.log("Categories ready:", categories.length);

  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  // Generate entries spanning the last 8 months
  const entries = [
    // February 2026
    { title: "Implemented Brag Report Dashboard", description: "Built a full-stack brag report system with admin CRUD, public dashboard with heatmap, charts, and timeline. Integrated into existing portfolio architecture.", impact: "New portfolio feature showcasing daily work", date: "2026-02-18", category: "projects", pinned: true },
    { title: "Fixed session validation race condition", description: "Discovered and fixed a race condition where expired sessions could briefly authenticate requests during the cleanup window.", impact: "Eliminated auth edge case affecting ~2% of requests", date: "2026-02-15", category: "bug-fixes", pinned: false },
    { title: "Reviewed team's API design proposal", description: "Provided detailed feedback on the new REST API versioning strategy. Suggested URL-based versioning over header-based for better developer experience.", date: "2026-02-14", category: "collaboration", pinned: false },
    { title: "Learned Recharts library", description: "Explored Recharts for data visualization. Built custom area charts, pie charts with responsive containers and dark theme styling.", date: "2026-02-12", category: "learning", pinned: false },
    { title: "Set up CI caching for Prisma", description: "Added Prisma client generation caching to GitHub Actions. Reduced CI build times by caching the generated client between runs.", impact: "CI builds 40% faster", date: "2026-02-10", category: "devops-infra", pinned: true },
    { title: "Designed activity heatmap component", description: "Created a custom SVG-based GitHub-style activity heatmap with tooltips, color scaling, and responsive layout. No external dependency needed.", date: "2026-02-08", category: "design-architecture", pinned: false },
    { title: "Fixed Tailwind purge missing dynamic classes", description: "Dynamic color classes generated from database values were being purged. Switched to inline styles for user-defined colors.", date: "2026-02-05", category: "bug-fixes", pinned: false },
    { title: "Added Zod validation to all brag API routes", description: "Implemented comprehensive input validation with Zod schemas for create and update operations on both entries and categories.", date: "2026-02-03", category: "projects", pinned: false },

    // January 2026
    { title: "Built blog post scheduling system", description: "Implemented a scheduling queue for blog posts with cron-based publishing. Posts can be scheduled for future dates and automatically go live.", impact: "Enabled content planning workflow", date: "2026-01-28", category: "projects", pinned: true },
    { title: "Migrated from SQLite to PostgreSQL", description: "Migrated the entire database from SQLite to PostgreSQL on Supabase. Updated all queries, fixed case-insensitive search, and updated Prisma schema.", impact: "Production-ready database with full-text search", date: "2026-01-25", category: "devops-infra", pinned: true },
    { title: "Pair programmed on auth system", description: "Worked through the Edge Runtime vs Node.js runtime auth split with a colleague. Documented the architecture decision and trade-offs.", date: "2026-01-22", category: "collaboration", pinned: false },
    { title: "Deep dive into Next.js 16 App Router", description: "Studied the new async searchParams pattern, server component boundaries, and React Compiler integration. Wrote notes on key differences from Pages Router.", date: "2026-01-20", category: "learning", pinned: false },
    { title: "Fixed middleware cookie parsing on Edge", description: "Edge Runtime middleware was failing to parse session cookies with special characters. Switched to manual cookie parsing instead of using the cookies() API.", date: "2026-01-18", category: "bug-fixes", pinned: false },
    { title: "Designed CRUD route factory pattern", description: "Abstracted repetitive category/tag CRUD into a factory function that generates GET/POST/PUT/DELETE handlers from a config object. Reduced boilerplate by ~60%.", impact: "DRY pattern reusable across entities", date: "2026-01-15", category: "design-architecture", pinned: true },
    { title: "Added security headers via middleware", description: "Implemented X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and HSTS headers in the Next.js middleware layer.", date: "2026-01-12", category: "devops-infra", pinned: false },
    { title: "Optimized blog listing with revalidation", description: "Added ISR with revalidate=3600 to the blog listing page. Combined with revalidatePath() calls on mutations for instant updates.", date: "2026-01-08", category: "projects", pinned: false },

    // December 2025
    { title: "Built admin dashboard layout", description: "Created the admin panel with responsive sidebar navigation, mobile hamburger menu, and protected route wrapper component.", date: "2025-12-28", category: "projects", pinned: false },
    { title: "Studied Framer Motion animation patterns", description: "Learned stagger containers, viewport-triggered animations, and variant composition. Created a reusable animations library for the portfolio.", date: "2025-12-22", category: "learning", pinned: false },
    { title: "Fixed hydration mismatch in blog filters", description: "Client-side URL parsing was producing different output than server during SSR. Fixed by using useSearchParams() consistently.", date: "2025-12-18", category: "bug-fixes", pinned: false },
    { title: "Code reviewed portfolio homepage PR", description: "Reviewed the hero section, about section, and experience timeline. Suggested animation improvements and accessibility fixes.", date: "2025-12-15", category: "collaboration", pinned: false },
    { title: "Designed vw-based responsive system", description: "Created a viewport-width based responsive design system with three breakpoints (mobile 375px, tablet 800px, desktop 1920px). Wrote conversion formulas and Tailwind config.", impact: "Consistent scaling across all device sizes", date: "2025-12-10", category: "design-architecture", pinned: true },
    { title: "Set up Prisma with PostgreSQL", description: "Configured Prisma ORM with PostgreSQL, created initial schema with AdminUser, Session, Author, Post, Category, and Tag models.", date: "2025-12-05", category: "devops-infra", pinned: false },

    // November 2025
    { title: "Initialized Next.js 16 portfolio project", description: "Set up the portfolio project with Next.js 16, TypeScript, Tailwind CSS 4, and the App Router. Configured ESLint, Prisma, and project structure.", impact: "Foundation for the entire portfolio", date: "2025-11-28", category: "projects", pinned: false },
    { title: "Explored Tailwind CSS 4 changes", description: "Studied the new Tailwind CSS 4 features including CSS-first configuration, automatic content detection, and the new color system.", date: "2025-11-22", category: "learning", pinned: false },
    { title: "Architected blog system data model", description: "Designed the blog system's data model with posts, categories, tags (many-to-many), authors, and admin authentication. Drew ER diagrams and defined indexes.", date: "2025-11-15", category: "design-architecture", pinned: false },
    { title: "Set up GitHub Actions CI pipeline", description: "Created a CI pipeline with TypeScript type checking, ESLint, Prisma generation, and build verification on every push.", date: "2025-11-10", category: "devops-infra", pinned: false },
    { title: "Mentored junior dev on React Server Components", description: "Held a knowledge-sharing session explaining the mental model of server vs client components, when to use 'use client', and data fetching patterns.", date: "2025-11-05", category: "collaboration", pinned: false },

    // October 2025
    { title: "Fixed CSS grid overflow on mobile", description: "Blog card grid was overflowing on small screens. Fixed by adjusting grid template and adding proper min-width constraints.", date: "2025-10-28", category: "bug-fixes", pinned: false },
    { title: "Built reusable useCrudManager hook", description: "Created a generic React hook for inline CRUD operations with optimistic state, error handling, and router refresh. Used across categories and tags admin pages.", date: "2025-10-22", category: "projects", pinned: false },
    { title: "Learned about Edge Runtime limitations", description: "Researched Edge Runtime constraints in Next.js — no Node.js crypto, limited API surface, cold start benefits. Documented findings for team.", date: "2025-10-15", category: "learning", pinned: false },
    { title: "Configured Supabase PostgreSQL", description: "Set up Supabase project, configured connection pooling, and tested Prisma connectivity. Added environment variable management.", date: "2025-10-08", category: "devops-infra", pinned: false },

    // September 2025
    { title: "Prototyped portfolio hero section", description: "Built the animated hero section with typewriter effect, floating particles, and gradient text. Iterated on three design variations before settling on the final look.", date: "2025-09-25", category: "projects", pinned: false },
    { title: "Studied TypeScript 5 decorators", description: "Explored the new TC39 decorators in TypeScript 5, comparing with the legacy experimental decorators. Tested with class-based patterns.", date: "2025-09-18", category: "learning", pinned: false },
    { title: "Fixed timezone issues in date handling", description: "Blog post dates were shifting by one day due to UTC vs local timezone conversion. Standardized all dates to UTC with explicit timezone handling.", date: "2025-09-12", category: "bug-fixes", pinned: false },
    { title: "Planned portfolio information architecture", description: "Mapped out all portfolio sections (hero, about, experience, projects, skills, contact, blog) and their data sources. Created component hierarchy.", date: "2025-09-05", category: "design-architecture", pinned: false },

    // August 2025
    { title: "Built experience timeline component", description: "Created an animated vertical timeline for work experience with scroll-triggered animations, company logos, and expandable descriptions.", date: "2025-08-28", category: "projects", pinned: false },
    { title: "Set up i18n dictionary system", description: "Implemented a JSON-based dictionary system for all UI text, with TypeScript interfaces for type-safe access. Prepared for future multi-language support.", date: "2025-08-20", category: "design-architecture", pinned: false },
    { title: "Helped debug production deployment issue", description: "Assisted a teammate with a Vercel deployment failure caused by missing environment variables. Set up a deployment checklist.", date: "2025-08-12", category: "collaboration", pinned: false },

    // July 2025
    { title: "Built skills section with animated bars", description: "Created the skills section with categorized skill bars, hover tooltips, and staggered reveal animations on scroll.", date: "2025-07-22", category: "projects", pinned: false },
    { title: "Learned Prisma query optimization", description: "Studied Prisma's query engine, connection pooling, and the N+1 problem. Implemented batched queries with Promise.all and select/include optimization.", date: "2025-07-15", category: "learning", pinned: false },
    { title: "Fixed blog search debounce causing stale results", description: "Search input debounce was causing the URL to update with stale search terms. Fixed by using useTransition and proper cleanup.", date: "2025-07-08", category: "bug-fixes", pinned: false },
  ];

  let created = 0;
  for (const entry of entries) {
    const existing = await db.bragEntry.findFirst({
      where: { title: entry.title },
    });
    if (!existing) {
      await db.bragEntry.create({
        data: {
          title: entry.title,
          description: entry.description,
          impact: entry.impact || null,
          date: new Date(entry.date),
          published: true,
          pinned: entry.pinned || false,
          categoryId: catMap[entry.category],
        },
      });
      created++;
    }
  }

  console.log(`Created ${created} brag entries (${entries.length - created} already existed)`);
  console.log("Brag seed complete!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
