import { ChromaKeyParams, StudioFrame, FrameQualityFlag } from '../types/mediaPipeline';
import { BrushStroke } from '../StudioContext';
import { processChromaCore, getChromaDistance, ChromaCoreParams } from './chromaCore';

export interface KeyColorEstimate {
  rgb: { r: number; g: number; b: number };
  kind: 'green' | 'white' | 'custom';
  confidence: number;
  variance: number;
  sampledFrameIds: string[];
  warnings: string[];
}

export function createKeyRevision(input: {
  frameId: string;
  params: any;
  strokes: any[];
  rawSourceIdentity?: string;
}): string {
  const serializedStrokes = input.strokes.map(s => ({
    tool: s.tool,
    brushSize: s.brushSize,
    points: s.points,
    targetFrameIds: s.targetFrameIds
  }));

  const payload = {
    frameId: input.frameId,
    params: input.params,
    strokes: serializedStrokes,
    rawSourceIdentity: input.rawSourceIdentity || ''
  };

  const jsonStr = JSON.stringify(payload);
  let hash = 5381;
  for (let i = 0; i < jsonStr.length; i++) {
    hash = (hash * 33) ^ jsonStr.charCodeAt(i);
  }
  return `rev_${(hash >>> 0).toString(16)}`;
}

// 1. Dominant Key Color Estimator
export function estimateKeyColor(
  framesData: { id: string; imageData: ImageData }[]
): KeyColorEstimate {
  if (framesData.length === 0) {
    return {
      rgb: { r: 0, g: 255, b: 0 },
      kind: 'green',
      confidence: 1.0,
      variance: 0,
      sampledFrameIds: [],
      warnings: ['No frames provided for estimation.']
    };
  }

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;
  const sampledFrameIds = framesData.map(f => f.id);
  const warnings: string[] = [];
  const samples: { r: number; g: number; b: number }[] = [];

  for (const { imageData } of framesData) {
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;

    // Outer 2% to 4% sampling
    const borderY = Math.max(1, Math.round(h * 0.03));
    const borderX = Math.max(1, Math.round(w * 0.03));

    const samplePixel = (x: number, y: number) => {
      const idx = (y * w + x) * 4;
      if (idx < 0 || idx + 2 >= data.length) return;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      totalR += r;
      totalG += g;
      totalB += b;
      count++;
      samples.push({ r, g, b });
    };

    // Sample top border
    for (let y = 0; y < borderY; y++) {
      for (let x = 0; x < w; x += 10) {
        samplePixel(x, y);
      }
    }
    // Sample bottom border
    for (let y = h - borderY; y < h; y++) {
      for (let x = 0; x < w; x += 10) {
        samplePixel(x, y);
      }
    }
    // Sample left border
    for (let y = borderY; y < h - borderY; y += 10) {
      for (let x = 0; x < borderX; x++) {
        samplePixel(x, y);
      }
    }
    // Sample right border
    for (let y = borderY; y < h - borderY; y += 10) {
      for (let x = w - borderX; x < w; x++) {
        samplePixel(x, y);
      }
    }
  }

  if (count === 0) {
    return {
      rgb: { r: 0, g: 255, b: 0 },
      kind: 'green',
      confidence: 0,
      variance: 0,
      sampledFrameIds,
      warnings: ['No pixels sampled.']
    };
  }

  const avgR = totalR / count;
  const avgG = totalG / count;
  const avgB = totalB / count;

  let sumSqDev = 0;
  for (const s of samples) {
    const devR = s.r - avgR;
    const devG = s.g - avgG;
    const devB = s.b - avgB;
    sumSqDev += devR * devR + devG * devG + devB * devB;
  }
  const variance = sumSqDev / (count * 3);

  let kind: 'green' | 'white' | 'custom' = 'custom';
  if (avgG > avgR + 30 && avgG > avgB + 30) {
    kind = 'green';
  } else {
    const maxVal = Math.max(avgR, avgG, avgB);
    const minVal = Math.min(avgR, avgG, avgB);
    const sat = maxVal === 0 ? 0 : (maxVal - minVal) / maxVal;
    if (maxVal > 180 && sat < 0.2) {
      kind = 'white';
    }
  }

  let confidence = 1.0 - Math.min(1.0, Math.sqrt(variance) / 128);
  if (kind === 'custom') {
    confidence *= 0.5;
  }

  if (confidence < 0.4) {
    warnings.push('Low estimation confidence. High background color variation detected. Manual Picker is highly recommended.');
  }

  return {
    rgb: { r: Math.round(avgR), g: Math.round(avgG), b: Math.round(avgB) },
    kind,
    confidence: parseFloat(confidence.toFixed(3)),
    variance: parseFloat(variance.toFixed(2)),
    sampledFrameIds,
    warnings
  };
}

// 2. Generate Brush Stroke Mask based on Frame ID (strictly string based)
export function generateStrokeMask(
  width: number,
  height: number,
  strokes: BrushStroke[],
  frameId: string
): Uint8Array | undefined {
  const activeStrokes = strokes.filter(s => s.targetFrameIds.includes(frameId));
  if (activeStrokes.length === 0) return undefined;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;
  
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);
  
  for (const stroke of activeStrokes) {
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = stroke.brushSize;
    ctx.strokeStyle = stroke.tool === 'eraser' ? 'black' : 'white';
    
    const pts = stroke.points;
    if (pts.length === 0) continue;
    if (pts.length === 1) {
      ctx.fillStyle = ctx.strokeStyle;
      ctx.arc(pts[0].x, pts[0].y, stroke.brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
    }
  }

  const imgData = ctx.getImageData(0, 0, width, height).data;
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < mask.length; i++) {
    mask[i] = imgData[i * 4] > 128 ? 1 : 0;
  }
  return mask;
}

// 3. Web Worker Script for off-thread heavy chroma operations
const workerCode = `
${getChromaDistance.toString()}
${processChromaCore.toString()}

self.onmessage = function(e) {
  const { data, width, height, params, exclusionMask } = e.data;
  const result = processChromaCore(data, width, height, params, exclusionMask);
  self.postMessage({ data: result.data, alphaMap: result.alphaMap }, [result.data.buffer]);
};
`;

let workerBlobUrl = '';
try {
  workerBlobUrl = URL.createObjectURL(new Blob([workerCode], { type: 'text/javascript' }));
} catch (e) {
  console.error("Failed to compile inline chroma key worker:", e);
}

// 4. Thread-safe execution wrapper using Worker
export async function runChromaKeyWorker(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  params: ChromaKeyParams,
  exclusionMask?: Uint8Array
): Promise<{ data: Uint8ClampedArray; alphaMap: Float32Array }> {
  return new Promise((resolve, reject) => {
    if (!workerBlobUrl) {
      return reject(new Error("Worker code failed to initialize."));
    }
    const worker = new Worker(workerBlobUrl);
    
    worker.onmessage = (e) => {
      worker.terminate();
      resolve(e.data);
    };

    worker.onerror = (err) => {
      worker.terminate();
      reject(err);
    };

    // Transferrable buffer for super high performance
    worker.postMessage({
      data,
      width,
      height,
      params,
      exclusionMask
    }, [data.buffer]);
  });
}

// 5. Core Quality Metrics Analyzer
export function analyzeAlphaMask(
  alphaMap: Float32Array,
  width: number,
  height: number
): {
  alphaCoverage: number;
  softEdgeRatio: number;
  bbox: { x: number; y: number; w: number; h: number };
  centroid: { x: number; y: number };
} {
  let transparentCount = 0;
  let softCount = 0;
  let foregroundCount = 0;

  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;

  let sumX = 0;
  let sumY = 0;

  for (let i = 0; i < alphaMap.length; i++) {
    const a = alphaMap[i];
    const x = i % width;
    const y = Math.floor(i / width);

    if (a < 0.99) {
      transparentCount++;
    }
    if (a > 0.01 && a < 0.99) {
      softCount++;
    }
    
    // Foreground pixels (> 128 alpha)
    if (a > 0.5) {
      foregroundCount++;
      sumX += x;
      sumY += y;

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  const alphaCoverage = transparentCount / alphaMap.length;
  const softEdgeRatio = transparentCount > 0 ? softCount / transparentCount : 0;

  const bbox = foregroundCount > 0 ? {
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1
  } : { x: 0, y: 0, w: 0, h: 0 };

  const centroid = foregroundCount > 0 ? {
    x: Math.round(sumX / foregroundCount),
    y: Math.round(sumY / foregroundCount)
  } : { x: 0, y: 0 };

  return {
    alphaCoverage,
    softEdgeRatio,
    bbox,
    centroid
  };
}

// 6. SINGLE UNIFIED CHROMA PROCESSING FUNCTION
export async function processKeyedFrame(
  rawUrl: string,
  params: ChromaKeyParams,
  strokes: BrushStroke[],
  frameId: string
): Promise<{ keyedUrl: string; qualityFlags: FrameQualityFlag[] }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = rawUrl;

    img.onload = async () => {
      try {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error("processKeyedFrame Canvas context initialization failed.");
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, width, height);

        // Generate exclusion mask
        const exclusionMask = generateStrokeMask(width, height, strokes, frameId);

        // Run off-thread chroma key
        const { data: keyedBytes, alphaMap } = await runChromaKeyWorker(
          imgData.data,
          width,
          height,
          params,
          exclusionMask
        );

        // Analyze Quality
        const metrics = analyzeAlphaMask(alphaMap, width, height);
        const qualityFlags: FrameQualityFlag[] = [];

        if (metrics.alphaCoverage > 0.999) {
          qualityFlags.push('FULLY_TRANSPARENT');
        } else if (metrics.alphaCoverage < 0.001) {
          qualityFlags.push('FULLY_OPAQUE');
        }

        // Draw results
        const finalImgData = new ImageData(keyedBytes, width, height);
        ctx.putImageData(finalImgData, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve({
              keyedUrl: URL.createObjectURL(blob),
              qualityFlags
            });
          } else {
            reject(new Error("processKeyedFrame toBlob failed."));
          }
        }, 'image/png');

      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (e) => {
      reject(new Error(`Failed to load raw frame image for chroma key processing.`));
    };
  });
}

export async function composeRecoveredFrame(
  rawUrl: string,
  keyedUrl: string,
  recoverMaskUrl: string | undefined,
  fillColorHex: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const rawImg = new Image();
    rawImg.crossOrigin = 'anonymous';
    rawImg.src = rawUrl;

    rawImg.onload = () => {
      const keyedImg = new Image();
      keyedImg.crossOrigin = 'anonymous';
      keyedImg.src = keyedUrl;

      keyedImg.onload = () => {
        const width = rawImg.naturalWidth;
        const height = rawImg.naturalHeight;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;

        // Draw keyed image as base
        ctx.drawImage(keyedImg, 0, 0);
        const keyedData = ctx.getImageData(0, 0, width, height);

        if (!recoverMaskUrl) {
          // No recovery mask, return keyedUrl as recoveredUrl
          resolve(keyedUrl);
          return;
        }

        const maskImg = new Image();
        maskImg.crossOrigin = 'anonymous';
        maskImg.src = recoverMaskUrl;

        maskImg.onload = () => {
          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = width;
          maskCanvas.height = height;
          const maskCtx = maskCanvas.getContext('2d')!;
          maskCtx.drawImage(maskImg, 0, 0);
          const maskData = maskCtx.getImageData(0, 0, width, height).data;

          // Draw raw image to get original pixels
          const rawCanvas = document.createElement('canvas');
          rawCanvas.width = width;
          rawCanvas.height = height;
          const rawCtx = rawCanvas.getContext('2d')!;
          rawCtx.drawImage(rawImg, 0, 0);
          const rawData = rawCtx.getImageData(0, 0, width, height).data;

          const outData = keyedData.data;
          const fillRGB = hexToRgb(fillColorHex);

          for (let i = 0; i < maskData.length; i += 4) {
            const alpha = maskData[i + 3];
            if (alpha > 128) {
              const r = maskData[i];
              const g = maskData[i + 1];
              const b = maskData[i + 2];

              if (r > 128) {
                // Restore Original: copy pixel from raw, set alpha 255
                outData[i] = rawData[i];
                outData[i + 1] = rawData[i + 1];
                outData[i + 2] = rawData[i + 2];
                outData[i + 3] = 255;
              } else if (g > 128) {
                // Color Fill: copy fillColor, set alpha 255
                outData[i] = fillRGB.r;
                outData[i + 1] = fillRGB.g;
                outData[i + 2] = fillRGB.b;
                outData[i + 3] = 255;
              } else if (b > 128) {
                // Erase: alpha 0
                outData[i + 3] = 0;
              }
            }
          }

          ctx.putImageData(keyedData, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject(new Error('toBlob failed in composeRecoveredFrame'));
            }
          }, 'image/png');
        };

        maskImg.onerror = () => {
          resolve(keyedUrl); // Fallback on mask error
        };
      };

      keyedImg.onerror = () => {
        reject(new Error('Failed to load keyed image'));
      };
    };

    rawImg.onerror = () => {
      reject(new Error('Failed to load raw image'));
    };
  });
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
}

export function applyChromaKeyAdvanced(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  params: ChromaKeyParams,
  exclusionMask?: Uint8Array
) {
  processChromaCore(data, width, height, {
    keyingMode: params.keyingMode || 'greenAdvanced',
    previewMode: params.previewMode || 'result',
    tolerance: params.tolerance,
    softness: params.softness,
    enclosedTolerance: params.enclosedTolerance,
    chromaKeyColor: params.chromaKeyColor,
    pickedColor: params.pickedColor,
    despill: params.despill || 0,
    erode: params.erode || 0,
    dilate: params.dilate || 0,
    feather: params.feather || 0,
    alphaContrast: params.alphaContrast || 0,
    removeEnclosed: params.removeEnclosed
  }, exclusionMask);
}
