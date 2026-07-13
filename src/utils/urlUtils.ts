import { StudioFrame } from '../types/mediaPipeline';

export interface HistoryItem {
  frameId?: string;
  undoUrl?: string;
  redoUrl?: string;
}

export const revokeUrlsSafely = (
  urlsToRevoke: string[], 
  activeFrames: StudioFrame[], 
  activeHistory: HistoryItem[][] = []
) => {
  const activeSet = new Set<string>();
  
  activeFrames.forEach(f => {
    if (f.rawUrl) activeSet.add(f.rawUrl);
    if (f.keyedUrl) activeSet.add(f.keyedUrl);
    if (f.recoveredUrl) activeSet.add(f.recoveredUrl);
  });
  
  activeHistory.forEach(historyItem => {
    if (Array.isArray(historyItem)) {
      historyItem.forEach(entry => {
        if (entry.undoUrl) activeSet.add(entry.undoUrl);
        if (entry.redoUrl) activeSet.add(entry.redoUrl);
      });
    }
  });
  
  urlsToRevoke.forEach(url => {
    if (url && url.startsWith('blob:') && !activeSet.has(url)) {
      URL.revokeObjectURL(url);
    }
  });
};
