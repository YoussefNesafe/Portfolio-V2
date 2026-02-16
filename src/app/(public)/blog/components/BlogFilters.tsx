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
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { cn } from "@/app/utils/cn";
import MultiSelectDropdown from "./MultiSelectDropdown";
import type { Option } from "./MultiSelectDropdown";

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

  return (
    <div className="flex flex-col gap-[2.5vw] tablet:gap-[1.25vw] desktop:gap-[0.521vw]">
      {/* Filter row */}
      <div className="flex flex-col tablet:flex-row gap-[2.5vw] tablet:gap-[1.25vw] desktop:gap-[0.521vw]">
        {/* Search input */}
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[3vw] tablet:py-[1.5vw] desktop:py-[0.625vw] rounded-lg bg-background/50 border border-border-subtle text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.75vw] tablet:max-w-[37.5vw] desktop:max-w-[15.6vw]"
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

      {/* Loading indicator */}
      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-[0.533vw] tablet:h-[0.25vw] desktop:h-[0.104vw] w-full rounded-full overflow-hidden bg-border-subtle/30"
          >
            <motion.div
              className="h-full w-1/3 rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple"
              animate={{ x: ["-100%", "400%"] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected chips row */}
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
                <motion.button
                  key={`cat-${opt.id}`}
                  type="button"
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => handleRemoveCategory(opt.id)}
                  className={cn(
                    "inline-flex items-center gap-[1vw] tablet:gap-[0.5vw] desktop:gap-[0.208vw]",
                    "px-[2vw] tablet:px-[1vw] desktop:px-[0.417vw] py-[1vw] tablet:py-[0.5vw] desktop:py-[0.208vw]",
                    "rounded-md border text-[3vw] tablet:text-[1.4vw] desktop:text-[0.583vw]",
                    "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/50",
                    "hover:bg-accent-cyan/30 transition-colors cursor-pointer",
                  )}
                >
                  {opt.label}
                  <FiX className="w-[2.5vw] h-[2.5vw] tablet:w-[1.2vw] tablet:h-[1.2vw] desktop:w-[0.5vw] desktop:h-[0.5vw]" />
                </motion.button>
              ))}
              {selectedTagOptions.map((opt) => (
                <motion.button
                  key={`tag-${opt.id}`}
                  type="button"
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => handleRemoveTag(opt.id)}
                  className={cn(
                    "inline-flex items-center gap-[1vw] tablet:gap-[0.5vw] desktop:gap-[0.208vw]",
                    "px-[2vw] tablet:px-[1vw] desktop:px-[0.417vw] py-[1vw] tablet:py-[0.5vw] desktop:py-[0.208vw]",
                    "rounded-md border text-[3vw] tablet:text-[1.4vw] desktop:text-[0.583vw]",
                    "bg-accent-purple/20 text-accent-purple border-accent-purple/50",
                    "hover:bg-accent-purple/30 transition-colors cursor-pointer",
                  )}
                >
                  #{opt.label}
                  <FiX className="w-[2.5vw] h-[2.5vw] tablet:w-[1.2vw] tablet:h-[1.2vw] desktop:w-[0.5vw] desktop:h-[0.5vw]" />
                </motion.button>
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
                  Clear all
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
