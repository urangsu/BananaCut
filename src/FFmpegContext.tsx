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
      const isDebug = import.meta.env.DEV || new URLSearchParams(window.location.search).get('debug') === '1';
      const logDebug = (...args: any[]) => { if (isDebug) console.log(...args); };

      const tryLoadFFmpegFromSource = async (baseURL: string, sourceName: string): Promise<FFmpeg> => {
        const instance = new FFmpeg();

        instance.on('log', ({ message }) => {
          logDebug(`[FFmpeg:${sourceName}] ${message}`);
        });

        instance.on('progress', ({ progress, time }) => {
          // logDebug(`[FFmpeg:${sourceName}] progress ${progress} ${time}`);
        });

        const start = Date.now();
        let stage: 'toBlobURL' | 'ffmpeg.load' | 'timeout' = 'toBlobURL';
        try {
          const [coreURL, wasmURL] = await Promise.all([
            toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
          ]);

          stage = 'ffmpeg.load';
          await instance.load({ coreURL, wasmURL });
          return instance;
        } catch (e: any) {
          throw {
            source: sourceName,
            baseURL,
            stage,
            message: e.message || String(e),
            durationMs: Date.now() - start
          };
        }
      };

      const loadWithTimeout = async (
        loader: () => Promise<FFmpeg>,
        timeoutMs: number,
        sourceName: string,
        baseURL: string
      ): Promise<FFmpeg> => {
        const start = Date.now();
        return new Promise<FFmpeg>((resolve, reject) => {
          const timer = setTimeout(() => {
            reject({
              source: sourceName,
              baseURL,
              stage: 'timeout',
              message: `Timeout after ${timeoutMs}ms`,
              durationMs: Date.now() - start
            });
          }, timeoutMs);

          loader().then((instance) => {
            clearTimeout(timer);
            resolve(instance);
          }).catch((err) => {
            clearTimeout(timer);
            reject(err);
          });
        });
      };

      const localBaseURL = `${window.location.origin}/ffmpeg`;
      const jsdelivrBaseURL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd`;
      const unpkgBaseURL = `https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd`;

      const errors: any[] = [];
      const totalStart = Date.now();

      try {
        logDebug(`[FFmpeg] Loading from local start...`);
        const instance = await loadWithTimeout(
          () => tryLoadFFmpegFromSource(localBaseURL, 'local'),
          30000,
          'local',
          localBaseURL
        );
        logDebug(`[FFmpeg] Local load succeeded! duration=${Date.now() - totalStart}ms`);
        setFFmpeg(instance);
        setLoadState('loaded');
        loadingPromiseRef.current = null;
        return instance;
      } catch (localError: any) {
        errors.push(localError);
        logDebug(`[FFmpeg] Local load failed:`, localError);

        try {
          const jsdelivrStart = Date.now();
          logDebug(`[FFmpeg] Loading from jsdelivr start...`);
          const instance = await loadWithTimeout(
             () => tryLoadFFmpegFromSource(jsdelivrBaseURL, 'jsdelivr'),
             40000,
             'jsdelivr',
             jsdelivrBaseURL
          );
          logDebug(`[FFmpeg] jsdelivr load succeeded! duration=${Date.now() - jsdelivrStart}ms`);
          setFFmpeg(instance);
          setLoadState('loaded');
          loadingPromiseRef.current = null;
          return instance;
        } catch (jsdelivrError: any) {
          errors.push(jsdelivrError);
          logDebug(`[FFmpeg] jsdelivr load failed:`, jsdelivrError);
          
          try {
            const unpkgStart = Date.now();
            logDebug(`[FFmpeg] Loading from unpkg start...`);
            const instance = await loadWithTimeout(
              () => tryLoadFFmpegFromSource(unpkgBaseURL, 'unpkg'),
              40000,
              'unpkg',
              unpkgBaseURL
            );
            logDebug(`[FFmpeg] unpkg load succeeded! duration=${Date.now() - unpkgStart}ms`);
            setFFmpeg(instance);
            setLoadState('loaded');
            loadingPromiseRef.current = null;
            return instance;
          } catch (unpkgError: any) {
             errors.push(unpkgError);
             logDebug(`[FFmpeg] unpkg load failed:`, unpkgError);
             
             // All failed
             const totalDuration = Date.now() - totalStart;
             const errorMsg = `비디오 엔진 로딩 실패 (Video engine loading failed)\nTotal duration: ${totalDuration}ms\nDetailed Error Traces:\n${JSON.stringify(errors, null, 2)}`;
             setError(errorMsg);
             setLoadState('error');
             loadingPromiseRef.current = null;
             return null;
          }
        }
      }
    })();

    loadingPromiseRef.current = promise;
    return promise;
  };

  const retry = () => {
    setLoadState('idle');
    setError(null);
    loadingPromiseRef.current = null;
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
