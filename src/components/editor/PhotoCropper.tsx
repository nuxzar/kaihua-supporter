"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { PaperCard } from "@/components/ds/PaperCard";
import { Tape } from "@/components/ui/Tape";
import {
  DEFAULT_PHOTO_CROP,
  layoutCrop,
  panDeltaFromDrag,
  PHOTO_CROP_ZOOM_MAX,
  PHOTO_CROP_ZOOM_MIN,
  type PhotoCropTransform,
} from "@/lib/photo-crop";
import { PHOTO_STAGE_ASPECT } from "@/lib/photo-stage";

type PhotoCropperProps = {
  imageUrl: string;
  crop: PhotoCropTransform;
  onChange: (next: PhotoCropTransform) => void;
  className?: string;
};

/**
 * Workshop photo composition — 3:4 taped frame, cover-only pan/zoom.
 */
export function PhotoCropper({
  imageUrl,
  crop,
  onChange,
  className = "",
}: PhotoCropperProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const cropRef = useRef(crop);
  const dragRef = useRef<{
    pointerId: number;
    lastX: number;
    lastY: number;
  } | null>(null);

  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [frameSize, setFrameSize] = useState({ w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const [activeUrl, setActiveUrl] = useState(imageUrl);

  // Reset layout measurements when the source image changes (render-time adjust).
  if (imageUrl !== activeUrl) {
    setActiveUrl(imageUrl);
    setNatural({ w: 0, h: 0 });
  }

  useEffect(() => {
    cropRef.current = crop;
  }, [crop]);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (w <= 0 || h <= 0) {
        setNatural({ w: 0, h: 0 });
        return;
      }
      setNatural({ w, h });
      onChange({ ...DEFAULT_PHOTO_CROP });
    };
    img.onerror = () => {
      if (!cancelled) setNatural({ w: 0, h: 0 });
    };
    img.src = imageUrl;
    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
    // Reset crop only when the source image changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: avoid reset loops from onChange identity
  }, [imageUrl]);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setFrameSize({ w: rect.width, h: rect.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      const zoom = Math.min(
        PHOTO_CROP_ZOOM_MAX,
        Math.max(PHOTO_CROP_ZOOM_MIN, cropRef.current.zoom + delta),
      );
      onChange({ ...cropRef.current, zoom });
    };
    el.addEventListener("wheel", onNativeWheel, { passive: false });
    return () => el.removeEventListener("wheel", onNativeWheel);
  }, [onChange]);

  const layout =
    natural.w > 0 && natural.h > 0 && frameSize.w > 0 && frameSize.h > 0
      ? layoutCrop(natural.w, natural.h, frameSize.w, frameSize.h, crop)
      : null;

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!layout) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      lastX: e.clientX,
      lastY: e.clientY,
    };
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (natural.w <= 0 || frameSize.w <= 0) return;
    const dx = e.clientX - drag.lastX;
    const dy = e.clientY - drag.lastY;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    const nextPan = panDeltaFromDrag(
      natural.w,
      natural.h,
      frameSize.w,
      frameSize.h,
      cropRef.current,
      dx,
      dy,
    );
    onChange({ ...cropRef.current, ...nextPan });
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
      setDragging(false);
    }
  };

  const ready = Boolean(layout);

  return (
    <div
      className={`photo-cropper relative flex h-full min-h-0 w-full max-h-full items-center justify-center ${className}`}
    >
      <div
        ref={frameRef}
        className={`photo-stage relative max-h-full max-w-full transition-[transform,box-shadow] duration-150 ${
          dragging ? "z-10 scale-[1.015] shadow-[5px_5px_0_0_rgba(29,29,29,0.28)]" : ""
        }`}
        style={{
          aspectRatio: PHOTO_STAGE_ASPECT,
          height: "100%",
          width: "auto",
        }}
      >
        <Tape color="yellow" rotate={-10} className="-left-1 -top-1" width="3.6rem" />
        <Tape color="pink" rotate={12} className="-right-1 top-2" width="3.2rem" />
        <Tape color="blue" rotate={-6} className="-bottom-1 left-3" width="3.4rem" />

        <PaperCard tone="board" grain fill>
          <div
            role="img"
            aria-label="拖动照片调整构图"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className={`absolute inset-0 overflow-hidden bg-[var(--ds-paper-deep)] select-none touch-none ${
              ready ? "cursor-grab active:cursor-grabbing" : "cursor-wait"
            }`}
          >
            {layout ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="待构图照片"
                draggable={false}
                className="pointer-events-none absolute max-w-none"
                style={{
                  width: layout.displayW,
                  height: layout.displayH,
                  left: layout.offsetX,
                  top: layout.offsetY,
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center font-hand text-sm text-ink-soft">
                照片贴上中…
              </div>
            )}

            <div
              aria-hidden
              className="pointer-events-none absolute inset-2 border-2 border-dashed border-[color-mix(in_srgb,var(--ds-ink)_45%,transparent)]"
            />
          </div>
        </PaperCard>
      </div>
    </div>
  );
}

type CropZoomSliderProps = {
  value: number;
  onChange: (zoom: number) => void;
  disabled?: boolean;
};

export function CropZoomSlider({ value, onChange, disabled = false }: CropZoomSliderProps) {
  const setZoom = useCallback(
    (zoom: number) => {
      onChange(
        Math.min(PHOTO_CROP_ZOOM_MAX, Math.max(PHOTO_CROP_ZOOM_MIN, zoom)),
      );
    },
    [onChange],
  );

  return (
    <label className={`block ${disabled ? "opacity-40" : ""}`}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="font-cn-pixel text-[0.95rem] text-ink">远近</span>
        <span className="font-pixel text-[11px] tabular-nums text-muted">
          {Math.round(value * 100)}%
        </span>
      </div>
      <input
        type="range"
        min={PHOTO_CROP_ZOOM_MIN}
        max={PHOTO_CROP_ZOOM_MAX}
        step={0.01}
        value={value}
        disabled={disabled}
        onChange={(e) => setZoom(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none bg-[var(--ds-paper-deep)] accent-[var(--ds-ink)] disabled:cursor-not-allowed"
      />
    </label>
  );
}
