import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { useTheme } from "../ThemeContext";
import { useLanguage } from "../LanguageContext";
import {
  Wand2,
  Smartphone,
  PlaySquare,
  Shield,
  Sun,
  Moon,
} from "lucide-react";
import { Modal } from "../components/Modal";
import { trackEvent } from "../lib/analytics";
import { SEO } from "../components/SEO";

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
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const [showGetApp, setShowGetApp] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [demoState, setDemoState] = useState<"checking" | "local" | "youtube" | "error">("checking");
  const [localVideoSrc, setLocalVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    const checkLocalVideo = async () => {
      try {
        let res = await fetch("/videos/bananacut-demo.webm", { method: "HEAD" });
        if (res.ok) {
          setLocalVideoSrc("/videos/bananacut-demo.webm");
          setDemoState("local");
          return;
        }
        res = await fetch("/videos/bananacut-demo.mp4", { method: "HEAD" });
        if (res.ok) {
          setLocalVideoSrc("/videos/bananacut-demo.mp4");
          setDemoState("local");
          return;
        }
        setDemoState("youtube");
      } catch (err) {
        setDemoState("youtube");
      }
    };
    checkLocalVideo();
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col ${isDark ? "bg-[#121212] text-white" : "bg-white text-gray-900"}`}
    >
      <SEO 
        title="BananaCut — Remove Backgrounds. Make It Yours."
        description="Clean up videos and frames, then export transparent assets directly in your browser."
        canonical="https://www.bananacut.art/"
      />
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
          
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={`w-9 h-9 rounded-full border backdrop-blur-md transition-all flex items-center justify-center shrink-0 ${
              isDark
                ? "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                : "bg-white/70 border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {isDark ? (
              <Sun className="w-[18px] h-[18px]" strokeWidth={1.75} />
            ) : (
              <Moon className="w-[18px] h-[18px]" strokeWidth={1.75} />
            )}
          </button>

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
              Remove Backgrounds.<br />
              <span className={isDark ? "text-blue-400" : "text-blue-600"}>
                Make It Yours.
              </span>
            </h1>
            <p
              className={`text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed ${isDark ? "text-white/60" : "text-gray-600"}`}
            >
              {lang === "KR"
                ? "영상과 프레임을 브라우저에서 다듬고, 바로 쓸 수 있는 에셋으로 내보내세요."
                : lang === "EN"
                  ? "Clean up videos and frames, then export transparent assets directly in your browser."
                  : "動画やフレームをブラウザで整理し、すぐ使えるアセットとして書き出せます。"}
            </p>
            <div className="flex flex-col items-center justify-center gap-4">
              <button
                onClick={() => navigate("/remove")}
                className="w-full sm:w-auto px-10 py-4 rounded-full text-lg font-bold transition-all bg-black text-white hover:bg-gray-800 hover:scale-105 shadow-xl uppercase tracking-tight"
              >
                Start Cutting
              </button>
              <button
                onClick={() => {
                  trackEvent("Click_Sample_From_Landing");
                  navigate("/remove", { state: { loadSample: true } });
                }}
                className={`w-full sm:w-auto px-10 py-4 rounded-full text-lg font-bold transition-all border-2 ${isDark ? "border-white text-white hover:bg-white hover:text-black" : "border-black text-black hover:bg-black hover:text-white"} hover:scale-105 uppercase tracking-tight`}
              >
                Try Sample Project
              </button>
            </div>
          </section>

          {/* Video Demo Section (For Users & Bots) */}
          <section className="max-w-5xl mx-auto space-y-6">
            <div
              className={`aspect-video rounded-3xl flex items-center justify-center border overflow-hidden relative shadow-2xl group ${isDark ? "bg-[#0a0a0a] border-white/10" : "bg-black border-gray-200"}`}
            >
              {demoState === "checking" ? (
                <div className="flex flex-col items-center justify-center text-white/50 space-y-4">
                  <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
                </div>
              ) : demoState === "error" ? (
                <div className="flex flex-col items-center justify-center text-white/50 space-y-4">
                  <PlaySquare className="w-12 h-12 opacity-50" />
                  <p>
                    {lang === "KR"
                      ? "데모 영상을 불러오지 못했습니다."
                      : lang === "EN"
                        ? "Demo video could not be loaded."
                        : "デモ動画を読み込めませんでした。"}
                  </p>
                  <a
                    href="https://www.youtube.com/watch?v=rTOB6sX-zA8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors flex items-center gap-2 font-medium"
                  >
                    <PlaySquare className="w-5 h-5" />
                    {lang === "KR"
                      ? "YouTube에서 보기"
                      : lang === "EN"
                        ? "Watch on YouTube"
                        : "YouTubeで見る"}
                  </a>
                </div>
              ) : demoState === "local" && localVideoSrc ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  controls={false}
                  poster="https://img.youtube.com/vi/rTOB6sX-zA8/maxresdefault.jpg"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => setDemoState("youtube")}
                >
                  <source src={localVideoSrc} type={localVideoSrc.endsWith(".webm") ? "video/webm" : "video/mp4"} />
                  <p>Your browser does not support HTML5 video.</p>
                </video>
              ) : (
                <iframe
                  className="w-full h-full absolute inset-0 object-cover"
                  src="https://www.youtube.com/embed/rTOB6sX-zA8?autoplay=1&mute=1&playsinline=1&controls=0&rel=0&modestbranding=1"
                  title="BananaCut Demo Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={() => setDemoState("error")}
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
                    ? "영상과 프레임 에셋을 브라우저에서 빠르게 정리하세요."
                    : lang === "EN"
                      ? "Clean up generated videos, green-screen animations, and app/game frame assets in one browser workflow."
                      : "生成動画、グリーンバックアニメーション、アプリ・ゲーム用フレーム素材をブラウザで整理できます。"}
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
                    ? "영상을 브라우저에서 바로 불러옵니다."
                    : lang === "EN"
                      ? "Load your video directly in the browser."
                      : "動画をブラウザで直接読み込みます。"}
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
                    ? "배경색을 선택하고, 프레임에서 피사체를 분리합니다."
                    : lang === "EN"
                      ? "Pick the background color and separate the subject from each frame."
                      : "背景色を選び、各フレームから被写体を切り出します。"}
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
                    ? "배경 제거 후 생긴 빈틈과 가장자리 얼룩을 손쉽게 다듬을 수 있습니다."
                    : lang === "EN"
                      ? "Fix gaps and rough edges left after background removal."
                      : "背景除去後に残った隙間やエッジの汚れを整えられます。"}
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
                    Files Stay With You
                  </h3>
                  <p
                    className={`text-lg leading-relaxed ${isDark ? "text-white/70" : "text-gray-600"}`}
                  >
                    {lang === "KR"
                      ? "영상과 이미지는 브라우저 안에서 처리됩니다. 원본 파일을 서버에 올리지 않고도 배경 제거와 프레임 정리를 시작할 수 있어요."
                      : lang === "EN"
                        ? "Your videos and images are processed in your browser. Start removing backgrounds and cleaning frames without uploading your source files to our servers."
                        : "動画や画像はブラウザ内で処理されます。元ファイルをサーバーにアップロードせずに、背景除去とフレーム整理を始められます。"}
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold tracking-tight">
                    Clean the Edges
                  </h3>
                  <p
                    className={`text-lg leading-relaxed ${isDark ? "text-white/70" : "text-gray-600"}`}
                  >
                    {lang === "KR"
                      ? "배경 제거 후 남는 가장자리 얼룩이나 빈틈을 직접 다듬을 수 있습니다. 여러 프레임을 한 번에 정리해 반복 작업을 줄일 수 있어요."
                      : lang === "EN"
                        ? "Fix rough edges, tiny gaps, and leftover background marks after removal. Clean multiple frames without repainting everything one by one."
                        : "背景除去後に残るエッジの汚れや小さな隙間を整えられます。1枚ずつやり直さずに、複数フレームをまとめて整理できます。"}
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold tracking-tight">
                    Start Right Away
                  </h3>
                  <p
                    className={`text-lg leading-relaxed ${isDark ? "text-white/70" : "text-gray-600"}`}
                  >
                    {lang === "KR"
                      ? "가입 없이 바로 시작할 수 있습니다. 샘플 프로젝트로 먼저 체험해보고, 필요할 때 내 파일을 가져오세요."
                      : lang === "EN"
                        ? "No account is required to get started. Try the sample project first, then bring in your own files when you are ready."
                        : "アカウントなしですぐに始められます。まずはサンプルで試してから、自分のファイルを読み込めます。"}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. For Generated Videos */}
            <div
              className={`p-8 md:p-10 rounded-3xl ${isDark ? "bg-white/5" : "bg-gray-50"}`}
            >
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4">
                For Generated Videos
              </h2>
              <div
                className={`text-lg md:text-xl leading-relaxed max-w-3xl space-y-3 flex flex-col ${isDark ? "text-white/80" : "text-gray-700"}`}
              >
                {lang === "KR" ? (
                  <>
                    <p>AI로 만든 영상은 바로 쓰기 어려울 때가 많습니다.</p>
                    <p>배경이 남아 있거나, 프레임마다 가장자리가 흔들리거나, 캐릭터 주변에 작은 얼룩이 생기기도 하죠.</p>
                    <p>BananaCut은 그런 결과물을 프레임으로 나누고, 배경을 지우고, 다시 쓸 수 있는 투명 에셋으로 정리합니다.<br/>GPT Image, Nano Banana, Seedance, Veo로 만든 이미지와 영상도 PNG 시퀀스나 스프라이트 시트로 빠르게 내보낼 수 있습니다.</p>
                  </>
                ) : lang === "EN" ? (
                  <>
                    <p>Generated videos are not always ready to use.</p>
                    <p>Backgrounds remain, edges flicker between frames, and small artifacts often appear around the character.</p>
                    <p>BananaCut helps you split those results into frames, remove the background, and turn them into reusable transparent assets.<br/>Use it with assets from GPT Image, Nano Banana, Seedance, Veo, and similar generation workflows.</p>
                  </>
                ) : (
                  <>
                    <p>生成された動画は、そのまま使いにくいことがあります。</p>
                    <p>背景が残ったり、フレームごとにエッジが揺れたり、キャラクターの周りに小さなノイズが出ることがあります。</p>
                    <p>BananaCutは、そうした素材をフレームに分け、背景を消し、再利用しやすい透過アセットとして整理します。<br/>GPT Image、Nano Banana、Seedance、Veoで作成した画像や動画も、PNGシーケンスやスプライトシートとして書き出せます。</p>
                  </>
                )}
              </div>
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
                        : "Q: 本当に無料ですか？"}
                  </h3>
                  <p
                    className={`text-lg leading-relaxed ${isDark ? "text-white/70" : "text-gray-600"}`}
                  >
                    {lang === "KR" ? (
                      <>
                        A: 네. BananaCut은 회원가입 없이 무료로 사용할 수 있습니다.
                        <br className="mb-2 block" />
                        앱 에셋을 만들다 직접 필요해서 만든 도구이고, 같은 문제를 겪는 분들께 공개했습니다.
                      </>
                    ) : lang === "EN" ? (
                      <>
                        A: Yes. BananaCut is free to use without creating an account.
                        <br className="mb-2 block" />
                        I built it for my own app assets and shared it for others with the same workflow problem.
                      </>
                    ) : (
                      <>
                        A: はい。BananaCutはアカウント登録なしで無料で使えます。
                        <br className="mb-2 block" />
                        自分のアプリ用アセット制作で必要になって作り、同じ悩みを持つ人のために公開しています。
                      </>
                    )}
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
                      ? "A: 아니요. 원본 이미지와 비디오, 추출된 프레임, 편집 결과물은 BananaCut 서버에 업로드되거나 저장되지 않습니다."
                      : lang === "EN"
                        ? "A: No. Your original images, videos, extracted frames, and edited results are not uploaded to or stored on BananaCut servers."
                        : "A: いいえ。元の画像や動画、抽出されたフレーム、編集結果がBananaCutサーバーにアップロードまたは保存されることはありません。"}
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
                      ? "A: MP4, MOV, WEBM 같은 영상 파일과 PNG, JPG 이미지를 사용할 수 있습니다. 작업 후에는 PNG 시퀀스, GIF, WebM 비디오, 스프라이트 시트로 내보낼 수 있습니다."
                      : lang === "EN"
                        ? "A: You can use video files such as MP4, MOV, and WEBM, as well as PNG and JPG images. After editing, you can export PNG sequences, GIFs, WebM videos, and sprite sheets."
                        : "A: MP4、MOV、WEBMなどの動画ファイルと、PNG、JPG画像を使用できます。編集後は、PNGシーケンス、GIF、WebM動画、スプライトシートとして書き出せます。"}
                  </p>
                </div>
                <div
                  className={`pb-8 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}
                >
                  <h3 className="text-xl font-bold mb-3">
                    {lang === "KR"
                      ? "Q: 고해상도 내보내기도 브라우저에서 되나요?"
                      : lang === "EN"
                        ? "Q: Can high-resolution export be generated in the browser?"
                        : "Q: 高解像度の書き出しもブラウザで可能ですか？"}
                  </h3>
                  <p
                    className={`text-lg leading-relaxed ${isDark ? "text-white/70" : "text-gray-600"}`}
                  >
                    {lang === "KR"
                      ? "A: 가능합니다. 다만 큰 영상이나 긴 프레임 시퀀스는 기기와 브라우저 성능에 따라 시간이 더 걸릴 수 있습니다. 빠르고 안정적인 결과가 필요하다면 먼저 스프라이트 시트 내보내기를 추천합니다."
                      : lang === "EN"
                        ? "A: Yes, but large videos or long frame sequences may take more time depending on your device and browser. For the fastest and most reliable workflow, we recommend starting with sprite sheet export."
                        : "A: 可能です。ただし、大きな動画や長いフレームシーケンスは、端末やブラウザの性能によって時間がかかる場合があります。より速く安定した結果が必要な場合は、まずスプライトシート出力をおすすめします。"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer for Landing Page */}
        <footer
          className={`w-full py-8 mt-12 border-t px-6 flex flex-col items-center justify-center gap-6 ${isDark ? "border-white/10 text-white/40" : "border-gray-200 text-gray-500"}`}
        >
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium max-w-2xl">
            <Link to="/guides" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Articles</Link>
            <Link to="/examples" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Examples</Link>
            <Link to="/privacy" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Contact</Link>
            <a href="https://tally.so/r/44vorO" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Feedback</a>
            <button onClick={() => setShowGetApp(true)} className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors flex items-center gap-1">Support 🍌</button>
          </div>

          <div className="text-xs font-medium">
            © 2026 BananaCut | BY. DALGRACSTUDIO
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
