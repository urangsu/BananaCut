import { describe, expect, it } from 'vitest';
import { processChromaCore, type ChromaCoreParams } from '../src/utils/chromaCore';
import { createKeyRevision } from '../src/utils/chromaKey';

const width = 12;
const height = 8;

function makeGreenFrame(): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 0;
    pixels[i + 1] = 255;
    pixels[i + 2] = 0;
    pixels[i + 3] = 255;
  }
  return pixels;
}

function paintPixel(
  pixels: Uint8ClampedArray,
  x: number,
  y: number,
  color: [number, number, number],
) {
  const offset = (y * width + x) * 4;
  pixels[offset] = color[0];
  pixels[offset + 1] = color[1];
  pixels[offset + 2] = color[2];
}

function params(overrides: Partial<ChromaCoreParams> = {}): ChromaCoreParams {
  return {
    keyingMode: 'greenAdvanced',
    previewMode: 'result',
    tolerance: 18,
    softness: 0,
    enclosedTolerance: 0,
    chromaKeyColor: 'Green',
    pickedColor: { r: 0, g: 255, b: 0 },
    despill: 0,
    erode: 0,
    dilate: 0,
    feather: 0,
    alphaContrast: 0,
    removeEnclosed: true,
    ...overrides,
  };
}

describe('detached artifact cleanup', () => {
  it('removes a small isolated foreground mark while preserving the main subject', () => {
    const pixels = makeGreenFrame();

    for (let y = 1; y <= 6; y++) {
      for (let x = 1; x <= 6; x++) {
        paintPixel(pixels, x, y, [170, 85, 35]);
      }
    }

    // A generated sparkle/watermark detached from the character.
    paintPixel(pixels, 10, 6, [240, 255, 240]);

    const result = processChromaCore(pixels, width, height, {
      ...params(),
      removeDetachedArtifacts: true,
      detachedArtifactMaxAreaRatio: 0.05,
      detachedArtifactProximity: 1,
    } as ChromaCoreParams);

    expect(result.alphaMap[3 * width + 3]).toBe(1);
    expect(result.alphaMap[6 * width + 10]).toBe(0);
  });

  it('preserves an isolated detail explicitly protected by the exclusion mask', () => {
    const pixels = makeGreenFrame();
    for (let y = 1; y <= 6; y++) {
      for (let x = 1; x <= 6; x++) {
        paintPixel(pixels, x, y, [170, 85, 35]);
      }
    }
    paintPixel(pixels, 10, 6, [240, 255, 240]);

    const exclusionMask = new Uint8Array(width * height);
    exclusionMask[6 * width + 10] = 1;

    const result = processChromaCore(
      pixels,
      width,
      height,
      {
        ...params(),
        removeDetachedArtifacts: true,
        detachedArtifactMaxAreaRatio: 0.05,
        detachedArtifactProximity: 1,
      } as ChromaCoreParams,
      exclusionMask,
    );

    expect(result.alphaMap[6 * width + 10]).toBe(1);
  });

  it('preserves a small detached detail close to the main silhouette', () => {
    const pixels = makeGreenFrame();
    for (let y = 1; y <= 6; y++) {
      for (let x = 1; x <= 6; x++) {
        paintPixel(pixels, x, y, [170, 85, 35]);
      }
    }
    paintPixel(pixels, 8, 4, [170, 85, 35]);

    const result = processChromaCore(pixels, width, height, {
      ...params(),
      removeDetachedArtifacts: true,
      detachedArtifactMaxAreaRatio: 0.05,
      detachedArtifactProximity: 1,
    });

    expect(result.alphaMap[4 * width + 8]).toBe(1);
  });

  it('preserves a large independent foreground object', () => {
    const pixels = makeGreenFrame();
    for (let y = 1; y <= 6; y++) {
      for (let x = 1; x <= 6; x++) {
        paintPixel(pixels, x, y, [170, 85, 35]);
      }
    }
    for (let y = 5; y <= 6; y++) {
      for (let x = 9; x <= 11; x++) {
        paintPixel(pixels, x, y, [240, 255, 240]);
      }
    }

    const result = processChromaCore(pixels, width, height, {
      ...params(),
      removeDetachedArtifacts: true,
      detachedArtifactMaxAreaRatio: 0.05,
      detachedArtifactProximity: 1,
    });

    expect(result.alphaMap[5 * width + 10]).toBe(1);
  });

  it('changes the key revision when detached cleanup is toggled', () => {
    const base = params();
    const disabledRevision = createKeyRevision({
      frameId: 'frame-1',
      params: { ...base, removeDetachedArtifacts: false },
      strokes: [],
    });
    const enabledRevision = createKeyRevision({
      frameId: 'frame-1',
      params: { ...base, removeDetachedArtifacts: true },
      strokes: [],
    });

    expect(enabledRevision).not.toBe(disabledRevision);
  });
});
