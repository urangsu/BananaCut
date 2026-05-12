export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function getAlphaBoundingBox(
  imageData: ImageData,
  alphaThreshold: number,
): Box | null {
  const { data, width, height } = imageData;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > alphaThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (minX > maxX || minY > maxY) {
    return null; // Empty or fully transparent
  }

  return {
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1,
  };
}

function yieldToBrowser() {
  return new Promise((resolve) => {
    const handle = setTimeout(() => {
      cancelAnimationFrame(id);
      resolve(null);
    }, 50);
    const id = requestAnimationFrame(() => {
      clearTimeout(handle);
      resolve(null);
    });
  });
}

export async function analyzeFrameBounds(
  frames: any[],
  options: {
    alphaThreshold: number;
    padding: number;
    useProcessed: boolean;
    maxSamples?: number;
    onProgress?: (current: number, total: number) => void;
  },
): Promise<{
  frameBoxes: Array<{ index: number; box: Box | null }>;
  stableBox: Box | null;
  sourceWidth: number;
  sourceHeight: number;
  recommendedCanvas: { width: number; height: number } | null;
  transparentWasteRatio: number;
}> {
  const { alphaThreshold, padding, useProcessed, onProgress, maxSamples } =
    options;

  if (frames.length === 0) {
    return {
      frameBoxes: [],
      stableBox: null,
      sourceWidth: 0,
      sourceHeight: 0,
      recommendedCanvas: null,
      transparentWasteRatio: 0,
    };
  }

  // Find first frame with URL to get dimensions
  let firstFrameIdx = -1;
  let firstFrameUrl = "";
  for (let i = 0; i < frames.length; i++) {
    const url = useProcessed ? frames[i].processedUrl || frames[i].base64 : frames[i].rawUrl;
    if (url) {
      firstFrameIdx = i;
      firstFrameUrl = url;
      break;
    }
  }

  if (firstFrameIdx === -1) {
    throw new Error("No image URL found in any frame.");
  }

  const firstImg = await loadImage(firstFrameUrl);
  const sourceWidth = firstImg.width;
  const sourceHeight = firstImg.height;

  let stableMinX = sourceWidth;
  let stableMinY = sourceHeight;
  let stableMaxX = -1;
  let stableMaxY = -1;

  const frameBoxes: Array<{ index: number; box: Box | null }> = [];

  const canvas = document.createElement("canvas");
  canvas.width = sourceWidth;
  canvas.height = sourceHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Failed to get 2d context");

  const totalToAnalyze = maxSamples
    ? Math.min(frames.length, maxSamples)
    : frames.length;
  // If maxSamples is provided, pick evenly distributed frames
  const indicesToAnalyze: number[] = [];
  if (maxSamples && frames.length > maxSamples) {
    for (let i = 0; i < maxSamples; i++) {
      indicesToAnalyze.push(
        Math.floor((i * (frames.length - 1)) / (maxSamples - 1)),
      );
    }
  } else {
    for (let i = 0; i < frames.length; i++) {
      indicesToAnalyze.push(i);
    }
  }

  let count = 0;
  for (const idx of indicesToAnalyze) {
    if (count > 0 && count % 15 === 0) {
      await yieldToBrowser();
    }
    const f = frames[idx];
    const url = useProcessed ? f.processedUrl || f.base64 : f.rawUrl;
    
    if (!url) {
        frameBoxes.push({ index: idx, box: null });
        count++;
        if (onProgress) onProgress(count, indicesToAnalyze.length);
        continue;
    }

    try {
      const img = await loadImage(url);
      ctx.clearRect(0, 0, sourceWidth, sourceHeight);
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, sourceWidth, sourceHeight);
      const box = getAlphaBoundingBox(imgData, alphaThreshold);

      frameBoxes.push({ index: idx, box });

      if (box) {
        if (box.x < stableMinX) stableMinX = box.x;
        if (box.y < stableMinY) stableMinY = box.y;
        if (box.x + box.w > stableMaxX) stableMaxX = box.x + box.w;
        if (box.y + box.h > stableMaxY) stableMaxY = box.y + box.h;
      }
    } catch (err) {
      console.error("Failed to load frame for analysis", err);
      frameBoxes.push({ index: idx, box: null });
    }

    count++;
    if (onProgress) onProgress(count, indicesToAnalyze.length);
  }

  canvas.width = 1;
  canvas.height = 1;

  let stableBox: Box | null = null;
  let recommendedCanvas = null;
  let transparentWasteRatio = 0;

  if (stableMinX <= stableMaxX && stableMinY <= stableMaxY) {
    // Add padding and clamp
    const finalX = Math.max(0, stableMinX - padding);
    const finalY = Math.max(0, stableMinY - padding);
    const finalMaxX = Math.min(sourceWidth - 1, stableMaxX + padding);
    const finalMaxY = Math.min(sourceHeight - 1, stableMaxY + padding);

    stableBox = {
      x: finalX,
      y: finalY,
      w: finalMaxX - finalX + 1,
      h: finalMaxY - finalY + 1,
    };

    recommendedCanvas = {
      width: stableBox.w,
      height: stableBox.h,
    };

    const sourceArea = sourceWidth * sourceHeight;
    const stableArea = stableBox.w * stableBox.h;
    transparentWasteRatio = Math.max(0, (sourceArea - stableArea) / sourceArea);
  }

  return {
    frameBoxes,
    stableBox,
    sourceWidth,
    sourceHeight,
    recommendedCanvas,
    transparentWasteRatio,
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
