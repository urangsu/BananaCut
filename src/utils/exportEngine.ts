import JSZip from "jszip";
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { DownloadRequest, ExportResult, ExportReport, PreparedExport, PreparedExportFrame } from "../types/export";
import { StudioFrame } from "../StudioContext";

async function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
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
    if (request.format !== 'zipWithRaw' || request.includeRaw) {
        if (frame.processedUrl && !frame.dirty) {
            try {
                const response = await fetch(frame.processedUrl);
                resultBlob = await response.blob();
            } catch {
                warnings.push(`Frame ${i} processed image failed to load.`);
            }
        } else if (request.format === 'zipResultOnly') {
             failedIndices.push(i);
             warnings.push(`Frame ${i} was skipped because it is not processed.`);
             continue;
        }
    }

    // Raw
    if (request.format === 'zipWithRaw' || (request.format === 'gifPreview' && !resultBlob)) {
        try {
            const response = await fetch(frame.rawUrl);
            rawBlob = await response.blob();
        } catch {
            if (request.format === 'zipWithRaw') failedIndices.push(i);
        }
    }
    
    // Dimensions
    const blobToUse = resultBlob || rawBlob;
    let width = 0, height = 0;
    if (blobToUse) {
        const img = await loadImageFromBlob(blobToUse);
        width = img.width;
        height = img.height;
    }

    preparedFrames.push({
        index: i,
        name: `${i.toString().padStart(3, '0')}.png`,
        resultUrl: frame.processedUrl,
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
  
  for (const frame of prepared.frames) {
      if (frame.resultBlob) zip.file(`result/${frame.name}`, frame.resultBlob);
      if (request.includeRaw && frame.rawBlob) zip.file(`raw/${frame.name.replace('.png', '_raw.png')}`, frame.rawBlob);
  }
  
  const report: ExportReport = {
      format: request.format,
      sizeMode: request.sizeMode,
      fps: request.fps,
      totalFrames: frames.length,
      exportedFrames: prepared.frames.length - prepared.failedIndices.length,
      failedIndices: prepared.failedIndices,
      warnings: prepared.warnings,
      generatedAt: new Date().toISOString()
  };

  zip.file("export-report.json", JSON.stringify(report, null, 2));
  
  const content = await zip.generateAsync({ type: "blob" });
  return {
      ok: true,
      format: request.format,
      blob: content,
      filename: request.format === 'zipWithRaw' ? 'bananacut_with_raw.zip' : 'bananacut_result_only.zip',
      failedIndices: prepared.failedIndices,
      warnings: prepared.warnings,
      report
  };
};

export const exportGifPreview = async (request: DownloadRequest, frames: StudioFrame[]): Promise<ExportResult> => {
  try {
    const prepared = await prepareFramesForExport(request, frames);
    const MAX_GIF_FRAMES = 120;
    const gifFrames = prepared.frames.slice(0, MAX_GIF_FRAMES);
    const fps = request.fps || 12;
    const delay = Math.max(20, Math.round(1000 / fps));
    
    // Need a canvas context to work with imageData
    const canvas = document.createElement('canvas');
    const gif = new GIFEncoder();
    
    for (let i = 0; i < gifFrames.length; i++) {
        const frame = gifFrames[i];
        const blob = frame.resultBlob || frame.rawBlob;
        if (!blob) continue;
        
        const img = await loadImageFromBlob(blob);
        if (i === 0) {
            canvas.width = img.width;
            canvas.height = img.height;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        
        const palette = quantize(data, 256);
        const index = applyPalette(data, palette);
        gif.writeFrame(index, canvas.width, canvas.height, { palette, delay });
    }
    
    gif.finish();
    const blob = new Blob([gif.bytes()], { type: 'image/gif' });
    
    if (blob.size === 0) throw new Error("Generated GIF is empty");
    
     const report: ExportReport = {
        format: request.format,
        sizeMode: request.sizeMode,
        fps: request.fps,
        totalFrames: frames.length,
        exportedFrames: gifFrames.length,
        failedIndices: prepared.failedIndices,
        warnings: prepared.warnings,
        generatedAt: new Date().toISOString()
    };
    
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
    const fallback = await exportPngSequenceZip({...request, format: 'zipResultOnly'}, frames);
    return {
        ...fallback,
        format: 'pngSequenceZipFallback',
        warnings: ['GIF export failed. PNG sequence ZIP was generated instead.'],
        error: String(e)
    };
  }
};

export const exportSpriteSheet = async (request: DownloadRequest, frames: StudioFrame[]): Promise<ExportResult> => {
    throw new Error("Not implemented yet");
};

export const exportTransparentWebM = async (request: DownloadRequest, frames: StudioFrame[]): Promise<ExportResult> => {
    throw new Error("Not implemented yet");
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
