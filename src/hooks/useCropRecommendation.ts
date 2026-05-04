import { useState, useCallback } from 'react';
import { analyzeFrameBounds, Box } from '../utils/boundingBox';
import { StudioFrame } from '../StudioContext';

export function useCropRecommendation() {
  const [cropSettings, setCropSettings] = useState<{
    box: Box | null;
    recommendedCanvas: { width: number; height: number } | null;
    enabledForExport: boolean;
    isPreviewing: boolean;
  }>({
    box: null,
    recommendedCanvas: null,
    enabledForExport: false,
    isPreviewing: false
  });
  const [isAnalyzingCrop, setIsAnalyzingCrop] = useState(false);
  const [cropAnalysisProgress, setCropAnalysisProgress] = useState({ current: 0, total: 0 });

  const analyze = useCallback(async (
    frames: StudioFrame[],
    processFrames: (indices: number[]) => Promise<StudioFrame[] | null>
  ): Promise<{ box: Box | null; reason: 'processing-failed' | 'no-box' | null }> => {
    let dirtyIndices: number[] = [];
    frames.forEach((f, i) => {
      if (!f.processedUrl || f.dirty) dirtyIndices.push(i);
    });
    
    let framesToAnalyze = frames;
    if (dirtyIndices.length > 0) {
      const updatedFrames = await processFrames(dirtyIndices);
      if (updatedFrames) {
        framesToAnalyze = updatedFrames;
      } else {
        return { box: null, reason: 'processing-failed' };
      }
    }

    setIsAnalyzingCrop(true);
    setCropAnalysisProgress({ current: 0, total: framesToAnalyze.length });
    
    try {
      const result = await analyzeFrameBounds(framesToAnalyze, {
        alphaThreshold: 10,
        padding: 5,
        useProcessed: true,
        onProgress: (current, total) => setCropAnalysisProgress({ current, total })
      });
      
      if (result.stableBox) {
        setCropSettings({
          box: result.stableBox,
          recommendedCanvas: result.recommendedCanvas,
          enabledForExport: false,
          isPreviewing: true
        });
        return { box: result.stableBox, reason: null };
      }
      return { box: null, reason: 'no-box' };
    } finally {
      setIsAnalyzingCrop(false);
    }
  }, []);

  return {
    cropSettings,
    setCropSettings,
    isAnalyzingCrop,
    cropAnalysisProgress,
    analyze
  };
}
