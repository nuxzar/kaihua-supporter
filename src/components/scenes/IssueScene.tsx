"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PaperCard } from "@/components/ds/PaperCard";
import { PaperWindow } from "@/components/ds/PaperWindow";
import { SceneContent } from "@/components/scenes/SceneContent";
import { useWorkshopChrome } from "@/components/ui/WorkshopShell";
import { ASSETS } from "@/lib/assets";
import { pickIssueEasterEgg } from "@/lib/constants";
import {
  POSTER_MISSION,
  POSTER_YEAR,
  formatIssueNo,
  nextIssueNo,
  parseIssueDigits,
} from "@/lib/poster-storage";
import type { PosterData, PosterMeta, TeeTransform } from "@/types";

type IssueSceneProps = {
  photoUrl: string;
  transform: TeeTransform;
  meta: PosterMeta;
  onMetaChange: (next: PosterMeta) => void;
  onGenerated: (dataUrl: string) => void;
  onBack: () => void;
};

/** Identity ceremony: register → serial → stamp → paper eject → Done */
type CeremonyPhase = "register" | "serial" | "stamp" | "eject" | "error";

const COMPOSE_FAIL_MESSAGE = "照片加载失败，请重新生成";
const PLACEHOLDER_SERIAL = "BLOOM-·······";

function buildPosterData(
  photoUrl: string,
  meta: PosterMeta,
  issueNo: string,
): PosterData {
  return {
    nickname: meta.supporterName.trim() || "匿名开花人",
    memberNo: meta.memberNo || issueNo,
    issueNo,
    templateId: "archive",
    year: meta.year || POSTER_YEAR,
    photo: photoUrl,
    mission: meta.mission || POSTER_MISSION,
  };
}

export function IssueScene({
  photoUrl,
  transform,
  meta,
  onMetaChange,
  onGenerated,
  onBack,
}: IssueSceneProps) {
  const [phase, setPhase] = useState<CeremonyPhase>("register");
  const [displaySerial, setDisplaySerial] = useState(PLACEHOLDER_SERIAL);
  const [lockedIssueNo, setLockedIssueNo] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ejectDone, setEjectDone] = useState(false);
  const [issueEgg, setIssueEgg] = useState(() => pickIssueEasterEgg());
  /** Stops ceremony timers from overwriting compose failure. */
  const composeFailedRef = useRef(false);
  const metaRef = useRef(meta);

  useEffect(() => {
    metaRef.current = meta;
  }, [meta]);

  // Claim issue number once when compose starts — lock for ceremony + Done.
  useEffect(() => {
    let cancelled = false;
    composeFailedRef.current = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setDownloadUrl(null);
      setError(null);
    });

    void (async () => {
      try {
        const current = metaRef.current;
        const issueNo = nextIssueNo();
        if (cancelled) return;

        const lockedMeta: PosterMeta = {
          ...current,
          serial: issueNo,
          templateId: "archive",
          memberNo: issueNo,
          year: current.year || POSTER_YEAR,
          mission: current.mission || POSTER_MISSION,
        };
        setLockedIssueNo(issueNo);
        onMetaChange(lockedMeta);

        const posterData = buildPosterData(photoUrl, lockedMeta, issueNo);
        const { composePoster } = await import("@/lib/compose-poster");
        const url = await composePoster({
          photoUrl,
          transform,
          meta: lockedMeta,
          data: posterData,
        });
        if (!cancelled) setDownloadUrl(url);
      } catch (err) {
        console.error("composePoster failed", err);
        if (!cancelled) {
          composeFailedRef.current = true;
          setError(COMPOSE_FAIL_MESSAGE);
          setPhase("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // Claim + compose once per IssueScene mount (photo/transform/name changes remount via parent).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoUrl, transform, meta.supporterName]);

  const issueNo = lockedIssueNo || meta.serial || PLACEHOLDER_SERIAL;

  // Ceremony timeline
  useEffect(() => {
    if (!lockedIssueNo) return;

    let cancelled = false;
    let serialInterval = 0;
    const timers: number[] = [];
    const stopIfFailed = () => cancelled || composeFailedRef.current;

    // Roll toward the locked sequential issue — never a separate random serial.
    const target = parseIssueDigits(lockedIssueNo);
    const start = Math.max(1, target - 96);

    queueMicrotask(() => {
      if (stopIfFailed()) return;
      setPhase("register");
      setDisplaySerial(formatIssueNo(start));
      setEjectDone(false);
      setIssueEgg(pickIssueEasterEgg());
    });

    // 1) Register identity
    timers.push(
      window.setTimeout(() => {
        if (stopIfFailed()) return;
        setPhase("serial");

        // 2) Serial roll — climbs to the same BLOOM-####### used for compose
        let n = start;
        const step = Math.max(1, Math.ceil((target - start) / 16));
        serialInterval = window.setInterval(() => {
          if (stopIfFailed()) {
            window.clearInterval(serialInterval);
            return;
          }
          n = Math.min(target, n + step);
          setDisplaySerial(formatIssueNo(n));
          if (n >= target) {
            window.clearInterval(serialInterval);
            setDisplaySerial(lockedIssueNo);

            // 3) Stamp — linger so the seal is readable before eject
            setPhase("stamp");
            timers.push(
              window.setTimeout(() => {
                if (stopIfFailed()) return;
                // 4) Paper eject — ejectDone is set by the eject animation
                setPhase("eject");
                // Fallback if animation callback never fires
                timers.push(
                  window.setTimeout(() => {
                    if (!stopIfFailed()) setEjectDone(true);
                  }, 2800),
                );
              }, 3200),
            );
          }
        }, 80);
      }, 1100),
    );

    return () => {
      cancelled = true;
      window.clearInterval(serialInterval);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [lockedIssueNo]);

  // Auto enter Done after paper lands + a short dwell (compose must be ready)
  useEffect(() => {
    if (phase === "error") return;
    if (!ejectDone || !downloadUrl) return;
    const t = window.setTimeout(() => {
      onGenerated(downloadUrl);
    }, 4600);
    return () => window.clearTimeout(t);
  }, [ejectDone, downloadUrl, onGenerated, phase]);

  useWorkshopChrome(
    {
      backLabel: phase === "error" ? "← 返回调整" : null,
      onBack: phase === "error" ? onBack : undefined,
      title: "开花身份发行仪式",
      subtitle:
        phase === "register"
          ? "正在登记你的开花身份"
          : phase === "serial"
            ? "编号印刷中"
            : phase === "stamp"
              ? "盖章认证中"
              : phase === "eject"
                ? "身份卡出纸中"
                : error || "发行台暂停",
      note:
        phase === "error"
          ? "请返回重试"
          : phase === "eject" && !downloadUrl
            ? "身份卡装订中…"
            : phase === "eject"
              ? issueEgg
              : phase === "serial"
                ? `即将锁定 · ${issueNo}`
                : "请勿走开，仪式进行中",
      actions:
        phase === "error"
          ? [
              {
                id: "retry",
                label: "返回重试",
                onClick: onBack,
                variant: "primary" as const,
              },
            ]
          : [],
    },
    [phase, error, ejectDone, downloadUrl, onBack, issueEgg, issueNo],
  );

  return (
    <SceneContent align="stretch">
      <div className="scene-stage-slot">
        <div className="issue-printer relative flex h-full w-full max-w-[36rem] flex-col">
          <PaperWindow
            title="开花发行机"
            tone="wine"
            flat
            className="flex min-h-0 flex-1 flex-col"
            bodyClassName="!flex !min-h-0 !flex-1 !flex-col !overflow-hidden !p-0"
          >
            {/* Machine head / status */}
            <div className="relative z-10 shrink-0 border-b-2 border-[var(--ds-ink)] bg-[var(--ds-paper-soft)] px-4 py-3 text-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={phase}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.28 }}
                  className="font-cn-pixel text-[1.05rem] text-ink"
                >
                  {phase === "register" && "正在登记你的开花身份"}
                  {phase === "serial" && "编号滚动中…"}
                  {phase === "stamp" && "BLOOM 支持者认证"}
                  {phase === "eject" && "身份卡出纸中"}
                  {phase === "error" && (error || "发行失败")}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Printer belly */}
            <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-4 py-4">
              <AnimatePresence mode="wait">
                {(phase === "register" || phase === "serial") && (
                  <motion.div
                    key="serial-board"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="w-full max-w-xs"
                  >
                    <PaperCard tone="cream" className="ds-pad text-center">
                      <p className="font-cn-pixel mb-2 text-[0.85rem] tracking-wide text-ink-soft">
                        编号印刷台
                      </p>
                      <p className="font-poster-mono text-xl font-bold tracking-wider text-ink sm:text-2xl">
                        {phase === "register" ? PLACEHOLDER_SERIAL : displaySerial}
                      </p>
                      {phase === "register" ? (
                        <p className="font-hand mt-3 text-sm text-ink-soft">
                          登记台正在核对身份…
                        </p>
                      ) : (
                        <p className="font-hand mt-3 text-sm text-ink-soft">
                          印刷滚轮转动中
                        </p>
                      )}
                    </PaperCard>
                  </motion.div>
                )}

                {phase === "stamp" && (
                  <motion.div
                    key="stamp"
                    className="flex flex-col items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      initial={{ scale: 2.4, opacity: 0, rotate: -22, y: -56 }}
                      animate={{ scale: 1, opacity: 1, rotate: -12, y: 0 }}
                      transition={{
                        type: "tween",
                        duration: 0.95,
                        ease: [0.22, 1.1, 0.36, 1],
                      }}
                      className="relative"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ASSETS.seals.supporter}
                        alt=""
                        className="h-32 w-32 object-contain opacity-90 mix-blend-multiply sm:h-36 sm:w-36"
                        draggable={false}
                      />
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.85, duration: 0.45 }}
                      className="font-cn-pixel mt-4 text-lg text-accent"
                    >
                      BLOOM VERIFIED
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.15, duration: 0.4 }}
                      className="font-hand mt-1 text-sm text-ink-soft"
                    >
                      印章已落下 · {issueNo}
                    </motion.p>
                  </motion.div>
                )}

                {phase === "eject" && (
                  <motion.div
                    key="eject"
                    className="relative flex h-full min-h-0 w-full flex-col items-center overflow-hidden"
                  >
                    {!downloadUrl ? (
                      <p className="font-hand mt-10 text-sm text-ink-soft">
                        身份卡装订中…
                      </p>
                    ) : (
                      /* Slot + paper — shared width rail; paper tucks under slot lip */
                      <div className="issue-paper-rail relative flex h-full min-h-0 w-full max-w-[min(100%,28rem)] flex-col items-stretch sm:max-w-[32rem]">
                        <div
                          aria-hidden
                          className="issue-paper-rail__slot relative z-30 h-3.5 w-full shrink-0 border-2 border-[var(--ds-ink)] bg-[var(--ds-ink)] shadow-[var(--ds-shadow-press)]"
                        />
                        <div
                          aria-hidden
                          className="pointer-events-none absolute left-0 right-0 top-3 z-20 h-8 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--ds-ink)_22%,transparent),transparent)]"
                        />
                        <div className="issue-paper-rail__well relative z-10 flex min-h-0 flex-1 items-start justify-center overflow-hidden">
                          <motion.div
                            className="flex h-full max-h-full w-full items-start justify-center"
                            initial={{ y: "-108%", rotate: 1.2 }}
                            animate={{ y: "0%", rotate: -0.8 }}
                            transition={{
                              type: "tween",
                              duration: 1.55,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            onAnimationComplete={() => setEjectDone(true)}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={downloadUrl}
                              alt={`开花支持者证明 ${issueNo}`}
                              className="issue-eject-poster shadow-[var(--ds-shadow)]"
                              draggable={false}
                            />
                          </motion.div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {phase === "error" && (
                  <motion.p
                    key="err"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-cn-pixel text-accent"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Machine foot — paper tray */}
            <div
              aria-hidden
              className="relative z-10 flex shrink-0 items-center justify-center gap-2 border-t-2 border-[var(--ds-ink)] bg-[var(--ds-paper)] px-3 py-2"
            >
              <span className="h-2 w-2 rounded-full bg-[var(--ds-enter)]" />
              <span className="font-hand text-[0.78rem] text-muted">
                手作出纸 · 盖章认证 · 非印刷厂
              </span>
            </div>
          </PaperWindow>
        </div>
      </div>
    </SceneContent>
  );
}
