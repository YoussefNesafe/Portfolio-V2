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
}

export function SelectedChips({
  selectedCategoryOptions,
  selectedTagOptions,
  totalSelected,
  handleRemoveCategory,
  handleRemoveTag,
  handleClearAll,
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
                Clear all
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
