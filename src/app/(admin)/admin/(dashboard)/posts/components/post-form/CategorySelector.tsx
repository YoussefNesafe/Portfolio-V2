"use client";

import { labelClass } from "../../../../components/shared/admin-styles";
import type { Category } from "./types";

interface CategorySelectorProps {
  categories: Category[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export default function CategorySelector({
  categories,
  selectedIds,
  onToggle,
}: CategorySelectorProps) {
  return (
    <div>
      <label className={labelClass}>Categories</label>
      <div className="flex flex-wrap gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw]">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onToggle(cat.id)}
            className={`px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[1.5vw] tablet:py-[0.75vw] desktop:py-[0.313vw] rounded text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] border transition-colors ${
              selectedIds.includes(cat.id)
                ? "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/50"
                : "border-border-subtle text-text-muted hover:border-accent-cyan/30"
            }`}
          >
            {cat.name}
          </button>
        ))}
        {categories.length === 0 && (
          <p className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]">
            No categories yet
          </p>
        )}
      </div>
    </div>
  );
}
