"use client";

import type { ReactNode } from "react";
import { PaperCard } from "@/components/ds/PaperCard";
import { PHOTO_STAGE_ASPECT } from "@/lib/photo-stage";

type PreviewStageProps = {
  children: ReactNode;
  overlay?: ReactNode;
  className?: string;
};

/**
 * Centers a fixed-aspect photo stage so Tee placement matches upload / compose.
 */
export function PreviewStage({ children, overlay, className = "" }: PreviewStageProps) {
  return (
    <div
      className={`preview-stage relative flex h-full min-h-0 w-full max-h-full items-center justify-center overflow-hidden ${className}`}
    >
      <div
        className="photo-stage relative max-h-full max-w-full"
        style={{
          aspectRatio: PHOTO_STAGE_ASPECT,
          height: "100%",
          width: "auto",
        }}
      >
        <PaperCard tone="board" grain fill>
          <div className="absolute inset-0">{children}</div>
          {overlay ? (
            <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
              {overlay}
            </div>
          ) : null}
        </PaperCard>
      </div>
    </div>
  );
}
