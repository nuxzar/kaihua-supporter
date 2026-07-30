"use client";

import type { ReactNode } from "react";

type PaperWindowProps = {
  children: ReactNode;
  title?: string;
  titleRight?: string;
  /** win-blue default; wine for brand / issue */
  tone?: "blue" | "wine";
  fill?: "paper" | "cream" | "deep";
  flat?: boolean;
  showTitleBar?: boolean;
  className?: string;
  bodyClassName?: string;
  titleClassName?: string;
  titleRightClassName?: string;
};

/**
 * OS-style hand-drawn window — world.ss0202.com HandDrawBox language.
 */
export function PaperWindow({
  children,
  title,
  titleRight,
  tone = "blue",
  fill = "paper",
  flat = false,
  showTitleBar = true,
  className = "",
  bodyClassName = "",
  titleClassName = "",
  titleRightClassName = "",
}: PaperWindowProps) {
  const fillMod =
    fill === "cream" ? "ds-window--cream" : fill === "deep" ? "ds-window--deep" : "";

  return (
    <div
      className={[
        "ds-window",
        flat ? "ds-window--flat" : "",
        fillMod,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div aria-hidden className="ds-window__grain" />

      {showTitleBar ? (
        <div
          className={[
            "ds-window__bar",
            tone === "wine" ? "ds-window__bar--wine" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div
            className={[
              "font-cn-pixel min-w-0 truncate text-base tracking-wide sm:text-lg",
              titleClassName,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {title}
          </div>
          {titleRight ? (
            <div
              className={[
                "font-pixel-lg shrink-0 text-sm tracking-wider text-white/90 sm:text-base",
                titleRightClassName,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {titleRight}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 border border-white/80 bg-[var(--ds-btn-pink)]" />
              <span className="inline-block h-3 w-3 border border-white/80 bg-[var(--ds-progress)]" />
              <span className="inline-block h-3 w-3 border border-white/80 bg-[var(--ds-desk)]" />
            </div>
          )}
        </div>
      ) : null}

      <div className={["ds-window__body", bodyClassName].filter(Boolean).join(" ")}>
        {children}
      </div>
    </div>
  );
}
