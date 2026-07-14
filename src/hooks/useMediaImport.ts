import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { extractFramesNative } from '../utils/nativeVideoExtract';
import { probeVideoFile } from '../utils/videoProbe';
import { StudioFrame, VideoProbeResult } from '../types/mediaPipeline';
import { getMediaLimits } from '../utils/mediaLimits';

export type UploadState = 'idle' | 'image-loading' | 'video-engine-loading' | 'video-extracting' | 'ready' | 'error';

export type ImportGuardModalState = {
  type: 'import-plan';
  probeResult: VideoProbeResult;
  onConfirm: (chosenFps: number, chosenMode: 'original' | 'balanced1080' | 'safe720') => void;
  onCancel: () => void;
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
    if (f.rawUrl?.startsWith('blob:')) {
      try { URL.revokeObjectURL(f.rawUrl); } catch (e) {}
    }
    if (f.keyedUrl?.startsWith('blob:')) {
      try { URL.revokeObjectURL(f.keyedUrl); } catch (e) {}
    }
    if (f.recoveredUrl?.startsWith('blob:')) {
      try { URL.revokeObjectURL(f.recoveredUrl); } catch (e) {}
    }
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

  const processFile = async (file: File) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    const runId = ++extractionRunIdRef.current;
    const isCurrentRun = () => extractionRunIdRef.current === runId;

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExtensions = ['mp4', 'mov', 'png', 'jpg', 'jpeg', 'webm'];
    if (!allowedExtensions.includes(ext)) {
      setImportGuardModal({
        type: 'invalid-format',
        onConfirm: () => {
          setImportGuardModal(null);
          setUploadState('idle');
        },
        onCancel: () => {
          setImportGuardModal(null);
          setUploadState('idle');
        }
      });
      return;
    }

    setImgDims(null);
    setExclusionStrokes([]);
    
    // Revoke old frames before loading new ones (Atomic Replacement)
    if (frames.length > 0) {
      frames.forEach(revokeFrameUrls);
      setFrames([]);
    }
    
    // 1. Handle Image Upload
    if (file.type.startsWith('image/')) {
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
        
        const frameWidth = img.naturalWidth;
        const frameHeight = img.naturalHeight;

        const newFrame: StudioFrame = {
          id: `frame-image-${Math.random().toString(36).substring(7)}`,
          rawUrl: url,
          width: frameWidth,
          height: frameHeight,
          name: file.name,
          provenance: {
            sourceIndex: 0,
            targetTimeMs: 0,
            captureMethod: 'image',
            sourceWidth: frameWidth,
            sourceHeight: frameHeight,
            outputWidth: frameWidth,
            outputHeight: frameHeight
          },
          keyDirty: true,
          recoverDirty: true,
          qualityFlags: []
        };

        setFrames([newFrame]);
        setCurrentFrame(0);
        setImgDims({ w: frameWidth, h: frameHeight });
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
        setNativeExtractError('[Image Error]\n이미지 파일을 로드하지 못했습니다.');
        setIsPlaying(false);
      }
      return;
    }
    
    // 2. Handle Video Probe (Validation Phase)
    try {
      const probeResult = await probeVideoFile(file, fps);

      // Present the Import Plan modal to user
      await new Promise<void>((resolve, reject) => {
        setImportGuardModal({
          type: 'import-plan',
          probeResult,
          onConfirm: async (chosenFps = probeResult.requestedFps, chosenMode = probeResult.qualityMode) => {
            setImportGuardModal(null);
            
            // Re-calculate dimensions for the plan
            let width = probeResult.sourceWidth;
            let height = probeResult.sourceHeight;
            if (chosenMode === 'balanced1080') {
              const ratio = Math.min(1920 / width, 1080 / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            } else if (chosenMode === 'safe720') {
              const ratio = Math.min(1280 / width, 720 / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }
            width = width - (width % 2);
            height = height - (height % 2);

            // Trigger extraction run
            await startVideoExtraction(file, chosenFps, width, height, runId);
            resolve();
          },
          onCancel: () => {
            setImportGuardModal(null);
            setUploadState('idle');
            reject(new Error('User cancelled'));
          }
        });
      });
    } catch (e) {
      if (e instanceof Error && e.message === "User cancelled") return;
      console.warn("Import process error:", e);
    }
  };

  const startVideoExtraction = async (
    file: File,
    chosenFps: number,
    width: number,
    height: number,
    runId: number
  ) => {
    const isCurrentRun = () => extractionRunIdRef.current === runId;
    abortControllerRef.current = new AbortController();
    
    setUploadState('video-extracting');
    setNativeExtractError(null);
    setSkippedFramesWarning(false);
    setVideoFile(file);
    setFrames([]);
    setExtractionProgress({ current: 0, total: 0 });
    setExtractionStartMs(Date.now());
    extractionProgressRef.current = { current: 0, lastUpdated: Date.now() };
    
    const accumulatedFrames: StudioFrame[] = [];
    activeImportFramesRef.current = [];

    try {
      const result = await extractFramesNative(file, {
        fps: chosenFps,
        plannedWidth: width,
        plannedHeight: height,
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
          // Avoid quadratic array duplication copies: push onto existing reference
          accumulatedFrames.push(...chunk);
          activeImportFramesRef.current = accumulatedFrames;
          setFrames([...accumulatedFrames]);
          
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
      
      setFrames(result.frames);
      setSkippedFramesWarning(result.skippedSlots.length > 0);
      setIsPlaying(true);
      setUploadState('ready');
      setExtractionStartMs(null);
      setExtractionStalled(false);
      abortControllerRef.current = null;
    } catch (err: any) {
      if (!isCurrentRun()) {
        accumulatedFrames.forEach(revokeFrameUrls);
        return;
      }
      if (err instanceof Error && err.message === 'Aborted') {
        accumulatedFrames.forEach(revokeFrameUrls);
        setFrames([]);
        setUploadState('idle');
        setExtractionStartMs(null);
        setExtractionStalled(false);
        abortControllerRef.current = null;
        setIsPlaying(false);
        return;
      }

      console.error("Browser video extraction failed, fallback triggered:", err);
      accumulatedFrames.forEach(revokeFrameUrls);
      setFrames([]);
      setNativeExtractError(err instanceof Error ? err.message : '비디오 프레임 추출 중 에러가 발생했습니다.');
      setExtractionProgress({ current: 0, total: 0 });
      setUploadState('error'); // Trigger UI so user can choose FFmpeg Fallback
      setIsPlaying(false);
    } finally {
      if (isCurrentRun()) {
        abortControllerRef.current = null;
        setIsProcessingLocal(false);
        setExtractionStartMs(null);
        setExtractionStalled(false);
      }
    }
  };

  const extractFramesWithFFmpeg = async (file: File, targetFps: number, engine: FFmpeg) => {
    if (!engine) {
      console.warn("FFmpeg engine not loaded.");
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
      console.log("Starting FFmpeg extraction for:", file.name);
      await engine.writeFile('input.mp4', await fetchFile(file));
      setImgDims(null);
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      const limits = getMediaLimits(isMobile);
      const maxRes = isMobile ? 720 : 1080;
      const maxFramesLimit = limits.hardFrames;
      
      console.log(`Running FFmpeg command with scaling (Max ${maxRes}p)...`);
      
      await engine.exec([
        '-i', 'input.mp4',
        '-vf', `fps=${targetFps},scale='min(iw,${maxRes === 1080 ? 1920 : 1280}):min(ih,${maxRes})':force_original_aspect_ratio=decrease`,
        'frame_%04d.png'
      ]);
      
      console.log("Reading FFmpeg frame files...");
      const fileList = await engine.listDir('/');
      const frameFiles = fileList.filter(f => f.name.startsWith('frame_') && f.name.endsWith('.png'));
      frameFiles.sort((a, b) => a.name.localeCompare(b.name));
      
      if (frameFiles.length === 0) {
        throw new Error(lang === 'KR' ? "프레임이 추출되지 않았습니다. 비디오 형식을 확인하세요." : lang === 'EN' ? "No frames extracted. Check video format." : "フレームが抽出されませんでした。ビデオ形式を確認してください。");
      }

      if (frameFiles.length > maxFramesLimit) {
        frameFiles.splice(maxFramesLimit);
      }

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
          id: `frame-ffmpeg-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          rawUrl: url,
          width: frameWidth,
          height: frameHeight,
          name: f.name,
          provenance: {
            sourceIndex: i,
            targetTimeMs: Math.round(i * (1000 / targetFps)),
            captureMethod: 'ffmpeg',
            sourceWidth: frameWidth,
            sourceHeight: frameHeight,
            outputWidth: frameWidth,
            outputHeight: frameHeight
          },
          keyDirty: true,
          recoverDirty: true,
          qualityFlags: []
        });
        
        await engine.deleteFile(f.name);

        if (i === 0 || (i + 1) % CHUNK_SIZE === 0 || i === frameFiles.length - 1) {
          setFrames([...extractedFrames]);
          setExtractionProgress({ current: i + 1, total: frameFiles.length });
          extractionProgressRef.current = { current: i + 1, lastUpdated: Date.now() };
          if (i === 0) {
            setCurrentFrame(0);
            setImgDims({ w: frameWidth, h: frameHeight });
          }
        }
      }
      
      await engine.deleteFile('input.mp4');
      
      setIsPlaying(true);
      setExtractionStartMs(null);
      setExtractionStalled(false);
      setUploadState('ready');
    } catch (error) {
      console.error("Error extracting frames with FFmpeg:", error);
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
