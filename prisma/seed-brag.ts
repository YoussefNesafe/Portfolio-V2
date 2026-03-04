import { db } from "../src/app/lib/db";

async function main() {
  console.log("Clearing existing brag data...");
  await db.bragEntry.deleteMany({});
  await db.bragCategory.deleteMany({});
  console.log("Existing data cleared.");

  console.log("Seeding brag categories...");
  const categoryData = [
    { name: "Feature Development", slug: "feature-development", color: "#06B6D4", sortOrder: 0 },
    { name: "Bug Fixes & Maintenance", slug: "bug-fixes-maintenance", color: "#EF4444", sortOrder: 1 },
    { name: "Performance & SEO", slug: "performance-seo", color: "#10B981", sortOrder: 2 },
    { name: "Payments & Fintech", slug: "payments-fintech", color: "#F59E0B", sortOrder: 3 },
    { name: "Web3 / Blockchain", slug: "web3-blockchain", color: "#A855F7", sortOrder: 4 },
    { name: "Cross-Platform & i18n", slug: "cross-platform-i18n", color: "#3B82F6", sortOrder: 5 },
  ];

  const categories = await Promise.all(
    categoryData.map((cat) =>
      db.bragCategory.create({ data: cat }),
    ),
  );
  console.log("Categories created:", categories.length);
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  console.log("Seeding brag entries...");

  type EntryInput = {
    title: string;
    description: string;
    impact?: string;
    date: string;
    category: string;
    pinned: boolean;
  };

  const entries: EntryInput[] = [
    // ── 2026 Q1 ───────────────────────────────────────────────────────────────

    {
      title: "Rebuilt FAQ help center using test-driven development",
      description:
        "Redesigned the support FAQ system from scratch using TDD — writing 107 tests before building any component. The new system includes localized category grids, article lists, breadcrumbs, a 'Need Help' section, and dedicated hooks for data fetching.",
      impact: "107 tests written first; shipped a fully tested, zero-regression help center",
      date: "2026-02-23",
      category: "feature-development",
      pinned: true,
    },
    {
      title: "Consolidated platform authentication to a secure iframe-based flow",
      description:
        "Removed five legacy login form components — FormField, LoginForm, OTPForm, PasswordInput, and PromotionPanel — and replaced the entire authentication surface with a single iframe-embedded flow. Made the auth boundary explicit and easy to maintain.",
      impact: "Cut login-related code by ~85%; enabled external platforms to embed auth without custom logic",
      date: "2026-02-24",
      category: "web3-blockchain",
      pinned: true,
    },
    {
      title: "Added live auto-refresh when DAO proposals expire",
      description:
        "Built a custom React hook that watches an upcoming proposal's expiry timer and schedules automatic query invalidation when it fires, so users see updated voting status the moment a proposal opens — without needing to refresh the page.",
      date: "2026-02-26",
      category: "web3-blockchain",
      pinned: false,
    },
    {
      title: "Fixed Apple Pay and Google Pay reliability in production",
      description:
        "Traced and resolved multiple payment method failures: Google Pay was failing in production because the environment string was lowercase instead of uppercase, Apple Pay had incorrect availability checks, and a 3DS authentication method was incorrectly enabled in staging.",
      impact: "Restored reliable payment processing for Apple Pay and Google Pay users",
      date: "2026-02-19",
      category: "bug-fixes-maintenance",
      pinned: false,
    },
    {
      title: "Fixed stale price quotation in the crypto sell flow",
      description:
        "The sell modal was showing outdated price quotes because it prioritized a stale field on the payment method object over the refreshed store quote. Fixed the synchronization logic so the latest pricing is always reflected before a user confirms a trade.",
      date: "2026-02-19",
      category: "bug-fixes-maintenance",
      pinned: false,
    },
    {
      title: "Fixed embedded auth page blocked by security headers",
      description:
        "The default Content Security Policy (X-Frame-Options: SAMEORIGIN) was preventing the DAO auth page from loading inside an iframe on an external domain. Fixed by excluding the auth route from the restrictive header policy and correcting the allowed-origin domain.",
      date: "2026-02-24",
      category: "bug-fixes-maintenance",
      pinned: false,
    },
    {
      title: "Replaced hardcoded strings with i18n translations in trade modals",
      description:
        "Audited the trade modal and replaced every hardcoded English toast notification and status message with calls to the i18n translation system, ensuring non-English users see messages in their own language.",
      date: "2026-02-02",
      category: "cross-platform-i18n",
      pinned: false,
    },
    {
      title: "Built offline connection detector",
      description:
        "Added a lightweight component that monitors the browser's network status and surfaces a clear indicator when the user loses connectivity — preventing confusing silent failures when users try to trade or deposit while offline.",
      date: "2026-02-01",
      category: "feature-development",
      pinned: false,
    },
    {
      title: "Added regulatory compliance document flow for deposits",
      description:
        "Integrated a multi-step document flow required by financial regulators for deposit travel rules. Built a dedicated result modal, a shared StatusBadge component used across different transaction states, and wired up the document fetch and submission APIs.",
      impact: "Ensured platform compliance with financial travel rule reporting requirements",
      date: "2026-02-01",
      category: "payments-fintech",
      pinned: false,
    },
    {
      title: "Integrated wallet deposit and withdrawal APIs",
      description:
        "Wired up the complete server-side deposit and withdrawal API layer — including endpoint integration, authentication token management, request/response handling, and error states — enabling the payment flow to process real transactions end to end.",
      date: "2026-01-22",
      category: "payments-fintech",
      pinned: false,
    },
    {
      title: "Added bank transfer deposit support",
      description:
        "Enabled the bank transfer deposit option, which is a manual wire process that doesn't require a price quotation. Fixed the Preview button logic to correctly enable for this payment method and handled the async deposit response with proper redirect behavior.",
      date: "2026-02-19",
      category: "payments-fintech",
      pinned: false,
    },
    {
      title: "Refactored convert modal with smart asset preselection",
      description:
        "Rewrote the crypto conversion modal to intelligently preselect assets based on the user's current holdings and context. Added proper loading states while asset lists are fetched, and built a clear empty-state when no convertible assets are available.",
      date: "2026-01-29",
      category: "feature-development",
      pinned: false,
    },
    {
      title: "Localized all receipt PDFs with i18n labels",
      description:
        "Replaced every hardcoded English string inside the receipt PDF generator with translated labels pulled from the i18n system. Also fixed decimal fee formatting and removed a legacy Order Details modal that had been superseded by the new receipt flow.",
      date: "2026-02-19",
      category: "cross-platform-i18n",
      pinned: false,
    },

    // ── 2025 Q4 ───────────────────────────────────────────────────────────────

    {
      title: "Launched full buy and sell crypto trading flows",
      description:
        "Built the end-to-end buy and sell trading experience from the ground up: asset selection, real-time price quotation, preview modal, order confirmation, and a post-trade receipt with share/download options. Covers multiple payment methods including card and Apple/Google Pay.",
      impact: "Core trading feature enabling users to buy and sell digital assets on the platform",
      date: "2025-12-30",
      category: "payments-fintech",
      pinned: true,
    },
    {
      title: "Built ambassador partnership campaign landing page",
      description:
        "Developed a high-profile campaign page for an international sports ambassador partnership, featuring a hero slider with promotional slides, dedicated sections, and full Arabic/English support. Coordinated visual assets and copy across both language variants.",
      date: "2025-11-07",
      category: "feature-development",
      pinned: false,
    },
    {
      title: "Updated Arabic translation files across multiple apps",
      description:
        "Audited and corrected Arabic-language JSON translation files across three different web apps, fixing missing keys, incorrect strings, and formatting issues that had caused display bugs for RTL users.",
      date: "2025-11-03",
      category: "cross-platform-i18n",
      pinned: false,
    },
    {
      title: "Built Jeddah Fintech 2025 conference landing page",
      description:
        "Created a dedicated event landing page for a major fintech conference, including a custom hero, event information sections, and a lead capture registration form with multi-locale routing.",
      date: "2025-10-31",
      category: "feature-development",
      pinned: false,
    },
    {
      title: "Built dynamic gold product landing page",
      description:
        "Implemented a flexible landing page for a gold trading product, designed to be data-driven with configurable content sections. Used a legacy-compatible URL pattern to support existing marketing links while serving the new design.",
      date: "2025-10-16",
      category: "feature-development",
      pinned: false,
    },
    {
      title: "Added legal terms & conditions modal",
      description:
        "Implemented a compliance-driven terms and conditions modal triggered at key user decision points. Built with proper focus management, scroll lock for accessibility, and separate copy for Arabic and English audiences.",
      date: "2025-10-25",
      category: "feature-development",
      pinned: false,
    },

    // ── 2025 Q3 ───────────────────────────────────────────────────────────────

    {
      title: "Built Forex Expo Dubai 2025 conference page",
      description:
        "Developed a fully responsive event landing page for a major international forex conference held in Dubai, covering speaker highlights, schedule sections, and a lead registration form wired to the CRM.",
      date: "2025-09-15",
      category: "feature-development",
      pinned: false,
    },

    // ── 2025 Q2 ───────────────────────────────────────────────────────────────

    {
      title: "Built email OTP authentication for login flows",
      description:
        "Designed and implemented a complete email one-time password (OTP) authentication system used across multiple login surfaces. Handles token generation, email delivery, code validation, expiry, and all error states — with refactoring support for clean reuse across apps.",
      impact: "Shipped production OTP auth to 3 web apps, hardening login security for thousands of daily users",
      date: "2025-06-26",
      category: "feature-development",
      pinned: true,
    },
    {
      title: "Fixed OTP refactoring and locale routing regressions",
      description:
        "After shipping the OTP feature, cleaned up duplication across 10 files and fixed a locale handler bug for a specific jurisdiction that was causing users to be redirected to the wrong regional site after authentication.",
      date: "2025-06-30",
      category: "bug-fixes-maintenance",
      pinned: false,
    },
    {
      title: "Fixed canonical link configuration on marketing pages",
      description:
        "Several marketing pages had missing or incorrect canonical link tags, which can cause search engines to treat pages as duplicate content. Audited and corrected canonical tags across 6 pages including an awards section link.",
      date: "2025-06-17",
      category: "performance-seo",
      pinned: false,
    },
    {
      title: "Implemented cross-domain analytics tracking for form submissions",
      description:
        "Added Google Analytics _gl parameter propagation to form submission events, enabling complete attribution tracking across multiple subdomains. Debugged edge cases in the cross-domain linker that were breaking the tracking chain.",
      date: "2025-06-11",
      category: "performance-seo",
      pinned: false,
    },
    {
      title: "Updated translation files for token product across all locales",
      description:
        "Refreshed translation JSON files for the token product web app, correcting strings and ensuring consistency across all active locale variants ahead of a marketing push.",
      date: "2025-06-02",
      category: "cross-platform-i18n",
      pinned: false,
    },
    {
      title: "Built gold-themed UI for token product launch",
      description:
        "Designed and implemented a full gold color theme for a token product's web app — covering buttons, cards, gradients, borders, and background treatments across 40 files — to align the visual identity with the product's brand positioning.",
      date: "2025-05-27",
      category: "feature-development",
      pinned: false,
    },
    {
      title: "Added ES, FR, IT, DE, TR translations for token waitlist",
      description:
        "Translated the token product waitlist page into five European languages (Spanish, French, Italian, German, Turkish) and filled in missing Arabic content, enabling the product to reach a significantly wider international audience.",
      date: "2025-05-29",
      category: "cross-platform-i18n",
      pinned: false,
    },
    {
      title: "Built RWA token sections and interactive claim flow",
      description:
        "Implemented the Real World Asset token product pages, including multiple content sections and a 'Claim Your USDT' interactive section. Content is delivered per locale, with a full registration and eligibility flow.",
      date: "2025-04-28",
      category: "feature-development",
      pinned: false,
    },
    {
      title: "Built Abu Dhabi Expo 2025 event landing page",
      description:
        "Developed a tailored event page for the Abu Dhabi Expo 2025 conference, including speaker highlights, schedule, and a lead capture form for conference attendees.",
      date: "2025-04-09",
      category: "feature-development",
      pinned: false,
    },

    // ── 2025 Q1 ───────────────────────────────────────────────────────────────

    {
      title: "Built demo trading competition platform",
      description:
        "Designed and built a complete demo trading competition system — a registration form with full validation, a real-time leaderboard showing ranked participants, a rules page, and URL rewrites for a clean competition subdirectory. All pages support multiple locales.",
      impact: "Supported a major company trading competition with thousands of participant sign-ups",
      date: "2025-01-31",
      category: "feature-development",
      pinned: true,
    },
    {
      title: "Built live competition leaderboard",
      description:
        "Created a real-time leaderboard component for the trading competition, fetching and displaying ranked trader standings with automatic data refresh.",
      date: "2025-01-20",
      category: "feature-development",
      pinned: false,
    },
    {
      title: "Fixed homepage sitemap generation",
      description:
        "The sitemap was incorrectly generating HTML files instead of XML and was missing key pages. Fixed the sitemap configuration, URL resolution logic, and verified correct file serving to search crawlers.",
      date: "2025-02-17",
      category: "performance-seo",
      pinned: false,
    },
    {
      title: "Large-scale homepage codebase cleanup",
      description:
        "Tackled years of accumulated tech debt in the homepage — restructured the component hierarchy, standardized TypeScript types, removed dead code, and simplified data fetching patterns across 269 files without changing any user-visible behavior.",
      date: "2025-02-25",
      category: "bug-fixes-maintenance",
      pinned: false,
    },
    {
      title: "Built financial documents resource page",
      description:
        "Created a structured page listing all important financial documents — account agreements, risk disclosures, legal policies — with download links, organized categories, and multi-locale routing.",
      date: "2025-03-28",
      category: "feature-development",
      pinned: false,
    },
    {
      title: "Updated SEO metadata across all major pages",
      description:
        "Refreshed title tags, meta descriptions, Open Graph data, and Twitter card metadata across 5 main site sections to align with updated brand positioning and improve search result appearance.",
      date: "2025-03-31",
      category: "performance-seo",
      pinned: false,
    },

    // ── 2024 Q4 ───────────────────────────────────────────────────────────────

    {
      title: "Built IB 'Choose Your Regulator' jurisdiction selector",
      description:
        "Implemented a regulatory jurisdiction selector for the Introducing Broker section, allowing business partners to choose their relevant regulator (BVI, ASIC, FCA, etc.) and see the matching registration forms, disclosures, and account types.",
      date: "2024-11-26",
      category: "feature-development",
      pinned: false,
    },
    {
      title: "Launched UAE regional market with full localization",
      description:
        "Rolled out complete UAE-specific market support — added AE language variants for 12 key pages, covering both English and Arabic with region-specific content, legal disclosures, and routing rules.",
      impact: "Opened a major regional market; 54,000+ lines of localized content shipped across 12 pages",
      date: "2024-11-13",
      category: "cross-platform-i18n",
      pinned: true,
    },
    {
      title: "Added WhatsApp live support chat widget",
      description:
        "Integrated a WhatsApp chat component as a floating support widget across the platform, enabling users to reach the support team instantly. Styled to match brand guidelines with responsive positioning on mobile and desktop.",
      date: "2024-11-20",
      category: "feature-development",
      pinned: false,
    },
    {
      title: "Built 'Where To Go Next' contextual navigation section",
      description:
        "Created a contextual navigation section that surfaces after key user actions, helping users discover the next relevant area of the platform. Built across 72 files to cover all active locale variants.",
      date: "2024-11-05",
      category: "feature-development",
      pinned: false,
    },
    {
      title: "Fixed marketing event tracking and page metadata",
      description:
        "Resolved metadata inconsistencies across several pages and fixed broken GTM events that were affecting paid campaign performance measurement. Ensured all tracking events fired correctly for acquisition reporting.",
      date: "2024-10-25",
      category: "performance-seo",
      pinned: false,
    },

    // ── 2024 Q3 ───────────────────────────────────────────────────────────────

    {
      title: "Built embedded crypto deposit flow",
      description:
        "Integrated an embedded crypto deposit interface using an iframe approach, allowing users to complete crypto deposits without leaving the app. Handled responsive sizing, authentication context passing, and fallback states.",
      date: "2024-09-19",
      category: "payments-fintech",
      pinned: false,
    },
    {
      title: "Implemented GDPR-compliant cookie consent with reject option",
      description:
        "Built a fully compliant cookie consent banner with a proper reject option for non-essential cookies — not just an accept button. Wired up Google Tag Manager's consent mode to correctly fire or suppress tracking tags based on the user's choice.",
      impact: "Brought the platform into GDPR compliance with an auditable reject-first consent flow",
      date: "2024-09-16",
      category: "feature-development",
      pinned: false,
    },
    {
      title: "Fixed GTM consent mode tag firing",
      description:
        "GTM's consent mode was not correctly updating after user interaction, causing analytics and advertising tags to misfire or fire when they shouldn't. Fixed the consent state management and verified correct behavior across Chrome, Firefox, and Safari.",
      date: "2024-09-05",
      category: "performance-seo",
      pinned: false,
    },
    {
      title: "Built animated live price ticker ribbon",
      description:
        "Created a real-time price ticker ribbon component showing live asset prices with smooth horizontal scroll animation. Includes configurable asset lists, automatic price refresh, and graceful fallback when data is unavailable.",
      date: "2024-08-01",
      category: "feature-development",
      pinned: false,
    },
    {
      title: "Fixed post-launch ribbon and navigation bugs",
      description:
        "Resolved several bugs discovered shortly after the ribbon launch: ticker overflow on certain screen widths, mobile navigation button misalignment, and a broken navbar style hook that caused layout shifts on scroll.",
      date: "2024-08-02",
      category: "bug-fixes-maintenance",
      pinned: false,
    },
    {
      title: "Built leverage and margin information page",
      description:
        "Developed a comprehensive leverage and margin reference page with data tables covering all trading instruments, an interactive margin calculator, and a responsive layout that works cleanly on mobile.",
      date: "2024-07-09",
      category: "feature-development",
      pinned: false,
    },

    // ── 2024 Q2 ───────────────────────────────────────────────────────────────

    {
      title: "Integrated media center via embedded iframe",
      description:
        "Embedded the company's media center content into the main web app using a seamless iframe integration, covering 62 files across all locale variants so every regional user sees content in the correct language.",
      date: "2024-06-28",
      category: "feature-development",
      pinned: false,
    },

    // ── 2024 Q1 ───────────────────────────────────────────────────────────────

    {
      title: "Built trading contest terms & conditions page",
      description:
        "Implemented a structured legal T&C page for a trading competition, with full locale routing, jurisdiction-specific content, and a linked acceptance flow before users could enter the contest.",
      date: "2024-03-07",
      category: "feature-development",
      pinned: false,
    },

    // ── 2023 Q3 ───────────────────────────────────────────────────────────────

    {
      title: "Built TradingView market data widgets section",
      description:
        "Integrated TradingView's embeddable widgets to show live market data on the homepage — including a price chart, market overview table, and ticker tape — all configurable per locale and moved to the root layout for efficient loading.",
      date: "2023-08-09",
      category: "feature-development",
      pinned: false,
    },
    {
      title: "Built company awards showcase section",
      description:
        "Designed and implemented a visually prominent section displaying industry awards and accolades, with scroll-triggered reveal animations and a reusable Badges component added to the shared section library.",
      date: "2023-08-08",
      category: "feature-development",
      pinned: false,
    },

    // ── 2023 Q2 ───────────────────────────────────────────────────────────────

    {
      title: "Built economic calendar integration",
      description:
        "Embedded an economic calendar showing upcoming market-moving events, scheduled data releases, and impact levels. Built with locale-aware display and automatic data refresh for current event listings.",
      date: "2023-06-24",
      category: "feature-development",
      pinned: false,
    },
  ];

  let created = 0;
  for (const entry of entries) {
    await db.bragEntry.create({
      data: {
        title: entry.title,
        description: entry.description,
        impact: entry.impact ?? null,
        date: new Date(entry.date),
        published: true,
        pinned: entry.pinned,
        categoryId: catMap[entry.category],
      },
    });
    created++;
  }

  console.log(`Created ${created} brag entries.`);
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
