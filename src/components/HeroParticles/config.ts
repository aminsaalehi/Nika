/**
 * HeroParticles config – all tunable constants for the particle ring hero section.
 * Adjust these to change particle count, ring size, forces, and visual effects.
 */

export const CONFIG = {
  /** Number of particles (10k–100k). Lower for mobile. */
  PARTICLE_COUNT: 50_000,

  /** World-space radius of the center ring (attractor orbit). */
  RING_RADIUS: 0.5,

  /** Sphere radius for rest positions (base shape). */
  SHAPE_RADIUS: 0.35,

  /** Pull strength toward rest shape (keeps cloud coherent). */
  REST_STRENGTH: 0.08,

  /** Tangential/orbit force when cursor moves (swirl). */
  SWIRL_STRENGTH: 0.4,

  /** How strongly the cursor attractor pulls particles. */
  ATTRACTOR_STRENGTH: 0.25,

  /** Damping for velocity (higher = less bouncy). */
  DAMPING: 0.92,

  /** Lerp factor for angle smoothing (higher = snappier). */
  ANGLE_DAMPING: 12,

  /** Chromatic aberration intensity when idle. */
  RGB_IDLE: 0.002,

  /** Chromatic aberration intensity when interacting. */
  RGB_INTERACT: 0.012,

  /** Point size in shader (pixels). */
  PARTICLE_SIZE: 3.0,

  /** Optional bloom intensity (subtle). */
  BLOOM_INTENSITY: 0.12,

  /** Bloom luminance threshold (only bright pixels glow). */
  BLOOM_THRESHOLD: 0.6,

  /** Idle breathing motion strength. */
  IDLE_BREATH_STRENGTH: 0.02,

  /** Idle drift speed. */
  IDLE_DRIFT_SPEED: 0.3,
} as const;
