"use client";

import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { toPng } from "html-to-image";
import { CertCardPreview } from "@/components/ui/CertCardPreview";
import {
  composePosterCanvas,
  resolvePosterData,
  type ComposePosterOptions,
} from "@/lib/compose-poster-canvas";

export type { ComposePosterOptions };

const CAPTURE_WIDTH = 540;
/** Per-step budget (image/font wait, single DOM or canvas attempt). */
const STEP_TIMEOUT_MS = 8000;
/** Overall budget must cover a failed DOM attempt + canvas fallback. */
const COMPOSE_BUDGET_MS = 18000;

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        window.clearTimeout(timer);
        reject(err);
      },
    );
  });
}

function waitForImages(root: HTMLElement, timeoutMs = STEP_TIMEOUT_MS): Promise<void> {
  const imgs = [...root.querySelectorAll("img")];
  const loads = Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve, reject) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          if (img.complete && img.naturalWidth === 0) {
            reject(new Error("Image failed to load"));
            return;
          }
          function cleanup() {
            img.removeEventListener("load", onLoad);
            img.removeEventListener("error", onError);
          }
          function onLoad() {
            cleanup();
            if (img.naturalWidth > 0) resolve();
            else reject(new Error("Image failed to load"));
          }
          function onError() {
            cleanup();
            reject(new Error("Image failed to load"));
          }
          img.addEventListener("load", onLoad);
          img.addEventListener("error", onError);
        }),
    ),
  ).then(() => undefined);

  return withTimeout(loads, timeoutMs, "DOM image load timeout");
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

const CERT_PAPER = "#f7f5f0";

async function composePosterDom({
  photoUrl,
  transform,
  meta,
  data,
  width = CAPTURE_WIDTH,
}: ComposePosterOptions): Promise<string> {
  const poster = resolvePosterData(photoUrl, meta, data);
  const host = document.createElement("div");
  // Keep off-screen but fully painted — opacity:0 / z-index:-1 can blank captures
  host.setAttribute(
    "style",
    [
      "position:fixed",
      "left:-10000px",
      "top:0",
      `width:${width}px`,
      "pointer-events:none",
      "opacity:1",
      "z-index:0",
      "overflow:visible",
    ].join(";"),
  );
  document.body.appendChild(host);

  let root: Root | null = createRoot(host);
  try {
    flushSync(() => {
      root!.render(
        <div style={{ width: `${width}px` }}>
          <CertCardPreview
            photoUrl={photoUrl}
            transform={transform}
            data={poster}
            stamped
            exportMode
            className="!max-h-none !max-w-none w-full"
          />
        </div>,
      );
    });

    const card = host.querySelector(".cert-card") as HTMLElement | null;
    if (!card) throw new Error("Cert card mount failed");

    await waitForImages(card);
    if (document.fonts?.ready) {
      await withTimeout(
        document.fonts.ready.then(() => undefined),
        STEP_TIMEOUT_MS,
        "Font load timeout",
      );
    }
    await sleep(60);

    // Neutralize any remaining filters (html-to-image often breaks on SVG filters)
    card.style.filter = "none";
    card.querySelectorAll<HTMLElement>("*").forEach((el) => {
      if (el.style) el.style.filter = "none";
    });

    const pixelRatio = Math.min(3, Math.max(2, Math.round(1080 / width)));
    return await toPng(card, {
      cacheBust: true,
      pixelRatio,
      backgroundColor: CERT_PAPER,
      skipFonts: false,
      style: {
        transform: "none",
        filter: "none",
        maxWidth: "none",
        maxHeight: "none",
        width: `${width}px`,
      },
      filter: (node) => {
        if (!(node instanceof HTMLElement)) return true;
        const cls = node.className?.toString?.() ?? "";
        return !cls.includes("ds-window__grain");
      },
    });
  } finally {
    try {
      root?.unmount();
    } catch {
      // ignore
    }
    root = null;
    host.remove();
  }
}

async function composePosterWithFallback(
  options: ComposePosterOptions,
): Promise<string> {
  try {
    return await withTimeout(
      composePosterDom(options),
      STEP_TIMEOUT_MS,
      "DOM compose timeout",
    );
  } catch (err) {
    const detail =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : err && typeof err === "object" && "type" in err
            ? `Event:${String((err as { type?: string }).type)}`
            : String(err);
    console.warn(
      "[composePoster] DOM snapshot failed, using canvas fallback:",
      detail,
    );
    return withTimeout(
      composePosterCanvas(options),
      STEP_TIMEOUT_MS,
      "Canvas compose timeout",
    );
  }
}

/**
 * Prefer DOM snapshot of archive certificate (same layout/fonts as preview).
 * Falls back to canvas if snapshot fails — never blocks the ceremony forever.
 */
export async function composePoster(
  options: ComposePosterOptions,
): Promise<string> {
  return withTimeout(
    composePosterWithFallback(options),
    COMPOSE_BUDGET_MS,
    "Compose timeout",
  );
}
