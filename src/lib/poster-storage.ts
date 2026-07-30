import type { PosterTemplateId } from "@/types";

const COUNTER_KEY = "bloom_issue_counter";

export const POSTER_YEAR = "2026";
export const POSTER_MISSION = "SUPPORT BLOOM CLUB";
export const POSTER_MISSION_CN = "拯救开花计划";

/** Single archive certificate — legacy multi-template ids collapse to archive. */
export function isTemplateId(value: unknown): value is PosterTemplateId {
  return value === "archive" || value === "street" || value === "artist";
}

/** Always archive (Street / Artist retired). */
export function pickRandomTemplateId(): PosterTemplateId {
  return "archive";
}

/** Always archive — sticky multi-template picking removed. */
export function getOrAssignTemplateId(): PosterTemplateId {
  return "archive";
}

/** BLOOM- + 7-digit zero pad. */
export function formatIssueNo(n: number): string {
  const safe = Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
  return `BLOOM-${String(safe).padStart(7, "0")}`;
}

/** Digits from a BLOOM-####### (or legacy) serial. */
export function parseIssueDigits(serial: string): number {
  const digits = serial.replace(/\D/g, "");
  const n = parseInt(digits, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/** Issued-on stamp: YYYY.MM.DD */
export function formatIssuedOn(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

/**
 * Claim the next issue number (increments localStorage counter).
 * Call once when compose starts — not on crop/editor restart.
 */
export function nextIssueNo(): string {
  if (typeof window === "undefined") return formatIssueNo(1);
  try {
    const raw = window.localStorage.getItem(COUNTER_KEY);
    const current = Math.max(0, parseInt(raw || "0", 10) || 0);
    const next = current + 1;
    window.localStorage.setItem(COUNTER_KEY, String(next));
    return formatIssueNo(next);
  } catch {
    return formatIssueNo(1);
  }
}

/** Normalize any stored/legacy serial into BLOOM-#######. Never returns bare "BLOOM-". */
export function normalizeBloomIssueNo(serial: string): string {
  const raw = serial.trim();
  if (!raw) return formatIssueNo(1);
  if (/^BLOOM-\d{7}$/i.test(raw)) {
    return raw.replace(/^bloom-/i, "BLOOM-");
  }
  const digits = raw.replace(/\D/g, "");
  if (digits) return formatIssueNo(parseInt(digits, 10) || 1);
  return formatIssueNo(1);
}
