import JSZip from "jszip";
import { DownloadRequest } from "../types/export";
import { StudioFrame } from "../StudioContext";

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
            name: `frame_${i}.png`,
            url,
            width: 0, // Should be fetched from frame or image
            height: 0,
            blob
        });
    } catch {
        failedIndices.push(i);
    }
  }
  
  return { frames: preparedFrames, failedIndices, warnings: [] };
};

export const exportPngSequenceZip = async (request: DownloadRequest, frames: StudioFrame[]): Promise<void> => {
  const zip = new JSZip();
  const prepared = await prepareFramesForExport(request, frames);
  
  for (const frame of prepared.frames) {
      zip.file(frame.name, frame.blob);
  }
  
  const content = await zip.generateAsync({ type: "blob" });
  downloadBlob(content, "export.zip");
};

export const exportGifPreview = async (request: DownloadRequest, frames: StudioFrame[]): Promise<void> => {
    // Basic implementation placeholder for gifenc
    console.log("GIF export called");
    try {
        // Implementation with gifenc...
        throw new Error("GIF simulation");
    } catch (e) {
        // Fallback
        await exportPngSequenceZip(request, frames);
    }
};

export const exportSpriteSheet = async (request: DownloadRequest, frames: StudioFrame[]): Promise<void> => {
    throw new Error("Not implemented yet");
};

export const exportTransparentWebM = async (request: DownloadRequest, frames: StudioFrame[]): Promise<void> => {
    throw new Error("Not implemented yet");
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
