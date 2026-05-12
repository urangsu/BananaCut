import JSZip from "jszip";
import { DownloadRequest, DownloadFormat } from "../types/export";
import { StudioFrame } from "../StudioContext";

export type ExportResult = {
  ok: boolean;
  format: DownloadFormat | 'pngSequenceZipFallback';
  blob?: Blob;
  filename?: string;
  failedIndices?: number[];
  warnings?: string[];
  error?: string;
};

type PreparedExport = {
  frames: Array<{
    index: number;
    name: string;
    url: string;
    width: number;
    height: number;
    blob: Blob;
  }>;
  failedIndices: number[];
  warnings: string[];
};

export const prepareFramesForExport = async (request: DownloadRequest, frames: StudioFrame[]): Promise<PreparedExport> => {
  const preparedFrames = [];
  const failedIndices = [];
  
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const url = (request.includeRaw ? frame.rawUrl : frame.processedUrl) || frame.rawUrl;
    
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        preparedFrames.push({
            index: i,
            name: `${i.toString().padStart(3, '0')}.png`,
            url,
            width: 0, 
            height: 0,
            blob
        });
    } catch {
        failedIndices.push(i);
    }
  }
  
  return { frames: preparedFrames, failedIndices, warnings: [] };
};

export const exportPngSequenceZip = async (request: DownloadRequest, frames: StudioFrame[]): Promise<ExportResult> => {
  const zip = new JSZip();
  const prepared = await prepareFramesForExport(request, frames);
  
  for (const frame of prepared.frames) {
      zip.file(frame.name, frame.blob);
  }
  
  zip.file("export-report.json", JSON.stringify({
      format: request.format,
      sizeMode: request.sizeMode,
      fps: request.fps,
      totalFrames: frames.length,
      exportedFrames: prepared.frames.length,
      failedIndices: prepared.failedIndices,
      warnings: prepared.warnings
  }, null, 2));
  
  const content = await zip.generateAsync({ type: "blob" });
  return {
      ok: true,
      format: request.format,
      blob: content,
      filename: "export.zip",
      failedIndices: prepared.failedIndices,
      warnings: prepared.warnings
  };
};

export const exportGifPreview = async (request: DownloadRequest, frames: StudioFrame[]): Promise<ExportResult> => {
    console.log("GIF export called");
    try {
        // Implementation simulation
        throw new Error("GIF not fully implemented");
    } catch (e) {
        // Fallback
        const fallback = await exportPngSequenceZip({...request, format: 'zipResultOnly'}, frames);
        return {
            ok: true,
            format: 'pngSequenceZipFallback',
            blob: fallback.blob,
            filename: "fallback.zip",
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
