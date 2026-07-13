export interface ChromaCoreParams {
  keyingMode: 'rgb' | 'hsv' | 'luma' | 'greenAdvanced';
  previewMode: 'result' | 'original' | 'alpha' | 'checkerboard' | 'black' | 'white';
  tolerance: number;
  softness: number;
  enclosedTolerance: number;
  chromaKeyColor: 'White' | 'Green' | 'Picker';
  pickedColor: { r: number; g: number; b: number };
  despill: number;
  erode: number;
  dilate: number;
  feather: number;
  alphaContrast: number;
  removeEnclosed?: boolean;
}

export function getChromaDistance(
  r: number,
  g: number,
  b: number,
  params: ChromaCoreParams
): number {
  const { chromaKeyColor, keyingMode, pickedColor } = params;
  if (chromaKeyColor === 'Green') {
    if (keyingMode === 'rgb') {
      return Math.sqrt((0 - r) ** 2 + (255 - g) ** 2 + (0 - b) ** 2) * (100 / 441);
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
      let hDist = Math.abs(h - 1 / 3);
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
}

export function processChromaCore(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  params: ChromaCoreParams,
  exclusionMask?: Uint8Array
): { data: Uint8ClampedArray; alphaMap: Float32Array } {
  const {
    removeEnclosed,
    tolerance,
    softness,
    despill,
    erode,
    dilate,
    feather,
    alphaContrast,
    previewMode,
    chromaKeyColor
  } = params;

  const alphaMap = new Float32Array(width * height);
  alphaMap.fill(1.0);

  const visited = new Uint8Array(width * height);

  if (!removeEnclosed) {
    // Contiguous mode (flood fill from edges)
    const queue: number[] = [];
    const pushQueue = (idx: number) => {
      if (idx < 0 || idx >= width * height) return;
      if (visited[idx]) return;
      if (exclusionMask && exclusionMask[idx] === 1) return;
      visited[idx] = 1;

      const r = data[idx * 4];
      const g = data[idx * 4 + 1];
      const b = data[idx * 4 + 2];
      const dist = getChromaDistance(r, g, b, params);

      if (dist <= tolerance) {
        alphaMap[idx] = 0;
        queue.push(idx);
      } else if (dist <= tolerance + softness) {
        alphaMap[idx] = (dist - tolerance) / Math.max(1, softness);
      }
    };

    // Push outer edges
    for (let x = 0; x < width; x++) {
      pushQueue(x);
      pushQueue((height - 1) * width + x);
    }
    for (let y = 1; y < height - 1; y++) {
      pushQueue(y * width);
      pushQueue(y * width + (width - 1));
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
    // Global mode (Remove Enclosed Background is ON)
    for (let i = 0; i < data.length; i += 4) {
      const idx = i / 4;
      if (exclusionMask && exclusionMask[idx] === 1) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const dist = getChromaDistance(r, g, b, params);

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
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
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

  // Morphological operations
  if (erode > 0 || dilate > 0 || feather > 0 || alphaContrast > 0) {
    const tempAlpha = new Float32Array(alphaMap);

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

  return { data, alphaMap };
}
