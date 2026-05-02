import { BrushStroke } from '../StudioContext';

export interface ChromaKeyParams {
  keyingMode: 'rgb' | 'hsv' | 'luma' | 'greenAdvanced';
  previewMode: 'result' | 'original' | 'alpha' | 'checkerboard' | 'black' | 'white';
  tolerance: number;
  softness: number;
  enclosedTolerance: number;
  chromaKeyColor: 'White' | 'Green' | 'Picker';
  pickedColor: {r: number, g: number, b: number};
  despill: number;
  erode: number;
  dilate: number;
  feather: number;
  alphaContrast: number;
}

export function generateStrokeMask(width: number, height: number, strokes: BrushStroke[], frameIndex: number): Uint8Array | undefined {
  const activeStrokes = strokes.filter(s => s.targetFrameIndexes.includes(frameIndex));
  if (activeStrokes.length === 0) return undefined;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  // Fill black for background (0)
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
    mask[i] = imgData[i * 4] > 128 ? 1 : 0; // if red channel > 128, consider it white mask
  }
  return mask;
}

export function applyChromaKeyAdvanced(data: Uint8ClampedArray, width: number, height: number, params: ChromaKeyParams, exclusionMask?: Uint8Array) {
  const {
    keyingMode, previewMode, tolerance, softness, enclosedTolerance, 
    chromaKeyColor, pickedColor, despill, erode, dilate, feather, alphaContrast
  } = params;

  let alphaMap = new Float32Array(width * height);
  alphaMap.fill(1.0);

  if (chromaKeyColor === 'Green') {
    const threshold = (tolerance / 100) * 200; 
    for (let i = 0; i < data.length; i += 4) {
      const idx = i / 4;
      if (exclusionMask && exclusionMask[idx] === 1) continue;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      
      let dist = 0;
      if (keyingMode === 'rgb') {
         dist = Math.sqrt((0 - r)**2 + (255 - g)**2 + (0 - b)**2);
      } else if (keyingMode === 'hsv') {
         const max = Math.max(r, g, b), min = Math.min(r, g, b);
         dist = (255 - g) + (max - min) * 0.5;
      } else if (keyingMode === 'luma') {
         dist = Math.abs(g - ((r+b)/2)); 
         dist = 255 - dist * 2;
      } else {
         dist = Math.sqrt(r * r + (255 - g) * (255 - g) + b * b);
         const greennessPenalty = Math.max(0, Math.max(r, b) - g + 30) * 8;
         dist += greennessPenalty;
      }

      if (dist < threshold) {
        alphaMap[idx] = 0;
      } else if (dist < threshold + softness) {
        alphaMap[idx] = (dist - threshold) / Math.max(1, softness);
      }

      if (despill > 0 && alphaMap[idx] < 1) {
        const maxRB = Math.max(r, b);
        if (g > maxRB) {
           const reduction = (g - maxRB) * (despill / 100);
           data[i + 1] = Math.max(maxRB, g - reduction);
        }
      }
    }
  } else {
    // White / Picker
    const visited = new Uint8Array(width * height);
    const stack: number[] = [];
    const getDist = (r: number, g: number, b: number) => {
      if (chromaKeyColor === 'Picker') {
        return Math.sqrt((pickedColor.r - r) ** 2 + (pickedColor.g - g) ** 2 + (pickedColor.b - b) ** 2) * (100 / 441);
      }
      return Math.sqrt((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2) + Math.max(0, (Math.max(r, g, b) - Math.min(r, g, b)) * 4) + (r + g + b < 235 * 3 ? 235 - (r + g + b) / 3 : 0) * 8;
    };

    const processPixel = (idx: number) => {
      if (visited[idx]) return;
      if (exclusionMask && exclusionMask[idx] === 1) return;
      visited[idx] = 1;
      const r = data[idx * 4], g = data[idx * 4 + 1], b = data[idx * 4 + 2];
      const dist = getDist(r, g, b);
      if (dist <= tolerance) {
        alphaMap[idx] = 0; stack.push(idx); 
      } else if (dist <= tolerance + softness) {
        alphaMap[idx] = Math.min(alphaMap[idx], (dist - tolerance) / Math.max(1, softness));
      }
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x < 2 || x >= width - 2 || y < 2 || y >= height - 2) {
          const idx = y * width + x;
          if (!visited[idx]) {
             if (exclusionMask && exclusionMask[idx] === 1) continue;
             if (getDist(data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]) <= tolerance) processPixel(idx);
          }
        }
      }
    }

    while (stack.length > 0) {
      const idx = stack.pop()!;
      const x = idx % width, y = Math.floor(idx / width);
      if (y > 0) processPixel(idx - width); 
      if (y < height - 1) processPixel(idx + width); 
      if (x > 0) processPixel(idx - 1); 
      if (x < width - 1) processPixel(idx + 1); 
    }

    if (enclosedTolerance > 0) {
      for (let i = 0; i < data.length; i += 4) {
        const idx = i / 4;
        if (!visited[idx] && (!exclusionMask || exclusionMask[idx] !== 1)) {
          const dist = getDist(data[i], data[i + 1], data[i + 2]);
          if (dist <= enclosedTolerance) alphaMap[idx] = 0;
          else if (dist <= enclosedTolerance + softness) alphaMap[idx] = Math.min(alphaMap[idx], (dist - enclosedTolerance) / Math.max(1, softness));
        }
      }
    }
  }

  // Morphological & Contrast Ops
  if (erode > 0 || dilate > 0 || feather > 0 || alphaContrast > 0) {
     let tempAlpha = new Float32Array(alphaMap);
     
     if (erode > 0) {
        const eRadius = Math.ceil(erode);
        for(let y=0; y<height; y++) {
          for(let x=0; x<width; x++) {
            let maxA = 0;
            for(let dy=-eRadius; dy<=eRadius; dy++) {
              for(let dx=-eRadius; dx<=eRadius; dx++) {
                const nx = x+dx, ny = y+dy;
                if(nx >= 0 && nx < width && ny >= 0 && ny < height) {
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
        for(let y=0; y<height; y++) {
          for(let x=0; x<width; x++) {
            let minA = 1;
            for(let dy=-dRadius; dy<=dRadius; dy++) {
              for(let dx=-dRadius; dx<=dRadius; dx++) {
                const nx = x+dx, ny = y+dy;
                if(nx >= 0 && nx < width && ny >= 0 && ny < height) {
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
       for(let p=0; p<passes; p++) {
         for(let y=0; y<height; y++) {
           for(let x=0; x<width; x++) {
             let sum = 0, count = 0;
             for(let dy=-1; dy<=1; dy++) {
               for(let dx=-1; dx<=1; dx++) {
                 const nx=x+dx, ny=y+dy;
                 if(nx>=0 && nx<width && ny>=0 && ny<height) {
                   sum += alphaMap[ny*width+nx]; count++;
                 }
               }
             }
             tempAlpha[y*width+x] = sum / count;
           }
         }
         alphaMap.set(tempAlpha);
       }
     }

     if (alphaContrast > 0) {
       const factor = (259 * (alphaContrast + 255)) / (255 * (259 - alphaContrast));
       for(let i=0; i<alphaMap.length; i++) {
          let a = alphaMap[i];
          a = factor * (a - 0.5) + 0.5;
          alphaMap[i] = Math.max(0, Math.min(1, a));
       }
     }
  }

  for (let i = 0; i < data.length; i += 4) {
    const idx = i / 4;
    const alpha = alphaMap[idx];
    switch(previewMode) {
      case 'alpha':
        data[i] = data[i+1] = data[i+2] = alpha * 255;
        data[i+3] = 255;
        break;
      case 'black':
        if (alpha < 1) {
           data[i] *= alpha; data[i+1] *= alpha; data[i+2] *= alpha;
           data[i+3] = 255;
        }
        break;
      case 'white':
        if (alpha < 1) {
           data[i] = data[i] * alpha + 255 * (1 - alpha);
           data[i+1] = data[i+1] * alpha + 255 * (1 - alpha);
           data[i+2] = data[i+2] * alpha + 255 * (1 - alpha);
           data[i+3] = 255;
        }
        break;
      case 'original':
        data[i+3] = 255;
        break;
      case 'result':
      case 'checkerboard':
      default:
        data[i+3] = alpha * 255;
        break;
    }
  }
}
