"use client";

import MultiSelectDropdown from "./MultiSelectDropdown";
import { useBlogFilters } from "./blog-filters/useBlogFilters";
import { LoadingBar } from "./blog-filters/LoadingBar";
import { SelectedChips } from "./blog-filters/SelectedChips";
import type { BlogFiltersProps } from "./blog-filters/types";

export type { FilterOption, BlogFiltersProps } from "./blog-filters/types";

export default function BlogFilters({ categories, tags }: BlogFiltersProps) {
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

      <LoadingBar isPending={isPending} />

      <SelectedChips
        selectedCategoryOptions={selectedCategoryOptions}
        selectedTagOptions={selectedTagOptions}
        totalSelected={totalSelected}
        handleRemoveCategory={handleRemoveCategory}
        handleRemoveTag={handleRemoveTag}
        handleClearAll={handleClearAll}
      />
    </div>
  );
}
