import { StudioFrame, FrameSlotPlan, MediaExtractionResult, FrameQualityFlag } from '../types/mediaPipeline';
import { PerfLogger } from './performanceLogger';

function analyzeFrameCanvas(canvas: HTMLCanvasElement): { isBlank: boolean; dHash: string } {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { isBlank: false, dHash: '' };
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 8;
  tempCanvas.height = 8;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return { isBlank: false, dHash: '' };
  
  tempCtx.drawImage(canvas, 0, 0, 8, 8);
  const imgData = tempCtx.getImageData(0, 0, 8, 8);
  const data = imgData.data;
  
  let lumaSum = 0;
  const lumas: number[] = [];
  for (let i = 0; i < 64; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    lumaSum += luma;
    lumas.push(luma);
  }
  
  const meanLuma = lumaSum / 64;
  let varianceSum = 0;
  for (let i = 0; i < 64; i++) {
    varianceSum += Math.pow(lumas[i] - meanLuma, 2);
  }
  const variance = varianceSum / 64;
  
  // Blank if variance is extremely low or black/white
  const isBlank = variance < 5.0 || meanLuma < 2.0 || meanLuma > 253.0;
  
  let hashStr = '';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 7; col++) {
      const p1 = lumas[row * 8 + col];
      const p2 = lumas[row * 8 + col + 1];
      hashStr += p1 > p2 ? '1' : '0';
    }
  }
  
  return { isBlank, dHash: hashStr };
}

export async function extractFramesNative(
  file: File,
  options: {
    fps: number;
    plannedWidth: number;
    plannedHeight: number;
    signal?: AbortSignal;
    onProgress?: (current: number, total: number) => void;
    onChunk?: (frames: StudioFrame[]) => void;
  }
): Promise<MediaExtractionResult> {
  const { fps, plannedWidth, plannedHeight, signal, onProgress, onChunk } = options;
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.src = url;
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';

  const startTime = Date.now();
  const isDebug = import.meta.env.DEV || new URLSearchParams(window.location.search).get('debug') === '1';
  const logDebug = (...args: any[]) => { if (isDebug) console.log(...args); };

  return new Promise<MediaExtractionResult>((resolve, reject) => {
    let settled = false;
    let accumulatedFrames: StudioFrame[] = [];

    const cleanupVideoAndUrl = () => {
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
      } catch (e) {}
      URL.revokeObjectURL(url);
    };

    const cleanupAndReject = (err: Error) => {
      if (settled) return;
      settled = true;
      cleanupVideoAndUrl();
      reject(err);
    };

    if (signal?.aborted) {
      return cleanupAndReject(new Error('Aborted'));
    }

    const abortHandler = () => {
      cleanupAndReject(new Error('Aborted'));
    };
    signal?.addEventListener('abort', abortHandler);

    video.onerror = () => {
      cleanupAndReject(new Error(`Native browser decoder failed with code ${video.error?.code || 'unknown'}. Try FFmpeg fallback.`));
    };

    video.onloadedmetadata = async () => {
      try {
        const durationSec = video.duration;
        if (!durationSec || !isFinite(durationSec)) {
          throw new Error('Video duration metadata is invalid.');
        }

        const durationMs = Math.round(durationSec * 1000);
        const sourceWidth = video.videoWidth || 640;
        const sourceHeight = video.videoHeight || 360;

        // 1. Create Sampling Plan
        const slots: FrameSlotPlan[] = [];
        const frameIntervalMs = 1000 / fps;
        const totalFramesCount = Math.max(1, Math.round(durationSec * fps));

        for (let i = 0; i < totalFramesCount; i++) {
          const targetTimeMs = Math.round(i * frameIntervalMs);
          if (targetTimeMs < durationMs) {
            slots.push({ sourceIndex: i, targetTimeMs });
          }
        }

        if (slots.length === 0) {
          slots.push({ sourceIndex: 0, targetTimeMs: 0 });
        }

        // Wait for loadeddata gate before rendering
        await new Promise<void>((res, rej) => {
          if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            res();
          } else {
            video.onloadeddata = () => res();
            setTimeout(() => res(), 3000); // safety fallback
          }
        });

        // Setup rendering canvas
        const canvas = document.createElement('canvas');
        canvas.width = plannedWidth;
        canvas.height = plannedHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          throw new Error('Canvas 2D context allocation failed.');
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 2. Decoder Verification & Setup
        let lastDecodedMediaTime: number | null = null;
        let rVFCSupported = 'requestVideoFrameCallback' in video;

        const updateMediaTimeFromRvfc = () => {
          if (rVFCSupported) {
            // @ts-ignore
            video.requestVideoFrameCallback((now, metadata) => {
              lastDecodedMediaTime = metadata.mediaTime;
            });
          }
        };

        const waitOnePaint = async (): Promise<void> => {
          await new Promise<void>((res) => {
            requestAnimationFrame(() => res());
            setTimeout(() => res(), 40);
          });
        };

        // 3. Multi-phase seek helper
        const seekToTimestamp = async (timeSec: number, targetIndex: number): Promise<number | null> => {
          return new Promise<number | null>((resSeek) => {
            let done = false;
            let timeoutId: any = null;

            const clearEvents = () => {
              video.removeEventListener('seeked', onSeeked);
              video.removeEventListener('error', onError);
              clearTimeout(timeoutId);
            };

            const success = (actualTime: number | null) => {
              if (done) return;
              done = true;
              clearEvents();
              resSeek(actualTime);
            };

            const failPhase = () => {
              if (done) return;
              done = true;
              clearEvents();
              resSeek(null); // Report failure so we can handle it at parent level
            };

            const onSeeked = () => {
              if (rVFCSupported) {
                // @ts-ignore
                video.requestVideoFrameCallback((now, metadata) => {
                  success(metadata.mediaTime);
                });
              } else {
                waitOnePaint().then(() => success(video.currentTime));
              }
            };

            const onError = () => {
              failPhase();
            };

            video.addEventListener('seeked', onSeeked);
            video.addEventListener('error', onError);

            // Phase 1: Direct Assignment
            lastDecodedMediaTime = null;
            updateMediaTimeFromRvfc();
            video.currentTime = timeSec;

            timeoutId = setTimeout(async () => {
              if (done) return;
              logDebug(`[nativeVideoExtract] Seek timed out for ${timeSec}s, trying Phase 2 (fastSeek)...`);
              
              // Phase 2: fastSeek if supported
              clearEvents();
              video.addEventListener('seeked', onSeeked);
              video.addEventListener('error', onError);

              // @ts-ignore
              if (typeof video.fastSeek === 'function') {
                try {
                  // @ts-ignore
                  video.fastSeek(timeSec);
                  video.currentTime = timeSec;
                } catch (e) {
                  video.currentTime = timeSec;
                }
              } else {
                // Phase 3: Tiny epsilon wiggle seek
                const wiggle = timeSec + 0.01 < durationSec ? 0.01 : -0.01;
                video.currentTime = timeSec + wiggle;
                await new Promise(r => setTimeout(r, 100));
                video.currentTime = timeSec;
              }

              timeoutId = setTimeout(() => {
                if (done) return;
                logDebug(`[nativeVideoExtract] Seek completely failed for ${timeSec}s`);
                failPhase();
              }, 3000);
            }, 1500);
          });
        };

        const canvasToBlobUrl = (): Promise<string> => {
          return new Promise((res, rej) => {
            canvas.toBlob((blob) => {
              if (blob) {
                res(URL.createObjectURL(blob));
              } else {
                rej(new Error('toBlob returned null.'));
              }
            }, 'image/png');
          });
        };

        const skippedSlots: FrameSlotPlan[] = [];
        let consecutiveFailures = 0;
        let lastHash = '';
        const warnings: string[] = [];

        // Pre-run first frame verify
        const firstSeekMediaTime = await seekToTimestamp(0, 0);
        if (firstSeekMediaTime === null) {
          throw new Error('첫 프레임 디코딩에 실패하여 작업을 완료할 수 없습니다. FFmpeg 폴백을 이용해 주세요.');
        }

        for (let i = 0; i < slots.length; i++) {
          if (signal?.aborted) {
            throw new Error('Aborted');
          }
          PerfLogger.start('nativeVideoExtract_frame');

          const slot = slots[i];
          const targetTimeSec = slot.targetTimeMs / 1000;

          // Attempt Seek
          let actualMediaTime: number | null = null;
          if (i === 0 && firstSeekMediaTime !== null) {
            actualMediaTime = firstSeekMediaTime;
          } else {
            actualMediaTime = await seekToTimestamp(targetTimeSec, i);
          }

          if (actualMediaTime === null) {
            consecutiveFailures++;
            skippedSlots.push(slot);

            // Fail-fast policies
            if (i === 0) {
              throw new Error('첫 번째 프레임 추출에 실패했습니다.');
            }
            if (consecutiveFailures >= 2) {
              throw new Error('연속된 2개 이상의 프레임 디코딩에 실패했습니다. 파일이 손상되었을 수 있습니다.');
            }
            const currentFailRate = (skippedSlots.length / slots.length) * 100;
            if (skippedSlots.length > 2 || currentFailRate > 2) {
              throw new Error(`디코딩 실패 프레임이 허용치(2개 또는 2%)를 초과했습니다. (실패율: ${currentFailRate.toFixed(1)}%)`);
            }

            if (onProgress) onProgress(i + 1, slots.length);
            continue;
          }

          consecutiveFailures = 0; // Reset failures on success

          // Draw and check Quality
          ctx.drawImage(video, 0, 0, plannedWidth, plannedHeight);
          
          const { isBlank, dHash } = analyzeFrameCanvas(canvas);
          const qualityFlags: FrameQualityFlag[] = [];

          if (isBlank) {
            qualityFlags.push('BLANK_FRAME');
          }

          // Duplicate checks
          if (dHash !== '' && dHash === lastHash) {
            qualityFlags.push('DUPLICATE_CAPTURE');
          }
          lastHash = dHash;

          // Check drift
          const actualTimeMs = Math.round(actualMediaTime * 1000);
          const drift = Math.abs(actualTimeMs - slot.targetTimeMs);
          const driftLimit = Math.max(50, frameIntervalMs * 0.75);
          if (drift > driftLimit) {
            qualityFlags.push('CAPTURE_TIME_DRIFT');
          }

          const blobUrl = await canvasToBlobUrl();
          PerfLogger.end('nativeVideoExtract_frame');

          const frame: StudioFrame = {
            id: `frame-${slot.sourceIndex}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: `frame_${slot.sourceIndex.toString().padStart(4, '0')}.png`,
            rawUrl: blobUrl,
            width: plannedWidth,
            height: plannedHeight,
            provenance: {
              sourceIndex: slot.sourceIndex,
              targetTimeMs: slot.targetTimeMs,
              actualTimeMs,
              captureMethod: 'native',
              sourceWidth,
              sourceHeight,
              outputWidth: plannedWidth,
              outputHeight: plannedHeight
            },
            keyDirty: true,
            recoverDirty: true,
            qualityFlags
          };

          accumulatedFrames.push(frame);

          if (onChunk) {
            onChunk([frame]);
          }

          if (onProgress) {
            onProgress(i + 1, slots.length);
          }

          // yields to let UI breathe
          await waitOnePaint();
        }

        const elapsedMs = Date.now() - startTime;
        signal?.removeEventListener('abort', abortHandler);
        cleanupVideoAndUrl();

        if (settled) return;
        settled = true;

        resolve({
          frames: accumulatedFrames,
          slots,
          skippedSlots,
          warnings,
          decoder: 'native',
          sourceDimensions: { width: sourceWidth, height: sourceHeight },
          outputDimensions: { width: plannedWidth, height: plannedHeight },
          requestedFps: fps,
          actualFrameCount: accumulatedFrames.length,
          elapsedMs
        });

      } catch (err: any) {
        // cleanup raw URLs on failure
        accumulatedFrames.forEach(f => {
          try { URL.revokeObjectURL(f.rawUrl); } catch (e) {}
        });
        signal?.removeEventListener('abort', abortHandler);
        cleanupAndReject(err);
      }
    };
  });
}
