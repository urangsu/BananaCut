import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { extractFramesNative } from '../utils/nativeVideoExtract';
import { StudioFrame } from '../StudioContext';
import { getMediaLimits } from '../utils/mediaLimits';

export type UploadState = 'idle' | 'image-loading' | 'video-engine-loading' | 'video-extracting' | 'ready' | 'error';

export type ImportGuardModalState = {
  type: 'hard-limit' | 'soft-warning' | 'metadata-failed' | 'invalid-format';
  estimatedFrames?: number;
  estimatedMemoryMB?: number;
  limits?: ReturnType<typeof getMediaLimits>;
  onConfirm?: () => void;
  onCancel?: () => void;
} | null;

export interface UseMediaImportProps {
  frames: StudioFrame[];
  setFrames: React.Dispatch<React.SetStateAction<StudioFrame[]>>;
  fps: number;
  lang: 'KR' | 'EN' | 'JP';
  setImgDims: React.Dispatch<React.SetStateAction<{ w: number, h: number } | null>>;
  setExclusionStrokes: React.Dispatch<React.SetStateAction<any[]>>;
  setCurrentFrame: React.Dispatch<React.SetStateAction<number>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setVideoFile: React.Dispatch<React.SetStateAction<File | null>>;
  setIsProcessingLocal: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useMediaImport({
  frames,
  setFrames,
  fps,
  lang,
  setImgDims,
  setExclusionStrokes,
  setCurrentFrame,
  setIsPlaying,
  setVideoFile,
  setIsProcessingLocal
}: UseMediaImportProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [nativeExtractError, setNativeExtractError] = useState<string | null>(null);
  const [skippedFramesWarning, setSkippedFramesWarning] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState({ current: 0, total: 0 });
  const [extractionStalled, setExtractionStalled] = useState(false);
  const [extractionStartMs, setExtractionStartMs] = useState<number | null>(null);
  const [extractionElapsedText, setExtractionElapsedText] = useState('00:00');
  const [importGuardModal, setImportGuardModal] = useState<ImportGuardModalState>(null);

  
  const abortControllerRef = useRef<AbortController | null>(null);
  const extractionRunIdRef = useRef(0);
  const extractionProgressRef = useRef({ current: 0, lastUpdated: 0 });
  const activeImportFramesRef = useRef<StudioFrame[]>([]);

  const isExtracting = uploadState === 'video-extracting' || uploadState === 'video-engine-loading' || uploadState === 'image-loading';

  useEffect(() => {
    if (uploadState !== 'video-extracting') {
      setExtractionStalled(false);
      setExtractionElapsedText('00:00');
      return;
    }
    
    const interval = setInterval(() => {
      if (extractionStartMs) {
        const elapsedS = Math.floor((Date.now() - extractionStartMs) / 1000);
        const mins = Math.floor(elapsedS / 60).toString().padStart(2, '0');
        const secs = (elapsedS % 60).toString().padStart(2, '0');
        setExtractionElapsedText(`${mins}:${secs}`);
      }

      const now = Date.now();
      const lastUpdate = extractionProgressRef.current.lastUpdated;
      if (lastUpdate > 0 && now - lastUpdate > 8000) {
        setExtractionStalled(true);
      } else {
        setExtractionStalled(false);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [uploadState, extractionStartMs]);

  const revokeFrameUrls = useCallback((f: StudioFrame) => {
    if (f.rawUrl?.startsWith('blob:')) URL.revokeObjectURL(f.rawUrl);
    if (f.processedUrl?.startsWith('blob:')) URL.revokeObjectURL(f.processedUrl);
  }, []);

  const cancelExtraction = useCallback(() => {
    extractionRunIdRef.current += 1;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const allFrames = new Set([...frames, ...activeImportFramesRef.current]);
    allFrames.forEach(revokeFrameUrls);
    
    activeImportFramesRef.current = [];
    setFrames([]);
    setUploadState('idle');
    setExtractionStartMs(null);
    setExtractionStalled(false);
    abortControllerRef.current = null;
    setIsPlaying(false);
  }, [frames, setFrames, revokeFrameUrls, setIsPlaying]);

const probeVideo = (file: File): Promise<{ width: number; height: number; duration: number }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve({ width: video.videoWidth, height: video.videoHeight, duration: video.duration });
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };
    video.src = URL.createObjectURL(file);
  });
};

  const processFile = async (file: File, overrideFps?: number) => {
    const targetFps = overrideFps || fps;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    const runId = ++extractionRunIdRef.current;
    const isCurrentRun = () => extractionRunIdRef.current === runId;

    setImgDims(null);
    setExclusionStrokes([]);
    
    if (frames.length > 0) {
      frames.forEach(revokeFrameUrls);
      setFrames([]);
    }
    
    if (file.type.startsWith('image/')) {
      // image loading logic remains same
      setUploadState('image-loading');
      const url = URL.createObjectURL(file);
      const img = new Image();
      try {
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
        });
        if (!isCurrentRun()) {
          URL.revokeObjectURL(url);
          return;
        }
        setFrames([{
            id: Math.random().toString(36).substring(7),
            rawUrl: url,
            width: img.naturalWidth,
            height: img.naturalHeight,
            name: file.name,
            sourceIndex: 0
        }]);
        setCurrentFrame(0);
        setIsPlaying(false);
        setVideoFile(file);
        setUploadState('ready');
        setExtractionStartMs(null);
        setExtractionStalled(false);
        setExtractionProgress({ current: 0, total: 0 });
      } catch (err) {
        if (!isCurrentRun()) {
          URL.revokeObjectURL(url);
          return;
        }
        URL.revokeObjectURL(url);
        setUploadState('error');
        setNativeExtractError('[Image Error]\nFailed to load image');
        setIsPlaying(false);
      }
      return;
    }
    
    if (file.type.includes('video/mp4') || file.type.includes('video/quicktime')) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      const limits = getMediaLimits(isMobile);

      try {
        const meta = await probeVideo(file);
        const estimatedFrames = Math.ceil(meta.duration * targetFps);
        const estimatedMemoryMB = (meta.width * meta.height * 4 * estimatedFrames * 2.4) / 1024 / 1024;

        if (estimatedFrames > limits.hardFrames || estimatedMemoryMB > limits.hardMemoryMB) {
          setImportGuardModal({
            type: 'hard-limit',
            estimatedFrames,
            estimatedMemoryMB,
            limits,
            onConfirm: () => {
              setImportGuardModal(null);
              setUploadState('idle');
            }
          });
          return;
        }

        if (estimatedFrames > limits.softFrames || estimatedMemoryMB > limits.softMemoryMB) {
          await new Promise<void>((resolve, reject) => {
            setImportGuardModal({
              type: 'soft-warning',
              estimatedFrames,
              estimatedMemoryMB,
              limits,
              onConfirm: () => {
                setImportGuardModal(null);
                resolve();
              },
              onCancel: () => {
                setImportGuardModal(null);
                setUploadState('idle');
                reject(new Error('User cancelled'));
              }
            });
          });
        }
      } catch (e) {
        if (e instanceof Error && e.message === "User cancelled") return;
        console.warn("Probe failed", e);
        setImportGuardModal({
          type: 'metadata-failed',
          onConfirm: () => {
            setImportGuardModal(null);
            setUploadState("idle");
            setIsPlaying(false);
            setExtractionProgress({ current: 0, total: 0 });
            setExtractionStartMs(null);
            setExtractionStalled(false);
          }
        });
        return;
      }

      abortControllerRef.current = new AbortController();
      
      setUploadState('video-extracting');
      setNativeExtractError(null);
      setSkippedFramesWarning(false);
      setVideoFile(file);
      setFrames([]);
      setExtractionProgress({ current: 0, total: 0 });
      setExtractionStartMs(Date.now());
      extractionProgressRef.current = { current: 0, lastUpdated: Date.now() };
      let accumulatedFrames: StudioFrame[] = [];
      try {
        const maxRes = isMobile ? 720 : 1080;
        const maxFramesLimit = limits.hardFrames;

        const { frames: extractedFrames, skippedFrames } = await extractFramesNative(file, {
          fps: targetFps,
          maxWidth: maxRes === 1080 ? 1920 : 1280,
          maxHeight: maxRes,
          maxFrames: maxFramesLimit,
          skipFailedFrames: true,
          signal: abortControllerRef.current?.signal,
          onProgress: (current, total) => {
             if (!isCurrentRun()) return;
             setExtractionProgress({ current, total });
             extractionProgressRef.current = { current, lastUpdated: Date.now() };
          },
          onChunk: (chunk) => {
             if (!isCurrentRun()) {
               chunk.forEach(revokeFrameUrls);
               return;
             }
             accumulatedFrames = [...accumulatedFrames, ...chunk];
             activeImportFramesRef.current = accumulatedFrames;
             setFrames(accumulatedFrames);
             if (accumulatedFrames.length === chunk.length) {
                setCurrentFrame(0);
                setImgDims({ w: chunk[0].width, h: chunk[0].height });
             }
          }
        });
        
        if (!isCurrentRun()) {
          accumulatedFrames.forEach(revokeFrameUrls);
          return;
        }
        
        setFrames(extractedFrames);
        setSkippedFramesWarning(skippedFrames && skippedFrames.length > 0);
        
        setIsPlaying(true);
        console.log("Native extraction complete.");
        setUploadState('ready');
        setExtractionStartMs(null);
        setExtractionStalled(false);
        abortControllerRef.current = null;
      } catch (err) {
        if (!isCurrentRun()) {
          accumulatedFrames.forEach(revokeFrameUrls);
          return;
        }
        if (err instanceof Error && err.message === 'Aborted') {
          console.log('Video extraction canceled.');
          accumulatedFrames.forEach(revokeFrameUrls);
          setFrames([]);
          setUploadState('idle');
          setExtractionStartMs(null);
          setExtractionStalled(false);
          abortControllerRef.current = null;
          setIsPlaying(false);
          return;
        }
        console.error("Browser video extraction failed:", err);
        accumulatedFrames.forEach(revokeFrameUrls);
        setFrames([]);
        setNativeExtractError(err instanceof Error ? `[Native Error]\n${err.message}` : `[Native Error]\nUnknown error`);
        setExtractionProgress({ current: 0, total: 0 });
        setUploadState('error');
        setIsPlaying(false);
      } finally {
        if (isCurrentRun()) {
          abortControllerRef.current = null;
          setIsProcessingLocal(false);
          setExtractionStartMs(null);
          setExtractionStalled(false);
        }
      }
      return;
    }
    
    setImportGuardModal({
      type: 'invalid-format',
      onConfirm: () => {
        setImportGuardModal(null);
        setUploadState('idle');
        setExtractionStartMs(null);
        setExtractionStalled(false);
        setExtractionProgress({ current: 0, total: 0 });
        setIsPlaying(false);
      }
    });
  };

  const extractFramesWithFFmpeg = async (file: File, targetFps: number, engine: FFmpeg) => {
    if (!engine) {
      console.warn("FFmpeg engine not provided.");
      setUploadState('error');
      return;
    }
    
    setUploadState('video-extracting');
    setFrames([]);
    setIsPlaying(false);
    setExclusionStrokes([]);
    setExtractionProgress({ current: 0, total: 0 });
    setExtractionStartMs(Date.now());
    extractionProgressRef.current = { current: 0, lastUpdated: Date.now() };
    
    try {
      console.log("Starting frame extraction for:", file.name);
      await engine.writeFile('input.mp4', await fetchFile(file));
      setImgDims(null);
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      const limits = getMediaLimits(isMobile);
      const maxRes = isMobile ? 720 : 1080;
      const maxFramesLimit = limits.hardFrames;
      
      console.log(`Running FFmpeg command with scaling (Max ${maxRes}p, Device: ${isMobile ? 'Mobile' : 'Desktop'})...`);
      
      await engine.exec([
        '-i', 'input.mp4',
        '-vf', `fps=${targetFps},scale='min(iw,${maxRes === 1080 ? 1920 : 1280}):min(ih,${maxRes})':force_original_aspect_ratio=decrease`,
        'frame_%04d.png'
      ]);
      
      console.log("Reading file list...");
      const fileList = await engine.listDir('/');
      const frameFiles = fileList.filter(f => f.name.startsWith('frame_') && f.name.endsWith('.png'));
      frameFiles.sort((a, b) => a.name.localeCompare(b.name));
      
      if (frameFiles.length === 0) {
        throw new Error(lang === 'KR' ? "프레임이 추출되지 않았습니다. 비디오 형식을 확인하세요." : lang === 'EN' ? "No frames extracted. Check video format." : "フレームが抽出されませんでした。ビデオ形式を確認してください。");
      }

      if (frameFiles.length > maxFramesLimit) {
        console.warn(`Too many frames extracted, limiting to ${maxFramesLimit} for stability.`);
        frameFiles.splice(maxFramesLimit);
      }

      console.log(`Extracted ${frameFiles.length} frames. Loading into memory...`);
      setExtractionProgress({ current: 0, total: frameFiles.length });
      extractionProgressRef.current = { current: 0, lastUpdated: Date.now() };
      
      let frameWidth = 0;
      let frameHeight = 0;
      const CHUNK_SIZE = 10;
      const extractedFrames: StudioFrame[] = [];

      for (let i = 0; i < frameFiles.length; i++) {
        const f = frameFiles[i];
        const data = await engine.readFile(f.name);
        const blob = new Blob([data as any], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        
        if (i === 0) {
          const img = new Image();
          await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = url;
          });
          frameWidth = img.naturalWidth;
          frameHeight = img.naturalHeight;
        }

        extractedFrames.push({
          id: Math.random().toString(36).substring(7),
          rawUrl: url,
          width: frameWidth,
          height: frameHeight,
          name: f.name,
          sourceIndex: i
        });
        
        await engine.deleteFile(f.name);

        if (i === 0 || (i + 1) % CHUNK_SIZE === 0 || i === frameFiles.length - 1) {
          const currentFrames = [...extractedFrames];
          setFrames(currentFrames);
          setExtractionProgress({ current: i + 1, total: frameFiles.length });
          extractionProgressRef.current = { current: i + 1, lastUpdated: Date.now() };
          if (i === 0) setCurrentFrame(0);
        }
      }
      
      await engine.deleteFile('input.mp4');
      
      setIsPlaying(true);
      console.log("Extraction complete.");
      setExtractionStartMs(null);
      setExtractionStalled(false);
      setUploadState('ready');
    } catch (error) {
      console.error("Error extracting frames:", error);
      setExtractionStartMs(null);
      setExtractionStalled(false);
      setIsPlaying(false);
      setUploadState('error');
    }
  };

  return {
    uploadState,
    setUploadState,
    nativeExtractError,
    setNativeExtractError,
    skippedFramesWarning,
    setSkippedFramesWarning,
    extractionProgress,
    extractionStalled,
    extractionElapsedText,
    isExtracting,
    processFile,
    extractFramesWithFFmpeg,
    cancelExtraction,
    importGuardModal
  };
}
