import { DownloadRequest } from "../types/export";
import { StudioFrame, resolveFrameUrl } from "../types/mediaPipeline";
import { ExportPreflightResult, ExportPreflightIssue } from "../types/exportPreflight";

export function buildExportPreflight(
  request: DownloadRequest,
  frames: StudioFrame[]
): ExportPreflightResult {
  const totalFrames = frames.length;
  
  const processedFrames = frames.filter(f => resolveFrameUrl(f, 'final') !== null).length;
  const dirtyFrames = frames.filter(f => f.keyDirty || f.recoverDirty).length;
  const unprocessedFrames = frames.filter(f => resolveFrameUrl(f, 'final') === null).length;

  const issues: ExportPreflightIssue[] = [];
  let canProceed = true;
  let requiresConfirmation = false;

  // Problematic indices for final results: any frames that lack final URL or are dirty
  const problematicIndices = frames
    .map((f, i) => (resolveFrameUrl(f, 'final') === null || f.keyDirty || f.recoverDirty) ? i : -1)
    .filter(i => i !== -1);
      
  if (problematicIndices.length > 0) {
      issues.push({
          severity: 'error',
          code: 'UNPROCESSED_FRAMES',
          message: 'Some frames are not fully processed or are dirty.',
          frameIndices: problematicIndices
      });
      canProceed = false;
  }

  // If format is zipWithRaw, we also need rawUrl for all frames
  if (request.format === 'zipWithRaw') {
    const missingRawIndices = frames
      .map((f, i) => !f.rawUrl ? i : -1)
      .filter(i => i !== -1);
      
    if (missingRawIndices.length > 0) {
      issues.push({
        severity: 'error',
        code: 'UNPROCESSED_FRAMES',
        message: 'Some frames are missing raw source images.',
        frameIndices: missingRawIndices
      });
      canProceed = false;
    }
  }

  const exportableFrames = processedFrames;
  
  let estimatedOutput: ExportPreflightResult['estimatedOutput'] = 'resultZip';
  if (request.format === 'zipWithRaw') {
    estimatedOutput = 'withRawZip';
  } else if (request.format === 'gifPreview') {
    estimatedOutput = 'gif';
  } else if (request.format === 'spriteSheet') {
    estimatedOutput = 'spriteSheet';
  } else if (request.format === 'transparentWebM') {
    estimatedOutput = 'webm';
  }
  
  return {
    request,
    totalFrames,
    processedFrames,
    dirtyFrames,
    unprocessedFrames,
    exportableFrames,
    estimatedOutput,
    sizeMode: request.sizeMode,
    format: request.format,
    canProceed,
    requiresConfirmation,
    issues
  };
}
