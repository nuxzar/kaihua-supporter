/**
 * Shared portrait photo stage — upload / crop / editor / cert / compose must match.
 * Aspect is width:height = 3:4 (full-body friendly).
 */
export const PHOTO_STAGE_ASPECT = "3 / 4" as const;

/** height = width * PHOTO_STAGE_HEIGHT_RATIO */
export const PHOTO_STAGE_HEIGHT_RATIO = 4 / 3;

/** Crop export canvas — same 3:4 as PHOTO_STAGE_ASPECT */
export const PHOTO_CROP_WIDTH = 1080;
export const PHOTO_CROP_HEIGHT = 1440;

/** Tee render width = scale * TEE_WIDTH_FACTOR * stageWidth (editor + canvas) */
export const TEE_WIDTH_FACTOR = 0.55;

/**
 * Fit a 3:4 photo stage inside a max box; centers horizontally when width shrinks.
 */
export function fitPhotoStage(opts: {
  canvasWidth: number;
  stageTop: number;
  maxBottom: number;
  sideInset: number;
}): { stageX: number; stageY: number; stageW: number; stageH: number } {
  const { canvasWidth, stageTop, maxBottom, sideInset } = opts;
  const maxW = Math.max(1, canvasWidth - sideInset * 2);
  const maxH = Math.max(1, maxBottom - stageTop);

  let stageW = maxW;
  let stageH = Math.round(stageW * PHOTO_STAGE_HEIGHT_RATIO);
  if (stageH > maxH) {
    stageH = maxH;
    stageW = Math.round(stageH / PHOTO_STAGE_HEIGHT_RATIO);
  }

  const stageX = Math.round((canvasWidth - stageW) / 2);
  return { stageX, stageY: stageTop, stageW, stageH };
}
