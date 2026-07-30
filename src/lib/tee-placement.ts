import type { TeeTransform } from "@/types";

/**
 * Default Tee placement so it looks “worn”, not pasted on the face.
 *
 * Rules (full-body photo, object-cover stage):
 * - Horizontally centered on the figure (x ≈ 50%)
 * - Vertically in the chest band (40%–55% of stage height)
 * - Width ≈ shoulder span (scale maps to ~tee width / stage)
 * - Slight natural tilt + near-opaque fabric
 */
export function computeDefaultTeeTransform(): TeeTransform {
  // Chest band midpoint with tiny natural jitter (stable enough to feel worn-in)
  const y = 40 + 7.5; // 47.5% — center of 40–55%
  return {
    x: 50,
    y,
    // tee rendered width = scale * 55% of stage → ~0.42 ≈ shoulder-ish on full-body
    scale: 0.42,
    rotation: -2,
    opacity: 1,
  };
}

/** Alias used across the app for default worn pose */
export const DEFAULT_TEE_TRANSFORM: TeeTransform = computeDefaultTeeTransform();

