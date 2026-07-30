"use client";

/** Brief desk placeholder while a lazy scene chunk loads. */
export function SceneChunkFallback() {
  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center p-6">
      <p className="font-hand text-sm text-ink-soft">纸张翻页中…</p>
    </div>
  );
}
