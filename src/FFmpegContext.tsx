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

        const probeAsset = async (url: string) => {
          try {
            const res = await fetch(url, { method: 'GET', cache: 'no-store' });
            const contentType = res.headers.get('content-type') || '';
            const textSample = contentType.includes('text/html')
              ? await res.clone().text().then(t => t.slice(0, 120)).catch(() => '')
              : '';
            return { url, ok: res.ok, status: res.status, contentType, textSample };
          } catch (e: any) {
            return { url, ok: false, error: e.message };
          }
        };

        const localBaseURL = `${window.location.origin}/ffmpeg`;

        const loadCoreFromBase = async (baseURL: string, sourceName: string) => {
          const start = Date.now();
          logDebug(`[FFmpeg] Loading from ${sourceName} ${baseURL} start...`);

          const coreUrl = `${baseURL}/ffmpeg-core.js`;
          const wasmUrl = `${baseURL}/ffmpeg-core.wasm`;

          let coreProbe, wasmProbe;
          coreProbe = await probeAsset(coreUrl);
          wasmProbe = await probeAsset(wasmUrl);

          logDebug(`[FFmpeg] Probe ${sourceName}: core=${coreProbe.status}, wasm=${wasmProbe.status}`);

          if (!coreProbe.ok || !wasmProbe.ok) {
             console.error(`[FFmpeg] Probe failed for ${sourceName}:`, { coreProbe, wasmProbe });
          }

          const toBlobStart = Date.now();
          let coreURL, wasmURL;
          try {
            [coreURL, wasmURL] = await Promise.all([
              toBlobURL(coreUrl, 'text/javascript'),
              toBlobURL(wasmUrl, 'application/wasm')
            ]);
            logDebug(`[FFmpeg] toBlobURL from ${sourceName} completed in ${Date.now() - toBlobStart}ms`);
          } catch (e: any) {
             const errorMsg = `toBlobURL failed: ${e.message}\nCore Probe: ${JSON.stringify(coreProbe)}\nWasm Probe: ${JSON.stringify(wasmProbe)}`;
             console.error(`[FFmpeg] toBlobURL error from ${sourceName}:`, e, { coreProbe, wasmProbe });
             throw new Error(errorMsg);
          }

          const loadStart = Date.now();
          try {
            await ffmpegInstance.load({
              coreURL,
              wasmURL
            });
            logDebug(`[FFmpeg] ffmpeg.load from ${sourceName} completed in ${Date.now() - loadStart}ms`);
          } catch (e: any) {
            const errorMsg = `ffmpeg.load failed: ${e.message}\nCore Probe: ${JSON.stringify(coreProbe)}\nWasm Probe: ${JSON.stringify(wasmProbe)}`;
            console.error(`[FFmpeg] ffmpeg.load error from ${sourceName}:`, e, { coreProbe, wasmProbe });
            throw new Error(errorMsg);
          }

          logDebug(`[FFmpeg] Selected Source: ${sourceName}. Total load time: ${Date.now() - start}ms`);
        };

        const totalStart = Date.now();
        let lastErrorMsg = '';
        try {
          await loadWithTimeout(
            () => loadCoreFromBase(localBaseURL, 'local'),
            15000,
            'local domain'
          );
        } catch (localError: any) {
          lastErrorMsg = localError?.message || String(localError);
          logDebug(`[FFmpeg] Local load failed: ${lastErrorMsg}`);
          try {
             await loadWithTimeout(
              () => loadCoreFromBase('https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm', 'unpkg'),
              25000,
              'unpkg'
            );
          } catch (unpkgError: any) {
            lastErrorMsg = unpkgError?.message || String(unpkgError);
            logDebug(`[FFmpeg] unpkg load failed: ${lastErrorMsg}`);
            try {
              await loadWithTimeout(
                () => loadCoreFromBase('https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm', 'jsdelivr'),
                25000,
                'jsdelivr'
              );
            } catch (jsdelivrError: any) {
              lastErrorMsg = jsdelivrError?.message || String(jsdelivrError);
              logDebug(`[FFmpeg] jsdelivr load failed: ${lastErrorMsg}`);
              throw new Error(`All FFmpeg load sources failed. Last error: ${lastErrorMsg}`);
            }
          }
        }
        logDebug(`[FFmpeg] Total load duration: ${Date.now() - totalStart}ms`);
        
        setFFmpeg(ffmpegInstance);
        setLoadState('loaded');
        loadingPromiseRef.current = null;
        return ffmpegInstance;
      } catch (err: any) {
        console.error("Failed to load FFmpeg:", err);
        const isDebug = import.meta.env.DEV || new URLSearchParams(window.location.search).get('debug') === '1';
        if (isDebug) {
          setError(`비디오 엔진 로딩 실패 (Video engine loading failed)\nDetailed Error:\n${err?.message || err}`);
        } else {
          setError("비디오 엔진 로딩 실패 (Video engine loading failed)");
        }
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
