import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { useTheme } from "../ThemeContext";
import { useLanguage } from "../LanguageContext";
import {
  Scissors,
  Wand2,
  Download,
  Smartphone,
  Play,
  PlaySquare,
  Shield,
} from "lucide-react";
import { Modal } from "../components/Modal";
import { trackEvent } from "../lib/analytics";

function ScratchOverlay({
  isDark,
  lang,
  onReveal,
}: {
  isDark: boolean;
  lang: string;
  onReveal: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const hintText =
    lang === "KR"
      ? "가로로 문질러서 확인해보세요!"
      : lang === "EN"
        ? "Erase to Reveal the Magic"
        : "こすって魔法を確認してみてください！";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const initCanvas = () => {
      if (hasStarted) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Slightly grayish "fog" color (5% darker than pure white/black)
      ctx.fillStyle = isDark ? "#080808" : "#f8f8f8";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    initCanvas();
    window.addEventListener("resize", initCanvas);
    return () => window.removeEventListener("resize", initCanvas);
  }, [isDark, hasStarted]);

  const getPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
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
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentPos = getPos(e);

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
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
    const ctx = canvas.getContext("2d");
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

    if (erased / total > 0.3) {
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
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${hasStarted ? "opacity-0" : "opacity-100"}`}
      >
        <p
          className={`text-2xl md:text-4xl font-bold tracking-tight animate-pulse ${isDark ? "text-white" : "text-black"}`}
        >
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
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  return (
    <div
      className={`min-h-screen flex flex-col ${isDark ? "bg-[#121212] text-white" : "bg-white text-gray-900"}`}
    >
      {/* Header */}
      <header
        className={`relative z-50 flex items-center justify-between p-6 border-b ${isDark ? "bg-[#121212] border-white/10" : "bg-white border-gray-200"}`}
      >
        <div className="flex flex-col">
          <div className="text-2xl font-bold tracking-tighter">BananaCut</div>
          <div
            className={`text-[10px] font-medium tracking-widest uppercase mt-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}
          >
            BY. DALGRACSTUDIO
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 p-1 rounded-full border bg-white/50 dark:bg-black/50 backdrop-blur-md border-gray-200 dark:border-white/10">
            {(["KR", "EN", "JP"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium rounded-full transition-all ${
                  lang === l
                    ? isDark
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : isDark
                      ? "text-white/60 hover:text-white"
                      : "text-gray-500 hover:text-black"
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
              onClick={() => navigate("/remove")}
              className="px-3 md:px-6 py-1.5 md:py-2 rounded-full text-[9px] md:text-sm font-bold transition-all bg-black text-white hover:bg-gray-800 shadow-lg whitespace-nowrap"
            >
              <span className="md:hidden">STUDIO</span>
              <span className="hidden md:inline">
                {lang === "JP" ? "スタジオに入る" : "ENTER STUDIO"}
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
          className={`fixed inset-0 z-40 transition-opacity duration-1000 ${isRevealed ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          onTransitionEnd={() => isRevealed && setIsRemoved(true)}
        >
          <ScratchOverlay
            isDark={isDark}
            lang={lang}
            onReveal={() => setIsRevealed(true)}
          />
        </div>
      )}

      <main
        className={`flex-1 ${!isRevealed ? "overflow-hidden" : "overflow-y-auto"}`}
      >
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24 space-y-24">
          {/* Hero Section */}
          <section className="text-center space-y-8">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              {lang === "KR" ? (
                <>
                  AI 영상과 캐릭터를
                  <br />
                  <span className={isDark ? "text-blue-400" : "text-blue-600"}>
                    바로 쓸 수 있는 투명 에셋으로
                  </span>
                </>
              ) : lang === "EN" ? (
                <>
                  Turn videos and generated characters into <br />
                  <span className={isDark ? "text-blue-400" : "text-blue-600"}>
                    usable transparent assets
                  </span>
                </>
              ) : (
                <>
                  動画や生成キャラクターを
                  <br />
                  <span className={isDark ? "text-blue-400" : "text-blue-600"}>
                    すぐ使える透過アセットに
                  </span>
                </>
              )}
            </h1>
            <p
              className={`text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed ${isDark ? "text-white/60" : "text-gray-600"}`}
            >
              {lang === "KR" ? (
                <>
                  브라우저 안에서 프레임 분할, 배경 제거, 수동 보정, 스프라이트
                  시트 생성을 한 번에 처리합니다.
                </>
              ) : lang === "EN" ? (
                <>
                  Split frames, remove backgrounds, clean edges, and export
                  sprite sheets directly in your browser.
                </>
              ) : (
                <>
                  ブラウザ内でフレーム分割、背景除去、手動補正、スプライトシート出力まで完結します。
                </>
              )}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/remove")}
                className="px-10 py-4 rounded-full text-lg font-bold transition-all bg-black text-white hover:bg-gray-800 hover:scale-105 shadow-xl uppercase tracking-tight"
              >
                {lang === "KR"
                  ? "바로 시작하기"
                  : lang === "EN"
                    ? "Start Cutting"
                    : "はじめる"}
              </button>
              <button
                onClick={() => {
                  trackEvent("Click_Sample_From_Landing");
                  navigate("/remove", { state: { loadSample: true } });
                }}
                className={`px-10 py-4 rounded-full text-lg font-bold transition-all border-2 ${isDark ? "border-white text-white hover:bg-white hover:text-black" : "border-black text-black hover:bg-black hover:text-white"} hover:scale-105 uppercase tracking-tight`}
              >
                {lang === "KR"
                  ? "샘플로 체험하기"
                  : lang === "EN"
                    ? "Try Sample Project"
                    : "サンプルを試す"}
              </button>
            </div>
          </section>

          {/* Video Demo Section (For Users & Bots) */}
          <section className="max-w-5xl mx-auto space-y-6">
            <div
              className={`aspect-video rounded-3xl flex items-center justify-center border overflow-hidden relative shadow-2xl group ${isDark ? "bg-[#0a0a0a] border-white/10" : "bg-black border-gray-200"}`}
            >
              {!isDemoPlaying ? (
                <>
                  <img
                    src="https://img.youtube.com/vi/rTOB6sX-zA8/maxresdefault.jpg"
                    alt="BananaCut Demo Thumbnail"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setIsDemoPlaying(true);
                      }}
                      className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-all flex items-center gap-3 shadow-[0_0_40px_rgba(220,38,38,0.5)] group-hover:scale-110 group-hover:shadow-[0_0_60px_rgba(220,38,38,0.8)] pointer-events-auto"
                    >
                      <PlaySquare className="w-6 h-6" />
                      {lang === "KR"
                        ? "YouTube에서 데모 보기"
                        : lang === "EN"
                          ? "Watch demo"
                          : "デモを見る"}
                    </button>
                    <p
                      className={`mt-6 text-sm font-medium px-4 py-2 rounded-full backdrop-blur-md ${isDark ? "text-white/80 bg-black/40" : "text-gray-900 bg-white/60"}`}
                    >
                      {lang === "KR"
                        ? "클릭 시 동영상이 재생됩니다."
                        : lang === "EN"
                          ? "Click to play video."
                          : "クリックして再生"}
                    </p>
                  </div>
                </>
              ) : iframeError ? (
                <div className="flex flex-col items-center justify-center text-white/50 space-y-4">
                  <PlaySquare className="w-12 h-12 opacity-50" />
                  <p>
                    {lang === "KR"
                      ? "동영상을 로드하지 못했습니다."
                      : "Failed to load video."}
                  </p>
                  <a
                    href="https://www.youtube.com/watch?v=rTOB6sX-zA8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                  >
                    Open in YouTube
                  </a>
                </div>
              ) : (
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/rTOB6sX-zA8?autoplay=1"
                  title="BananaCut Demo Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={() => setIframeError(true)}
                />
              )}
            </div>

            {/* Demo-friendly Copy / Perfect for AI videos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-left">
              <div className="col-span-1 md:col-span-3 p-6 rounded-2xl shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800/30 text-center">
                <p
                  className={`text-base font-medium ${isDark ? "text-white/90" : "text-gray-800"}`}
                >
                  {lang === "KR"
                    ? "AI로 만든 캐릭터 영상, 초록 배경 애니메이션, 앱/게임용 프레임 에셋을 빠르게 정리하세요."
                    : lang === "EN"
                      ? "Clean up AI-generated character videos, green-screen animations, and app/game frame assets in one browser workflow."
                      : "AI生成キャラクター動画、グリーンバックアニメーション、アプリ・ゲーム用フレーム素材をブラウザだけで整理できます。"}
                </p>
              </div>
              <div
                className={`p-6 rounded-2xl shadow-sm ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-100"}`}
              >
                <strong
                  className={`block mb-3 text-base ${isDark ? "text-white" : "text-black"}`}
                >
                  00:34 - Upload
                </strong>
                <p
                  className={`leading-relaxed ${isDark ? "text-white/60" : "text-gray-600"}`}
                >
                  {lang === "KR"
                    ? "웹브라우저에 직접 영상을 업로드 합니다."
                    : lang === "EN"
                      ? "Upload videos directly to your web browser."
                      : "ウェブブラウザに直接動画をアップロードします。"}
                </p>
              </div>
              <div
                className={`p-6 rounded-2xl shadow-sm ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-100"}`}
              >
                <strong
                  className={`block mb-3 text-base ${isDark ? "text-white" : "text-black"}`}
                >
                  00:35 - REMOVE
                </strong>
                <p
                  className={`leading-relaxed ${isDark ? "text-white/60" : "text-gray-600"}`}
                >
                  {lang === "KR"
                    ? "배경 색상을 선택하고 오차 범위를 조절하여 피사체를 즉시 추출합니다."
                    : lang === "EN"
                      ? "Select background color and adjust tolerance to extract subjects."
                      : "背景色を選択し、誤差範囲を調整して被写体を即座に抽出します。"}
                </p>
              </div>
              <div
                className={`p-6 rounded-2xl shadow-sm ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-100"}`}
              >
                <strong
                  className={`block mb-3 text-base ${isDark ? "text-white" : "text-black"}`}
                >
                  01:14 - RECOVER
                </strong>
                <p
                  className={`leading-relaxed ${isDark ? "text-white/60" : "text-gray-600"}`}
                >
                  {lang === "KR"
                    ? "손상된 알파 채널을 스마트 필 알고리즘으로 정교하게 복구합니다."
                    : lang === "EN"
                      ? "Precisely recover damaged alpha channels with the Smart Fill algorithm."
                      : "損傷したアルファチャネルをスマートフィルで精巧に復元します。"}
                </p>
              </div>
            </div>
          </section>

          {/* Before/After Demo */}
          <section className="max-w-4xl mx-auto space-y-4">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10">
              <ReactCompareSlider
                itemOne={
                  <ReactCompareSliderImage
                    src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80"
                    alt="Before"
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80"
                    style={{ filter: "grayscale(100%) brightness(1.5)" }}
                    alt="After"
                  />
                }
                className="h-[400px] lg:h-[500px] w-full"
              />
            </div>
            <p
              className={`text-center text-sm font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}
            >
              {lang === "KR"
                ? "이제 에셋을 간편하게 만들어보세요"
                : lang === "EN"
                  ? "Now, create assets easily"
                  : "今、アセットを簡単に作成しましょう"}
            </p>
          </section>

          {/* Features (Trust Blocks updated) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className={`p-8 rounded-3xl border flex flex-col items-center text-center transition-all hover:scale-[1.02] ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-gray-50 border-gray-200 hover:bg-white hover:shadow-xl"}`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 relative ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-transparent blur-md"></div>
                <Smartphone
                  className={`w-8 h-8 relative z-10 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-xl font-bold mb-3">100% Local Processing</h3>
              <p className={isDark ? "text-white/60" : "text-gray-600"}>
                {lang === "KR"
                  ? "모든 작업이 브라우저 내부에서 처리되어 영상을 서버로 전송하지 않습니다."
                  : "All processing happens securely inside your browser. No server uploads."}
              </p>
            </div>

            <div
              className={`p-8 rounded-3xl border flex flex-col items-center text-center transition-all hover:scale-[1.02] ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-gray-50 border-gray-200 hover:bg-white hover:shadow-xl"}`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 relative ${isDark ? "bg-green-500/10" : "bg-green-50"}`}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-500/20 to-transparent blur-md"></div>
                <Wand2
                  className={`w-8 h-8 relative z-10 ${isDark ? "text-green-400" : "text-green-600"}`}
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-xl font-bold mb-3">Free to Use</h3>
              <p className={isDark ? "text-white/60" : "text-gray-600"}>
                {lang === "KR"
                  ? "회원가입 없이 즉시 브라우저에서 투명 에셋 생성을 시작하세요."
                  : "Start creating transparent assets instantly in your browser with no sign-ups required."}
              </p>
            </div>

            <div
              className={`p-8 rounded-3xl border flex flex-col items-center text-center transition-all hover:scale-[1.02] ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-gray-50 border-gray-200 hover:bg-white hover:shadow-xl"}`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 relative ${isDark ? "bg-purple-500/10" : "bg-purple-50"}`}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/20 to-transparent blur-md"></div>
                <Shield
                  className={`w-8 h-8 relative z-10 ${isDark ? "text-purple-400" : "text-purple-600"}`}
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-xl font-bold mb-3">Data Privacy</h3>
              <p className={isDark ? "text-white/60" : "text-gray-600"}>
                {lang === "KR"
                  ? "영상과 이미지는 브라우저 안에서 로컬로 처리됩니다. BananaCut은 사용자의 미디어 파일을 서버에 업로드하거나 저장하지 않습니다."
                  : "Your videos and images are processed locally in your browser. BananaCut does not upload or store your media files on our servers."}
              </p>
            </div>
          </section>
          {/* Below the Fold: SEO Optimized Editorial Layout */}
          <section className="max-w-6xl mx-auto pt-24 pb-12 border-t border-gray-200 dark:border-white/10 text-left space-y-32">
            {/* 1. Why BananaCut? (Expanded Editorial Layout) */}
            <div>
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-12">
                {lang === "KR"
                  ? "왜 바나나컷인가요?"
                  : lang === "EN"
                    ? "Why BananaCut?"
                    : "なぜBananaCut？"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold tracking-tight">
                    Local Processing
                  </h3>
                  <p
                    className={`text-lg leading-relaxed ${isDark ? "text-white/70" : "text-gray-600"}`}
                  >
                    {lang === "KR"
                      ? "바나나컷은 고성능 웹 엔진(WASM/FFmpeg)을 사용하여 핵심 작업을 브라우저 내부에서 처리합니다. 무거운 4K 영상을 외부 서버에 업로드할 필요가 없습니다."
                      : lang === "EN"
                        ? "BananaCut uses a high-performance web engine (WASM/FFmpeg) to process core tasks inside your browser. No need to upload heavy 4K videos to external servers."
                        : "BananaCutは高性能ウェブエンジン（WASM/FFmpeg）を使用して、コアタスクをブラウザ内で処理します。重い4K動画を外部サーバーにアップロードする必要はありません。"}
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold tracking-tight">
                    Advanced Alpha Repair
                  </h3>
                  <p
                    className={`text-lg leading-relaxed ${isDark ? "text-white/70" : "text-gray-600"}`}
                  >
                    {lang === "KR"
                      ? "단순한 배경 제거를 넘어, 손상된 알파 채널을 복구하는 Smart Fill 알고리즘을 제공합니다. 프레임 단위의 수작업 로토스코핑 시간을 획기적으로 단축하세요."
                      : lang === "EN"
                        ? "Beyond simple background removal, we provide a Smart Fill algorithm that repairs damaged alpha channels. Drastically reduce your frame-by-frame manual rotoscoping time."
                        : "単純な背景削除を超えて、損傷したアルファチャネルを復元するSmart Fillアルゴリズムを提供します。フレーム単位の手作業によるロトスコープの時間を劇的に短縮します。"}
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold tracking-tight">
                    Free to Use
                  </h3>
                  <p
                    className={`text-lg leading-relaxed ${isDark ? "text-white/70" : "text-gray-600"}`}
                  >
                    {lang === "KR"
                      ? "이 모든 전문가급 기능을 바탕으로 시작하세요. 번거로운 회원가입도 필요 없습니다."
                      : lang === "EN"
                        ? "Start using these professional-grade features for free. No cumbersome sign-ups required."
                        : "これらのプロフェッショナルレベルの機能を利用し始めましょう。面倒な会員登録も必要ありません。"}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Perfect for AI Creators */}
            <div
              className={`p-12 rounded-[2.5rem] ${isDark ? "bg-white/5" : "bg-gray-50"}`}
            >
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
                Perfect for AI Creators
              </h2>
              <p
                className={`text-xl md:text-2xl leading-relaxed max-w-4xl ${isDark ? "text-white/80" : "text-gray-700"}`}
              >
                {lang === "KR"
                  ? "Seedance, Veo, Midjourney와 같은 최신 생성 모델을 다루는 창작자에게 바나나컷은 '완벽한 에셋 파이프라인'을 제공합니다. 크로마키 작업 후 결과물을 이미지로 받는 것을 넘어, 배경이 투명한 WebM 비디오로 추출하거나 게임 엔진용 스프라이트 시트(Sprite Sheet)로 즉시 병합하세요. 생성된 영상이 프로덕션급 게임/영상 에셋으로 재탄생합니다."
                  : lang === "EN"
                    ? "BananaCut offers a 'complete asset pipeline' for creators using the latest generative models like Seedance, Veo, and Midjourney. Go beyond simple image sequences—export your chroma-keyed results as transparent WebM videos or merge them instantly into game-ready sprite sheets. Transform generated videos into production-grade assets."
                    : "Seedance、Veo、Midjourneyなどの最新の生成モデルを扱うクリエイターに、BananaCutは「完璧なアセットパイプライン」を提供します。クロマキー作業後、背景が透明なWebMビデオとして書き出したり、ゲームエンジン用のスプライトシートに即座に結合したりできます。生成された動画がプロ仕様のゲーム/映像アセットに生まれ変わります。"}
              </p>
            </div>

            {/* 3. FAQ */}
            <div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-12">
                {lang === "KR"
                  ? "자주 묻는 질문 (FAQ)"
                  : lang === "EN"
                    ? "Frequently Asked Questions (FAQ)"
                    : "よくある質問 (FAQ)"}
              </h2>
              <div className="space-y-8">
                <div
                  className={`pb-8 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}
                >
                  <h3 className="text-xl font-bold mb-3">
                    {lang === "KR"
                      ? "Q: 정말 무료인가요?"
                      : lang === "EN"
                        ? "Q: Is it free to use?"
                        : "Q: 無料ですか？"}
                  </h3>
                  <p
                    className={`text-lg leading-relaxed ${isDark ? "text-white/70" : "text-gray-600"}`}
                  >
                    {lang === "KR"
                      ? "A: 네, 바나나컷은 크리에이터 생태계를 위해 만들어진 도구로, 기능들을 무료로 제공합니다."
                      : lang === "EN"
                        ? "A: Yes, BananaCut is a tool built for the creator ecosystem, providing features for free."
                        : "A: はい、BananaCutはクリエイターエコシステムのために作られたツールであり、機能を無料で提供します。"}
                  </p>
                </div>
                <div
                  className={`pb-8 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}
                >
                  <h3 className="text-xl font-bold mb-3">
                    {lang === "KR"
                      ? "Q: 제 파일이 서버에 저장되나요?"
                      : lang === "EN"
                        ? "Q: Are my files saved on a server?"
                        : "Q: 私のファイルはサーバーに保存されますか？"}
                  </h3>
                  <p
                    className={`text-lg leading-relaxed ${isDark ? "text-white/70" : "text-gray-600"}`}
                  >
                    {lang === "KR"
                      ? "A: 아니요. 원본 이미지/비디오, 추출 프레임, 편집 결과물은 바나나컷 서버로 업로드되거나 저장되지 않습니다."
                      : lang === "EN"
                        ? "A: No. Original images/videos, extracted frames, and edited results are not uploaded or stored on BananaCut servers."
                        : "A: いいえ。元の画像/ビデオ、抽出されたフレーム、および編集結果がBananaCutサーバーにアップロードされたり保存されたりすることはありません。"}
                  </p>
                </div>
                <div
                  className={`pb-8 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}
                >
                  <h3 className="text-xl font-bold mb-3">
                    {lang === "KR"
                      ? "Q: 어떤 파일을 지원하나요?"
                      : lang === "EN"
                        ? "Q: What files are supported?"
                        : "Q: どのファイル形式をサポートしていますか？"}
                  </h3>
                  <p
                    className={`text-lg leading-relaxed ${isDark ? "text-white/70" : "text-gray-600"}`}
                  >
                    {lang === "KR"
                      ? "A: 업로드는 MP4, WEBM 비디오 및 PNG, JPG 시퀀스를 지원합니다. 작업 완료 후에는 투명도가 적용된 PNG 시퀀스(ZIP), 투명 WebM 비디오, 병합된 스프라이트 시트 이미지로 내보낼 수 있습니다."
                      : lang === "EN"
                        ? "A: We support MP4, WEBM videos, and PNG/JPG sequences for upload. You can export your final work as transparent PNG sequences (ZIP), transparent WebM videos, or merged sprite sheets."
                        : "A: アップロードはMP4、WEBMビデオ、PNG/JPGシーケンスをサポートします。作業完了後は、透明なPNGシーケンス（ZIP）、透明なWebMビデオ、結合されたスプライトシート画像として書き出すことができます。"}
                  </p>
                </div>
                <div
                  className={`pb-8 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}
                >
                  <h3 className="text-xl font-bold mb-3">
                    {lang === "KR"
                      ? "Q: 고해상도 투명 비디오나 스프라이트 시트 생성도 브라우저에서 되나요?"
                      : lang === "EN"
                        ? "Q: Can high-resolution transparent videos and sprite sheets be generated in the browser?"
                        : "Q: 高解像度の透明ビデオやスプライトシートの生成もブラウザで可能ですか？"}
                  </h3>
                  <p
                    className={`text-lg leading-relaxed ${isDark ? "text-white/70" : "text-gray-600"}`}
                  >
                    {lang === "KR"
                      ? "A: 네! 바나나컷에 탑재된 고성능 웹 엔진과 스마트 렌더링 기술을 통해, 무거운 영상 인코딩과 이미지 병합 작업도 별도의 서버 없이 브라우저 내에서 100% 로컬 처리됩니다."
                      : lang === "EN"
                        ? "A: Yes! Powered by BananaCut's high-performance web engine and smart rendering technology, heavy video encoding and image merging are processed 100% locally in your browser, without any external servers."
                        : "A: はい！BananaCutに搭載された高性能ウェブエンジンとスマートレンダリング技術により、重い動画のエンコードや画像の結合も外部サーバーなしで、ブラウザ内で100%ローカル処理されます。"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer for Landing Page */}
        <footer
          className={`w-full py-6 mt-12 border-t px-6 flex flex-col md:flex-row items-center justify-between gap-4 ${isDark ? "border-white/10 text-white/40" : "border-gray-200 text-gray-500"}`}
        >
          <div className="text-xs font-medium">
            © 2026 BananaCut | BY. DALGRACSTUDIO
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <Link
              to="/guide"
              className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              Guide
            </Link>
            <span className="opacity-20">|</span>
            <Link
              to="/privacy"
              className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              Privacy
            </Link>
            <span className="opacity-20">|</span>
            <Link
              to="/terms"
              className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              Terms
            </Link>
            <span className="opacity-20">|</span>
            <a
              href="https://tally.so/r/44vorO"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              Feedback
            </a>
            <span className="opacity-20">|</span>
            <button
              onClick={() => setShowGetApp(true)}
              className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors flex items-center gap-1"
            >
              Support 🍌
            </button>
          </div>
        </footer>
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
          <div className="w-full bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden relative min-h-[200px]">
            {!imgError ? (
              <img
                src="/images/team.jpg"
                alt="Dalgrac Studio Team"
                className="max-w-full h-auto object-contain"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 p-8">
                <Smartphone className="w-12 h-12 mb-2 opacity-20" />
                <span className="text-sm font-medium">Coming Soon</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold">
              {lang === "KR"
                ? "아직 어플 준비 중입니다."
                : lang === "EN"
                  ? "App is under development."
                  : "アプリは準備中です。"}
            </h3>
            <p
              className={`text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}
            >
              {lang === "KR"
                ? "반응이 좋으면 준비해볼게요! 🍌"
                : lang === "EN"
                  ? "We'll prepare it if there's good feedback! 🍌"
                  : "反響が良ければ準備します！ 🍌"}
            </p>
          </div>

          <div
            className={`w-full p-4 rounded-xl text-sm ${isDark ? "bg-white/5 text-white/70" : "bg-gray-50 text-gray-600"}`}
          >
            {lang === "KR" ? (
              <>
                지금은 이런 작업을 준비 중이에요.
                <br />
                여정에 함께 해주세요.
              </>
            ) : lang === "EN" ? (
              <>
                We are preparing this kind of work now.
                <br />
                Join us on our journey.
              </>
            ) : (
              <>
                現在、このような作業を準備中です。
                <br />
                私たちの旅に参加してください。
              </>
            )}
          </div>

          <div
            className={`text-xs font-medium tracking-widest uppercase mt-4 ${isDark ? "text-white/40" : "text-gray-400"}`}
          >
            BY. DALGRACSTUDIO
          </div>
        </div>
      </Modal>
    </div>
  );
}
