"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NODE_COUNT = 180;
const MAX_LINK_DIST = 2.2;
const FIELD_SPREAD = 7;

function Field() {
  const groupRef = useRef<THREE.Group>(null);

  /* Generate stable node positions */
  const positions = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      arr.push([
        (Math.random() - 0.5) * FIELD_SPREAD * 2,
        (Math.random() - 0.5) * FIELD_SPREAD,
        (Math.random() - 0.5) * FIELD_SPREAD * 0.6,
      ]);
    }
    return arr;
  }, []);

  /* Build line segments buffer */
  const lineGeo = useMemo(() => {
    const verts: number[] = [];
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[i][0] - positions[j][0];
        const dy = positions[i][1] - positions[j][1];
        const dz = positions[i][2] - positions[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < MAX_LINK_DIST) {
          verts.push(...positions[i], ...positions[j]);
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    return geo;
  }, [positions]);

  /* Points buffer */
  const pointGeo = useMemo(() => {
    const verts = positions.flat();
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    return geo;
  }, [positions]);

  /* Slow rotation */
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.03;
    groupRef.current.rotation.x = Math.sin(t * 0.015) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color="#2D8A3E" transparent opacity={0.18} />
      </lineSegments>
      <points geometry={pointGeo}>
        <pointsMaterial
          color="#4DB85C"
          size={0.06}
          transparent
          opacity={0.55}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

export default function ElecField() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      dpr={[1, 1.5]}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <Field />
    </Canvas>
  );
}
