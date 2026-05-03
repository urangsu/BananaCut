import { StudioFrame } from '../StudioContext';

export async function extractFramesNative(file: File, options: {
  fps: number;
  maxWidth: number;
  maxHeight: number;
  maxFrames: number;
  onProgress?: (current: number, total: number) => void;
  onChunk?: (frames: StudioFrame[]) => void;
}): Promise<StudioFrame[]> {
  const { fps, maxWidth, maxHeight, maxFrames, onProgress, onChunk } = options;
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.src = url;
  video.muted = true;
  video.playsInline = true;
  video.preload = 'metadata';

  return new Promise<StudioFrame[]>((resolve, reject) => {
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Video load error: ${video.error?.message || 'Unknown'}`));
    };

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration;
        if (!duration || !isFinite(duration)) {
          throw new Error('Invalid video duration');
        }

        const totalFrames = Math.min(maxFrames, Math.ceil(duration * fps));
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
            let handled = false;
            
            const cleanup = () => {
              video.removeEventListener('seeked', onSeeked);
              video.removeEventListener('error', onError);
            };

            const finish = () => {
              if (handled) return;
              handled = true;
              cleanup();
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
              cleanup();
              rej(new Error('Seek error'));
            };
            
            video.addEventListener('seeked', onSeeked);
            video.addEventListener('error', onError);
            video.currentTime = time;
            
            // fallback if seeked doesn't fire
            setTimeout(() => {
               if(!handled) {
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
                rej(new Error('Canvas toBlob failed'));
              }
            }, 'image/png');
          });
        };

        let lastProgressTime = Date.now();

        // Ensure first frame handles correctly
        if (video.currentTime !== 0) {
           await seekAndWait(0);
        }

        for (let i = 0; i < totalFrames; i++) {
          const timestamp = Math.min(i / fps, duration - 0.001);
          await seekAndWait(timestamp);
          
          ctx.drawImage(video, 0, 0, scaledWidth, scaledHeight);
          const blobUrl = await canvasToBlobUrl();
          
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
          
          if (onProgress) {
            const now = Date.now();
            if (now - lastProgressTime > 100 || i === totalFrames - 1) {
              onProgress(i + 1, totalFrames);
              lastProgressTime = now;
            }
          }

          if (i === 0 || chunk.length >= 5 || i === totalFrames - 1) {
            if (onChunk && chunk.length > 0) {
              onChunk([...chunk]);
            }
            chunk = [];
          }
        }

        URL.revokeObjectURL(url);
        resolve(frames);
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
  });
}
