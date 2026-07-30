"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ASSETS } from "@/lib/assets";

/** Home desk decor only — tee / seals / poster assets load on demand after loader exits. */
const CORE_IMAGE_URLS: string[] = [
  ASSETS.oiiiiStudio,
  ASSETS.stickers.dollar,
  ASSETS.stickers.flower,
];

const ASSET_TIMEOUT_MS = 8000;

/** Stage weights sum to 1 — progress is real, not a fake timer */
const WEIGHT = {
  mount: 0.08,
  fonts: 0.22,
  assets: 0.7,
} as const;

const paperTransition = {
  duration: 0.65,
  ease: [0.22, 1.15, 0.36, 1] as const,
};

type GlobalLoaderProps = {
  /** Fired when the paper begins sliding left — mount the app to enter from right */
  onExitStart: () => void;
  /** Fired after the loader paper has fully left */
  onFinished?: () => void;
};

function preloadImage(url: string, timeoutMs: number): Promise<"ok" | "fail"> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (result: "ok" | "fail") => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const img = new Image();
    const timer = window.setTimeout(() => done("fail"), timeoutMs);

    img.onload = () => {
      window.clearTimeout(timer);
      done("ok");
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      done("fail");
    };
    img.src = url;

    if (img.complete && img.naturalWidth > 0) {
      window.clearTimeout(timer);
      done("ok");
    }
  });
}

/**
 * Full-viewport BLOOM CLUB paper loader.
 * Gates first paint until fonts + core assets are ready (with timeout fallbacks).
 */
export function GlobalLoader({ onExitStart, onFinished }: GlobalLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "done" | "exit">("loading");
  const [visible, setVisible] = useState(true);
  const exitStartedRef = useRef(false);
  const finishedRef = useRef(false);
  const progressRef = useRef(0);

  const bump = (next: number) => {
    const clamped = Math.min(100, Math.max(progressRef.current, Math.round(next)));
    progressRef.current = clamped;
    setProgress(clamped);
  };

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Stage 1 — React mounted (this effect running)
      bump(WEIGHT.mount * 100);

      // Stage 2 — fonts
      try {
        if (document.fonts?.ready) {
          await Promise.race([
            document.fonts.ready,
            new Promise<void>((r) => setTimeout(r, ASSET_TIMEOUT_MS)),
          ]);
        }
      } catch {
        // continue — system fonts still paint
      }
      if (cancelled) return;
      bump((WEIGHT.mount + WEIGHT.fonts) * 100);

      // Stage 3 — core images (each failure/timeout still counts as done)
      const total = CORE_IMAGE_URLS.length;
      let completed = 0;
      await Promise.all(
        CORE_IMAGE_URLS.map(async (url) => {
          await preloadImage(url, ASSET_TIMEOUT_MS);
          if (cancelled) return;
          completed += 1;
          const assetPortion = (completed / total) * WEIGHT.assets * 100;
          bump((WEIGHT.mount + WEIGHT.fonts) * 100 + assetPortion);
        }),
      );

      if (cancelled) return;
      bump(100);
      setPhase("done");

      // Brief stamp moment, then slide exit
      await new Promise((r) => setTimeout(r, 420));
      if (cancelled) return;
      setPhase("exit");
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (phase !== "exit" || exitStartedRef.current) return;
    exitStartedRef.current = true;
    onExitStart();
  }, [phase, onExitStart]);

  const pct = Math.min(100, Math.max(0, progress));

  return (
    <AnimatePresence
      onExitComplete={() => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        onFinished?.();
      }}
    >
      {visible ? (
        <motion.div
          key="global-loader"
          className="global-loader safe-pad"
          role="status"
          aria-live="polite"
          aria-busy={phase === "loading"}
          initial={{ x: "0%", scale: 1, opacity: 1 }}
          animate={
            phase === "exit"
              ? { x: "-100%", scale: 0.98, opacity: 1 }
              : { x: "0%", scale: 1, opacity: 1 }
          }
          exit={{ x: "-100%", scale: 0.98, opacity: 1 }}
          transition={paperTransition}
          onAnimationComplete={() => {
            if (phase === "exit") setVisible(false);
          }}
        >
          <div aria-hidden className="global-loader__grid" />
          <div aria-hidden className="global-loader__grain" />
          <span aria-hidden className="global-loader__tape global-loader__tape--a" />
          <span aria-hidden className="global-loader__tape global-loader__tape--b" />

          <div className="global-loader__card">
            <p className="global-loader__brand font-cn-pixel">SUPPORT BLOOM CLUB</p>

            {phase === "loading" ? (
              <>
                <p className="global-loader__hint font-hand">
                  正在加载「SUPPORT BLOOM CLUB」……
                </p>
                <p
                  className="global-loader__pct font-cn-pixel"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                >
                  {pct}%
                </p>
                <div className="global-loader__track" aria-hidden>
                  <div
                    className="global-loader__fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="global-loader__done font-cn-pixel">认证完成 ✓</p>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
