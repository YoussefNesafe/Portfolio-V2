"use client";

import { useViewMode } from "@/app/components/view-mode/ViewModeContext";
import { useEasterEggs } from "@/app/components/easter-eggs/EasterEggsContext";
import InteractiveTerminal from "@/app/components/view-mode/InteractiveTerminal";
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
  const { triggerMatrix } = useEasterEggs();

  if (mode === "dev") {
    return (
      <InteractiveTerminal dict={dict} onTriggerMatrix={triggerMatrix} />
    );
  }

  return <>{designerContent}</>;
}
