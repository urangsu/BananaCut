export type ExportSizeMode =
  | 'original'
  | 'recommendedStableCrop'
  | 'customCanvas';

export type DownloadFormat =
  | 'zipWithRaw'
  | 'zipResultOnly'
  | 'gifPreview'
  | 'spriteSheet'
  | 'transparentWebM';

export type DownloadRequest = {
  format: DownloadFormat;
  sizeMode: ExportSizeMode;
  cropBox?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  fps: number;
  includeRaw?: boolean;
  fallback?: 'pngSequenceZip';
};

export type ExportReport = {
  format: string;
  sizeMode: ExportSizeMode;
  fps: number;
  totalFrames: number;
  exportedFrames: number;
  rawExportedFrames?: number;
  failedIndices: number[];
  warnings: string[];
  generatedAt: string;
};

export type ExportResult = {
  ok: boolean;
  format: DownloadFormat | 'pngSequenceZipFallback';
  blob?: Blob;
  filename?: string;
  failedIndices: number[];
  warnings: string[];
  error?: string;
  report: ExportReport;
};

export type PreparedExportFrame = {
  index: number;
  name: string;
  resultUrl?: string;
  rawUrl?: string;
  resultBlob?: Blob;
  rawBlob?: Blob;
  width: number;
  height: number;
};

export type PreparedExport = {
  frames: PreparedExportFrame[];
  failedIndices: number[];
  warnings: string[];
};
