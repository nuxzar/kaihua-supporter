/**
 * Central asset registry.
 * Replace files under /public/assets/ — keep the same filenames — no code changes needed.
 *
 * Layout:
 *   tee/          Tee PNG + soft shadow
 *   logo/         Club logo
 *   stickers/     Flower / dollar / stamp / doodle
 *   backgrounds/  Paper & issue desk textures
 *   seals/        Certification seals
 *   signatures/   Founder / hand signatures
 *   badges/       LIMITED / serial accents
 *   fonts/        Optional brand fonts
 */
export const ASSETS = {
  tee: "/assets/tee/kaihua-tee.png",
  logo: "/assets/logo/kaihua-logo.png",
  /** Oiiii studio mark — homepage decorative chip */
  oiiiiStudio: "/assets/logo/oiiii-studio.png",
  /** BLOOM / 开花 club mark for archive certificate header */
  bloomClubMark: "/assets/logo/bloom-club-mark.png",
  /** Founder hand signature (小块 / 徐志胜) — certificate footer */
  founderSignature: "/assets/signatures/founder-signature.png",
  stickers: {
    flower: "/assets/stickers/flower.png",
    dollar: "/assets/stickers/dollar.png",
    stamp: "/assets/stickers/stamp.png",
    arrow: "/assets/stickers/doodle-arrow.png",
  },
  backgrounds: {
    paperDesk: "/assets/backgrounds/paper-desk.png",
    issueDesk: "/assets/backgrounds/issue-desk.png",
  },
  seals: {
    supporter: "/assets/seals/supporter-seal.png",
  },
  badges: {
    limited: "/assets/badges/limited.png",
    serialStar: "/assets/badges/serial-star.png",
  },
} as const;
