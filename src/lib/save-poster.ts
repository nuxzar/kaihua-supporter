import { MOBILE_MOTION_MQ } from "@/lib/paper-motion";

export function dataUrlToBlob(dataUrl: string): Blob {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) throw new Error("Invalid data URL");
  const header = dataUrl.slice(0, comma);
  const data = dataUrl.slice(comma + 1);
  const mime = /data:(.*?);/.exec(header)?.[1] || "image/png";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

/** Desktop / fallback — trigger browser file download. */
export function downloadPosterFile(dataUrl: string, filename: string) {
  const blob = dataUrlToBlob(dataUrl);
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
}

function isMobileSaveContext(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_MOTION_MQ).matches;
}

function canShareImageFile(file: File): boolean {
  if (typeof navigator.share !== "function") return false;
  if (typeof navigator.canShare !== "function") return false;
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

/**
 * Mobile — Web Share with image file (iOS: 「存储图像」→ Photos; Android: gallery / save).
 * Desktop — `<a download>`.
 */
export async function savePosterToDevice(
  dataUrl: string,
  filename: string,
): Promise<"shared" | "downloaded"> {
  const blob = dataUrlToBlob(dataUrl);
  const file = new File([blob], filename, {
    type: blob.type || "image/png",
  });

  if (isMobileSaveContext() && canShareImageFile(file)) {
    await navigator.share({ files: [file] });
    return "shared";
  }

  downloadPosterFile(dataUrl, filename);
  return "downloaded";
}
