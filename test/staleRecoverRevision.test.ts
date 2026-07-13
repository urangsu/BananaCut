import { describe, it, expect } from 'vitest';
import { StudioFrame, invalidateKeyedFramesByIds } from '../src/types/mediaPipeline';
import { createKeyRevision } from '../src/utils/chromaKey';

describe('staleRecoverRevision & deterministic revisions', () => {
  const createMockFrame = (overrides: Partial<StudioFrame> = {}): StudioFrame => ({
    id: 'frame-abc',
    name: 'frame_abc.png',
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

  describe('invalidateKeyedFramesByIds state flow', () => {
    it('sets keyDirty to true and recoverDirty to true when recoverMaskUrl exists', () => {
      const frames = [createMockFrame({ recoverMaskUrl: 'blob:mask' })];
      const updated = invalidateKeyedFramesByIds(frames, ['frame-abc']);
      
      expect(updated[0].keyDirty).toBe(true);
      expect(updated[0].recoverDirty).toBe(true);
    });

    it('sets keyDirty to true and recoverDirty to false when recoverMaskUrl is missing', () => {
      const frames = [createMockFrame({ recoverMaskUrl: undefined })];
      const updated = invalidateKeyedFramesByIds(frames, ['frame-abc']);
      
      expect(updated[0].keyDirty).toBe(true);
      expect(updated[0].recoverDirty).toBe(false);
    });

    it('ignores frames that are not in targetIds', () => {
      const frames = [createMockFrame({ id: 'frame-other', keyDirty: false })];
      const updated = invalidateKeyedFramesByIds(frames, ['frame-abc']);
      
      expect(updated[0].keyDirty).toBe(false);
    });
  });

  describe('deterministic keyRevision generation', () => {
    it('generates the exact same revision string for identical inputs', () => {
      const input1 = {
        frameId: 'frame-1',
        params: { tolerance: 30, softness: 10 },
        strokes: [{ tool: 'brush' as const, brushSize: 10, points: [{ x: 10, y: 10 }], targetFrameIds: ['frame-1'] }]
      };
      
      const input2 = {
        frameId: 'frame-1',
        params: { tolerance: 30, softness: 10 },
        strokes: [{ tool: 'brush' as const, brushSize: 10, points: [{ x: 10, y: 10 }], targetFrameIds: ['frame-1'] }]
      };

      const rev1 = createKeyRevision(input1);
      const rev2 = createKeyRevision(input2);

      expect(rev1).toBe(rev2);
      expect(rev1).toMatch(/^rev_[a-f0-9]+$/);
    });

    it('generates different revision strings for different chroma params', () => {
      const input1 = {
        frameId: 'frame-1',
        params: { tolerance: 30, softness: 10 },
        strokes: []
      };
      
      const input2 = {
        frameId: 'frame-1',
        params: { tolerance: 45, softness: 10 },
        strokes: []
      };

      const rev1 = createKeyRevision(input1);
      const rev2 = createKeyRevision(input2);

      expect(rev1).not.toBe(rev2);
    });

    it('generates different revision strings for different strokes', () => {
      const input1 = {
        frameId: 'frame-1',
        params: { tolerance: 30, softness: 10 },
        strokes: [{ tool: 'brush' as const, brushSize: 10, points: [{ x: 10, y: 10 }], targetFrameIds: ['frame-1'] }]
      };
      
      const input2 = {
        frameId: 'frame-1',
        params: { tolerance: 30, softness: 10 },
        strokes: [{ tool: 'brush' as const, brushSize: 20, points: [{ x: 10, y: 10 }], targetFrameIds: ['frame-1'] }]
      };

      const rev1 = createKeyRevision(input1);
      const rev2 = createKeyRevision(input2);

      expect(rev1).not.toBe(rev2);
    });

    it('never uses Math.random or Date.now (is stable across runs)', () => {
      const input = {
        frameId: 'frame-abc',
        params: { tolerance: 20 },
        strokes: []
      };

      const revFirst = createKeyRevision(input);
      
      for (let i = 0; i < 5; i++) {
        expect(createKeyRevision(input)).toBe(revFirst);
      }
    });
  });
});
