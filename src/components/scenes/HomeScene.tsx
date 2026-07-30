"use client";

import { HandButton } from "@/components/ds/HandButton";
import { PaperCard } from "@/components/ds/PaperCard";
import { SceneContent } from "@/components/scenes/SceneContent";
import { useWorkshopChrome } from "@/components/ui/WorkshopShell";
import { ASSETS } from "@/lib/assets";

type HomeSceneProps = {
  onNext: () => void;
};

/**
 * 开花支持计划总部 — desk HQ, not a tool splash.
 * Decor is static / non-interactive; only the sticker CTA advances.
 */
export function HomeScene({ onNext }: HomeSceneProps) {
  useWorkshopChrome(
    {
      backLabel: null,
      title: "全民支持开花计划",
      subtitle: "块杰明·呼兰克林限定 TEE 赛博朋克版申领",
      actions: [],
    },
    [],
  );

  return (
    <SceneContent align="stretch">
      <div className="scene-stage-slot relative">
        <div className="home-desk relative h-full w-full max-w-[36rem] overflow-hidden">
          {/* Static desk props */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {/* Dollar print draft */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ASSETS.stickers.dollar}
              alt=""
              className="absolute top-[8%] right-[6%] w-[4.5rem] rotate-[12deg] opacity-90 sm:w-20"
              draggable={false}
            />

            {/* Flower / doodle */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ASSETS.stickers.flower}
              alt=""
              className="absolute top-[10%] left-[5%] w-11 rotate-[-18deg] opacity-85 sm:w-12"
              draggable={false}
            />

            {/* Tape strips */}
            <span className="home-tape home-tape--yellow absolute top-[6%] left-[28%] w-16 rotate-[-8deg]" />
            <span className="home-tape home-tape--blue absolute top-[22%] right-[18%] w-14 rotate-[14deg]" />
            <span className="home-tape home-tape--pink absolute bottom-[38%] left-[8%] w-12 rotate-[-22deg]" />

            {/* Marker */}
            <span className="home-marker absolute right-[10%] top-[42%] rotate-[28deg]" />
          </div>

          {/* Hero Tee + narrative + sticker CTA */}
          <div className="relative z-10 flex h-full min-h-0 flex-col items-center justify-center px-4 py-4 sm:py-6">
            <div className="home-tee-wiggle relative w-full max-w-[24rem] sm:max-w-[30rem]">
              <span className="home-tape home-tape--yellow absolute -top-2 left-1/2 z-20 w-16 -translate-x-1/2 rotate-[-3deg] sm:w-20" />
              <PaperCard tone="cream" className="ds-pad-sm sm:ds-pad-md">
                {/* White paper mat — Tee PNG is transparent */}
                <div className="home-tee-mat mx-auto w-full max-w-[22rem]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ASSETS.tee}
                    alt="块杰明·呼兰克林 Tee"
                    className="tee-fabric mx-auto h-auto w-full max-h-[min(52dvh,22rem)] object-contain sm:max-h-[min(58dvh,26rem)]"
                    draggable={false}
                  />
                </div>
              </PaperCard>
            </div>

            <p className="font-hand mt-4 max-w-[18rem] shrink-0 text-center text-[0.95rem] leading-[1.65] text-ink-soft sm:mt-5 sm:text-[1.02rem]">
              全球已经超过 100 亿人关注开花俱乐部
              <br />
              在全平台搜索 #拯救开花计划
              <br />
              追踪这部大型古装玄幻友情商战综艺
            </p>

            {/*
              Three-column grid: Oiiii left (decorative), CTA in the true center
              (matching right spacer = chip width).
            */}
            <div className="home-action-row mt-4 grid w-[calc(100%+1.5rem)] max-w-none shrink-0 -mx-3 grid-cols-[2.5rem_1fr_2.5rem] items-center px-1 sm:mt-6 sm:w-[calc(100%+2rem)] sm:-mx-4 sm:grid-cols-[2.75rem_1fr_2.75rem]">
              <span
                aria-hidden
                className="home-oiiii-chip justify-self-start"
              >
                <span className="home-oiiii-chip__stroke" />
                <span className="home-oiiii-chip__face">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ASSETS.oiiiiStudio}
                    alt=""
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                </span>
              </span>
              <div className="flex min-w-0 justify-center">
                <HandButton
                  onClick={onNext}
                  className="home-sticker-cta !px-5 !py-3 !text-sm sm:!text-base"
                >
                  立即加入 → 支持开花计划
                </HandButton>
              </div>
              <span aria-hidden className="block size-full" />
            </div>
          </div>

          {/*
            Mini cert scrap — sibling above content (z-20), NOT .ds-card:
            .ds-card { position:relative } overrides Tailwind absolute and hid it
            under the header. No sketch-rough on this small plate.
          */}
          <div
            aria-hidden
            className="home-cert-scrap pointer-events-none"
            data-home-cert-scrap=""
          >
            <div className="home-cert-scrap__banner">限定发行</div>
            <div className="home-cert-scrap__body">
              <p className="font-cn-pixel text-center text-[8px] leading-tight text-ink sm:text-[9px]">
                支持者卡
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ASSETS.seals.supporter}
                alt=""
                className="mx-auto mt-0.5 h-7 w-7 object-contain opacity-80 mix-blend-multiply"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </SceneContent>
  );
}
