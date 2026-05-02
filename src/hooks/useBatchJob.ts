import { useState, useCallback, useRef } from 'react';

export interface BatchJobConfig<T, R> {
  items: T[];
  processItem: (item: T, index: number) => Promise<R>;
  onSuccess?: (results: R[]) => void;
  onPartialSuccess?: (results: R[], failedItems: T[]) => void;
  onError?: (err: Error) => void;
  chunkSizeMobile?: number;
  chunkSizeDesktop?: number;
  delayMs?: number;
}

export function useBatchJob() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(-1);
  const cancelRef = useRef(false);

  const startJob = useCallback(async <T, R>(config: BatchJobConfig<T, R>) => {
    setIsProcessing(true);
    setProgress(0);
    cancelRef.current = false;

    const {
      items,
      processItem,
      onSuccess,
      onPartialSuccess,
      onError,
      chunkSizeMobile = 5,
      chunkSizeDesktop = 10,
      delayMs = 0
    } = config;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    const chunkSize = isMobile ? chunkSizeMobile : chunkSizeDesktop;

    const results: R[] = [];
    const failedItems: T[] = [];

    try {
      for (let i = 0; i < items.length; i += chunkSize) {
        if (cancelRef.current) {
          break; // Cancelled
        }

        const chunk = items.slice(i, i + chunkSize);
        
        // Yield to allow UI to render progress and prevent freeze
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
        for (let j = 0; j < chunk.length; j++) {
           if (cancelRef.current) break;
           const item = chunk[j];
           try {
             const result = await processItem(item, i + j);
             results.push(result);
           } catch (err) {
             console.error("Failed to process item", item, err);
             failedItems.push(item);
           }
        }
        
        setProgress(Math.round(((i + chunk.length) / items.length) * 100));
      }

      if (cancelRef.current) {
        setIsProcessing(false);
        setProgress(-1);
        return; // Don't trigger success if cancelled
      }

      if (failedItems.length > 0 && onPartialSuccess) {
        onPartialSuccess(results, failedItems);
      } else if (onSuccess) {
        onSuccess(results);
      }
    } catch (err) {
      if (onError) onError(err as Error);
    } finally {
      setIsProcessing(false);
      setProgress(-1);
    }
  }, []);

  const cancelJob = useCallback(() => {
    cancelRef.current = true;
  }, []);

  return { isProcessing, progress, startJob, cancelJob };
}
