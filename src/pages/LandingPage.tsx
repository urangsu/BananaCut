import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import { Scissors, Wand2, Download, Smartphone, Play } from 'lucide-react';
import { Modal } from '../components/Modal';
import teamImg from '../assets/team.jpg';

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
  const { lang, setLang } = useLanguage();
  const [showGetApp, setShowGetApp] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-gray-900'}`}>
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
              <span className="md:hidden">GO APP</span>
              <span className="hidden md:inline">GO TO APP</span>
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
              <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>
                In Your Browser
              </span>
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
                  {lang === 'KR' ? '웹브라우저에 직접 영상을 업로드 합니다.' : 
                   lang === 'EN' ? 'Upload videos directly to your web browser.' : 
                   'ウェブブラウザに直接動画をアップロードします。'}
                </p>
              </div>
              <div className={`p-6 rounded-2xl shadow-sm ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'}`}>
                <strong className={`block mb-3 text-base ${isDark ? 'text-white' : 'text-black'}`}>
                  00:35 - REMOVE
                </strong>
                <p className={`leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  {lang === 'KR' ? '배경 색상을 선택하고 오차 범위를 조절하여 피사체를 즉시 추출합니다.' : 
                   lang === 'EN' ? 'Select background color and adjust tolerance to extract subjects.' : 
                   '背景色を選択し、誤差範囲を調整して被写体を即座に抽出します。'}
                </p>
              </div>
              <div className={`p-6 rounded-2xl shadow-sm ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'}`}>
                <strong className={`block mb-3 text-base ${isDark ? 'text-white' : 'text-black'}`}>
                  01:14 - RECOVER
                </strong>
                <p className={`leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  {lang === 'KR' ? '손상된 알파 채널을 스마트 필 알고리즘으로 정교하게 복구합니다.' : 
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
          {/* Below the Fold: About & Tech Specs (SEO Optimized) */}
          <section className="max-w-5xl mx-auto pt-24 pb-12 border-t border-gray-200 dark:border-white/10 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-wide mb-6">
                  {lang === 'KR' ? '왜 \u00A0 바나나컷인가요?' : lang === 'EN' ? 'Why BananaCut?' : 'なぜBananaCut？'}
                </h2>
                <p className={`text-lg md:text-xl leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                  {lang === 'KR' ? '바나나컷은 프라이버시와 속도, 정밀함을 요구하는 크리에이터를 위해 설계되었습니다. 모든 작업은 고성능 웹 기반 엔진으로 브라우저 내부에서 처리되어 파일이 외부 서버로 전송되지 않습니다.' : 
                   lang === 'EN' ? 'BananaCut is designed for creators, designers, and video editors who demand privacy, speed, and precision. By leveraging a high-performance web-based engine, we eliminate the need for cloud uploads. Your files never leave your device.' : 
                   'BananaCutは、プライバシー、速度、精度を求めるクリエイターのために設計されました。すべての処理は高性能ウェブベースエンジンによってブラウザ内で行われるため、ファイルが外部サーバーに送信されることはありません。'}
                </p>
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold mb-6 tracking-tight">
                  {lang === 'KR' ? '기술 사양' : lang === 'EN' ? 'Technical Specifications' : '技術仕様'}
                </h3>
                <ul className="space-y-6">
                  <li className={`border-b pb-4 ${isDark ? 'border-white/10 text-white/60' : 'border-gray-200 text-gray-600'}`}>
                    <strong className={isDark ? 'text-white' : 'text-black'}>{lang === 'KR' ? '처리 엔진:' : lang === 'EN' ? 'Processing Engine:' : '処理エンジン：'}</strong> {lang === 'KR' ? '브라우저 내 네이티브 성능을 위한 고성능 웹 기반 엔진' : lang === 'EN' ? 'High-performance web-based engine for native-like performance in the browser.' : 'ブラウザでのネイティブのようなパフォーマンスのための高性能ウェブベースエンジン。'}
                  </li>
                  <li className={`border-b pb-4 ${isDark ? 'border-white/10 text-white/60' : 'border-gray-200 text-gray-600'}`}>
                    <strong className={isDark ? 'text-white' : 'text-black'}>{lang === 'KR' ? '지원 형식:' : lang === 'EN' ? 'Supported Formats:' : 'サポートされている形式：'}</strong> MP4, MOV, PNG, JPG/JPEG {lang === 'KR' ? '시퀀스' : lang === 'EN' ? 'sequences' : 'シーケンス'}
                  </li>
                  <li className={`border-b pb-4 ${isDark ? 'border-white/10 text-white/60' : 'border-gray-200 text-gray-600'}`}>
                    <strong className={isDark ? 'text-white' : 'text-black'}>{lang === 'KR' ? '데이터 프라이버시:' : lang === 'EN' ? 'Data Privacy:' : '데이터プライバシー：'}</strong> {lang === 'KR' ? '100% 로컬 처리. 서버 보관 없음. 외부 서버로 데이터가 전송되지 않습니다.' : lang === 'EN' ? '100% Local Processing. Zero server retention. No data is transmitted to external servers.' : '100％ローカル処理。サーバーの保持はゼロ。外部サーバーにデータは送信されません。'}
                  </li>
                </ul>
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
              src={teamImg} 
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
