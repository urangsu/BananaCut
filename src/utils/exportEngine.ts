import { DownloadRequest } from "../types/export";
import { StudioFrame } from "../StudioContext";

type PreparedExport = {
  frames: Array<{
    index: number;
    name: string;
    url: string;
    width: number;
    height: number;
  }>;
  failedIndices: number[];
  warnings: string[];
};

export const prepareFramesForExport = (request: DownloadRequest, frames: StudioFrame[]): PreparedExport => {
    // TODO: implement
    return { frames: [], failedIndices: [], warnings: [] };
};

export const exportPngSequenceZip = async (request: DownloadRequest, frames: StudioFrame[]): Promise<void> => {
    // TODO: implement
};

export const exportGifPreview = async (request: DownloadRequest, frames: StudioFrame[]): Promise<void> => {
    // TODO: implement
};

export const exportSpriteSheet = async (request: DownloadRequest, frames: StudioFrame[]): Promise<void> => {
    // TODO: implement
};

export const exportTransparentWebM = async (request: DownloadRequest, frames: StudioFrame[]): Promise<void> => {
    // TODO: implement
};
