"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useTransition,
} from "react";
import type { Option } from "../MultiSelectDropdown";
import type { FilterOption } from "./types";

export function useBlogFilters(categories: FilterOption[], tags: FilterOption[]) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );

  const categoryParam = searchParams.get("category") || "";
  const tagParam = searchParams.get("tag") || "";
  const urlCategories = useMemo(
    () => categoryParam.split(",").filter(Boolean),
    [categoryParam],
  );
  const urlTags = useMemo(
    () => tagParam.split(",").filter(Boolean),
    [tagParam],
  );

  // Optimistic local state — updates instantly on click, syncs back from URL on navigation
  const [selectedCategories, setSelectedCategories] = useState(urlCategories);
  const [selectedTags, setSelectedTags] = useState(urlTags);

  useEffect(() => {
    setSelectedCategories(urlCategories);
  }, [urlCategories]);

  useEffect(() => {
    setSelectedTags(urlTags);
  }, [urlTags]);

  // Use refs to avoid dependency loops in the debounced search effect
  const searchParamsRef = useRef(searchParams);

  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const pushParams = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      for (const [key, value] of Object.entries(overrides)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      params.set("page", "1");
      startTransition(() => {
        router.push(`/blog?${params.toString()}`);
      });
    },
    [router, startTransition],
  );

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      const current = searchParamsRef.current.get("search") || "";
      if (searchQuery !== current) {
        pushParams({ search: searchQuery || null });
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, pushParams]);

  const handleCategoryChange = useCallback(
    (ids: string[]) => {
      setSelectedCategories(ids);
      pushParams({ category: ids.length > 0 ? ids.join(",") : null });
    },
    [pushParams],
  );

  const handleTagChange = useCallback(
    (ids: string[]) => {
      setSelectedTags(ids);
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

  const selectedCategoryOptions: Option[] = categoryOptions.filter((c) =>
    selectedCategories.includes(c.id),
  );
  const selectedTagOptions: Option[] = tagOptions.filter((t) =>
    selectedTags.includes(t.id),
  );
  const totalSelected = selectedCategories.length + selectedTags.length;

  const handleRemoveCategory = useCallback(
    (id: string) => {
      handleCategoryChange(selectedCategories.filter((c) => c !== id));
    },
    [selectedCategories, handleCategoryChange],
  );

  const handleRemoveTag = useCallback(
    (id: string) => {
      handleTagChange(selectedTags.filter((t) => t !== id));
    },
    [selectedTags, handleTagChange],
  );

  const handleClearAll = useCallback(() => {
    setSelectedCategories([]);
    setSelectedTags([]);
    pushParams({ category: null, tag: null });
  }, [pushParams]);

  return {
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
  };
}
