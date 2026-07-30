"use client";

import type { ReactNode } from "react";
import { HandButton } from "@/components/ds/HandButton";

export type ActionBarItem = {
  id: string;
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
};

type ActionBarProps = {
  items: ActionBarItem[];
  note?: ReactNode;
  className?: string;
};

/**
 * Bottom desk actions — same paper frame language as HeaderBar masthead.
 * Sketch plate is a grid sibling of HandButton (not an ancestor) so nested
 * SVG filters don't cancel each other out.
 */
export function ActionBar({ items, note, className = "" }: ActionBarProps) {
  if (items.length === 0) return null;

  return (
    <div className={["ds-actionbar", className].filter(Boolean).join(" ")}>
      <div className="ds-actionbar__frame">
        <div aria-hidden className="ds-actionbar__stroke" />
        <div className="ds-actionbar__body">
          {note ? (
            <p className="font-hand mb-2.5 text-center text-sm text-ink-soft">
              {note}
            </p>
          ) : null}
          <div className="mx-auto flex w-full flex-wrap items-center justify-center gap-2">
            {items.map((item) => (
              <HandButton
                key={item.id}
                variant={item.variant ?? "primary"}
                disabled={item.disabled}
                onClick={item.onClick}
                className={`min-w-[6.5rem] !text-sm sm:min-w-[7.5rem] sm:!text-base ${
                  items.length >= 3 ? "flex-[1_1_40%] sm:flex-none" : "flex-1 sm:flex-none"
                }`}
              >
                {item.label}
              </HandButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
