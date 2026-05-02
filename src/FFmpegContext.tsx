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
        
        const isDebug = import.meta.env.DEV || new URLSearchParams(window.location.search).get('debug') === '1';
        const logDebug = (msg: string) => { if (isDebug) console.log(msg); };

        // @ts-ignore
        const loadWithTimeout = async (
          loader: () => Promise<void>,
          timeoutMs: number,
          sourceName: string
        ) => {
          return new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error(`Timeout loading from ${sourceName}`)), timeoutMs);
            loader().then(() => {
              clearTimeout(timer);
              resolve();
            }).catch((err) => {
              clearTimeout(timer);
              reject(err);
            });
          });
        };

        const localLoad = async () => {
          const start = Date.now();
          logDebug(`[FFmpeg] Loading from local start...`);
          await ffmpegInstance.load({
            coreURL: '/ffmpeg/ffmpeg-core.js',
            wasmURL: '/ffmpeg/ffmpeg-core.wasm',
            workerURL: '/ffmpeg/ffmpeg-core.worker.js'
          });
          logDebug(`[FFmpeg] Selected Source: Local. Loaded in ${Date.now() - start}ms`);
        };

        const fallbackLoad = async (baseURL: string) => {
          const start = Date.now();
          logDebug(`[FFmpeg] Loading from fallback ${baseURL} start...`);
          const [coreURL, wasmURL, workerURL] = await Promise.all([
            toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
          ]);
          await ffmpegInstance.load({ coreURL, wasmURL, workerURL });
          logDebug(`[FFmpeg] Selected Source: Fallback ${baseURL}. Loaded in ${Date.now() - start}ms`);
        };

        const totalStart = Date.now();
        try {
          await loadWithTimeout(localLoad, 20000, 'local domain');
        } catch (localError: any) {
          logDebug(`[FFmpeg] Local load failed: ${localError?.message || localError}`);
          try {
            await loadWithTimeout(
              () => fallbackLoad('https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.6/dist/esm'),
              25000,
              'jsdelivr'
            );
          } catch (jsdelivrError: any) {
            logDebug(`[FFmpeg] jsdelivr load failed: ${jsdelivrError?.message || jsdelivrError}`);
            try {
              await loadWithTimeout(
                () => fallbackLoad('https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm'),
                25000,
                'unpkg'
              );
            } catch (unpkgError: any) {
              logDebug(`[FFmpeg] unpkg load failed: ${unpkgError?.message || unpkgError}`);
              throw new Error('All FFmpeg load sources failed.');
            }
          }
        }
        logDebug(`[FFmpeg] Total load duration: ${Date.now() - totalStart}ms`);
        
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
