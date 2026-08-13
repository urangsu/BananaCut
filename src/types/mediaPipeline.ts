export type FrameCaptureMethod = 'native' | 'ffmpeg' | 'image';

export type FrameQualityFlag =
  | 'CAPTURE_TIME_DRIFT'
  | 'DUPLICATE_CAPTURE'
  | 'BLANK_FRAME'
  | 'FULLY_TRANSPARENT'
  | 'FULLY_OPAQUE'
  | 'ALPHA_AREA_OUTLIER'
  | 'BBOX_JITTER'
  | 'RESIDUAL_KEY_COLOR'
  | 'DIMENSION_MISMATCH'
  | 'SKIPPED_SOURCE_SLOT';

export type ProcessingStage =
  | 'raw'
  | 'keyed'
  | 'recovered';

export interface FrameProvenance {
  sourceIndex: number;
  targetTimeMs: number;
  actualTimeMs?: number;
  captureMethod: FrameCaptureMethod;
  sourceWidth: number;
  sourceHeight: number;
  outputWidth: number;
  outputHeight: number;
  contentHash?: string;
}

export interface StudioFrame {
  id: string;
  name: string;

  rawUrl: string;
  keyedUrl?: string;
  recoveredUrl?: string;
  recoverMaskUrl?: string;

  width: number;
  height: number;

  provenance: FrameProvenance;

  keyRevision?: string;
  recoverBaseKeyRevision?: string;

  keyDirty: boolean;
  recoverDirty: boolean;

  qualityFlags: FrameQualityFlag[];
}

export interface FrameSlotPlan {
  sourceIndex: number;
  targetTimeMs: number;
}

export function resolveFrameUrl(
  frame: StudioFrame,
  requirement: 'raw' | 'keyed' | 'final'
): string | null {
  if (requirement === 'raw') {
    return frame.rawUrl;
  }
  if (requirement === 'keyed') {
    return (!frame.keyDirty && frame.keyedUrl) ? frame.keyedUrl : null;
  }
  if (requirement === 'final') {
    if (
      !frame.keyDirty &&
      !frame.recoverDirty &&
      frame.recoveredUrl &&
      frame.keyRevision &&
      frame.recoverBaseKeyRevision === frame.keyRevision
    ) {
      return frame.recoveredUrl;
    }
    if (!frame.keyDirty && frame.keyedUrl) {
      return frame.keyedUrl;
    }
    return null;
  }
  return null;
}

export interface ChromaKeyParams {
  keyingMode: 'rgb' | 'hsv' | 'luma' | 'greenAdvanced';
  previewMode: 'result' | 'original' | 'alpha' | 'checkerboard' | 'black' | 'white';
  tolerance: number;
  softness: number;
  enclosedTolerance: number;
  chromaKeyColor: 'White' | 'Green' | 'Picker';
  pickedColor: { r: number; g: number; b: number };
  despill: number;
  erode: number;
  dilate: number;
  feather: number;
  alphaContrast: number;
  removeEnclosed?: boolean;
  removeDetachedArtifacts?: boolean;
  detachedArtifactMaxAreaRatio?: number;
  detachedArtifactProximity?: number;
  detachedArtifactAlphaThreshold?: number;
}

export interface VideoProbeResult {
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  extension: string;

  durationMs: number;
  sourceWidth: number;
  sourceHeight: number;

  nativeCanPlay: boolean;
  nativeCanProbablyPlay: boolean;

  requestedFps: number;
  estimatedFrameSlots: number;

  qualityMode: 'original' | 'balanced1080' | 'safe720';
  plannedWidth: number;
  plannedHeight: number;
  willDownscale: boolean;

  estimatedWorkingMemoryMB: number;
  warnings: string[];
}

export interface MediaExtractionResult {
  frames: StudioFrame[];
  slots: FrameSlotPlan[];
  skippedSlots: FrameSlotPlan[];
  warnings: string[];
  decoder: FrameCaptureMethod;
  sourceDimensions: { width: number; height: number };
  outputDimensions: { width: number; height: number };
  requestedFps: number;
  actualFrameCount: number;
  elapsedMs: number;
}

export interface FrameQualityMetrics {
  alphaCoverage: number;
  softEdgeRatio: number;
  residualKeyScore: number;
  bbox?: { x: number; y: number; w: number; h: number };
  centroid?: { x: number; y: number };
  captureTimeErrorMs?: number;
  contentHash?: string;
}

export interface SequenceQualityReport {
  totalSlotCount: number;
  capturedFrameCount: number;
  missingSlotCount: number;
  duplicateCaptureCandidates: number;
  blankFrames: number;
  fullyTransparentFrames: number;
  fullyOpaqueFrames: number;
  alphaCoverageOutliers: number;
  bboxSizeOutliers: number;
  centroidJitter: number;
  residualKeyColorFrames: number;
  dimensionMismatch: number;
  dirtyKeyedFrames: number;
  staleRecoverFrames: number;
}

export const normalizeChromaKeyParams = (params: Partial<ChromaKeyParams>): ChromaKeyParams => {
  const clamp = (val: number, min: number, max: number) => {
    if (isNaN(val)) return min;
    return Math.max(min, Math.min(max, val));
  };
  
  return {
    keyingMode: ['rgb', 'hsv', 'luma', 'greenAdvanced'].includes(params.keyingMode as string) ? params.keyingMode as any : 'greenAdvanced',
    previewMode: ['result', 'original', 'alpha', 'checkerboard', 'black', 'white'].includes(params.previewMode as string) ? params.previewMode as any : 'result',
    tolerance: clamp(Number(params.tolerance || 0), 0, 100),
    softness: clamp(Number(params.softness || 0), 0, 100),
    enclosedTolerance: clamp(Number(params.enclosedTolerance || 0), 0, 100),
    chromaKeyColor: ['White', 'Green', 'Picker'].includes(params.chromaKeyColor as string) ? params.chromaKeyColor as any : 'Green',
    pickedColor: params.pickedColor && typeof params.pickedColor.r === 'number' ? params.pickedColor : { r: 0, g: 255, b: 0 },
    despill: clamp(Number(params.despill || 0), 0, 100),
    erode: clamp(Number(params.erode || 0), 0, 100),
    dilate: clamp(Number(params.dilate || 0), 0, 100),
    feather: clamp(Number(params.feather || 0), 0, 100),
    alphaContrast: clamp(Number(params.alphaContrast || 0), -100, 100),
    removeEnclosed: !!params.removeEnclosed,
    removeDetachedArtifacts: !!params.removeDetachedArtifacts,
    detachedArtifactMaxAreaRatio: clamp(
      Number(params.detachedArtifactMaxAreaRatio ?? 0.005),
      0,
      0.05,
    ),
    detachedArtifactProximity: clamp(
      Number(params.detachedArtifactProximity ?? 12),
      0,
      100,
    ),
    detachedArtifactAlphaThreshold: clamp(
      Number(params.detachedArtifactAlphaThreshold ?? 0.05),
      0,
      1,
    ),
  };
};

export function invalidateKeyedFramesByIds(
  frames: StudioFrame[],
  targetIds: string[]
): StudioFrame[] {
  const targetSet = new Set(targetIds);
  return frames.map((f) => {
    if (targetSet.has(f.id)) {
      return {
        ...f,
        keyDirty: true,
        recoverDirty: !!f.recoverMaskUrl
      };
    }
    return f;
  });
}
