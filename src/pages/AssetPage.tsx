import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { useStudio } from '../StudioContext';
import { useFFmpeg } from '../FFmpegContext';
import { Download, Film, LayoutGrid, Loader2, AlertTriangle, AlertCircle } from 'lucide-react';
import { useBatchJob } from '../hooks/useBatchJob';
import { generateStrokeMask, applyChromaKeyAdvanced } from '../utils/chromaKey';
import { PerfLogger } from '../utils/performanceLogger';

export default function AssetPage() {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const { frames, setFrames, fps, exclusionStrokes } = useStudio();
  const { ffmpeg, loadState, loadFFmpeg } = useFFmpeg();
  const { isProcessing: isBatchProcessing, progress: batchProgress, startJob, cancelJob } = useBatchJob();

  const [showDirtyModal, setShowDirtyModal] = useState(false);
  const [dirtyAction, setDirtyAction] = useState<(() => Promise<void>) | null>(null);
  const [dirtyAnywayAction, setDirtyAnywayAction] = useState<(() => Promise<void>) | null>(null);
  const [failedItems, setFailedItems] = useState<number[]>([]);

  // Video Export State
  const [isVideoProcessing, setIsVideoProcessing] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Sprite Sheet State
  const [columns, setColumns] = useState<number>(4);
  const [spacing, setSpacing] = useState<number>(0);
  const [autoCrop, setAutoCrop] = useState<boolean>(true);
  const [alphaThreshold, setAlphaThreshold] = useState<number>(10);
  const [isSpriteProcessing, setIsSpriteProcessing] = useState(false);
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null);
  const [spriteJson, setSpriteJson] = useState<string | null>(null);
  const [spriteWarning, setSpriteWarning] = useState<string | null>(null);

  const isDark = theme === 'dark';

  const processDirtyFrames = async (dirtyIndices: number[]): Promise<number[]> => {
    setFailedItems([]);
    const newFrames = [...frames];
    
    // Load config from localStorage
    const params = {
      keyingMode: (localStorage.getItem('ck_keyingMode') as any) || 'greenAdvanced',
      previewMode: 'result' as const,
      tolerance: Number(localStorage.getItem('ck_tolerance')) || 30,
      softness: Number(localStorage.getItem('ck_softness')) || 20,
      enclosedTolerance: Number(localStorage.getItem('ck_enclosedTolerance')) || 10,
      chromaKeyColor: (localStorage.getItem('ck_chromaKeyColor') as any) || 'White',
      pickedColor: JSON.parse(localStorage.getItem('ck_pickedColor') || '{"r":255,"g":255,"b":255}'),
      despill: Number(localStorage.getItem('ck_despill')) || 0,
      erode: Number(localStorage.getItem('ck_erode')) || 0,
      dilate: Number(localStorage.getItem('ck_dilate')) || 0,
      feather: Number(localStorage.getItem('ck_feather')) || 0,
      alphaContrast: Number(localStorage.getItem('ck_alphaContrast')) || 0,
    };

    return new Promise((resolve) => {
      startJob<number, void>({
        items: dirtyIndices,
        delayMs: 0,
        processItem: async (idx, resultIndex) => {
           const frame = newFrames[idx];
           const img = new Image();
           img.src = frame.rawUrl;
           await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
           
           const canvas = document.createElement('canvas');
           canvas.width = img.width;
           canvas.height = img.height;
           const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
           ctx.drawImage(img, 0, 0);
           
           const imgData = ctx.getImageData(0,0, canvas.width, canvas.height);
           const mask = generateStrokeMask(canvas.width, canvas.height, exclusionStrokes, idx);
           PerfLogger.start('AssetPage_applyChromaKeyAdvanced');
           applyChromaKeyAdvanced(imgData.data, canvas.width, canvas.height, params, mask);
           PerfLogger.end('AssetPage_applyChromaKeyAdvanced');
           ctx.putImageData(imgData, 0, 0);
           
           const blob = await new Promise<Blob|null>(resolve => canvas.toBlob(resolve, 'image/png'));
           if (blob) {
             const newUrl = URL.createObjectURL(blob);
             if (frame.processedUrl) URL.revokeObjectURL(frame.processedUrl);
             newFrames[idx] = { ...frame, processedUrl: newUrl, dirty: false };
           }
        },
        onSuccess: () => {
          setFrames(newFrames);
          resolve([]);
        },
        onPartialSuccess: (_, failed) => {
          setFrames(newFrames);
          setFailedItems(failed);
          resolve(failed);
        },
        onError: () => {
          resolve(dirtyIndices);
        }
      });
    });
  };

  const checkDirtyAndRun = (runAction: () => Promise<void>) => {
    const dirtyIndices = frames.map((f, i) => (!f.processedUrl || f.dirty) ? i : -1).filter(i => i !== -1);
    if (dirtyIndices.length > 0) {
      setDirtyAction(() => async () => {
         const failed = await processDirtyFrames(dirtyIndices);
         if (failed.length === 0) {
            runAction();
         }
      });
      setDirtyAnywayAction(() => async () => {
         runAction();
      });
      setShowDirtyModal(true);
      return;
    }
    runAction();
  };

  // --- Feature A: Transparent Video Export ---
  const executeExportVideo = async () => {
    if (frames.length === 0) return;
    
    setIsVideoProcessing(true);
    let currentFFmpeg = ffmpeg;
    if (loadState !== 'loaded' || !currentFFmpeg) {
      currentFFmpeg = await loadFFmpeg();
    }

    if (!currentFFmpeg) {
      setIsVideoProcessing(false);
      alert(lang === 'KR' ? "비디오 엔진 로딩에 실패했습니다." : "Failed to load video engine.");
      return;
    }
    
    setVideoProgress(0);
    setVideoUrl(null);

    try {
      // Write frames to FFmpeg FS
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const url = frame.processedUrl ?? frame.rawUrl;
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        await currentFFmpeg.writeFile(`frame_${i.toString().padStart(4, '0')}.png`, new Uint8Array(buffer));
      }

      currentFFmpeg.on('progress', ({ progress }) => {
        setVideoProgress(Math.round(progress * 100));
      });

      // Encode to WebM with alpha channel
      // -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0
      await currentFFmpeg.exec([
        '-framerate', fps.toString(),
        '-i', 'frame_%04d.png',
        '-c:v', 'libvpx-vp9',
        '-pix_fmt', 'yuva420p',
        '-auto-alt-ref', '0',
        '-b:v', '2M',
        'output.webm'
      ]);

      const data = await currentFFmpeg.readFile('output.webm');
      const blob = new Blob([data], { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);

      // Cleanup
      for (let i = 0; i < frames.length; i++) {
        await currentFFmpeg.deleteFile(`frame_${i.toString().padStart(4, '0')}.png`);
      }
      await currentFFmpeg.deleteFile('output.webm');
    } catch (error) {
      console.error('Video export failed:', error);
    } finally {
      setIsVideoProcessing(false);
      setVideoProgress(0);
    }
  };

  const handleExportVideo = () => checkDirtyAndRun(executeExportVideo);

  // --- Feature B: Sprite Sheet Generator ---
  const executeExportSprite = async () => {
    if (frames.length === 0) return;
    
    setIsSpriteProcessing(true);
    setSpriteUrl(null);
    setSpriteJson(null);
    setSpriteWarning(null);

    try {
      // Load all images
      const images = await Promise.all(frames.map(frame => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = frame.processedUrl ?? frame.rawUrl;
        });
      }));

      let frameWidths = images.map(img => img.width);
      let frameHeights = images.map(img => img.height);
      let cropBoxes = images.map(img => ({ x: 0, y: 0, w: img.width, h: img.height }));

      if (autoCrop) {
        // Calculate bounding box for each frame
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        
        if (tempCtx) {
          cropBoxes = images.map(img => {
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            tempCtx.clearRect(0, 0, img.width, img.height);
            tempCtx.drawImage(img, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;
            
            let minX = img.width, minY = img.height, maxX = 0, maxY = 0;
            let hasPixel = false;

            for (let y = 0; y < img.height; y++) {
              for (let x = 0; x < img.width; x++) {
                const alpha = data[(y * img.width + x) * 4 + 3];
                if (alpha > alphaThreshold) {
                  hasPixel = true;
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                }
              }
            }

            if (!hasPixel) return { x: 0, y: 0, w: 1, h: 1 }; // Empty frame fallback

            return {
              x: minX,
              y: minY,
              w: maxX - minX + 1,
              h: maxY - minY + 1
            };
          });
        }
      }

      // Find max width and height among all (cropped or uncropped) frames
      const maxWidth = Math.max(...cropBoxes.map(b => b.w));
      const maxHeight = Math.max(...cropBoxes.map(b => b.h));

      const cols = Math.min(columns, frames.length);
      const rows = Math.ceil(frames.length / cols);

      const finalWidth = cols * maxWidth + (cols + 1) * spacing;
      const finalHeight = rows * maxHeight + (rows + 1) * spacing;
      
      const metadata = {
        frames: [] as Array<{
          name: string;
          x: number;
          y: number;
          w: number;
          h: number;
          sourceX?: number;
          sourceY?: number;
          sourceW?: number;
          sourceH?: number;
        }>,
        meta: {
          fps,
          columns: cols,
          rows,
          spacing,
          width: finalWidth,
          height: finalHeight
        }
      };

      if (finalWidth > 8192 || finalHeight > 8192) {
        setSpriteWarning(lang === 'KR' ? '경고: 캔버스 크기가 8192px를 초과하여 일부 브라우저에서 깨질 수 있습니다.' : lang === 'EN' ? 'Warning: Canvas size exceeds 8192px, which may cause rendering issues in some browsers.' : '警告: キャンバスサイズが8192pxを超えているため、一部のブラウザで表示が崩れる可能性があります。');
      }

      const canvas = document.createElement('canvas');
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.clearRect(0, 0, finalWidth, finalHeight);

        images.forEach((img, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const box = cropBoxes[index];

          const dx = spacing + col * (maxWidth + spacing) + (maxWidth - box.w) / 2;
          const dy = spacing + row * (maxHeight + spacing) + (maxHeight - box.h) / 2;

          ctx.drawImage(img, box.x, box.y, box.w, box.h, dx, dy, box.w, box.h);
          
          metadata.frames.push({
            name: frames[index].name || `frame_${index.toString().padStart(4, '0')}`,
            x: Math.floor(dx),
            y: Math.floor(dy),
            w: box.w,
            h: box.h,
            sourceX: box.x,
            sourceY: box.y,
            sourceW: box.w,
            sourceH: box.h
          });
        });

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setSpriteUrl(url);
            
            const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
            setSpriteJson(URL.createObjectURL(jsonBlob));
          }
          setIsSpriteProcessing(false);
          // Free memory
          canvas.width = 0;
          canvas.height = 0;
        }, 'image/png');
      } else {
        setIsSpriteProcessing(false);
      }
    } catch (error) {
      console.error('Sprite generation failed:', error);
      setIsSpriteProcessing(false);
    }
  };

  const handleExportSprite = () => checkDirtyAndRun(executeExportSprite);

  return (
    <div className={`flex-1 overflow-y-auto p-4 lg:p-8 ${isDark ? 'bg-[#121212] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">ASSET</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-500'}`}>
            {lang === 'KR' ? (
              <>추출된 프레임을 전문적인 게임/영상<br />에셋으로 변환하세요.</>
            ) : lang === 'EN' ? (
              'Convert extracted frames into professional game/video assets.'
            ) : (
              '抽出されたフレームをプロフェッショナルなゲーム/映像アセットに変換します。'
            )}
          </p>
          {frames.length > 0 && (
            <p className="mt-3 text-sm font-medium text-blue-500 flex flex-wrap gap-4 items-center">
              <span>{lang === 'KR' ? `공유된 ${frames.length} 프레임으로 에셋을 만듭니다.` : `Creating assets from ${frames.length} shared frames.`}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-600'}`}>
                {lang === 'KR' ? '처리됨:' : 'Processed:'} {frames.filter(f => f.processedUrl && !f.dirty).length} / {frames.length}
              </span>
              {frames.some(f => !f.processedUrl || f.dirty) && (
                <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-semibold flex items-center gap-1 border border-yellow-500/30">
                  <AlertTriangle className="w-3 h-3" />
                  {lang === 'KR' ? '미적용 프레임:' : 'Unprocessed:'} {frames.filter(f => !f.processedUrl || f.dirty).length}
                </span>
              )}
            </p>
          )}
        </header>

        {frames.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl border border-dashed ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-white'} flex flex-col items-center justify-center space-y-4`}>
            <p className={`text-lg ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
              {lang === 'KR' ? '먼저 REMOVE 탭에서 프레임을 추출해주세요.' : lang === 'EN' ? 'Please extract frames in the REMOVE tab first.' : 'まずREMOVEタブでフレームを抽出してください。'}
            </p>
            <button
               onClick={() => document.dispatchEvent(new CustomEvent('navigate', { detail: 'remove' }))}
               className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition-colors shadow-lg"
            >
              {lang === 'KR' ? 'Remove 화면으로 이동' : 'Start from Remove'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Transparent Video Export */}
            <div className={`p-6 rounded-2xl border shadow-sm flex flex-col ${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <Film className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{lang === 'KR' ? '투명 비디오 내보내기' : lang === 'EN' ? 'Transparent Video Export' : '透明ビデオエクスポート'}</h2>
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>WebM (VP9 + Alpha)</p>
                </div>
              </div>
              
              <div className={`flex-1 mb-6 text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                {lang === 'KR' ? '현재 프레임들을 결합하여 배경이 투명한 동영상 파일(.webm)을 생성합니다. 웹사이트나 영상 편집기에서 바로 사용할 수 있습니다.' : lang === 'EN' ? 'Combines current frames to create a video file (.webm) with a transparent background. Ready to use in websites or video editors.' : '現在のフレームを結合して、背景が透明な動画ファイル(.webm)を作成します。ウェブサイトや動画編集ソフトですぐに使用できます。'}
              </div>

              <div className="mt-auto space-y-4">
                {isVideoProcessing ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{lang === 'KR' ? '인코딩 중...' : lang === 'EN' ? 'Encoding...' : 'エンコード中...'}</span>
                      <span>{videoProgress}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                      <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${videoProgress}%` }} />
                    </div>
                  </div>
                ) : videoUrl ? (
                  <a 
                    href={videoUrl} 
                    download="bananacut_transparent.webm"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Download className="w-5 h-5" />
                    {lang === 'KR' ? 'WebM 다운로드' : lang === 'EN' ? 'Download WebM' : 'WebM ダウンロード'}
                  </a>
                ) : (
                  <button 
                    onClick={handleExportVideo}
                    disabled={loadState === 'loading'}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${loadState !== 'loading' ? 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  >
                    {loadState === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
                    {lang === 'KR' ? '비디오 생성 시작' : lang === 'EN' ? 'Start Video Generation' : 'ビデオ生成開始'}
                  </button>
                )}
              </div>
            </div>

            {/* 2. Sprite Sheet Generator */}
            <div className={`p-6 rounded-2xl border shadow-sm flex flex-col ${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                  <LayoutGrid className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{lang === 'KR' ? '스프라이트 시트 생성' : lang === 'EN' ? 'Sprite Sheet Generator' : 'スプライトシート生成'}</h2>
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>PNG Atlas</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                    {lang === 'KR' ? '가로 칸수 (Columns)' : lang === 'EN' ? 'Columns' : '列数 (Columns)'}
                  </label>
                  <select 
                    value={columns} 
                    onChange={(e) => setColumns(Number(e.target.value))}
                    className={`w-full p-2 rounded-lg border text-sm ${isDark ? 'bg-[#121212] border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value={4}>4</option>
                    <option value={8}>8</option>
                    <option value={10}>10</option>
                    <option value={16}>16</option>
                    <option value={frames.length}>{lang === 'KR' ? '한 줄로 (All in one row)' : lang === 'EN' ? 'All in one row' : '1行にすべて'}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                    {lang === 'KR' ? '간격 (Spacing px)' : lang === 'EN' ? 'Spacing (px)' : '間隔 (Spacing px)'}
                  </label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={spacing} 
                    onChange={(e) => setSpacing(Number(e.target.value))}
                    className={`w-full p-2 rounded-lg border text-sm ${isDark ? 'bg-[#121212] border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoCrop} 
                    onChange={(e) => setAutoCrop(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                  />
                  <span className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                    {lang === 'KR' ? 'Auto-Crop (투명 여백 자동 제거)' : lang === 'EN' ? 'Auto-Crop (Trim transparent edges)' : 'Auto-Crop (透明な余白を自動削除)'}
                  </span>
                </label>
                
                {autoCrop && (
                  <div className="pl-6">
                    <div className="flex justify-between items-center mb-1">
                      <label className={`text-xs font-medium ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                        {lang === 'KR' ? '알파 임계값 (Alpha Threshold)' : lang === 'EN' ? 'Alpha Threshold' : 'アルファしきい値'}
                      </label>
                      <span className={`text-xs font-mono ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{alphaThreshold}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="255" 
                      value={alphaThreshold}
                      onChange={(e) => setAlphaThreshold(Number(e.target.value))}
                      className="w-full accent-green-500"
                    />
                  </div>
                )}
              </div>

              {spriteWarning && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2 text-yellow-600 dark:text-yellow-500 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{spriteWarning}</p>
                </div>
              )}

              <div className="mt-auto space-y-4">
                {isSpriteProcessing ? (
                  <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-white/50">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {lang === 'KR' ? '처리 중...' : lang === 'EN' ? 'Processing...' : '処理中...'}
                  </div>
                ) : spriteUrl ? (
                  <div className="flex flex-col gap-2">
                    <a 
                      href={spriteUrl} 
                      download="bananacut_spritesheet.png"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all bg-green-600 text-white hover:bg-green-700"
                    >
                      <Download className="w-5 h-5" />
                      {lang === 'KR' ? 'PNG 다운로드' : lang === 'EN' ? 'Download PNG' : 'PNG ダウンロード'}
                    </a>
                    {spriteJson && (
                      <a 
                        href={spriteJson} 
                        download="bananacut_spritesheet.json"
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${isDark ? 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                      >
                        <Download className="w-5 h-5" />
                        {lang === 'KR' ? 'JSON (메타데이터) 다운로드' : lang === 'EN' ? 'Download JSON (Metadata)' : 'JSON ダウンロード'}
                      </a>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={handleExportSprite}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200`}
                  >
                    {lang === 'KR' ? '시트 생성 시작' : lang === 'EN' ? 'Start Sheet Generation' : 'シート生成開始'}
                  </button>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Dirty Frames Modal */}
      {showDirtyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`p-6 rounded-2xl max-w-sm w-full mx-auto shadow-2xl relative ${isDark ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'}`}>
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              {lang === 'KR' ? '미적용 프레임 확인' : lang === 'EN' ? 'Unprocessed Frames' : '未適用フレームの確認'}
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
              {lang === 'KR' 
                ? '크로마키가 적용되지 않은(dirty) 프레임이 있습니다. 다운로드 전에 모든 프레임에 설정을 렌더링해야 합니다.'
                : lang === 'EN'
                ? 'There are unprocessed (dirty) frames. All frames must be rendered with your settings before exporting.'
                : 'クロマキーが適用されていない(dirty)フレームがあります。ダウンロードする前に、すべてのフレームに設定をレンダリングする必要があります。'}
            </p>

            {isBatchProcessing ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>{lang === 'KR' ? '렌더링 중...' : lang === 'EN' ? 'Rendering...' : 'レンダリング中...'}</span>
                  <span>{batchProgress}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${batchProgress}%` }} />
                </div>
                {failedItems.length > 0 && (
                  <p className="text-xs text-red-500">Failed frames: {failedItems.join(', ')}</p>
                )}
                <button
                  onClick={cancelJob}
                  className="w-full mt-2 py-2.5 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/5 active:bg-gray-200 dark:active:bg-white/10"
                >
                  {lang === 'KR' ? '작업 취소' : lang === 'EN' ? 'Cancel Job' : 'キャンセル'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={async () => {
                    if (dirtyAction) {
                       await dirtyAction();
                       setShowDirtyModal(false);
                    }
                  }}
                  className={`w-full py-2.5 rounded-xl font-medium transition-colors ${
                    isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {lang === 'KR' ? 'Process Dirty Frames (적용 및 계속)' : lang === 'EN' ? 'Process Dirty Frames' : '適用して続行'}
                </button>
                <div className="flex gap-3">
                  <button 
                    onClick={async () => {
                      if (dirtyAnywayAction) {
                         await dirtyAnywayAction();
                         setShowDirtyModal(false);
                      }
                    }}
                    className={`flex-1 py-2.5 rounded-xl font-medium transition-colors border ${
                      isDark ? 'border-white/20 hover:bg-white/10 text-white' : 'border-gray-200 hover:bg-gray-50 text-gray-900'
                    }`}
                  >
                    {lang === 'KR' ? 'Export Anyway (무시)' : lang === 'EN' ? 'Export Anyway' : '無視してエクスポート'}
                  </button>
                  <button 
                    onClick={() => {
                      setShowDirtyModal(false);
                      setDirtyAction(null);
                    }}
                    className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${
                      isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    {lang === 'KR' ? 'Cancel (취소)' : lang === 'EN' ? 'Cancel' : 'キャンセル'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
