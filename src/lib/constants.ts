import { ASSETS } from "@/lib/assets";
import { normalizeBloomIssueNo } from "@/lib/poster-storage";

/** @deprecated Prefer ASSETS.tee — kept for existing imports */
export const TEE_SRC = ASSETS.tee;
/** @deprecated Prefer ASSETS.logo */
export const LOGO_SRC = ASSETS.logo;

export { DEFAULT_TEE_TRANSFORM, computeDefaultTeeTransform } from "@/lib/tee-placement";

export const SLOGANS = [
  "今天也要努力开花",
  "笑是生产力",
  "开花人人有责",
  "精神状态领先现实",
  "穿上 Tee，心情开花",
  "支持开花，从一件 Tee 开始",
  "块杰明说：你也可以开花",
] as const;

/** Shown once when the cert card pops out of the issue ceremony */
export const ISSUE_EASTER_EGGS = [
  "恭喜，你的精神状态已正式开花。",
  "这张卡不保值，但很有纪念意义。",
  "工作人员表示：贴得还行。",
  "警告：可能会突然想笑。",
  "本编号全球独一无二（大概）。",
  "实体 Tee 还在演出现场等你。",
  "收藏卡已出炉，请勿暴晒（真的）。",
  "今日份限定周边，精神版。",
] as const;

export function pickSlogan(): string {
  return SLOGANS[Math.floor(Math.random() * SLOGANS.length)] ?? SLOGANS[0];
}

/** @deprecated Use nextIssueNo() from poster-storage — no KH- issues. */
export function makeSerial(): string {
  return "BLOOM-0000000";
}

/** Poster ISSUE NO. → BLOOM-####### (7-digit). */
export function formatBloomIssueNo(serial: string): string {
  return normalizeBloomIssueNo(serial);
}

export function pickIssueEasterEgg(): string {
  return (
    ISSUE_EASTER_EGGS[Math.floor(Math.random() * ISSUE_EASTER_EGGS.length)] ??
    ISSUE_EASTER_EGGS[0]
  );
}

export function pickShareCopy(serial?: string): string {
  const issueNo = formatBloomIssueNo(serial ?? "");
  return `我现在也是有本杰明呼兰克林美金 Tee 的人啦！
虽然是赛博朋克版，但不妨碍我继续支持开花俱乐部！
我的全球专属编号是 ${issueNo}`;
}

/** 开花俱乐部小红书主页 */
export const XIAOHONGSHU_BLOOM_PROFILE_URL =
  "https://www.xiaohongshu.com/user/profile/6533b2ba0000000006005af3?xsec_token=YBFujQkMXZIzvRA2mMgVDVJoG4wEy0twaoajCac7NAWAc=&xsec_source=app_share&xhsshare=CopyLink&shareRedId=OD87RjQ1STo2NzUyOTgwNjg0OTc7PDlM&apptime=1785416375&share_id=b7629b77a93e4f4f9f6758e5d5d19402";
