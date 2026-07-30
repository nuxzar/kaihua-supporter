"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CropZoomSlider,
  PhotoCropper,
} from "@/components/editor/PhotoCropper";
import { PaperWindow } from "@/components/ds/PaperWindow";
import { SceneContent } from "@/components/scenes/SceneContent";
import { useWorkshopChrome } from "@/components/ui/WorkshopShell";
import {
  DEFAULT_PHOTO_CROP,
  exportCroppedPhoto,
  type PhotoCropTransform,
} from "@/lib/photo-crop";

type CropSceneProps = {
  imageUrl: string;
  onConfirm: (blob: Blob) => void;
  onBack: () => void;
};

/**
 * Composition desk — pan/zoom into a taped 3:4 frame, then hand off 1080×1440.
 */
export function CropScene({ imageUrl, onConfirm, onBack }: CropSceneProps) {
  const [crop, setCrop] = useState<PhotoCropTransform>(DEFAULT_PHOTO_CROP);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeUrl, setActiveUrl] = useState(imageUrl);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Reset crop when the source photo changes (render-time adjust).
  if (imageUrl !== activeUrl) {
    setActiveUrl(imageUrl);
    setCrop(DEFAULT_PHOTO_CROP);
    setError(null);
  }

  useEffect(() => {
    let cancelled = false;
    imageRef.current = null;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      if (!img.naturalWidth || !img.naturalHeight) {
        setError("照片加载失败，请返回重试");
        return;
      }
      imageRef.current = img;
    };
    img.onerror = () => {
      if (cancelled) return;
      imageRef.current = null;
      setError("照片加载失败，请返回重试");
    };
    img.src = imageUrl;
    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  const handleConfirm = useCallback(async () => {
    const img = imageRef.current;
    if (!img || busy) return;
    if (!img.naturalWidth || !img.naturalHeight) {
      setError("照片还没贴好，稍等再试");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const blob = await exportCroppedPhoto(img, crop);
      onConfirm(blob);
      // Stay busy until scene unmounts after navigation; unlock if parent keeps us mounted.
      setBusy(false);
    } catch (err) {
      console.error("exportCroppedPhoto failed", err);
      setError("构图导出失败，再试一次");
      setBusy(false);
    }
  }, [busy, crop, onConfirm]);

  useWorkshopChrome(
    {
      backLabel: "← 返回",
      onBack: busy ? undefined : onBack,
      title: "调整登记照",
      subtitle: "拖动照片调整位置，下方滑轮调整大小。",
      note: error ?? undefined,
      actions: [
        {
          id: "confirm",
          label: busy ? "裁切中…" : "调整好了，接着登记",
          onClick: () => {
            void handleConfirm();
          },
          disabled: busy || Boolean(error),
          variant: "primary" as const,
        },
      ],
    },
    [busy, error, handleConfirm, onBack],
  );

  return (
    <SceneContent align="stretch">
      <div className="scene-stack">
        <div className="scene-stage-slot min-h-0 flex-1">
          <PhotoCropper imageUrl={imageUrl} crop={crop} onChange={setCrop} />
        </div>

        <aside className="workshop-tools relative z-10 w-full">
          <PaperWindow title="工作台小提示" flat bodyClassName="!py-[var(--ds-pad-sm)]">
            <div className="space-y-2.5">
              <p className="font-hand text-sm leading-snug text-ink-soft">
                好好调整，让照片处于最佳状态！
              </p>
              <CropZoomSlider
                value={crop.zoom}
                disabled={busy}
                onChange={(zoom) => setCrop((c) => ({ ...c, zoom }))}
              />
            </div>
          </PaperWindow>
        </aside>
      </div>
    </SceneContent>
  );
}
