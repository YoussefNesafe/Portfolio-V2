"use client";

import { useXRay } from "./XRayContext";
import { useViewMode } from "@/app/components/view-mode/ViewModeContext";
import { FiEye } from "react-icons/fi";

export default function XRayToggle() {
  const { isActive, toggle } = useXRay();
  const { mode } = useViewMode();

  if (mode === "dev") return null;

  return (
    <div className="fixed bottom-[4.267vw] tablet:bottom-[2vw] desktop:bottom-[0.833vw] right-[4.267vw] tablet:right-[2vw] desktop:right-[0.833vw] z-40">
      <button
        onClick={toggle}
        className={`flex items-center justify-center w-[10.667vw] h-[10.667vw] tablet:w-[5vw] tablet:h-[5vw] desktop:w-[2.083vw] desktop:h-[2.083vw] rounded-full bg-bg-secondary/90 backdrop-blur-lg border cursor-pointer transition-all duration-300 ${
          isActive
            ? "border-accent-cyan shadow-[0_0_12px_theme(colors.accent-cyan)] text-accent-cyan"
            : "border-border-subtle text-text-muted hover:text-accent-cyan hover:border-accent-cyan/40"
        }`}
        aria-label={`${isActive ? "Disable" : "Enable"} X-Ray mode`}
      >
        <FiEye className="w-[4.267vw] h-[4.267vw] tablet:w-[2vw] tablet:h-[2vw] desktop:w-[0.833vw] desktop:h-[0.833vw]" />
      </button>
    </div>
  );
}
