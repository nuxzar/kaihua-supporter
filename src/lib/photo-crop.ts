import { PHOTO_CROP_HEIGHT, PHOTO_CROP_WIDTH } from "@/lib/photo-stage";

/** Zoom relative to cover (1 = exact cover, no blank edges). */
export type PhotoCropTransform = {
  zoom: number;
  /** -1…1 — image center vs frame center along free pan axis */
  panX: number;
  panY: number;
};

export const DEFAULT_PHOTO_CROP: PhotoCropTransform = {
  zoom: 1,
  panX: 0,
  panY: 0,
};

export const PHOTO_CROP_ZOOM_MIN = 1;
export const PHOTO_CROP_ZOOM_MAX = 3;

export type PhotoCropLayout = {
  displayW: number;
  displayH: number;
  offsetX: number;
  offsetY: number;
  scale: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Minimum scale so image covers the frame (object-cover). */
export function coverScale(
  imageW: number,
  imageH: number,
  frameW: number,
  frameH: number,
): number {
  if (imageW <= 0 || imageH <= 0 || frameW <= 0 || frameH <= 0) return 1;
  return Math.max(frameW / imageW, frameH / imageH);
}

/**
 * Layout image inside a crop frame with cover-only pan/zoom.
 * Image top-left is (offsetX, offsetY) in frame coordinates.
 */
export function layoutCrop(
  imageW: number,
  imageH: number,
  frameW: number,
  frameH: number,
  crop: PhotoCropTransform,
): PhotoCropLayout {
  const zoom = clamp(crop.zoom, PHOTO_CROP_ZOOM_MIN, PHOTO_CROP_ZOOM_MAX);
  const scale = coverScale(imageW, imageH, frameW, frameH) * zoom;
  const displayW = imageW * scale;
  const displayH = imageH * scale;
  const maxPanX = Math.max(0, (displayW - frameW) / 2);
  const maxPanY = Math.max(0, (displayH - frameH) / 2);
  const panX = clamp(crop.panX, -1, 1);
  const panY = clamp(crop.panY, -1, 1);
  const cx = frameW / 2 + panX * maxPanX;
  const cy = frameH / 2 + panY * maxPanY;
  return {
    displayW,
    displayH,
    offsetX: cx - displayW / 2,
    offsetY: cy - displayH / 2,
    scale,
  };
}

/** Convert a pixel drag delta into pan deltas for the current layout. */
export function panDeltaFromDrag(
  imageW: number,
  imageH: number,
  frameW: number,
  frameH: number,
  crop: PhotoCropTransform,
  dx: number,
  dy: number,
): Pick<PhotoCropTransform, "panX" | "panY"> {
  const { displayW, displayH } = layoutCrop(imageW, imageH, frameW, frameH, crop);
  const maxPanX = Math.max(0, (displayW - frameW) / 2);
  const maxPanY = Math.max(0, (displayH - frameH) / 2);
  return {
    panX: maxPanX > 0 ? clamp(crop.panX + dx / maxPanX, -1, 1) : 0,
    panY: maxPanY > 0 ? clamp(crop.panY + dy / maxPanY, -1, 1) : 0,
  };
}

/**
 * Render crop into a fixed 1080×1440 canvas (JPEG blob by default).
 * Source rect is derived from the same cover/pan/zoom math as the UI.
 */
export async function exportCroppedPhoto(
  image: HTMLImageElement,
  crop: PhotoCropTransform,
  options?: { mimeType?: string; quality?: number; width?: number; height?: number },
): Promise<Blob> {
  const width = options?.width ?? PHOTO_CROP_WIDTH;
  const height = options?.height ?? PHOTO_CROP_HEIGHT;
  const mimeType = options?.mimeType ?? "image/jpeg";
  const quality = options?.quality ?? 0.92;
  const imageW = image.naturalWidth;
  const imageH = image.naturalHeight;

  if (!Number.isFinite(imageW) || !Number.isFinite(imageH) || imageW <= 0 || imageH <= 0) {
    throw new Error("Crop source image has no dimensions");
  }

  const { offsetX, offsetY, scale } = layoutCrop(imageW, imageH, width, height, crop);
  if (!Number.isFinite(scale) || scale <= 0) {
    throw new Error("Invalid crop scale");
  }

  const sourceX = -offsetX / scale;
  const sourceY = -offsetY / scale;
  const sourceW = width / scale;
  const sourceH = height / scale;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = "#e8d9b8";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceW,
    sourceH,
    0,
    0,
    width,
    height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to encode cropped photo"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

export function revokeIfBlobUrl(url: string | null | undefined) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}
