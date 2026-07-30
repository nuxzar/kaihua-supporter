# Social share assets (WeChat / Open Graph)

Replace files in place — **keep filenames** — update `src/lib/site.ts` only if paths change.

## Required file

| Path | Purpose | Spec |
|------|---------|--------|
| `wechat-og.jpg` | Default link preview image | **1200×630 px**, JPG, ≤ 1 MB (WeChat recommends ≤ 300 KB) |

Optional duplicate: `wechat-og.png` (same layout, PNG) — metadata uses the JPG.

## WeChat crawler notes

- Image must be **JPG or PNG** (not WebP).
- URL must be **absolute HTTPS** — handled via `metadataBase` in `src/app/layout.tsx`.
- After replacing the image, re-share the link or use [WeChat share debugger](https://developers.weixin.qq.com/doc/offiaccount/en/Analytics/Analytics_API.html) / clear cache — WeChat caches previews aggressively.

## Design hints

- Cream paper `#f5ebd3`, ink `#1d1d1d`, accent `#8e1830`, enter green `#9fb589` (see `src/styles/design-system.css`).
- Include: 主标题「全民支持开花计划」、副标题 TEE 申领、英文 SUPPORT BLOOM CLUB、Tee 或支持者印章视觉。
- Safe area: keep text/logo inside ~40 px from edges; WeChat may crop slightly.

Config: `src/lib/site.ts` · Registry: `src/lib/assets.ts` (`share.wechatOg`).
