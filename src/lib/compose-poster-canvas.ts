import { ASSETS } from "@/lib/assets";
import { canvasFont, loadCssFontStacks } from "@/lib/css-fonts";
import { TEE_WIDTH_FACTOR } from "@/lib/photo-stage";
import {
  POSTER_MISSION,
  POSTER_YEAR,
  formatIssuedOn,
  normalizeBloomIssueNo,
} from "@/lib/poster-storage";
import type { PosterData, PosterMeta, TeeTransform } from "@/types";

const IMAGE_LOAD_TIMEOUT_MS = 8000;

/** Zone fractions — match DOM `.cert-card__zone--*` (~70% photo mass). */
const ZONE_TOP = 0.09;
const ZONE_PHOTO = 0.7;

const SEAL_ROTATION_DEG = -15;
const FOOTER_TAGLINE = "让所有支持喜剧行业发展的人先富起来";

/** Load an image; rejects on network/decode error or timeout. */
export function loadImage(
  src: string,
  timeoutMs = IMAGE_LOAD_TIMEOUT_MS,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    let settled = false;
    let timer = 0;

    function settle(fn: () => void) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      fn();
    }

    timer = window.setTimeout(() => {
      settle(() => reject(new Error(`Image load timeout: ${src}`)));
    }, timeoutMs);

    img.onload = () => settle(() => resolve(img));
    img.onerror = () =>
      settle(() => reject(new Error(`Failed to load image: ${src}`)));
    img.src = src;
  });
}

export type ComposePosterOptions = {
  photoUrl: string;
  transform: TeeTransform;
  meta: PosterMeta;
  /** Preferred when available — overrides meta-derived fields */
  data?: PosterData;
  width?: number;
  height?: number;
  issuedOn?: string;
};

type FontStacks = Awaited<ReturnType<typeof loadCssFontStacks>>;

function resolvePosterData(
  photoUrl: string,
  meta: PosterMeta,
  data?: PosterData,
): PosterData {
  if (data) return data;
  const issueNo = normalizeBloomIssueNo(meta.serial || "");
  return {
    nickname: meta.supporterName?.trim() || "匿名开花人",
    memberNo: meta.memberNo || issueNo,
    issueNo,
    templateId: "archive",
    year: meta.year || POSTER_YEAR,
    photo: photoUrl,
    mission: meta.mission || POSTER_MISSION,
  };
}

/**
 * Canvas fallback when DOM snapshot fails.
 * Layout mirrors CertCardPreview archive certificate exactly.
 */
export async function composePosterCanvas({
  photoUrl,
  transform,
  meta,
  data,
  width = 1080,
  height = 1440,
  issuedOn,
}: ComposePosterOptions): Promise<string> {
  const poster = resolvePosterData(photoUrl, meta, data);
  const [photo, tee, seal, mark, signature, fonts] = await Promise.all([
    loadImage(photoUrl),
    loadImage(ASSETS.tee),
    loadImage(ASSETS.seals.supporter),
    loadImage(ASSETS.bloomClubMark),
    loadImage(ASSETS.founderSignature),
    loadCssFontStacks(),
  ]);

  try {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    drawCertificateCanvas(ctx, {
      width,
      height,
      photo,
      tee,
      seal,
      mark,
      signature,
      fonts,
      transform,
      poster,
      // Footer stamp: always current local YMD at compose time
      issuedOn: issuedOn || formatIssuedOn(new Date()),
    });

    return canvas.toDataURL("image/png");
  } catch (err) {
    const detail =
      err instanceof Error ? err.message : String(err ?? "unknown");
    throw new Error(`Canvas compose failed: ${detail}`);
  }
}

type DrawArgs = {
  width: number;
  height: number;
  photo: HTMLImageElement;
  tee: HTMLImageElement;
  seal: HTMLImageElement;
  mark: HTMLImageElement;
  signature: HTMLImageElement;
  fonts: FontStacks;
  transform: TeeTransform;
  poster: PosterData;
  issuedOn: string;
};

const PAPER = "#f7f5f0";
const INK = "#1d1d1d";

function zoneLayout(contentTop: number, contentH: number) {
  const topH = Math.round(contentH * ZONE_TOP);
  const midH = Math.round(contentH * ZONE_PHOTO);
  const bottomH = contentH - topH - midH;
  const topY = contentTop;
  const midY = topY + topH;
  const bottomY = midY + midH;
  return { topH, midH, bottomH, topY, midY, bottomY };
}

/** Centered 3:4 photo that fills available zone height (≈70% of card). */
function fitCenteredPhoto34(opts: {
  canvasWidth: number;
  stageTop: number;
  maxBottom: number;
  maxWidthRatio?: number;
}): { stageX: number; stageY: number; stageW: number; stageH: number } {
  const { canvasWidth, stageTop, maxBottom, maxWidthRatio = 0.84 } = opts;
  const availH = Math.max(1, maxBottom - stageTop);
  const maxW = canvasWidth * maxWidthRatio;
  let stageH = availH;
  let stageW = stageH * (3 / 4);
  if (stageW > maxW) {
    stageW = maxW;
    stageH = stageW * (4 / 3);
  }
  const stageX = (canvasWidth - stageW) / 2;
  const stageY = stageTop + (availH - stageH) / 2;
  return { stageX, stageY, stageW, stageH };
}

function drawCertificateCanvas(
  ctx: CanvasRenderingContext2D,
  {
    width,
    height,
    photo,
    tee,
    seal,
    mark,
    signature,
    fonts,
    transform,
    poster,
    issuedOn,
  }: DrawArgs,
) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, width, height);

  // Thin inset black border
  const borderInset = Math.round(width * 0.028);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(
    borderInset,
    borderInset,
    width - borderInset * 2,
    height - borderInset * 2,
  );

  const contentTop = borderInset + Math.round(height * 0.012);
  const contentBottom = height - borderInset - Math.round(height * 0.012);
  const contentH = contentBottom - contentTop;
  const { midH, bottomH, topY, midY, bottomY } = zoneLayout(
    contentTop,
    contentH,
  );
  const padX = Math.round(width * 0.055);

  // —— Header: club mark left / program right ——
  const markH = Math.round(height * 0.055);
  const markAspect = mark.naturalWidth / Math.max(1, mark.naturalHeight);
  const markW = Math.round(markH * markAspect);
  ctx.drawImage(mark, padX, topY + 6, markW, markH);

  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillStyle = INK;
  ctx.font = canvasFont(700, 22, fonts.pixel);
  ctx.fillText("BLOOM CLUB", width - padX, topY + 6);
  const ruleW = 200;
  ctx.beginPath();
  ctx.moveTo(width - padX - ruleW, topY + 34);
  ctx.lineTo(width - padX, topY + 34);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.font = canvasFont(500, 12, fonts.pixel);
  ctx.fillText("SUPPORTER PROGRAM", width - padX, topY + 42);
  ctx.font = canvasFont(700, 14, fonts.pixel);
  ctx.fillText("LIMITED EDITION", width - padX, topY + 72);

  // —— Photo (centered 3:4) ——
  const { stageX, stageY, stageW, stageH } = fitCenteredPhoto34({
    canvasWidth: width,
    stageTop: midY + 2,
    maxBottom: midY + midH - 2,
  });

  drawPhotoWithTee(
    ctx,
    photo,
    tee,
    transform,
    stageX,
    stageY,
    stageW,
    stageH,
    PAPER,
    INK,
  );

  // Red seal — straddles photo bottom-right corner (half on photo, half on paper)
  const sealSize = Math.round(stageH * 0.25);
  const sealCx = stageX + stageW;
  const sealCy = stageY + stageH;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.translate(sealCx, sealCy);
  ctx.rotate((SEAL_ROTATION_DEG * Math.PI) / 180);
  ctx.drawImage(seal, -sealSize / 2, -sealSize / 2, sealSize, sealSize);
  ctx.restore();

  // Vertical motto beside photo (right of frame) — mirrors DOM writing-mode stack
  const sideMotto = "everyone counts";
  const sideChars = [...sideMotto];
  const sideFontSize = 14;
  const sideLineH = Math.round(sideFontSize * 1.2);
  const sideX = stageX + stageW + Math.round(width * 0.018);
  const sideStartY =
    midY + midH / 2 - ((sideChars.length - 1) * sideLineH) / 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = INK;
  ctx.font = canvasFont(700, sideFontSize, fonts.pixel);
  sideChars.forEach((ch, i) => {
    if (ch === " ") return;
    ctx.fillText(ch, sideX, sideStartY + i * sideLineH);
  });

  // —— Bottom meta (compressed) ——
  const name = poster.nickname.trim() || "匿名开花人";
  const issueNo = poster.issueNo || poster.memberNo;
  const mission = poster.mission || POSTER_MISSION;
  const leftX = padX;
  // Extra gap under photo — mirrors DOM bottom-zone padding-top
  const infoTop = bottomY + Math.round(bottomH * 0.12);

  let y = infoTop;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = INK;

  ctx.font = canvasFont(700, 14, fonts.pixel);
  ctx.fillText("BLOOM MEMBER", leftX, y);
  y += 26;

  ctx.font = canvasFont(700, 14, fonts.pixel);
  ctx.fillText("ISSUE NO.", leftX, y);
  y += 20;
  ctx.font = canvasFont(700, 26, fonts.pixel);
  ctx.fillText(issueNo, leftX, y);
  y += 36;

  ctx.font = canvasFont(700, 14, fonts.pixel);
  ctx.fillText("OWNER:", leftX, y);
  y += 20;
  ctx.font = canvasFont(700, 24, fonts.cn);
  ctx.fillText(name, leftX, y);
  y += 36;

  ctx.font = canvasFont(700, 14, fonts.pixel);
  ctx.fillText("MISSION:", leftX, y);
  y += 20;
  ctx.font = canvasFont(700, 16, fonts.pixel);
  ctx.fillText(mission, leftX, y);

  // Footer row: Chinese tagline | date | founder signature
  const footerY = contentBottom - 6;
  ctx.textBaseline = "bottom";
  ctx.font = canvasFont(700, 13, fonts.cn);
  ctx.textAlign = "left";
  ctx.fillText(FOOTER_TAGLINE, leftX, footerY);
  ctx.font = canvasFont(500, 11, fonts.pixel);
  ctx.textAlign = "center";
  ctx.fillText(issuedOn, width / 2, footerY);

  const sigH = Math.round(height * 0.076);
  const sigAspect =
    signature.naturalWidth / Math.max(1, signature.naturalHeight);
  const sigW = Math.round(sigH * sigAspect);
  const sigX = width - padX - sigW;
  const sigY = footerY - sigH;
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(signature, sigX, sigY, sigW, sigH);
  ctx.restore();
}

function drawPhotoWithTee(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  tee: HTMLImageElement,
  transform: TeeTransform,
  stageX: number,
  stageY: number,
  stageW: number,
  stageH: number,
  frameFill: string,
  borderColor: string | null,
) {
  const framePad = borderColor ? 2 : 0;
  if (borderColor) {
    ctx.fillStyle = frameFill;
    ctx.fillRect(
      stageX - framePad,
      stageY - framePad,
      stageW + framePad * 2,
      stageH + framePad * 2,
    );
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(
      stageX - framePad,
      stageY - framePad,
      stageW + framePad * 2,
      stageH + framePad * 2,
    );
  } else {
    ctx.fillStyle = frameFill;
    ctx.fillRect(stageX, stageY, stageW, stageH);
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(stageX, stageY, stageW, stageH);
  ctx.clip();
  drawCoverImage(ctx, photo, stageX, stageY, stageW, stageH);

  const teeW = stageW * transform.scale * TEE_WIDTH_FACTOR;
  const teeH = teeW * (tee.naturalHeight / Math.max(1, tee.naturalWidth));
  const teeCx = stageX + (transform.x / 100) * stageW;
  const teeCy = stageY + (transform.y / 100) * stageH;

  ctx.save();
  ctx.translate(teeCx, teeCy);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.drawImage(tee, -teeW / 2, -teeH / 2, teeW, teeH);
  ctx.restore();
  ctx.restore();
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const photoRatio = photo.naturalWidth / photo.naturalHeight;
  const stageRatio = w / h;
  let dw = w;
  let dh = h;
  let dx = x;
  let dy = y;
  if (photoRatio > stageRatio) {
    dh = h;
    dw = dh * photoRatio;
    dx = x - (dw - w) / 2;
  } else {
    dw = w;
    dh = dw / photoRatio;
    dy = y - (dh - h) / 2;
  }
  ctx.drawImage(photo, dx, dy, dw, dh);
}

export { resolvePosterData };
