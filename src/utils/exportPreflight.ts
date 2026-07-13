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

  if (request.format === 'zipResultOnly') {
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
  }

  const exportableFrames = processedFrames;
  
  return {
    request,
    totalFrames,
    processedFrames,
    dirtyFrames,
    unprocessedFrames,
    exportableFrames,
    estimatedOutput: 'resultZip',
    sizeMode: request.sizeMode,
    format: request.format,
    canProceed,
    requiresConfirmation,
    issues
  };
}
