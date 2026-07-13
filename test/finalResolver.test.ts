import { describe, it, expect, vi } from 'vitest';
import { resolveFrameUrl, StudioFrame } from '../src/types/mediaPipeline';
import { prepareFramesForExport } from '../src/utils/exportEngine';

describe('finalResolver & preflight logic tests', () => {
  const createMockFrame = (overrides: Partial<StudioFrame> = {}): StudioFrame => ({
    id: 'frame-123',
    name: 'frame_123.png',
    rawUrl: 'blob:raw',
    keyedUrl: 'blob:keyed',
    recoveredUrl: 'blob:recovered',
    recoverMaskUrl: 'blob:mask',
    width: 640,
    height: 360,
    provenance: {
      sourceIndex: 0,
      targetTimeMs: 0,
      captureMethod: 'native',
      sourceWidth: 640,
      sourceHeight: 360,
      outputWidth: 640,
      outputHeight: 360,
    },
    keyRevision: 'rev-abc',
    recoverBaseKeyRevision: 'rev-abc',
    keyDirty: false,
    recoverDirty: false,
    qualityFlags: [],
    ...overrides,
  });

  describe('resolveFrameUrl rules', () => {
    it('returns recoveredUrl when revisions match and neither is dirty', () => {
      const frame = createMockFrame();
      const url = resolveFrameUrl(frame, 'final');
      expect(url).toBe('blob:recovered');
    });

    it('returns keyedUrl when keyRevision !== recoverBaseKeyRevision but keyedUrl is valid', () => {
      const frame = createMockFrame({ recoverBaseKeyRevision: 'rev-xyz' });
      const url = resolveFrameUrl(frame, 'final');
      expect(url).toBe('blob:keyed');
    });

    it('returns null for final when keyRevision !== recoverBaseKeyRevision and keyedUrl is missing/dirty', () => {
      const frame = createMockFrame({
        recoverBaseKeyRevision: 'rev-xyz',
        keyDirty: true,
      });
      const url = resolveFrameUrl(frame, 'final');
      expect(url).toBeNull();
    });

    it('returns null when keyDirty === true', () => {
      const frame = createMockFrame({ keyDirty: true });
      const url = resolveFrameUrl(frame, 'final');
      expect(url).toBeNull();
    });

    it('returns null when recoverDirty === true and recoveredUrl would have been resolved', () => {
      const frame = createMockFrame({ recoverDirty: true });
      const url = resolveFrameUrl(frame, 'final');
      expect(url).toBe('blob:keyed');
    });

    it('returns null for keyed URL when keyDirty === true', () => {
      const frame = createMockFrame({ keyDirty: true });
      const url = resolveFrameUrl(frame, 'keyed');
      expect(url).toBeNull();
    });
  });

  describe('GIF preflight blocking', () => {
    it('throws FINAL_FRAME_UNAVAILABLE if final frame resolver returns null during prepare', async () => {
      const frames = [
        createMockFrame({ id: 'frame-1', keyDirty: true, keyedUrl: undefined })
      ];
      const request: any = { format: 'gifPreview' };

      await expect(prepareFramesForExport(request, frames)).rejects.toThrow(
        /FINAL_FRAME_UNAVAILABLE/
      );
    });
  });
});
