"use client";

import { FiChevronDown } from "react-icons/fi";
import { cn } from "@/app/utils/cn";
import type { Option, AccentColors } from "./types";

interface DropdownTriggerProps {
  label: string;
  placeholder?: string;
  labelPrefix: string;
  isOpen: boolean;
  selected: string[];
  selectedOptions: Option[];
  colors: AccentColors;
  onToggle: () => void;
}

export function DropdownTrigger({
  label,
  placeholder,
  labelPrefix,
  isOpen,
  selected,
  selectedOptions,
  colors,
  onToggle,
}: DropdownTriggerProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-label={`${label}: ${selected.length > 0 ? `${selected.length} selected` : "none selected"}`}
      className={cn(
        "flex items-center gap-[1.5vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw] w-full tablet:w-auto",
        "px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[2.8vw] tablet:py-[1.4vw] desktop:py-[0.55vw]",
        "rounded-lg bg-background/50 border border-border-subtle",
        "text-[3.2vw] tablet:text-[1.6vw] desktop:text-[0.667vw]",
        "transition-colors cursor-pointer",
        isOpen && colors.triggerActive,
        selected.length === 0 && "text-text-muted",
      )}
    >
      {selected.length === 0 ? (
        <span>{placeholder || label}</span>
      ) : (
        <span className="text-foreground truncate max-w-[40vw] tablet:max-w-[18vw] desktop:max-w-[8vw]">
          {selectedOptions.map((opt) => `${labelPrefix}${opt.label}`).join(", ")}
        </span>
      )}
      <FiChevronDown
        className={cn(
          "w-[3vw] h-[3vw] tablet:w-[1.5vw] tablet:h-[1.5vw] desktop:w-[0.625vw] desktop:h-[0.625vw] ml-auto transition-transform",
          isOpen && "rotate-180",
        )}
      />
    </button>
  );
}
