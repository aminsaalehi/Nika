/**
 * ParticlePoints – Renders text as particles, with cursor scatter + reform.
 */

"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { HeroControls } from "../hooks/useHeroControls";

const BASE_SIZE = 0.14;
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 420;
const WORLD_WIDTH = 2.8;
const WORLD_HEIGHT = 1.1;
const SPRING_STIFFNESS = 13.5;
const SPRING_DAMPING = 3.2;
const AIR_DRAG = 0.988;
const MIN_INTERACTION_RADIUS = 0.05;
const RIPPLE_STRENGTH = 40;
const RIPPLE_FREQUENCY = 85;
const RIPPLE_SPEED = 8.5;
const FLOW_STRENGTH = 0.5;
const SWIRL_STRENGTH = 0.24;
const MAX_SPEED = 5.8;

interface ParticlePointsProps {
  cursor: THREE.Vector3 | null;
  controls: HeroControls;
  text: string;
  fontFamily: string;
  maxLines: 1 | 2;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function makeTextPoints(
  text: string,
  density: number,
  spacingControl: number,
  fontFamily: string,
  maxLines: 1 | 2,
  lineGapControl: number
) {
  const sanitized = text.replace(/\r/g, "").trim();
  const lines = sanitized.length > 0
    ? sanitized.split("\n").map((line) => line.trim()).filter((line) => line.length > 0).slice(0, maxLines)
    : ["PARTICLES"];
  const safeLines = lines.length > 0 ? lines : ["PARTICLES"];
  const spacing = clamp(spacingControl, 0.5, 3);
  const particleBudget = Math.round(clamp(density, 10, 100) * 65);
  const sampleStep = Math.max(2, Math.round(2 + spacing * 2.5));
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new Float32Array(0);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let fontSize = 300;
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  const measureMaxWidth = () => safeLines.reduce((acc, line) => Math.max(acc, ctx.measureText(line).width), 0);
  const lineGap = clamp(lineGapControl, 0.8, 1.8);
  const lineHeightFor = (size: number) => size * lineGap;

  while (
    (measureMaxWidth() > canvas.width * 0.88 || safeLines.length * lineHeightFor(fontSize) > canvas.height * 0.72) &&
    fontSize > 72
  ) {
    fontSize -= 12;
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
  }

  const lineHeight = lineHeightFor(fontSize);
  const blockHeight = safeLines.length * lineHeight;
  const startY = canvas.height / 2 - blockHeight / 2 + lineHeight / 2 + fontSize * 0.05;
  safeLines.forEach((line, idx) => {
    ctx.fillText(line, canvas.width / 2, startY + idx * lineHeight);
  });
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const candidates: Array<{ x: number; y: number }> = [];

  for (let y = 0; y < canvas.height; y += sampleStep) {
    for (let x = 0; x < canvas.width; x += sampleStep) {
      const alpha = image.data[(y * canvas.width + x) * 4 + 3];
      if (alpha > 70) {
        candidates.push({ x, y });
      }
    }
  }

  if (candidates.length === 0) {
    return new Float32Array(0);
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const takeCount = Math.min(candidates.length, particleBudget);
  const points = new Float32Array(takeCount * 3);

  for (let i = 0; i < takeCount; i++) {
    const p = candidates[i];
    const nx = p.x / canvas.width - 0.5;
    const ny = 0.5 - p.y / canvas.height;
    points[i * 3] = nx * WORLD_WIDTH;
    points[i * 3 + 1] = ny * WORLD_HEIGHT;
    points[i * 3 + 2] = 0;
  }

  return points;
}

function createGeometry(rest: Float32Array) {
  const count = Math.floor(rest.length / 3);
  const positions = rest.slice();
  const sizes = new Float32Array(count);
  const restUv = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    sizes[i] = BASE_SIZE;
    const x = rest[i * 3];
    const y = rest[i * 3 + 1];
    restUv[i * 2] = clamp(x / WORLD_WIDTH + 0.5, 0, 1);
    restUv[i * 2 + 1] = clamp(y / WORLD_HEIGHT + 0.5, 0, 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("aRestUv", new THREE.BufferAttribute(restUv, 2));
  return geo;
}

export function ParticlePoints({ cursor, controls, text, fontFamily, maxLines }: ParticlePointsProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const restPositions = useMemo(
    () =>
      makeTextPoints(
        text,
        Number(controls.particleCount) || 60,
        Number(controls.trailSpacing) || 1,
        fontFamily,
        maxLines,
        Number(controls.typographyLineGap) || 1.08
      ),
    [text, controls.particleCount, controls.trailSpacing, fontFamily, maxLines, controls.typographyLineGap]
  );
  const geometry = useMemo(() => createGeometry(restPositions), [restPositions]);
  const cursorRef = useRef<THREE.Vector3 | null>(null);
  const previousCursorRef = useRef<THREE.Vector3 | null>(null);
  const cursorVelocityRef = useRef(new THREE.Vector3());
  const velocityRef = useRef<Float32Array>(new Float32Array(restPositions.length));

  useEffect(() => {
    velocityRef.current = new Float32Array(restPositions.length);
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    arr.set(restPositions);
    pos.needsUpdate = true;
  }, [restPositions, geometry]);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTint: { value: new THREE.Color("#e8e8ec") },
        uGradientA: { value: new THREE.Color("#5f7cff") },
        uGradientB: { value: new THREE.Color("#b56dff") },
        uGradientEnabled: { value: 1.0 },
        uSizeScale: { value: 0.5 },
        uTime: { value: 0 },
        uShape: { value: 0.0 },
      },
      vertexShader: `
        attribute float aSize;
        attribute vec2 aRestUv;
        uniform float uSizeScale;
        varying vec2 vRestUv;

        void main() {
          vRestUv = aRestUv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uSizeScale * (80.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uTint;
        uniform vec3 uGradientA;
        uniform vec3 uGradientB;
        uniform float uGradientEnabled;
        uniform float uTime;
        uniform float uShape;
        varying vec2 vRestUv;

        float sdEquilateralTriangle(vec2 p) {
          const float k = 1.7320508;
          p.x = abs(p.x) - 1.0;
          p.y = p.y + 1.0 / k;
          if (p.x + k * p.y > 0.0) {
            p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
          }
          p.x -= clamp(p.x, -2.0, 0.0);
          return -length(p) * sign(p.y);
        }

        void main() {
          vec2 centered = gl_PointCoord - vec2(0.5);
          float edge = 1.0;
          if (uShape < 0.5) {
            float dist = length(centered);
            if (dist > 0.5) discard;
            edge = 1.0 - smoothstep(0.42, 0.5, dist);
          } else if (uShape < 1.5) {
            vec2 sq = abs(centered);
            float d = max(sq.x, sq.y);
            if (d > 0.5) discard;
            edge = 1.0 - smoothstep(0.44, 0.5, d);
          } else {
            vec2 p = gl_PointCoord * 2.0 - 1.0;
            p.y += 0.15;
            float d = sdEquilateralTriangle(p * 1.14);
            if (d > 0.0) discard;
            edge = 1.0 - smoothstep(-0.1, 0.0, d);
          }

          vec2 uv = vRestUv;
          float theta = uTime * 0.045;
          mat2 rot = mat2(cos(theta), -sin(theta), sin(theta), cos(theta));
          vec2 ruv = rot * (uv - 0.5) + 0.5;
          float wave = sin((ruv.y * 3.14159) + uTime * 0.22) * 0.035;
          float phase = (ruv.x + wave + uTime * 0.03) * 6.2831853;
          float g = 0.5 + 0.5 * sin(phase);
          g = smoothstep(0.08, 0.92, g);
          vec3 gradient = mix(uGradientA, uGradientB, g);
          vec3 color = mix(uTint, gradient * uTint, uGradientEnabled);
          gl_FragColor = vec4(color, edge);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
  }, []);

  useEffect(() => {
    const hex = controls.color;
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (m) {
      const color = material.uniforms.uTint.value as THREE.Color;
      color.setRGB(
        parseInt(m[1], 16) / 255,
        parseInt(m[2], 16) / 255,
        parseInt(m[3], 16) / 255
      );
    }
  }, [controls.color, material]);

  useEffect(() => {
    const hex = controls.gradientStart;
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (m) {
      const color = material.uniforms.uGradientA.value as THREE.Color;
      color.setRGB(
        parseInt(m[1], 16) / 255,
        parseInt(m[2], 16) / 255,
        parseInt(m[3], 16) / 255
      );
    }
  }, [controls.gradientStart, material]);

  useEffect(() => {
    const hex = controls.gradientEnd;
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (m) {
      const color = material.uniforms.uGradientB.value as THREE.Color;
      color.setRGB(
        parseInt(m[1], 16) / 255,
        parseInt(m[2], 16) / 255,
        parseInt(m[3], 16) / 255
      );
    }
  }, [controls.gradientEnd, material]);

  useEffect(() => {
    const shape = controls.particleShape;
    material.uniforms.uShape.value = shape === "circle" ? 0 : shape === "square" ? 1 : 2;
  }, [controls.particleShape, material]);

  useEffect(() => {
    material.uniforms.uGradientEnabled.value = controls.gradientEnabled ? 1 : 0;
  }, [controls.gradientEnabled, material]);

  useEffect(() => {
    material.uniforms.uSizeScale.value = clamp(Number(controls.particleSize) || 0.5, 0.1, 1.2);
  }, [controls.particleSize, material]);

  useEffect(() => {
    (material as THREE.Material).dispose();
  }, [material]);

  if (cursor) {
    cursorRef.current = cursor;
  } else {
    cursorRef.current = null;
  }

  useFrame((_, delta) => {
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const rest = restPositions;
    const velocity = velocityRef.current;
    if (!pos || arr.length !== rest.length || velocity.length !== rest.length) return;

    const frameDt = Math.min(delta, 0.05);
    const substeps = frameDt > 0.024 ? 3 : frameDt > 0.014 ? 2 : 1;
    const dt = frameDt / substeps;
    const cursorInfluenceSize = clamp(Number(controls.cursorInfluenceSize) || 1, 1, 4);
    const interactionRadius = MIN_INTERACTION_RADIUS * cursorInfluenceSize;
    const interactionStrength = RIPPLE_STRENGTH * (1 + (cursorInfluenceSize - 1) * 0.3);

    const cursorPoint = cursorRef.current;
    const cursorVel = cursorVelocityRef.current;
    if (cursorPoint) {
      const prev = previousCursorRef.current;
      if (prev) {
        const inv = 1 / Math.max(frameDt, 0.0001);
        const instantX = (cursorPoint.x - prev.x) * inv;
        const instantY = (cursorPoint.y - prev.y) * inv;
        cursorVel.x = THREE.MathUtils.lerp(cursorVel.x, instantX, 0.35);
        cursorVel.y = THREE.MathUtils.lerp(cursorVel.y, instantY, 0.35);
      }
      previousCursorRef.current = cursorPoint.clone();
    } else {
      previousCursorRef.current = null;
      cursorVel.multiplyScalar(0.86);
    }

    for (let step = 0; step < substeps; step++) {
      for (let i = 0; i < arr.length; i += 3) {
        const px = arr[i];
        const py = arr[i + 1];
        const rx = rest[i];
        const ry = rest[i + 1];

        let vx = velocity[i];
        let vy = velocity[i + 1];

        // Damped spring: stable "return to glyph" behavior without jitter.
        let ax = (rx - px) * SPRING_STIFFNESS - vx * SPRING_DAMPING;
        let ay = (ry - py) * SPRING_STIFFNESS - vy * SPRING_DAMPING;

        if (cursorPoint) {
          const dx = px - cursorPoint.x;
          const dy = py - cursorPoint.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < interactionRadius * interactionRadius) {
            const dist = Math.sqrt(distSq) + 0.0001;
            const ndx = dx / dist;
            const ndy = dy / dist;
            const sigma = interactionRadius * 0.45;
            const influence = Math.exp(-(distSq / Math.max(0.000001, 2 * sigma * sigma)));
            const phase = dist * RIPPLE_FREQUENCY - material.uniforms.uTime.value * RIPPLE_SPEED;
            const ripple = Math.sin(phase) * interactionStrength * influence;

            // Tiny interaction footprint with wave-like disturbance, not a hard hole.
            ax += ndx * ripple;
            ay += ndy * ripple;
            ax += cursorVel.x * FLOW_STRENGTH * influence;
            ay += cursorVel.y * FLOW_STRENGTH * influence;
            ax += -ndy * SWIRL_STRENGTH * ripple;
            ay += ndx * SWIRL_STRENGTH * ripple;
          }
        }

        vx += ax * dt;
        vy += ay * dt;
        vx *= AIR_DRAG;
        vy *= AIR_DRAG;

        const speedSq = vx * vx + vy * vy;
        if (speedSq > MAX_SPEED * MAX_SPEED) {
          const invSpeed = MAX_SPEED / Math.sqrt(speedSq);
          vx *= invSpeed;
          vy *= invSpeed;
        }

        arr[i] = px + vx * dt;
        arr[i + 1] = py + vy * dt;
        arr[i + 2] = 0;

        velocity[i] = vx;
        velocity[i + 1] = vy;
        velocity[i + 2] = 0;
      }
    }

    material.uniforms.uTime.value += frameDt;
    pos.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />;
}
