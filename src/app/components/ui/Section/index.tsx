"use client";

import { cn } from "@/app/utils/cn";
import { HTMLAttributes } from "react";
import SectionDecorations from "@/app/components/ui/FloatingElements";

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
      className={cn("relative section-pt section-pb", className)}
      {...props}
    >
      {children}
      {id ? <SectionDecorations variant={id} /> : null}
    </section>
  );
}
