"use client";

import { useViewMode } from "@/app/components/view-mode/ViewModeContext";
import dynamic from "next/dynamic";

const InteractiveTerminal = dynamic(
  () => import("@/app/components/view-mode/InteractiveTerminal"),
  { ssr: false }
);
import CustomCursor from "@/app/components/cursor/CustomCursor";
import type { IDictionary } from "@/app/models/IDictionary";

interface HomeContentProps {
  dict: Pick<
    IDictionary,
    "hero" | "about" | "experience" | "projects" | "skills" | "contact"
  >;
  designerContent: React.ReactNode;
}

export default function HomeContent({
  dict,
  designerContent,
}: HomeContentProps) {
  const { mode } = useViewMode();
  if (mode === "dev") {
    return <InteractiveTerminal dict={dict} />;
  }

  return (
    <>
      {designerContent}
      <CustomCursor />
    </>
  );
}
