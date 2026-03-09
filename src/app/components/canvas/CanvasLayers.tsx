"use client";

import dynamic from "next/dynamic";

const FluidMeshWrapper = dynamic(
  () => import("@/app/components/canvas/FluidMeshWrapper"),
  { ssr: false }
);
const FloatingParticles = dynamic(
  () => import("@/app/components/canvas/FloatingParticles"),
  { ssr: false }
);

export default function CanvasLayers() {
  return (
    <>
      <FluidMeshWrapper />
      <FloatingParticles />
    </>
  );
}
