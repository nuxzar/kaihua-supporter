"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HandButton } from "@/components/ds/HandButton";
import { PaperCard } from "@/components/ds/PaperCard";
import { SceneContent } from "@/components/scenes/SceneContent";
import { SheetDrawer } from "@/components/ui/SheetDrawer";
import { useWorkshopChrome } from "@/components/ui/WorkshopShell";
import {
  formatBloomIssueNo,
  pickShareCopy,
  XIAOHONGSHU_BLOOM_PROFILE_URL,
} from "@/lib/constants";
import { downloadPosterFile, savePosterToDevice } from "@/lib/save-poster";

type DoneSceneProps = {
  posterUrl: string;
  serial: string;
};

type Drawer = "none" | "share" | "tee";

const SUBTITLE_INTERVAL_MS = 3500;

function AlternatingSubtitle({ lines }: { lines: string[] }) {
  const [index, setIndex] = useState(0);
  const safeLines = useMemo(
    () => (lines.length > 0 ? lines : [""]),
    [lines],
  );

  useEffect(() => {
    if (safeLines.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % safeLines.length);
    }, SUBTITLE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [safeLines]);

  const line = safeLines[index % safeLines.length] ?? safeLines[0];

  return (
    <div className="relative mx-auto h-[1.4em] max-w-full overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={line}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="truncate text-center"
        >
          {line}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export function DoneScene({ posterUrl, serial }: DoneSceneProps) {
  const [drawer, setDrawer] = useState<Drawer>("none");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareCopy = useMemo(() => pickShareCopy(serial), [serial]);
  const issueNo = useMemo(() => formatBloomIssueNo(serial), [serial]);
  const subtitleLines = useMemo(
    () => [
      "块哥 24 小时在剧场门口等候莅临",
      `你的编号 · ${issueNo} · 全球仅此一份`,
    ],
    [issueNo],
  );

  const handleSavePoster = async () => {
    if (saving || !posterUrl) return;
    setSaving(true);
    const filename = `bloom-club-${issueNo}-${Date.now()}.png`;
    try {
      await savePosterToDevice(posterUrl, filename);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      try {
        downloadPosterFile(posterUrl, filename);
      } catch {
        const link = document.createElement("a");
        link.href = posterUrl;
        link.download = `bloom-club-${issueNo}.png`;
        link.target = "_blank";
        link.rel = "noopener";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } finally {
      window.setTimeout(() => setSaving(false), 600);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareCopy);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  useWorkshopChrome(
    {
      backLabel: null,
      title: "现已加入开花俱乐部",
      subtitle: <AlternatingSubtitle lines={subtitleLines} />,
      note: undefined,
      actions: [
        {
          id: "share",
          label: "晒出我的身份",
          onClick: () => setDrawer("share"),
          variant: "primary",
        },
        {
          id: "save",
          label: saving ? "保存中…" : "保存证明",
          onClick: () => void handleSavePoster(),
          disabled: saving,
          variant: "secondary",
        },
        {
          id: "tee",
          label: "获得实体 Tee",
          onClick: () => setDrawer("tee"),
          variant: "ghost",
        },
      ],
    },
    [subtitleLines, saving, posterUrl],
  );

  return (
    <>
      <SceneContent align="stretch">
        <div className="scene-stage-slot flex items-center justify-center">
          <div className="done-poster relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={posterUrl}
              alt={`开花支持者证明 ${issueNo}`}
              className="done-poster__img"
              draggable={false}
            />
          </div>
        </div>
      </SceneContent>

      <SheetDrawer open={drawer === "share"} title="晒出我的身份" onClose={() => setDrawer("none")}>
        <div className="space-y-3 font-hand text-base leading-relaxed text-ink">
          <p>证明到手了，晒出去才算真正加入。</p>
          <p className="text-ink-soft">
            保存证明，分享到朋友圈、小红书之类地方去！
          </p>
        </div>
        <PaperCard tone="cream" className="ds-pad-sm mt-4">
          <p className="font-hand text-base leading-relaxed whitespace-pre-line">{shareCopy}</p>
        </PaperCard>
        <div className="mt-4 flex flex-col ds-gap-sm">
          <HandButton onClick={() => void handleCopy()}>
            {copied ? "已复制！" : "复制文案"}
          </HandButton>
          <HandButton
            variant="secondary"
            disabled={saving}
            onClick={() => void handleSavePoster()}
          >
            {saving ? "保存中…" : "先保存证明"}
          </HandButton>
        </div>
      </SheetDrawer>

      <SheetDrawer
        open={drawer === "tee"}
        title="获得实体 Tee"
        onClose={() => setDrawer("none")}
        showCloseLabel={false}
      >
        <div className="space-y-3 text-center font-hand text-base leading-relaxed text-ink">
          <p>想穿上真正的那件？</p>
          <p>
            去开花俱乐部看小块演出专场
            <br />
            就能获得这件美金 Tee 了
            <br />
            另外更多小块原创 Tee 可以选择！
          </p>
          <p className="text-ink-soft">
            想了解更多的话小程序里搜索：开花脱口秀票务
          </p>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <HandButton variant="secondary" onClick={() => setDrawer("none")}>
            知道了，继续开花
          </HandButton>
          <a
            href={XIAOHONGSHU_BLOOM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ds-btn ds-btn--secondary"
          >
            去开花小红书看看
          </a>
        </div>
      </SheetDrawer>
    </>
  );
}
