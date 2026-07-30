"use client";

import { ASSETS } from "@/lib/assets";
import { TEE_WIDTH_FACTOR } from "@/lib/photo-stage";
import type { TeeTransform } from "@/types";

type PosterPhotoStageProps = {
  photoUrl: string;
  transform: TeeTransform;
  className?: string;
  /** Thin black frame around the photo. */
  bordered?: boolean;
  frameClassName?: string;
};

/**
 * Shared photo + Tee overlay — fills the certificate photo frame (3:4).
 * Same transform math as the Tee editor.
 * Seal is rendered by CertCardPreview as a sibling overlay (can overflow the frame).
 */
export function PosterPhotoStage({
  photoUrl,
  transform,
  className = "",
  bordered = true,
  frameClassName = "",
}: PosterPhotoStageProps) {
  return (
    <div
      className={`cert-card__photo-stage relative h-full w-full min-h-0 min-w-0 overflow-hidden bg-[var(--cert-paper,var(--ds-paper-deep))] ${
        bordered ? "border border-[var(--ds-ink)]" : ""
      } ${frameClassName} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div
        className="absolute"
        style={{
          left: `${transform.x}%`,
          top: `${transform.y}%`,
          width: `${transform.scale * TEE_WIDTH_FACTOR * 100}%`,
          transform: `translate(-50%, -50%) rotate(${transform.rotation}deg)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ASSETS.tee}
          alt=""
          className="tee-fabric relative w-full"
          draggable={false}
        />
      </div>
    </div>
  );
}
