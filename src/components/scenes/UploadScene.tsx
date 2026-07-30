"use client";

import { useRef } from "react";
import { PaperCard } from "@/components/ds/PaperCard";
import { PaperInput } from "@/components/ds/PaperInput";
import { SceneContent } from "@/components/scenes/SceneContent";
import { useWorkshopChrome } from "@/components/ui/WorkshopShell";
import { truncateNameByWeight } from "@/lib/name-weight";

type UploadSceneProps = {
  previewUrl: string | null;
  supporterName: string;
  onNameChange: (name: string) => void;
  onSelect: (file: File) => void;
  onClear: () => void;
  onNext: () => void;
  onBack: () => void;
};

/**
 * Photo + name in one desk step (no separate confirm / name scenes).
 */
export function UploadScene({
  previewUrl,
  supporterName,
  onNameChange,
  onSelect,
  onClear,
  onNext,
  onBack,
}: UploadSceneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const composingRef = useRef(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    onSelect(file);
  };

  useWorkshopChrome(
    {
      backLabel: "← 返回",
      onBack,
      title: "身份登记",
      subtitle: "留下照片与名字，正式加入行动。",
      note: "不填名字也可以，默认「匿名开花人」",
      actions: [
        ...(previewUrl
          ? [
              {
                id: "swap",
                label: "换一张",
                onClick: onClear,
                variant: "ghost" as const,
              },
            ]
          : []),
        {
          id: "next",
          label: "下一步，调整构图 →",
          onClick: onNext,
          disabled: !previewUrl,
          variant: "primary" as const,
        },
      ],
    },
    [previewUrl, onNext, onBack, onClear],
  );

  return (
    <SceneContent align="stretch" scroll>
      <div className="scene-stack">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="scene-stage-slot">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
            className="photo-stage relative overflow-hidden transition hover:brightness-[0.98]"
          >
            <PaperCard tone="board" grain fill>
              {previewUrl ? (
                <div className="absolute inset-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="预览"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center ds-gap-sm ds-pad">
                  <span className="font-cn-pixel text-[1.15rem] text-ink">
                    贴上你的登记照
                  </span>
                  <span className="font-hand text-sm text-ink-soft">
                    点击或拖入全身照
                  </span>
                </div>
              )}
            </PaperCard>
          </button>
        </div>

        <div className="scene-stack__footer">
          <PaperInput
            value={supporterName}
            onCompositionStart={() => {
              composingRef.current = true;
            }}
            onCompositionEnd={(e) => {
              composingRef.current = false;
              onNameChange(truncateNameByWeight(e.currentTarget.value));
            }}
            onChange={(e) => {
              if (composingRef.current) {
                onNameChange(e.target.value);
                return;
              }
              onNameChange(truncateNameByWeight(e.target.value));
            }}
            placeholder="支持者署名，写上你的名字或昵称"
            aria-label="支持者署名"
          />
        </div>
      </div>
    </SceneContent>
  );
}
