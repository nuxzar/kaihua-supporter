"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { HomeScene } from "@/components/scenes/HomeScene";
import { SceneChunkFallback } from "@/components/scenes/SceneChunkFallback";
import { SceneContainer } from "@/components/scenes/SceneContainer";
import { SceneErrorBoundary } from "@/components/scenes/SceneErrorBoundary";
import { WorkshopShell } from "@/components/ui/WorkshopShell";
import { SLOGANS, pickSlogan } from "@/lib/constants";
import { revokeIfBlobUrl } from "@/lib/photo-crop";
import {
  POSTER_MISSION,
  POSTER_YEAR,
} from "@/lib/poster-storage";
import { computeDefaultTeeTransform, DEFAULT_TEE_TRANSFORM } from "@/lib/tee-placement";
import type {
  NavDirection,
  PosterMeta,
  SceneId,
  TeeTransform,
  UploadedPhoto,
} from "@/types";

/**
 * Home stays eager for first paint.
 * Later scenes are code-split so a parse/runtime failure in crop / compose /
 * editor cannot blank the homepage client bundle (the recurring systemic issue).
 */
const UploadScene = dynamic(
  () =>
    import("@/components/scenes/UploadScene").then((m) => m.UploadScene),
  { loading: () => <SceneChunkFallback />, ssr: false },
);
const CropScene = dynamic(
  () => import("@/components/scenes/CropScene").then((m) => m.CropScene),
  { loading: () => <SceneChunkFallback />, ssr: false },
);
const EditorScene = dynamic(
  () =>
    import("@/components/scenes/EditorScene").then((m) => m.EditorScene),
  { loading: () => <SceneChunkFallback />, ssr: false },
);
const IssueScene = dynamic(
  () => import("@/components/scenes/IssueScene").then((m) => m.IssueScene),
  { loading: () => <SceneChunkFallback />, ssr: false },
);
const DoneScene = dynamic(
  () => import("@/components/scenes/DoneScene").then((m) => m.DoneScene),
  { loading: () => <SceneChunkFallback />, ssr: false },
);

const SCENE_ORDER: SceneId[] = ["home", "upload", "crop", "editor", "issue", "done"];

function createInitialMeta(): PosterMeta {
  return {
    supporterName: "",
    serial: "",
    slogan: SLOGANS[0],
    templateId: "archive",
    memberNo: "",
    year: POSTER_YEAR,
    mission: POSTER_MISSION,
  };
}

function revokePhotoUrls(photo: UploadedPhoto | null | undefined) {
  if (!photo) return;
  revokeIfBlobUrl(photo.previewUrl);
  if (photo.sourceUrl !== photo.previewUrl) {
    revokeIfBlobUrl(photo.sourceUrl);
  }
}

/**
 * Flow: home → upload(+name) → crop → editor → issue → done
 */
export function KaihuaApp() {
  const [currentScene, setCurrentScene] = useState<SceneId>("home");
  const [direction, setDirection] = useState<NavDirection>("next");
  const [photo, setPhoto] = useState<UploadedPhoto | null>(null);
  const [transform, setTransform] = useState<TeeTransform>(DEFAULT_TEE_TRANSFORM);
  const [meta, setMeta] = useState<PosterMeta>(createInitialMeta);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const photoRef = useRef(photo);

  useEffect(() => {
    photoRef.current = photo;
  }, [photo]);

  // Archive certificate defaults — client-only year / mission / slogan.
  useEffect(() => {
    queueMicrotask(() => {
      setMeta((m) => ({
        ...m,
        templateId: "archive",
        year: POSTER_YEAR,
        mission: POSTER_MISSION,
        slogan: pickSlogan(),
      }));
    });
  }, []);

  useEffect(() => {
    return () => {
      revokePhotoUrls(photoRef.current);
    };
  }, []);

  // Recover from empty guarded scenes (missing photo / poster) — avoid blank paper.
  useEffect(() => {
    const hasCropSource = Boolean(photo?.sourceUrl || photo?.previewUrl);
    if (currentScene === "crop" && !hasCropSource) {
      setDirection("prev");
      setCurrentScene("upload");
      return;
    }
    if ((currentScene === "editor" || currentScene === "issue") && !photo) {
      setDirection("prev");
      setCurrentScene("upload");
      return;
    }
    if (currentScene === "done" && !posterUrl) {
      setDirection("prev");
      setCurrentScene("home");
    }
  }, [currentScene, photo, posterUrl]);

  const goNext = useCallback((to: SceneId) => {
    setDirection("next");
    setCurrentScene(to);
  }, []);

  const goBack = useCallback(
    (to?: SceneId) => {
      setDirection("prev");
      if (to) {
        setCurrentScene(to);
        return;
      }
      const idx = SCENE_ORDER.indexOf(currentScene);
      const prev = SCENE_ORDER[Math.max(0, idx - 1)] ?? "home";
      setCurrentScene(prev);
    },
    [currentScene],
  );

  const clearPhoto = useCallback(() => {
    setPhoto((prev) => {
      revokePhotoUrls(prev);
      return null;
    });
  }, []);

  const handleSelect = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setPhoto((prev) => {
      revokePhotoUrls(prev);
      return { file, previewUrl: url, sourceUrl: url };
    });
  }, []);

  const handleCropped = useCallback(
    (blob: Blob) => {
      const croppedFile = new File([blob], "kaihua-crop.jpg", {
        type: blob.type || "image/jpeg",
      });
      const previewUrl = URL.createObjectURL(blob);
      setPhoto((prev) => {
        if (!prev) {
          return { file: croppedFile, previewUrl, sourceUrl: previewUrl };
        }
        // Keep original sourceUrl for re-crop; drop prior cropped preview only.
        if (prev.previewUrl !== prev.sourceUrl) {
          const stale = prev.previewUrl;
          queueMicrotask(() => revokeIfBlobUrl(stale));
        }
        return {
          file: croppedFile,
          previewUrl,
          sourceUrl: prev.sourceUrl,
        };
      });
      setTransform(computeDefaultTeeTransform());
      // Do NOT claim issue number here — only when IssueScene compose starts.
      goNext("editor");
    },
    [goNext],
  );

  const handleRestart = useCallback(() => {
    clearPhoto();
    setTransform(computeDefaultTeeTransform());
    setMeta({
      ...createInitialMeta(),
      templateId: "archive",
      slogan: pickSlogan(),
    });
    setPosterUrl(null);
    goBack("home");
  }, [clearPhoto, goBack]);

  const cropSourceUrl = photo?.sourceUrl || photo?.previewUrl || null;
  const editorSerial = meta.serial || "BLOOM-·······";

  return (
    <div className="app-viewport relative h-[100dvh] w-full overflow-hidden">
      <WorkshopShell>
        <SceneContainer sceneKey={currentScene} direction={direction}>
          <SceneErrorBoundary resetKey={currentScene} onReset={handleRestart}>
            {currentScene === "home" && (
              <HomeScene onNext={() => goNext("upload")} />
            )}

            {currentScene === "upload" && (
              <UploadScene
                previewUrl={photo?.sourceUrl ?? photo?.previewUrl ?? null}
                supporterName={meta.supporterName}
                onNameChange={(name) =>
                  setMeta((m) => ({ ...m, supporterName: name }))
                }
                onSelect={handleSelect}
                onClear={clearPhoto}
                onNext={() => goNext("crop")}
                onBack={() => goBack("home")}
              />
            )}

            {currentScene === "crop" && cropSourceUrl && (
              <CropScene
                imageUrl={cropSourceUrl}
                onConfirm={handleCropped}
                onBack={() => goBack("upload")}
              />
            )}

            {currentScene === "editor" && photo && (
              <EditorScene
                photoUrl={photo.previewUrl}
                supporterName={meta.supporterName}
                serial={editorSerial}
                transform={transform}
                onChange={setTransform}
                onNext={() => {
                  setMeta((m) => ({
                    ...m,
                    slogan: pickSlogan(),
                  }));
                  goNext("issue");
                }}
                onBack={() => goBack("crop")}
              />
            )}

            {currentScene === "issue" && photo && (
              <IssueScene
                photoUrl={photo.previewUrl}
                transform={transform}
                meta={meta}
                onMetaChange={setMeta}
                onGenerated={(url) => {
                  setPosterUrl(url);
                  goNext("done");
                }}
                onBack={() => goBack("editor")}
              />
            )}

            {currentScene === "done" && posterUrl && (
              <DoneScene
                posterUrl={posterUrl}
                serial={meta.serial}
              />
            )}
          </SceneErrorBoundary>
        </SceneContainer>
      </WorkshopShell>
    </div>
  );
}
