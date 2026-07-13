import { VideoProbeResult } from '../types/mediaPipeline';
import { getMediaLimits } from './mediaLimits';

export async function probeVideoFile(
  file: File,
  requestedFps: number
): Promise<VideoProbeResult> {
  return new Promise<VideoProbeResult>((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const url = URL.createObjectURL(file);
    video.src = url;

    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(url);
    };

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const limits = getMediaLimits(isMobile);

    video.onloadedmetadata = () => {
      const durationSec = video.duration || 0;
      const durationMs = Math.round(durationSec * 1000);
      const sourceWidth = video.videoWidth || 640;
      const sourceHeight = video.videoHeight || 360;

      // Check native playability
      const canPlayMp4 = video.canPlayType('video/mp4');
      const canPlayWebm = video.canPlayType('video/webm');
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      
      let nativeCanPlay = false;
      let nativeCanProbablyPlay = false;

      if (ext === 'mp4' && canPlayMp4 !== '') {
        nativeCanPlay = true;
        if (canPlayMp4 === 'probably') nativeCanProbablyPlay = true;
      } else if (ext === 'webm' && canPlayWebm !== '') {
        nativeCanPlay = true;
        if (canPlayWebm === 'probably') nativeCanProbablyPlay = true;
      } else if (['mov', 'avi', 'mkv'].includes(ext)) {
        // Broadly, some browsers might support H.264 MOV
        const canPlayMov = video.canPlayType('video/quicktime');
        if (canPlayMov !== '') {
          nativeCanPlay = true;
          if (canPlayMov === 'probably') nativeCanProbablyPlay = true;
        }
      }

      const estimatedFrameSlots = Math.max(1, Math.round(durationSec * requestedFps));

      // Recommended quality mode based on resolution & device memory
      let qualityMode: 'original' | 'balanced1080' | 'safe720' = 'original';
      let plannedWidth = sourceWidth;
      let plannedHeight = sourceHeight;

      if (sourceWidth > 1920 || sourceHeight > 1080) {
        qualityMode = 'balanced1080';
        const ratio = Math.min(1920 / sourceWidth, 1080 / sourceHeight);
        plannedWidth = Math.round(sourceWidth * ratio);
        plannedHeight = Math.round(sourceHeight * ratio);
      }
      
      // Let's force standard even dimensions for video canvas processing
      plannedWidth = plannedWidth - (plannedWidth % 2);
      plannedHeight = plannedHeight - (plannedHeight % 2);

      // Memory estimation:
      // Uncompressed frames: plannedWidth * plannedHeight * 4 bytes per frame
      // Raw + Keyed + Recover buffers/layers (approx factor of 2.2x uncompressed + 50MB overhead)
      const frameBytes = plannedWidth * plannedHeight * 4;
      const totalEstimatedBytes = (frameBytes * estimatedFrameSlots * 2.2) + (50 * 1024 * 1024);
      const estimatedWorkingMemoryMB = Math.round(totalEstimatedBytes / (1024 * 1024));

      // Adjust quality mode recommendation if estimated memory exceeds limits
      if (estimatedWorkingMemoryMB > limits.softMemoryMB) {
        if (qualityMode === 'original' && (sourceWidth > 1280 || sourceHeight > 720)) {
          qualityMode = 'balanced1080';
          const ratio = Math.min(1920 / sourceWidth, 1080 / sourceHeight);
          plannedWidth = Math.round(sourceWidth * ratio);
          plannedHeight = Math.round(sourceHeight * ratio);
          plannedWidth = plannedWidth - (plannedWidth % 2);
          plannedHeight = plannedHeight - (plannedHeight % 2);
        }
      }

      if (estimatedWorkingMemoryMB > limits.hardMemoryMB || estimatedFrameSlots > limits.hardFrames) {
        qualityMode = 'safe720';
        const ratio = Math.min(1280 / sourceWidth, 720 / sourceHeight);
        plannedWidth = Math.round(sourceWidth * ratio);
        plannedHeight = Math.round(sourceHeight * ratio);
        plannedWidth = plannedWidth - (plannedWidth % 2);
        plannedHeight = plannedHeight - (plannedHeight % 2);
      }

      // Re-estimate memory for planned size
      const finalFrameBytes = plannedWidth * plannedHeight * 4;
      const finalEstimatedBytes = (finalFrameBytes * estimatedFrameSlots * 2.2) + (50 * 1024 * 1024);
      const finalMemoryMB = Math.round(finalEstimatedBytes / (1024 * 1024));

      const warnings: string[] = [];
      if (finalMemoryMB > limits.softMemoryMB) {
        warnings.push(`예상 메모리(${finalMemoryMB}MB)가 부드러운 제한치(${limits.softMemoryMB}MB)를 초과하여, 메모리가 부족한 기기에서 멈춤 현상이 발생할 수 있습니다.`);
      }
      if (estimatedFrameSlots > limits.softFrames) {
        warnings.push(`프레임 수(${estimatedFrameSlots})가 많아 로딩 및 내보내기 시간이 길어질 수 있습니다.`);
      }
      if (!nativeCanPlay) {
        warnings.push('이 동영상 포맷은 브라우저에서 기본 디코딩을 지원하지 않을 수 있습니다. 실패할 경우 FFmpeg 로컬 디코더를 사용해 주세요.');
      }

      cleanup();
      resolve({
        fileName: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type,
        extension: ext,
        durationMs,
        sourceWidth,
        sourceHeight,
        nativeCanPlay,
        nativeCanProbablyPlay,
        requestedFps,
        estimatedFrameSlots,
        qualityMode,
        plannedWidth,
        plannedHeight,
        willDownscale: plannedWidth < sourceWidth || plannedHeight < sourceHeight,
        estimatedWorkingMemoryMB: finalMemoryMB,
        warnings,
      });
    };

    video.onerror = () => {
      cleanup();
      // Safe fallback if metadata read fails
      resolve({
        fileName: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type,
        extension: file.name.split('.').pop()?.toLowerCase() || '',
        durationMs: 0,
        sourceWidth: 640,
        sourceHeight: 360,
        nativeCanPlay: false,
        nativeCanProbablyPlay: false,
        requestedFps,
        estimatedFrameSlots: 10,
        qualityMode: 'safe720',
        plannedWidth: 640,
        plannedHeight: 360,
        willDownscale: false,
        estimatedWorkingMemoryMB: 100,
        warnings: ['동영상 메타데이터를 읽어오지 못했습니다. 파일이 손상되었거나 지원하지 않는 코덱일 수 있습니다.'],
      });
    };
  });
}
