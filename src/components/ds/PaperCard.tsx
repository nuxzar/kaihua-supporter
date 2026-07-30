"use client";

import type { ReactNode } from "react";

type PaperCardProps = {
  children: ReactNode;
  /** cream default; board for photo stage; paper for masthead strips */
  tone?: "cream" | "board" | "paper" | "deep";
  grain?: boolean;
  className?: string;
  /** stretch to fill parent (absolute inset stage) */
  fill?: boolean;
  /** Skip sketch filter — needed when nesting HandButton (nested SVG filters break) */
  plain?: boolean;
};

/**
 * Flat paper plate — photo wells, thumbs, mastheads, chips.
 * Border / shadow / fill live only here.
 */
export function PaperCard({
  children,
  tone = "cream",
  grain = false,
  className = "",
  fill = false,
  plain = false,
}: PaperCardProps) {
  const toneClass =
    tone === "board"
      ? "ds-card--board"
      : tone === "paper"
        ? "ds-card--paper"
        : tone === "deep"
          ? "ds-card--deep"
          : "";

  return (
    <div
      className={[
        "ds-card",
        toneClass,
        fill ? "is-fill" : "",
        plain ? "ds-card--plain" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {grain ? <div aria-hidden className="ds-card__grain" /> : null}
      <div
        className={[
          "relative",
          grain || fill ? "z-[2]" : "",
          fill ? "h-full min-h-0" : "h-full",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
