import { StudioFrame, resolveFrameUrl } from '../types/mediaPipeline';

export function getFrameDisplayUrl(
  frame: StudioFrame,
  requirement: 'raw' | 'keyed' | 'final' = 'final'
): string | null {
  return resolveFrameUrl(frame, requirement);
}

