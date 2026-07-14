import JSZip from "jszip";
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { 
  DownloadRequest, 
  ExportResult, 
  ExportReport, 
  PreparedExport, 
  PreparedExportFrame 
} from "../types/export";
import { StudioFrame, resolveFrameUrl } from "../types/mediaPipeline";
import { fetchPngBlobStrict, fetchRawImageBlobStrict } from "./fetchBlobStrict";

async function getImageDimensionsFromBlob(blob: Blob): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            const width = img.width;
            const height = img.height;
            URL.revokeObjectURL(url);
            resolve({ width, height });
        };
        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };
        img.src = url;
    });
}

export const prepareFramesForExport = async (request: DownloadRequest, frames: StudioFrame[]): Promise<PreparedExport> => {
  const preparedFrames: PreparedExportFrame[] = [];
  const failedIndices: number[] = [];
  const warnings: string[] = [];
  
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    
    let resultBlob: Blob | undefined;
    let rawBlob: Blob | undefined;
    
    // Processed (Result)
    const shouldFetchProcessed =
        request.format === 'zipResultOnly' ||
        request.format === 'zipWithRaw' ||
        request.format === 'gifPreview';

    if (shouldFetchProcessed) {
        const finalUrl = resolveFrameUrl(frame, 'final');
        if (!finalUrl) {
            throw new Error(`FINAL_FRAME_UNAVAILABLE:${frame.id}`);
        }
        try {
            resultBlob = await fetchPngBlobStrict(finalUrl);
        } catch {
            warnings.push(`Frame ${i} processed image failed to load.`);
            if (!failedIndices.includes(i)) {
                failedIndices.push(i);
            }
        }
    }
    
    // Raw (for zipWithRaw)
    const shouldFetchRaw = request.format === 'zipWithRaw';
 
    if (shouldFetchRaw) {
        if (frame.rawUrl) {
            try {
                rawBlob = await fetchRawImageBlobStrict(frame.rawUrl);
            } catch {
                if (!failedIndices.includes(i)) {
                    failedIndices.push(i);
                }
            }
        } else {
             if (!failedIndices.includes(i)) {
                 failedIndices.push(i);
             }
        }
    }
    
    // Dimensions
    const blobToUse = resultBlob || rawBlob;
    let width = 0, height = 0;
    if (blobToUse) {
        const dims = await getImageDimensionsFromBlob(blobToUse);
        width = dims.width;
        height = dims.height;
    }

    preparedFrames.push({
        index: i,
        name: `${i.toString().padStart(3, '0')}.png`,
        resultUrl: resolveFrameUrl(frame, 'final') || undefined,
        rawUrl: frame.rawUrl,
        resultBlob,
        rawBlob,
        width,
        height
    });
  }
  
  return { frames: preparedFrames, failedIndices, warnings };
};

export const exportPngSequenceZip = async (request: DownloadRequest, frames: StudioFrame[]): Promise<ExportResult> => {
  const zip = new JSZip();
  const prepared = await prepareFramesForExport(request, frames);
  
  const allowPartial = !!request.allowPartial;
  const resultFolder = zip.folder("result");
  const rawFolder = zip.folder("raw");
  
  let exportedResultCount = 0;
  let exportedRawCount = 0;

  for (const frame of prepared.frames) {
      if (frame.resultBlob && resultFolder) {
          resultFolder.file(frame.name, frame.resultBlob);
          exportedResultCount++;
      }
      if (request.includeRaw && frame.rawBlob && rawFolder) {
          rawFolder.file(frame.name.replace('.png', '_raw.png'), frame.rawBlob);
          exportedRawCount++;
      }
  }

  const isComplete =
    exportedResultCount === frames.length &&
    (!request.includeRaw || exportedRawCount === frames.length) &&
    prepared.failedIndices.length === 0;

  if (!isComplete && !allowPartial) {
    const report = createExportReport(
        request,
        frames.length,
        0,
        prepared.failedIndices,
        prepared.warnings,
        0
    );
    return {
        ok: false,
        format: request.format,
        blob: undefined,
        filename: undefined,
        failedIndices: prepared.failedIndices,
        warnings: prepared.warnings,
        error: 'PARTIAL_RESULT_EXPORT_BLOCKED',
        report
    };
  }
  
  const report = createExportReport(
      request,
      frames.length,
      exportedResultCount,
      prepared.failedIndices,
      prepared.warnings,
      exportedRawCount
  );

  zip.file("export-report.json", JSON.stringify(report, null, 2));
  
  const content = await zip.generateAsync({ type: "blob" });
  return {
      ok: exportedResultCount > 0,
      format: request.format,
      blob: content,
      filename: request.format === 'zipWithRaw' ? 'bananacut_with_raw.zip' : 'bananacut_result_only.zip',
      failedIndices: prepared.failedIndices,
      warnings: prepared.warnings,
      error: exportedResultCount === 0 ? "ZERO_EXPORT_RESULT" : undefined,
      report
  };
};

export const exportGifPreview = async (request: DownloadRequest, frames: StudioFrame[]): Promise<ExportResult> => {
  const prepared = await prepareFramesForExport(request, frames);
  const allowPartial = !!request.allowPartial;
  
  if (prepared.failedIndices.length > 0 && !allowPartial) {
    const report = createExportReport(
        request, 
        frames.length, 
        0, 
        prepared.failedIndices, 
        prepared.warnings,
        0
    );
    return {
        ok: false,
        format: request.format,
        failedIndices: prepared.failedIndices,
        warnings: prepared.warnings,
        error: 'PARTIAL_RESULT_EXPORT_BLOCKED',
        report
    };
  }

  try {
    const MAX_GIF_FRAMES = 120;
    const gifFrames = prepared.frames.slice(0, MAX_GIF_FRAMES);
    const fps = request.fps || 12;
    const delay = Math.max(20, Math.round(1000 / fps));
    
    // Need a canvas context to work with imageData
    const canvas = document.createElement('canvas');
    const gif = new GIFEncoder();
    
    let writtenFrames = 0;
    let width = 0;
    let height = 0;

    for (let i = 0; i < gifFrames.length; i++) {
        const frame = gifFrames[i];
        const blob = frame.resultBlob;
        if (!blob) {
            throw new Error("FINAL_FRAME_UNAVAILABLE");
        }
        
        const imgBlobUrl = URL.createObjectURL(blob);
        try {
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imgBlobUrl;
            });
            
            if (i === 0) {
                width = img.width;
                height = img.height;
                canvas.width = width;
                canvas.height = height;
            }
            
            const ctx = canvas.getContext('2d');
            if (!ctx) continue;
            
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            const data = ctx.getImageData(0, 0, width, height).data;
            
            const palette = quantize(data, 256);
            const index = applyPalette(data, palette);
            gif.writeFrame(index, width, height, { palette, delay });
            writtenFrames++;
        } finally {
            URL.revokeObjectURL(imgBlobUrl);
        }
    }
    
    gif.finish();
    if (writtenFrames === 0) throw new Error("No frames written to GIF");
    
    const blob = new Blob([gif.bytes()], { type: 'image/gif' });
    
    if (blob.size === 0) throw new Error("Generated GIF is empty");
    
    const report = createExportReport(
        request, 
        frames.length, 
        writtenFrames, 
        prepared.failedIndices, 
        prepared.warnings,
        0
    );
    
    return {
        ok: true,
        format: request.format,
        blob,
        filename: 'bananacut_preview.gif',
        failedIndices: prepared.failedIndices,
        warnings: prepared.warnings,
        report
    };
  } catch (e) {
    const fallback = await exportPngSequenceZip({...request, format: 'zipResultOnly', includeRaw: false}, frames);
    return {
        ...fallback,
        format: 'pngSequenceZipFallback',
        filename: 'bananacut_gif_fallback_png_sequence.zip',
        warnings: ['GIF export failed. PNG sequence ZIP was generated instead.'],
        error: String(e)
    };
  }
};

export const exportSpriteSheet = async (request: DownloadRequest, frames: StudioFrame[]): Promise<ExportResult> => {
    return {
        ok: false,
        format: request.format,
        failedIndices: [],
        warnings: ['This export path is not implemented in exportEngine yet.'],
        error: 'Not implemented in exportEngine yet.',
        report: createExportReport(request, frames.length, 0, [], ['Not implemented'], undefined)
    };
};

export const exportTransparentWebM = async (request: DownloadRequest, frames: StudioFrame[]): Promise<ExportResult> => {
    return {
        ok: false,
        format: request.format,
        failedIndices: [],
        warnings: ['This export path is not implemented in exportEngine yet.'],
        error: 'Not implemented in exportEngine yet.',
        report: createExportReport(request, frames.length, 0, [], ['Not implemented'], undefined)
    };
};

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function createExportReport(
  request: DownloadRequest, 
  totalFrames: number, 
  exportedFrames: number, 
  failedIndices: number[], 
  warnings: string[],
  rawExportedFrames?: number
): ExportReport {
  return {
      format: request.format,
      sizeMode: request.sizeMode,
      fps: request.fps,
      totalFrames: totalFrames,
      exportedFrames: exportedFrames,
      rawExportedFrames,
      failedIndices: failedIndices,
      warnings: warnings,
      generatedAt: new Date().toISOString()
  };
}