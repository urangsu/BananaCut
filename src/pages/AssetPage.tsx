import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../LanguageContext";
import { useTheme } from "../ThemeContext";
import { useStudio } from "../StudioContext";
import { useFFmpeg } from "../FFmpegContext";
import {
  Download,
  Film,
  LayoutGrid,
  Loader2,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { useBatchJob } from "../hooks/useBatchJob";
import { generateStrokeMask, applyChromaKeyAdvanced } from "../utils/chromaKey";
import { normalizeChromaKeyParams } from "../utils/chromaKeyParams";
import { PerfLogger } from "../utils/performanceLogger";
import { getFrameDisplayUrl } from "../utils/frameUtils";
import { analyzeFrameBounds, Box } from "../utils/boundingBox";
import { Modal } from "../components/Modal";
import { Copy, Scan, Maximize, Target } from "lucide-react";
import { generateSampleFrames, revokeSampleFrames } from "../utils/sampleProject";
import { trackEvent } from "../lib/analytics";

export default function AssetPage() {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const { frames, setFrames, fps, exclusionStrokes, charName, setCharName, segments, setSegments } = useStudio();
  const { ffmpeg, loadState, loadFFmpeg } = useFFmpeg();
  const {
    isProcessing: isBatchProcessing,
    progress: batchProgress,
    startJob,
    cancelJob,
  } = useBatchJob();

  const [showDirtyModal, setShowDirtyModal] = useState(false);
  const [dirtyAction, setDirtyAction] = useState<(() => Promise<void>) | null>(
    null,
  );
  const [dirtyAnywayAction, setDirtyAnywayAction] = useState<
    (() => Promise<void>) | null
  >(null);
  const [failedItems, setFailedItems] = useState<number[]>([]);

  // Video Export State
  const [isVideoProcessing, setIsVideoProcessing] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [ffmpegError, setFfmpegError] = useState<string | null>(null);
  const [showTechErrorModal, setShowTechErrorModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Sprite Sheet State
  const [columns, setColumns] = useState<number>(4);
  const [spacing, setSpacing] = useState<number>(0);
  const [isSpriteProcessing, setIsSpriteProcessing] = useState(false);
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null);
  const [spriteJson, setSpriteJson] = useState<string | null>(null);
  const [spriteWarning, setSpriteWarning] = useState<string | null>(null);

  // Smart Crop Recommendation State
  const [sourceDim, setSourceDim] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [stableBox, setStableBox] = useState<Box | null>(null);
  const [recommendedCanvas, setRecommendedCanvas] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [transparentWasteRatio, setTransparentWasteRatio] = useState<number>(0);
  const [alphaThreshold, setAlphaThreshold] = useState<number>(10);
  const [cropPadding, setCropPadding] = useState<number>(8);
  const [isAnalyzingCrop, setIsAnalyzingCrop] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);

  // Export Mode
  const [exportSizeMode, setExportSizeMode] = useState<
    "original" | "recommendedStableCrop" | "customCanvas"
  >("original");

  // Custom Canvas Settings
  const [customWidth, setCustomWidth] = useState<number>(512);
  const [customHeight, setCustomHeight] = useState<number>(512);
  const [customAnchor, setCustomAnchor] = useState<
    "center" | "top" | "bottom" | "left" | "right"
  >("center");
  const [customFit, setCustomFit] = useState<"contain" | "cover" | "none">(
    "contain",
  );

  const [showCropPreview, setShowCropPreview] = useState(false);

  const isDark = theme === "dark";

  const processDirtyFrames = async (
    dirtyIndices: number[],
  ): Promise<number[]> => {
    setFailedItems([]);
    const newFrames = [...frames];

    // Load config from localStorage
    const params = normalizeChromaKeyParams({
      keyingMode:
        (localStorage.getItem("ck_keyingMode") as any) || "greenAdvanced",
      previewMode: "result" as const,
      tolerance: Number(localStorage.getItem("ck_tolerance")) || 30,
      softness: Number(localStorage.getItem("ck_softness")) || 20,
      enclosedTolerance:
        Number(localStorage.getItem("ck_enclosedTolerance")) || 10,
      chromaKeyColor:
        (localStorage.getItem("ck_chromaKeyColor") as any) || "White",
      pickedColor: (() => {
        try {
          return JSON.parse(localStorage.getItem("ck_pickedColor") || '{"r":255,"g":255,"b":255}');
        } catch {
          return { r: 255, g: 255, b: 255 };
        }
      })(),
      despill: Number(localStorage.getItem("ck_despill")) || 0,
      erode: Number(localStorage.getItem("ck_erode")) || 0,
      dilate: Number(localStorage.getItem("ck_dilate")) || 0,
      feather: Number(localStorage.getItem("ck_feather")) || 0,
      alphaContrast: Number(localStorage.getItem("ck_alphaContrast")) || 0,
    });

    return new Promise((resolve) => {
      startJob<number, void>({
        items: dirtyIndices,
        delayMs: 0,
        processItem: async (idx, resultIndex) => {
          const frame = newFrames[idx];
          const img = new Image();
          img.src = frame.rawUrl;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
          ctx.drawImage(img, 0, 0);

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const mask = generateStrokeMask(
            canvas.width,
            canvas.height,
            exclusionStrokes,
            idx,
          );
          PerfLogger.start("AssetPage_applyChromaKeyAdvanced");
          applyChromaKeyAdvanced(
            imgData.data,
            canvas.width,
            canvas.height,
            params,
            mask,
          );
          PerfLogger.end("AssetPage_applyChromaKeyAdvanced");
          ctx.putImageData(imgData, 0, 0);

          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/png"),
          );
          if (blob) {
            const newUrl = URL.createObjectURL(blob);
            if (frame.processedUrl) URL.revokeObjectURL(frame.processedUrl);
            newFrames[idx] = { ...frame, processedUrl: newUrl, dirty: false };
          }
        },
        onSuccess: () => {
          setFrames(newFrames);
          resolve([]);
        },
        onPartialSuccess: (_, failed) => {
          setFrames(newFrames);
          setFailedItems(failed);
          resolve(failed);
        },
        onError: () => {
          resolve(dirtyIndices);
        },
      });
    });
  };

  const checkDirtyAndRun = (runAction: () => Promise<void>) => {
    const dirtyIndices = frames
      .map((f, i) => (!f.processedUrl || f.dirty ? i : -1))
      .filter((i) => i !== -1);
    if (dirtyIndices.length > 0) {
      setDirtyAction(() => async () => {
        const failed = await processDirtyFrames(dirtyIndices);
        if (failed.length === 0) {
          runAction();
        }
      });
      setDirtyAnywayAction(() => async () => {
        runAction();
      });
      setShowDirtyModal(true);
      return;
    }
    runAction();
  };

  // --- Feature A: Transparent Video Export ---
  const executeExportVideo = async () => {
    if (frames.length === 0) return;

    setIsVideoProcessing(true);
    let currentFFmpeg = ffmpeg;
    try {
      if (loadState !== "loaded" || !currentFFmpeg) {
        currentFFmpeg = await loadFFmpeg();
      }

      if (!currentFFmpeg) {
        throw new Error("FFmpeg instance is null after load attempt");
      }
    } catch (err) {
      setIsVideoProcessing(false);
      setFfmpegError(err instanceof Error ? err.message : String(err));
      setShowTechErrorModal(true);
      return;
    }

    setVideoProgress(0);
    setVideoUrl(null);

    try {
      // Write frames to FFmpeg FS
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const url = getFrameDisplayUrl(frame, true);
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        await currentFFmpeg.writeFile(
          `frame_${i.toString().padStart(4, "0")}.png`,
          new Uint8Array(buffer),
        );
      }

      currentFFmpeg.on("progress", ({ progress }) => {
        setVideoProgress(Math.round(progress * 100));
      });

      // Encode to WebM with alpha channel
      // -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0
      await currentFFmpeg.exec([
        "-framerate",
        fps.toString(),
        "-i",
        "frame_%04d.png",
        "-c:v",
        "libvpx-vp9",
        "-pix_fmt",
        "yuva420p",
        "-auto-alt-ref",
        "0",
        "-b:v",
        "2M",
        "output.webm",
      ]);

      const data = await currentFFmpeg.readFile("output.webm");
      const blob = new Blob([data], { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);

      // Cleanup
      for (let i = 0; i < frames.length; i++) {
        await currentFFmpeg.deleteFile(
          `frame_${i.toString().padStart(4, "0")}.png`,
        );
      }
      await currentFFmpeg.deleteFile("output.webm");
    } catch (error) {
      console.error("Video export failed:", error);
    } finally {
      setIsVideoProcessing(false);
      setVideoProgress(0);
    }
  };

  const handleExportVideo = () => checkDirtyAndRun(executeExportVideo);

  // --- Feature B: Sprite Sheet Generator ---
  const handleAnalyzeCrop = async () => {
    if (frames.length === 0) return;
    setIsAnalyzingCrop(true);
    setAnalyzeProgress(0);

    try {
      const result = await analyzeFrameBounds(frames, {
        alphaThreshold,
        padding: cropPadding,
        useProcessed: true,
        onProgress: (current, total) =>
          setAnalyzeProgress(Math.round((current / total) * 100)),
      });

      setSourceDim({ width: result.sourceWidth, height: result.sourceHeight });
      setStableBox(result.stableBox);
      setRecommendedCanvas(result.recommendedCanvas);
      setTransparentWasteRatio(result.transparentWasteRatio);

      if (result.stableBox) {
        setExportSizeMode("recommendedStableCrop");
      }
    } catch (err) {
      console.error("Analyze failed", err);
    } finally {
      setIsAnalyzingCrop(false);
      setAnalyzeProgress(0);
    }
  };

  const executeExportSprite = async () => {
    if (frames.length === 0) return;

    setIsSpriteProcessing(true);
    setSpriteUrl(null);
    setSpriteJson(null);
    setSpriteWarning(null);

    try {
      // Load all images
      const images = await Promise.all(
        frames.map((frame) => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = getFrameDisplayUrl(frame, true);
          });
        }),
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
          cropApplied: exportSizeMode === "recommendedStableCrop" && !!stableBox,
          rawFramesPreservedOriginalCanvas: true
        },
      };

      if (exportSizeMode === "recommendedStableCrop") {
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

      if (finalWidth > 8192 || finalHeight > 8192) {
        setSpriteWarning(
          lang === "KR"
            ? "경고: 캔버스 크기가 8192px를 초과하여 일부 브라우저에서 깨질 수 있습니다."
            : lang === "EN"
              ? "Warning: Canvas size exceeds 8192px, which may cause rendering issues in some browsers."
              : "警告: キャンバスサイズが8192pxを超えているため、一部のブラウザで表示が崩れる可能性があります。",
        );
      }

      const canvas = document.createElement("canvas");
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
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
                cellHeight / img.height,
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
                cellHeight / img.height,
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
            name:
              frames[index].name ||
              `frame_${index.toString().padStart(4, "0")}`,
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

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setSpriteUrl(url);

            const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], {
              type: "application/json",
            });
            setSpriteJson(URL.createObjectURL(jsonBlob));
          }
          setIsSpriteProcessing(false);
          // Free memory
          canvas.width = 0;
          canvas.height = 0;
        }, "image/png");
      } else {
        setIsSpriteProcessing(false);
      }
    } catch (error) {
      console.error("Sprite generation failed:", error);
      setIsSpriteProcessing(false);
    }
  };

  const handleExportSprite = () => checkDirtyAndRun(executeExportSprite);

  return (
    <div
      className={`flex-1 overflow-y-auto p-4 lg:p-8 ${isDark ? "bg-[#121212] text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">ASSET</h1>
          <p className={`${isDark ? "text-white/60" : "text-gray-500"}`}>
            {lang === "KR" ? (
              "정리된 프레임을 게임, 앱, 영상에 바로 쓸 수 있는 에셋으로 내보내세요."
            ) : lang === "EN" ? (
              "Export your cleaned frames as assets for games, apps, and videos."
            ) : (
              "整理したフレームをゲーム、アプリ、動画で使えるアセットとして書き出せます。"
            )}
          </p>
          {frames.length > 0 && (
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 flex flex-wrap gap-4 items-center">
                <span>
                  {lang === "KR"
                    ? `공유된 ${frames.length}개 프레임으로 에셋을 만들 수 있습니다.`
                    : lang === "EN"
                      ? `Create assets from ${frames.length} shared frames.`
                      : `共有された${frames.length}個のフレームでアセットを作成できます。`}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${isDark ? "bg-white/10 text-white/70" : "bg-gray-100 text-gray-600"}`}
                >
                  {lang === "KR" ? "처리 완료: " : "Processed: "}
                  {frames.filter((f) => f.processedUrl && !f.dirty).length} / {frames.length}
                </span>
                {frames.some((f) => !f.processedUrl || f.dirty) && (
                  <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 font-semibold flex items-center gap-1 border border-yellow-500/20">
                    <AlertTriangle className="w-3 h-3" />
                    {lang === "KR" ? "아직 처리되지 않은 프레임 " : "Unprocessed frames: "}
                    {frames.filter((f) => !f.processedUrl || f.dirty).length}
                    {lang === "KR" ? "개" : ""}
                  </span>
                )}
              </p>
              {frames.some((f) => !f.processedUrl || f.dirty) && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 gap-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                        {lang === "KR" 
                          ? "일부 프레임이 아직 처리되지 않았습니다." 
                          : lang === "EN" 
                            ? "Some frames are unprocessed." 
                            : "一部のフレームがまだ処理されていません。"}
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-400/80 mt-1">
                        {lang === "KR" 
                          ? "최종 에셋 품질을 위해 먼저 프레임 처리를 완료하는 것을 권장합니다." 
                          : lang === "EN" 
                            ? "We recommend processing all frames first for the best final asset quality." 
                            : "最高のアセット品質を得るために、まずフレーム処理を完了することをお勧めします。"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                       document.dispatchEvent(new CustomEvent("navigate", { detail: "remove" }));
                    }}
                    className="shrink-0 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm w-full sm:w-auto"
                  >
                    {lang === "KR" ? "Remove에서 계속 편집하기" : lang === "EN" ? "Continue editing in Remove" : "Removeで編集を続ける"}
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        {frames.length === 0 ? (
          <div
            className={`p-12 text-center rounded-2xl border border-dashed ${isDark ? "border-white/20 bg-white/5" : "border-gray-300 bg-white"} flex flex-col items-center justify-center space-y-4`}
          >
            <p
              className={`text-lg ${isDark ? "text-white/50" : "text-gray-500"}`}
            >
              {lang === "KR"
                ? "먼저 REMOVE 탭에서 프레임을 추출해주세요."
                : lang === "EN"
                  ? "Please extract frames in the REMOVE tab first."
                  : "まずREMOVEタブでフレームを抽出してください。"}
            </p>
            <button
              onClick={() =>
                document.dispatchEvent(
                  new CustomEvent("navigate", { detail: "remove" }),
                )
              }
              className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition-colors shadow-lg"
            >
              {lang === "KR" ? "Remove 화면으로 이동" : "Start from Remove"}
            </button>
            <div className="pt-4 mt-2 border-t border-gray-200 dark:border-white/10 w-full flex justify-center">
              <button
                type="button"
                onClick={async () => {
                  trackEvent('Try_Sample_Project');
                  try {
                    if (frames.length > 0) {
                      revokeSampleFrames(frames);
                    }
                    const sampleFrames = await generateSampleFrames(16);
                    setFrames(sampleFrames);
                    if (!charName) {
                      setCharName('banana_sample');
                    }
                    if (segments.length === 0) {
                      setSegments([{ name: 'idle_sitting', start: 0, end: sampleFrames.length / fps }]);
                    }
                    trackEvent('Sample_Project_Loaded');
                  } catch (e) {
                    console.error(e);
                    trackEvent('Sample_Project_Failed');
                    alert(lang === "KR" ? "샘플 로드 실패" : "Failed to load sample");
                  }
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {lang === 'KR' ? '샘플 프로젝트 체험하기' : lang === 'EN' ? 'Try Sample Project' : 'サンプルプロジェクトを試す'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Transparent Video Export */}
            <div
              className={`p-6 rounded-2xl border flex flex-col order-2 opacity-90 ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-gray-200"}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-3 rounded-xl ${isDark ? "bg-blue-500/20" : "bg-blue-100"}`}
                >
                  <Film
                    className={`w-6 h-6 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {lang === "KR"
                      ? "투명 비디오 내보내기"
                      : lang === "EN"
                        ? "Transparent Video"
                        : "透過ビデオ"}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20">
                      {lang === "KR" ? "고급" : lang === "EN" ? "Advanced" : "高度"}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`flex-1 mb-[52px] text-sm leading-relaxed ${isDark ? "text-white/70" : "text-gray-600"}`}
              >
                {lang === "KR"
                  ? "현재 프레임들을 하나의 투명 배경 비디오로 결합합니다."
                  : lang === "EN"
                    ? "Combine your frames into a transparent video."
                    : "現在のフレームを透過背景のビデオにまとめます。"}
                
                <p className={`mt-2 text-xs opacity-60 ${isDark ? "text-white/40" : "text-gray-500"}`}>
                  {lang === "KR" 
                    ? "일부 환경에서는 생성에 시간이 더 걸릴 수 있습니다." 
                    : lang === "EN" 
                      ? "Large exports may take longer depending on your device." 
                      : "大きな書き出しは端末によって時間がかかる場合があります。"}
                </p>
              </div>

              <div className="mt-auto space-y-4">
                {loadState === 'error' ? (
                  <div className={`w-full p-4 rounded-xl text-sm border flex flex-col items-center justify-center text-center ${isDark ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-600"}`}>
                    <AlertTriangle className="w-5 h-5 mb-2 opacity-80" />
                    <span>
                    {lang === 'KR' ? '보안 정책(COEP)으로 인해 WebM을 사용할 수 없습니다.' : lang === 'EN' ? 'WebM is disabled due to environment security constraints (COEP).' : 'ブラウザのセキュリティ制限(COEP)によりWebMは使用できません。'}
                    </span>
                    <span className="text-xs opacity-70 mt-1 block">
                    {lang === 'KR' ? '대신 스프라이트 시트를 사용하세요.' : lang === 'EN' ? 'Please use Sprite Sheet export instead.' : '代わりにスプライトシートを使用してください。'}
                    </span>
                  </div>
                ) : isVideoProcessing ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        {lang === "KR"
                          ? "인코딩 중..."
                          : lang === "EN"
                            ? "Encoding..."
                            : "エンコード中..."}
                      </span>
                      <span>{videoProgress}%</span>
                    </div>
                    <div
                      className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-gray-200"}`}
                    >
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>
                  </div>
                ) : videoUrl ? (
                  <a
                    href={videoUrl}
                    download="bananacut_transparent.webm"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Download className="w-5 h-5" />
                    {lang === "KR"
                      ? "WebM 다운로드"
                      : lang === "EN"
                        ? "Download WebM"
                        : "WebM ダウンロード"}
                  </a>
                ) : (
                  <button
                    onClick={handleExportVideo}
                    disabled={loadState === "loading"}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${loadState !== "loading" ? "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                  >
                    {loadState === "loading" && (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    )}
                    {lang === "KR"
                      ? "투명 비디오 생성"
                      : lang === "EN"
                        ? "Create Transparent Video"
                        : "透過ビデオを作成"}
                  </button>
                )}
              </div>
            </div>

            {/* 2. Sprite Sheet Generator */}
            <div
              className={`p-6 rounded-2xl border-2 flex flex-col relative overflow-hidden shadow-sm order-1 ${isDark ? "bg-[#1e231e] border-green-500/30" : "bg-green-50/30 border-green-400"}`}
            >
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-xs uppercase tracking-wider rounded-bl-xl border-b border-l border-green-500/20">
                {lang === "KR" ? "추천" : lang === "EN" ? "Recommended" : "おすすめ"}
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-3 rounded-xl ${isDark ? "bg-green-500/20" : "bg-green-100"}`}
                >
                  <LayoutGrid
                    className={`w-6 h-6 ${isDark ? "text-green-400" : "text-green-600"}`}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {lang === "KR"
                      ? "스프라이트 시트 생성"
                      : lang === "EN"
                        ? "Sprite Sheet"
                        : "スプライトシート"}
                  </h2>
                </div>
              </div>

              <div
                className={`mb-6 text-sm leading-relaxed ${isDark ? "text-white/70" : "text-gray-600"}`}
              >
                {lang === "KR"
                  ? "게임과 앱에서 쓰기 좋은 시트 이미지로 빠르게 내보냅니다."
                  : lang === "EN"
                    ? "Export your frames as a sheet image that works well for games and apps."
                    : "ゲームやアプリで使いやすいシート画像として書き出します。"}
                <p className={`mt-2 text-xs opacity-70 ${isDark ? "text-green-300" : "text-green-700"}`}>
                  {lang === "KR" 
                    ? "스마트 크롭은 스프라이트 시트 생성에 적용됩니다." 
                    : lang === "EN" 
                      ? "Smart Crop is applied to sprite sheet export." 
                      : "スマートクロップはスプライトシート出力に適用されます。"}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                {/* Smart Crop Recommendation Panel */}
                <div
                  className={`p-4 rounded-xl border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2">
                      <Scan
                        className={`w-4 h-4 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                      />
                      {lang === "KR"
                        ? "스마트 크롭 추천"
                        : "Smart Crop Recommendation"}
                    </h3>
                  </div>

                  {!stableBox ? (
                    <div className="space-y-3">
                      <p
                        className={`text-xs ${isDark ? "text-white/60" : "text-gray-500"}`}
                      >
                        {lang === "KR"
                          ? "투명 여백과 프레임 흔들림을 분석해 최적의 추천 캔버스 크기를 제안합니다."
                          : "Analyzes transparent waste and frame stability to propose an optimal canvas size."}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label
                            className={`block text-xs font-medium mb-1 ${isDark ? "text-white/60" : "text-gray-500"}`}
                          >
                            Alpha Threshold
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={alphaThreshold}
                            onChange={(e) =>
                              setAlphaThreshold(Number(e.target.value))
                            }
                            className={`w-full p-1.5 text-xs rounded border ${isDark ? "bg-[#121212] border-white/20" : "bg-white border-gray-300"}`}
                          />
                        </div>
                        <div>
                          <label
                            className={`block text-xs font-medium mb-1 ${isDark ? "text-white/60" : "text-gray-500"}`}
                          >
                            Padding (px)
                          </label>
                          <input
                            type="number"
                            value={cropPadding}
                            onChange={(e) =>
                              setCropPadding(Number(e.target.value))
                            }
                            className={`w-full p-1.5 text-xs rounded border ${isDark ? "bg-[#121212] border-white/20" : "bg-white border-gray-300"}`}
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleAnalyzeCrop}
                        disabled={isAnalyzingCrop}
                        className={`w-full py-2 text-sm font-medium rounded-lg border transition-colors ${isDark ? "border-blue-500/50 text-blue-400 hover:bg-blue-500/10" : "border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100"} ${isAnalyzingCrop ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {isAnalyzingCrop
                          ? `${lang === "KR" ? "분석 중..." : "Analyzing..."} ${analyzeProgress}%`
                          : `${lang === "KR" ? "프레임 분석하기" : "Analyze Frames"}`}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div
                          className={`p-2 rounded bg-black/5 dark:bg-white/5`}
                        >
                          <p className="text-[10px] uppercase font-bold opacity-60 mb-1">
                            Current Canvas
                          </p>
                          <p className="font-mono">
                            {sourceDim?.width} × {sourceDim?.height}
                          </p>
                        </div>
                        <div
                          className={`p-2 rounded bg-blue-500/10 border border-blue-500/20`}
                        >
                          <p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1">
                            Recommended
                          </p>
                          <p className="font-mono font-bold text-blue-700 dark:text-blue-300">
                            {recommendedCanvas?.width} ×{" "}
                            {recommendedCanvas?.height}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs px-1">
                        <span className="opacity-70">Transparent waste:</span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {Math.round(transparentWasteRatio * 100)}%
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowCropPreview(true)}
                          className={`flex-1 py-1.5 text-xs font-medium rounded border ${isDark ? "border-white/20 hover:bg-white/10" : "border-gray-300 hover:bg-gray-100"}`}
                        >
                          {lang === "KR" ? "추천 영역 미리보기" : "Preview Box"}
                        </button>
                        <button
                          onClick={() => setStableBox(null)}
                          className={`py-1.5 px-3 text-xs font-medium rounded border border-transparent opacity-60 hover:opacity-100`}
                        >
                          {lang === "KR" ? "다시 분석" : "Recalculate"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t dark:border-white/10">
                  <label
                    className={`block text-sm font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Export Size Mode
                  </label>
                  <div className="space-y-2">
                    <label
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer hover:border-blue-500 transition-colors ${exportSizeMode === "original" ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10" : "border-transparent bg-gray-50 dark:bg-[#121212]"}`}
                    >
                      <input
                        type="radio"
                        checked={exportSizeMode === "original"}
                        onChange={() => setExportSizeMode("original")}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-sm">Original Canvas</p>
                        <p className="text-xs opacity-60">
                          {lang === "KR"
                            ? "원본 프레임 크기로 내보냅니다."
                            : "Export frames at their original resolution"}
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${!stableBox ? "opacity-50 cursor-not-allowed" : "hover:border-blue-500"} ${exportSizeMode === "recommendedStableCrop" ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10" : "border-transparent bg-gray-50 dark:bg-[#121212]"}`}
                    >
                      <input
                        type="radio"
                        disabled={!stableBox}
                        checked={exportSizeMode === "recommendedStableCrop"}
                        onChange={() =>
                          stableBox &&
                          setExportSizeMode("recommendedStableCrop")
                        }
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-sm text-blue-600 dark:text-blue-400">
                          Recommended Stable Crop
                        </p>
                        <p className="text-xs opacity-60">
                          {lang === "KR"
                            ? "빈 여백을 줄이면서 흔들림 없이 안전하게 크롭합니다."
                            : "Use the smart crop box to safely remove empty space without jitter"}
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer hover:border-blue-500 transition-colors ${exportSizeMode === "customCanvas" ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10" : "border-transparent bg-gray-50 dark:bg-[#121212]"}`}
                    >
                      <input
                        type="radio"
                        checked={exportSizeMode === "customCanvas"}
                        onChange={() => setExportSizeMode("customCanvas")}
                        className="mt-1"
                      />
                      <div className="w-full">
                        <p className="font-medium text-sm">
                          Custom Canvas Size
                        </p>
                        <p className="text-xs opacity-60 mb-2">
                          {lang === "KR"
                            ? "사용자 지정 캔버스 크기 안에 배치합니다."
                            : "Resize and position inside a custom canvas"}
                        </p>

                        {exportSizeMode === "customCanvas" && (
                          <div
                            className={`mt-3 space-y-3 p-3 rounded-lg border bg-white dark:bg-[#1a1a1a] dark:border-white/10`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] uppercase font-bold opacity-60">
                                  Width
                                </label>
                                <input
                                  type="number"
                                  value={customWidth}
                                  onChange={(e) =>
                                    setCustomWidth(Number(e.target.value))
                                  }
                                  className="w-full p-1.5 text-sm rounded border dark:bg-[#121212] dark:border-white/20 mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] uppercase font-bold opacity-60">
                                  Height
                                </label>
                                <input
                                  type="number"
                                  value={customHeight}
                                  onChange={(e) =>
                                    setCustomHeight(Number(e.target.value))
                                  }
                                  className="w-full p-1.5 text-sm rounded border dark:bg-[#121212] dark:border-white/20 mt-1"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] uppercase font-bold opacity-60">
                                  Fit
                                </label>
                                <select
                                  value={customFit}
                                  onChange={(e) =>
                                    setCustomFit(e.target.value as any)
                                  }
                                  className="w-full p-1.5 text-sm rounded border dark:bg-[#121212] dark:border-white/20 mt-1"
                                >
                                  <option value="contain">Contain</option>
                                  <option value="cover">Cover</option>
                                  <option value="none">
                                    None (Actual Size)
                                  </option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] uppercase font-bold opacity-60">
                                  Anchor
                                </label>
                                <select
                                  value={customAnchor}
                                  onChange={(e) =>
                                    setCustomAnchor(e.target.value as any)
                                  }
                                  className="w-full p-1.5 text-sm rounded border dark:bg-[#121212] dark:border-white/20 mt-1"
                                >
                                  <option value="center">Center</option>
                                  <option value="top">Top</option>
                                  <option value="bottom">Bottom</option>
                                  <option value="left">Left</option>
                                  <option value="right">Right</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t dark:border-white/10">
                  <div>
                    <label
                      className={`block text-xs font-bold mb-1 opacity-70`}
                    >
                      Columns
                    </label>
                    <select
                      value={columns}
                      onChange={(e) => setColumns(Number(e.target.value))}
                      className={`w-full p-2 text-sm rounded-lg border ${isDark ? "bg-[#121212] border-white/20" : "bg-white border-gray-300"}`}
                    >
                      <option value={4}>4</option>
                      <option value={8}>8</option>
                      <option value={10}>10</option>
                      <option value={16}>16</option>
                      <option value={frames.length}>All in one row</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className={`block text-xs font-bold mb-1 opacity-70`}
                    >
                      Spacing (px)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={spacing}
                      onChange={(e) => setSpacing(Number(e.target.value))}
                      className={`w-full p-2 text-sm rounded-lg border ${isDark ? "bg-[#121212] border-white/20" : "bg-white border-gray-300"}`}
                    />
                  </div>
                </div>
              </div>

              {spriteWarning && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2 text-yellow-600 dark:text-yellow-500 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{spriteWarning}</p>
                </div>
              )}

              <div className="mt-auto space-y-4">
                {isSpriteProcessing ? (
                  <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-white/50">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {lang === "KR"
                      ? "처리 중..."
                      : lang === "EN"
                        ? "Processing..."
                        : "処理中..."}
                  </div>
                ) : spriteUrl ? (
                  <div className="flex flex-col gap-2">
                    <a
                      href={spriteUrl}
                      download="bananacut_spritesheet.png"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all bg-green-600 text-white hover:bg-green-700"
                    >
                      <Download className="w-5 h-5" />
                      {lang === "KR"
                        ? "PNG 다운로드"
                        : lang === "EN"
                          ? "Download PNG"
                          : "PNG ダウンロード"}
                    </a>
                    {spriteJson && (
                      <a
                        href={spriteJson}
                        download="bananacut_spritesheet.json"
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${isDark ? "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`}
                      >
                        <Download className="w-5 h-5" />
                        {lang === "KR"
                          ? "JSON (메타데이터) 다운로드"
                          : lang === "EN"
                            ? "Download JSON (Metadata)"
                            : "JSON ダウンロード"}
                      </a>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleExportSprite}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200`}
                  >
                    {lang === "KR"
                      ? "스프라이트 시트 생성"
                      : lang === "EN"
                        ? "Create Sprite Sheet"
                        : "スプライトシートを作成"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dirty Frames Modal */}
      {showDirtyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className={`p-6 rounded-2xl max-w-sm w-full mx-auto shadow-2xl relative ${isDark ? "bg-[#1a1a1a] text-white" : "bg-white text-gray-900"}`}
          >
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              {lang === "KR"
                ? "미적용 프레임 확인"
                : lang === "EN"
                  ? "Unprocessed Frames"
                  : "未適用フレームの確認"}
            </h3>
            <p
              className={`text-sm mb-6 ${isDark ? "text-white/70" : "text-gray-600"}`}
            >
              {lang === "KR"
                ? "크로마키가 적용되지 않은(dirty) 프레임이 있습니다. 다운로드 전에 모든 프레임에 설정을 렌더링해야 합니다."
                : lang === "EN"
                  ? "There are unprocessed (dirty) frames. All frames must be rendered with your settings before exporting."
                  : "クロマキーが適用されていない(dirty)フレームがあります。ダウンロードする前に、すべてのフレームに設定をレンダリングする必要があります。"}
            </p>

            {isBatchProcessing ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>
                    {lang === "KR"
                      ? "렌더링 중..."
                      : lang === "EN"
                        ? "Rendering..."
                        : "レンダリング中..."}
                  </span>
                  <span>{batchProgress}%</span>
                </div>
                <div
                  className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-gray-200"}`}
                >
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${batchProgress}%` }}
                  />
                </div>
                {failedItems.length > 0 && (
                  <p className="text-xs text-red-500">
                    Failed frames: {failedItems.join(", ")}
                  </p>
                )}
                <button
                  onClick={cancelJob}
                  className="w-full mt-2 py-2.5 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/5 active:bg-gray-200 dark:active:bg-white/10"
                >
                  {lang === "KR"
                    ? "작업 취소"
                    : lang === "EN"
                      ? "Cancel Job"
                      : "キャンセル"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    if (dirtyAction) {
                      await dirtyAction();
                      setShowDirtyModal(false);
                    }
                  }}
                  className={`w-full py-2.5 rounded-xl font-medium transition-colors ${
                    isDark
                      ? "bg-blue-600 hover:bg-blue-500 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {lang === "KR"
                    ? "Process Dirty Frames (적용 및 계속)"
                    : lang === "EN"
                      ? "Process Dirty Frames"
                      : "適用して続行"}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      if (dirtyAnywayAction) {
                        await dirtyAnywayAction();
                        setShowDirtyModal(false);
                      }
                    }}
                    className={`flex-1 py-2.5 rounded-xl font-medium transition-colors border text-xs sm:text-sm ${
                      isDark
                        ? "border-red-500/30 hover:bg-red-500/10 text-red-400"
                        : "border-red-200 hover:bg-red-50 text-red-600"
                    }`}
                  >
                    {lang === "KR"
                      ? "Export Anyway (무시)"
                      : lang === "EN"
                        ? "Export Anyway"
                        : "無視してエクスポート"}
                  </button>
                  <button
                    onClick={() => {
                      setShowDirtyModal(false);
                      setDirtyAction(null);
                    }}
                    className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${
                      isDark
                        ? "bg-white/10 hover:bg-white/20 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    }`}
                  >
                    {lang === "KR"
                      ? "Cancel (취소)"
                      : lang === "EN"
                        ? "Cancel"
                        : "キャンセル"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <Modal
        isOpen={showCropPreview && !!stableBox}
        onClose={() => setShowCropPreview(false)}
        title="Crop Preview"
        icon={Target}
        lang={lang}
        setLang={() => {}}
      >
        <div className="space-y-4">
          <p className="text-sm opacity-80">
            {lang === "KR"
              ? "안정적인 크롭 추천 영역입니다."
              : "This is the recommended stable crop safe box over the first frame."}
          </p>
          <div className="relative border border-white/20 rounded-xl overflow-hidden bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAMUExURf/y8v/v7////+bm5qB8z/gAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAwSURBVBjTY2CgOmAMiQ2wMTA4mIEQIQhBDBwGICkQwcDAYAgUQzFAYg5AjiMwIACA2Q4J/E24k4EAAAAASUVORK5CYII=')] bg-repeat shadow-inner flex items-center justify-center">
            {frames.length > 0 && sourceDim && (
              <div
                className="relative"
                style={{
                  width: "100%",
                  aspectRatio: `${sourceDim.width} / ${sourceDim.height}`,
                }}
              >
                <img
                  src={getFrameDisplayUrl(frames[0], true)}
                  alt="Frame preview"
                  className="absolute inset-0 w-full h-full object-contain"
                />
                {stableBox && (
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-500/20 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
                    style={{
                      left: `${(stableBox.x / sourceDim.width) * 100}%`,
                      top: `${(stableBox.y / sourceDim.height) * 100}%`,
                      width: `${(stableBox.w / sourceDim.width) * 100}%`,
                      height: `${(stableBox.h / sourceDim.height) * 100}%`,
                    }}
                  />
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setShowCropPreview(false);
                setExportSizeMode("recommendedStableCrop");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Apply Recommended Crop
            </button>
          </div>
        </div>
      </Modal>

      {/* Technical Error Modal */}
      <Modal
        isOpen={showTechErrorModal}
        onClose={() => setShowTechErrorModal(false)}
        title="Technical Error Details"
        icon={AlertCircle}
        lang={lang}
        setLang={() => {}}
      >
        <div className="space-y-4">
          <p className="text-sm">
            {lang === "KR"
              ? "작업 중 오류가 발생했습니다. 브라우저에서 처리 중 문제가 발생했을 수 있습니다."
              : "A technical error occurred during the operation. There might be an issue with browser processing."}
          </p>

          <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-xl bg-gray-100 dark:bg-black/50 p-4 text-xs font-mono text-red-600 dark:text-red-400 border border-gray-200 dark:border-red-500/10">
            {ffmpegError && `[Processing Error]\n${ffmpegError}`}
            {!ffmpegError && "No technical error available."}
          </pre>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => {
                const errText = ffmpegError
                  ? `[Processing Error]\n${ffmpegError}`
                  : "No error details";
                navigator.clipboard.writeText(errText);
                alert("Copied to clipboard");
              }}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/20 transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copy Error
            </button>
            <button
              onClick={() => setShowTechErrorModal(false)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
