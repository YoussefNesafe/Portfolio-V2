"use client";

import { accentClasses } from "./multi-select/types";
import { useDropdown } from "./multi-select/useDropdown";
import { DropdownTrigger } from "./multi-select/DropdownTrigger";
import { DropdownPanel } from "./multi-select/DropdownPanel";
import type { MultiSelectDropdownProps } from "./multi-select/types";

export type { Option } from "./multi-select/types";

export default function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  accentColor,
  placeholder,
  labelPrefix = "",
}: MultiSelectDropdownProps) {
  const {
    isOpen,
    search,
    setSearch,
    containerRef,
    searchInputRef,
    filteredOptions,
    selectedOptions,
    toggleOpen,
    handleToggle,
    handleClearAll,
  } = useDropdown({ options, selected, onChange });

  const colors = accentClasses[accentColor];

  return (
    <div ref={containerRef} className="relative">
      <DropdownTrigger
        label={label}
        placeholder={placeholder}
        labelPrefix={labelPrefix}
        isOpen={isOpen}
        selected={selected}
        selectedOptions={selectedOptions}
        colors={colors}
        onToggle={toggleOpen}
      />

      <DropdownPanel
        label={label}
        labelPrefix={labelPrefix}
        isOpen={isOpen}
        search={search}
        onSearchChange={setSearch}
        searchInputRef={searchInputRef}
        filteredOptions={filteredOptions}
        selected={selected}
        colors={colors}
        onToggle={handleToggle}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
