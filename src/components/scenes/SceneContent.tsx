"use client";

import type { ReactNode } from "react";

type SceneContentProps = {
  children: ReactNode;
  /**
   * center — paper / card / form scenes (default)
   * stretch — editor desk tools that fill height
   */
  align?: "center" | "stretch";
  /** Allow vertical scroll inside the desk slot (upload etc.) */
  scroll?: boolean;
  className?: string;
};

/**
 * Unified scene body contract inside WorkshopShell / SceneContainer.
 * Scenes must not set 100vw / 100vh / competing max-width — shell owns width.
 */
export function SceneContent({
  children,
  align = "center",
  scroll = false,
  className = "",
}: SceneContentProps) {
  return (
    <div
      className={[
        "scene-content",
        align === "stretch" ? "scene-content--stretch" : "",
        scroll ? "scene-content--scroll" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
