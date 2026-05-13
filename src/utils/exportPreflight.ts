import { DownloadRequest } from "../types/export";
import { StudioFrame } from "../StudioContext";
import { ExportPreflightResult, ExportPreflightIssue } from "../types/exportPreflight";

export function buildExportPreflight(
  request: DownloadRequest,
  frames: StudioFrame[]
): ExportPreflightResult {
  const totalFrames = frames.length;
  const processedFrames = frames.filter(f => f.processedUrl && !f.dirty).length;
  const dirtyFrames = frames.filter(f => f.dirty).length;
  const unprocessedFrames = frames.filter(f => !f.processedUrl).length;

  const issues: ExportPreflightIssue[] = [];
  let canProceed = true;
  let requiresConfirmation = false;

  // Add issue checking logic based on request.format
  
  if (request.format === 'zipResultOnly') {
    const problematicIndices = frames.map((f, i) => (!f.processedUrl || f.dirty) ? i : -1).filter(i => i !== -1);
    if (problematicIndices.length > 0) {
        issues.push({
            severity: 'error',
            code: 'UNPROCESSED_FRAMES',
            message: 'Some frames are not processed or are dirty.',
            frameIndices: problematicIndices
        });
        canProceed = false;
    }
  }

  // Set defaults and finalize
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
