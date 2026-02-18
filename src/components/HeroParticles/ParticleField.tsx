/**
 * ParticleField – Scene with cursor-following particles. No effects.
 */

"use client";

import { useThree } from "@react-three/fiber";
import { useMemo, useEffect } from "react";
import * as THREE from "three";
import { AmbientDust } from "./particles/AmbientDust";
import { ParticlePoints } from "./particles/ParticlePoints";
import type { HeroControls } from "./hooks/useHeroControls";

interface ParticleFieldProps {
  cursorNdc: { x: number; y: number } | null;
  controls: HeroControls;
  text: string;
  fontFamily: string;
  maxLines: 1 | 2;
  backgroundColor: string;
}

export function ParticleField({
  cursorNdc,
  controls,
  text,
  fontFamily,
  maxLines,
  backgroundColor,
}: ParticleFieldProps) {
  const { scene, camera } = useThree();
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    scene.background = new THREE.Color(backgroundColor || "#0a0a0a");
  }, [scene, backgroundColor]);

  if (cursorNdc) {
    mouse.set(cursorNdc.x, cursorNdc.y);
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, target);
  }

  return (
    <>
      <AmbientDust />
      <ParticlePoints
        cursor={cursorNdc ? target.clone() : null}
        controls={controls}
        text={text}
        fontFamily={fontFamily}
        maxLines={maxLines}
      />
    </>
  );
}
