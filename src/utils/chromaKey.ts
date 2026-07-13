import { ChromaKeyParams, StudioFrame, FrameQualityFlag } from '../types/mediaPipeline';
import { BrushStroke } from '../StudioContext';

// 1. Dominant Key Color Estimator
export function estimateKeyColor(imageData: ImageData): 'Green' | 'White' {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  let greenCount = 0;
  let whiteCount = 0;
  let sampleCount = 0;

  // Sample outer 10% border pixels where background usually is
  const borderY = Math.max(1, Math.round(height * 0.1));
  const borderX = Math.max(1, Math.round(width * 0.1));

  const checkPixel = (idx: number) => {
    const r = data[idx * 4];
    const g = data[idx * 4 + 1];
    const b = data[idx * 4 + 2];
    sampleCount++;

    // Green dominant: g is significantly larger than r and b
    if (g > r + 30 && g > b + 30) {
      greenCount++;
    }
    // White: high luminance, low saturation
    const maxVal = Math.max(r, g, b);
    const minVal = Math.min(r, g, b);
    const sat = maxVal === 0 ? 0 : (maxVal - minVal) / maxVal;
    if (maxVal > 200 && sat < 0.15) {
      whiteCount++;
    }
  };

  // Top and bottom borders
  for (let y = 0; y < borderY; y++) {
    for (let x = 0; x < width; x += 10) {
      checkPixel(y * width + x);
    }
  }
  for (let y = height - borderY; y < height; y++) {
    for (let x = 0; x < width; x += 10) {
      checkPixel(y * width + x);
    }
  }
  // Left and right borders
  for (let y = borderY; y < height - borderY; y += 10) {
    for (let x = 0; x < borderX; x++) {
      checkPixel(y * width + x);
    }
    for (let x = width - borderX; x < width; x++) {
      checkPixel(y * width + x);
    }
  }

  if (greenCount > whiteCount && greenCount > sampleCount * 0.1) {
    return 'Green';
  }
  if (whiteCount > greenCount && whiteCount > sampleCount * 0.1) {
    return 'White';
  }
  return 'Green'; // safe fallback default
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
self.onmessage = function(e) {
  const { data, width, height, params, exclusionMask } = e.data;
  const {
    keyingMode, previewMode, tolerance, softness, enclosedTolerance, 
    chromaKeyColor, pickedColor, despill, erode, dilate, feather, alphaContrast,
    removeEnclosed
  } = params;

  let alphaMap = new Float32Array(width * height);
  alphaMap.fill(1.0);

  const getDist = (r, g, b) => {
    if (chromaKeyColor === 'Green') {
      if (keyingMode === 'rgb') {
        return Math.sqrt((0 - r)**2 + (255 - g)**2 + (0 - b)**2) * (100 / 441);
      } else if (keyingMode === 'hsv') {
        const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
        const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
        const d = max - min;
        let h = 0;
        if (max !== min) {
          switch (max) {
            case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
            case gNorm: h = (bNorm - rNorm) / d + 2; break;
            case bNorm: h = (rNorm - gNorm) / d + 4; break;
          }
          h /= 6;
        }
        let hDist = Math.abs(h - 1/3);
        if (hDist > 0.5) hDist = 1 - hDist;
        const s = max === 0 ? 0 : d / max;
        const v = max;
        return (hDist * 3 * 255) + ((1 - s) * 100) + ((1 - v) * 50);
      } else if (keyingMode === 'luma') {
        const dist = Math.abs(g - ((r + b) / 2));
        return (255 - dist * 2) * (100 / 255);
      } else {
        // greenAdvanced (default)
        const dist = Math.sqrt(r * r + (255 - g) * (255 - g) + b * b) * (100 / 441);
        const greennessPenalty = Math.max(0, Math.max(r, b) - g + 30) * 8;
        return dist + (greennessPenalty * 0.1);
      }
    } else if (chromaKeyColor === 'Picker') {
      return Math.sqrt((pickedColor.r - r) ** 2 + (pickedColor.g - g) ** 2 + (pickedColor.b - b) ** 2) * (100 / 441);
    } else {
      // White keying
      return Math.sqrt((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2) * (100 / 441);
    }
  };

  const visited = new Uint8Array(width * height);

  // If removeEnclosed is false (default), start flood fill from the borders (Contiguous Mode)
  if (!removeEnclosed) {
    const queue = [];
    const pushQueue = (idx) => {
      if (idx < 0 || idx >= width * height) return;
      if (visited[idx]) return;
      if (exclusionMask && exclusionMask[idx] === 1) return;
      visited[idx] = 1;
      
      const r = data[idx * 4], g = data[idx * 4 + 1], b = data[idx * 4 + 2];
      const dist = getDist(r, g, b);
      if (dist <= tolerance) {
        alphaMap[idx] = 0;
        queue.push(idx);
      } else if (dist <= tolerance + softness) {
        alphaMap[idx] = (dist - tolerance) / Math.max(1, softness);
      }
    };

    // Push outer edges
    for (let x = 0; x < width; x++) {
      pushQueue(x); // Top border
      pushQueue((height - 1) * width + x); // Bottom border
    }
    for (let y = 1; y < height - 1; y++) {
      pushQueue(y * width); // Left border
      pushQueue(y * width + (width - 1)); // Right border
    }

    // Process queue
    let head = 0;
    while (head < queue.length) {
      const idx = queue[head++];
      const x = idx % width;
      const y = Math.floor(idx / width);

      if (y > 0) pushQueue(idx - width);
      if (y < height - 1) pushQueue(idx + width);
      if (x > 0) pushQueue(idx - 1);
      if (x < width - 1) pushQueue(idx + 1);
    }
  } else {
    // Global Mode (Remove Enclosed Background is ON)
    for (let i = 0; i < data.length; i += 4) {
      const idx = i / 4;
      if (exclusionMask && exclusionMask[idx] === 1) continue;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const dist = getDist(r, g, b);

      if (dist <= tolerance) {
        alphaMap[idx] = 0;
      } else if (dist <= tolerance + softness) {
        alphaMap[idx] = (dist - tolerance) / Math.max(1, softness);
      }
    }
  }

  // Despill Color Operation
  if (despill > 0) {
    for (let i = 0; i < data.length; i += 4) {
      const idx = i / 4;
      if (alphaMap[idx] < 1) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (chromaKeyColor === 'Green') {
          const maxRB = Math.max(r, b);
          if (g > maxRB) {
            const reduction = (g - maxRB) * (despill / 100);
            data[i + 1] = Math.max(maxRB, g - reduction);
          }
        }
      }
    }
  }

  // Morphological operations (Erode, Dilate, Feather, Alpha Contrast)
  if (erode > 0 || dilate > 0 || feather > 0 || alphaContrast > 0) {
    let tempAlpha = new Float32Array(alphaMap);

    if (erode > 0) {
      const eRadius = Math.ceil(erode);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let maxA = 0;
          for (let dy = -eRadius; dy <= eRadius; dy++) {
            for (let dx = -eRadius; dx <= eRadius; dx++) {
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                maxA = Math.max(maxA, alphaMap[ny * width + nx]);
              }
            }
          }
          tempAlpha[y * width + x] = maxA;
        }
      }
      alphaMap.set(tempAlpha);
    }

    if (dilate > 0) {
      const dRadius = Math.ceil(dilate);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let minA = 1;
          for (let dy = -dRadius; dy <= dRadius; dy++) {
            for (let dx = -dRadius; dx <= dRadius; dx++) {
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                minA = Math.min(minA, alphaMap[ny * width + nx]);
              }
            }
          }
          tempAlpha[y * width + x] = minA;
        }
      }
      alphaMap.set(tempAlpha);
    }

    if (feather > 0) {
      const passes = Math.ceil(feather / 2);
      for (let p = 0; p < passes; p++) {
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let sum = 0, count = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  sum += alphaMap[ny * width + nx];
                  count++;
                }
              }
            }
            tempAlpha[y * width + x] = sum / count;
          }
        }
        alphaMap.set(tempAlpha);
      }
    }

    if (alphaContrast > 0) {
      const factor = (259 * (alphaContrast + 255)) / (255 * (259 - alphaContrast));
      for (let i = 0; i < alphaMap.length; i++) {
        let a = alphaMap[i];
        a = factor * (a - 0.5) + 0.5;
        alphaMap[i] = Math.max(0, Math.min(1, a));
      }
    }
  }

  // Preview Mode Application
  for (let i = 0; i < data.length; i += 4) {
    const idx = i / 4;
    const alpha = alphaMap[idx];
    switch (previewMode) {
      case 'alpha':
        data[i] = data[i + 1] = data[i + 2] = alpha * 255;
        data[i + 3] = 255;
        break;
      case 'black':
        data[i] *= alpha;
        data[i + 1] *= alpha;
        data[i + 2] *= alpha;
        data[i + 3] = 255;
        break;
      case 'white':
        data[i] = data[i] * alpha + 255 * (1 - alpha);
        data[i + 1] = data[i + 1] * alpha + 255 * (1 - alpha);
        data[i + 2] = data[i + 2] * alpha + 255 * (1 - alpha);
        data[i + 3] = 255;
        break;
      case 'original':
        data[i + 3] = 255;
        break;
      case 'result':
      case 'checkerboard':
      default:
        data[i + 3] = alpha * 255;
        break;
    }
  }

  self.postMessage({ data, alphaMap }, [data.buffer]);
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
  const {
    keyingMode,
    tolerance,
    softness,
    chromaKeyColor,
    pickedColor,
    despill = 0,
    alphaContrast = 0
  } = params;

  const keyR = chromaKeyColor === 'Green' ? 0 : chromaKeyColor === 'Picker' ? pickedColor.r : 255;
  const keyG = chromaKeyColor === 'Green' ? 255 : chromaKeyColor === 'Picker' ? pickedColor.g : 255;
  const keyB = chromaKeyColor === 'Green' ? 0 : chromaKeyColor === 'Picker' ? pickedColor.b : 255;

  for (let i = 0; i < width * height; i++) {
    if (exclusionMask && exclusionMask[i] === 1) {
      continue;
    }

    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];

    let dist = 0;
    if (chromaKeyColor === 'Green') {
      if (keyingMode === 'rgb') {
        dist = Math.sqrt((r - 0) ** 2 + (g - 255) ** 2 + (b - 0) ** 2) * (100 / 441);
      } else if (keyingMode === 'luma') {
        dist = (255 - Math.abs(g - (r + b) / 2) * 2) * (100 / 255);
      } else {
        dist = Math.sqrt(r * r + (255 - g) * (255 - g) + b * b) * (100 / 441);
        const penalty = Math.max(0, Math.max(r, b) - g + 30) * 8;
        dist += penalty * 0.1;
      }
    } else {
      dist = Math.sqrt((keyR - r) ** 2 + (keyG - g) ** 2 + (keyB - b) ** 2) * (100 / 441);
    }

    let alpha = 1.0;
    if (dist <= tolerance) {
      alpha = 0;
    } else if (dist <= tolerance + softness) {
      alpha = (dist - tolerance) / Math.max(1, softness);
    }

    // Apply alpha contrast
    if (alphaContrast > 0 && alpha > 0 && alpha < 1) {
      const shift = alphaContrast / 100;
      alpha = 1 / (1 + Math.exp(-((alpha - 0.5) * (12 * shift))));
    }

    // Apply Despill
    if (despill > 0 && chromaKeyColor === 'Green') {
      const maxRB = Math.max(r, b);
      if (g > maxRB) {
        const factor = despill / 100;
        data[i * 4 + 1] = g - (g - maxRB) * factor;
      }
    }

    data[i * 4 + 3] = Math.round(alpha * 255);
  }
}
