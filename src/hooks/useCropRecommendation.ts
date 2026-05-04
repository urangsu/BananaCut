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

  const analyzeProcessedFrames = useCallback(async (
    frames: StudioFrame[]
  ): Promise<{ box: Box | null; reason: 'no-box' | null }> => {
    setIsAnalyzingCrop(true);
    setCropAnalysisProgress({ current: 0, total: frames.length });
    
    try {
      const result = await analyzeFrameBounds(frames, {
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
    analyzeProcessedFrames
  };
}
