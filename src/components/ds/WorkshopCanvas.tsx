"use client";

import type { ReactNode } from "react";

type WorkshopCanvasProps = {
  children: ReactNode;
};

/**
 * Fixed white grid desk — one shared space for every scene.
 */
export function WorkshopCanvas({ children }: WorkshopCanvasProps) {
  return (
    <div className="workshop-canvas">
      <div aria-hidden className="workshop-canvas__grid" />
      <div aria-hidden className="workshop-canvas__grain" />
      {children}
    </div>
  );
}

type WorkshopFrameProps = {
  children: ReactNode;
  wide?: boolean;
  center?: boolean;
  className?: string;
};

/**
 * Content column on the desk — mobile-first max width.
 */
export function WorkshopFrame({
  children,
  wide = false,
  center = false,
  className = "",
}: WorkshopFrameProps) {
  return (
    <div
      className={[
        "workshop-frame",
        wide ? "workshop-frame--wide" : "",
        center ? "workshop-frame--center" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
