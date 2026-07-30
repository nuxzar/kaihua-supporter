# 块杰明·呼兰克林 Tee｜拯救开花计划

开花俱乐部粉丝互动周边体验。上传全身照，把 Tee 合成到身上，生成专属开花支持海报。

## 本地开发

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

## 替换真实 Tee 素材

把透明 PNG 放到同名路径即可，**无需改代码**：

```
public/assets/tee/kaihua-tee.png          # Tee 主体（透明底）
public/assets/logo/kaihua-logo.png
public/assets/stickers/flower.png
public/assets/stickers/dollar.png
public/assets/stickers/stamp.png
public/assets/stickers/doodle-arrow.png
```

统一配置：`src/lib/assets.ts`

## 技术栈

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Framer Motion
- Canvas
