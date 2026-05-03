import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Loader2, ZoomIn, ZoomOut, MousePointer2, Paintbrush, SquareDashed, Trash2, Eraser, Play, Square, Sliders, ChevronDown, Undo2, Redo2, PaintBucket } from 'lucide-react';
import JSZip from 'jszip';
import { useLanguage } from '../LanguageContext';
import { useBatchJob } from '../hooks/useBatchJob';
import { useTheme } from '../ThemeContext';
import { useStudio, StudioFrame } from '../StudioContext';
import { trackEvent } from '../lib/analytics';
import { revokeUrlsSafely } from '../utils/urlUtils';

interface Point {
  x: number;
  y: number;
}

export default function RecoverPage() {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const { frames, setFrames } = useStudio();
  const [selectedFrames, setSelectedFrames] = useState<Set<string>>(new Set());
  const [currentFrameId, setCurrentFrameId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { isProcessing: isBatchProcessing, progress: batchProgress, startJob } = useBatchJob();
  const [isProcessingLocal, setIsProcessingLocal] = useState(false);
  const isProcessing = isBatchProcessing || isProcessingLocal;
  const setIsProcessing = setIsProcessingLocal;
  
  // Canvas Settings
  const [canvasWidth, setCanvasWidth] = useState(() => Number(localStorage.getItem('recover_canvasWidth')) || 500);
  const [canvasHeight, setCanvasHeight] = useState(() => Number(localStorage.getItem('recover_canvasHeight')) || 700);
  const [zoom, setZoom] = useState(1);
  const [bgMode, setBgMode] = useState<'transparent' | 'black' | 'app'>('app');
  const [detectedResolution, setDetectedResolution] = useState<{width: number, height: number} | null>(null);
  const [showResolutionToast, setShowResolutionToast] = useState(false);
  const [manualCanvasSize, setManualCanvasSize] = useState(false);
  
  // Tool Settings
  const [activeTool, setActiveTool] = useState<'brush' | 'lasso' | 'eraser'>('brush');
  const [fillColor, setFillColor] = useState(() => localStorage.getItem('recover_fillColor') || '#ffffff');
  const [brushSize, setBrushSize] = useState(() => Number(localStorage.getItem('recover_brushSize')) || 20);
  const [alphaThreshold, setAlphaThreshold] = useState(() => Number(localStorage.getItem('recover_alphaThreshold')) || 200);
  
  // History
  type HistoryEntry = { frameId: string, undoUrl: string | undefined, redoUrl: string | undefined }[];
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyPointer, setHistoryPointer] = useState(-1);

  const pushToHistory = useCallback((entry: HistoryEntry) => {
    setHistory(prev => {
      const droppedFuture = prev.slice(historyPointer + 1);
      const urlsToRevoke: string[] = [];
      droppedFuture.forEach(h => h.forEach(e => { if (e.redoUrl) urlsToRevoke.push(e.redoUrl); }));

      const newHist = prev.slice(0, historyPointer + 1);
      newHist.push(entry);
      if (newHist.length > 20) {
        const droppedPast = newHist.shift();
        droppedPast?.forEach(e => { if (e.undoUrl) urlsToRevoke.push(e.undoUrl); });
      }
      
      revokeUrlsSafely(urlsToRevoke, frames, newHist);
      return newHist;
    });
    setHistoryPointer(prev => Math.min(19, prev + 1));
  }, [historyPointer, frames]);
  
  // Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [lassoPoints, setLassoPoints] = useState<Point[]>([]);
  const [hoverPos, setHoverPos] = useState<Point | null>(null);
  const [lastAction, setLastAction] = useState<{ type: 'brush' | 'lasso', data: Point[] | boolean[] } | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    localStorage.setItem('recover_canvasWidth', canvasWidth.toString());
    localStorage.setItem('recover_canvasHeight', canvasHeight.toString());
    localStorage.setItem('recover_fillColor', fillColor);
    localStorage.setItem('recover_brushSize', brushSize.toString());
    localStorage.setItem('recover_alphaThreshold', alphaThreshold.toString());
  }, [canvasWidth, canvasHeight, fillColor, brushSize, alphaThreshold]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  };

  const fitToScreen = useCallback(() => {
    if (!containerRef.current || !canvasWidth || !canvasHeight) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    const availableWidth = container.clientWidth;
    // Calculate available height based on window height minus the container's top position
    // Subtract some padding (e.g., 40px) for bottom spacing
    const availableHeight = window.innerHeight - rect.top - 40;
    
    if (availableWidth <= 0 || availableHeight <= 0) return;

    const scaleX = availableWidth / canvasWidth;
    const scaleY = availableHeight / canvasHeight;
    
    // Use 0.95 to give a small margin
    let newScale = Math.min(scaleX, scaleY) * 0.95;
    
    // Cap at 1 so we don't auto-enlarge small images, only scale down large ones
    newScale = Math.min(newScale, 1);
    
    setZoom(Number(newScale.toFixed(2)));
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    if (detectedResolution) {
      const timer = setTimeout(() => {
        fitToScreen();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [detectedResolution, fitToScreen]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    const newFrames: StudioFrame[] = [];
    const startIndex = frames.length;
    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        newFrames.push({
          id: Math.random().toString(36).substring(7),
          rawUrl: URL.createObjectURL(file),
          width: 0,
          height: 0,
          name: file.name,
          sourceIndex: startIndex + index
        });
      }
    });
    
    if (newFrames.length > 0) {
      const firstFrame = newFrames[0];
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        // set dimensions to all new frames
        newFrames.forEach(f => {
          f.width = width;
          f.height = height;
        });
        setCanvasWidth(width);
        setCanvasHeight(height);
        setDetectedResolution({ width, height });
        setShowResolutionToast(true);
        setTimeout(() => setShowResolutionToast(false), 3000);
        
        setFrames(prev => {
          const updated = [...prev, ...newFrames];
          if (!currentFrameId) {
            setCurrentFrameId(newFrames[0].id);
            setSelectedFrames(new Set([newFrames[0].id]));
          }
          return updated;
        });
      };
      img.src = firstFrame.rawUrl;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const drawFrame = useCallback(() => {
    if (!currentFrameId || !canvasRef.current) return;
    
    const frame = frames.find(f => f.id === currentFrameId);
    if (!frame) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawImageToCanvas = (img: HTMLImageElement) => {
      const offsetX = (canvas.width - img.width) / 2;
      const offsetY = (canvas.height - img.height) / 2;
      ctx.drawImage(img, offsetX, offsetY);
      
      if (activeTool === 'lasso' && lassoPoints.length > 0) {
        ctx.beginPath();
        ctx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
        for (let i = 1; i < lassoPoints.length; i++) {
          ctx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
        }
        if (!isDrawing) {
          ctx.closePath();
        }
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([5 / zoom, 5 / zoom]);
        ctx.stroke();
        
        if (isDrawing) {
          ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
          ctx.fill();
        }
        ctx.setLineDash([]);
      }

      if (activeTool === 'brush' && isDrawing && lassoPoints.length > 0) {
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
        for (let i = 1; i < lassoPoints.length; i++) {
          ctx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
        }
        ctx.stroke();
      }

      if (activeTool === 'brush' && hoverPos && !isDrawing) {
        ctx.beginPath();
        ctx.arc(hoverPos.x, hoverPos.y, brushSize / 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();
        ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        ctx.fill();
      }
    };

    const sourceUrl = frame.processedUrl ?? frame.rawUrl;
    
    if (imageCache.current.has(sourceUrl)) {
      drawImageToCanvas(imageCache.current.get(sourceUrl)!);
    } else {
      const img = new Image();
      img.onload = () => {
        imageCache.current.set(sourceUrl, img);
        drawImageToCanvas(img);
      };
      img.src = sourceUrl;
    }
  }, [currentFrameId, frames, canvasWidth, canvasHeight, activeTool, lassoPoints, isDrawing, zoom, theme, hoverPos, brushSize]);

  useEffect(() => {
    drawFrame();
  }, [drawFrame]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(prev => Number(Math.min(Math.max(0.1, prev + delta), 5).toFixed(2)));
      }
    };

    container.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleNativeWheel);
  }, []);

  const toggleSelection = (id: string, ctrlKey: boolean, shiftKey: boolean) => {
    setSelectedFrames(prev => {
      const next = new Set(prev);
      if (shiftKey && currentFrameId) {
        const currentIndex = frames.findIndex(f => f.id === currentFrameId);
        const targetIndex = frames.findIndex(f => f.id === id);
        if (currentIndex !== -1 && targetIndex !== -1) {
          const start = Math.min(currentIndex, targetIndex);
          const end = Math.max(currentIndex, targetIndex);
          for (let i = start; i <= end; i++) {
            next.add(frames[i].id);
          }
        }
      } else if (ctrlKey) {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      } else {
        next.clear();
        next.add(id);
      }
      return next;
    });
    setCurrentFrameId(id);
  };

  const clearFrames = () => {
    const urlsToRevoke: string[] = [];
    frames.forEach(f => {
      urlsToRevoke.push(f.rawUrl);
      if (f.processedUrl) urlsToRevoke.push(f.processedUrl);
    });
    history.forEach(h => {
      h.forEach(entry => {
        if (entry.undoUrl) urlsToRevoke.push(entry.undoUrl);
        if (entry.redoUrl) urlsToRevoke.push(entry.redoUrl);
      });
    });
    
    // Everything is being cleared, so we pass empty arrays for activeFrames and activeHistory
    revokeUrlsSafely(urlsToRevoke, [], []);

    setHistory([]);
    setHistoryPointer(-1);

    setFrames([]);
    setSelectedFrames(new Set());
    setCurrentFrameId(null);
    imageCache.current.clear();
    setLastAction(null);
    setDetectedResolution(null);
  };

  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

const applyFillToImageData = (imageData: ImageData, mask: boolean[] | null, isEraser: boolean = false) => {
    const data = imageData.data;
    const rgb = hexToRgb(fillColor);
    const width = imageData.width;
    const height = imageData.height;

    if (mask) {
      for (let i = 0; i < mask.length; i++) {
        if (mask[i]) {
          const pixelIndex = i * 4;
          if (isEraser) {
            data[pixelIndex + 3] = 0;
          } else {
            // 스마트 채우기: 투명한 곳(알파값이 설정된 임계값 미만인 곳)에만 색을 채워 캐릭터 본체를 보호합니다.
            if (data[pixelIndex + 3] < alphaThreshold) {
              data[pixelIndex] = rgb.r;
              data[pixelIndex + 1] = rgb.g;
              data[pixelIndex + 2] = rgb.b;
              data[pixelIndex + 3] = 255;
            }
          }
        }
      }
    }
    return imageData;
  };

  const applyToAllRef = useRef(false);

  const handleUndo = useCallback(() => {
    if (historyPointer < 0) return;
    setHistoryPointer(p => p - 1);
    setFrames(prev => prev.map(f => {
      const edit = history[historyPointer].find(e => e.frameId === f.id);
      if (edit) {
        return { ...f, processedUrl: edit.undoUrl };
      }
      return f;
    }));
  }, [history, historyPointer, setFrames]);

  const handleRedo = useCallback(() => {
    if (historyPointer >= history.length - 1) return;
    setHistoryPointer(p => p + 1);
    setFrames(prev => prev.map(f => {
      const edit = history[historyPointer + 1].find(e => e.frameId === f.id);
      if (edit) {
        return { ...f, processedUrl: edit.redoUrl };
      }
      return f;
    }));
  }, [history, historyPointer, setFrames]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '[') {
        setBrushSize(prev => Math.max(1, prev - 5));
      } else if (e.key === ']') {
        setBrushSize(prev => Math.min(100, prev + 5));
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const performBatchFill = async (targetFrameIds: string[], mask: boolean[] | null, isEraser: boolean = false) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;

    await startJob<string, { id: string, url: string }>({
      items: targetFrameIds,
      delayMs: 0,
      processItem: async (frameId) => {
        const currentFrame = frames.find(f => f.id === frameId);
        if (!currentFrame) throw new Error("Frame not found");
        
        const sourceUrl = currentFrame.processedUrl ?? currentFrame.rawUrl;
        let img = imageCache.current.get(sourceUrl);
        if (!img) {
          img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const newImg = new Image();
            newImg.onload = () => resolve(newImg);
            newImg.onerror = reject;
            newImg.src = sourceUrl;
          });
          imageCache.current.set(sourceUrl, img);
        }

        tempCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        const offsetX = (canvasWidth - img.width) / 2;
        const offsetY = (canvasHeight - img.height) / 2;
        tempCtx.drawImage(img, offsetX, offsetY);

        let imageData = tempCtx.getImageData(0, 0, canvasWidth, canvasHeight);
        imageData = applyFillToImageData(imageData, mask, isEraser);
        tempCtx.putImageData(imageData, 0, 0);

        const blob = await new Promise<Blob | null>(resolve => tempCanvas.toBlob(resolve, 'image/png'));
        if (blob) {
          return { id: frameId, url: URL.createObjectURL(blob) };
        }
        throw new Error("Blob failed");
      },
      onSuccess: (results) => {
        const updates = new Map(results.map(r => [r.id, r.url]));
        const historyEntry = targetFrameIds.map(id => {
          const frame = frames.find(f => f.id === id);
          return { frameId: id, undoUrl: frame?.processedUrl, redoUrl: updates.get(id) };
        });
        pushToHistory(historyEntry);

        setFrames(prev => prev.map(f => {
          if (updates.has(f.id)) {
            return { ...f, processedUrl: updates.get(f.id)! };
          }
          return f;
        }));
      }
    });
  };

  const handleFillAll = async () => {
    if (!currentFrameId) return;
    
    let targetFrames = selectedFrames.has(currentFrameId) ? Array.from(selectedFrames) : [currentFrameId];
    if (applyToAllRef.current) {
      targetFrames = frames.map(f => f.id);
    }
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
    const rgb = hexToRgb(fillColor);

    await startJob<string, { id: string, url: string }>({
      items: targetFrames,
      delayMs: 0,
      processItem: async (frameId) => {
        const frame = frames.find(f => f.id === frameId);
        if (!frame) throw new Error("Frame not found");
        const sourceUrl = frame.processedUrl ?? frame.rawUrl;
        
        let img = imageCache.current.get(sourceUrl);
        if (!img) {
          img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const newImg = new Image();
            newImg.onload = () => resolve(newImg);
            newImg.onerror = reject;
            newImg.src = sourceUrl;
          });
          imageCache.current.set(sourceUrl, img);
        }
        tempCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        const offsetX = (canvasWidth - img.width) / 2;
        const offsetY = (canvasHeight - img.height) / 2;
        tempCtx.drawImage(img, offsetX, offsetY);
        
        const imageData = tempCtx.getImageData(0, 0, canvasWidth, canvasHeight);
        const data = imageData.data;
        for (let j = 0; j < data.length; j += 4) {
          if (data[j + 3] < alphaThreshold) {
            data[j] = rgb.r;
            data[j + 1] = rgb.g;
            data[j + 2] = rgb.b;
            data[j + 3] = 255;
          }
        }
        tempCtx.putImageData(imageData, 0, 0);
        const blob = await new Promise<Blob | null>(resolve => tempCanvas.toBlob(resolve, 'image/png'));
        if (blob) {
          return { id: frameId, url: URL.createObjectURL(blob) };
        }
        throw new Error("Blob failed");
      },
      onSuccess: (results) => {
        const updates = new Map(results.map(r => [r.id, r.url]));
        const historyEntry = targetFrames.map(id => {
          const frame = frames.find(f => f.id === id);
          return { frameId: id, undoUrl: frame?.processedUrl, redoUrl: updates.get(id) };
        });
        pushToHistory(historyEntry);

        setFrames(prev => prev.map(f => {
          if (updates.has(f.id)) {
            return { ...f, processedUrl: updates.get(f.id)! };
          }
          return f;
        }));
        trackEvent('Fill_All');
      }
    });
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!currentFrameId || !canvasRef.current) return;
    
    const pos = getMousePos(e);

    if ('ctrlKey' in e && (e.ctrlKey || e.metaKey)) {
      if (e.shiftKey) {
        applyToAllRef.current = true;
      } else {
        const frame = frames.find(f => f.id === currentFrameId);
        if (frame) {
          const sourceUrl = frame.processedUrl ?? frame.rawUrl;
          const img = imageCache.current.get(sourceUrl);
          if (img) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvasWidth;
            tempCanvas.height = canvasHeight;
            const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
            if (tempCtx) {
              const offsetX = (canvasWidth - img.width) / 2;
              const offsetY = (canvasHeight - img.height) / 2;
              tempCtx.drawImage(img, offsetX, offsetY);
              const pixel = tempCtx.getImageData(Math.floor(pos.x), Math.floor(pos.y), 1, 1).data;
              if (pixel[3] > 0) { // Only pick color if not fully transparent
                const hex = "#" + (1 << 24 | pixel[0] << 16 | pixel[1] << 8 | pixel[2]).toString(16).slice(1);
                setFillColor(hex);
              }
            }
          }
        }
        return;
      }
    } else {
      applyToAllRef.current = false;
    }

    setIsDrawing(true);
    setLassoPoints([pos]);
    setHoverPos(pos);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getMousePos(e);
    setHoverPos(pos);
    
    if (!isDrawing) return;
    
    setLassoPoints(prev => {
      const newPoints = [...prev, pos];
      return newPoints;
    });
  };

  const handlePointerUp = async () => {
    if (!isDrawing || !currentFrameId) return;
    setIsDrawing(false);

    let targetFrames = selectedFrames.has(currentFrameId) ? Array.from(selectedFrames) : [currentFrameId];
    if (applyToAllRef.current) {
      targetFrames = frames.map(f => f.id);
      applyToAllRef.current = false;
    }
    setIsProcessing(true);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;
    const tCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
    
    tCtx.beginPath();
    if (activeTool === 'lasso') {
      if (lassoPoints.length > 0) {
        tCtx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
        for (let i = 1; i < lassoPoints.length; i++) {
          tCtx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
        }
        tCtx.closePath();
        tCtx.fillStyle = 'white';
        tCtx.fill();
      }
    } else { // brush or eraser
      tCtx.lineCap = 'round';
      tCtx.lineJoin = 'round';
      tCtx.lineWidth = brushSize;
      tCtx.strokeStyle = 'white';
      tCtx.fillStyle = 'white';
      
      if (lassoPoints.length === 1) {
        tCtx.arc(lassoPoints[0].x, lassoPoints[0].y, brushSize / 2, 0, Math.PI * 2);
        tCtx.fill();
      } else if (lassoPoints.length > 1) {
        tCtx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
        for (let i = 1; i < lassoPoints.length; i++) {
          tCtx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
        }
        tCtx.stroke();
      }
    }

    const maskData = tCtx.getImageData(0, 0, canvasWidth, canvasHeight).data;
    const mask = new Array(canvasWidth * canvasHeight).fill(false);
    for (let i = 0; i < maskData.length; i += 4) {
      if (maskData[i + 3] > 0) {
        mask[i / 4] = true;
      }
    }

    await performBatchFill(targetFrames, mask, activeTool === 'eraser');
    setLastAction({ type: activeTool === 'eraser' ? 'eraser' : activeTool, data: mask });
    
    setIsProcessing(false);
    setLassoPoints([]);
  };

  const handlePointerLeave = () => {
    setHoverPos(null);
    if (isDrawing) {
      handlePointerUp();
    }
  };

  const applyToAllSelected = async () => {
    if (!lastAction) {
      alert(lang === 'KR' ? "먼저 브러시나 올가미 도구를 사용하여 프레임에 칠해주세요." : lang === 'EN' ? "Please use the brush or lasso tool on a frame first before applying to all." : "まず、ブラシまたは投げ縄ツールを使用してフレームを塗りつぶしてください。");
      return;
    }

    setIsProcessing(true);
    try {
      const framesToProcess = Array.from(selectedFrames).filter(id => id !== currentFrameId) as string[];
      await performBatchFill(framesToProcess, lastAction.data as boolean[], lastAction.type === 'eraser');
    } catch (error) {
      console.error("Error applying to all:", error);
      alert(lang === 'KR' ? "선택된 프레임에 적용 실패." : lang === 'EN' ? "Failed to apply to all selected frames." : "選択したすべてのフレームへの適用に失敗しました。");
    } finally {
      setIsProcessing(false);
    }
  };

  const exportZip = async () => {
    if (frames.length === 0) return;
    trackEvent('Download_Asset');
    setIsProcessing(true);
    
    try {
      const zip = new JSZip();
      
      for (const frame of frames) {
        const sourceUrl = frame.processedUrl ?? frame.rawUrl;
        const response = await fetch(sourceUrl);
        const blob = await response.blob();
        
        const nameParts = (frame.name || 'frame.png').split('.');
        const ext = nameParts.pop();
        const baseName = nameParts.join('.');
        const newName = `${baseName}_R.${ext}`;
        
        zip.file(newName, blob);
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recovered_frames.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Error exporting ZIP:", error);
      alert(lang === 'KR' ? "ZIP 파일 내보내기 실패." : lang === 'EN' ? "Failed to export ZIP file." : "ZIPファイルの書き出しに失敗しました。");
    } finally {
      setIsProcessing(false);
    }
  };

  const panelBg = theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-white/70' : 'text-gray-500';
  const textMuted = theme === 'dark' ? 'text-white/40' : 'text-gray-400';
  const inputBg = theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200';

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col min-h-full lg:h-screen overflow-x-hidden ${textPrimary}`}>
      <header className={`hidden lg:flex mb-8 border-b pb-6 shrink-0 justify-between items-end ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">RECOVER <span className={`${textMuted} text-xl font-normal`}>{lang === 'KR' ? '(복구)' : lang === 'EN' ? '(Recover)' : '(復旧)'}</span></h1>
          <p className={`${textSecondary} mt-2 text-sm`}>{lang === 'KR' ? 'Smart Alpha Fill & Sequence Recovery' : lang === 'EN' ? 'Smart Alpha Fill & Sequence Recovery' : 'スマートアルファ塗りつぶし＆シーケンス復旧'}</p>
          {frames.length > 0 && (
            <p className="mt-2 text-xs font-medium text-blue-500">
              {lang === 'KR' ? `Remove 연결: ${frames.length} 프레임 로드됨` : `Continuing from Remove: ${frames.length} frames loaded`}
            </p>
          )}
        </div>
        {frames.length > 0 && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center rounded-lg p-1 mr-4 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
              <button 
                onClick={handleUndo}
                disabled={historyPointer < 0}
                className={`p-1.5 rounded-md transition-colors disabled:opacity-30 ${theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-white text-gray-900 bg-transparent'}`}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button 
                onClick={handleRedo}
                disabled={historyPointer >= history.length - 1}
                className={`p-1.5 rounded-md transition-colors disabled:opacity-30 ${theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-white text-gray-900 bg-transparent'}`}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={clearFrames}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                theme === 'dark' 
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {lang === 'KR' ? 'Clear All' : lang === 'EN' ? 'Clear All' : 'すべてクリア'}
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 lg:min-h-0 relative">
        
        {/* Mobile Phase 1: Upload Only */}
        {frames.length === 0 && (
          <div className="w-full flex flex-col items-center justify-center flex-1 lg:hidden">
            <div className={`w-full max-w-md border rounded-2xl p-6 ${panelBg}`}>
              <h2 className={`text-lg font-medium mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Upload className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-black'}`} />
                {lang === 'KR' ? (
                  <div className="flex flex-col">
                    <span>Upload Sequence</span>
                    <span className="text-sm font-normal opacity-60">(시퀀스 업로드)</span>
                  </div>
                ) : lang === 'EN' ? 'Upload Sequence' : 'シーケンスをアップロード'}
              </h2>
              <p className="text-xs text-blue-500 mb-4 whitespace-pre-wrap text-center">
                {lang === 'KR' ? '⚠️ 새 이미지를 업로드하면\n현재 공유된 프레임이 모두 지워집니다.' : '⚠️ Uploading new images will\nclear all shared frames.'}
              </p>
              
              <div 
                className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-all ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : theme === 'dark'
                      ? 'border-white/20 hover:bg-white/5 hover:border-white/40'
                      : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <label className="absolute inset-0 w-full h-full cursor-pointer">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/png,image/jpeg,image/jpg" 
                    multiple 
                    onChange={(e) => handleFiles(e.target.files)} 
                  />
                </label>
                <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                  <Upload className={`w-10 h-10 mb-3 transition-colors ${isDragging ? 'text-blue-500' : textMuted}`} />
                  <p className={`mb-2 text-base ${textSecondary} text-center px-4`}><span className="font-semibold">{lang === 'KR' ? 'Click' : lang === 'EN' ? 'Click' : 'クリック'}</span> {lang === 'KR' ? 'or drag PNG/JPG sequences' : lang === 'EN' ? 'or drag PNG/JPG sequences' : 'またはPNG/JPGシーケンスをドラッグ'}</p>
                  <p className="text-xs text-blue-500 font-medium px-4 text-center mt-1">
                    {lang === 'KR' ? '(주의: 새 복구 세션 시작)' : '(Start new recovery session)'}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-center w-full">
                <button
                  onClick={() => document.dispatchEvent(new CustomEvent('navigate', { detail: 'remove' }))}
                  className="w-full max-w-[200px] border border-blue-500/50 text-blue-500 px-4 py-2 rounded-full font-medium hover:bg-blue-500/10 transition-colors shadow-sm text-sm"
                >
                  {lang === 'KR' ? 'Remove 화면으로 이동' : 'Start from Remove'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Left Panel: Tools (Desktop & Mobile Phase 2) */}
        <div className={`order-2 w-full lg:w-80 shrink-0 lg:overflow-y-auto lg:pr-2 custom-scrollbar lg:order-1 ${frames.length === 0 ? 'hidden lg:flex lg:flex-col lg:space-y-6' : 'contents lg:flex lg:flex-col lg:space-y-6'}`}>
          
          {/* Upload Area (Desktop) */}
          <div className="hidden lg:block order-1">
            <div 
              className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-all ${
                isDragging 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : theme === 'dark'
                    ? 'border-white/20 hover:bg-white/5 hover:border-white/40'
                    : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <label className="absolute inset-0 w-full h-full cursor-pointer">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/png,image/jpeg,image/jpg" 
                  multiple 
                  onChange={(e) => handleFiles(e.target.files)} 
                />
              </label>
              <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                <Upload className={`w-8 h-8 mb-3 transition-colors ${isDragging ? 'text-blue-500' : textMuted}`} strokeWidth={1.5} />
                <p className={`mb-2 text-sm ${textSecondary} text-center px-4`}><span className="font-semibold">{lang === 'KR' ? 'Click' : lang === 'EN' ? 'Click' : 'クリック'}</span> {lang === 'KR' ? 'or drag PNG/JPG sequences' : lang === 'EN' ? 'or drag PNG/JPG sequences' : 'またはPNG/JPGシーケンスをドラッグ'}</p>
                <p className="text-xs text-blue-500 font-medium px-4 text-center mt-1">
                  {lang === 'KR' ? '(주의: 새 작업 시작)' : '(Warning: Starts a new project)'}
                </p>
              </div>
            </div>
          </div>

          {/* Canvas Settings */}
          <div className={`order-3 border rounded-2xl p-5 ${panelBg}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>{lang === 'KR' ? 'Canvas Size (크기)' : lang === 'EN' ? 'Canvas Size' : 'キャンバスサイズ'}</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className={`text-[10px] uppercase tracking-tighter ${textMuted}`}>{lang === 'KR' ? 'Manual Edit' : lang === 'EN' ? 'Manual Edit' : '手動編集'}</span>
                <input 
                  type="checkbox" 
                  checked={manualCanvasSize}
                  onChange={(e) => setManualCanvasSize(e.target.checked)}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <label className={`block text-[10px] ${textMuted} mb-1 uppercase tracking-tighter`}>{lang === 'KR' ? 'Width' : lang === 'EN' ? 'Width' : '幅'}</label>
                <input 
                  type="number" 
                  value={canvasWidth}
                  onChange={(e) => setCanvasWidth(Number(e.target.value))}
                  readOnly={!manualCanvasSize}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 ${inputBg} ${!manualCanvasSize ? 'opacity-70 cursor-not-allowed' : ''}`}
                />
                {!manualCanvasSize && detectedResolution && (
                  <div className="absolute right-2 top-7 text-[9px] text-blue-500 font-medium">{lang === 'KR' ? 'Auto' : lang === 'EN' ? 'Auto' : '自動'}</div>
                )}
              </div>
              <div className="relative">
                <label className={`block text-[10px] ${textMuted} mb-1 uppercase tracking-tighter`}>{lang === 'KR' ? 'Height' : lang === 'EN' ? 'Height' : '高さ'}</label>
                <input 
                  type="number" 
                  value={canvasHeight}
                  onChange={(e) => setCanvasHeight(Number(e.target.value))}
                  readOnly={!manualCanvasSize}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 ${inputBg} ${!manualCanvasSize ? 'opacity-70 cursor-not-allowed' : ''}`}
                />
                {!manualCanvasSize && detectedResolution && (
                  <div className="absolute right-2 top-7 text-[9px] text-blue-500 font-medium">{lang === 'KR' ? 'Auto' : lang === 'EN' ? 'Auto' : '自動'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Smart Fill Tools */}
          <div className={`order-2 border rounded-2xl p-5 ${panelBg}`}>
            <h3 className={`text-sm font-medium mb-4 ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>{lang === 'KR' ? 'Smart Fill (스마트 채우기)' : lang === 'EN' ? 'Smart Fill' : 'スマート塗りつぶし'}</h3>
            
            <div className="space-y-5">
              <div>
                <label className={`block text-[10px] ${textMuted} mb-2 uppercase tracking-tighter`}>{lang === 'KR' ? 'Tool Selection' : lang === 'EN' ? 'Tool Selection' : 'ツール選択'}</label>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => setActiveTool('brush')}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border transition-all ${
                      activeTool === 'brush' 
                        ? (theme === 'dark' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm')
                        : (theme === 'dark' ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50')
                    }`}
                  >
                    <Paintbrush className="w-3.5 h-3.5" strokeWidth={1} />
                    <span className="text-[9px] font-medium uppercase tracking-wider">{lang === 'KR' ? 'Brush' : lang === 'EN' ? 'Brush' : 'ブラシ'}</span>
                  </button>
                  <button 
                    onClick={() => setActiveTool('lasso')}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border transition-all ${
                      activeTool === 'lasso' 
                        ? (theme === 'dark' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm')
                        : (theme === 'dark' ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50')
                    }`}
                  >
                    <SquareDashed className="w-3.5 h-3.5" strokeWidth={1} />
                    <span className="text-[9px] font-medium uppercase tracking-wider">{lang === 'KR' ? 'Lasso' : lang === 'EN' ? 'Lasso' : '投げ縄'}</span>
                  </button>
                  <button 
                    onClick={() => setActiveTool('eraser')}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border transition-all ${
                      activeTool === 'eraser' 
                        ? (theme === 'dark' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-red-50 border-red-200 text-red-600 shadow-sm')
                        : (theme === 'dark' ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50')
                    }`}
                  >
                    <Eraser className="w-3.5 h-3.5" strokeWidth={1} />
                    <span className="text-[9px] font-medium uppercase tracking-wider">{lang === 'KR' ? 'Eraser' : lang === 'EN' ? 'Eraser' : '消しゴム'}</span>
                  </button>
                  <button 
                    onClick={handleFillAll}
                    disabled={isProcessing}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border transition-all ${
                      theme === 'dark' ? 'bg-white/5 border-white/10 text-white/60 hover:bg-yellow-500/20 hover:border-yellow-500/30 hover:text-yellow-400' : 'bg-white border-gray-200 text-gray-500 hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-700'
                    }`}
                  >
                    <PaintBucket className="w-3.5 h-3.5" strokeWidth={1} />
                    <span className="text-[9px] font-medium uppercase tracking-wider">{lang === 'KR' ? 'Fill All' : lang === 'EN' ? 'Fill All' : 'すべて塗りつぶし'}</span>
                  </button>
                </div>
                {/* Batch Progress */}
                {batchProgress >= 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] text-blue-500 mb-1 font-medium tracking-wide">
                      <span>{lang === 'KR' ? '처리 중...' : lang === 'EN' ? 'Processing...' : '処理中...'}</span>
                      <span>{batchProgress}%</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                      <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${batchProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-[10px] ${textMuted} mb-2 uppercase tracking-tighter`}>{lang === 'KR' ? 'Fill Color' : lang === 'EN' ? 'Fill Color' : '塗りつぶし色'}</label>
                <div className="flex gap-3">
                  <input 
                    type="color" 
                    value={fillColor}
                    onChange={(e) => setFillColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <input 
                    type="text" 
                    value={fillColor}
                    onChange={(e) => setFillColor(e.target.value)}
                    className={`flex-1 border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500/50 ${inputBg}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[10px] ${textMuted} mb-2 uppercase tracking-tighter`}>{lang === 'KR' ? 'Tool' : lang === 'EN' ? 'Tool' : 'ツール'}</label>
                <div className={`flex p-1 rounded-lg border ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                  <button
                    onClick={() => setActiveTool('brush')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${
                      activeTool === 'brush' 
                        ? theme === 'dark' ? 'bg-white/10 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'
                        : theme === 'dark' ? 'text-white/50 hover:text-white/80' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Paintbrush className="w-4 h-4" /> {lang === 'KR' ? 'Brush' : lang === 'EN' ? 'Brush' : 'ブラシ'}
                  </button>
                  <button
                    onClick={() => setActiveTool('lasso')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${
                      activeTool === 'lasso' 
                        ? theme === 'dark' ? 'bg-white/10 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'
                        : theme === 'dark' ? 'text-white/50 hover:text-white/80' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <SquareDashed className="w-4 h-4" /> {lang === 'KR' ? 'Lasso' : lang === 'EN' ? 'Lasso' : '投げ縄'}
                  </button>
                </div>
              </div>

              {activeTool === 'brush' && (
                <div className={`p-4 rounded-xl border mb-4 animate-in fade-in slide-in-from-top-2 duration-200 ${theme === 'dark' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <label className={`block text-[10px] ${textMuted} uppercase tracking-tighter`}>{lang === 'KR' ? 'Brush Size' : lang === 'EN' ? 'Brush Size' : 'ブラシサイズ'}</label>
                    <span className={`text-xs font-mono font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-black'}`}>{brushSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className={`w-full ${theme === 'dark' ? 'accent-blue-500' : 'accent-black'}`}
                  />
                </div>
              )}

              <div className={`p-4 rounded-xl border mb-4 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex justify-between items-center mb-2">
                  <label className={`block text-[10px] ${textMuted} uppercase tracking-tighter`}>{lang === 'KR' ? 'Alpha Threshold' : lang === 'EN' ? 'Alpha Threshold' : 'アルファしきい値'}</label>
                  <span className={`text-xs font-mono font-bold ${theme === 'dark' ? 'text-white/80' : 'text-black'}`}>{alphaThreshold}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="255" 
                  value={alphaThreshold}
                  onChange={(e) => setAlphaThreshold(Number(e.target.value))}
                  className={`w-full ${theme === 'dark' ? 'accent-white' : 'accent-black'}`}
                />
              </div>

              <button 
                onClick={applyToAllSelected}
                className={`w-full border font-medium py-2.5 rounded-lg text-sm transition-all flex flex-col items-center justify-center gap-0.5 ${
                  theme === 'dark'
                    ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200'
                }`}
              >
                <span>{lang === 'KR' ? 'Apply to All Selected' : lang === 'EN' ? 'Apply to All Selected' : '選択したすべてに適用'}</span>
                <span className="text-[10px] opacity-80 font-normal">{lang === 'KR' ? '(선택된 모든 프레임에 적용)' : lang === 'EN' ? '(Apply to all selected frames)' : '(選択されたすべてのフレームに適用)'}</span>
              </button>
            </div>
          </div>

          <button 
            onClick={exportZip}
            disabled={frames.length === 0 || isProcessing}
            className={`order-4 mb-24 lg:mb-0 w-full font-medium py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-white/10 disabled:to-white/10 disabled:text-white/40 text-white shadow-blue-500/20 disabled:shadow-none'
                : 'bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white shadow-gray-900/20 disabled:shadow-none'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {lang === 'KR' ? 'EXPORT (다운로드)' : lang === 'EN' ? 'EXPORT' : 'エクスポート'}
          </button>
        </div>

        {/* Right Panel: Canvas & Filmstrip (Order 1) */}
        <div className={`order-1 w-full lg:flex-1 flex flex-col min-w-0 border-b lg:border-none overflow-hidden lg:overflow-visible ${panelBg} lg:bg-transparent lg:order-2 ${frames.length > 0 ? 'pb-2 lg:pb-0 pt-2 lg:pt-0 lg:relative lg:z-auto' : 'hidden lg:flex'}`}>
          
          <div className="sticky top-0 z-40 w-full bg-inherit flex-1 flex flex-col min-h-0">
            {/* Canvas Header */}
            <div className={`h-auto lg:h-14 shrink-0 flex flex-col lg:flex-row items-center justify-between p-2 lg:px-4 gap-3 lg:gap-2 ${theme === 'dark' ? 'bg-black/20 lg:bg-transparent' : 'bg-gray-50 lg:bg-transparent'}`}>
              <div className="flex items-center justify-between lg:justify-start gap-2 w-full lg:w-auto">
                <div className="flex items-center gap-1 lg:gap-3 w-full lg:w-auto justify-between lg:justify-center">
                  <span className={`text-[10px] lg:text-xs font-mono px-2 py-1 rounded-md ${theme === 'dark' ? 'bg-white/10 text-white/70' : 'bg-gray-200 text-gray-700'}`}>
                    {frames.length > 0 ? `${frames.findIndex(f => f.id === currentFrameId) + 1} / ${frames.length}` : (lang === 'KR' ? '0 frames' : lang === 'EN' ? '0 frames' : '0 フレーム')}
                  </span>
                  <div className="flex items-center gap-1 lg:gap-3">
                    <button onClick={() => setZoom(z => Number(Math.max(0.1, z - 0.1).toFixed(2)))} className={`p-1 lg:p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
                      <ZoomOut className="w-4 h-4 lg:w-4 lg:h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (zoom === 1) {
                          fitToScreen();
                        } else {
                          setZoom(1);
                        }
                      }}
                      className={`text-[10px] lg:text-xs font-mono w-12 lg:w-16 text-center rounded-md py-1 transition-colors ${theme === 'dark' ? 'text-white/70 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-200'}`}
                      title="Toggle Fit / 100%"
                    >
                      {Math.round(zoom * 100)}%
                    </button>
                    <button onClick={() => setZoom(z => Number(Math.min(5, z + 0.1).toFixed(2)))} className={`p-1 lg:p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
                      <ZoomIn className="w-4 h-4 lg:w-4 lg:h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className={`flex flex-wrap items-center gap-2 p-1.5 lg:p-1 rounded-xl lg:rounded-lg border w-full lg:w-auto justify-center ${theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-gray-200 border-gray-300'}`}>
                {(['transparent', 'black', 'app'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setBgMode(mode)}
                    className={`flex-1 lg:flex-none px-3 lg:px-3 py-2.5 lg:py-1.5 text-xs font-medium rounded-lg lg:rounded-md capitalize transition-all ${
                      bgMode === mode 
                        ? theme === 'dark' ? 'bg-white/20 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'
                        : theme === 'dark' ? 'text-white/50 hover:text-white/80 hover:bg-white/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {mode === 'app' ? 'App UI' : mode === 'transparent' ? (lang === 'KR' ? 'Transparent' : lang === 'EN' ? 'Transparent' : '透明') : (lang === 'KR' ? 'Black' : lang === 'EN' ? 'Black' : 'ブラック')}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Area */}
            <div 
              ref={containerRef}
              className={`w-full flex-1 overflow-auto relative flex ${frames.length === 0 ? 'items-center' : 'items-start pt-4 lg:pt-8'} justify-center h-[23dvh] max-h-[23dvh] lg:h-auto lg:max-h-none lg:min-h-0 lg:relative lg:top-auto lg:z-auto ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-100'}`}
            >
              {showResolutionToast && detectedResolution && (
                <div className="absolute top-4 right-4 z-50 bg-black/80 text-white text-[10px] px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm transition-opacity duration-300">
                  {lang === 'KR' ? 'Detected Resolution' : lang === 'EN' ? 'Detected Resolution' : '検出された解像度'}: {detectedResolution.width} x {detectedResolution.height}
                </div>
              )}
              {frames.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full max-w-lg mx-4 gap-4">
                  <div 
                    className={`flex flex-col items-center justify-center p-12 w-full border-2 border-dashed rounded-2xl transition-all cursor-pointer relative ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : theme === 'dark'
                          ? 'border-white/10 text-white/30 hover:bg-white/5 hover:border-white/20'
                          : 'border-gray-300 text-gray-400 hover:bg-gray-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <label className="absolute inset-0 w-full h-full cursor-pointer">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/png,image/jpeg,image/jpg" 
                        multiple 
                        onChange={(e) => handleFiles(e.target.files)} 
                      />
                    </label>
                    <div className="flex flex-col items-center pointer-events-none">
                      <Upload className="w-12 h-12 mb-4 opacity-50" />
                      <p className="text-base font-medium text-center mb-2">{lang === 'KR' ? '새 복구 세션 시작 (PNG/JPG)' : lang === 'EN' ? 'Start new recovery session (PNG/JPG)' : 'PNG/JPGシーケンスをアップロード'}</p>
                      <p className="text-sm text-center opacity-70">
                        {lang === 'KR' ? '좌측 패널에서 파일을 업로드하거나 이곳에 드래그하세요.' : lang === 'EN' ? 'Upload files from the left panel or drag them here.' : '左のパネルからファイルをアップロードするか、ここにドラッグしてください。'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => document.dispatchEvent(new CustomEvent('navigate', { detail: 'remove' }))}
                    className="w-full max-w-xs border border-blue-500/50 text-blue-500 px-6 py-2 rounded-full font-medium hover:bg-blue-500/10 transition-colors shadow-sm"
                  >
                    {lang === 'KR' ? 'Remove 화면으로 이동' : 'Start from Remove'}
                  </button>
                </div>
              ) : (
                <div 
                  className="relative shadow-2xl transition-transform duration-75 origin-top max-w-full"
                  style={{ 
                    width: canvasWidth, 
                    maxWidth: '100%',
                    aspectRatio: `${canvasWidth} / ${canvasHeight}`,
                    transform: `scale(${zoom})`,
                    backgroundColor: bgMode === 'black' ? '#000000' : bgMode === 'app' ? (theme === 'dark' ? '#121212' : '#f3f4f6') : '#ffffff',
                    backgroundImage: bgMode === 'transparent' ? 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb), linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb)' : 'none',
                    backgroundPosition: bgMode === 'transparent' ? '0 0, 10px 10px' : 'initial',
                    backgroundSize: bgMode === 'transparent' ? '20px 20px' : 'initial'
                  }}
                >
                  <canvas 
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    className="w-full h-full cursor-crosshair touch-none absolute inset-0"
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerLeave}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                    onTouchCancel={handlePointerLeave}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Filmstrip (Now after Canvas on Mobile) */}
          {frames.length > 0 && (
            <div className={`h-16 lg:h-32 border-t shrink-0 p-2 lg:p-3 overflow-x-auto flex gap-2 items-center custom-scrollbar mt-2 lg:mt-6 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
              {frames.map((frame) => (
                <div 
                  key={frame.id}
                  onClick={(e) => toggleSelection(frame.id, e.ctrlKey || e.metaKey, e.shiftKey)}
                  className={`shrink-0 relative h-full aspect-[5/7] rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                    selectedFrames.has(frame.id) 
                      ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                      : theme === 'dark'
                        ? 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'
                        : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={frame.processedUrl ?? frame.rawUrl} alt={frame.name} className={`w-full h-full object-contain ${theme === 'dark' ? 'bg-[#121212]' : 'bg-white'}`} />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm p-1">
                    <p className="text-[9px] text-white/80 truncate text-center font-mono">{frame.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
