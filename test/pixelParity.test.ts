import { describe, it, expect } from 'vitest';
import { applyChromaKeyAdvanced } from '../src/utils/chromaKey';
import { processChromaCore } from '../src/utils/chromaCore';
import { ChromaKeyParams } from '../src/types/mediaPipeline';

describe('pixelParity mathematical consistency tests', () => {
  it('guarantees alpha channel pixel difference of exactly 0 for main-thread vs worker-thread functional paths', () => {
    // Let's build a mock raw image of 10x10 pixels (400 bytes raw RGBA)
    const width = 10;
    const height = 10;
    const rawData1 = new Uint8ClampedArray(width * height * 4);
    const rawData2 = new Uint8ClampedArray(width * height * 4);

    // Populate random pixels, some green, some non-green
    for (let i = 0; i < rawData1.length; i += 4) {
      if (Math.random() > 0.5) {
        // Green screen pixel
        rawData1[i] = 10;     // R
        rawData1[i + 1] = 220;// G
        rawData1[i + 2] = 15; // B
        rawData1[i + 3] = 255;// A
      } else {
        // Standard skin or background pixel
        rawData1[i] = 180;
        rawData1[i + 1] = 120;
        rawData1[i + 2] = 90;
        rawData1[i + 3] = 255;
      }
    }

    // copy rawData1 to rawData2
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
    // Draw some excluded areas on the mask
    for (let i = 0; i < exclusionMask.length; i++) {
      if (i % 3 === 0) exclusionMask[i] = 1;
    }

    // Path 1: applyChromaKeyAdvanced (the main-thread preview runner)
    applyChromaKeyAdvanced(rawData1, width, height, params, exclusionMask);

    // Path 2: processChromaCore (the worker-thread exporter engine core)
    processChromaCore(rawData2, width, height, {
      keyingMode: params.keyingMode,
      previewMode: 'result',
      tolerance: params.tolerance,
      softness: params.softness,
      enclosedTolerance: params.enclosedTolerance,
      chromaKeyColor: params.chromaKeyColor,
      pickedColor: params.pickedColor,
      despill: params.despill,
      erode: params.erode,
      dilate: params.dilate,
      feather: params.feather,
      alphaContrast: params.alphaContrast,
    }, exclusionMask);

    // Assert absolute pixel parity (especially the Alpha channel)
    let totalDiff = 0;
    for (let i = 0; i < rawData1.length; i++) {
      const diff = Math.abs(rawData1[i] - rawData2[i]);
      totalDiff += diff;
    }

    expect(totalDiff).toBe(0);
  });
});
