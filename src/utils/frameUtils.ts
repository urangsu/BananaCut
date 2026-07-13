import { StudioFrame, resolveFrameUrl } from '../types/mediaPipeline';

export function getFrameDisplayUrl(frame: StudioFrame, requirement: 'raw' | 'keyed' | 'final' = 'final'): string {
  const resolved = resolveFrameUrl(frame, requirement);
  return resolved || frame.rawUrl;
}

