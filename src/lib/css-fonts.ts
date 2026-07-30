/**
 * Resolve live CSS font stacks (after cascade) for canvas text.
 * Canvas cannot use CSS variables — probe rendered utility classes instead.
 */

export type CssFontStacks = {
  cn: string;
  pixel: string;
  hand: string;
};

function probeFontFamily(className: string): string {
  const probe = document.createElement("span");
  probe.className = className;
  probe.textContent = "开花 Aa";
  probe.setAttribute(
    "style",
    "position:fixed;left:-9999px;top:0;visibility:hidden;pointer-events:none;font-size:48px;",
  );
  document.body.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily || "sans-serif";
  probe.remove();
  return family;
}

async function ensureFont(weight: string, sizePx: number, family: string) {
  if (typeof document === "undefined" || !document.fonts?.load) return;
  try {
    await document.fonts.load(`${weight} ${sizePx}px ${family}`);
  } catch {
    // Font may already be available via system fallback
  }
}

/** Read `.font-cn-pixel` / `.font-poster-mono` / `.font-hand` as the browser resolved them. */
export async function loadCssFontStacks(): Promise<CssFontStacks> {
  // Warm YaHei / CJK + IBM Plex Mono used by --ds-font-* tokens
  await Promise.all([
    ensureFont("400", 48, "Microsoft YaHei"),
    ensureFont("400", 48, "微软雅黑"),
    ensureFont("400", 48, "PingFang SC"),
    ensureFont("400", 48, "IBM Plex Mono"),
    ensureFont("700", 48, "IBM Plex Mono"),
  ]);

  const cn = probeFontFamily("font-cn-pixel");
  const posterMono = probeFontFamily("font-poster-mono");
  const pixelFallback = probeFontFamily("font-pixel");
  const pixel = posterMono.includes("IBM Plex Mono")
    ? posterMono
    : pixelFallback;
  const hand = probeFontFamily("font-hand");

  await Promise.all([
    ensureFont("700", 48, cn),
    ensureFont("400", 32, cn),
    ensureFont("700", 32, pixel),
    ensureFont("500", 28, pixel),
    ensureFont("400", 28, pixel),
    ensureFont("400", 32, hand),
  ]);

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  return { cn, pixel, hand };
}

export function canvasFont(
  weight: string | number,
  sizePx: number,
  family: string,
): string {
  return `${weight} ${sizePx}px ${family}`;
}
