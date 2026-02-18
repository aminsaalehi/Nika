/**
 * Particle shaders as raw strings (no glsl loader required).
 * Vertex: rest shape + ring attractor + idle motion.
 * Fragment: soft point, opacity, color.
 */

export const vertexShader = /* glsl */ `
attribute vec3 position;
attribute vec3 restPosition;
attribute vec3 seed;

uniform float uTime;
uniform float uAttractorAngle;
uniform float uAttractorStrength;
uniform float uRingRadius;
uniform float uRestStrength;
uniform float uSwirlStrength;
uniform float uIdleBreath;
uniform float uIdleDrift;
uniform float uParticleSize;
uniform float uRandomness;
uniform float uInteractionFalloff;
uniform float uPaused;

float hash(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

void main() {
  vec3 pos = restPosition;

  // Apply randomness to rest position (dissolving edges)
  float noise = (hash(seed) - 0.5) * uRandomness * 0.15;
  pos += restPosition * noise;

  // Swirl: tangential offset based on angle between particle and attractor
  float particleAngle = atan(restPosition.z, restPosition.x);
  float deltaAngle = uAttractorAngle - particleAngle;
  if (deltaAngle > 3.14159) deltaAngle -= 6.28318;
  if (deltaAngle < -3.14159) deltaAngle += 6.28318;
  vec2 tangent = vec2(-restPosition.z, restPosition.x);
  float len = length(restPosition.xz) + 0.001;
  tangent /= len;
  float swirlOffset = sin(deltaAngle) * uSwirlStrength * uAttractorStrength * uInteractionFalloff;
  pos.xz += tangent * swirlOffset;

  // Subtle pull toward attractor (radial)
  vec2 attractorPos = uRingRadius * vec2(cos(uAttractorAngle), sin(uAttractorAngle));
  vec2 toAttractor = attractorPos - pos.xz;
  float dist = length(toAttractor) + 0.001;
  pos.xz += toAttractor * uAttractorStrength * 0.015 * uInteractionFalloff / dist;

  // Idle breathing
  float breath = sin(uTime * 0.5 + hash(seed) * 6.28) * uIdleBreath;
  pos += restPosition * breath;

  // Idle drift
  float driftAngle = uTime * uIdleDrift + hash(seed) * 6.28;
  vec2 drift = vec2(cos(driftAngle), sin(driftAngle)) * uIdleBreath * 0.5;
  pos.xz += drift;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = uParticleSize * (3.0 / max(0.001, -mvPosition.z));
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const fragmentShader = /* glsl */ `
uniform float uOpacity;
uniform vec3 uColor;

void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float d = length(uv);
  float alpha = 1.0 - smoothstep(0.2, 0.7, d);
  alpha *= uOpacity;
  gl_FragColor = vec4(uColor, alpha);
}
`;
