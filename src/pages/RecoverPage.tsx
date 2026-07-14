import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Loader2, ZoomIn, ZoomOut, Paintbrush, SquareDashed, Trash2, Eraser, Undo2, Redo2, Eye, ShieldAlert } from 'lucide-react';
import JSZip from 'jszip';
import { useLanguage } from '../LanguageContext';
import { useBatchJob } from '../hooks/useBatchJob';
import { useTheme } from '../ThemeContext';
import { useStudio, StudioFrame } from '../StudioContext';
import { trackEvent } from '../lib/analytics';
import { revokeUrlsSafely } from '../utils/urlUtils';
import { getFrameDisplayUrl } from '../utils/frameUtils';
import { composeRecoveredFrame } from '../utils/chromaKey';
import { fetchPngBlobStrict } from '../utils/fetchBlobStrict';

interface Point {
  x: number;
  y: number;
}

type OperationType = 'restore' | 'fill' | 'erase' | 'clear_mask';
type InputMethodType = 'brush' | 'lasso';

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

  // Active Modes
  const [activeOp, setActiveOp] = useState<OperationType>('restore');
  const [inputMethod, setInputMethod] = useState<InputMethodType>('brush');

  // Canvas Settings
  const [canvasWidth, setCanvasWidth] = useState(() => Number(localStorage.getItem('recover_canvasWidth')) || 500);
  const [canvasHeight, setCanvasHeight] = useState(() => Number(localStorage.getItem('recover_canvasHeight')) || 700);
  const [zoom, setZoom] = useState(1);
  const [bgMode, setBgMode] = useState<'transparent' | 'black' | 'app'>('app');
  const [detectedResolution, setDetectedResolution] = useState<{width: number, height: number} | null>(null);
  const [showResolutionToast, setShowResolutionToast] = useState(false);
  const [manualCanvasSize, setManualCanvasSize] = useState(false);

  // Brush Settings
  const [fillColor, setFillColor] = useState(() => localStorage.getItem('recover_fillColor') || '#ffffff');
  const [brushSize, setBrushSize] = useState(() => Number(localStorage.getItem('recover_brushSize')) || 25);

  // History State
  type HistoryEntry = {
    frameId: string;
    undoUrl: string | undefined;
    undoMaskUrl: string | undefined;
    redoUrl: string | undefined;
    redoMaskUrl: string | undefined;
  }[];
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyPointer, setHistoryPointer] = useState(-1);

  const pushToHistory = useCallback((entry: HistoryEntry) => {
    setHistory(prev => {
      const droppedFuture = prev.slice(historyPointer + 1);
      const urlsToRevoke: string[] = [];
      droppedFuture.forEach(h => h.forEach(e => {
        if (e.redoUrl) urlsToRevoke.push(e.redoUrl);
        if (e.redoMaskUrl) urlsToRevoke.push(e.redoMaskUrl);
      }));

      const newHist = prev.slice(0, historyPointer + 1);
      newHist.push(entry);
      if (newHist.length > 20) {
        const droppedPast = newHist.shift();
        droppedPast?.forEach(e => {
          if (e.undoUrl) urlsToRevoke.push(e.undoUrl);
          if (e.undoMaskUrl) urlsToRevoke.push(e.undoMaskUrl);
        });
      }

      revokeUrlsSafely(urlsToRevoke, frames, newHist);
      return newHist;
    });
    setHistoryPointer(prev => Math.min(19, prev + 1));
  }, [historyPointer, frames]);

  // Drawing States
  const [isDrawing, setIsDrawing] = useState(false);
  const [lassoPoints, setLassoPoints] = useState<Point[]>([]);
  const [hoverPos, setHoverPos] = useState<Point | null>(null);
  const [lastAction, setLastAction] = useState<{
    op: OperationType;
    method: InputMethodType;
    points: Point[];
    fillColor: string;
    brushSize: number;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    return () => {
      imageCache.current.clear();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('recover_canvasWidth', canvasWidth.toString());
    localStorage.setItem('recover_canvasHeight', canvasHeight.toString());
    localStorage.setItem('recover_fillColor', fillColor);
    localStorage.setItem('recover_brushSize', brushSize.toString());
  }, [canvasWidth, canvasHeight, fillColor, brushSize]);

  // Helper: auto-detect resolution
  useEffect(() => {
    if (frames.length > 0 && !detectedResolution) {
      const firstFrame = frames[0];
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setDetectedResolution({ width: img.naturalWidth, height: img.naturalHeight });
        if (!manualCanvasSize) {
          setCanvasWidth(img.naturalWidth);
          setCanvasHeight(img.naturalHeight);
        }
        setShowResolutionToast(true);
        setTimeout(() => setShowResolutionToast(false), 4000);
      };
      img.src = firstFrame.rawUrl;
    }
  }, [frames, detectedResolution, manualCanvasSize]);

  // Auto-selection of first frame
  useEffect(() => {
    if (frames.length > 0 && !currentFrameId) {
      setCurrentFrameId(frames[0].id);
      setSelectedFrames(new Set([frames[0].id]));
    }
  }, [frames, currentFrameId]);

  const fitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth - 48;
    const containerHeight = containerRef.current.clientHeight - 48;
    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    const bestScale = Math.min(scaleX, scaleY, 1.5);
    setZoom(Number(Math.max(0.1, bestScale).toFixed(2)));
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    if (frames.length > 0) {
      fitToScreen();
    }
  }, [frames.length, canvasWidth, canvasHeight]);

  // Handle Undo / Redo
  const handleUndo = useCallback(() => {
    if (historyPointer < 0) return;
    setHistoryPointer(p => p - 1);
    setFrames(prev => prev.map(f => {
      const edit = history[historyPointer].find(e => e.frameId === f.id);
      if (edit) {
        return {
          ...f,
          recoveredUrl: edit.undoUrl,
          recoverMaskUrl: edit.undoMaskUrl,
          recoverDirty: false
        };
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
        return {
          ...f,
          recoveredUrl: edit.redoUrl,
          recoverMaskUrl: edit.redoMaskUrl,
          recoverDirty: false
        };
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

  // Non-destructive mask builder and batch compositor
  const performBatchRecover = async (
    targetFrameIds: string[],
    op: OperationType,
    method: InputMethodType,
    points: Point[],
    currentSize: number,
    currentColor: string
  ) => {
    await startJob<string, { id: string; url: string; maskUrl: string; startKeyRevision: string }>({
      items: targetFrameIds,
      delayMs: 0,
      processItem: async (frameId) => {
        const frame = frames.find(f => f.id === frameId);
        if (!frame) throw new Error("Frame not found");

        if (
          !frame.keyedUrl ||
          frame.keyDirty ||
          !frame.keyRevision
        ) {
          throw new Error(`KEYED_FRAME_REQUIRED:${frame.id}`);
        }

        const startKeyRevision = frame.keyRevision;
        const frameW = frame.width;
        const frameH = frame.height;

        // Create high-resolution Mask Canvas
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = frameW;
        maskCanvas.height = frameH;
        const mCtx = maskCanvas.getContext('2d')!;

        // 1. Draw existing mask if it exists
        if (frame.recoverMaskUrl) {
          const oldMaskImg = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = frame.recoverMaskUrl!;
          });
          mCtx.drawImage(oldMaskImg, 0, 0);
        }

        // 2. Compute stroke scaled to original frame dimension
        mCtx.save();
        const scaleX = frameW / canvasWidth;
        const scaleY = frameH / canvasHeight;

        if (op === 'clear_mask') {
          mCtx.globalCompositeOperation = 'destination-out';
        } else {
          mCtx.globalCompositeOperation = 'source-over';
          if (op === 'restore') mCtx.fillStyle = mCtx.strokeStyle = 'rgb(255, 0, 0)';
          else if (op === 'fill') mCtx.fillStyle = mCtx.strokeStyle = 'rgb(0, 255, 0)';
          else if (op === 'erase') mCtx.fillStyle = mCtx.strokeStyle = 'rgb(0, 0, 255)';
        }

        const scaledBrushSize = currentSize * ((scaleX + scaleY) / 2);

        if (method === 'lasso') {
          if (points.length > 0) {
            mCtx.beginPath();
            mCtx.moveTo(points[0].x * scaleX, points[0].y * scaleY);
            for (let i = 1; i < points.length; i++) {
              mCtx.lineTo(points[i].x * scaleX, points[i].y * scaleY);
            }
            mCtx.closePath();
            mCtx.fill();
          }
        } else {
          // Brush / Eraser stroke
          mCtx.lineCap = 'round';
          mCtx.lineJoin = 'round';
          mCtx.lineWidth = scaledBrushSize;

          if (points.length === 1) {
            mCtx.beginPath();
            mCtx.arc(points[0].x * scaleX, points[0].y * scaleY, scaledBrushSize / 2, 0, Math.PI * 2);
            mCtx.fill();
          } else if (points.length > 1) {
            mCtx.beginPath();
            mCtx.moveTo(points[0].x * scaleX, points[0].y * scaleY);
            for (let i = 1; i < points.length; i++) {
              mCtx.lineTo(points[i].x * scaleX, points[i].y * scaleY);
            }
            mCtx.stroke();
          }
        }
        mCtx.restore();

        // 3. Convert Mask Canvas to a Blob URL
        const maskBlob = await new Promise<Blob | null>(resolve => maskCanvas.toBlob(resolve, 'image/png'));
        if (!maskBlob) throw new Error("Mask blob generation failed.");
        const nextMaskUrl = URL.createObjectURL(maskBlob);

        // 4. Compose Recovered Display Frame over Keyed Base
        const composedUrl = await composeRecoveredFrame(
          frame.rawUrl,
          frame.keyedUrl,
          nextMaskUrl,
          currentColor
        );

        return { id: frameId, url: composedUrl, maskUrl: nextMaskUrl, startKeyRevision };
      },
      onSuccess: (results: any) => {
        const updates = new Map((results as any[]).map(r => [r.id, r]));
        const historyEntry = targetFrameIds.map(id => {
          const f = frames.find(frame => frame.id === id);
          return {
            frameId: id,
            undoUrl: f?.recoveredUrl,
            undoMaskUrl: f?.recoverMaskUrl,
            redoUrl: updates.get(id)?.url,
            redoMaskUrl: updates.get(id)?.maskUrl
          };
        });

        pushToHistory(historyEntry);

        setFrames(prev => prev.map(f => {
          const u = updates.get(f.id);
          if (u) {
            if (u.startKeyRevision !== f.keyRevision) {
              if (u.url) {
                try { URL.revokeObjectURL(u.url); } catch {}
              }
              if (u.maskUrl) {
                try { URL.revokeObjectURL(u.maskUrl); } catch {}
              }
              throw new Error('KEY_REVISION_CHANGED_DURING_RECOVER');
            }

            const urlsToRevoke = new Set<string>();
            if (f.recoveredUrl) urlsToRevoke.add(f.recoveredUrl);
            if (f.recoverMaskUrl) urlsToRevoke.add(f.recoverMaskUrl);

            for (const url of urlsToRevoke) {
              if (url && url !== u.url && url !== u.maskUrl && url !== f.keyedUrl) {
                try { URL.revokeObjectURL(url); } catch {}
              }
            }

            return {
              ...f,
              recoveredUrl: u.url,
              recoverMaskUrl: u.maskUrl,
              recoverBaseKeyRevision: f.keyRevision,
              recoverDirty: false
            };
          }
          return f;
        }));
      }
    });
  };

  // Live Canvas Rendering
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

      // Render Active Live Selection
      if (inputMethod === 'lasso' && lassoPoints.length > 0) {
        ctx.beginPath();
        ctx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
        for (let i = 1; i < lassoPoints.length; i++) {
          ctx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
        }
        if (!isDrawing) {
          ctx.closePath();
        }

        // Live preview colors matching tools
        if (activeOp === 'restore') ctx.strokeStyle = '#ef4444'; // Red
        else if (activeOp === 'fill') ctx.strokeStyle = '#10b981'; // Green
        else if (activeOp === 'erase') ctx.strokeStyle = '#3b82f6'; // Blue
        else ctx.strokeStyle = '#f59e0b'; // Amber (clear)

        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([5 / zoom, 5 / zoom]);
        ctx.stroke();

        if (isDrawing) {
          if (activeOp === 'restore') ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
          else if (activeOp === 'fill') ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
          else if (activeOp === 'erase') ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
          else ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
          ctx.fill();
        }
        ctx.setLineDash([]);
      }

      if (inputMethod === 'brush' && isDrawing && lassoPoints.length > 0) {
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brushSize;

        if (activeOp === 'restore') ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        else if (activeOp === 'fill') ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        else if (activeOp === 'erase') ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        else ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';

        ctx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
        for (let i = 1; i < lassoPoints.length; i++) {
          ctx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
        }
        ctx.stroke();
      }

      if (inputMethod === 'brush' && hoverPos && !isDrawing) {
        ctx.beginPath();
        ctx.arc(hoverPos.x, hoverPos.y, brushSize / 2, 0, Math.PI * 2);
        
        if (activeOp === 'restore') ctx.strokeStyle = '#ef4444';
        else if (activeOp === 'fill') ctx.strokeStyle = '#10b981';
        else if (activeOp === 'erase') ctx.strokeStyle = '#3b82f6';
        else ctx.strokeStyle = '#f59e0b';

        ctx.lineWidth = 2 / zoom;
        ctx.stroke();
        
        if (activeOp === 'restore') ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        else if (activeOp === 'fill') ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        else if (activeOp === 'erase') ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
        else ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.fill();
      }
    };

    const sourceUrl = getFrameDisplayUrl(frame, 'final');

    if (imageCache.current.has(sourceUrl)) {
      drawImageToCanvas(imageCache.current.get(sourceUrl)!);
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageCache.current.set(sourceUrl, img);
        drawImageToCanvas(img);
      };
      img.src = sourceUrl;
    }
  }, [currentFrameId, frames, canvasWidth, canvasHeight, activeOp, inputMethod, lassoPoints, isDrawing, zoom, hoverPos, brushSize]);

  useEffect(() => {
    drawFrame();
  }, [drawFrame]);

  // Touch & Mouse Event Handlers
  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return hoverPos || { x: 0, y: 0 };
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

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!currentFrameId || !canvasRef.current) return;
    const pos = getMousePos(e);
    setIsDrawing(true);
    setLassoPoints([pos]);
    setHoverPos(pos);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getMousePos(e);
    setHoverPos(pos);

    if (!isDrawing) return;

    setLassoPoints(prev => [...prev, pos]);
  };

  const handlePointerUp = async () => {
    if (!isDrawing || !currentFrameId) return;
    setIsDrawing(false);

    let targetFrames = selectedFrames.has(currentFrameId) ? Array.from(selectedFrames) : [currentFrameId];
    setIsProcessing(true);

    try {
      await performBatchRecover(targetFrames, activeOp, inputMethod, lassoPoints, brushSize, fillColor);
      setLastAction({
        op: activeOp,
        method: inputMethod,
        points: lassoPoints,
        fillColor,
        brushSize
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      setLassoPoints([]);
    }
  };

  const handlePointerLeave = () => {
    setHoverPos(null);
    if (isDrawing) {
      handlePointerUp();
    }
  };

  // Re-apply previous action to all selected frames
  const applyToAllSelected = async () => {
    if (!lastAction) {
      alert(lang === 'KR' 
        ? "먼저 복구 편집을 1회 이상 진행한 후 눌러주세요." 
        : lang === 'EN' 
          ? "Please perform at least one recovery action first before copying." 
          : "まず、少なくとも1回の復旧アクションを実行してからコピーしてください。");
      return;
    }

    setIsProcessing(true);
    try {
      const framesToProcess = Array.from(selectedFrames).filter(id => id !== currentFrameId) as string[];
      await performBatchRecover(
        framesToProcess,
        lastAction.op,
        lastAction.method,
        lastAction.points,
        lastAction.brushSize,
        lastAction.fillColor
      );
    } catch (error) {
      console.error(error);
      alert(lang === 'KR' ? "선택된 프레임에 적용 실패." : lang === 'EN' ? "Failed to apply to all selected frames." : "適用に失敗しました。");
    } finally {
      setIsProcessing(false);
    }
  };

  // Import frames trigger
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsProcessing(true);

    const newFrames: StudioFrame[] = [];
    let loaded = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const rawUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        newFrames.push({
          id: `manual_${Date.now()}_${i}`,
          name: file.name,
          rawUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
          provenance: {
            sourceIndex: i,
            targetTimeMs: i * 100,
            captureMethod: 'image',
            sourceWidth: img.naturalWidth,
            sourceHeight: img.naturalHeight,
            outputWidth: img.naturalWidth,
            outputHeight: img.naturalHeight
          },
          keyDirty: false,
          recoverDirty: false,
          qualityFlags: []
        });

        loaded++;
        if (loaded === fileList.length) {
          setFrames(prev => {
            const updated = [...prev, ...newFrames];
            if (!currentFrameId) {
              setCurrentFrameId(newFrames[0].id);
              setSelectedFrames(new Set([newFrames[0].id]));
            }
            return updated;
          });
          setIsProcessing(false);
        }
      };
      img.src = rawUrl;
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
      if (f.rawUrl) urlsToRevoke.push(f.rawUrl);
      if (f.keyedUrl) urlsToRevoke.push(f.keyedUrl);
      if (f.recoveredUrl) urlsToRevoke.push(f.recoveredUrl);
      if (f.recoverMaskUrl) urlsToRevoke.push(f.recoverMaskUrl);
    });
    setFrames([]);
    setSelectedFrames(new Set());
    setCurrentFrameId(null);
    setHistory([]);
    setHistoryPointer(-1);
    revokeUrlsSafely(urlsToRevoke, [], []);
  };

  // ZIP Export
  const exportZip = async () => {
    if (frames.length === 0) return;
    trackEvent('Download_Asset');
    setIsProcessing(true);

    try {
      const zip = new JSZip();

      for (const frame of frames) {
        const sourceUrl = getFrameDisplayUrl(frame, 'final');
        if (!sourceUrl) {
          throw new Error(`FINAL_FRAME_UNAVAILABLE:${frame.id}`);
        }
        const blob = await fetchPngBlobStrict(sourceUrl);

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
      console.error(error);
      alert(lang === 'KR' ? "ZIP 파일 내보내기 실패." : lang === 'EN' ? "Failed to export ZIP file." : "ZIPエクスポート失敗。");
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
    <div id="recover_page_root" className={`h-full min-h-0 overflow-y-auto w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col ${textPrimary}`}>
      
      {/* Header */}
      <header className={`hidden lg:flex mb-8 border-b pb-6 shrink-0 justify-between items-end ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">RECOVER <span className={`${textMuted} text-xl font-normal`}>{lang === 'KR' ? '(정밀 복구)' : lang === 'EN' ? '(Precision Recovery)' : '(精密復旧)'}</span></h1>
          <p className={`${textSecondary} mt-2 text-sm`}>{lang === 'KR' ? '비파괴 마스크 브러시로 크로마 왜곡 극복 및 원본 정밀 복원' : lang === 'EN' ? 'Defeat chroma distortions & restore original details with non-destructive paint masks' : '非破壊ペイントマスクによる精密ディテール復元'}</p>
          {frames.length > 0 && (
            <p className="mt-2 text-xs font-medium text-emerald-500">
              {lang === 'KR' ? `Remove 탭에서 ${frames.length}개의 프레임이 공유되었습니다.` : `Linked with Remove: ${frames.length} frames imported.`}
            </p>
          )}
        </div>
        
        {frames.length > 0 && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center rounded-lg p-1 mr-4 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
              <button 
                id="recover_undo_btn"
                onClick={handleUndo}
                disabled={historyPointer < 0}
                className={`p-1.5 rounded-md transition-colors disabled:opacity-30 ${theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-white text-gray-900 bg-transparent'}`}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button 
                id="recover_redo_btn"
                onClick={handleRedo}
                disabled={historyPointer >= history.length - 1}
                className={`p-1.5 rounded-md transition-colors disabled:opacity-30 ${theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-white text-gray-900 bg-transparent'}`}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
            <button 
              id="recover_clear_btn"
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
        
        {/* Empty State / Upload Sequence */}
        {frames.length === 0 && (
          <div className="w-full flex flex-col items-center justify-center flex-1 lg:hidden">
            <div className={`w-full max-w-md border rounded-2xl p-6 ${panelBg}`}>
              <h2 className="text-lg font-medium mb-2 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" />
                {lang === 'KR' ? '시퀀스 업로드' : 'Upload Sequence'}
              </h2>
              <p className="text-xs text-amber-500 mb-4 text-center">
                {lang === 'KR' ? '새 이미지를 올리면 현재 데이터가 초기화됩니다.' : 'Uploading raw images resets current session.'}
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
                <div className="flex flex-col items-center justify-center pointer-events-none text-center">
                  <Upload className="w-8 h-8 mb-2 text-blue-500" />
                  <p className="text-sm px-4">{lang === 'KR' ? '클릭하거나 이미지 시퀀스 드래그' : 'Click or drag sequences here'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Controls */}
        <div className={`order-2 w-full lg:w-80 shrink-0 lg:overflow-y-auto lg:pr-2 custom-scrollbar lg:order-1 ${frames.length === 0 ? 'hidden lg:flex lg:flex-col lg:space-y-6' : 'contents lg:flex lg:flex-col lg:space-y-6'}`}>
          
          {/* File Upload Trigger (Desktop only) */}
          <div className="hidden lg:block order-1">
            <div 
              className={`relative flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl transition-all ${
                isDragging ? 'border-blue-500 bg-blue-500/10' : theme === 'dark' ? 'border-white/15 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-50'
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
              <Upload className="w-6 h-6 mb-2 text-blue-500" />
              <p className="text-xs px-2 text-center text-gray-500">{lang === 'KR' ? '클릭하여 이미지 파일 수동 업로드' : 'Click to manually upload raw sequence'}</p>
            </div>
          </div>

          {/* Recover Action Select (P0-H) */}
          <div className={`order-2 border rounded-2xl p-5 space-y-4 ${panelBg}`}>
            <div>
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5 text-blue-500">
                <Paintbrush className="w-4 h-4" />
                {lang === 'KR' ? '복구 모드 선택' : lang === 'EN' ? 'Recovery Action' : '復旧モード選択'}
              </h3>
              <p className={`text-[11px] ${textSecondary}`}>
                {lang === 'KR' ? '마우스/터치 브러시나 올가미로 영역을 지정해 적용할 규칙:' : 'Select custom repair rules applied to drew areas:'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {/* Restore Original */}
              <button
                id="op_restore_btn"
                onClick={() => { setActiveOp('restore'); if (activeOp !== 'restore') trackEvent('Set_Tool_Restore'); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  activeOp === 'restore'
                    ? 'bg-red-500/15 border-red-500/50 text-red-600 dark:text-red-400 shadow-sm'
                    : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <div className="text-left">
                  <p className="font-semibold">{lang === 'KR' ? 'Restore Original (원본 복구)' : lang === 'EN' ? 'Restore Original' : 'オリジナル復元'}</p>
                  <p className="text-[10px] opacity-75 font-normal">{lang === 'KR' ? '원래 배경의 픽셀 색상과 반투명 복원' : 'Reverts RGB colors to raw frame with 100% alpha'}</p>
                </div>
              </button>

              {/* Color Fill */}
              <button
                id="op_fill_btn"
                onClick={() => { setActiveOp('fill'); if (activeOp !== 'fill') trackEvent('Set_Tool_Fill'); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  activeOp === 'fill'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div className="text-left">
                  <p className="font-semibold">{lang === 'KR' ? 'Color Fill (단색 채우기)' : lang === 'EN' ? 'Color Fill' : '単色塗りつぶし'}</p>
                  <p className="text-[10px] opacity-75 font-normal">{lang === 'KR' ? '선택 영역을 아래 솔리드 컬러로 덮어씌움' : 'Overrides alpha to 1.0 and paints solid color'}</p>
                </div>
              </button>

              {/* Erase */}
              <button
                id="op_erase_btn"
                onClick={() => { setActiveOp('erase'); if (activeOp !== 'erase') trackEvent('Set_Tool_Erase'); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  activeOp === 'erase'
                    ? 'bg-blue-500/15 border-blue-500/50 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <div className="text-left">
                  <p className="font-semibold">{lang === 'KR' ? 'Erase (완전 투명 지우기)' : lang === 'EN' ? 'Erase Transparency' : '完全に消去(透明)'}</p>
                  <p className="text-[10px] opacity-75 font-normal">{lang === 'KR' ? '선택한 가두리나 잔여 영역을 투명하게 지움' : 'Clears selected areas to 0.0 alpha'}</p>
                </div>
              </button>

              {/* Clear Mask Brush */}
              <button
                id="op_clear_mask_btn"
                onClick={() => { setActiveOp('clear_mask'); if (activeOp !== 'clear_mask') trackEvent('Set_Tool_Clear_Mask'); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  activeOp === 'clear_mask'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <Eraser className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <div className="text-left">
                  <p className="font-semibold">{lang === 'KR' ? 'Erase Edits (그린 부분 지우기)' : lang === 'EN' ? 'Erase Recovery Edits' : '編集ブラシ消去'}</p>
                  <p className="text-[10px] opacity-75 font-normal">{lang === 'KR' ? '그려진 마스크를 부분적으로 원상 복원' : 'Wipes out painted recovery to match keyed base'}</p>
                </div>
              </button>
            </div>

            {/* Input Method selection */}
            <div className="border-t pt-3">
              <label className={`block text-[10px] ${textMuted} mb-2 uppercase tracking-tighter font-medium`}>{lang === 'KR' ? '그리기 방식 (Input Method)' : 'Input Method'}</label>
              <div className="flex gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-black/40 border dark:border-white/5">
                <button
                  id="method_brush_btn"
                  onClick={() => setInputMethod('brush')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                    inputMethod === 'brush'
                      ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-white/50 hover:text-gray-700'
                  }`}
                >
                  <Paintbrush className="w-3.5 h-3.5" />
                  {lang === 'KR' ? '브러시' : 'Brush'}
                </button>
                <button
                  id="method_lasso_btn"
                  onClick={() => setInputMethod('lasso')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                    inputMethod === 'lasso'
                      ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-white/50 hover:text-gray-700'
                  }`}
                >
                  <SquareDashed className="w-3.5 h-3.5" />
                  {lang === 'KR' ? '올가미' : 'Lasso'}
                </button>
              </div>
            </div>
          </div>

          {/* Color & Size parameters */}
          <div className={`order-3 border rounded-2xl p-5 space-y-4 ${panelBg}`}>
            {activeOp === 'fill' && (
              <div>
                <label className={`block text-[10px] ${textMuted} mb-2 uppercase tracking-tighter font-medium`}>{lang === 'KR' ? '채우기 색상' : 'Solid Color'}</label>
                <div className="flex gap-2">
                  <input 
                    id="recover_color_picker"
                    type="color" 
                    value={fillColor}
                    onChange={(e) => setFillColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0 overflow-hidden"
                  />
                  <input 
                    id="recover_color_text"
                    type="text" 
                    value={fillColor}
                    onChange={(e) => setFillColor(e.target.value)}
                    className={`flex-1 border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500/50 ${inputBg}`}
                  />
                </div>
              </div>
            )}

            {inputMethod === 'brush' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`text-[10px] ${textMuted} uppercase tracking-tighter font-medium`}>{lang === 'KR' ? '브러시 크기' : 'Brush Size'}</label>
                  <span className="text-xs font-mono font-semibold text-blue-500">{brushSize}px</span>
                </div>
                <input 
                  id="recover_size_range"
                  type="range" 
                  min="2" 
                  max="120" 
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer bg-gray-200 dark:bg-white/10 h-1 rounded-lg appearance-none"
                />
              </div>
            )}

            {/* Batch copy trigger */}
            <button 
              id="recover_batch_apply_btn"
              onClick={applyToAllSelected}
              className={`w-full border font-semibold py-3 rounded-xl text-xs transition-all flex flex-col items-center justify-center gap-0.5 ${
                theme === 'dark'
                  ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200'
              }`}
            >
              <span>{lang === 'KR' ? '이 복구 작업을 선택된 모든 프레임에 적용' : 'Apply Recovery Action to Selected Frames'}</span>
              <span className="text-[10px] opacity-80 font-normal">{lang === 'KR' ? '(다중 프레임 일괄 일관성 유지)' : '(Apply to all selected in filmstrip)'}</span>
            </button>
          </div>

          {/* Manual resolution panel */}
          <div className={`order-4 border rounded-2xl p-5 ${panelBg}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-xs font-semibold ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>{lang === 'KR' ? '수동 에디터 해상도 조정' : 'Manual Canvas Dimensions'}</h3>
              <input 
                id="recover_manual_size_toggle"
                type="checkbox" 
                checked={manualCanvasSize}
                onChange={(e) => setManualCanvasSize(e.target.checked)}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`block text-[9px] ${textMuted} mb-1 uppercase tracking-tighter`}>{lang === 'KR' ? '가로 폭' : 'Width'}</label>
                <input 
                  id="recover_width_input"
                  type="number" 
                  value={canvasWidth}
                  onChange={(e) => setCanvasWidth(Number(e.target.value))}
                  readOnly={!manualCanvasSize}
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500/50 ${inputBg} ${!manualCanvasSize ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className={`block text-[9px] ${textMuted} mb-1 uppercase tracking-tighter`}>{lang === 'KR' ? '세로 높이' : 'Height'}</label>
                <input 
                  id="recover_height_input"
                  type="number" 
                  value={canvasHeight}
                  onChange={(e) => setCanvasHeight(Number(e.target.value))}
                  readOnly={!manualCanvasSize}
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500/50 ${inputBg} ${!manualCanvasSize ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Main download export btn */}
          <button 
            id="recover_export_zip_btn"
            onClick={exportZip}
            disabled={frames.length === 0 || isProcessing}
            className={`order-5 mb-24 lg:mb-0 w-full font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-white/10 disabled:to-white/10 disabled:text-white/40 text-white shadow-blue-500/20'
                : 'bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white shadow-gray-900/20'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {lang === 'KR' ? 'EXPORT ZIP (복구 파일 저장)' : lang === 'EN' ? 'EXPORT RECOVERED ZIP' : '復旧ファイルを保存'}
          </button>
        </div>

        {/* Canvas & Filmstrip View */}
        <div className={`order-1 w-full lg:flex-1 flex flex-col min-w-0 border-b lg:border-none overflow-hidden lg:overflow-visible ${panelBg} lg:bg-transparent lg:order-2 ${frames.length > 0 ? 'pb-2 lg:pb-0 pt-2 lg:pt-0' : 'hidden lg:flex'}`}>
          <div className="sticky top-0 z-40 w-full bg-inherit flex-1 flex flex-col min-h-0">
            
            {/* Canvas Sub-Header */}
            <div className={`h-auto lg:h-14 shrink-0 flex flex-col lg:flex-row items-center justify-between p-2 lg:px-4 gap-3 lg:gap-2 ${theme === 'dark' ? 'bg-black/20' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between lg:justify-start gap-2 w-full lg:w-auto">
                <div className="flex items-center gap-1.5 lg:gap-3 w-full lg:w-auto justify-between lg:justify-center">
                  <span className={`text-[10px] lg:text-xs font-mono px-2 py-1 rounded-md ${theme === 'dark' ? 'bg-white/10 text-white/70' : 'bg-gray-200 text-gray-700'}`}>
                    {frames.length > 0 ? `${frames.findIndex(f => f.id === currentFrameId) + 1} / ${frames.length}` : '0 frames'}
                  </span>
                  
                  {/* Zoom controller */}
                  <div className="flex items-center gap-1">
                    <button onClick={() => setZoom(z => Number(Math.max(0.1, z - 0.1).toFixed(2)))} className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => {
                        if (zoom === 1) fitToScreen();
                        else setZoom(1);
                      }}
                      className={`text-[10px] lg:text-xs font-mono w-14 text-center rounded-md py-1 transition-colors ${theme === 'dark' ? 'text-white/70 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                      {Math.round(zoom * 100)}%
                    </button>
                    <button onClick={() => setZoom(z => Number(Math.min(5, z + 0.1).toFixed(2)))} className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Background preview modes */}
              <div className={`flex flex-wrap items-center gap-1 p-1 rounded-xl border w-full lg:w-auto justify-center ${theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-gray-200 border-gray-300'}`}>
                {(['transparent', 'black', 'app'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setBgMode(mode)}
                    className={`flex-1 lg:flex-none px-3 py-1.5 text-[11px] font-semibold rounded-lg capitalize transition-all ${
                      bgMode === mode 
                        ? theme === 'dark' ? 'bg-white/20 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'
                        : theme === 'dark' ? 'text-white/50 hover:text-white/80' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {mode === 'app' ? 'App UI' : mode === 'transparent' ? (lang === 'KR' ? 'Transparent' : 'Transparent') : 'Black'}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Stage */}
            <div 
              ref={containerRef}
              className={`w-full flex-1 overflow-auto relative flex ${frames.length === 0 ? 'items-center' : 'items-start pt-6 lg:pt-8'} justify-center h-[23dvh] max-h-[23dvh] lg:h-auto lg:max-h-none lg:min-h-0 ${theme === 'dark' ? 'bg-[#0b0b0b]' : 'bg-gray-100'}`}
            >
              {showResolutionToast && detectedResolution && (
                <div className="absolute top-4 right-4 z-50 bg-black/85 text-white text-[10px] px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm transition-opacity">
                  {lang === 'KR' ? '감지된 원본 해상도' : 'Original Resolution'}: {detectedResolution.width} x {detectedResolution.height}
                </div>
              )}

              {frames.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto">
                  <ShieldAlert className="w-12 h-12 text-blue-500/50 mb-3" />
                  <p className="text-sm font-semibold">{lang === 'KR' ? '가져온 프레임이 없습니다.' : 'No active frames found.'}</p>
                  <p className="text-xs text-gray-400 mt-1 mb-4">{lang === 'KR' ? '먼저 Remove 화면에서 크로마 작업을 시작하거나, 이미지 시퀀스를 직접 수동 업로드해 주세요.' : 'Begin chroma key extraction in Remove page first.'}</p>
                  <button
                    onClick={() => document.dispatchEvent(new CustomEvent('navigate', { detail: 'remove' }))}
                    className="border border-blue-500/50 text-blue-500 px-5 py-2 rounded-full hover:bg-blue-500/10 transition-colors text-xs font-semibold"
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

          {/* Filmstrip Panel */}
          {frames.length > 0 && (
            <div className={`h-20 lg:h-32 border-t shrink-0 p-2 lg:p-3 overflow-x-auto flex gap-2 items-center custom-scrollbar mt-2 lg:mt-6 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
              {frames.map((frame) => {
                const isSelected = selectedFrames.has(frame.id);
                return (
                  <div 
                    key={frame.id}
                    onClick={(e) => toggleSelection(frame.id, e.ctrlKey || e.metaKey, e.shiftKey)}
                    className={`shrink-0 relative h-full aspect-[5/7] rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)] scale-95 opacity-100' 
                        : theme === 'dark'
                          ? 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'
                          : 'border-gray-200 hover:border-gray-400 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={getFrameDisplayUrl(frame, 'final')} alt={frame.name} className="w-full h-full object-contain" />
                    {frame.recoverMaskUrl && (
                      <div className="absolute top-1 right-1 bg-blue-500/90 text-white rounded p-0.5" title="Mask active">
                        <Eye className="w-2.5 h-2.5" />
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 p-0.5">
                      <p className="text-[8px] text-white/80 truncate text-center font-mono">{frame.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
