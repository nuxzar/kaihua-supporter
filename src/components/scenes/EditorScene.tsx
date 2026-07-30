"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PreviewStage } from "@/components/editor/PreviewStage";
import { TeeEditor } from "@/components/editor/TeeEditor";
import { PaperWindow } from "@/components/ds/PaperWindow";
import { SceneContent } from "@/components/scenes/SceneContent";
import { useWorkshopChrome } from "@/components/ui/WorkshopShell";
import type { TeeTransform } from "@/types";

type EditorSceneProps = {
  photoUrl: string;
  supporterName: string;
  serial: string;
  transform: TeeTransform;
  onChange: (next: TeeTransform) => void;
  onNext: () => void;
  onBack: () => void;
};

type WorkshopPhase = "photo-in" | "making" | "ready";

function RollingSubtitle({ lines }: { lines: string[] }) {
  const [index, setIndex] = useState(0);
  const safeLines = useMemo(
    () => (lines.length > 0 ? lines : [""]),
    [lines],
  );

  useEffect(() => {
    if (safeLines.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % safeLines.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [safeLines]);

  const line = safeLines[index % safeLines.length] ?? safeLines[0];

  return (
    <div className="editor-roll relative mx-auto h-[1.4em] max-w-full overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={line}
          initial={{ y: "70%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-70%", opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="truncate text-center"
        >
          {line}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/**
 * 开花限定 Tee 制作中 — more stage space, rolling masthead tips.
 */
export function EditorScene({
  photoUrl,
  supporterName,
  serial,
  transform,
  onChange,
  onNext,
  onBack,
}: EditorSceneProps) {
  const displayName = supporterName.trim() || "匿名开花人";
  const [phase, setPhase] = useState<WorkshopPhase>("photo-in");
  const [phasePhoto, setPhasePhoto] = useState(photoUrl);

  // Restart the making sequence when the cropped photo changes.
  if (photoUrl !== phasePhoto) {
    setPhasePhoto(photoUrl);
    setPhase("photo-in");
  }

  useEffect(() => {
    const makingTimer = window.setTimeout(() => setPhase("making"), 720);
    const readyTimer = window.setTimeout(() => setPhase("ready"), 1600);
    return () => {
      window.clearTimeout(makingTimer);
      window.clearTimeout(readyTimer);
    };
  }, [photoUrl]);

  const showTee = phase === "making" || phase === "ready";
  const interactive = phase === "ready";

  const rollLines = useMemo(() => {
    if (phase !== "ready") {
      return ["你的限定版本正在制作", "贴纸粘贴中…", `支持者：${displayName}`, `编号：${serial}`];
    }
    return [
      "仅此一件：把 Tee 挪到胸口",
      `支持者：${displayName}`,
      `编号：${serial}`,
      "限定制作 · 全球仅此一份",
      "调好了就去发行",
    ];
  }, [phase, displayName, serial]);

  useWorkshopChrome(
    {
      backLabel: interactive ? "← 调整构图" : null,
      onBack: interactive ? onBack : undefined,
      title: "开花限定 Tee 制作中",
      subtitle: <RollingSubtitle key={phase} lines={rollLines} />,
      note: undefined,
      actions: [
        {
          id: "generate",
          label: "进入发行仪式 →",
          onClick: onNext,
          disabled: !interactive,
          variant: "primary",
        },
      ],
    },
    [phase, interactive, onNext, onBack, rollLines],
  );

  return (
    <SceneContent align="stretch">
      <div className="scene-stack">
        <div className="scene-stage-slot min-h-0 flex-1">
          <PreviewStage
            overlay={
              <AnimatePresence>
                {phase === "making" ? (
                  <motion.p
                    key="making"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute inset-x-3 bottom-3 z-50 border-2 border-[var(--ds-ink)] bg-[var(--ds-progress)] px-2 py-1.5 text-center font-hand text-sm text-ink shadow-[var(--ds-shadow-press)]"
                  >
                    你的限定版本正在制作
                  </motion.p>
                ) : null}
              </AnimatePresence>
            }
          >
            <TeeEditor
              photoUrl={photoUrl}
              transform={transform}
              onChange={onChange}
              locked={!interactive}
              photoEnter
              showTee={showTee}
            />
          </PreviewStage>
        </div>

        <aside className="workshop-tools relative z-10 w-full">
          <PaperWindow title="限定版微调（仅此一件）" flat bodyClassName="!py-[var(--ds-pad-sm)]">
            <div className="space-y-2.5">
              <ToolControl
                label="大小"
                value={transform.scale}
                min={0.25}
                max={1.4}
                step={0.01}
                display={`${Math.round(transform.scale * 100)}%`}
                disabled={!interactive}
                onChange={(scale) => onChange({ ...transform, scale, opacity: 1 })}
              />
              <ToolControl
                label="旋转"
                value={transform.rotation}
                min={-30}
                max={30}
                step={1}
                display={`${Math.round(transform.rotation)}°`}
                disabled={!interactive}
                onChange={(rotation) => onChange({ ...transform, rotation, opacity: 1 })}
              />
            </div>
          </PaperWindow>
        </aside>
      </div>
    </SceneContent>
  );
}

function ToolControl({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
  disabled = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`block ${disabled ? "opacity-40" : ""}`}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="font-cn-pixel text-[0.95rem] text-ink">{label}</span>
        <span className="font-pixel text-[11px] tabular-nums text-muted">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none bg-[var(--ds-paper-deep)] accent-[var(--ds-ink)] disabled:cursor-not-allowed"
      />
    </label>
  );
}
