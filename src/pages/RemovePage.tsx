import React, { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Upload, Play, Square, Download, Settings, Loader2, Sliders, ChevronDown, Brush, Eraser, MousePointer2, X, Flag, Pipette } from 'lucide-react';
import JSZip from 'jszip';
import { useTheme } from '../ThemeContext';
import { useFFmpeg } from '../FFmpegContext';
import { useStudio } from '../StudioContext';
import { trackEvent } from '../lib/analytics';
import { DownloadModal } from '../components/DownloadModal';

const MIDDLE_NAME_OPTIONS = [
  { id: "idle_sitting", desc: "자연스러운 호흡" },
  { id: "typing", desc: "빠른 타이핑" },
  { id: "back_to_idle", desc: "자연스러운 복귀" },
  { id: "speaking", desc: "부드러운 입 움직임" },
  { id: "agree", desc: "자신감 있는 끄덕임" },
  { id: "confused", desc: "부드러운 고개 기울임" },
  { id: "lifted_dangling", desc: "가볍게 떠있는 상태" },
  { id: "lowering_landing", desc: "천천히 내려앉기" },
  { id: "back_to_work", desc: "자세 정리" },
  { id: "greeting", desc: "정중한 인사" },
  { id: "joy", desc: "밝은 표정" },
  { id: "sad", desc: "슬픈 표정" },
  { id: "resting", desc: "조용히 앉아있기" },
  { id: "clock_in", desc: "노트북 열고 준비" }
];



export default function RemovePage() {
  const { isDark } = useTheme();
  const { ffmpeg, isLoaded, error: ffmpegError, retry: retryFFmpeg } = useFFmpeg();
  const { 
    frames, setFrames, 
    videoFile, setVideoFile, 
    charName, setCharName, 
    segments, setSegments, 
    fps, setFps,
    exclusionMasks, setExclusionMasks,
    presets, setPresets,
    flaggedIndices, setFlaggedIndices
  } = useStudio();
  
  const [isExtracting, setIsExtracting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadLang, setDownloadLang] = useState<'KR' | 'EN' | 'JP'>('EN');
  
  const [currentFrame, setCurrentFrame] = useState(0);
  const [selectedFrames, setSelectedFrames] = useState<Set<number>>(new Set([0]));
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [bgMode, setBgMode] = useState<'transparent' | 'black' | 'app'>('app');
  const [imgDims, setImgDims] = useState<{ w: number, h: number } | null>(null);
  const [drawTick, setDrawTick] = useState(0);
  const applyToSelectedRef = useRef(false);
  
  // Chroma Key Settings
  const [chromaKeyColor, setChromaKeyColor] = useState<'White' | 'Green' | 'Picker'>('White');
  const [pickedColor, setPickedColor] = useState<{r: number, g: number, b: number}>({r: 255, g: 255, b: 255});
  const [isPickingColor, setIsPickingColor] = useState(false);
  const [tolerance, setTolerance] = useState(() => Number(localStorage.getItem('ck_tolerance')) || 30);
  const [softness, setSoftness] = useState(() => Number(localStorage.getItem('ck_softness')) || 20);
  const [enclosedTolerance, setEnclosedTolerance] = useState(() => Number(localStorage.getItem('ck_enclosedTolerance')) || 10);
  
  // UI State
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [showMiddleNameDropdown, setShowMiddleNameDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Brush Tool for Chroma Key Exclusion
  const [isBrushActive, setIsBrushActive] = useState(false);
  const [activeTool, setActiveTool] = useState<'brush' | 'eraser'>('brush');
  const [brushSize, setBrushSize] = useState(30);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    localStorage.setItem('ck_tolerance', tolerance.toString());
    localStorage.setItem('ck_softness', softness.toString());
    localStorage.setItem('ck_enclosedTolerance', enclosedTolerance.toString());
    localStorage.setItem('ck_charName', charName);
  }, [tolerance, softness, enclosedTolerance, charName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMiddleNameDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '[') {
        setBrushSize(prev => Math.max(1, prev - 5));
      } else if (e.key === ']') {
        setBrushSize(prev => Math.min(200, prev + 5));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSelection = (idx: number, ctrlKey: boolean, shiftKey: boolean) => {
    setSelectedFrames(prev => {
      const next = new Set(prev);
      if (shiftKey && currentFrame !== null) {
        const start = Math.min(currentFrame, idx);
        const end = Math.max(currentFrame, idx);
        for (let i = start; i <= end; i++) {
          next.add(i);
        }
      } else if (ctrlKey) {
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
      } else {
        next.clear();
        next.add(idx);
      }
      return next;
    });
    setCurrentFrame(idx);
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastDrawTime = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;
    
    const animate = (time: number) => {
      if (time - lastDrawTime.current > 1000 / fps) {
        setCurrentFrame((prev) => (prev + 1) % frames.length);
        lastDrawTime.current = time;
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isPlaying, frames, fps]);

  const applyChromaKey = (data: Uint8ClampedArray, width: number, height: number, tol: number, soft: number, enclosedTol: number, colorMode: 'White' | 'Green' | 'Picker', pickedColor: {r: number, g: number, b: number}, exclusionMask?: Uint8Array) => {
    if (colorMode === 'Green') {
      const threshold = (tol / 100) * 200; // Adjusted threshold for new distance formula
      for (let i = 0; i < data.length; i += 4) {
        if (exclusionMask && exclusionMask[i / 4] === 1) continue;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Euclidean distance from pure green (0, 255, 0)
        const dist = Math.sqrt(r * r + (255 - g) * (255 - g) + b * b);
        
        // Greenness penalty: If G is not significantly larger than R and B, it's not green.
        // This prevents other colors (like skin tones or white) from being removed.
        const greennessPenalty = Math.max(0, Math.max(r, b) - g + 30) * 8;
        
        const finalDist = dist + greennessPenalty;
        
        if (finalDist < threshold) {
          data[i + 3] = 0;
        } else if (finalDist < threshold + soft) {
          const alpha = ((finalDist - threshold) / soft) * 255;
          data[i + 3] = Math.min(data[i + 3], alpha);
        }
      }
      return;
    }

    const visited = new Uint8Array(width * height);
    const stack: number[] = [];
    
    const getDist = (r: number, g: number, b: number) => {
      if (colorMode === 'Picker') {
        const dist = Math.sqrt((pickedColor.r - r) ** 2 + (pickedColor.g - g) ** 2 + (pickedColor.b - b) ** 2);
        return dist * (100 / 441); // Scale to 0-100 to match tolerance
      }
      const lumaDist = Math.sqrt((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2);
      const satPenalty = (Math.max(r, g, b) - Math.min(r, g, b)) * 4; 
      const brightness = (r + g + b) / 3;
      const darkPenalty = brightness < 235 ? (235 - brightness) * 8 : 0; 
      return lumaDist + satPenalty + darkPenalty;
    };

    const processPixel = (idx: number) => {
      if (visited[idx]) return;
      if (exclusionMask && exclusionMask[idx] === 1) return;
      visited[idx] = 1;
      
      const r = data[idx * 4];
      const g = data[idx * 4 + 1];
      const b = data[idx * 4 + 2];
      const dist = getDist(r, g, b);
      
      if (dist <= tol) {
        data[idx * 4 + 3] = 0; 
        stack.push(idx); 
      } else if (dist <= tol + soft) {
        const alpha = ((dist - tol) / soft) * 255;
        data[idx * 4 + 3] = Math.min(data[idx * 4 + 3], alpha);
      }
    };

    const margin = 2;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x < margin || x >= width - margin || y < margin || y >= height - margin) {
          const idx = y * width + x;
          if (!visited[idx]) {
            if (exclusionMask && exclusionMask[idx] === 1) continue;
            const r = data[idx * 4];
            const g = data[idx * 4 + 1];
            const b = data[idx * 4 + 2];
            if (getDist(r, g, b) <= tol) {
               processPixel(idx);
            }
          }
        }
      }
    }

    while (stack.length > 0) {
      const idx = stack.pop()!;
      const x = idx % width;
      const y = Math.floor(idx / width);

      if (y > 0) processPixel(idx - width); 
      if (y < height - 1) processPixel(idx + width); 
      if (x > 0) processPixel(idx - 1); 
      if (x < width - 1) processPixel(idx + 1); 
    }

    if (enclosedTol > 0) {
      for (let i = 0; i < data.length; i += 4) {
        const idx = i / 4;
        if (!visited[idx]) {
          if (exclusionMask && exclusionMask[idx] === 1) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const dist = getDist(r, g, b);

          if (dist <= enclosedTol) {
            data[i + 3] = 0;
          } else if (dist <= enclosedTol + soft) {
            const alpha = ((dist - enclosedTol) / soft) * 255;
            data[i + 3] = Math.min(data[i + 3], alpha);
          }
        }
      }
    }
  };

  useEffect(() => {
    if (frames.length === 0 || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (bgMode === 'black') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (bgMode === 'app') {
        ctx.fillStyle = isDark ? '#121212' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        const gridSize = 20;
        for (let x = 0; x < canvas.width; x += gridSize) {
          for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.fillStyle = (x / gridSize + y / gridSize) % 2 === 0 ? '#e5e7eb' : '#ffffff';
            ctx.fillRect(x, y, gridSize, gridSize);
          }
        }
      }
      
      const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
      const newW = Math.floor(img.width * ratio);
      const newH = Math.floor(img.height * ratio);
      const offsetX = (canvas.width - newW) / 2;
      const offsetY = (canvas.height - newH) / 2;
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
      if (!tempCtx) return;
      
      tempCtx.drawImage(img, 0, 0);
      
      const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
      const currentMask = exclusionMasks.get(currentFrame);
      applyChromaKey(imageData.data, img.width, img.height, tolerance, softness, enclosedTolerance, chromaKeyColor, pickedColor, currentMask);
      tempCtx.putImageData(imageData, 0, 0);
      
      ctx.drawImage(tempCanvas, offsetX, offsetY, newW, newH);

      // Draw Brush Cursor if active
      if (isBrushActive && !isPlaying) {
        ctx.beginPath();
        ctx.arc(offsetX + (lastPos.x * ratio), offsetY + (lastPos.y * ratio), (brushSize / 2), 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };
    img.src = frames[currentFrame];
  }, [currentFrame, frames, bgMode, tolerance, softness, enclosedTolerance, isDark, chromaKeyColor, exclusionMasks, isBrushActive, isPlaying, lastPos, brushSize, drawTick]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPlaying || frames.length === 0) return;

    if (isPickingColor) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
      const cy = (e.clientY - rect.top) * (canvas.height / rect.height);
      
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
        const newW = Math.floor(img.width * ratio);
        const newH = Math.floor(img.height * ratio);
        const offsetX = (canvas.width - newW) / 2;
        const offsetY = (canvas.height - newH) / 2;
        
        const ox = Math.floor((cx - offsetX) / ratio);
        const oy = Math.floor((cy - offsetY) / ratio);
        
        if (ox >= 0 && ox < img.width && oy >= 0 && oy < img.height) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = img.width;
          tempCanvas.height = img.height;
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.drawImage(img, 0, 0);
            const pixel = tempCtx.getImageData(ox, oy, 1, 1).data;
            setPickedColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
            setIsPickingColor(false);
            setChromaKeyColor('Picker');
          }
        }
      };
      img.src = frames[currentFrame];
      return;
    }

    if (!isBrushActive) return;
    
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      applyToSelectedRef.current = true;
    } else {
      applyToSelectedRef.current = false;
    }
    
    setIsDrawing(true);
    drawOnMask(e);
  };

  const lastDrawRef = useRef(0);
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || frames.length === 0) return;
    
    const now = Date.now();
    if (isDrawing && now - lastDrawRef.current < 16) return; // Throttle to ~60fps
    lastDrawRef.current = now;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const cy = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const updatePos = (w: number, h: number) => {
      const ratio = Math.min(canvas.width / w, canvas.height / h);
      const newW = Math.floor(w * ratio);
      const newH = Math.floor(h * ratio);
      const offsetX = (canvas.width - newW) / 2;
      const offsetY = (canvas.height - newH) / 2;
      
      const ox = (cx - offsetX) / ratio;
      const oy = (cy - offsetY) / ratio;
      setLastPos({ x: ox, y: oy });
      
      if (isDrawing) {
        performDraw(ox, oy, w, h);
      }
    };

    if (imgDims) {
      updatePos(imgDims.w, imgDims.h);
    } else {
      const img = new Image();
      img.onload = () => {
        setImgDims({ w: img.width, h: img.height });
        updatePos(img.width, img.height);
      };
      img.src = frames[currentFrame];
    }
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    applyToSelectedRef.current = false;
    // Commit to global state by creating a new Map reference
    setExclusionMasks(new Map(exclusionMasks));
  };

  const drawOnMask = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || frames.length === 0) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const cy = (e.clientY - rect.top) * (canvas.height / rect.height);

    const updateDraw = (w: number, h: number) => {
      const ratio = Math.min(canvas.width / w, canvas.height / h);
      const newW = Math.floor(w * ratio);
      const newH = Math.floor(h * ratio);
      const offsetX = (canvas.width - newW) / 2;
      const offsetY = (canvas.height - newH) / 2;

      const ox = (cx - offsetX) / ratio;
      const oy = (cy - offsetY) / ratio;
      
      performDraw(ox, oy, w, h);
    };

    if (imgDims) {
      updateDraw(imgDims.w, imgDims.h);
    } else {
      const img = new Image();
      img.onload = () => {
        setImgDims({ w: img.width, h: img.height });
        updateDraw(img.width, img.height);
      };
      img.src = frames[currentFrame];
    }
  };

  const drawTickRef = useRef(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const performDraw = (ox: number, oy: number, imgW: number, imgH: number) => {
    let targetIndices: number[] = [];
    
    if (applyToSelectedRef.current) {
      targetIndices = Array.from(selectedFrames);
    } else {
      targetIndices = [currentFrame];
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ratio = Math.min(canvas.width / imgW, canvas.height / imgH);
    const oradius = (brushSize / 2) / ratio;

    const startX = Math.max(0, Math.floor(ox - oradius));
    const endX = Math.min(imgW, Math.ceil(ox + oradius));
    const startY = Math.max(0, Math.floor(oy - oradius));
    const endY = Math.min(imgH, Math.ceil(oy + oradius));

    targetIndices.forEach(idx => {
      let mask = exclusionMasks.get(idx);
      if (!mask || mask.length !== imgW * imgH) {
        mask = new Uint8Array(imgW * imgH);
        exclusionMasks.set(idx, mask);
      }

      for (let py = startY; py < endY; py++) {
        for (let px = startX; px < endX; px++) {
          const dist = Math.sqrt((px - ox) ** 2 + (py - oy) ** 2);
          if (dist <= oradius) {
            mask[py * imgW + px] = activeTool === 'brush' ? 1 : 0;
          }
        }
      }
    });

    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(() => {
        setDrawTick(t => t + 1);
        animationFrameRef.current = undefined;
      });
    }
  };

  const extractFrames = async (file: File, targetFps: number) => {
    if (!ffmpeg) {
      console.warn("FFmpeg not loaded yet.");
      return;
    }
    
    setIsExtracting(true);
    setFrames([]);
    setIsPlaying(false);
    setExclusionMasks(new Map());
    
    try {
      console.log("Starting frame extraction for:", file.name);
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));
      setImgDims(null); // Reset dimensions for new file
      
      // Dynamic limits based on device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      const maxRes = isMobile ? 720 : 1080;
      const maxFramesLimit = isMobile ? 500 : 1500;
      
      console.log(`Running FFmpeg command with scaling (Max ${maxRes}p, Device: ${isMobile ? 'Mobile' : 'Desktop'})...`);
      
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', `fps=${targetFps},scale='min(iw,${maxRes === 1080 ? 1920 : 1280}):min(ih,${maxRes})':force_original_aspect_ratio=decrease`,
        'frame_%04d.png'
      ]);
      
      console.log("Reading file list...");
      const fileList = await ffmpeg.listDir('/');
      const frameFiles = fileList.filter(f => f.name.startsWith('frame_') && f.name.endsWith('.png'));
      frameFiles.sort((a, b) => a.name.localeCompare(b.name));
      
      if (frameFiles.length === 0) {
        throw new Error("No frames extracted. Check video format.");
      }

      // Safety check for memory
      if (frameFiles.length > maxFramesLimit) {
        console.warn(`Too many frames extracted, limiting to ${maxFramesLimit} for stability.`);
        frameFiles.splice(maxFramesLimit);
      }

      console.log(`Extracted ${frameFiles.length} frames. Loading into memory...`);
      const extractedFrames: string[] = [];
      for (const f of frameFiles) {
        const data = await ffmpeg.readFile(f.name);
        const blob = new Blob([data], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        extractedFrames.push(url);
        
        // Clean up FS to save memory
        await ffmpeg.deleteFile(f.name);
      }
      
      // Clean up input file
      await ffmpeg.deleteFile('input.mp4');
      
      setFrames(extractedFrames);
      setCurrentFrame(0);
      setIsPlaying(true);
      console.log("Extraction complete.");
      
    } catch (error) {
      console.error("Error extracting frames:", error);
      alert("Failed to extract frames. Check console for details. (프레임 추출 실패. 콘솔을 확인해주세요.)");
    } finally {
      setIsExtracting(false);
    }
  };

  const processFile = async (file: File) => {
    setImgDims(null); // Reset dimensions for new file
    setExclusionMasks(new Map());
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFrames([url]);
      setCurrentFrame(0);
      setIsPlaying(false);
      setVideoFile(file);
      return;
    }
    
    if (file.type.includes('video/mp4') || file.type.includes('video/quicktime')) {
      setVideoFile(file);
      await extractFrames(file, fps);
      return;
    }
    
    alert("Please upload an MP4, MOV, or PNG file. (MP4, MOV 또는 PNG 파일을 업로드해주세요.)");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (isExtracting || !isLoaded) return;
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleFpsChange = async (newFps: number) => {
    setFps(newFps);
    if (videoFile && !videoFile.type.startsWith('image/')) {
      await extractFrames(videoFile, newFps);
    }
  };

  const toggleFlag = (index: number) => {
    trackEvent('Toggle_Flag');
    setFlaggedIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index].sort((a, b) => a - b);
      }
    });
  };

  const handleDownload = async (type: 'withRaw' | 'resultOnly' | 'gif') => {
    if (frames.length === 0) return;
    
    trackEvent('Download_Asset');
    setIsProcessing(true);
    setShowDownloadModal(false);
    try {
      if (type === 'gif') {
        const GIF = (await import('gif.js')).default;
        const gif = new GIF({
          workers: 2,
          quality: 10,
          width: imgDims?.w || 512,
          height: imgDims?.h || 512,
          transparent: 'rgba(0,0,0,0)'
        });

        for (let i = 0; i < frames.length; i++) {
          const img = new Image();
          img.src = frames[i];
          await new Promise((resolve) => {
            img.onload = resolve;
          });
          
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) continue;
          
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          const currentMask = exclusionMasks.get(i);
          applyChromaKey(imageData.data, canvas.width, canvas.height, tolerance, softness, enclosedTolerance, chromaKeyColor, pickedColor, currentMask);
          ctx.putImageData(imageData, 0, 0);
          
          gif.addFrame(canvas, { delay: 1000 / fps });
        }

        gif.on('finished', (blob: Blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${charName}_animated.gif`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setIsProcessing(false);
        });

        gif.render();
        return; // Exit early for GIF, as it handles its own processing state
      }

      const zip = new JSZip();
      
      for (const seg of segments) {
        const startIdx = Math.floor(seg.start * fps);
        const endIdx = frames.length === 1 ? 1 : Math.min(Math.floor(seg.end * fps), frames.length);
        
        for (let i = startIdx; i < endIdx; i++) {
          const img = new Image();
          img.src = frames[i];
          await new Promise((resolve) => {
            img.onload = resolve;
          });
          
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) continue;
          
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          const currentMask = exclusionMasks.get(i);
          applyChromaKey(imageData.data, canvas.width, canvas.height, tolerance, softness, enclosedTolerance, chromaKeyColor, pickedColor, currentMask);
          ctx.putImageData(imageData, 0, 0);
          
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
          if (blob) {
            const frameNum = String(i - startIdx + 1).padStart(3, '0');
            zip.file(`${charName}_${seg.name}_${frameNum}.png`, blob);
          }
        }
      }
      
      if (type === 'withRaw') {
        for (let i = 0; i < frames.length; i++) {
          const response = await fetch(frames[i]);
          const blob = await response.blob();
          const frameNum = String(i + 1).padStart(3, '0');
          zip.file(`${charName}_raw_${frameNum}.png`, blob);
        }
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${charName}_assets.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Processing failed:", error);
      alert("Failed to process frames.");
    } finally {
      if (type !== 'gif') {
        setIsProcessing(false);
      }
    }
  };

  const applyPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setSegments(JSON.parse(JSON.stringify(preset.segments)));
      setSelectedPreset(presetId);
    }
  };

  const saveCurrentAsPreset = () => {
    const name = prompt("Enter a name for this preset (프리셋 이름을 입력하세요):");
    if (!name) return;
    
    trackEvent('Save_Preset');
    const newPreset = {
      id: `preset-${Date.now()}`,
      name,
      segments: JSON.parse(JSON.stringify(segments))
    };
    
    setPresets([...presets, newPreset]);
    setSelectedPreset(newPreset.id);
  };

  const deletePreset = (e: React.MouseEvent, presetId: string) => {
    e.stopPropagation();
    setPresets(presets.filter(p => p.id !== presetId));
    if (selectedPreset === presetId) {
      setSelectedPreset("");
    }
  };

  const addSegment = () => {
    const lastEnd = segments.length > 0 ? segments[segments.length - 1].end : 0;
    setSegments([...segments, { name: "idle_sitting", start: lastEnd, end: lastEnd + 2 }]);
  };

  const removeSegment = (index: number) => {
    setSegments(segments.filter((_, i) => i !== index));
  };

  const updateSegment = (index: number, field: 'name' | 'start' | 'end' | 'useFrames', value: string | number | boolean) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], [field]: value };
    setSegments(newSegments);
  };

  // Theme Classes
  const panelClass = `border rounded-2xl p-6 backdrop-blur-xl transition-colors ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`;
  const inputClass = `w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all ${isDark ? 'bg-black/40 border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white' : 'bg-gray-50 border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-gray-900'}`;
  const labelClass = `block text-sm mb-1.5 ${isDark ? 'text-white/60' : 'text-gray-600 font-medium'}`;
  const descClass = `text-xs mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`;
  const badgeClass = `text-xs font-mono px-2 py-0.5 rounded ${isDark ? 'text-blue-400 bg-blue-400/10' : 'text-white bg-black'}`;
  const accentIconClass = `w-5 h-5 ${isDark ? 'text-blue-400' : 'text-black'}`;
  const dropzoneClass = `relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-all ${
    isDragging 
      ? (isDark ? 'border-blue-500 bg-blue-500/10' : 'border-black bg-gray-100') 
      : (isDark ? 'border-white/20 hover:bg-white/5 hover:border-white/40' : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400')
  }`;
  const segmentBgClass = `border rounded-xl p-3 space-y-3 relative group transition-colors ${isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-200'}`;
  const segmentInputClass = `flex-1 border rounded-lg px-3 py-2 text-xs focus:outline-none transition-all ${isDark ? 'bg-black/40 border-white/10 focus:border-blue-500/50 text-white' : 'bg-white border-gray-200 focus:border-black text-gray-900'}`;
  const segmentLabelClass = `block text-[10px] mb-1 uppercase tracking-tighter ${isDark ? 'text-white/40' : 'text-gray-500 font-bold'}`;
  const primaryBtnClass = `w-full font-medium py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:shadow-none ${
    isDark 
      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-white/10 disabled:to-white/10 disabled:text-white/40 text-white shadow-lg shadow-blue-500/20' 
      : 'bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white shadow-lg shadow-black/10'
  }`;
  const previewBgClass = `relative border-2 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center transition-colors ${isDark ? 'bg-black/40 border-white/5' : 'bg-gray-100 border-gray-200'}`;

  return (
    <div className={`max-w-6xl mx-auto p-4 md:p-8 flex flex-col min-h-full lg:h-screen lg:overflow-x-hidden ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <header className={`hidden lg:block mb-8 border-b pb-6 shrink-0 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <h1 className="text-3xl font-semibold tracking-tight">REMOVE <span className={`text-xl font-normal ${isDark ? 'text-white/40' : 'text-gray-400'}`}>(투명화)</span></h1>
        <p className={`mt-2 text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>In-Browser White Background Removal</p>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-12 lg:min-h-0 relative">
        
        {/* Mobile Phase 1: Upload Only */}
        {frames.length === 0 && (
          <div className="w-full flex flex-col items-center justify-center flex-1 lg:hidden">
            <div className={`w-full max-w-md ${panelClass}`}>
              <h2 className={`text-lg font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Upload className={accentIconClass} />
                Upload File <span className="text-sm font-normal opacity-60">(파일 업로드)</span>
              </h2>
              
              {!isLoaded ? (
                <div className={`flex flex-col items-center justify-center gap-4 p-8 rounded-xl ${isDark ? 'text-white/50 bg-black/20' : 'text-gray-500 bg-gray-100'}`}>
                  {ffmpegError ? (
                    <>
                      <p className="text-sm text-center text-red-400">{ffmpegError}</p>
                      <button 
                        onClick={retryFFmpeg}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        다시 시도 (Retry)
                      </button>
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-base">Loading BananaCut Engine..</span>
                    </>
                  )}
                </div>
              ) : (
                <div 
                  className={dropzoneClass}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    accept="video/mp4,video/quicktime,image/png" 
                    onChange={handleFileUpload}
                    className="hidden" 
                    id="file-upload-mobile"
                    disabled={isExtracting}
                  />
                  <label htmlFor="file-upload-mobile" className={`cursor-pointer flex flex-col items-center gap-2 ${isExtracting ? 'opacity-50 pointer-events-none' : ''}`}>
                    {isExtracting ? (
                      <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-blue-400' : 'text-gray-600'}`} />
                    ) : (
                      <Upload className={`w-8 h-8 ${isDark ? 'text-white/60' : 'text-gray-400'}`} strokeWidth={1.5} />
                    )}
                    <span className="font-medium">{isExtracting ? 'Extracting...' : 'Select File'}</span>
                    <span className="text-xs opacity-60">MP4, MOV, PNG</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Left Panel: Controls (Desktop & Mobile Phase 2) */}
        <div className={`order-2 w-full lg:w-[420px] shrink-0 lg:overflow-y-auto lg:pr-2 custom-scrollbar lg:order-1 ${frames.length === 0 ? 'hidden lg:flex lg:flex-col lg:space-y-8' : 'contents lg:flex lg:flex-col lg:space-y-8'}`}>
          <div className={`order-1 ${panelClass}`}>
            <h2 className={`text-lg font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Upload className={accentIconClass} />
              1. Upload File <span className="text-sm font-normal opacity-60">(파일 업로드)</span>
            </h2>
            
            {!isLoaded ? (
              <div className={`flex flex-col items-center gap-3 p-6 rounded-xl ${isDark ? 'text-white/50 bg-black/20' : 'text-gray-500 bg-gray-100'}`}>
                {ffmpegError ? (
                  <>
                    <p className="text-xs text-center text-red-400">{ffmpegError}</p>
                    <button 
                      onClick={retryFFmpeg}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
                    >
                      다시 시도 (Retry)
                    </button>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Loading BananaCut Engine..</span>
                  </>
                )}
              </div>
            ) : (
              <div 
                className={dropzoneClass}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <label className="absolute inset-0 w-full h-full cursor-pointer">
                  <input type="file" className="hidden" accept="video/mp4,video/quicktime,image/png" onChange={handleFileUpload} disabled={isExtracting} />
                </label>
                <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                  <Upload className={`w-8 h-8 mb-3 transition-colors ${isDragging ? accentIconClass : (isDark ? 'text-white/40' : 'text-gray-400')}`} strokeWidth={1.5} />
                  <p className={`mb-2 text-sm ${isDark ? 'text-white/70' : 'text-gray-600'}`}><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>MP4, MOV or PNG</p>
                </div>
              </div>
            )}
            
            {isExtracting && (
              <div className={`mt-4 flex items-center gap-3 p-3 rounded-lg text-sm ${isDark ? 'text-blue-400 bg-blue-500/10' : 'text-black bg-gray-100'}`}>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting frames at {fps}fps...
              </div>
            )}
          </div>

          <div className={`order-3 ${panelClass}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Sliders className={accentIconClass} />
                2. ChromaKey <span className="text-sm font-normal opacity-60">(투명화)</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (isBrushActive && activeTool === 'brush') {
                      setIsBrushActive(false);
                    } else {
                      setIsBrushActive(true);
                      setActiveTool('brush');
                    }
                  }}
                  title="Exclusion Brush (제외 브러쉬)"
                  className={`p-2 rounded-lg transition-all border ${
                    isBrushActive && activeTool === 'brush'
                      ? (isDark ? 'bg-blue-500 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]' : 'bg-black border-black text-white')
                      : (isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50')
                  }`}
                >
                  <Brush className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (isBrushActive && activeTool === 'eraser') {
                      setIsBrushActive(false);
                    } else {
                      setIsBrushActive(true);
                      setActiveTool('eraser');
                    }
                  }}
                  title="Exclusion Eraser (제외 지우개)"
                  className={`p-2 rounded-lg transition-all border ${
                    isBrushActive && activeTool === 'eraser'
                      ? (isDark ? 'bg-red-500 border-red-400 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-red-600 border-red-700 text-white shadow-[0_0_10px_rgba(220,38,38,0.2)]')
                      : (isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50')
                  }`}
                >
                  <Eraser className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {isBrushActive && (
                <div className={`p-4 rounded-xl border mb-4 animate-in fade-in slide-in-from-top-2 duration-200 ${isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <label className={labelClass}>
                      {activeTool === 'brush' ? 'Brush Size' : 'Eraser Size'} 
                      <span className="text-[10px] opacity-60 ml-1">({activeTool === 'brush' ? '제외 브러쉬 크기' : '제외 지우개 크기'})</span>
                    </label>
                    <span className={badgeClass}>{brushSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="100" 
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className={`w-full ${isDark ? 'accent-blue-500' : 'accent-black'}`}
                  />
                  <p className="text-[10px] mt-2 opacity-60 leading-tight">
                    Paint on the preview to <strong>exclude</strong> areas from chroma key.<br/>
                    (미리보기 위를 칠하면 해당 영역은 투명화되지 않고 복구됩니다.)
                  </p>
                  <button 
                    onClick={() => {
                      const newMasks = new Map(exclusionMasks);
                      const targetIndices = selectedFrames.has(currentFrame) ? Array.from(selectedFrames) : [currentFrame];
                      targetIndices.forEach(idx => newMasks.delete(idx));
                      setExclusionMasks(newMasks);
                    }}
                    className={`mt-3 w-full py-1.5 text-[10px] font-bold uppercase tracking-wider rounded border transition-colors ${
                      isDark ? 'border-white/10 hover:bg-white/5 text-white/60' : 'border-gray-200 hover:bg-gray-50 text-gray-500'
                    }`}
                  >
                    Reset Frame Mask (현재 프레임 초기화)
                  </button>
                </div>
              )}
              <div>
                <label className={labelClass}>Target Color</label>
                <div className="flex gap-2 mt-2">
                  {['White', 'Green'].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setChromaKeyColor(color as any);
                        setIsPickingColor(false);
                      }}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors border ${
                        chromaKeyColor === color 
                          ? (isDark ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-blue-50 border-blue-200 text-blue-700')
                          : (isDark ? 'bg-[#2A2A2A] border-[#3A3A3A] text-gray-400 hover:bg-[#333333]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50')
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                  <button
                    onClick={() => setIsPickingColor(!isPickingColor)}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors border flex items-center justify-center gap-2 ${
                      isPickingColor || chromaKeyColor === 'Picker'
                        ? (isDark ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.15)]' : 'bg-yellow-100 border-yellow-300 text-yellow-800')
                        : (isDark ? 'bg-[#2A2A2A] border-[#3A3A3A] text-gray-400 hover:bg-[#333333]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50')
                    }`}
                  >
                    <Pipette className={`w-4 h-4 ${isPickingColor ? 'animate-pulse' : ''}`} />
                    Picker
                  </button>
                </div>
                {chromaKeyColor === 'Picker' && !isPickingColor && (
                  <div className="mt-2 flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border border-gray-300 shadow-sm"
                      style={{ backgroundColor: `rgb(${pickedColor.r}, ${pickedColor.g}, ${pickedColor.b})` }}
                    />
                    <span className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      RGB({pickedColor.r}, {pickedColor.g}, {pickedColor.b})
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={labelClass}>Tolerance <span className="font-normal opacity-70">(허용 오차)</span></label>
                  <span className={badgeClass}>{tolerance}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className={`w-full ${isDark ? 'accent-blue-500' : 'accent-black'}`}
                />
                <p className={descClass}>
                  {chromaKeyColor === 'Green' 
                    ? <><span className="block">Remove more green-tinted pixels.</span><span className="block">(더 많은 초록색 픽셀이 제거됩니다.)</span></>
                    : <><span className="block">Remove more off-white pixels.</span><span className="block">(더 많은 밝은 픽셀이 제거됩니다.)</span></>}
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={labelClass}>Softness <span className="font-normal opacity-70">(가장자리 페더링)</span></label>
                  <span className={badgeClass}>{softness}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1"
                  value={softness}
                  onChange={(e) => setSoftness(Number(e.target.value))}
                  className={`w-full ${isDark ? 'accent-blue-500' : 'accent-black'}`}
                />
                <p className={descClass}>
                  <span className="block">Smooth out the edges.</span>
                  <span className="block">(가장자리가 부드러워집니다.)</span>
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={labelClass}>Enclosed Color <span className="font-normal opacity-70">(내부 빈틈)</span></label>
                  <span className={badgeClass}>{enclosedTolerance}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1"
                  value={enclosedTolerance}
                  onChange={(e) => setEnclosedTolerance(Number(e.target.value))}
                  className={`w-full ${isDark ? 'accent-blue-500' : 'accent-black'}`}
                />
                <p className={descClass}>
                  <span className="block">Removes isolated colors between objects.</span>
                  <span className="block">(객체 사이의 고립된 색상을 제거합니다.)</span>
                </p>
              </div>

              <div className={`pt-4 border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={labelClass}>Extraction FPS <span className="font-normal opacity-70">(추출 프레임)</span></label>
                  <span className={badgeClass}>{fps} FPS</span>
                </div>
                <input 
                  type="range" 
                  min="12" 
                  max="48" 
                  step="1"
                  value={fps}
                  onChange={(e) => handleFpsChange(Number(e.target.value))}
                  disabled={isExtracting || (videoFile?.type.startsWith('image/') ?? false)}
                  className={`w-full ${isDark ? 'accent-blue-500' : 'accent-black'}`}
                />
              </div>
            </div>
          </div>

          <div className={`order-4 ${panelClass}`}>
            <h2 className={`text-lg font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Settings className={accentIconClass} />
              3. Asset Settings <span className="text-sm font-normal opacity-60">(에셋 설정)</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>First Name <span className="font-normal opacity-70">(파일명)</span></label>
                <input 
                  type="text" 
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. sloth"
                />
              </div>

              <div className={`pt-4 border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center mb-3">
                  <label className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-gray-900'}`}>Video Presets <span className="font-normal opacity-60">(비디오 프리셋)</span></label>
                  <button 
                    onClick={saveCurrentAsPreset}
                    className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                  >
                    Save Current
                  </button>
                </div>
                <div className="space-y-1">
                  {presets.map(preset => (
                    <div 
                      key={preset.id}
                      onClick={() => applyPreset(preset.id)}
                      className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                        selectedPreset === preset.id
                          ? (isDark ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100')
                          : (isDark ? 'hover:bg-white/5 text-white/70' : 'hover:bg-gray-100 text-gray-700')
                      }`}
                    >
                      <span className="text-sm truncate pr-2">{preset.name}</span>
                      <button 
                        onClick={(e) => deletePreset(e, preset.id)}
                        className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all ${
                          isDark ? 'hover:bg-white/10 text-white/40 hover:text-red-400' : 'hover:bg-gray-200 text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {presets.length === 0 && (
                    <div className={`text-xs text-center py-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                      No presets saved.
                    </div>
                  )}
                </div>
              </div>

              <div className={`pt-4 border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center mb-3">
                  <label className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-gray-900'}`}>Motion Segments <span className="font-normal opacity-60">(모션 구간)</span></label>
                  <button 
                    onClick={addSegment}
                    className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                  >
                    + Add Segment (+ 구간 추가)
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {segments.map((seg, idx) => (
                    <div key={idx} className={segmentBgClass}>
                      <button 
                        onClick={() => removeSegment(idx)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      
                      <div className="relative" ref={idx === showMiddleNameDropdown ? dropdownRef : null}>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={seg.name}
                            onChange={(e) => updateSegment(idx, 'name', e.target.value)}
                            className={segmentInputClass}
                            placeholder="Motion name..."
                          />
                          <button 
                            type="button"
                            onClick={() => setShowMiddleNameDropdown(showMiddleNameDropdown === idx ? null : idx)}
                            className={`px-2 rounded-lg border transition-all ${
                              showMiddleNameDropdown === idx 
                                ? (isDark ? 'bg-blue-500/20 border-blue-500/50' : 'bg-gray-200 border-gray-400') 
                                : (isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50')
                            }`}
                          >
                            <ChevronDown className={`w-3 h-3 transition-transform ${isDark ? 'text-white/70' : 'text-gray-600'} ${showMiddleNameDropdown === idx ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                        
                        {showMiddleNameDropdown === idx && (
                          <ul className={`absolute z-50 w-full mt-1 max-h-48 overflow-y-auto border rounded-lg shadow-2xl py-1 custom-scrollbar ${isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-gray-200'}`}>
                            {MIDDLE_NAME_OPTIONS.map(opt => (
                              <li 
                                key={opt.id}
                                onClick={() => {
                                  updateSegment(idx, 'name', opt.id);
                                  setShowMiddleNameDropdown(null);
                                }}
                                className={`px-3 py-2 cursor-pointer flex justify-between items-center gap-1 transition-colors border-b last:border-0 ${isDark ? 'hover:bg-white/10 border-white/5' : 'hover:bg-gray-50 border-gray-100'}`}
                              >
                                <span className={`font-mono text-[10px] ${isDark ? 'text-blue-300' : 'text-gray-800'}`}>{opt.id}</span>
                                <span className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{opt.desc}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className={segmentLabelClass}>{seg.useFrames ? 'Start (f)' : 'Start (s)'} <span className="font-normal">{seg.useFrames ? '(시작 프레임)' : '(시작 초)'}</span></label>
                            <button 
                              onClick={() => updateSegment(idx, 'useFrames', !seg.useFrames)}
                              className="text-[9px] bg-white/10 px-1 rounded"
                            >
                              {seg.useFrames ? 'Time' : 'Frame'}
                            </button>
                          </div>
                          <input 
                            type="number" 
                            step={seg.useFrames ? "1" : "0.1"}
                            value={seg.start}
                            onChange={(e) => updateSegment(idx, 'start', parseFloat(e.target.value))}
                            className={segmentInputClass}
                          />
                        </div>
                        <div>
                          <label className={segmentLabelClass}>{seg.useFrames ? 'End (f)' : 'End (s)'} <span className="font-normal">{seg.useFrames ? '(종료 프레임)' : '(종료 초)'}</span></label>
                          <input 
                            type="number" 
                            step={seg.useFrames ? "1" : "0.1"}
                            value={seg.end}
                            onChange={(e) => updateSegment(idx, 'end', parseFloat(e.target.value))}
                            className={segmentInputClass}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowDownloadModal(true)}
            disabled={frames.length === 0 || isProcessing}
            className={`order-5 ${primaryBtnClass}`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing & Zipping...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Process & Download <span className="font-normal opacity-80">(처리/다운로드)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Panel: Preview (Sticky on Mobile Phase 2) */}
        <div className={`order-1 w-full lg:flex-1 flex flex-col items-center min-w-0 lg:overflow-y-auto custom-scrollbar lg:pr-2 lg:order-2 ${frames.length > 0 ? 'pb-2 lg:pb-0 pt-2 lg:pt-0 lg:relative lg:z-auto border-b lg:border-none' : 'hidden lg:flex'} ${isDark ? 'bg-[#121212] border-white/10 lg:bg-transparent' : 'bg-white border-gray-200 lg:bg-transparent'}`}>
          <div className={`sticky top-[56px] lg:top-0 z-40 w-full ${isDark ? 'bg-[#121212]' : 'bg-white'} flex flex-col items-center`}>
            <div className="w-full flex justify-between items-center mb-2 lg:mb-4 px-2 shrink-0 pt-2 lg:pt-0">
              <div className="flex items-center gap-2 lg:gap-4">
                <h2 className={`text-base lg:text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Preview <span className="hidden lg:inline text-sm font-normal opacity-60">(미리보기)</span></h2>
                <span className={`text-[10px] lg:text-xs font-mono px-2 py-1 rounded-md ${isDark ? 'bg-white/10 text-white/70' : 'bg-gray-200 text-gray-700'}`}>
                  {frames.length > 0 ? `${currentFrame + 1} / ${frames.length}` : '0 frames'}
                </span>
              </div>
              
              <div className={`flex items-center gap-1 lg:gap-2 p-1 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                {(['transparent', 'black', 'app'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setBgMode(mode)}
                    className={`px-2 lg:px-3 py-1 lg:py-1.5 text-[10px] lg:text-xs font-medium rounded-md capitalize transition-all ${
                      bgMode === mode 
                        ? (isDark ? 'bg-white/20 text-white shadow-sm' : 'bg-white text-black shadow-sm') 
                        : (isDark ? 'text-white/50 hover:text-white/80 hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200')
                    }`}
                  >
                    {mode === 'app' ? 'App UI' : mode}
                  </button>
                ))}
              </div>
            </div>
            
            <div className={`${previewBgClass} shrink-0 w-full lg:max-w-[500px] h-[34dvh] lg:h-[700px] lg:aspect-[5/7] lg:relative`}>
              {frames.length === 0 ? (
                <div className={`flex flex-col items-center gap-3 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                  <Play className="w-12 h-12 opacity-20" />
                  <p className="text-sm">Upload a file to preview (파일을 업로드하여 미리보세요)</p>
                </div>
              ) : (
                <canvas 
                  ref={canvasRef} 
                  width={500} 
                  height={700} 
                  className={`w-full h-full object-contain ${isBrushActive || isPickingColor ? 'cursor-crosshair' : ''}`}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  style={{ touchAction: 'none' }}
                />
              )}
              
              {frames.length > 1 && (
                <div className="absolute bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 lg:gap-3">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`backdrop-blur-md border p-2 lg:p-3 rounded-full transition-all shadow-xl ${
                      isDark ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white' : 'bg-black/80 hover:bg-black border-gray-800 text-white'
                    }`}
                  >
                    {isPlaying ? <Square className="w-4 h-4 lg:w-5 lg:h-5 fill-current" /> : <Play className="w-4 h-4 lg:w-5 lg:h-5 fill-current" />}
                  </button>
                  <button
                    onClick={() => toggleFlag(currentFrame)}
                    className={`backdrop-blur-md border p-2 lg:p-3 rounded-full transition-all shadow-xl ${
                      flaggedIndices.includes(currentFrame)
                        ? 'bg-orange-500 border-orange-400 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                        : isDark ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white' : 'bg-black/80 hover:bg-black border-gray-800 text-white'
                    }`}
                  >
                    <Flag className={`w-4 h-4 lg:w-5 lg:h-5 ${flaggedIndices.includes(currentFrame) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              )}
            </div>

            {/* Scrubber & Filmstrip (Sticky part) */}
            {frames.length > 0 && (
              <div className="w-full max-w-[500px] mt-2 lg:mt-6 space-y-2 lg:space-y-4 shrink-0 pb-2 lg:pb-8 px-2">
                <input 
                  type="range" 
                  min="0" 
                  max={frames.length - 1} 
                  value={currentFrame}
                  onChange={(e) => {
                    setCurrentFrame(Number(e.target.value));
                    setIsPlaying(false);
                  }}
                  className={`w-full ${isDark ? 'accent-purple-500' : 'accent-black'}`}
                />
                <div className={`h-16 lg:h-24 border rounded-xl p-2 overflow-x-auto flex gap-2 items-center custom-scrollbar ${isDark ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                  {frames.map((frame, idx) => (
                    <div 
                      key={idx}
                      onClick={(e) => {
                        toggleSelection(idx, e.ctrlKey || e.metaKey, e.shiftKey);
                        setIsPlaying(false);
                      }}
                      className={`shrink-0 relative h-full aspect-[5/7] rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
                        selectedFrames.has(idx) 
                          ? (isDark ? 'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'border-black shadow-[0_0_10px_rgba(0,0,0,0.2)]')
                          : (isDark ? 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100' : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100')
                      } ${currentFrame === idx ? 'ring-2 ring-inset ring-white/20' : ''}`}
                    >
                      <img src={frame} alt={`Frame ${idx}`} className={`w-full h-full object-contain ${isDark ? 'bg-[#121212]' : 'bg-white'}`} />
                      {selectedFrames.has(idx) && (
                        <div className="absolute top-1 right-1 w-3 h-3 bg-purple-500 rounded-full border border-white shadow-sm" />
                      )}
                      {flaggedIndices.includes(idx) && (
                        <div className="absolute top-1 left-1">
                          <Flag className="w-3 h-3 text-orange-500 fill-orange-500 drop-shadow-md" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Controls (Not sticky) */}
          {frames.length > 0 && (
            <div className="w-full max-w-[500px] mt-2 lg:mt-6 space-y-3 lg:space-y-4 shrink-0 pb-4 lg:pb-8 px-2">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-3">
                  <h3 className={`text-[10px] font-bold uppercase tracking-tighter ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                    Selection <span className="opacity-60">({selectedFrames.size})</span>
                  </h3>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setSelectedFrames(new Set(frames.map((_, i) => i)))}
                      className={`text-[9px] px-1.5 py-0.5 rounded border transition-all ${
                        isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white/60' : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setSelectedFrames(new Set([currentFrame]))}
                      className={`text-[9px] px-1.5 py-0.5 rounded border transition-all ${
                        isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white/60' : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    const currentMask = exclusionMasks.get(currentFrame);
                    if (!currentMask || !imgDims) return;
                    const { w, h } = imgDims;
                    const newMasks = new Map(exclusionMasks);
                    selectedFrames.forEach(idx => {
                      if (idx === currentFrame) return;
                      newMasks.set(idx, new Uint8Array(currentMask));
                    });
                    setExclusionMasks(newMasks);
                  }}
                  disabled={selectedFrames.size <= 1}
                  className={`text-[9px] px-2 py-0.5 rounded border transition-all flex items-center gap-1 ${
                    selectedFrames.size > 1
                      ? (isDark ? 'bg-purple-500/20 border-purple-500 text-purple-400 hover:bg-purple-500/30' : 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100')
                      : (isDark ? 'bg-white/5 border-white/5 text-white/20' : 'bg-gray-50 border-gray-100 text-gray-300')
                  }`}
                >
                  <MousePointer2 className="w-2.5 h-2.5" />
                  Apply Current to Selected
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        lang={downloadLang}
        onDownload={handleDownload}
        isDark={isDark}
      />
    </div>
  );
}
