# i18n: Move Blog & Brag Static Strings to en.json

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove every hardcoded UI string from the blog and brag sections and source them from `src/dictionaries/en.json` via prop-drilling (Option A — consistent with how portfolio sections work).

**Architecture:** Server components call `getDictionary()` and pass typed labels objects as props down the tree. Client components accept those labels as required props. One documented exception: `blog/error.tsx` uses a Next.js-fixed signature (`{ error, reset }`) so it imports `en.json` directly as a static JSON import — the only place in the codebase that does this.

**Tech Stack:** Next.js 16 App Router, TypeScript 5, `src/dictionaries/en.json`, `src/get-dictionary.ts`.

---

## Prop-drilling chain reference

```
blog/layout.tsx (async server)
  └─ BlogHeader          ← title, subtitle

blog/page.tsx (server, already fetches DB)
  └─ BlogFilters         ← labels.search, labels.clearAll (+ passes down)
       ├─ MultiSelectDropdown (categories)  ← clearAllLabel, noResultsLabel
       │    └─ DropdownPanel               ← clearAllLabel, noResultsLabel
       └─ MultiSelectDropdown (tags)        ← same
       └─ SelectedChips                    ← clearAllLabel

blog/[slug]/page.tsx (server)
  ├─ inline              ← backToBlog, minRead
  └─ RelatedPosts        ← title

brag/page.tsx (server)
  └─ BragDashboard       ← labels (title/subtitle used inline)
       └─ BragStatsRow   ← statsLabels
```

---

### Task 1: Add strings to en.json + TypeScript interfaces

**Files:**
- Modify: `src/dictionaries/en.json`
- Create: `src/app/models/IBlogDictionary.ts`
- Create: `src/app/models/IBragDictionary.ts`
- Modify: `src/app/models/IDictionary.ts`

**Step 1: Add the three new sections to en.json**

Open `src/dictionaries/en.json` and append these three top-level keys **inside** the root object (after `"contact": { ... }`):

```json
  "blog": {
    "header": {
      "title": "Blog",
      "subtitle": "Where technology meets curiosity, creativity, and real-world thinking."
    },
    "filters": {
      "searchPlaceholder": "Search posts...",
      "categoriesLabel": "Categories",
      "categoriesPlaceholder": "All Categories",
      "tagsLabel": "Tags",
      "tagsPlaceholder": "All Tags",
      "clearAll": "Clear all",
      "noResults": "No results found",
      "noPostsFound": "No posts found. Try adjusting your filters."
    },
    "pagination": {
      "previous": "Previous",
      "next": "Next",
      "page": "Page",
      "of": "of"
    },
    "error": {
      "title": "Something went wrong",
      "description": "Failed to load blog content. Please try again.",
      "retry": "Try again"
    }
  },
  "blogPost": {
    "backToBlog": "← Back to blog",
    "minRead": "min read",
    "relatedPosts": "Related Posts"
  },
  "brag": {
    "title": "Work Log",
    "subtitle": "A running log of my daily accomplishments, learnings, and project highlights — inspired by Julia Evans' brag documents.",
    "noEntries": "No entries yet. Check back soon!",
    "stats": {
      "totalEntries": "Total Entries",
      "thisMonth": "This Month",
      "weekStreak": "Week Streak",
      "categories": "Categories"
    }
  }
```

**Step 2: Create `src/app/models/IBlogDictionary.ts`**

```typescript
export interface IBlogHeaderDict {
  title: string;
  subtitle: string;
}

export interface IBlogFiltersDict {
  searchPlaceholder: string;
  categoriesLabel: string;
  categoriesPlaceholder: string;
  tagsLabel: string;
  tagsPlaceholder: string;
  clearAll: string;
  noResults: string;
  noPostsFound: string;
}

export interface IBlogPaginationDict {
  previous: string;
  next: string;
  page: string;
  of: string;
}

export interface IBlogErrorDict {
  title: string;
  description: string;
  retry: string;
}

export interface IBlogDictionary {
  header: IBlogHeaderDict;
  filters: IBlogFiltersDict;
  pagination: IBlogPaginationDict;
  error: IBlogErrorDict;
}

export interface IBlogPostDictionary {
  backToBlog: string;
  minRead: string;
  relatedPosts: string;
}
```

**Step 3: Create `src/app/models/IBragDictionary.ts`**

```typescript
export interface IBragStatsDictionary {
  totalEntries: string;
  thisMonth: string;
  weekStreak: string;
  categories: string;
}

export interface IBragDictionary {
  title: string;
  subtitle: string;
  noEntries: string;
  stats: IBragStatsDictionary;
}
```

**Step 4: Update `src/app/models/IDictionary.ts`**

Add imports and two new fields:

```typescript
import type { IHeroSection } from "./Hero";
import type { IAboutSection } from "./About";
import type { IExperienceSection } from "./Experience";
import type { IProjectsSection } from "./Projects";
import type { ISkillsSection } from "./Skills";
import type { IContactSection } from "./Contact";
import type { ILayout } from "./Layout";
import type { IBlogDictionary, IBlogPostDictionary } from "./IBlogDictionary";
import type { IBragDictionary } from "./IBragDictionary";

export interface IDictionary {
  layout: ILayout;
  hero: IHeroSection;
  about: IAboutSection;
  experience: IExperienceSection;
  projects: IProjectsSection;
  skills: ISkillsSection;
  contact: IContactSection;
  blog: IBlogDictionary;
  blogPost: IBlogPostDictionary;
  brag: IBragDictionary;
}
```

**Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors about `blog`, `blogPost`, or `brag` being unknown on `IDictionary`.

**Step 6: Commit**

```bash
git add src/dictionaries/en.json src/app/models/IBlogDictionary.ts src/app/models/IBragDictionary.ts src/app/models/IDictionary.ts
git commit -m "feat: add blog/blogPost/brag sections to en.json and dictionary types"
```

---

### Task 2: BlogHeader — receive title and subtitle as props

**Files:**
- Modify: `src/app/(public)/blog/components/BlogHeader.tsx`
- Modify: `src/app/(public)/blog/layout.tsx`

**Step 1: Update BlogHeader to accept props**

Replace the entire file content:

```tsx
import GradientBlob from "@/app/components/ui/GradientBlob";

interface BlogHeaderProps {
  title: string;
  subtitle: string;
}

const BlogHeader = ({ title, subtitle }: BlogHeaderProps) => {
  return (
    <section className="flex flex-col gap-[2.67vw] tablet:gap-[1.75vw] desktop:gap-[1.04vw] pb-[16.02vw] pt-[32.04vw] tablet:pt-[21.25vw] tablet:pb-[12.5vw] desktop:pt-[10.4vw] desktop:pb-[7.8vw] justify-center items-center relative overflow-x-clip">
      <GradientBlob
        color="cyan"
        className="-top-[20vw] -right-[20vw] tablet:-top-[10vw] tablet:-right-[10vw] desktop:-top-[5.208vw] desktop:-right-[5.208vw] animate-wave-glow"
      />
      <GradientBlob
        color="purple"
        className="-bottom-[20vw] -left-[20vw] tablet:-bottom-[10vw] tablet:-left-[10vw] desktop:-bottom-[5.208vw] desktop:-left-[5.208vw] animate-wave-glow"
      />
      <h1 className="text-heading font-semibold text-[7.476vw] tablet:text-[4.5vw] desktop:text-[2.912vw]">
        {title}
      </h1>
      <p className="text-muted text-[4.272vw] tablet:text-[2vw] desktop:text-[1.04vw] text-center">
        {subtitle}
      </p>
    </section>
  );
};

export default BlogHeader;
```

**Step 2: Update blog/layout.tsx to load dictionary and pass props**

Replace the entire file content:

```tsx
import { ReactNode } from "react";
import BlogHeader from "./components/BlogHeader";
import GridBackground from "@/app/components/ui/GridBackground";
import { getDictionary } from "@/get-dictionary";

export default async function BlogLayout({ children }: { children: ReactNode }) {
  const dict = await getDictionary();

  return (
    <div className="relative">
      <GridBackground />
      <BlogHeader title={dict.blog.header.title} subtitle={dict.blog.header.subtitle} />
      {children}
    </div>
  );
}
```

**Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 4: Commit**

```bash
git add src/app/(public)/blog/components/BlogHeader.tsx src/app/(public)/blog/layout.tsx
git commit -m "feat: source BlogHeader title/subtitle from en.json"
```

---

### Task 3: Blog listing page + filters label chain

This task covers the prop chain:
`blog/page.tsx` → `BlogFilters` → `SelectedChips`, `MultiSelectDropdown` → `DropdownPanel`

**Files:**
- Modify: `src/app/(public)/blog/page.tsx`
- Modify: `src/app/(public)/blog/components/BlogFilters.tsx`
- Modify: `src/app/(public)/blog/components/blog-filters/SelectedChips.tsx`
- Modify: `src/app/(public)/blog/components/multi-select/types.ts`
- Modify: `src/app/(public)/blog/components/MultiSelectDropdown.tsx`
- Modify: `src/app/(public)/blog/components/multi-select/DropdownPanel.tsx`

**Step 1: Add `IBlogFiltersLabels` type + update BlogFilters props**

In `src/app/(public)/blog/components/BlogFilters.tsx`, add a `labels` prop. The component is already `"use client"` so it can't call `getDictionary()` itself — it must receive labels from its server parent.

Replace the file:

```tsx
"use client";

import MultiSelectDropdown from "./MultiSelectDropdown";
import { useBlogFilters } from "./blog-filters/useBlogFilters";
import { LoadingBar } from "./blog-filters/LoadingBar";
import { SelectedChips } from "./blog-filters/SelectedChips";
import type { BlogFiltersProps } from "./blog-filters/types";
import type { IBlogFiltersDict } from "@/app/models/IBlogDictionary";

export type { FilterOption, BlogFiltersProps } from "./blog-filters/types";

interface Props extends BlogFiltersProps {
  labels: IBlogFiltersDict;
}

export default function BlogFilters({ categories, tags, labels }: Props) {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    selectedTags,
    isPending,
    categoryOptions,
    tagOptions,
    selectedCategoryOptions,
    selectedTagOptions,
    totalSelected,
    handleCategoryChange,
    handleTagChange,
    handleRemoveCategory,
    handleRemoveTag,
    handleClearAll,
  } = useBlogFilters(categories, tags);

  return (
    <div className="flex flex-col gap-[2.5vw] tablet:gap-[1.25vw] desktop:gap-[0.521vw] ">
      {/* Filter row */}
      <div className="flex flex-col tablet:flex-row  gap-[2.5vw] tablet:gap-[1.25vw] desktop:gap-[0.521vw]">
        {/* Search input */}
        <input
          type="text"
          placeholder={labels.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[3vw] tablet:py-[1.5vw] desktop:py-[0.625vw] rounded-lg bg-background/50 border border-border-subtle text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.75vw] tablet:max-w-[37.5vw] desktop:max-w-[15.6vw]"
        />

        {/* Category dropdown */}
        {categories.length > 0 && (
          <MultiSelectDropdown
            label={labels.categoriesLabel}
            options={categoryOptions}
            selected={selectedCategories}
            onChange={handleCategoryChange}
            accentColor="cyan"
            placeholder={labels.categoriesPlaceholder}
            clearAllLabel={labels.clearAll}
            noResultsLabel={labels.noResults}
          />
        )}

        {/* Tag dropdown */}
        {tags.length > 0 && (
          <MultiSelectDropdown
            label={labels.tagsLabel}
            options={tagOptions}
            selected={selectedTags}
            onChange={handleTagChange}
            accentColor="purple"
            placeholder={labels.tagsPlaceholder}
            labelPrefix="#"
            clearAllLabel={labels.clearAll}
            noResultsLabel={labels.noResults}
          />
        )}
      </div>

      <LoadingBar isPending={isPending} />

      <SelectedChips
        selectedCategoryOptions={selectedCategoryOptions}
        selectedTagOptions={selectedTagOptions}
        totalSelected={totalSelected}
        handleRemoveCategory={handleRemoveCategory}
        handleRemoveTag={handleRemoveTag}
        handleClearAll={handleClearAll}
        clearAllLabel={labels.clearAll}
      />
    </div>
  );
}
```

**Step 2: Add `clearAllLabel` to SelectedChips**

Replace `src/app/(public)/blog/components/blog-filters/SelectedChips.tsx`:

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { cn } from "@/app/utils/cn";
import type { Option } from "../MultiSelectDropdown";

const CHIP_VARIANTS = {
  category: {
    color: "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/50 hover:bg-accent-cyan/30",
    prefix: "",
  },
  tag: {
    color: "bg-accent-purple/20 text-accent-purple border-accent-purple/50 hover:bg-accent-purple/30",
    prefix: "#",
  },
} as const;

function Chip({
  option,
  variant,
  onRemove,
}: {
  option: Option;
  variant: keyof typeof CHIP_VARIANTS;
  onRemove: (id: string) => void;
}) {
  const { color, prefix } = CHIP_VARIANTS[variant];
  return (
    <motion.button
      key={`${variant}-${option.id}`}
      type="button"
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
      onClick={() => onRemove(option.id)}
      className={cn(
        "inline-flex items-center gap-[1vw] tablet:gap-[0.5vw] desktop:gap-[0.208vw]",
        "px-[2vw] tablet:px-[1vw] desktop:px-[0.417vw] py-[1vw] tablet:py-[0.5vw] desktop:py-[0.208vw]",
        "rounded-md border text-[3vw] tablet:text-[1.4vw] desktop:text-[0.583vw]",
        color,
        "transition-colors cursor-pointer",
      )}
    >
      {prefix}{option.label}
      <FiX className="w-[2.5vw] h-[2.5vw] tablet:w-[1.2vw] tablet:h-[1.2vw] desktop:w-[0.5vw] desktop:h-[0.5vw]" />
    </motion.button>
  );
}

interface SelectedChipsProps {
  selectedCategoryOptions: Option[];
  selectedTagOptions: Option[];
  totalSelected: number;
  handleRemoveCategory: (id: string) => void;
  handleRemoveTag: (id: string) => void;
  handleClearAll: () => void;
  clearAllLabel: string;
}

export function SelectedChips({
  selectedCategoryOptions,
  selectedTagOptions,
  totalSelected,
  handleRemoveCategory,
  handleRemoveTag,
  handleClearAll,
  clearAllLabel,
}: SelectedChipsProps) {
  return (
    <AnimatePresence>
      {totalSelected > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-wrap items-center gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw] overflow-hidden"
        >
          <AnimatePresence mode="popLayout">
            {selectedCategoryOptions.map((opt) => (
              <Chip key={`cat-${opt.id}`} option={opt} variant="category" onRemove={handleRemoveCategory} />
            ))}
            {selectedTagOptions.map((opt) => (
              <Chip key={`tag-${opt.id}`} option={opt} variant="tag" onRemove={handleRemoveTag} />
            ))}
            {totalSelected > 1 && (
              <motion.button
                key="clear-all"
                type="button"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={handleClearAll}
                className="text-[3vw] tablet:text-[1.4vw] desktop:text-[0.583vw] text-text-muted hover:text-foreground transition-colors cursor-pointer ml-[1vw] tablet:ml-[0.5vw] desktop:ml-[0.208vw]"
              >
                {clearAllLabel}
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Step 3: Add `clearAllLabel` and `noResultsLabel` to MultiSelectDropdownProps**

In `src/app/(public)/blog/components/multi-select/types.ts`, add two optional props to the interface:

```typescript
export interface MultiSelectDropdownProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  accentColor: "cyan" | "purple";
  placeholder?: string;
  labelPrefix?: string;
  clearAllLabel?: string;
  noResultsLabel?: string;
}
```

**Step 4: Thread labels through MultiSelectDropdown**

In `src/app/(public)/blog/components/MultiSelectDropdown.tsx`, destructure and pass the two new props:

```tsx
"use client";

import { accentClasses } from "./multi-select/types";
import { useDropdown } from "./multi-select/useDropdown";
import { DropdownTrigger } from "./multi-select/DropdownTrigger";
import { DropdownPanel } from "./multi-select/DropdownPanel";
import type { MultiSelectDropdownProps } from "./multi-select/types";

export type { Option } from "./multi-select/types";

export default function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  accentColor,
  placeholder,
  labelPrefix = "",
  clearAllLabel = "Clear all",
  noResultsLabel = "No results found",
}: MultiSelectDropdownProps) {
  const {
    isOpen,
    search,
    setSearch,
    containerRef,
    searchInputRef,
    filteredOptions,
    selectedOptions,
    toggleOpen,
    handleToggle,
    handleClearAll,
  } = useDropdown({ options, selected, onChange });

  const colors = accentClasses[accentColor];

  return (
    <div ref={containerRef} className="relative">
      <DropdownTrigger
        label={label}
        placeholder={placeholder}
        labelPrefix={labelPrefix}
        isOpen={isOpen}
        selected={selected}
        selectedOptions={selectedOptions}
        colors={colors}
        onToggle={toggleOpen}
      />

      <DropdownPanel
        label={label}
        labelPrefix={labelPrefix}
        isOpen={isOpen}
        search={search}
        onSearchChange={setSearch}
        searchInputRef={searchInputRef}
        filteredOptions={filteredOptions}
        selected={selected}
        colors={colors}
        onToggle={handleToggle}
        onClearAll={handleClearAll}
        clearAllLabel={clearAllLabel}
        noResultsLabel={noResultsLabel}
      />
    </div>
  );
}
```

**Step 5: Update DropdownPanel to use the new label props**

In `src/app/(public)/blog/components/multi-select/DropdownPanel.tsx`, add `clearAllLabel` and `noResultsLabel` to the props interface and use them:

```tsx
"use client";

import { RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiSearch } from "react-icons/fi";
import { cn } from "@/app/utils/cn";
import type { Option, AccentColors } from "./types";

interface DropdownPanelProps {
  label: string;
  labelPrefix: string;
  isOpen: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  filteredOptions: Option[];
  selected: string[];
  colors: AccentColors;
  onToggle: (id: string) => void;
  onClearAll: () => void;
  clearAllLabel: string;
  noResultsLabel: string;
}

export function DropdownPanel({
  label,
  labelPrefix,
  isOpen,
  search,
  onSearchChange,
  searchInputRef,
  filteredOptions,
  selected,
  colors,
  onToggle,
  onClearAll,
  clearAllLabel,
  noResultsLabel,
}: DropdownPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "absolute z-50 mt-[1vw] tablet:mt-[0.5vw] desktop:mt-[0.208vw]",
            "w-full min-w-[60vw] tablet:min-w-[25vw] desktop:min-w-[13vw]",
            "rounded-lg border border-border-subtle bg-[#12121A] shadow-xl",
            "overflow-hidden",
          )}
        >
          {/* Search input */}
          <div className="p-[2vw] tablet:p-[1vw] desktop:p-[0.417vw] border-b border-border-subtle">
            <div className="relative">
              <FiSearch className="absolute left-[2vw] tablet:left-[1vw] desktop:left-[0.417vw] top-1/2 -translate-y-1/2 w-[3vw] h-[3vw] tablet:w-[1.5vw] tablet:h-[1.5vw] desktop:w-[0.625vw] desktop:h-[0.625vw] text-text-muted" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={`Search ${label.toLowerCase()}...`}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className={cn(
                  "w-full bg-background/50 border border-border-subtle rounded",
                  "pl-[7vw] tablet:pl-[3.5vw] desktop:pl-[1.458vw] pr-[2vw] tablet:pr-[1vw] desktop:pr-[0.417vw]",
                  "py-[1.5vw] tablet:py-[0.75vw] desktop:py-[0.313vw]",
                  "text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]",
                  "text-foreground placeholder:text-text-muted",
                  "focus:outline-none",
                  colors.focusRing,
                )}
              />
            </div>
          </div>

          {/* Options list */}
          <div role="listbox" aria-multiselectable="true" aria-label={label} className="max-h-[50vw] tablet:max-h-[25vw] desktop:max-h-[13vw] overflow-y-auto no-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="p-[3vw] tablet:p-[1.5vw] desktop:p-[0.625vw] text-center text-text-muted text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
                {noResultsLabel}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selected.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => onToggle(opt.id)}
                    className={cn(
                      "w-full flex items-center gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw]",
                      "px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[2vw] tablet:py-[1vw] desktop:py-[0.417vw]",
                      "text-left transition-colors cursor-pointer",
                      colors.hoverBg,
                    )}
                  >
                    {/* Checkbox */}
                    <span
                      className={cn(
                        "flex items-center justify-center shrink-0",
                        "w-[4vw] h-[4vw] tablet:w-[2vw] tablet:h-[2vw] desktop:w-[0.833vw] desktop:h-[0.833vw]",
                        "rounded border transition-colors",
                        isSelected ? colors.checkbox : colors.checkboxEmpty,
                      )}
                    >
                      {isSelected && (
                        <FiCheck className="w-[2.5vw] h-[2.5vw] tablet:w-[1.2vw] tablet:h-[1.2vw] desktop:w-[0.5vw] desktop:h-[0.5vw]" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "flex-1 text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]",
                        isSelected ? "text-foreground" : "text-text-muted",
                      )}
                    >
                      {labelPrefix}
                      {opt.label}
                    </span>
                    <span className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]">
                      {opt.count}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Clear all footer */}
          {selected.length > 0 && (
            <div className="border-t border-border-subtle p-[2vw] tablet:p-[1vw] desktop:p-[0.417vw]">
              <button
                type="button"
                onClick={onClearAll}
                className={cn(
                  "w-full text-center py-[1.5vw] tablet:py-[0.75vw] desktop:py-[0.313vw]",
                  "text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]",
                  "transition-colors cursor-pointer",
                  colors.clearText,
                )}
              >
                {clearAllLabel}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Step 6: Update blog/page.tsx to load dictionary and pass labels to BlogFilters**

Open `src/app/(public)/blog/page.tsx`. Add `getDictionary` import and pass `labels` to `BlogFilters`. Also replace the three pagination strings and the empty-state string.

The key changes (show full final file):

```tsx
export const revalidate = 3600;

import Link from "next/link";
import { db } from "@/app/lib/db";
import BlogCard from "./components/BlogCard";
import BlogFilters from "./components/BlogFilters";
import { Suspense } from "react";
import { buildPostFilter } from "@/app/lib/build-post-filter";
import { POSTS_PER_PAGE } from "@/app/lib/constants";
import {
  POST_INCLUDE_FULL,
  HAS_PUBLISHED_POSTS,
  ENTITY_WITH_PUBLISHED_COUNT,
} from "@/app/api/blog/helpers/prisma-includes";
import { buildQueryString } from "./build-query-string";
import { getDictionary } from "@/get-dictionary";

interface SearchParams {
  page?: string;
  category?: string;
  tag?: string;
  search?: string;
}

export const metadata = {
  title: "Blog",
  description: "Read my latest articles and insights",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [params, dict] = await Promise.all([
    searchParams,
    getDictionary(),
  ]);

  let page = parseInt(params.page || "1", 10);
  if (isNaN(page) || page < 1) page = 1;
  const limit = POSTS_PER_PAGE;
  const skip = (page - 1) * limit;

  const where = buildPostFilter(params);

  const [posts, total, categories, tags] = await Promise.all([
    db.post.findMany({
      where,
      include: POST_INCLUDE_FULL,
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
    }),
    db.post.count({ where }),
    db.category.findMany({
      where: HAS_PUBLISHED_POSTS,
      include: ENTITY_WITH_PUBLISHED_COUNT,
      orderBy: { name: "asc" },
    }),
    db.tag.findMany({
      where: HAS_PUBLISHED_POSTS,
      include: ENTITY_WITH_PUBLISHED_COUNT,
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const { filters: f, pagination: p } = dict.blog;

  return (
    <section className="space-y-[8vw] tablet:space-y-[4vw] desktop:space-y-[1.667vw] pb-[10.68vw] tablet:pb-[10vw] desktop:pb-[6.24vw]">
      <Suspense fallback={null}>
        <BlogFilters
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            postCount: c._count.posts,
          }))}
          tags={tags.map((t) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            postCount: t._count.posts,
          }))}
          labels={f}
        />
      </Suspense>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-[5.333vw] tablet:gap-[2.5vw] desktop:gap-[1.042vw]">
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              id={post.id}
              slug={post.slug}
              title={post.title}
              description={post.description}
              coverImage={post.coverImage || undefined}
              categories={post.categories}
              publishedAt={post.publishedAt || undefined}
              searchQuery={params.search}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-[13.333vw] tablet:py-[6.667vw] desktop:py-[2.778vw]">
          <p className="text-text-muted text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.75vw]">
            {f.noPostsFound}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw] py-[8vw] tablet:py-[4vw] desktop:py-[1.667vw]">
          {page > 1 && (
            <Link
              href={buildQueryString(params, { page: String(page - 1) })}
              className="px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] border border-border-subtle rounded hover:border-accent-cyan/50 hover:bg-background/50 transition-colors text-[2.667vw] tablet:text-[1.3vw] desktop:text-[0.542vw]"
            >
              {p.previous}
            </Link>
          )}

          <span className="text-text-muted text-[2.667vw] tablet:text-[1.3vw] desktop:text-[0.542vw]">
            {p.page} {page} {p.of} {totalPages}
          </span>

          {page < totalPages && (
            <Link
              href={buildQueryString(params, { page: String(page + 1) })}
              className="px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] border border-border-subtle rounded hover:border-accent-cyan/50 hover:bg-background/50 transition-colors text-[2.667vw] tablet:text-[1.3vw] desktop:text-[0.542vw]"
            >
              {p.next}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
```

**Step 7: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 8: Commit**

```bash
git add src/app/(public)/blog/page.tsx src/app/(public)/blog/components/BlogFilters.tsx src/app/(public)/blog/components/blog-filters/SelectedChips.tsx src/app/(public)/blog/components/multi-select/types.ts src/app/(public)/blog/components/MultiSelectDropdown.tsx src/app/(public)/blog/components/multi-select/DropdownPanel.tsx
git commit -m "feat: source blog listing strings from en.json via prop drilling"
```

---

### Task 4: blog/error.tsx — documented exception

**Context:** Next.js error boundaries have a fixed component signature `{ error: Error, reset: () => void }`. There is no server parent that can inject props. The project-wide pattern uses `getDictionary()` (async, server-only), so client components cannot call it. The only clean option here is a static JSON import, which is an **intentional exception documented in the file**.

**Files:**
- Modify: `src/app/(public)/blog/error.tsx`

**Step 1: Replace error.tsx to import en.json directly**

```tsx
"use client";

// NOTE: This component uses a direct JSON import instead of getDictionary() because
// Next.js error boundaries have a fixed signature and cannot receive props from a
// server parent. This is an intentional exception to the prop-drilling pattern.
import en from "@/dictionaries/en.json";

export default function BlogError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { title, description, retry } = en.blog.error;

  return (
    <div className="flex flex-col items-center justify-center py-[13.333vw] tablet:py-[6.667vw] desktop:py-[2.778vw]">
      <h2 className="text-text-heading text-[6.4vw] tablet:text-[3vw] desktop:text-[1.25vw] font-bold mb-[4vw] tablet:mb-[2vw] desktop:mb-[0.833vw]">
        {title}
      </h2>
      <p className="text-text-muted text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.75vw] mb-[5.333vw] tablet:mb-[2.5vw] desktop:mb-[1.042vw]">
        {description}
      </p>
      <button
        onClick={reset}
        className="btn-gradient px-[5.333vw] tablet:px-[2.5vw] desktop:px-[1.042vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg text-white font-medium text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]"
      >
        {retry}
      </button>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add src/app/(public)/blog/error.tsx
git commit -m "feat: source blog error boundary strings from en.json (direct import exception)"
```

---

### Task 5: Blog post detail page + RelatedPosts

**Files:**
- Modify: `src/app/(public)/blog/[slug]/page.tsx`
- Modify: `src/app/(public)/blog/[slug]/RelatedPosts.tsx`

**Step 1: Update RelatedPosts to accept a title prop**

Replace `src/app/(public)/blog/[slug]/RelatedPosts.tsx`:

```tsx
import BlogCard from "@/app/(public)/blog/components/BlogCard";
import { IBlogPost } from "@/app/models/Blog";

interface RelatedPostsProps {
  posts: IBlogPost[];
  title: string;
}

export default function RelatedPosts({ posts, title }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="p-0 tablet:p-0 desktop:p-0">
      <h2 className="gradient-text text-[5.333vw] tablet:text-[2.667vw] desktop:text-[1.111vw] font-bold mb-[4vw] tablet:mb-[2vw] desktop:mb-[0.833vw]">
        {title}
      </h2>

      <div className="flex flex-col gap-[5.333vw] tablet:gap-[2.667vw] desktop:gap-[1.111vw]">
        {posts.map((post) => (
          <BlogCard
            key={post.id}
            id={post.id}
            slug={post.slug}
            title={post.title}
            description={post.description}
          />
        ))}
      </div>
    </section>
  );
}
```

**Step 2: Update [slug]/page.tsx to load dictionary and use backToBlog, minRead, relatedPosts**

In `src/app/(public)/blog/[slug]/page.tsx`, add `getDictionary` import, call it, and replace the three hardcoded strings:

```tsx
export const revalidate = 86400;

import { cache } from "react";
import sanitizeHtml from "sanitize-html";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/app/lib/db";
import { POST_INCLUDE_FULL } from "@/app/api/blog/helpers/prisma-includes";
import { sanitizeOptions } from "./sanitize-config";
import { calculateReadingTime } from "./reading-time";
import { getRelatedPosts } from "./related-posts";
import RelatedPosts from "./RelatedPosts";
import { getDictionary } from "@/get-dictionary";

export async function generateStaticParams() {
  try {
    const posts = await db.post.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

const getPost = cache(async (slug: string) => {
  return db.post.findUnique({
    where: { slug },
    include: POST_INCLUDE_FULL,
  });
});

interface Params {
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags?.map((t) => t.name).join(", ") || "",
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const [{ slug }, dict] = await Promise.all([params, getDictionary()]);
  const { backToBlog, minRead, relatedPosts } = dict.blogPost;

  const post = await getPost(slug);

  if (!post || !post.published) {
    notFound();
  }

  const related = await getRelatedPosts(post, 3);

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const readingTime = calculateReadingTime(post.content);

  return (
    <div className="mx-auto desktop:mx-0 desktop:px-[6.24vw] max-w-[90vw] tablet:max-w-[70vw]  py-[10.667vw] tablet:py-[5.333vw] desktop:py-[2.222vw] desktop:flex desktop:gap-[3.333vw] desktop:items-start desktop:justify-between desktop:max-w-full">
      {/* Main Article */}
      <article className="desktop:flex-1 desktop:min-w-0">
        {/* Header */}
        <header className="mb-[8vw] tablet:mb-[4vw] desktop:mb-[1.667vw]">
          <h1 className="text-heading text-[8vw] tablet:text-[4vw] desktop:text-[1.667vw] font-bold mb-[4vw] tablet:mb-[2vw] desktop:mb-[0.833vw]">
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-[4vw] tablet:gap-[2vw] desktop:gap-[0.833vw] text-muted text-[2.933vw] tablet:text-[1.4vw] desktop:text-[0.583vw] mb-[6.667vw] tablet:mb-[3.333vw] desktop:mb-[1.389vw]">
            {formattedDate && <span>{formattedDate}</span>}
            {post.author && <span>{post.author.name}</span>}
            <span>{readingTime} {minRead}</span>
          </div>

          {post.coverImage && (
            <div className="relative mb-[6.667vw] tablet:mb-[3.333vw] desktop:mb-[1.389vw] rounded-lg overflow-hidden bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 h-[40vw] tablet:h-[25vw] desktop:h-[10vw]">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 480px) 90vw, (max-width: 1024px) 80vw, 50vw"
              />
            </div>
          )}

          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw] mb-[6.667vw] tablet:mb-[3.333vw] desktop:mb-[1.389vw]">
              {post.categories.map((category) => (
                <span
                  key={category.id}
                  className="inline-block px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[1.5vw] tablet:py-[0.75vw] desktop:py-[0.313vw] bg-accent-cyan/10 text-accent-cyan rounded text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-[8vw] tablet:mb-[4vw] desktop:mb-[1.667vw]">
          <div
            className="text-foreground text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.75vw] leading-relaxed space-y-[4vw] tablet:space-y-[2vw] desktop:space-y-[0.833vw]"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(post.content, sanitizeOptions),
            }}
          />
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw] pt-[6.667vw] tablet:pt-[3.333vw] desktop:pt-[1.389vw] border-t border-subtle">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog?tag=${tag.id}`}
                className="inline-block px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[1.5vw] tablet:py-[0.75vw] desktop:py-[0.313vw] bg-accent-purple/10 text-accent-purple rounded hover:bg-accent-purple/20 transition-colors text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </article>

      {/* Sidebar */}
      <aside className="mt-[10.667vw] tablet:mt-[8vw] desktop:mt-[2.08vw] bg-red-900 desktop:w-[27vw] desktop:flex-shrink-0 desktop:sticky desktop:top-[3.2vw]">
        <Link
          href="/blog"
          className="block mb-[6.667vw] tablet:mb-[4vw] desktop:mb-[1.667vw] text-accent-cyan hover:text-accent-cyan/80 transition-colors text-[2.933vw] tablet:text-[1.4vw] desktop:text-[0.583vw]"
        >
          {backToBlog}
        </Link>

        <RelatedPosts posts={related} title={relatedPosts} />
      </aside>
    </div>
  );
}
```

**Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 4: Commit**

```bash
git add src/app/(public)/blog/[slug]/page.tsx src/app/(public)/blog/[slug]/RelatedPosts.tsx
git commit -m "feat: source blog post page strings from en.json"
```

---

### Task 6: Brag section

**Files:**
- Modify: `src/app/(public)/brag/page.tsx`
- Modify: `src/app/(public)/brag/components/BragDashboard.tsx`
- Modify: `src/app/(public)/brag/components/BragStatsRow.tsx`

**Step 1: Update BragStatsRow to accept a labels prop**

`BragStatsRow` currently has a hardcoded `const stats = [...]` with labels as strings. Change it to receive labels as a prop.

Replace the file:

```tsx
"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, defaultViewport } from "@/app/lib/animations";
import type { IBragStatsDictionary } from "@/app/models/IBragDictionary";

interface BragStatsRowProps {
  totalEntries: number;
  entriesThisMonth: number;
  currentStreak: number;
  categoriesActive: number;
  labels: IBragStatsDictionary;
}

const STAT_KEYS = [
  { key: "totalEntries" as const, labelKey: "totalEntries" as const, color: "text-accent-cyan" },
  { key: "entriesThisMonth" as const, labelKey: "thisMonth" as const, color: "text-accent-purple" },
  { key: "currentStreak" as const, labelKey: "weekStreak" as const, color: "text-accent-emerald" },
  { key: "categoriesActive" as const, labelKey: "categories" as const, color: "text-accent-cyan" },
];

export default function BragStatsRow(props: BragStatsRowProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      className="grid grid-cols-2 desktop:grid-cols-4 gap-[4vw] tablet:gap-[2vw] desktop:gap-[0.833vw]"
    >
      {STAT_KEYS.map((stat) => (
        <motion.div
          key={stat.key}
          variants={fadeUp}
          className="bg-bg-secondary border border-border-subtle rounded-lg p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw] text-center"
        >
          <p className={`${stat.color} text-[8.533vw] tablet:text-[4vw] desktop:text-[1.667vw] font-bold`}>
            {props[stat.key]}
          </p>
          <p className="text-text-muted text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
            {props.labels[stat.labelKey]}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
```

**Step 2: Update BragDashboard to accept and pass labels**

Replace `src/app/(public)/brag/components/BragDashboard.tsx`:

```tsx
"use client";

import type { IBragStats } from "@/app/models/Brag";
import type { IBragStatsDictionary } from "@/app/models/IBragDictionary";
import BragStatsRow from "./BragStatsRow";
import ActivityHeatmap from "./ActivityHeatmap";
import CategoryChart from "./CategoryChart";
import MonthlyTrendChart from "./MonthlyTrendChart";
import PinnedHighlights from "./PinnedHighlights";
import BragTimeline from "./BragTimeline";
import BragExportButton from "./BragExportButton";

interface BragDashboardProps {
  stats: IBragStats;
  statsLabels: IBragStatsDictionary;
}

export default function BragDashboard({ stats, statsLabels }: BragDashboardProps) {
  return (
    <div className="space-y-[8vw] tablet:space-y-[4vw] desktop:space-y-[1.667vw]">
      {/* Export row */}
      <div className="flex justify-end">
        <BragExportButton />
      </div>

      {/* Stats Row */}
      <BragStatsRow
        totalEntries={stats.totalEntries}
        entriesThisMonth={stats.entriesThisMonth}
        currentStreak={stats.currentStreak}
        categoriesActive={stats.categoriesActive}
        labels={statsLabels}
      />

      {/* Heatmap */}
      <ActivityHeatmap data={stats.heatmapData} />

      {/* Charts row */}
      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-[4vw] tablet:gap-[2vw] desktop:gap-[0.833vw]">
        <CategoryChart data={stats.categoryDistribution} />
        <MonthlyTrendChart data={stats.monthlyTrend} />
      </div>

      {/* Pinned Highlights */}
      <PinnedHighlights entries={stats.pinnedEntries} />

      {/* Timeline */}
      <BragTimeline categories={stats.categoryDistribution} />
    </div>
  );
}
```

**Step 3: Update brag/page.tsx to load dictionary**

Replace `src/app/(public)/brag/page.tsx` (only the JSX section changes — add `getDictionary` import and use dict strings):

```tsx
export const revalidate = 3600;

import type { Metadata } from "next";
import { db } from "@/app/lib/db";
import BragDashboard from "./components/BragDashboard";
import type { IBragStats } from "@/app/models/Brag";
import { getDictionary } from "@/get-dictionary";

export const metadata: Metadata = {
  title: "Work Log",
  description: "A running log of my daily accomplishments, learnings, and highlights.",
};

async function getBragStats(): Promise<IBragStats> {
  // ... (unchanged - keep all the existing logic here)
}

export default async function BragPage() {
  const [stats, dict] = await Promise.all([getBragStats(), getDictionary()]);
  const { title, subtitle, noEntries, stats: statsLabels } = dict.brag;

  return (
    <div>
      {/* Hero */}
      <div className="mb-[8vw] tablet:mb-[4vw] desktop:mb-[2vw] text-center space-y-[2.667vw] tablet:space-y-[1.333vw] desktop:space-y-[0.556vw]">
        <h1 className="text-[8vw] tablet:text-[4vw] desktop:text-[1.667vw] font-bold text-text-heading">
          <span className="gradient-text">{title}</span>
        </h1>
        <p className="text-text-muted text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.75vw] max-w-[80vw] tablet:max-w-[50vw] desktop:max-w-[31.25vw] mx-auto">
          {subtitle}
        </p>
      </div>

      {/* Dashboard */}
      {stats.totalEntries > 0 ? (
        <BragDashboard stats={stats} statsLabels={statsLabels} />
      ) : (
        <div className="text-center py-[13.333vw] tablet:py-[6.667vw] desktop:py-[2.778vw]">
          <p className="text-text-muted text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.75vw]">
            {noEntries}
          </p>
        </div>
      )}
    </div>
  );
}
```

> **Important:** Keep the entire `getBragStats()` function body unchanged. Only add `getDictionary` import and update the `BragPage` component.

**Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 5: Commit**

```bash
git add src/app/(public)/brag/page.tsx src/app/(public)/brag/components/BragDashboard.tsx src/app/(public)/brag/components/BragStatsRow.tsx
git commit -m "feat: source brag section strings from en.json"
```

---

## Final Verification

After all 6 tasks complete:

1. `npm run dev` — start the dev server
2. Visit `/blog` — confirm header text, filters, pagination, empty state all render correctly
3. Visit `/blog/[any-slug]` — confirm "← Back to blog", "X min read", "Related Posts" render
4. Visit `/brag` — confirm "Work Log" title, subtitle, stat labels render
5. Search in blog filters, select categories/tags — confirm "Clear all", "No results found" render from en.json
6. `npx tsc --noEmit` — zero TypeScript errors
