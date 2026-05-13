import { DownloadRequest, ExportSizeMode, DownloadFormat } from './export';
import { StudioFrame } from '../StudioContext';

export type ExportPreflightSeverity = 'info' | 'warning' | 'error';

export type ExportPreflightIssue = {
  severity: ExportPreflightSeverity;
  code:
    | 'UNPROCESSED_FRAMES'
    | 'DIRTY_FRAMES'
    | 'MISSING_PROCESSED_URL'
    | 'RAW_FALLBACK_USED'
    | 'CROP_BOX_MISSING'
    | 'CUSTOM_CANVAS_NOT_FULLY_SUPPORTED'
    | 'GIF_FRAME_LIMIT'
    | 'WEBM_ADVANCED_ONLY';
  message: string;
  frameIndices?: number[];
};

export type ExportPreflightResult = {
  request: DownloadRequest;
  totalFrames: number;
  processedFrames: number;
  dirtyFrames: number;
  unprocessedFrames: number;
  exportableFrames: number;
  estimatedOutput:
    | 'resultZip'
    | 'withRawZip'
    | 'gif'
    | 'pngZipFallback'
    | 'spriteSheet'
    | 'webm';
  sizeMode: ExportSizeMode;
  format: DownloadFormat;
  canProceed: boolean;
  requiresConfirmation: boolean;
  fallbackFormat?: 'pngSequenceZip';
  issues: ExportPreflightIssue[];
};
