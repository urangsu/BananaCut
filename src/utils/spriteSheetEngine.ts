import { Box } from "./boundingBox";

export interface SpriteSheetOptions {
  frames: { name: string; url: string }[];
  columns: number;
  spacing: number;
  exportSizeMode: "original" | "recommendedStableCrop" | "customCanvas";
  stableBox: Box | null;
  recommendedCanvas: { width: number; height: number } | null;
  transparentWasteRatio: number;
  alphaThreshold: number;
  cropPadding: number;
  customWidth: number;
  customHeight: number;
  customFit: "contain" | "cover" | "none";
  customAnchor: "center" | "top" | "bottom" | "left" | "right";
  sourceDim: { width: number; height: number } | null;
  fps: number;
  lang: string;
}

export interface SpriteSheetResult {
  blob: Blob;
  metadata: any;
  warning: string | null;
}

export async function generateSpriteSheet(options: SpriteSheetOptions): Promise<SpriteSheetResult> {
  const {
    frames,
    columns,
    spacing,
    exportSizeMode,
    stableBox,
    recommendedCanvas,
    transparentWasteRatio,
    alphaThreshold,
    cropPadding,
    customWidth,
    customHeight,
    customFit,
    customAnchor,
    sourceDim,
    fps,
    lang,
  } = options;

  // Load all images asynchronously
  const images = await Promise.all(
    frames.map((frame) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load frame image: ${frame.name}`));
        img.src = frame.url;
      });
    })
  );

  const cols = Math.min(columns, frames.length);
  const rows = Math.ceil(frames.length / cols);

  let cellWidth = images[0].width;
  let cellHeight = images[0].height;

  if (exportSizeMode === "recommendedStableCrop" && stableBox) {
    cellWidth = stableBox.w;
    cellHeight = stableBox.h;
  } else if (exportSizeMode === "customCanvas") {
    cellWidth = customWidth;
    cellHeight = customHeight;
  }

  const finalWidth = cols * cellWidth + (cols + 1) * spacing;
  const finalHeight = rows * cellHeight + (rows + 1) * spacing;

  const metadata: any = {
    frames: [],
    meta: {
      fps,
      columns: cols,
      rows,
      spacing,
      width: finalWidth,
      height: finalHeight,
      exportSizeMode,
      alphaThreshold,
      padding: cropPadding,
      sourceWidth: sourceDim?.width,
      sourceHeight: sourceDim?.height,
      cropApplied: exportSizeMode === "recommendedStableCrop" && !!stableBox,
      rawFramesPreservedOriginalCanvas: true
    },
  };

  if (exportSizeMode === "recommendedStableCrop" && stableBox) {
    metadata.meta.stableBox = stableBox;
    metadata.meta.recommendedCanvas = recommendedCanvas;
    metadata.meta.transparentWasteRatio = transparentWasteRatio;
  } else if (exportSizeMode === "customCanvas") {
    metadata.meta.customCanvas = {
      width: customWidth,
      height: customHeight,
      fitMode: customFit,
      anchor: customAnchor,
    };
  }

  let warning: string | null = null;
  if (finalWidth > 8192 || finalHeight > 8192) {
    warning = lang === "KR"
      ? "경고: 캔버스 크기가 8192px를 초과하여 일부 브라우저에서 깨질 수 있습니다."
      : lang === "EN"
        ? "Warning: Canvas size exceeds 8192px, which may cause rendering issues in some browsers."
        : "警告: キャンバスサイズが8192pxを超えているため、一部のブラウザで表示が崩れる可能性があります.";
  }

  const canvas = document.createElement("canvas");
  canvas.width = finalWidth;
  canvas.height = finalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to obtain 2D canvas context.");
  }

  ctx.clearRect(0, 0, finalWidth, finalHeight);

  images.forEach((img, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    const cellX = spacing + col * (cellWidth + spacing);
    const cellY = spacing + row * (cellHeight + spacing);

    let sX = 0,
      sY = 0,
      sW = img.width,
      sH = img.height;
    let dX = cellX,
      dY = cellY,
      dW = cellWidth,
      dH = cellHeight;

    if (exportSizeMode === "recommendedStableCrop" && stableBox) {
      sX = stableBox.x;
      sY = stableBox.y;
      sW = stableBox.w;
      sH = stableBox.h;
    } else if (exportSizeMode === "customCanvas") {
      if (customFit === "none") {
        sX = 0;
        sY = 0;
        sW = img.width;
        sH = img.height;
        dW = img.width;
        dH = img.height;
        if (customAnchor === "center") {
          dX += (cellWidth - dW) / 2;
          dY += (cellHeight - dH) / 2;
        } else if (customAnchor === "top") {
          dX += (cellWidth - dW) / 2;
        } else if (customAnchor === "bottom") {
          dX += (cellWidth - dW) / 2;
          dY += cellHeight - dH;
        } else if (customAnchor === "left") {
          dY += (cellHeight - dH) / 2;
        } else if (customAnchor === "right") {
          dX += cellWidth - dW;
          dY += (cellHeight - dH) / 2;
        }
      } else if (customFit === "contain") {
        const scale = Math.min(
          cellWidth / img.width,
          cellHeight / img.height
        );
        dW = img.width * scale;
        dH = img.height * scale;
        if (customAnchor === "center") {
          dX += (cellWidth - dW) / 2;
          dY += (cellHeight - dH) / 2;
        } else if (customAnchor === "top") {
          dX += (cellWidth - dW) / 2;
        } else if (customAnchor === "bottom") {
          dX += (cellWidth - dW) / 2;
          dY += cellHeight - dH;
        } else if (customAnchor === "left") {
          dY += (cellHeight - dH) / 2;
        } else if (customAnchor === "right") {
          dX += cellWidth - dW;
          dY += (cellHeight - dH) / 2;
        }
      } else if (customFit === "cover") {
        const scale = Math.max(
          cellWidth / img.width,
          cellHeight / img.height
        );
        sW = cellWidth / scale;
        sH = cellHeight / scale;
        if (customAnchor === "center") {
          sX = (img.width - sW) / 2;
          sY = (img.height - sH) / 2;
        } else if (customAnchor === "top") {
          sX = (img.width - sW) / 2;
          sY = 0;
        } else if (customAnchor === "bottom") {
          sX = (img.width - sW) / 2;
          sY = img.height - sH;
        } else if (customAnchor === "left") {
          sX = 0;
          sY = (img.height - sH) / 2;
        } else if (customAnchor === "right") {
          sX = img.width - sW;
          sY = (img.height - sH) / 2;
        }
      }
    }

    ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);

    metadata.frames.push({
      name: frames[index].name,
      x: Math.floor(dX),
      y: Math.floor(dY),
      w: Math.floor(dW),
      h: Math.floor(dH),
      sourceX: Math.floor(sX),
      sourceY: Math.floor(sY),
      sourceW: Math.floor(sW),
      sourceH: Math.floor(sH),
    });
  });

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });

  if (!blob) {
    throw new Error("Failed to convert stitched canvas to a PNG Blob.");
  }

  // Free memory
  canvas.width = 0;
  canvas.height = 0;

  return {
    blob,
    metadata,
    warning,
  };
}
