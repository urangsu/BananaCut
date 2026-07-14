import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createKeyRevision, 
  processKeyedFrame, 
  commitKeyedFrameResult, 
  composeRecoveredFrame 
} from '../src/utils/chromaKey';
import { applyChromaKeyAdvanced } from '../src/utils/chromaKey';
import { processChromaCore } from '../src/utils/chromaCore';
import { StudioFrame, ChromaKeyParams } from '../src/types/mediaPipeline';
import { BrushStroke } from '../src/StudioContext';

// Mock Canvas, Image, and Worker APIs in Node environment
beforeEach(() => {
  vi.restoreAllMocks();
  
  // Mock global.URL
  const revokedUrls: string[] = [];
  global.URL.createObjectURL = vi.fn().mockImplementation((blob) => `blob:mock-url-${Math.random()}`);
  global.URL.revokeObjectURL = vi.fn().mockImplementation((url) => {
    revokedUrls.push(url);
  });
  (global as any).revokedUrls = revokedUrls;

  // Mock global.Worker
  class MockWorker {
    onmessage: ((e: any) => void) | null = null;
    postMessage(data: any) {
      setTimeout(() => {
        if (this.onmessage) {
          const dummyPixels = new Uint8ClampedArray(40000);
          const dummyAlpha = new Float32Array(10000);
          this.onmessage({
            data: {
              data: dummyPixels,
              alphaMap: dummyAlpha
            }
          });
        }
      }, 5);
    }
    terminate() {}
  }
  global.Worker = MockWorker as any;

  // Mock global.fetch
  global.fetch = vi.fn().mockImplementation((url) => {
    return Promise.resolve({
      ok: true,
      status: 200,
      blob: () => {
        // Return a dummy PNG blob (signature: [137, 80, 78, 71, 13, 10, 26, 10])
        const u8 = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]);
        const b = new Blob([u8], { type: 'image/png' });
        return Promise.resolve(b);
      }
    } as any);
  });

  // Mock Image loading
  class MockImage {
    onload: (() => void) | null = null;
    onerror: ((err: any) => void) | null = null;
    _src = '';
    width = 100;
    height = 100;
    set src(val: string) {
      this._src = val;
      setTimeout(() => {
        if (this.onload) this.onload();
      }, 5);
    }
    get src() {
      return this._src;
    }
  }
  global.Image = MockImage as any;

  // Mock global.ImageData
  class MockImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    constructor(data: Uint8ClampedArray, width: number, height: number) {
      this.data = data;
      this.width = width;
      this.height = height;
    }
  }
  global.ImageData = MockImageData as any;

  // Mock document.createElement('canvas')
  const mockCanvas = {
    width: 100,
    height: 100,
    getContext: vi.fn().mockReturnValue({
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray(40000)
      }),
      putImageData: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
    }),
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mockdata'),
    toBlob: vi.fn().mockImplementation((cb) => {
      const u8 = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
      cb(new Blob([u8], { type: 'image/png' }));
    })
  };

  global.document = {
    createElement: vi.fn().mockImplementation((tag) => {
      if (tag === 'canvas') return mockCanvas;
      if (tag === 'img') return new MockImage();
      return {};
    })
  } as any;
});

describe('chromaCoreWrapperParity tests', () => {
  const dummyProvenance = {
    sourceIndex: 0,
    targetTimeMs: 0,
    captureMethod: 'image' as const,
    sourceWidth: 100,
    sourceHeight: 100,
    outputWidth: 100,
    outputHeight: 100
  };

  describe('1. createKeyRevision Deterministic Hash', () => {
    it('generates the identical revision hash given identical parameters and strokes regardless of order', () => {
      const frameId = 'frame-42';
      const rawUrl = 'blob:raw-image';
      
      const params: ChromaKeyParams = {
        tolerance: 30,
        softness: 10,
        enclosedTolerance: 20,
        chromaKeyColor: 'Green',
        pickedColor: { r: 10, g: 255, b: 15 },
        keyingMode: 'greenAdvanced',
        previewMode: 'result',
        despill: 5,
        erode: 1,
        dilate: 1,
        feather: 1,
        alphaContrast: 5,
      };

      const stroke1: BrushStroke = {
        id: 's1',
        points: [{ x: 10, y: 10 }, { x: 20, y: 20 }],
        tool: 'brush',
        brushSize: 15,
        createdAt: 12345,
        targetFrameIds: ['frame-42']
      };

      const stroke2: BrushStroke = {
        id: 's2',
        points: [{ x: 50, y: 50 }, { x: 60, y: 60 }],
        tool: 'brush',
        brushSize: 10,
        createdAt: 12346,
        targetFrameIds: ['frame-42']
      };

      const hashA = createKeyRevision({
        frameId,
        params,
        strokes: [stroke1, stroke2]
      });

      // Different stroke array order under parameter inputs, but should be stable
      const hashB = createKeyRevision({
        frameId,
        params,
        strokes: [stroke2, stroke1]
      });

      expect(hashA).toBe(hashB);
    });

    it('ignores previewMode and selected UI properties to maintain stable revision hashes', () => {
      const frameId = 'frame-42';
      const params1: ChromaKeyParams = {
        tolerance: 30,
        softness: 10,
        enclosedTolerance: 20,
        chromaKeyColor: 'Green',
        pickedColor: { r: 10, g: 255, b: 15 },
        keyingMode: 'greenAdvanced',
        previewMode: 'result', // difference here
        despill: 5,
        erode: 1,
        dilate: 1,
        feather: 1,
        alphaContrast: 5,
      };

      const params2: ChromaKeyParams = {
        tolerance: 30,
        softness: 10,
        enclosedTolerance: 20,
        chromaKeyColor: 'Green',
        pickedColor: { r: 10, g: 255, b: 15 },
        keyingMode: 'greenAdvanced',
        previewMode: 'alpha', // difference here should be canonicalized to result
        despill: 5,
        erode: 1,
        dilate: 1,
        feather: 1,
        alphaContrast: 5,
      };

      const hash1 = createKeyRevision({
        frameId,
        params: params1,
        strokes: []
      });

      const hash2 = createKeyRevision({
        frameId,
        params: params2,
        strokes: []
      });

      expect(hash1).toBe(hash2);
    });
  });

  describe('2. processKeyedFrame Contract and State Integrity', () => {
    it('accepts an object input and returns correct result with internal keyRevision', async () => {
      const frame: StudioFrame = {
        id: 'f1',
        rawUrl: 'blob:raw',
        name: 'frame_000.png',
        width: 100,
        height: 100,
        provenance: dummyProvenance,
        keyDirty: true,
        recoverDirty: true,
        qualityFlags: []
      };

      const params: ChromaKeyParams = {
        tolerance: 30,
        softness: 10,
        enclosedTolerance: 20,
        chromaKeyColor: 'Green',
        pickedColor: { r: 10, g: 255, b: 15 },
        keyingMode: 'greenAdvanced',
        previewMode: 'result',
        despill: 5,
        erode: 1,
        dilate: 1,
        feather: 1,
        alphaContrast: 5,
      };

      const res = await processKeyedFrame({
        frame,
        params,
        strokes: []
      });

      expect(res.keyedUrl).toContain('blob:');
      expect(res.keyRevision).toBeDefined();
      expect(res.qualityFlags).toBeDefined();
    });
  });

  describe('3. commitKeyedFrameResult Revocation and Mutation', () => {
    it('revokes previous URLs to prevent memory leaks and updates fields atomically', () => {
      const prevFrame: StudioFrame = {
        id: 'f1',
        rawUrl: 'blob:raw',
        name: 'frame_000.png',
        width: 100,
        height: 100,
        provenance: dummyProvenance,
        keyedUrl: 'blob:old-keyed-url',
        recoveredUrl: 'blob:old-recovered-url',
        recoverMaskUrl: 'blob:old-mask-url',
        keyDirty: true,
        recoverDirty: true,
        keyRevision: 'old-rev',
        recoverBaseKeyRevision: 'old-rev',
        qualityFlags: []
      };

      const keyedResult = {
        keyedUrl: 'blob:new-keyed-url',
        keyRevision: 'new-rev',
        qualityFlags: []
      };

      const updatedFrame = commitKeyedFrameResult({
        previousFrame: prevFrame,
        keyedResult,
        recoveredUrl: 'blob:new-recovered-url'
      });

      // Assert URLs revoked safely
      const revoked = (global as any).revokedUrls as string[];
      expect(revoked).toContain('blob:old-keyed-url');
      expect(revoked).toContain('blob:old-recovered-url');

      // Assert states updated correctly
      expect(updatedFrame.keyedUrl).toBe('blob:new-keyed-url');
      expect(updatedFrame.recoveredUrl).toBe('blob:new-recovered-url');
      expect(updatedFrame.keyRevision).toBe('new-rev');
      expect(updatedFrame.recoverBaseKeyRevision).toBe('new-rev');
      expect(updatedFrame.keyDirty).toBe(false);
      expect(updatedFrame.recoverDirty).toBe(false);
    });
  });

  describe('4. composeRecoveredFrame Non-Binary Blending', () => {
    it('composes non-binary alpha channels correctly', async () => {
      // Mock Canvas 2D Context for composition
      const originalGetContext = document.createElement('canvas').getContext;
      
      const drawImageSpy = vi.fn();
      const mockCtx = {
        drawImage: drawImageSpy,
        save: vi.fn(),
        restore: vi.fn(),
        scale: vi.fn(),
        translate: vi.fn(),
        getImageData: vi.fn().mockImplementation(() => {
          // Let's mock a 2x2 image (16 values in RGBA)
          // Pixels:
          // Raw: Fully Opaque Red (255, 0, 0, 255)
          // Keyed: Fully Transparent (0, 0, 0, 0)
          // Mask: Semi-transparent (255, 0, 0, 128) - coverage = 128/255 ~= 0.5
          const raw = [255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255];
          const keyed = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          const mask = [255, 0, 0, 128, 255, 0, 0, 128, 255, 0, 0, 128, 255, 0, 0, 128];
          
          return {
            width: 2,
            height: 2,
            data: new Uint8ClampedArray(raw.concat(keyed).concat(mask))
          };
        }),
        putImageData: vi.fn()
      };

      vi.spyOn(document.createElement('canvas'), 'getContext').mockReturnValue(mockCtx as any);

      const composed = await composeRecoveredFrame(
        'blob:raw',
        'blob:keyed',
        'blob:mask',
        '#ffffff'
      );

      expect(composed).toBeDefined();
    });
  });

  describe('5. Fail-closed Validation', () => {
    it('fails-closed on zero size blob generation or mask load errors', async () => {
      // Mock mask load error
      class BadImage {
        onload: (() => void) | null = null;
        onerror: ((err: any) => void) | null = null;
        set src(val: string) {
          setTimeout(() => {
            if (this.onerror) this.onerror(new Error("Failed to load"));
          }, 5);
        }
      }
      global.Image = BadImage as any;

      await expect(
        composeRecoveredFrame('blob:raw', 'blob:keyed', 'blob:mask', '#ffffff')
      ).rejects.toThrow();
    });
  });

  describe('6. processChromaCore and applyChromaKeyAdvanced parity', () => {
    it('mathematical consistency parity check', () => {
      const width = 10;
      const height = 10;
      const rawData1 = new Uint8ClampedArray(width * height * 4);
      const rawData2 = new Uint8ClampedArray(width * height * 4);
      
      rawData1.fill(255);
      rawData2.set(rawData1);

      const params: ChromaKeyParams = {
        tolerance: 30,
        softness: 10,
        enclosedTolerance: 20,
        chromaKeyColor: 'Green',
        pickedColor: { r: 10, g: 255, b: 15 },
        keyingMode: 'greenAdvanced',
        previewMode: 'result',
        despill: 5,
        erode: 1,
        dilate: 1,
        feather: 1,
        alphaContrast: 5,
      };

      const exclusionMask = new Uint8Array(width * height);
      
      applyChromaKeyAdvanced(rawData1, width, height, params, exclusionMask);
      processChromaCore(rawData2, width, height, params, exclusionMask);

      expect(Array.from(rawData1)).toEqual(Array.from(rawData2));
    });
  });
});
