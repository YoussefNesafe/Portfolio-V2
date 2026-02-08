"use client";

import { cn } from "@/app/utils/cn";
import { HTMLAttributes } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  id?: string;
}

export default function Section({
  children,
  id,
  className,
  ...props
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("section-pt section-pb", className)}
      {...props}
    >
      {children}
    </section>
  );
}
