import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Loader2, ZoomIn, ZoomOut, MousePointer2, Paintbrush, SquareDashed, Trash2, Eraser, Play, Square, Sliders, ChevronDown, Undo2, Redo2, PaintBucket } from 'lucide-react';
import JSZip from 'jszip';
import { useTheme } from '../ThemeContext';
import { trackEvent } from '../lib/analytics';

interface Frame {
  id: string;
  file: File;
  url: string;
  name: string;
  modifiedDataUrl?: string;
}

interface Point {
  x: number;
  y: number;
}

export default function RecoverPage() {
  const { theme } = useTheme();
  const [frames, setFrames] = useState<Frame[]>([]);
  const [selectedFrames, setSelectedFrames] = useState<Set<string>>(new Set());
  const [currentFrameId, setCurrentFrameId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Canvas Settings
  const [canvasWidth, setCanvasWidth] = useState(() => Number(localStorage.getItem('recover_canvasWidth')) || 500);
  const [canvasHeight, setCanvasHeight] = useState(() => Number(localStorage.getItem('recover_canvasHeight')) || 700);
  const [zoom, setZoom] = useState(1);
  const [bgMode, setBgMode] = useState<'transparent' | 'black' | 'app'>('app');
  
  // Tool Settings
  const [activeTool, setActiveTool] = useState<'brush' | 'lasso' | 'eraser'>('brush');
  const [fillColor, setFillColor] = useState(() => localStorage.getItem('recover_fillColor') || '#ffffff');
  const [brushSize, setBrushSize] = useState(() => Number(localStorage.getItem('recover_brushSize')) || 20);
  
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
  }, [canvasWidth, canvasHeight, fillColor, brushSize]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    const newFrames: Frame[] = [];
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/png')) {
        newFrames.push({
          id: Math.random().toString(36).substring(7),
          file,
          url: URL.createObjectURL(file),
          name: file.name
        });
      }
    });
    
    if (newFrames.length > 0) {
      setFrames(prev => [...prev, ...newFrames]);
      if (!currentFrameId) {
        setCurrentFrameId(newFrames[0].id);
        setSelectedFrames(new Set([newFrames[0].id]));
      }
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

    const sourceUrl = frame.modifiedDataUrl || frame.url;
    
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

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.min(Math.max(0.1, prev + delta), 5));
    }
  };

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
    setFrames([]);
    setSelectedFrames(new Set());
    setCurrentFrameId(null);
    imageCache.current.clear();
    setLastAction(null);
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

const applyFillToImageData = (imageData: ImageData, mask: boolean[] | null, brushPath: Point[] | null, isEraser: boolean = false) => {
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
            // 스마트 채우기: 투명한 곳(알파값이 200 미만인 곳)에만 색을 채워 캐릭터 본체를 보호합니다.
            if (data[pixelIndex + 3] < 200) {
              data[pixelIndex] = rgb.r;
              data[pixelIndex + 1] = rgb.g;
              data[pixelIndex + 2] = rgb.b;
              data[pixelIndex + 3] = 255;
            }
          }
        }
      }
    } else if (brushPath) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tCtx = tempCanvas.getContext('2d')!;
      
      tCtx.beginPath();
      tCtx.lineCap = 'round';
      tCtx.lineJoin = 'round';
      tCtx.lineWidth = brushSize;
      tCtx.strokeStyle = 'white';
      tCtx.fillStyle = 'white';
      
      if (brushPath.length === 1) {
        tCtx.arc(brushPath[0].x, brushPath[0].y, brushSize / 2, 0, Math.PI * 2);
        tCtx.fill();
      } else if (brushPath.length > 1) {
        tCtx.moveTo(brushPath[0].x, brushPath[0].y);
        for (let i = 1; i < brushPath.length; i++) {
          tCtx.lineTo(brushPath[i].x, brushPath[i].y);
        }
        tCtx.stroke();
      }

      const maskData = tCtx.getImageData(0, 0, width, height).data;
      
      for (let i = 0; i < data.length; i += 4) {
        // 브러시가 칠해진 영역(maskData)이면서, 동시에 캔버스의 반투명/투명한 곳(data)만 색을 채웁니다.
        if (maskData[i + 3] > 0) {
          if (isEraser) {
            data[i + 3] = 0;
          } else if (data[i + 3] < 200) {
            data[i] = rgb.r;
            data[i + 1] = rgb.g;
            data[i + 2] = rgb.b;
            data[i + 3] = 255;
          }
        }
      }
    }
    return imageData;
  };

  const applyToAllRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '[') {
        setBrushSize(prev => Math.max(1, prev - 5));
      } else if (e.key === ']') {
        setBrushSize(prev => Math.min(100, prev + 5));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const performBatchFill = async (targetFrameIds: string[], mask: boolean[] | null, brushPath: Point[] | null, isEraser: boolean = false) => {
    const updates = new Map<string, string>();
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;

    for (let i = 0; i < targetFrameIds.length; i++) {
      const frameId = targetFrameIds[i];
      const currentFrame = frames.find(f => f.id === frameId);
      if (!currentFrame) continue;

      const sourceUrl = currentFrame.modifiedDataUrl || currentFrame.url;
      
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
      imageData = applyFillToImageData(imageData, mask, brushPath, isEraser);
      tempCtx.putImageData(imageData, 0, 0);

      const newUrl = tempCanvas.toDataURL('image/png');
      updates.set(frameId, newUrl);

      if (i > 0 && i % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    setFrames(prev => prev.map(f => 
      updates.has(f.id) ? { ...f, modifiedDataUrl: updates.get(f.id)! } : f
    ));
  };

  const performFill = async (frameId: string, mask: boolean[] | null, brushPath: Point[] | null, isEraser: boolean = false) => {
    await performBatchFill([frameId], mask, brushPath, isEraser);
  };

  const handleFillAll = async () => {
    if (!currentFrameId) return;
    
    let targetFrames = selectedFrames.has(currentFrameId) ? Array.from(selectedFrames) : [currentFrameId];
    if (applyToAllRef.current) {
      targetFrames = frames.map(f => f.id);
    }
    
    setIsProcessing(true);
    const updates = new Map<string, string>();
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
    const rgb = hexToRgb(fillColor);

    for (const frameId of targetFrames) {
      const frame = frames.find(f => f.id === frameId);
      if (!frame) continue;
      const sourceUrl = frame.modifiedDataUrl || frame.url;
      let img = imageCache.current.get(sourceUrl);
      if (!img) {
        img = await new Promise<HTMLImageElement>((resolve) => {
          const newImg = new Image();
          newImg.onload = () => resolve(newImg);
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
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 200) {
          data[i] = rgb.r;
          data[i + 1] = rgb.g;
          data[i + 2] = rgb.b;
          data[i + 3] = 255;
        }
      }
      tempCtx.putImageData(imageData, 0, 0);
      updates.set(frameId, tempCanvas.toDataURL('image/png'));
    }

    setFrames(prev => prev.map(f => updates.has(f.id) ? { ...f, modifiedDataUrl: updates.get(f.id)! } : f));
    setIsProcessing(false);
    trackEvent('Fill_All');
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
          const sourceUrl = frame.modifiedDataUrl || frame.url;
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

    if (activeTool === 'lasso') {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasWidth;
      tempCanvas.height = canvasHeight;
      const tCtx = tempCanvas.getContext('2d')!;
      
      tCtx.beginPath();
      if (lassoPoints.length > 0) {
        tCtx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
        for (let i = 1; i < lassoPoints.length; i++) {
          tCtx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
        }
        tCtx.closePath();
        tCtx.fillStyle = 'white';
        tCtx.fill();
      }

      const maskData = tCtx.getImageData(0, 0, canvasWidth, canvasHeight).data;
      const mask = new Array(canvasWidth * canvasHeight).fill(false);
      for (let i = 0; i < maskData.length; i += 4) {
        if (maskData[i + 3] > 0) {
          mask[i / 4] = true;
        }
      }

      await performBatchFill(targetFrames, mask, null, activeTool === 'eraser');
      setLastAction({ type: activeTool === 'eraser' ? 'brush' : 'lasso', data: mask });
    } else {
      await performBatchFill(targetFrames, null, lassoPoints, activeTool === 'eraser');
      setLastAction({ type: activeTool === 'eraser' ? 'brush' : 'brush', data: lassoPoints });
    }
    
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
      alert("Please use the brush or lasso tool on a frame first before applying to all.");
      return;
    }

    setIsProcessing(true);
    try {
      const framesToProcess = Array.from(selectedFrames).filter(id => id !== currentFrameId) as string[];
      if (lastAction.type === 'lasso') {
        await performBatchFill(framesToProcess, lastAction.data as boolean[], null);
      } else {
        await performBatchFill(framesToProcess, null, lastAction.data as Point[]);
      }
    } catch (error) {
      console.error("Error applying to all:", error);
      alert("Failed to apply to all selected frames.");
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
        const sourceUrl = frame.modifiedDataUrl || frame.url;
        const response = await fetch(sourceUrl);
        const blob = await response.blob();
        
        const nameParts = frame.name.split('.');
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
      alert("Failed to export ZIP file.");
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
    <div className={`max-w-6xl mx-auto p-4 md:p-8 flex flex-col min-h-full lg:h-screen ${textPrimary}`}>
      <header className={`hidden lg:flex mb-8 border-b pb-6 shrink-0 justify-between items-end ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">RECOVER <span className={`${textMuted} text-xl font-normal`}>(복구)</span></h1>
          <p className={`${textSecondary} mt-2 text-sm`}>Smart Alpha Fill & Sequence Recovery</p>
        </div>
        {frames.length > 0 && (
          <button 
            onClick={clearFrames}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              theme === 'dark' 
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 lg:min-h-0 relative">
        
        {/* Mobile Phase 1: Upload Only */}
        {frames.length === 0 && (
          <div className="w-full flex flex-col items-center justify-center flex-1 lg:hidden">
            <div className={`w-full max-w-md border rounded-2xl p-6 ${panelBg}`}>
              <h2 className={`text-lg font-medium mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Upload className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-black'}`} />
                Upload Sequence <span className="text-sm font-normal opacity-60">(시퀀스 업로드)</span>
              </h2>
              
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
                    accept="image/png" 
                    multiple 
                    onChange={(e) => handleFiles(e.target.files)} 
                  />
                </label>
                <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                  <Upload className={`w-10 h-10 mb-3 transition-colors ${isDragging ? 'text-blue-500' : textMuted}`} />
                  <p className={`mb-2 text-base ${textSecondary} text-center px-4`}><span className="font-semibold">Click</span> or drag PNG sequences</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Left Panel: Tools (Desktop & Mobile Phase 2) */}
        <div className={`w-full lg:w-80 shrink-0 lg:overflow-y-auto lg:pr-2 custom-scrollbar lg:order-1 ${frames.length === 0 ? 'hidden lg:flex lg:flex-col lg:space-y-6' : 'contents lg:flex lg:flex-col lg:space-y-6'}`}>
          
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
                  accept="image/png" 
                  multiple 
                  onChange={(e) => handleFiles(e.target.files)} 
                />
              </label>
              <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                <Upload className={`w-8 h-8 mb-3 transition-colors ${isDragging ? 'text-blue-500' : textMuted}`} strokeWidth={1.5} />
                <p className={`mb-2 text-sm ${textSecondary} text-center px-4`}><span className="font-semibold">Click</span> or drag PNG sequences</p>
              </div>
            </div>
          </div>

          {/* Canvas Settings */}
          <div className={`order-3 border rounded-2xl p-5 ${panelBg}`}>
            <h3 className={`text-sm font-medium mb-4 ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>Canvas Size <span className="font-normal opacity-60">(크기)</span></h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-[10px] ${textMuted} mb-1 uppercase tracking-tighter`}>Width</label>
                <input 
                  type="number" 
                  value={canvasWidth}
                  onChange={(e) => setCanvasWidth(Number(e.target.value))}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 ${inputBg}`}
                />
              </div>
              <div>
                <label className={`block text-[10px] ${textMuted} mb-1 uppercase tracking-tighter`}>Height</label>
                <input 
                  type="number" 
                  value={canvasHeight}
                  onChange={(e) => setCanvasHeight(Number(e.target.value))}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 ${inputBg}`}
                />
              </div>
            </div>
          </div>

          {/* Smart Fill Tools */}
          <div className={`order-2 border rounded-2xl p-5 ${panelBg}`}>
            <h3 className={`text-sm font-medium mb-4 ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>Smart Fill <span className="text-xs font-normal opacity-60">(스마트 채우기)</span></h3>
            
            <div className="space-y-5">
              <div>
                <label className={`block text-[10px] ${textMuted} mb-2 uppercase tracking-tighter`}>Tool Selection</label>
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
                    <span className="text-[9px] font-medium uppercase tracking-wider">Brush</span>
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
                    <span className="text-[9px] font-medium uppercase tracking-wider">Lasso</span>
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
                    <span className="text-[9px] font-medium uppercase tracking-wider">Eraser</span>
                  </button>
                  <button 
                    onClick={handleFillAll}
                    disabled={isProcessing}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border transition-all backdrop-blur-md ${
                      theme === 'dark' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20' : 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
                    }`}
                  >
                    <PaintBucket className="w-3.5 h-3.5" strokeWidth={1} />
                    <span className="text-[9px] font-medium uppercase tracking-wider">Fill All</span>
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-[10px] ${textMuted} mb-2 uppercase tracking-tighter`}>Fill Color</label>
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
                <label className={`block text-[10px] ${textMuted} mb-2 uppercase tracking-tighter`}>Tool</label>
                <div className={`flex p-1 rounded-lg border ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                  <button
                    onClick={() => setActiveTool('brush')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${
                      activeTool === 'brush' 
                        ? theme === 'dark' ? 'bg-white/10 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'
                        : theme === 'dark' ? 'text-white/50 hover:text-white/80' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Paintbrush className="w-4 h-4" /> Brush
                  </button>
                  <button
                    onClick={() => setActiveTool('lasso')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${
                      activeTool === 'lasso' 
                        ? theme === 'dark' ? 'bg-white/10 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'
                        : theme === 'dark' ? 'text-white/50 hover:text-white/80' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <SquareDashed className="w-4 h-4" /> Lasso
                  </button>
                </div>
              </div>

              {activeTool === 'brush' && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={`block text-[10px] ${textMuted} uppercase tracking-tighter`}>Brush Size</label>
                    <span className="text-xs font-mono text-blue-500">{brushSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              )}

              <button 
                onClick={applyToAllSelected}
                className={`w-full border font-medium py-2.5 rounded-lg text-sm transition-all flex flex-col items-center justify-center gap-0.5 ${
                  theme === 'dark'
                    ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200'
                }`}
              >
                <span>Apply to All Selected</span>
                <span className="text-[10px] opacity-80 font-normal">(선택된 모든 프레임에 적용)</span>
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
            EXPORT <span className="font-normal opacity-80">(다운로드)</span>
          </button>
        </div>

        {/* Right Panel: Canvas & Filmstrip (Order 1) */}
        <div className={`order-1 w-full lg:flex-1 flex flex-col min-w-0 border lg:border-none rounded-2xl lg:rounded-none overflow-hidden lg:overflow-visible ${panelBg} lg:bg-transparent lg:order-2 ${frames.length > 0 ? 'lg:relative lg:z-auto pb-4 lg:pb-0 pt-2 lg:pt-0' : 'hidden lg:flex'}`}>
          
          {/* Canvas Header */}
          <div className={`h-12 lg:h-14 border-b flex items-center justify-between px-2 lg:px-4 shrink-0 ${theme === 'dark' ? 'bg-black/20 lg:bg-transparent border-white/10' : 'bg-gray-50 lg:bg-transparent border-gray-200'}`}>
            <div className={`flex items-center gap-1 lg:gap-2 p-1 rounded-lg border ${theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-gray-200 border-gray-300'}`}>
              {(['transparent', 'black', 'app'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setBgMode(mode)}
                  className={`px-2 lg:px-3 py-1 lg:py-1.5 text-[10px] lg:text-xs font-medium rounded-md capitalize transition-all ${
                    bgMode === mode 
                      ? theme === 'dark' ? 'bg-white/20 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'
                      : theme === 'dark' ? 'text-white/50 hover:text-white/80 hover:bg-white/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {mode === 'app' ? 'App UI' : mode}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 lg:gap-3">
              <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className={`p-1 lg:p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
                <ZoomOut className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
              <span className={`text-[10px] lg:text-xs font-mono w-8 lg:w-12 text-center ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(5, z + 0.1))} className={`p-1 lg:p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
                <ZoomIn className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div 
            ref={containerRef}
            className={`flex-1 overflow-auto relative flex items-center justify-center max-h-[45vh] lg:max-h-none ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-100'}`}
            onWheel={handleWheel}
          >
            {frames.length === 0 ? (
              <div className={`flex flex-col items-center gap-3 ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>
                <MousePointer2 className="w-12 h-12 opacity-20" />
                <p className="text-sm">Upload PNG sequences to start recovering</p>
              </div>
            ) : (
              <div 
                className="relative shadow-2xl transition-transform duration-75 origin-center"
                style={{ 
                  width: canvasWidth, 
                  height: canvasHeight,
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

          {/* Filmstrip */}
          {frames.length > 0 && (
            <div className={`h-32 border-t shrink-0 p-3 overflow-x-auto flex gap-2 items-center custom-scrollbar ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
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
                  <img src={frame.modifiedDataUrl || frame.url} alt={frame.name} className={`w-full h-full object-contain ${theme === 'dark' ? 'bg-[#121212]' : 'bg-white'}`} />
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
