import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Segment {
  name: string;
  start: number;
  end: number;
  useFrames?: boolean;
}

export interface Preset {
  id: string;
  name: string;
  segments: Segment[];
}

export type StudioFrame = {
  id: string;
  rawUrl: string;
  processedUrl?: string;
  width: number;
  height: number;
  name?: string;
  sourceIndex: number;
  dirty?: boolean;
};

const DEFAULT_PRESETS: Preset[] = [
  {
    id: "preset-1",
    name: "Video 1 — 코어 업무 루프 (8초)",
    segments: [
      { name: "idle_sitting", start: 0.0, end: 2.5 },
      { name: "typing", start: 2.5, end: 6.0 },
      { name: "back_to_idle", start: 6.0, end: 8.0 },
    ]
  },
  {
    id: "preset-2",
    name: "Video 2 — 소통과 인터랙션 (8초)",
    segments: [
      { name: "speaking", start: 0.0, end: 3.0 },
      { name: "agree", start: 3.0, end: 5.5 },
      { name: "confused", start: 5.5, end: 8.0 },
    ]
  },
  {
    id: "preset-3",
    name: "Video 3 — 물리 드래그 앤 드롭 (8초)",
    segments: [
      { name: "idle_sitting", start: 0.0, end: 1.0 },
      { name: "lifted_dangling", start: 1.0, end: 4.5 },
      { name: "lowering_landing", start: 4.5, end: 6.5 },
      { name: "back_to_work", start: 6.5, end: 8.0 },
    ]
  },
  {
    id: "preset-4",
    name: "Video 4 — 감정 표현 (8초)",
    segments: [
      { name: "greeting", start: 0.0, end: 3.0 },
      { name: "joy", start: 3.0, end: 5.5 },
      { name: "sad", start: 5.5, end: 8.0 },
    ]
  },
  {
    id: "preset-5",
    name: "Video 5 — 출퇴근 사이클 (8초)",
    segments: [
      { name: "typing", start: 0.0, end: 2.5 },
      { name: "resting", start: 2.5, end: 5.5 },
      { name: "clock_in", start: 5.5, end: 8.0 },
    ]
  }
];

interface StudioContextType {
  frames: StudioFrame[];
  setFrames: React.Dispatch<React.SetStateAction<StudioFrame[]>>;
  videoFile: File | null;
  setVideoFile: React.Dispatch<React.SetStateAction<File | null>>;
  charName: string;
  setCharName: React.Dispatch<React.SetStateAction<string>>;
  segments: Segment[];
  setSegments: React.Dispatch<React.SetStateAction<Segment[]>>;
  fps: number;
  setFps: React.Dispatch<React.SetStateAction<number>>;
  exclusionMasks: Map<number, Uint8Array>;
  setExclusionMasks: React.Dispatch<React.SetStateAction<Map<number, Uint8Array>>>;
  presets: Preset[];
  setPresets: React.Dispatch<React.SetStateAction<Preset[]>>;
  flaggedIndices: number[];
  setFlaggedIndices: React.Dispatch<React.SetStateAction<number[]>>;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [frames, setFrames] = useState<StudioFrame[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [exclusionMasks, setExclusionMasks] = useState<Map<number, Uint8Array>>(new Map());

  // Persistent States
  const [charName, setCharName] = useState(() => localStorage.getItem('ck_charName') || 'sloth');
  const [fps, setFps] = useState(() => {
    const saved = localStorage.getItem('ck_fps');
    return saved ? parseInt(saved, 10) : 12;
  });
  const [segments, setSegments] = useState<Segment[]>(() => {
    const saved = localStorage.getItem('ck_segments');
    return saved ? JSON.parse(saved) : [{ name: "idle_sitting", start: 0, end: 2.5 }];
  });
  const [presets, setPresets] = useState<Preset[]>(() => {
    const saved = localStorage.getItem('ck_presets');
    return saved ? JSON.parse(saved) : DEFAULT_PRESETS;
  });
  const [flaggedIndices, setFlaggedIndices] = useState<number[]>(() => {
    const saved = localStorage.getItem('ck_flaggedIndices');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('ck_charName', charName); }, [charName]);
  useEffect(() => { localStorage.setItem('ck_fps', fps.toString()); }, [fps]);
  useEffect(() => { localStorage.setItem('ck_segments', JSON.stringify(segments)); }, [segments]);
  useEffect(() => { localStorage.setItem('ck_presets', JSON.stringify(presets)); }, [presets]);
  useEffect(() => { localStorage.setItem('ck_flaggedIndices', JSON.stringify(flaggedIndices)); }, [flaggedIndices]);

  return (
    <StudioContext.Provider value={{
      frames, setFrames,
      videoFile, setVideoFile,
      charName, setCharName,
      segments, setSegments,
      fps, setFps,
      exclusionMasks, setExclusionMasks,
      presets, setPresets,
      flaggedIndices, setFlaggedIndices
    }}>
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (context === undefined) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};
