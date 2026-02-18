/**
 * ChromaticAberrationPass – Drives chromatic aberration from interaction
 * and control panel (intensity, angle).
 */

"use client";

import { ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

interface ChromaticAberrationPassProps {
  /** 0 = idle, 1 = actively interacting */
  intensity: number;
  rgbShiftIntensity: number;
  rgbShiftAngle: number;
}

export function ChromaticAberrationPass({
  intensity,
  rgbShiftIntensity,
  rgbShiftAngle,
}: ChromaticAberrationPassProps) {
  const baseOffset = rgbShiftIntensity * 0.25;
  const interactOffset = rgbShiftIntensity * intensity;
  const totalOffset = baseOffset + interactOffset;

  const offsetX = totalOffset * Math.cos(rgbShiftAngle);
  const offsetY = totalOffset * Math.sin(rgbShiftAngle);

  return (
    <ChromaticAberration
      offset={new THREE.Vector2(offsetX, offsetY)}
      radialModulation
      modulationOffset={0.5}
      blendFunction={BlendFunction.NORMAL}
    />
  );
}
