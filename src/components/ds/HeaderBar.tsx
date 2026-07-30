"use client";

import type { ReactNode } from "react";
import { PaperCard } from "@/components/ds/PaperCard";
import { TextButton } from "@/components/ds/TextButton";

type HeaderBarProps = {
  backLabel?: string | null;
  onBack?: () => void;
  /** Optional quiet mark on the right (keep sparse) */
  mark?: string | null;
  title?: ReactNode;
  subtitle?: ReactNode;
};

/**
 * Shared workshop chrome — back + optional mark + paper masthead.
 */
export function HeaderBar({
  backLabel = "← 返回",
  onBack,
  mark = null,
  title,
  subtitle,
}: HeaderBarProps) {
  const showBack = Boolean(backLabel && onBack);
  const showMasthead = Boolean(title || subtitle);

  return (
    <header className="relative z-10 shrink-0 pb-2">
      <div className="flex min-h-[1.25rem] items-center justify-between gap-3">
        {showBack ? (
          <TextButton onClick={onBack}>{backLabel}</TextButton>
        ) : (
          <span aria-hidden className="ds-text-btn invisible">
            ·
          </span>
        )}
        {mark ? <p className="font-pixel text-[10px] tracking-[0.14em] text-muted">{mark}</p> : null}
      </div>

      {showMasthead ? (
        <PaperCard tone="paper" className="mt-2 !overflow-visible">
          <div className="px-3 py-2 text-center">
            {title ? (
              <div className="font-cn-pixel text-[1.1rem] leading-tight text-ink sm:text-[1.2rem]">
                {title}
              </div>
            ) : null}
            {subtitle ? (
              <div className="font-hand mt-0.5 text-sm leading-snug text-ink-soft sm:text-[0.95rem]">
                {subtitle}
              </div>
            ) : null}
          </div>
        </PaperCard>
      ) : null}
    </header>
  );
}
