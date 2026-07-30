"use client";

import type { ReactNode } from "react";

export type WorkSpaceProps = {
  children: ReactNode;
  /** Optional top chrome (outside sliding scene content when used at app level) */
  header?: ReactNode;
  /** Optional bottom action strip */
  footer?: ReactNode;
  /** Wider column for editor desk */
  wide?: boolean;
  /**
   * Content alignment inside the main area.
   * center — home / card scenes
   * stretch — editor / full-height tool scenes
   */
  contentAlign?: "center" | "stretch";
  className?: string;
};

/**
 * Unified Kaihua visual space.
 * Owns: grid background, shell max-width (900 / 1100 animated), chrome slots.
 * Scenes use SceneContent — never 100vh / 100vw / competing max-width.
 */
export function WorkSpace({
  children,
  header,
  footer,
  wide = false,
  contentAlign = "center",
  className = "",
}: WorkSpaceProps) {
  return (
    <div className={["workspace", className].filter(Boolean).join(" ")}>
      <div aria-hidden className="workspace__grid" />
      <div aria-hidden className="workspace__grain" />

      <div
        className={[
          "workspace__shell",
          wide ? "workspace__shell--wide" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {header ? <div className="workspace__top">{header}</div> : null}

        <div
          className={[
            "workspace__content",
            contentAlign === "stretch" ? "workspace__content--stretch" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {children}
        </div>

        {footer ? <div className="workspace__bottom">{footer}</div> : null}
      </div>
    </div>
  );
}
