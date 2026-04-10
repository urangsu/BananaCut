import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import { Scissors, Wand2, Download, Smartphone, Play } from 'lucide-react';
import { Modal } from '../components/Modal';

function ScratchOverlay({ isDark, lang, onReveal }: { isDark: boolean, lang: string, onReveal: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const isDrawing = useRef(false);
  const lastPos = useRef<{x: number, y: number} | null>(null);

  const hintText = lang === 'KR' ? '가로로 문질러서 확인해보세요!' : lang === 'EN' ? 'Erase to Reveal the Magic' : 'こすって魔法を確認してみてください！';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const initCanvas = () => {
      if (hasStarted) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Slightly grayish "fog" color (5% darker than pure white/black)
      ctx.fillStyle = isDark ? '#080808' : '#f8f8f8';
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
    <div className="absolute inset-0">
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
  const { lang, setLang } = useLanguage();
  const [showGetApp, setShowGetApp] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50 && !isRevealed) {
        setIsRevealed(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isRevealed]);

  return (
    <div className={`relative min-h-screen flex flex-col ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <header className={`relative z-50 flex items-center justify-between p-6 border-b ${isDark ? 'bg-[#121212] border-white/10' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col">
          <div className="text-2xl font-bold tracking-tighter">BananaCut</div>
          <div className={`text-[10px] font-medium tracking-widest uppercase mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>BY. DALGRACSTUDIO</div>
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
          <div className="flex flex-row gap-2 md:gap-4">
            <button 
              onClick={() => navigate('/remove')}
              className="px-3 md:px-6 py-1.5 md:py-2 rounded-full text-[9px] md:text-sm font-bold transition-all bg-black text-white hover:bg-gray-800 shadow-lg whitespace-nowrap"
            >
              <span className="md:hidden">STUDIO</span>
              <span className="hidden md:inline">
                {lang === 'JP' ? 'スタジオに入る' : 'ENTER STUDIO'}
              </span>
            </button>
            <button 
              onClick={() => setShowGetApp(true)}
              className="md:hidden px-3 py-1.5 rounded-full text-[9px] font-bold transition-all bg-black text-white hover:bg-gray-800 shadow-lg whitespace-nowrap"
            >
              GET APP
            </button>
          </div>
        </div>
      </header>

      {!isRemoved && (
        <div 
          className={`absolute top-0 left-0 w-full h-screen z-40 transition-opacity duration-1000 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          onTransitionEnd={() => isRevealed && setIsRemoved(true)}
        >
          <ScratchOverlay isDark={isDark} lang={lang} onReveal={() => setIsRevealed(true)} />
        </div>
      )}

      <main className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24 space-y-24">
          
          {/* Hero Section */}
          <section className="text-center space-y-8">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              Cut the Background. <br />
              <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>
                In Your Browser
              </span>
            </h1>
            <p className={`text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              {lang === 'KR' ? (
                <>서버 전송 없이, 빠르고 안전하게.<br />스마트 배경 제거부터 알파 복구,<br />투명 에셋 추출까지 한 번에.</>
              ) : lang === 'EN' ? (
                <>Fast, secure, and zero server uploads.<br />From smart background removal and alpha recovery,<br />to exporting flawless transparent assets instantly.</>
              ) : (
                <>サーバー送信なしで、安全かつ迅速に。<br />スマート背景削除からアルファ復元、<br />透明アセットの抽出までこれ一つで。</>
              )}
            </p>
            <button 
              onClick={() => navigate('/remove')}
              className="px-10 py-4 rounded-full text-lg font-bold transition-all bg-black text-white hover:bg-gray-800 hover:scale-105 shadow-xl uppercase tracking-tight"
            >
              START REMOVING
            </button>
          </section>

          {/* Video Demo Section (For Users & Bots) */}
          <section className="max-w-5xl mx-auto space-y-6">
            <div className={`aspect-video rounded-3xl flex items-center justify-center border overflow-hidden relative shadow-2xl ${isDark ? 'bg-black border-white/10' : 'bg-black border-gray-200'}`}>
              <iframe 
                src="https://www.youtube.com/embed/rTOB6sX-zA8?start=34&autoplay=1&mute=1&loop=1&playlist=rTOB6sX-zA8" 
                className="w-full h-full object-cover"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation allow-presentation"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                title="BananaCut Demo"
              ></iframe>
            </div>
            
            {/* Text description for SEO/Bots */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-left">
              <div className={`p-6 rounded-2xl shadow-sm ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'}`}>
                <strong className={`block mb-3 text-base ${isDark ? 'text-white' : 'text-black'}`}>
                  00:34 - Upload
                </strong>
                <p className={`leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  {lang === 'KR' ? <>웹브라우저에 직접 영상을<br />업로드 합니다.</> : 
                   lang === 'EN' ? 'Upload videos directly to your web browser.' : 
                   'ウェブブラウザに直接動画をアップロードします。'}
                </p>
              </div>
              <div className={`p-6 rounded-2xl shadow-sm ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'}`}>
                <strong className={`block mb-3 text-base ${isDark ? 'text-white' : 'text-black'}`}>
                  00:35 - REMOVE
                </strong>
                <p className={`leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  {lang === 'KR' ? <>배경 색상을 선택하고 오차 범위를<br />조절하여 피사체를 즉시 추출합니다.</> : 
                   lang === 'EN' ? 'Select background color and adjust tolerance to extract subjects.' : 
                   '背景色を選択し、誤差範囲を調整して被写体を即座に抽出します。'}
                </p>
              </div>
              <div className={`p-6 rounded-2xl shadow-sm ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'}`}>
                <strong className={`block mb-3 text-base ${isDark ? 'text-white' : 'text-black'}`}>
                  01:14 - RECOVER
                </strong>
                <p className={`leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  {lang === 'KR' ? <>손상된 알파 채널을 스마트필 알고리즘으로<br />정교하게 복구합니다.</> : 
                   lang === 'EN' ? 'Precisely recover damaged alpha channels with the Smart Fill algorithm.' : 
                   '損傷したアルファチャネルをスマートフィルで精巧に復元します。'}
                </p>
              </div>
            </div>
          </section>

          {/* Before/After Demo */}
          <section className="max-w-4xl mx-auto space-y-4">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10">
              <ReactCompareSlider
                itemOne={<ReactCompareSliderImage src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80" alt="Before" />}
                itemTwo={<ReactCompareSliderImage src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80" style={{ filter: 'grayscale(100%) brightness(1.5)' }} alt="After" />}
                className="h-[400px] lg:h-[500px] w-full"
              />
            </div>
            <p className={`text-center text-sm font-medium ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
              {lang === 'KR' ? '이제 에셋을 간편하게 만들어보세요' : lang === 'EN' ? 'Now, create assets easily' : '今、アセットを簡単に作成しましょう'}
            </p>
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
                  ? <>파일에서 배경을 편하게 제거하세요.<br />허용 오차와 가장자리 부드러움을<br />직관적으로 조절할 수 있습니다.</> 
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
                  ? <>실수로 너무 많이 지워졌나요?<br />스마트 채우기와 브러쉬 도구를 사용해<br />손실된 디테일을 복구하세요.</> 
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
                  ? <>파일이 기기를 떠나지 않습니다.<br />모든 처리는 WebAssembly를 사용하여<br />브라우저 내에서 안전하게 수행됩니다.</> 
                  : lang === 'EN' 
                    ? 'Your files never leave your device. All processing is done securely within your browser using WebAssembly.' 
                    : 'ファイルがデバイスから離れることはありません。すべての処理はWebAssemblyを使用してブラウザ内で安全に行われます。'}
              </p>
            </div>
          </section>
          {/* Below the Fold: SEO Optimized Editorial Layout */}
          <section className="max-w-6xl mx-auto pt-24 pb-12 border-t border-gray-200 dark:border-white/10 text-left space-y-32">
            
            {/* 1. Why BananaCut? (Expanded Editorial Layout) */}
            <div>
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-12">
                {lang === 'KR' ? '왜 바나나컷인가요?' : lang === 'EN' ? 'Why BananaCut?' : 'なぜBananaCut？'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold tracking-tight">100% Local Processing</h3>
                  <p className={`text-lg leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                    {lang === 'KR' ? <>바나나컷은 고성능 웹 엔진 기반으로<br />모든 작업을 브라우저에서 처리합니다.<br />영상을 외부 서버에 업로드할 필요 없어,<br />사용자의 정보는 완벽하게 보호됩니다.</> : 
                     lang === 'EN' ? 'BananaCut uses a high-performance web engine (WASM/FFmpeg) to process everything inside your browser. No need to upload heavy 4K videos to external servers, and your data privacy is perfectly protected.' : 
                     'BananaCutは高性能ウェブエンジン（WASM/FFmpeg）を使用して、すべての作業をブラウザ内で処理します。重い4K動画を外部サーバーにアップロードする必要はなく、ユーザーのデータプライバシーは完全に保護されます。'}
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold tracking-tight">Advanced Alpha Repair</h3>
                  <p className={`text-lg leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                    {lang === 'KR' ? <>배경 제거를 넘어, 손상된 알파 채널을<br />SmartFill으로 복구해보세요.<br />프레임 단위의 수작업 로토스코핑 시간을<br />획기적으로 단축하세요.</> : 
                     lang === 'EN' ? 'Beyond simple background removal, we provide a Smart Fill algorithm that repairs damaged alpha channels. Drastically reduce your frame-by-frame manual rotoscoping time.' : 
                     '単純な背景削除を超えて、損傷したアルファチャネルを復元するSmart Fillアルゴリズムを提供します。フレーム単位の手作業によるロトスコープの時間を劇的に短縮します。'}
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold tracking-tight">Forever Free & No Limits</h3>
                  <p className={`text-lg leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                    {lang === 'KR' ? <>이 모든 전문가급 기능을 100% 무료로<br />제공합니다. 워터마크도, 사용량 제한도,<br />번거로운 회원가입도 필요 없습니다.</> : 
                     lang === 'EN' ? 'We provide all these professional-grade features 100% free. No watermarks, no usage limits, and no cumbersome sign-ups required.' : 
                     'これらのプロフェッショナルレベルの機能をすべて完全無料で提供します。透かしも、使用制限も、面倒な会員登録も必要ありません。'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Perfect for AI Creators */}
            <div className={`p-12 rounded-[2.5rem] ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
                Perfect for AI Creators
              </h2>
              <p className={`text-xl md:text-2xl leading-relaxed max-w-4xl ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                {lang === 'KR' ? <>NaNo Banana, Midjourney와 같은 AI 생성 모델을 다루는 창작자에게<br />바나나컷은 '완벽한 에셋 파이프라인'을 제공합니다.<br />크로마키 작업 후 결과물을 이미지로 받는 것을 넘어,<br />배경이 투명한 WebM 비디오로 추출하거나<br />게임 엔진용 스프라이트 시트(Sprite Sheet)로 즉시 병합하세요.<br />AI 영상이 프로덕션급 게임/영상 에셋으로 재탄생합니다.</> : 
                 lang === 'EN' ? 'BananaCut offers a \'complete asset pipeline\' for creators using AI generation models like Midjourney, Luma, and Runway. Go beyond simple image sequences—export your chroma-keyed results as transparent WebM videos or merge them instantly into game-ready sprite sheets. Transform raw AI videos into production-grade assets.' : 
                 'Midjourney、Luma、RunwayなどのAI生成モデルを扱うクリエイターに、BananaCutは「完璧なアセットパイプライン」を提供します。クロマキー作業後、背景が透明なWebMビデオとして書き出したり、ゲームエンジン用のスプライトシートに即座に結合したりできます。AI動画がプロ仕様のゲーム/映像アセットに生まれ変わります。'}
              </p>
            </div>

            {/* 3. FAQ */}
            <div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-12">
                {lang === 'KR' ? '자주 묻는 질문 (FAQ)' : lang === 'EN' ? 'Frequently Asked Questions (FAQ)' : 'よくある質問 (FAQ)'}
              </h2>
              <div className="space-y-8">
                <div className={`pb-8 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <h3 className="text-xl font-bold mb-3">
                    {lang === 'KR' ? 'Q: 정말 100% 무료인가요?' : lang === 'EN' ? 'Q: Is it really 100% free?' : 'Q: 本当に100%無料ですか？'}
                  </h3>
                  <p className={`text-lg leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                    {lang === 'KR' ? <>A: 네, 바나나컷은 크리에이터 생태계를 위해 만들어진 도구로,<br />&nbsp;&nbsp;&nbsp;&nbsp;모든 기능을 횟수 제한 없이 무료로 제공합니다.</> : 
                     lang === 'EN' ? 'A: Yes, BananaCut is a tool built for the creator ecosystem, providing all features for free with no usage limits.' : 
                     'A: はい、BananaCutはクリエイターエコシステムのために作られたツールであり、すべての機能を回数制限なしで無料で提供します。'}
                  </p>
                </div>
                <div className={`pb-8 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <h3 className="text-xl font-bold mb-3">
                    {lang === 'KR' ? 'Q: 제 파일이 서버에 저장되나요?' : lang === 'EN' ? 'Q: Are my files saved on a server?' : 'Q: 私のファイルはサーバーに保存されますか？'}
                  </h3>
                  <p className={`text-lg leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                    {lang === 'KR' ? <>A: 아니요. 모든 프레임 처리와 영상 인코딩은<br />&nbsp;&nbsp;&nbsp;&nbsp;사용자의 기기(브라우저) 안에서만 이루어지며,<br />&nbsp;&nbsp;&nbsp;&nbsp;어떤 데이터도 외부로 전송되지 않습니다.</> : 
                     lang === 'EN' ? 'A: No. All frame processing and video encoding happens entirely within your device (browser), and no data is transmitted externally.' : 
                     'A: いいえ。すべてのフレーム処理と動画エンコードはユーザーのデバイス（ブラウザ）内でのみ行われ、データが外部に送信されることはありません。'}
                  </p>
                </div>
                <div className={`pb-8 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <h3 className="text-xl font-bold mb-3">
                    {lang === 'KR' ? 'Q: 어떤 파일을 지원하나요?' : lang === 'EN' ? 'Q: What files are supported?' : 'Q: どのファイル形式をサポートしていますか？'}
                  </h3>
                  <p className={`text-lg leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                    {lang === 'KR' ? <>A: 업로드는 MP4, WEBM 비디오 및 PNG, JPG 시퀀스를 지원합니다.<br />&nbsp;&nbsp;&nbsp;&nbsp;작업 완료 후에는 투명도가 적용된 PNG 시퀀스(ZIP),<br />&nbsp;&nbsp;&nbsp;&nbsp;투명 WebM 비디오, 병합된 스프라이트 시트 이미지로 내보낼 수 있습니다.</> : 
                     lang === 'EN' ? 'A: We support MP4, WEBM videos, and PNG/JPG sequences for upload. You can export your final work as transparent PNG sequences (ZIP), transparent WebM videos, or merged sprite sheets.' : 
                     'A: アップロードはMP4、WEBMビデオ、PNG/JPGシーケンスをサポートします。作業完了後は、透明なPNGシーケンス（ZIP）、透明なWebMビデオ、結合されたスプライトシート画像として書き出すことができます。'}
                  </p>
                </div>
                <div className={`pb-8 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <h3 className="text-xl font-bold mb-3">
                    {lang === 'KR' ? 'Q: 고해상도 투명 비디오나 스프라이트 시트 생성도 브라우저에서 되나요?' : lang === 'EN' ? 'Q: Can high-resolution transparent videos and sprite sheets be generated in the browser?' : 'Q: 高解像度の透明ビデオやスプライトシートの生成もブラウザで可能ですか？'}
                  </h3>
                  <p className={`text-lg leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                    {lang === 'KR' ? <>A: 네! 바나나컷에 탑재된 고성능 웹 엔진과 스마트 렌더링 기술을 통해,<br />&nbsp;&nbsp;&nbsp;&nbsp;무거운 영상 인코딩과 이미지 병합 작업도<br />&nbsp;&nbsp;&nbsp;&nbsp;별도의 서버 없이 브라우저 내에서 100% 로컬 처리됩니다.</> : 
                     lang === 'EN' ? 'A: Yes! Powered by BananaCut\'s high-performance web engine and smart rendering technology, heavy video encoding and image merging are processed 100% locally in your browser, without any external servers.' : 
                     'A: はい！BananaCutに搭載された高性能ウェブエンジンとスマートレンダリング技術により、重い動画のエンコードや画像の結合も外部サーバーなしで、ブラウザ内で100%ローカル処理されます。'}
                  </p>
                </div>
              </div>
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
          <div className="w-full bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden relative">
            <img 
              src="/images/team.jpg" 
              alt="Dalgrac Studio Team" 
              className="max-w-full h-auto object-contain"
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
            BY. DALGRACSTUDIO
          </div>
        </div>
      </Modal>
    </div>
  );
}
