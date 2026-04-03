import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

interface FFmpegContextType {
  ffmpeg: FFmpeg | null;
  isLoaded: boolean;
  error: string | null;
  retry: () => void;
}

const FFmpegContext = createContext<FFmpegContextType | undefined>(undefined);

export const FFmpegProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const loadFFmpeg = async () => {
      try {
        setIsLoaded(false);
        setError(null);
        const ffmpegInstance = new FFmpeg();
        
        ffmpegInstance.on('log', ({ message }) => {
          console.log("[FFmpeg Log]", message);
        });
        
        // Use a more reliable CDN or multiple fallbacks if needed
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        
        await ffmpegInstance.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        
        if (isMounted) {
          setFFmpeg(ffmpegInstance);
          setIsLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load FFmpeg:", err);
        if (isMounted) {
          setError("BananaCut 엔진을 불러오지 못했습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.");
          setIsLoaded(false);
        }
      }
    };
    
    loadFFmpeg();
    return () => { isMounted = false; };
  }, [retryCount]);

  const retry = () => setRetryCount(prev => prev + 1);

  return (
    <FFmpegContext.Provider value={{ ffmpeg, isLoaded, error, retry }}>
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
