import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export type FFmpegState = 'idle' | 'loading' | 'loaded' | 'error';

interface FFmpegContextType {
  ffmpeg: FFmpeg | null;
  loadState: FFmpegState;
  error: string | null;
  loadFFmpeg: () => Promise<FFmpeg | null>;
  retry: () => void;
}

const FFmpegContext = createContext<FFmpegContextType | undefined>(undefined);

export const FFmpegProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);
  const [loadState, setLoadState] = useState<FFmpegState>('idle');
  const [error, setError] = useState<string | null>(null);
  const loadingPromiseRef = useRef<Promise<FFmpeg | null> | null>(null);

  const loadFFmpeg = async (): Promise<FFmpeg | null> => {
    if (loadState === 'loaded' && ffmpeg) return ffmpeg;
    if (loadingPromiseRef.current) return loadingPromiseRef.current;

    setLoadState('loading');
    setError(null);

    const promise = (async () => {
      try {
        const ffmpegInstance = new FFmpeg();
        
        ffmpegInstance.on('log', ({ message }) => {
          console.log("[FFmpeg Log]", message);
        });
        
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        await ffmpegInstance.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        
        setFFmpeg(ffmpegInstance);
        setLoadState('loaded');
        loadingPromiseRef.current = null;
        return ffmpegInstance;
      } catch (err) {
        console.error("Failed to load FFmpeg:", err);
        setError("비디오 엔진 로딩 실패 (Video engine loading failed)");
        setLoadState('error');
        loadingPromiseRef.current = null;
        return null;
      }
    })();

    loadingPromiseRef.current = promise;
    return promise;
  };

  const retry = () => {
    loadFFmpeg();
  };

  return (
    <FFmpegContext.Provider value={{ ffmpeg, loadState, error, loadFFmpeg, retry }}>
      {children}
    </FFmpegContext.Provider>
  );
};

export const useFFmpeg = () => {
  const context = useContext(FFmpegContext);
  if (context === undefined) {
    throw new Error('useFFmpeg must be used within a FFmpegProvider');
  }
  return context;
};
