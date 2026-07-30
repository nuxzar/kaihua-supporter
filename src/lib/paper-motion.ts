"use client";

import { useEffect, useState } from "react";

export const PAPER_EASE = [0.22, 1.15, 0.36, 1] as const;

/** Matches globals.css mobile GPU overrides (narrow or touch/coarse). */
export const MOBILE_MOTION_MQ =
  "(max-width: 639px), ((hover: none) and (pointer: coarse))";

export function matchMobileMotionProfile(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_MOTION_MQ).matches;
}

/** Touch / narrow viewports — lighter slide transitions (translate only). */
export function useMobileMotionProfile(): boolean {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MOTION_MQ);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return mobile;
}

export function paperTransition(mobile: boolean) {
  return {
    duration: mobile ? 0.52 : 0.65,
    ease: PAPER_EASE,
  };
}

type SlideX = "0%" | "100%" | "-100%";

/** Paper push — desktop adds slight scale; mobile uses translate-only for GPU. */
export function paperSlide(mobile: boolean, x: SlideX) {
  const atRest = x === "0%";
  if (mobile) {
    return { x, opacity: 1 as const };
  }
  return {
    x,
    scale: atRest ? 1 : 0.98,
    opacity: 1 as const,
  };
}
