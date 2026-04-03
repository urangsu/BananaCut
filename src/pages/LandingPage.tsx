import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { useTheme } from '../ThemeContext';
import { Scissors, Wand2, Download, Smartphone } from 'lucide-react';
import { Modal } from '../components/Modal';

function ScratchOverlay({ isDark, lang, onReveal }: { isDark: boolean, lang: string, onReveal: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const isDrawing = useRef(false);
  const lastPos = useRef<{x: number, y: number} | null>(null);

  const hintText = lang === 'KR' ? '문질러서 확인해보세요!' : lang === 'EN' ? 'Erase to Reveal the Magic' : 'こすって魔法を確認してみてください！';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const initCanvas = () => {
      if (hasStarted) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.fillStyle = isDark ? '#121212' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, [isDark, hasStarted]);

  const getPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDrawing.current = true;
    if (!hasStarted) setHasStarted(true);
    lastPos.current = getPos(e);
    draw(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current) return;
    draw(e);
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
    lastPos.current = null;
    checkReveal();
  };

  const draw = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !lastPos.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getPos(e);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.min(window.innerWidth * 0.15, 120);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    lastPos.current = currentPos;
  };

  const checkReveal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stride = 10;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let erased = 0;
    let total = 0;

    for (let i = 3; i < data.length; i += 4 * stride) {
      total++;
      if (data[i] === 0) erased++;
    }

    if (erased / total > 0.30) {
      onReveal();
    }
  };

  return (
    <div className="absolute inset-0 touch-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${hasStarted ? 'opacity-0' : 'opacity-100'}`}>
        <p className={`text-2xl md:text-4xl font-bold tracking-tight animate-pulse ${isDark ? 'text-white' : 'text-black'}`}>
          {hintText}
        </p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [lang, setLang] = useState<'KR' | 'EN' | 'JP'>('KR');
  const [showGetApp, setShowGetApp] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <header className={`relative z-50 flex items-center justify-between p-6 border-b ${isDark ? 'bg-[#121212] border-white/10' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col">
          <div className="text-2xl font-bold tracking-tighter">BananaCut</div>
          <div className={`text-[10px] font-medium tracking-widest uppercase mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>By. Dalgrac Studio</div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 p-1 rounded-full border bg-white/50 dark:bg-black/50 backdrop-blur-md border-gray-200 dark:border-white/10">
            {(['KR', 'EN', 'JP'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium rounded-full transition-all ${
                  lang === l 
                    ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                    : (isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-black')
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setShowGetApp(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all bg-black text-white hover:bg-gray-800 shadow-lg"
            >
              <Smartphone className="w-4 h-4" strokeWidth={1} />
              GET APP
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-1 md:gap-4">
            <button 
              onClick={() => navigate('/remove')}
              className="px-3 md:px-6 py-1.5 md:py-2 rounded-full text-[10px] md:text-sm font-bold transition-all bg-black text-white hover:bg-gray-800 shadow-lg"
            >
              GO TO APP
            </button>
            <button 
              onClick={() => setShowGetApp(true)}
              className="md:hidden px-3 py-1.5 rounded-full text-[10px] font-bold transition-all bg-black text-white hover:bg-gray-800 shadow-lg"
            >
              GET APP
            </button>
          </div>
        </div>
      </header>

      {!isRemoved && (
        <div 
          className={`fixed inset-0 z-40 transition-opacity duration-1000 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          onTransitionEnd={() => isRevealed && setIsRemoved(true)}
        >
          <ScratchOverlay isDark={isDark} lang={lang} onReveal={() => setIsRevealed(true)} />
        </div>
      )}

      <main className={`flex-1 ${!isRevealed ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24 space-y-24">
          
          {/* Hero Section */}
          <section className="text-center space-y-8">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              Remove Backgrounds <br />
              <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>In Your Browser</span>
            </h1>
            <p className={`text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              {lang === 'KR' ? (
                <>빠르고 안전하게.<br />프레임 추출부터 배경 제거,<br />디테일 복구까지 한 번에.</>
              ) : lang === 'EN' ? (
                <>Fast and secure.<br />Can extract frames, remove backgrounds,<br />and recover details.</>
              ) : (
                <>高速で安全に。<br />フレーム抽出から背景削除、<br />ディテール復元までこれ一つで。</>
              )}
            </p>
            <button 
              onClick={() => navigate('/remove')}
              className="px-10 py-4 rounded-full text-lg font-bold transition-all bg-black text-white hover:bg-gray-800 hover:scale-105 shadow-xl uppercase tracking-tight"
            >
              START REMOVING
            </button>
          </section>

          {/* Before/After Demo */}
          <section className="max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10">
            <ReactCompareSlider
              itemOne={<ReactCompareSliderImage src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80" alt="Before" />}
              itemTwo={<ReactCompareSliderImage src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80" style={{ filter: 'grayscale(100%) brightness(1.5)' }} alt="After" />}
              className="h-[400px] lg:h-[500px] w-full"
            />
          </section>

          {/* Bento Grid Features */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-8 rounded-3xl border flex flex-col items-center text-center transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-xl'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 relative ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-transparent blur-md"></div>
                <Scissors className={`w-8 h-8 relative z-10 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} strokeWidth={1} />
              </div>
              <h3 className="text-xl font-bold mb-3">
                {lang === 'KR' ? '스마트 크로마키' : lang === 'EN' ? 'Smart Chroma Key' : 'スマートクロマキー'}
              </h3>
              <p className={isDark ? 'text-white/60' : 'text-gray-600'}>
                {lang === 'KR' 
                  ? '이미지 시퀀스나 비디오에서 단색 배경을 쉽게 제거하세요. 허용 오차와 가장자리 부드러움을 조절할 수 있습니다.' 
                  : lang === 'EN' 
                    ? 'Easily remove solid background colors from your image sequences or videos with adjustable tolerance and edge softening.' 
                    : '画像シーケンスやビデオから単色背景を簡単に削除します。許容誤差とエッジの柔らかさを調整できます。'}
              </p>
            </div>
            
            <div className={`p-8 rounded-3xl border flex flex-col items-center text-center transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-xl'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 relative ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/20 to-transparent blur-md"></div>
                <Wand2 className={`w-8 h-8 relative z-10 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} strokeWidth={1} />
              </div>
              <h3 className="text-xl font-bold mb-3">
                {lang === 'KR' ? '알파 복구' : lang === 'EN' ? 'Alpha Recovery' : 'アルファ復元'}
              </h3>
              <p className={isDark ? 'text-white/60' : 'text-gray-600'}>
                {lang === 'KR' 
                  ? '실수로 너무 많이 지워졌나요? 스마트 채우기와 브러쉬 도구를 사용하여 반투명 영역의 손실된 디테일을 복구하세요.' 
                  : lang === 'EN' 
                    ? 'Accidentally removed too much? Use our smart fill and brush tools to recover lost details in semi-transparent areas.' 
                    : '誤って消しすぎましたか？スマートフィルとブラシツールを使用して、半透明領域の失われた詳細を復元します。'}
              </p>
            </div>

            <div className={`p-8 rounded-3xl border flex flex-col items-center text-center transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-xl'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 relative ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-500/20 to-transparent blur-md"></div>
                <Download className={`w-8 h-8 relative z-10 ${isDark ? 'text-green-400' : 'text-green-600'}`} strokeWidth={1} />
              </div>
              <h3 className="text-xl font-bold mb-3">
                {lang === 'KR' ? '로컬 프로세싱' : lang === 'EN' ? 'Local Processing' : 'ローカル処理'}
              </h3>
              <p className={isDark ? 'text-white/60' : 'text-gray-600'}>
                {lang === 'KR' 
                  ? '파일이 기기를 떠나지 않습니다. 모든 처리는 WebAssembly를 사용하여 브라우저 내에서 안전하게 수행됩니다.' 
                  : lang === 'EN' 
                    ? 'Your files never leave your device. All processing is done securely within your browser using WebAssembly.' 
                    : 'ファイルがデバイスから離れることはありません。すべての処理はWebAssemblyを使用してブラウザ内で安全に行われます。'}
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* GET APP Modal */}
      <Modal
        isOpen={showGetApp}
        onClose={() => setShowGetApp(false)}
        title="GET APP"
        icon={Smartphone}
        lang={lang}
        setLang={setLang}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-6 py-4">
          <div className="w-full aspect-video bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden relative">
            <img 
              src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80" 
              alt="Dalgrac Studio Team" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold">
              {lang === 'KR' ? '아직 어플 준비 중입니다.' : lang === 'EN' ? 'App is under development.' : 'アプリは準備中です。'}
            </h3>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
              {lang === 'KR' ? '반응이 좋으면 준비해볼게요! 🍌' : lang === 'EN' ? "We'll prepare it if there's good feedback! 🍌" : '反響が良ければ準備します！ 🍌'}
            </p>
          </div>

          <div className={`w-full p-4 rounded-xl text-sm ${isDark ? 'bg-white/5 text-white/70' : 'bg-gray-50 text-gray-600'}`}>
            {lang === 'KR' ? (
              <>지금은 이런 작업을 준비 중이에요.<br />여정에 함께 해주세요.</>
            ) : lang === 'EN' ? (
              <>We are preparing this kind of work now.<br />Join us on our journey.</>
            ) : (
              <>現在、このような作業を準備中です。<br />私たちの旅に参加してください。</>
            )}
          </div>

          <div className={`text-xs font-medium tracking-widest uppercase mt-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
            By. Dalgrac Studio
          </div>
        </div>
      </Modal>
    </div>
  );
}
