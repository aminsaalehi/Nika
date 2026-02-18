"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const DUST_COUNT = 320;
const BOUNDS_X = 2.2;
const BOUNDS_Y = 1.35;
const MIN_SIZE = 0.08;
const MAX_SIZE = 0.2;

function createDustGeometry() {
  const positions = new Float32Array(DUST_COUNT * 3);
  const sizes = new Float32Array(DUST_COUNT);
  const alphas = new Float32Array(DUST_COUNT);

  for (let i = 0; i < DUST_COUNT; i++) {
    positions[i * 3] = (Math.random() * 2 - 1) * BOUNDS_X;
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * BOUNDS_Y;
    positions[i * 3 + 2] = -0.85 - Math.random() * 0.6;
    sizes[i] = THREE.MathUtils.lerp(MIN_SIZE, MAX_SIZE, Math.random());
    alphas[i] = THREE.MathUtils.lerp(0.025, 0.085, Math.random());
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));
  return geo;
}

export function AmbientDust() {
  const geometry = useMemo(() => createDustGeometry(), []);
  const velocityRef = useRef<Float32Array>(new Float32Array(DUST_COUNT * 2));

  useEffect(() => {
    const vel = velocityRef.current;
    for (let i = 0; i < DUST_COUNT; i++) {
      vel[i * 2] = THREE.MathUtils.lerp(-0.018, 0.018, Math.random());
      vel[i * 2 + 1] = THREE.MathUtils.lerp(-0.01, 0.01, Math.random());
    }
  }, []);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
        },
        vertexShader: `
          attribute float aSize;
          attribute float aAlpha;
          varying float vAlpha;
          uniform float uTime;

          void main() {
            vAlpha = aAlpha;
            vec3 pos = position;
            pos.x += sin(uTime * 0.05 + position.y * 4.0) * 0.015;
            pos.y += cos(uTime * 0.04 + position.x * 3.5) * 0.012;
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = aSize * (50.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying float vAlpha;

          void main() {
            vec2 centered = gl_PointCoord - vec2(0.5);
            float dist = length(centered);
            if (dist > 0.5) {
              discard;
            }
            float edge = 1.0 - smoothstep(0.25, 0.5, dist);
            gl_FragColor = vec4(vec3(0.95), edge * vAlpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      }),
    []
  );

  useEffect(() => {
    return () => (material as THREE.Material).dispose();
  }, [material]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.033);
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const vel = velocityRef.current;

    for (let i = 0; i < DUST_COUNT; i++) {
      const ix = i * 3;
      const iv = i * 2;
      arr[ix] += vel[iv] * dt;
      arr[ix + 1] += vel[iv + 1] * dt;

      if (arr[ix] > BOUNDS_X) arr[ix] = -BOUNDS_X;
      if (arr[ix] < -BOUNDS_X) arr[ix] = BOUNDS_X;
      if (arr[ix + 1] > BOUNDS_Y) arr[ix + 1] = -BOUNDS_Y;
      if (arr[ix + 1] < -BOUNDS_Y) arr[ix + 1] = BOUNDS_Y;
    }

    material.uniforms.uTime.value += dt;
    pos.needsUpdate = true;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
