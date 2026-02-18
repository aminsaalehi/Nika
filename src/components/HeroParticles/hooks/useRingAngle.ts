/**
 * useRingAngle – converts pointer position to an angle around the center ring
 * with damped smoothing. Used to drive the particle attractor and RGB intensity.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { CONFIG } from "../config";

export interface RingAngleState {
  /** Smoothed angle in radians [0, 2π] */
  angle: number;
  /** Interaction intensity 0–1 for RGB effect */
  intensity: number;
}

export function useRingAngle(containerRef: React.RefObject<HTMLElement | null>) {
  const [state, setState] = useState<RingAngleState>({
    angle: 0,
    intensity: 0,
  });

  const smoothedAngleRef = useRef(0);
  const prevAngleRef = useRef(0);
  const intensityRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const lastMoveRef = useRef(0);
  const rafRef = useRef<number>(0);

  const updateAngle = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (width <= 0 || height <= 0) return;

    // Normalized device coords [-1, 1]
    const x = ((clientX - rect.left) / width) * 2 - 1;
    const y = -((clientY - rect.top) / height) * 2 + 1;

    // Angle [0, 2π]
    let rawAngle = Math.atan2(y, x);
    if (rawAngle < 0) rawAngle += Math.PI * 2;

    const now = performance.now();
    const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
    lastTimeRef.current = now;

    // Damped smoothing: smoothedAngle = lerp(smoothed, raw, 1 - exp(-damping * dt))
    const factor = 1 - Math.exp(-CONFIG.ANGLE_DAMPING * dt);
    let smoothed = smoothedAngleRef.current;
    let delta = rawAngle - smoothed;

    // Handle wrap-around for shortest path
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;

    smoothed += delta * factor;
    if (smoothed < 0) smoothed += Math.PI * 2;
    if (smoothed > Math.PI * 2) smoothed -= Math.PI * 2;

    smoothedAngleRef.current = smoothed;

    // Intensity from angular velocity (for RGB ramp)
    const angleVel = Math.abs(smoothed - prevAngleRef.current) / (dt || 0.001);
    prevAngleRef.current = smoothed;

    const targetIntensity = Math.min(1, angleVel * 2);
    intensityRef.current += (targetIntensity - intensityRef.current) * 0.15;
    intensityRef.current = Math.max(0, intensityRef.current);

    lastMoveRef.current = now;
    setState({
      angle: smoothed,
      intensity: intensityRef.current,
    });
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let ticking = false;
    let pendingX = 0;
    let pendingY = 0;

    const onPointerMove = (e: PointerEvent) => {
      pendingX = e.clientX;
      pendingY = e.clientY;
      if (!ticking) {
        ticking = true;
        rafRef.current = requestAnimationFrame(() => {
          updateAngle(pendingX, pendingY);
          ticking = false;
        });
      }
    };

    el.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, updateAngle]);

  // Decay intensity when idle (no pointer move for 200ms+)
  useEffect(() => {
    const interval = setInterval(() => {
      const idle = performance.now() - lastMoveRef.current > 200;
      if (idle && intensityRef.current > 0.01) {
        intensityRef.current *= 0.92;
        setState((s) => ({ ...s, intensity: intensityRef.current }));
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return state;
}
