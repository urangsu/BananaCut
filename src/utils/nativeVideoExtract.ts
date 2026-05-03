import { StudioFrame } from '../StudioContext';
import { PerfLogger } from './performanceLogger';

export async function extractFramesNative(file: File, options: {
  fps: number;
  maxWidth: number;
  maxHeight: number;
  maxFrames: number;
  signal?: AbortSignal;
  onProgress?: (current: number, total: number) => void;
  onChunk?: (frames: StudioFrame[]) => void;
}): Promise<StudioFrame[]> {
  const { fps, maxWidth, maxHeight, maxFrames, signal, onProgress, onChunk } = options;
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.src = url;
  video.muted = true;
  video.playsInline = true;
  video.preload = 'metadata';

  // performance tracking
  const startTime = Date.now();
  const isDebug = import.meta.env.DEV || new URLSearchParams(window.location.search).get('debug') === '1';
  const logDebug = (...args: any[]) => { if (isDebug) console.log(...args); };

  return new Promise<StudioFrame[]>((resolve, reject) => {
    const cleanup = () => {
      URL.revokeObjectURL(url);
    };

    if (signal?.aborted) {
      cleanup();
      return reject(new Error('Aborted'));
    }

    const abortHandler = () => {
      cleanup();
      reject(new Error('Aborted'));
    };
    signal?.addEventListener('abort', abortHandler);

    video.onerror = () => {
      signal?.removeEventListener('abort', abortHandler);
      cleanup();
      reject(new Error(`Video metadata failed to load or unsupported video codec (Code. ${video.error?.code}). Try FFmpeg fallback.`));
    };

    video.onloadedmetadata = async () => {
      try {
        logDebug(`[nativeVideoExtract] metadata loaded in ${Date.now() - startTime}ms`);
        const duration = video.duration;
        if (!duration || !isFinite(duration)) {
          throw new Error('Invalid video duration');
        }

        const safeFps = fps > 0 ? fps : 12;
        const totalFrames = Math.min(maxFrames, Math.max(1, Math.ceil(duration * safeFps)));
        if (totalFrames <= 0) {
          throw new Error('Video is too short or fps is too small');
        }

        const width = video.videoWidth;
        const height = video.videoHeight;
        
        let scale = 1;
        if (width > maxWidth || height > maxHeight) {
          scale = Math.min(maxWidth / width, maxHeight / height);
        }
        
        const scaledWidth = Math.max(1, Math.floor(width * scale));
        const scaledHeight = Math.max(1, Math.floor(height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (!ctx) {
          throw new Error('Failed to get 2d context for canvas');
        }

        const frames: StudioFrame[] = [];
        let chunk: StudioFrame[] = [];
        
        const seekAndWait = (time: number): Promise<void> => {
          return new Promise((res, rej) => {
            if (signal?.aborted) return rej(new Error('Aborted'));

            let handled = false;
            
            const clearEvents = () => {
              video.removeEventListener('seeked', onSeeked);
              video.removeEventListener('error', onError);
            };

            const finish = () => {
              if (handled) return;
              handled = true;
              clearEvents();
              if ('requestVideoFrameCallback' in video) {
                // @ts-ignore
                video.requestVideoFrameCallback(() => {
                  res();
                });
              } else {
                res();
              }
            };

            const onSeeked = () => {
              finish();
            };
            const onError = () => {
              if (handled) return;
              handled = true;
              clearEvents();
              rej(new Error('Seek error (timeout or codec issue)'));
            };
            
            video.addEventListener('seeked', onSeeked);
            video.addEventListener('error', onError);
            video.currentTime = time;
            
            // fallback if seeked doesn't fire
            setTimeout(() => {
               if(!handled) {
                   logDebug(`[nativeVideoExtract] seeked timeout fallback at time ${time}`);
                   // instead of finishing, verify if it's completely hung
                   finish();
               }
            }, 500);
          });
        };

        const canvasToBlobUrl = (): Promise<string> => {
          return new Promise((res, rej) => {
            canvas.toBlob((blob) => {
              if (blob) {
                res(URL.createObjectURL(blob));
              } else {
                rej(new Error('Canvas capture failed: toBlob returned null'));
              }
            }, 'image/png');
          });
        };

        // Ensure first frame handles correctly
        if (video.currentTime !== 0) {
           await seekAndWait(0);
        }

        let firstFrameTime = 0;

        for (let i = 0; i < totalFrames; i++) {
          if (signal?.aborted) {
            frames.forEach(f => URL.revokeObjectURL(f.rawUrl));
            throw new Error('Aborted');
          }
          PerfLogger.start('nativeVideoExtract_frame');

          const timestamp = Math.min(i / safeFps, Math.max(0, duration - 0.001));
          await seekAndWait(timestamp);
          
          ctx.drawImage(video, 0, 0, scaledWidth, scaledHeight);
          const blobUrl = await canvasToBlobUrl();
          PerfLogger.end('nativeVideoExtract_frame');
          
          const frame: StudioFrame = {
            id: `frame-${i}`,
            rawUrl: blobUrl,
            width: scaledWidth,
            height: scaledHeight,
            name: `frame_${i.toString().padStart(4, '0')}.png`,
            sourceIndex: i
          };
          
          frames.push(frame);
          chunk.push(frame);
          
          if (i === 0) {
            firstFrameTime = Date.now() - startTime;
            logDebug(`[nativeVideoExtract] First frame generated in ${firstFrameTime}ms`);
            if (onChunk) onChunk([...chunk]);
            if (onProgress) onProgress(1, totalFrames);
            chunk = [];
            await new Promise(requestAnimationFrame);
          } else {
            if (onProgress) onProgress(i + 1, totalFrames);
            
            if (chunk.length >= 8 || i === totalFrames - 1) {
              if (onChunk && chunk.length > 0) {
                onChunk([...chunk]);
              }
              chunk = [];
              await new Promise(requestAnimationFrame); // yield
            }
          }
        }

        const totalTime = Date.now() - startTime;
        logDebug(`[nativeVideoExtract] Completed ${totalFrames} frames in ${totalTime}ms (avg ${totalTime/totalFrames}ms/frame) @ ${scaledWidth}x${scaledHeight}`);
        
        signal?.removeEventListener('abort', abortHandler);
        cleanup();
        resolve(frames);
      } catch (err) {
        if (frames && frames.length > 0) {
          frames.forEach(f => URL.revokeObjectURL(f.rawUrl));
        }
        signal?.removeEventListener('abort', abortHandler);
        cleanup();
        reject(err);
      }
    };
  });
}
