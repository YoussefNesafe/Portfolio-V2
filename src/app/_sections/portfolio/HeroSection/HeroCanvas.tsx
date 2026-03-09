"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function Icosahedron() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.LineSegments>(null);

  useFrame(({ clock, pointer }) => {
    if (!meshRef.current || !wireRef.current) return;
    const t = clock.getElapsedTime();

    // Slow rotation + cursor tilt
    meshRef.current.rotation.x = t * 0.1 + pointer.y * 0.3;
    meshRef.current.rotation.y = t * 0.15 + pointer.x * 0.3;
    wireRef.current.rotation.copy(meshRef.current.rotation);

    // Gentle bob
    meshRef.current.position.y = Math.sin(t * 0.5) * 0.3;
    wireRef.current.position.y = meshRef.current.position.y;
  });

  return (
    <group>
      {/* Glass body */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.8, 0]} />
        <meshPhysicalMaterial
          color="#06B6D4"
          transparent
          opacity={0.05}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      {/* Wireframe */}
      <lineSegments ref={wireRef}>
        <edgesGeometry args={[new THREE.IcosahedronGeometry(1.8, 0)]} />
        <lineBasicMaterial color="#06B6D4" transparent opacity={0.6} />
      </lineSegments>
    </group>
  );
}

export default function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#06B6D4" />
      <Icosahedron />
    </Canvas>
  );
}
