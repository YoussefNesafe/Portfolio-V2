"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import MultiSelectDropdown from "./MultiSelectDropdown";

interface FilterOption {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

interface BlogFiltersProps {
  categories: FilterOption[];
  tags: FilterOption[];
}

export default function BlogFilters({ categories, tags }: BlogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );

  const selectedCategories = (searchParams.get("category") || "")
    .split(",")
    .filter(Boolean);
  const selectedTags = (searchParams.get("tag") || "")
    .split(",")
    .filter(Boolean);

  const pushParams = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(overrides)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      params.set("page", "1");
      router.push(`/blog?${params.toString()}`);
    },
    [searchParams, router],
  );

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      const current = searchParams.get("search") || "";
      if (searchQuery !== current) {
        pushParams({ search: searchQuery || null });
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, searchParams, pushParams]);

  const handleCategoryChange = useCallback(
    (ids: string[]) => {
      pushParams({ category: ids.length > 0 ? ids.join(",") : null });
    },
    [pushParams],
  );

  const handleTagChange = useCallback(
    (ids: string[]) => {
      pushParams({ tag: ids.length > 0 ? ids.join(",") : null });
    },
    [pushParams],
  );

  const categoryOptions = categories.map((c) => ({
    id: c.id,
    label: c.name,
    count: c.postCount,
  }));

  const tagOptions = tags.map((t) => ({
    id: t.id,
    label: t.name,
    count: t.postCount,
  }));

  return (
    <div className="flex flex-col tablet:flex-row gap-[2.5vw] tablet:gap-[1.25vw] desktop:gap-[0.521vw]">
      {/* Search input */}
      <input
        type="text"
        placeholder="Search posts..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[3vw] tablet:py-[1.5vw] desktop:py-[0.625vw] rounded-lg bg-background/50 border border-border-subtle text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.75vw]"
      />

      {/* Category dropdown */}
      {categories.length > 0 && (
        <MultiSelectDropdown
          label="Categories"
          options={categoryOptions}
          selected={selectedCategories}
          onChange={handleCategoryChange}
          accentColor="cyan"
          placeholder="All Categories"
        />
      )}

      {/* Tag dropdown */}
      {tags.length > 0 && (
        <MultiSelectDropdown
          label="Tags"
          options={tagOptions}
          selected={selectedTags}
          onChange={handleTagChange}
          accentColor="purple"
          placeholder="All Tags"
          labelPrefix="#"
        />
      )}
    </div>
  );
}
