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
