import { StudioFrame } from '../StudioContext';

export function getFrameDisplayUrl(frame: StudioFrame, ignoreDirty = false): string {
  if (!ignoreDirty && frame.dirty) {
    return frame.rawUrl;
  }
  return frame.processedUrl || frame.rawUrl;
}
