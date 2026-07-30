"use client";

import { ASSETS } from "@/lib/assets";
import { PosterPhotoStage } from "@/components/poster/PosterPhotoStage";
import {
  POSTER_MISSION,
  POSTER_YEAR,
  formatIssuedOn,
  normalizeBloomIssueNo,
} from "@/lib/poster-storage";
import type { PosterData, PosterTemplateId, TeeTransform } from "@/types";

type CertCardPreviewProps = {
  photoUrl: string;
  transform: TeeTransform;
  /** Preferred: full PosterData. Falls back to legacy serial/ownerName props. */
  data?: PosterData;
  serial?: string;
  ownerName?: string;
  templateId?: PosterTemplateId;
  className?: string;
  /** Show BLOOM CLUB verified seal straddling the photo corner. */
  stamped?: boolean;
  /** Snapshot-friendly: keep layout/fonts, drop overlays that break html-to-image */
  exportMode?: boolean;
  /** Optional issued-on date (YYYY.MM.DD). Defaults to today. */
  issuedOn?: string;
};

function resolveData(props: CertCardPreviewProps): PosterData {
  if (props.data) return props.data;
  const issueNo = normalizeBloomIssueNo(props.serial ?? "");
  return {
    nickname: props.ownerName?.trim() || "匿名开花人",
    memberNo: issueNo,
    issueNo,
    templateId: "archive",
    year: POSTER_YEAR,
    photo: props.photoUrl,
    mission: POSTER_MISSION,
  };
}

/**
 * Single BLOOM CLUB archive certificate (3:4) — Swiss / collector-card layout.
 */
export function CertCardPreview({
  photoUrl,
  transform,
  data,
  serial,
  ownerName,
  className = "",
  stamped = true,
  exportMode = false,
  issuedOn,
}: CertCardPreviewProps) {
  const resolved = resolveData({
    photoUrl,
    transform,
    data,
    serial,
    ownerName,
  });

  const owner = resolved.nickname.trim() || "匿名开花人";
  const issueNo = resolved.issueNo || resolved.memberNo;
  const mission = resolved.mission || POSTER_MISSION;
  // Footer stamp: always current local YMD at render time
  const issued = issuedOn || formatIssuedOn(new Date());

  return (
    <div
      className={`cert-card poster-tpl poster-tpl--archive relative flex aspect-[3/4] h-auto max-h-full w-full max-w-[min(100%,36rem)] flex-col overflow-hidden bg-[var(--cert-paper)] text-ink ${
        exportMode ? "cert-card--export" : ""
      } ${className}`}
      style={exportMode ? { filter: "none", transform: "none" } : undefined}
      data-template="archive"
    >
      <div aria-hidden className="cert-card__border" />

      {/* Top — club mark left / program right */}
      <header className="cert-card__zone cert-card__zone--top relative z-[1] flex shrink-0 items-start justify-between px-[5.5%] pt-[2.2%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ASSETS.bloomClubMark}
          alt=""
          className="cert-card__mark h-[72%] w-auto max-h-[3.25rem] object-contain object-left sm:max-h-[3.75rem]"
          draggable={false}
        />
        <div className="shrink-0 pt-[0.2%] text-right">
          <p className="font-poster-mono text-[0.58rem] font-bold tracking-[0.16em] text-ink sm:text-[0.68rem]">
            BLOOM CLUB
          </p>
          <div
            aria-hidden
            className="ml-auto mt-[0.35em] h-px w-[7.5rem] bg-[var(--ds-ink)] sm:w-[8.5rem]"
          />
          <p className="font-poster-mono mt-[0.45em] text-[0.34rem] tracking-[0.14em] text-ink sm:text-[0.4rem]">
            SUPPORTER PROGRAM
          </p>
          <p className="font-poster-mono mt-[0.85em] text-[0.4rem] font-bold tracking-[0.14em] text-ink sm:text-[0.46rem]">
            LIMITED EDITION
          </p>
        </div>
      </header>

      {/* Center — photo ~70% card height, 3:4, thin frame */}
      <div className="cert-card__zone cert-card__zone--photo relative z-[1] flex min-h-0 shrink-0 items-center justify-center overflow-visible px-[8%]">
        <div className="relative h-full max-h-full overflow-visible">
          <div className="cert-card__photo-frame relative h-full max-h-full w-auto overflow-visible">
            <PosterPhotoStage
              photoUrl={photoUrl}
              transform={transform}
              bordered
              className="!bg-[var(--cert-paper)]"
            />
            {stamped ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ASSETS.seals.supporter}
                alt=""
                className="cert-card__seal pointer-events-none absolute bottom-0 right-0 z-20 h-[25%] w-auto origin-center object-contain opacity-90 mix-blend-multiply"
                draggable={false}
              />
            ) : null}
          </div>
          <span
            aria-hidden
            className="font-poster-mono absolute left-[calc(100%+0.35rem)] top-1/2 -translate-y-1/2 text-[0.38rem] font-bold tracking-[0.28em] text-ink [letter-spacing:0.28em] [text-orientation:upright] [writing-mode:vertical-rl] sm:text-[0.44rem]"
          >
            everyone counts
          </span>
        </div>
      </div>

      {/* Bottom — member meta + issued footer */}
      <footer className="cert-card__zone cert-card__zone--bottom relative z-[1] flex min-h-0 shrink-0 flex-col justify-between px-[5.5%] pb-[1.6%] pt-[2.8%]">
        <div className="flex min-h-0 flex-1 items-start justify-between gap-3">
          <div className="min-w-0 flex-1 text-left">
            <p className="font-poster-mono text-[0.38rem] font-bold tracking-[0.16em] text-ink sm:text-[0.46rem]">
              BLOOM MEMBER
            </p>
            <p className="font-poster-mono mt-[0.65em] text-[0.38rem] font-bold tracking-[0.16em] text-ink sm:text-[0.46rem]">
              ISSUE NO.
            </p>
            <p className="font-poster-mono mt-[0.15em] text-[0.64rem] font-bold tracking-[0.06em] text-ink sm:text-[0.78rem]">
              {issueNo}
            </p>

            <p className="font-poster-mono mt-[0.75em] text-[0.38rem] font-bold tracking-[0.16em] text-ink sm:text-[0.46rem]">
              OWNER:
            </p>
            <p className="font-cn-pixel mt-[0.1em] truncate text-[0.68rem] leading-tight text-ink sm:text-[0.82rem]">
              {owner}
            </p>

            <p className="font-poster-mono mt-[0.75em] text-[0.38rem] font-bold tracking-[0.16em] text-ink sm:text-[0.46rem]">
              MISSION:
            </p>
            <p className="font-poster-mono mt-[0.15em] text-[0.42rem] font-bold tracking-[0.08em] text-ink sm:text-[0.5rem]">
              {mission}
            </p>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-[1fr_auto_1fr] items-end gap-2 pt-[0.6%]">
          <p className="font-cn-pixel text-left text-[0.34rem] leading-snug tracking-[0.04em] text-ink sm:text-[0.4rem]">
            让所有支持喜剧行业发展的人先富起来
          </p>
          <p className="font-poster-mono text-center text-[0.3rem] tracking-[0.12em] text-ink sm:text-[0.36rem]">
            {issued}
          </p>
          <div className="flex justify-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ASSETS.founderSignature}
              alt=""
              className="cert-card__signature h-[3.1rem] w-auto max-w-full object-contain object-right sm:h-[3.65rem]"
              draggable={false}
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
