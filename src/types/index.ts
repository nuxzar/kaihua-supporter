export type SceneId = "home" | "upload" | "crop" | "editor" | "issue" | "done";

export type NavDirection = "next" | "prev";

export type UploadedPhoto = {
  file: File;
  /** Cropped (or original until crop) URL used by Tee editor + poster */
  previewUrl: string;
  /** Original upload URL for the crop stage (may equal previewUrl before first crop) */
  sourceUrl: string;
};

export type TeeTransform = {
  /** Horizontal center as % of stage width (0–100) */
  x: number;
  /** Vertical center as % of stage height (0–100) */
  y: number;
  /** Relative size multiplier */
  scale: number;
  /** Degrees */
  rotation: number;
  /** Always 1 — kept for transform shape compatibility */
  opacity: number;
};

export type PosterTemplateId = "archive" | "street" | "artist";

/**
 * Canonical poster payload for templates + compose.
 * Tee transform is passed alongside as a shared prop (same math as editor).
 */
export interface PosterData {
  templateId: PosterTemplateId;
  memberNo: string;
  issueNo: string;
  nickname: string;
  /** Runtime photo URL — may also be passed separately as photoUrl */
  photo: string;
  mission: string;
  year: string;
}

/**
 * App-flow meta. Maps to PosterData:
 * supporterName → nickname, serial → issueNo / memberNo.
 */
export type PosterMeta = {
  supporterName: string;
  /** Locked BLOOM-####### once IssueScene claims; empty / placeholder before */
  serial: string;
  slogan: string;
  templateId: PosterTemplateId;
  memberNo: string;
  year: string;
  mission: string;
};
