"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";

const FluidMesh = dynamic(() => import("./FluidMesh"), { ssr: false });

export default function FluidMeshWrapper() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-15"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(6,182,212,0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.2) 0%, transparent 50%)",
        }}
      />
    );
  }

  return <FluidMesh />;
}
