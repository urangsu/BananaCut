import JSZip from "jszip";
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { 
  DownloadRequest, 
  ExportResult, 
  ExportReport, 
  PreparedExport, 
  PreparedExportFrame 
} from "../types/export";
import { StudioFrame } from "../StudioContext";

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
    const formatLogic: Record<string, boolean> = {
        zipWithRaw: !!request.includeRaw,
        zipResultOnly: true,
        gifPreview: true,
        spriteSheet: false,
        transparentWebM: false
    };
    const shouldFetchProcessed = formatLogic[request.format] || false;

    if (shouldFetchProcessed) {
        if (frame.processedUrl && !frame.dirty) {
            try {
                const response = await fetch(frame.processedUrl);
                resultBlob = await response.blob();
            } catch {
                warnings.push(`Frame ${i} processed image failed to load.`);
            }
        }
    }
    
    // Policy A: zipResultOnly
    if (request.format === 'zipResultOnly') {
        if (!resultBlob) {
             failedIndices.push(i);
             warnings.push(`Frame ${i} was skipped because it is not processed.`);
             continue;
        }
    }

    // Raw (for zipWithRaw OR gifPreview fallback)
    const isZipWithRaw = request.format === 'zipWithRaw';
    const isGifPreviewWithNoResult = request.format === 'gifPreview' && !resultBlob;

    if (isZipWithRaw || isGifPreviewWithNoResult) {
        if (frame.rawUrl) {
            try {
                const response = await fetch(frame.rawUrl);
                rawBlob = await response.blob();
            } catch {
                if (request.format === 'zipWithRaw') failedIndices.push(i);
            }
        } else {
             if (request.format === 'zipWithRaw') failedIndices.push(i);
        }
        
        if (request.format === 'gifPreview' && !resultBlob && rawBlob) {
            warnings.push(`Frame ${i} used raw frame fallback for GIF preview.`);
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
  
  const resultFolder = zip.folder("result");
  const rawFolder = zip.folder("raw");
  
  for (const frame of prepared.frames) {
      if (frame.resultBlob && resultFolder) resultFolder.file(frame.name, frame.resultBlob);
      if (request.includeRaw && frame.rawBlob && rawFolder) rawFolder.file(frame.name.replace('.png', '_raw.png'), frame.rawBlob);
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
  let prepared: PreparedExport;
  try {
    prepared = await prepareFramesForExport(request, frames);
    const MAX_GIF_FRAMES = 120;
    const gifFrames = prepared.frames.slice(0, MAX_GIF_FRAMES);
    const fps = request.fps || 12;
    const delay = Math.max(20, Math.round(1000 / fps));
    
    // Need a canvas context to work with imageData
    const canvas = document.createElement('canvas');
    const gif = new GIFEncoder();
    
    let width = 0;
    let height = 0;

    for (let i = 0; i < gifFrames.length; i++) {
        const frame = gifFrames[i];
        const blob = frame.resultBlob || frame.rawBlob;
        if (!blob) continue;
        
        const imgBlobUrl = URL.createObjectURL(blob);
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
        if (!ctx) {
            URL.revokeObjectURL(imgBlobUrl);
            continue;
        }
        
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        const data = ctx.getImageData(0, 0, width, height).data;
        
        const palette = quantize(data, 256);
        const index = applyPalette(data, palette);
        gif.writeFrame(index, width, height, { palette, delay });
        
        URL.revokeObjectURL(imgBlobUrl);
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