"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiX, FiCheck, FiSearch } from "react-icons/fi";
import { cn } from "@/app/utils/cn";

interface Option {
  id: string;
  label: string;
  count: number;
}

interface MultiSelectDropdownProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  accentColor: "cyan" | "purple";
  placeholder?: string;
  labelPrefix?: string;
}

const accentClasses = {
  cyan: {
    chip: "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/50",
    checkbox: "border-accent-cyan bg-accent-cyan/20 text-accent-cyan",
    checkboxEmpty: "border-border-subtle hover:border-accent-cyan/50",
    hoverBg: "hover:bg-accent-cyan/10",
    focusRing: "focus:border-accent-cyan/50",
    clearText: "text-accent-cyan hover:text-accent-cyan/80",
    triggerActive: "border-accent-cyan/50",
  },
  purple: {
    chip: "bg-accent-purple/20 text-accent-purple border-accent-purple/50",
    checkbox: "border-accent-purple bg-accent-purple/20 text-accent-purple",
    checkboxEmpty: "border-border-subtle hover:border-accent-purple/50",
    hoverBg: "hover:bg-accent-purple/10",
    focusRing: "focus:border-accent-purple/50",
    clearText: "text-accent-purple hover:text-accent-purple/80",
    triggerActive: "border-accent-purple/50",
  },
} as const;

export default function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  accentColor,
  placeholder,
  labelPrefix = "",
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const colors = accentClasses[accentColor];

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedOptions = options.filter((opt) => selected.includes(opt.id));

  const handleToggle = useCallback(
    (id: string) => {
      if (selected.includes(id)) {
        onChange(selected.filter((s) => s !== id));
      } else {
        onChange([...selected, id]);
      }
    },
    [selected, onChange],
  );

  const handleRemove = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(selected.filter((s) => s !== id));
    },
    [selected, onChange],
  );

  const handleClearAll = useCallback(() => {
    onChange([]);
  }, [onChange]);

  // Close on click outside
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Auto-focus search on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
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
          <span className="flex items-center gap-[1.5vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw] flex-wrap">
            {selectedOptions.slice(0, 2).map((opt) => (
              <span
                key={opt.id}
                className={cn(
                  "inline-flex items-center gap-[1vw] tablet:gap-[0.5vw] desktop:gap-[0.208vw]",
                  "px-[1.5vw] tablet:px-[0.75vw] desktop:px-[0.313vw] py-[0.5vw] tablet:py-[0.25vw] desktop:py-[0.104vw]",
                  "rounded border text-[2.667vw] tablet:text-[1.3vw] desktop:text-[0.542vw]",
                  colors.chip,
                )}
              >
                {labelPrefix}
                {opt.label}
                <FiX
                  className="w-[2.5vw] h-[2.5vw] tablet:w-[1.2vw] tablet:h-[1.2vw] desktop:w-[0.5vw] desktop:h-[0.5vw] cursor-pointer"
                  onClick={(e) => handleRemove(opt.id, e)}
                />
              </span>
            ))}
            {selectedOptions.length > 2 && (
              <span className="text-text-muted text-[2.667vw] tablet:text-[1.3vw] desktop:text-[0.542vw]">
                +{selectedOptions.length - 2} more
              </span>
            )}
          </span>
        )}
        <FiChevronDown
          className={cn(
            "w-[3vw] h-[3vw] tablet:w-[1.5vw] tablet:h-[1.5vw] desktop:w-[0.625vw] desktop:h-[0.625vw] ml-auto transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown panel */}
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
                  onChange={(e) => setSearch(e.target.value)}
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
            <div className="max-h-[50vw] tablet:max-h-[25vw] desktop:max-h-[13vw] overflow-y-auto no-scrollbar">
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
                      onClick={() => handleToggle(opt.id)}
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
                  onClick={handleClearAll}
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
    </div>
  );
}
