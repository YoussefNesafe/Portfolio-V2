export interface Option {
  id: string;
  label: string;
  count: number;
}

export interface MultiSelectDropdownProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  accentColor: "cyan" | "purple";
  placeholder?: string;
  labelPrefix?: string;
}

export const accentClasses = {
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

export type AccentColors = (typeof accentClasses)[keyof typeof accentClasses];
