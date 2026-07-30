# Assets

Replace image files in place — **keep filenames** — no code changes needed.

Config: `src/lib/assets.ts`

## Structure

```
public/assets/
├── tee/           Tee PNG + soft shadow
├── logo/          Club logo
├── stickers/      Flower / dollar / stamp / doodle arrow
├── backgrounds/   Paper desk + issue desk textures
├── seals/         Certification seals
├── signatures/    Founder / hand signatures
├── badges/        LIMITED / serial accents
├── share/         WeChat / Open Graph preview (wechat-og.jpg)
└── fonts/         Optional brand fonts
```

## File map

| Path | Purpose | Spec hint |
|------|---------|-----------|
| `tee/kaihua-tee.webp` | Transparent Tee sticker | WebP with alpha |
| `logo/kaihua-logo.png` | Kaihua Club logo | Transparent PNG |
| `logo/bloom-club-mark.png` | BLOOM CLUB archive header mark | Transparent PNG |
| `stickers/flower.png` | Flower doodle | Small sticker |
| `stickers/dollar.png` | Dollar sticker | Small sticker |
| `stickers/stamp.png` | Red hand-stamp overlay | Round stamp, multiply-friendly |
| `stickers/doodle-arrow.png` | Hand-drawn arrow | Thin doodle |
| `backgrounds/paper-desk.png` | Paper grain / desk tile | Seamless-ish cream paper |
| `backgrounds/issue-desk.png` | Issue ceremony desk | Warm wood/paper plane |
| `seals/supporter-seal.png` | BLOOM VERIFIED SUPPORTER 2026 stamp | Terracotta round seal |
| `signatures/founder-signature.png` | Founder hand signature (小块 / 徐志胜) | Black ink, transparent bg |
| `badges/limited.png` | LIMITED ribbon/badge | High contrast, short word |
| `badges/serial-star.png` | Serial accent (optional) | Star / NO. mark |
| `share/wechat-og.jpg` | WeChat / OG link preview | 1200×630 JPG, ≤ 1 MB |
| `fonts/` | Optional brand fonts | App uses @fontsource today |

## Notes

- Prefer **hand-drawn / print-scan** look over slick digital UI.
- Stamp & seal assets should look good with `mix-blend-multiply`.
- Social share + collectible poster both pull from this registry.
