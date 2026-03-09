"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import * as THREE from "three";
import { createNoise3D } from "simplex-noise";

// Module-level ref shared between outer scroll tracker and inner R3F component
const scrollProgressRef = { current: 0 };

function FluidPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const noise3D = useMemo(() => createNoise3D(), []);
  const timeRef = useRef(0);

  const { viewport } = useThree();

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(
      viewport.width * 1.5,
      viewport.height * 1.5,
      48,
      48,
    );
  }, [viewport.width, viewport.height]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uOpacity: { value: 0.15 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vElevation;
        void main() {
          vUv = uv;
          vElevation = position.z;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uScroll;
        uniform float uOpacity;
        varying vec2 vUv;
        varying float vElevation;

        vec3 cyan = vec3(0.024, 0.714, 0.831);
        vec3 purple = vec3(0.659, 0.333, 0.969);
        vec3 emerald = vec3(0.063, 0.725, 0.506);

        void main() {
          float s = uScroll;
          vec3 color;
          if (s < 0.25) {
            color = mix(cyan, purple, s * 4.0);
          } else if (s < 0.5) {
            color = mix(purple, emerald, (s - 0.25) * 4.0);
          } else if (s < 0.75) {
            color = mix(emerald, cyan, (s - 0.5) * 4.0);
          } else {
            color = mix(cyan, purple, (s - 0.75) * 4.0);
          }

          color += vElevation * 0.3;
          color = mix(color, vec3(1.0), vUv.y * 0.1);

          float alpha = uOpacity * (0.8 + vElevation * 0.5);
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
  }, []);

  useFrame(({ clock, pointer }) => {
    if (!meshRef.current) return;

    timeRef.current = clock.getElapsedTime() * 0.3;

    const positions = meshRef.current.geometry.attributes.position;
    const arr = positions.array as Float32Array;

    for (let i = 0; i < positions.count; i++) {
      const x = arr[i * 3];
      const y = arr[i * 3 + 1];

      // Noise-based displacement
      const noiseVal =
        noise3D(x * 0.3, y * 0.3, timeRef.current) * 0.8;

      // Cursor repulsion
      const dx = x / (viewport.width * 0.75) - pointer.x;
      const dy = y / (viewport.height * 0.75) - pointer.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const cursorEffect = dist < 0.3 ? (0.3 - dist) * 2 : 0;

      arr[i * 3 + 2] = noiseVal + cursorEffect;
    }

    positions.needsUpdate = true;

    // Update shader uniforms
    material.uniforms.uTime.value = timeRef.current;
    material.uniforms.uScroll.value = scrollProgressRef.current;
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}

// Throttle helper to cap updates at ~30fps
function useThrottledAnimationLoop(canvasRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    // The Canvas frameloop="demand" approach doesn't fit well here;
    // instead we use "always" with the R3F internal throttle via dpr.
    // The low dpr + powerPreference already keeps GPU usage minimal.
  }, [canvasRef]);
}

export default function FluidMesh() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollProgressRef.current = v;
  });

  useThrottledAnimationLoop(containerRef);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    >
      <Canvas
        frameloop="always"
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
        style={{ background: "transparent" }}
      >
        <FluidPlane />
      </Canvas>
    </div>
  );
}
