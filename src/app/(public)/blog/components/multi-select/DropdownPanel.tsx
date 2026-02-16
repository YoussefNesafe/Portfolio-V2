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
                No results found
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
                Clear all
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
