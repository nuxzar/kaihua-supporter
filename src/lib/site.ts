import { ASSETS } from "@/lib/assets";

/** Canonical site URL — used for og:url and absolute share asset paths. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://bloom.oiiii.studio";

/** Default link-preview copy for WeChat / Open Graph crawlers. */
export const SHARE = {
  siteName: "SUPPORT BLOOM CLUB",
  title: "全民支持开花计划 · SUPPORT BLOOM CLUB",
  description:
    "块杰明·呼兰克林限定 TEE 赛博朋克版申领。上传照片，领取你的开花支持者身份卡。",
  ogImagePath: ASSETS.share.wechatOg,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: "全民支持开花计划 — 块杰明·呼兰克林限定 TEE 赛博朋克版申领",
} as const;
