import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { useStudio } from '../StudioContext';
import { useFFmpeg } from '../FFmpegContext';
import { Download, Film, LayoutGrid, Loader2, AlertTriangle } from 'lucide-react';

export default function AssetPage() {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const { frames, setShowSuccessModal } = useStudio();
  const { ffmpeg, isLoaded: isFFmpegLoaded } = useFFmpeg();

  // Video Export State
  const [isVideoProcessing, setIsVideoProcessing] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Sprite Sheet State
  const [columns, setColumns] = useState<number>(4);
  const [spacing, setSpacing] = useState<number>(0);
  const [autoCrop, setAutoCrop] = useState<boolean>(true);
  const [isSpriteProcessing, setIsSpriteProcessing] = useState(false);
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null);
  const [spriteWarning, setSpriteWarning] = useState<string | null>(null);

  const isDark = theme === 'dark';

  // --- Feature A: Transparent Video Export ---
  const handleExportVideo = async () => {
    if (!ffmpeg || !isFFmpegLoaded || frames.length === 0) return;
    
    setIsVideoProcessing(true);
    setVideoProgress(0);
    setVideoUrl(null);

    try {
      // Write frames to FFmpeg FS
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const url = frame.modifiedDataUrl || frame.url;
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        await ffmpeg.writeFile(`frame_${i.toString().padStart(4, '0')}.png`, new Uint8Array(buffer));
      }

      ffmpeg.on('progress', ({ progress }) => {
        setVideoProgress(Math.round(progress * 100));
      });

      // Encode to WebM with alpha channel
      // -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0
      await ffmpeg.exec([
        '-framerate', '30',
        '-i', 'frame_%04d.png',
        '-c:v', 'libvpx-vp9',
        '-pix_fmt', 'yuva420p',
        '-auto-alt-ref', '0',
        '-b:v', '2M',
        'output.webm'
      ]);

      const data = await ffmpeg.readFile('output.webm');
      const blob = new Blob([data], { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);

      // Cleanup
      for (let i = 0; i < frames.length; i++) {
        await ffmpeg.deleteFile(`frame_${i.toString().padStart(4, '0')}.png`);
      }
      await ffmpeg.deleteFile('output.webm');
    } catch (error) {
      console.error('Video export failed:', error);
    } finally {
      setIsVideoProcessing(false);
      setVideoProgress(0);
    }
  };

  // --- Feature B: Sprite Sheet Generator ---
  const handleExportSprite = async () => {
    if (frames.length === 0) return;
    
    setIsSpriteProcessing(true);
    setSpriteUrl(null);
    setSpriteWarning(null);

    try {
      // Load all images
      const images = await Promise.all(frames.map(frame => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = frame.modifiedDataUrl || frame.url;
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
                if (alpha > 0) {
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
        });

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setSpriteUrl(url);
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
        </header>

        {frames.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl border border-dashed ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-white'}`}>
            <p className={`text-lg ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
              {lang === 'KR' ? '먼저 REMOVE 탭에서 프레임을 추출해주세요.' : lang === 'EN' ? 'Please extract frames in the REMOVE tab first.' : 'まずREMOVEタブでフレームを抽出してください。'}
            </p>
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
                    onClick={() => setShowSuccessModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Download className="w-5 h-5" />
                    {lang === 'KR' ? 'WebM 다운로드' : lang === 'EN' ? 'Download WebM' : 'WebM ダウンロード'}
                  </a>
                ) : (
                  <button 
                    onClick={handleExportVideo}
                    disabled={!isFFmpegLoaded}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${isFFmpegLoaded ? 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  >
                    {!isFFmpegLoaded && <Loader2 className="w-5 h-5 animate-spin" />}
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
                  <a 
                    href={spriteUrl} 
                    download="bananacut_spritesheet.png"
                    onClick={() => setShowSuccessModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all bg-green-600 text-white hover:bg-green-700"
                  >
                    <Download className="w-5 h-5" />
                    {lang === 'KR' ? 'PNG 다운로드' : lang === 'EN' ? 'Download PNG' : 'PNG ダウンロード'}
                  </a>
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
    </div>
  );
}
