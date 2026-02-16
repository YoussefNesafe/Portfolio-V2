"use client";

import { labelClass } from "../../../../components/shared/admin-styles";
import type { Tag } from "./types";

interface TagSelectorProps {
  tags: Tag[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export default function TagSelector({
  tags,
  selectedIds,
  onToggle,
}: TagSelectorProps) {
  return (
    <div>
      <label className={labelClass}>Tags</label>
      <div className="flex flex-wrap gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw]">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onToggle(tag.id)}
            className={`px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[1.5vw] tablet:py-[0.75vw] desktop:py-[0.313vw] rounded text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] border transition-colors ${
              selectedIds.includes(tag.id)
                ? "bg-accent-purple/20 text-accent-purple border-accent-purple/50"
                : "border-border-subtle text-text-muted hover:border-accent-purple/30"
            }`}
          >
            #{tag.name}
          </button>
        ))}
        {tags.length === 0 && (
          <p className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]">
            No tags yet
          </p>
        )}
      </div>
    </div>
  );
}
