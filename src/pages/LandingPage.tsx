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
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Modal } from "../components/Modal";
import { BrandLogo } from "../components/BrandLogo";
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
  const [showSkip, setShowSkip] = useState(false);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

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

      {showSkip && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReveal();
          }}
          className={`absolute bottom-8 right-8 z-[100] px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transition-all border pointer-events-auto hover:scale-105 active:scale-95 ${
            isDark
              ? "bg-white text-black border-white hover:bg-gray-100"
              : "bg-black text-white border-black hover:bg-gray-800"
          }`}
        >
          {lang === "KR" ? "건너뛰기" : lang === "EN" ? "Skip" : "スキップ"}
        </button>
      )}
    </div>
  );
}

function SafeImage({ src, alt, label, className }: { src: string; alt: string; label: string, className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`aspect-video w-full flex items-center justify-center rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-white/5 dark:to-white/10 text-gray-500 text-sm font-semibold p-4 ${className}`}>
        {label}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`w-full object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}

const DEMO_TIMELINE = [
  {
    id: 'upload',
    time: 34,
    label: '00:34 - Upload',
    title: {
      KR: '영상 업로드',
      EN: 'Upload',
      JP: 'アップロード'
    },
    description: {
      KR: '영상을 브라우저에서 바로 불러옵니다.',
      EN: 'Load your video directly in the browser.',
      JP: '動画をブラウザで直接読み込みます。'
    }
  },
  {
    id: 'remove',
    time: 35,
    label: '00:35 - REMOVE',
    title: {
      KR: '배경 제거',
      EN: 'REMOVE',
      JP: '背景除去'
    },
    description: {
      KR: '배경색을 선택하고, 프레임에서 피사체를 분리합니다.',
      EN: 'Pick the background color and separate the subject from each frame.',
      JP: '背景色を選び、各フレームから被写体を切り出します。'
    }
  },
  {
    id: 'recover',
    time: 74,
    label: '01:14 - RECOVER',
    title: {
      KR: '가장자리 복구',
      EN: 'RECOVER',
      JP: '復元'
    },
    description: {
      KR: '배경 제거 후 생긴 빈틈과 가장자리 얼룩을 손쉽게 다듬을 수 있습니다.',
      EN: 'Fix gaps and rough edges left after background removal.',
      JP: '背景除去後に残った隙間やエッジの汚れを整えられます。'
    }
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const [showGetApp, setShowGetApp] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [demoState, setDemoState] = useState<"checking" | "local" | "no_video">("checking");
  const [localVideoSrc, setLocalVideoSrc] = useState<string | null>(null);
  const demoVideoRef = useRef<HTMLVideoElement | null>(null);

  const playDemoAt = async (seconds: number) => {
    trackEvent('Click_Demo_Timestamp', 'Landing Page Demo', `seconds_${seconds}`);

    if (demoState === 'local' && demoVideoRef.current) {
      const video = demoVideoRef.current;
      try {
        video.currentTime = seconds;
        await video.play();
        return;
      } catch (err) {
        console.warn('Local video play failed:', err);
      }
    }

    window.open(`https://www.youtube.com/watch?v=rTOB6sX-zA8&t=${seconds}s`, '_blank', 'noopener,noreferrer');
  };

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
        setDemoState("no_video");
      } catch (err) {
        setDemoState("no_video");
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
        description="Clean up videos and frames in your browser, then turn them into assets that fit your work."
        canonical="https://www.bananacut.art/"
      />
      {/* Header */}
      <header
        data-testid="landing-header"
        data-layout="landing"
        className={`relative z-50 flex items-center justify-between p-6 border-b ${isDark ? "bg-[#121212] border-white/10" : "bg-white border-gray-200"}`}
      >
        <div data-testid="landing-logo" className="flex flex-col">
          <BrandLogo size="md" />
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div data-testid="landing-language-switcher" className="flex items-center gap-1 p-1 rounded-full border bg-white/50 dark:bg-black/50 backdrop-blur-md border-gray-200 dark:border-white/10">
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

          <div className="flex flex-row gap-2 md:gap-4">
            <button
              onClick={() => navigate("/remove")}
              className="px-3 md:px-6 py-1.5 md:py-2 rounded-full text-[9px] md:text-sm font-bold transition-all bg-black text-white hover:bg-gray-800 shadow-lg whitespace-nowrap"
            >
              <span>
                {lang === "KR" ? "스튜디오 열기" : lang === "JP" ? "スタジオを開く" : "Open Studio"}
              </span>
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
        data-testid="landing-main"
        className="flex-1 overflow-y-auto"
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
              className={`copy-readable text-lg lg:text-xl max-w-2xl mx-auto ${isDark ? "text-white/60" : "text-gray-600"}`}
            >
              {lang === "KR"
                ? "영상과 프레임을 브라우저에서 다듬고, 내 작업에 딱 맞는 에셋으로 완성하세요."
                : lang === "EN"
                  ? "Clean up videos and frames in your browser, then turn them into assets that fit your work."
                  : "動画やフレームをブラウザで整え、自分の制作に合うアセットとして仕上げられます。"}
            </p>
            <div className="flex flex-col items-center justify-center gap-4">
              <button
                onClick={() => navigate("/remove")}
                className="w-full sm:w-auto px-10 py-4 rounded-full text-lg font-bold transition-all bg-black text-white hover:bg-gray-800 hover:scale-105 shadow-xl uppercase tracking-tight"
              >
                {lang === "KR" ? "자르기 시작" : lang === "JP" ? "カット開始" : "Start Cutting"}
              </button>
              <button
                onClick={() => {
                  trackEvent("Click_Sample_From_Landing");
                  navigate("/remove", { state: { loadSample: true } });
                }}
                className={`w-full sm:w-auto px-10 py-4 rounded-full text-lg font-bold transition-all border-2 ${isDark ? "border-white text-white hover:bg-white hover:text-black" : "border-black text-black hover:bg-black hover:text-white"} hover:scale-105 uppercase tracking-tight`}
              >
                {lang === "KR" ? "샘플 시작" : lang === "JP" ? "サンプルを試す" : "Try Sample"}
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
              ) : demoState === "local" && localVideoSrc ? (
                <video
                  ref={demoVideoRef}
                  src={localVideoSrc}
                  controls
                  playsInline
                  preload="metadata"
                  poster="/images/demo-thumbnail.jpg"
                  className="w-full h-full object-cover rounded-3xl"
                  onError={() => setDemoState("no_video")}
                />
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center rounded-3xl overflow-hidden group">
                  <img
                    src="/images/demo-thumbnail.jpg"
                    alt="BananaCut demo video thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/90">
                      <PlaySquare className="w-6 h-6" />
                    </div>
                    <p className="text-base font-semibold text-white">
                      {lang === "KR"
                        ? "데모 영상을 준비 중입니다."
                        : lang === "JP"
                          ? "デモ動画を準備中です。"
                          : "The demo video is being prepared."}
                    </p>
                    <a
                      href="https://www.youtube.com/watch?v=rTOB6sX-zA8"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white/20 hover:bg-white/30 text-white transition-colors border border-white/20"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>
                        {lang === "KR"
                          ? "YouTube에서 보기"
                          : lang === "JP"
                            ? "YouTubeで見る"
                            : "Watch on YouTube"}
                      </span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Demo-friendly Copy / Perfect for AI videos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-left">
              <div className="col-span-1 md:col-span-3 p-6 rounded-2xl shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800/30 text-center">
                <p
                  className={`text-base font-medium ${isDark ? "text-white/90" : "text-gray-800"}`}
                >
                  {lang === "KR"
                    ? "영상과 프레임 에셋을 브라우저에서 한 흐름으로 정리하세요."
                    : lang === "EN"
                      ? "Clean up generated videos, green-screen animations, and app/game frame assets in one browser workflow."
                      : "生成動画、グリーンバックアニメーション、アプリ・ゲーム用フレーム素材をブラウザで整理できます。"}
                </p>
              </div>
              {DEMO_TIMELINE.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => playDemoAt(item.time)}
                  aria-label={`Play demo from ${item.label}`}
                  className={`p-6 rounded-2xl shadow-sm text-left transition-all hover:scale-[1.02] ${isDark ? "bg-white/5 border border-white/10 hover:bg-white/10" : "bg-gray-50 border border-gray-100 hover:bg-gray-100"}`}
                >
                  <strong
                    className={`block mb-3 text-base ${isDark ? "text-white" : "text-black"}`}
                  >
                    {item.label}
                  </strong>
                  <p
                    className={`leading-relaxed mb-4 ${isDark ? "text-white/60" : "text-gray-600"}`}
                  >
                    {item.description[lang === "KR" ? "KR" : lang === "JP" ? "JP" : "EN"]}
                  </p>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {lang === 'KR' ? '이 지점부터 재생' : lang === 'EN' ? 'Play from here' : 'ここから再生'}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Before/After Demo */}
          <section className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-center">
              {lang === "KR"
                ? "원본 프레임에서 재사용 가능한 에셋까지"
                : lang === "JP"
                  ? "生フレームから再利用可能なアセットまで"
                  : "From raw frames to reusable assets"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-full rounded-2xl overflow-hidden shadow-lg border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <SafeImage src="/images/examples/sample-before.png" alt={lang === "KR" ? "원본 프레임" : lang === "JP" ? "オリジナルフレーム" : "Original Frame"} label={lang === "KR" ? "원본 프레임" : lang === "JP" ? "オリジナルフレーム" : "Original Frame"} />
                </div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                  {lang === "KR" ? "원본 프레임" : lang === "JP" ? "オリジナルフレーム" : "Original Frame"}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-full rounded-2xl overflow-hidden shadow-lg border ${isDark ? 'border-white/10' : 'border-gray-200'} bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+CjxyZWN0IHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0iI2ZmZiIgLz4KPHBhdGggZD0iTTAgMGgxMnYxMkgweiIgZmlsbD0iI2VlZSIgLz4KPHBhdGggZD0iTTEyIDEyaDEydjEySDEyeiIgZmlsbD0iI2VlZSIgLz4KPC9zdmc+')]`}>
                  <SafeImage src="/images/examples/sample-after.png" alt={lang === "KR" ? "정리된 프레임" : lang === "JP" ? "クリーニング後" : "Cleaned Frame"} label={lang === "KR" ? "정리된 프레임" : lang === "JP" ? "クリーニング後" : "Cleaned Frame"} />
                </div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                  {lang === "KR" ? "정리된 프레임" : lang === "JP" ? "クリーニング後" : "Cleaned Frame"}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-full rounded-2xl overflow-hidden shadow-lg border ${isDark ? 'border-white/10' : 'border-gray-200'} bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+CjxyZWN0IHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0iI2ZmZiIgLz4KPHBhdGggZD0iTTAgMGgxMnYxMkgweiIgZmlsbD0iI2VlZSIgLz4KPHBhdGggZD0iTTEyIDEyaDEydjEySDEyeiIgZmlsbD0iI2VlZSIgLz4KPC9zdmc+')]`}>
                  <SafeImage src="/images/examples/sample-sprite-sheet.png" alt={lang === "KR" ? "스프라이트 시트" : lang === "JP" ? "スプライトシート" : "Sprite Sheet"} label={lang === "KR" ? "스프라이트 시트" : lang === "JP" ? "スプライトシート" : "Sprite Sheet"} />
                </div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                  {lang === "KR" ? "스프라이트 시트" : lang === "JP" ? "スプライトシート" : "Sprite Sheet"}
                </span>
              </div>
            </div>
            <p
              className={`text-center text-sm font-medium ${isDark ? "text-white/60" : "text-gray-500"}`}
            >
              {lang === "KR"
                ? "생성 영상, 그린스크린 애니메이션, 프레임 시퀀스를 앱·게임·웹에서 다시 쓸 수 있는 에셋으로 정리하세요."
                : lang === "EN"
                  ? "Turn generated clips, green-screen animations, and frame sequences into reusable assets for apps, games, and websites."
                  : "生成動画、グリーンバックアニメーション、フレームシーケンスを、アプリ・ゲーム・Webで再利用できるアセットとして整理できます。"}
            </p>
            <div className="flex justify-center mt-6">
              <button
                onClick={() => navigate("/guide?tab=prompt")}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all shadow-md group hover:scale-105 ${
                  isDark
                    ? "bg-white/10 hover:bg-white/20 border border-white/10 text-white"
                    : "bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700"
                }`}
              >
                <span>💡 {lang === "KR" ? "이용 가이드에서 핵심 프롬프트 팁 보기" : lang === "EN" ? "See Core Prompt Tips in Guide" : "ガイドでコアプロンプトのヒントを見る"}</span>
                <span className="transition-transform group-hover:translate-x-1">➔</span>
              </button>
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
                    {lang === "KR"
                      ? "색을 찍고, 배경을 지우세요"
                      : lang === "EN"
                        ? "Pick the Color. Cut the Background."
                        : "色を選んで、背景を切り抜く"}
                  </h3>
                  <p
                    className={`copy-readable text-lg ${isDark ? "text-white/70" : "text-gray-600"}`}
                  >
                    {lang === "KR"
                      ? "피커로 프레임 안의 배경색을 직접 선택하세요. 범위를 조절해가며 감으로 맞추지 않고 배경을 제거할 수 있습니다."
                      : lang === "EN"
                        ? "Use the picker to sample the background color directly from your frame. Adjust the range and remove the background without guessing."
                        : "ピッカーでフレーム内の背景色を直接選択できます。範囲を調整しながら、感覚に頼らず背景を取り除けます。"}
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold tracking-tight">
                    {lang === "KR"
                      ? "남길 부분은 브러시로 지키세요"
                      : lang === "EN"
                        ? "Protect What Should Stay."
                        : "残したい部分を守る"}
                  </h3>
                  <p
                    className={`copy-readable text-lg ${isDark ? "text-white/70" : "text-gray-600"}`}
                  >
                    {lang === "KR"
                      ? "배경색과 비슷한 옷, 소품, 하이라이트는 브러시로 제외할 수 있습니다. 지워야 할 곳과 남겨야 할 곳을 직접 컨트롤하세요."
                      : lang === "EN"
                        ? "Use the brush to exclude areas from removal. Keep details like clothing, props, highlights, or parts that share a similar color with the background."
                        : "背景色に近い服、小物、ハイライトなどはブラシで除外できます。消す部分と残す部分を自分でコントロールできます。"}
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold tracking-tight">
                    {lang === "KR"
                      ? "지워진 가장자리는 다시 메우세요"
                      : lang === "EN"
                        ? "Recover Edges with Real Colors."
                        : "削れたエッジをもう一度整える"}
                  </h3>
                  <p
                    className={`copy-readable text-lg ${isDark ? "text-white/70" : "text-gray-600"}`}
                  >
                    {lang === "KR"
                      ? "Recover에서 피커로 주변 색을 가져오고, 빈틈이나 거친 가장자리를 다시 채울 수 있습니다. 배경 제거 중 함께 깎인 부분을 프레임 단위로 다듬으세요."
                      : lang === "EN"
                        ? "In Recover, pick colors from nearby pixels and repair gaps or rough edges. It helps when background removal cuts into the subject."
                        : "Recoverでは、周囲の色をピッカーで取り、隙間や荒れたエッジを補修できます。背景除去で削れた部分をフレーム単位で整えられます。"}
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
                className={`copy-readable text-lg md:text-xl max-w-3xl space-y-4 flex flex-col ${isDark ? "text-white/80" : "text-gray-700"}`}
              >
                {lang === "KR" ? (
                  <>
                    <p>생성 영상은 바로 쓸 수 있는 에셋이 아닐 때가 많습니다.</p>
                    <p>배경이 남고, 가장자리가 흔들리고, 작은 얼룩이 피사체 주변에 붙습니다.</p>
                    <p>BananaCut은 색을 찍어 배경을 지우고, 브러시로 남길 부분을 보호하고, Recover에서 지워진 가장자리를 다시 다듬을 수 있게 도와줍니다.</p>
                    <p>PNG 시퀀스나 스프라이트 시트로 내보내 앱, 게임, 웹 작업에 활용하세요.</p>
                    <p>GPT Image, Nano Banana, Seedance, Veo 결과물 정리에도 사용할 수 있습니다.</p>
                  </>
                ) : lang === "EN" ? (
                  <>
                    <p>Generated videos often need cleanup before they become usable assets.</p>
                    <p>Backgrounds may remain, edges may flicker, and small artifacts can appear around the subject.</p>
                    <p>BananaCut helps you pick the background color, protect details with a brush, and recover rough edges frame by frame.</p>
                    <p>Export PNG sequences or sprite sheets for apps, games, and web projects.</p>
                    <p>It can also fit workflows using GPT Image, Nano Banana, Seedance, Veo, and similar generation tools.</p>
                  </>
                ) : (
                  <>
                    <p>生成動画は、そのまま使えるアセットではないことがあります。</p>
                    <p>背景が残ったり、エッジが揺れたり、被写体の周りに小さなノイズが出る場合があります。</p>
                    <p>BananaCutでは、背景色を選び、ブラシで残したい部分を守り、Recoverで荒れたエッジをフレームごとに整えられます。</p>
                    <p>PNGシーケンスやスプライトシートとして書き出し、アプリ、ゲーム、Web制作に活用できます。</p>
                    <p>GPT Image、Nano Banana、Seedance、Veoなどの生成結果の整理にも使用できます。</p>
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
                    className={`copy-readable text-lg ${isDark ? "text-white/70" : "text-gray-600"}`}
                  >
                    {lang === "KR" ? (
                      <>
                        A: 네. 회원가입 없이 바로 사용할 수 있습니다.
                        <br className="mb-2 block" />
                        앱 에셋을 만들며 직접 필요해서 만든 도구이고, 같은 문제를 겪는 창작자들을 위해 공개했습니다.
                      </>
                    ) : lang === "EN" ? (
                      <>
                        A: Yes. You can use BananaCut without creating an account.
                        <br className="mb-2 block" />
                        I built it while making assets for my own app, then opened it for creators with the same workflow problem.
                      </>
                    ) : (
                      <>
                        A: はい。アカウント登録なしですぐに使えます。
                        <br className="mb-2 block" />
                        自分のアプリ用アセットを作る中で必要になって作り、同じ悩みを持つクリエイターのために公開しています。
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
                        : "Q: ファイルはサーバーに保存されますか？"}
                  </h3>
                  <p
                    className={`copy-readable text-lg ${isDark ? "text-white/70" : "text-gray-600"}`}
                  >
                    {lang === "KR"
                      ? "A: 아니요. 원본 이미지와 비디오, 추출된 프레임, 편집 결과물은 BananaCut 서버에 업로드되거나 저장되지 않습니다. 작업은 가능한 한 브라우저 안에서 처리됩니다."
                      : lang === "EN"
                        ? "A: No. Your source images, videos, extracted frames, and edited results are not uploaded to or stored on BananaCut servers. The workflow is designed to run in your browser."
                        : "A: いいえ。元の画像や動画、抽出されたフレーム、編集結果はBananaCutのサーバーにアップロードまたは保存されません。作業は可能な限りブラウザ内で処理されるように設計されています。"}
                  </p>
                </div>
                <div
                  className={`pb-8 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}
                >
                  <h3 className="text-xl font-bold mb-3">
                    {lang === "KR"
                      ? "Q: 어떤 파일을 지원하나요?"
                      : lang === "EN"
                        ? "Q: What file types are supported?"
                        : "Q: どのファイル形式に対応していますか？"}
                  </h3>
                  <p
                    className={`copy-readable text-lg ${isDark ? "text-white/70" : "text-gray-600"}`}
                  >
                    {lang === "KR"
                      ? "A: MP4, MOV, WebM 영상과 PNG, JPG 이미지를 사용할 수 있습니다. 작업 결과는 PNG 시퀀스, GIF, 투명 WebM, 스프라이트 시트로 내보낼 수 있습니다."
                      : lang === "EN"
                        ? "A: You can work with MP4, MOV, WebM videos and PNG or JPG images. Exports include PNG sequences, GIFs, transparent WebM, and sprite sheets."
                        : "A: MP4、MOV、WebM動画と、PNG、JPG画像を使用できます。作業結果はPNGシーケンス、GIF、透過WebM、スプライトシートとして書き出せます。"}
                  </p>
                </div>
                <div
                  className={`pb-8 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}
                >
                  <h3 className="text-xl font-bold mb-3">
                    {lang === "KR"
                      ? "Q: 고해상도 내보내기도 브라우저에서 되나요?"
                      : lang === "EN"
                        ? "Q: Can high-resolution exports run in the browser?"
                        : "Q: 高解像度の書き出しもブラウザでできますか？"}
                  </h3>
                  <p
                    className={`copy-readable text-lg ${isDark ? "text-white/70" : "text-gray-600"}`}
                  >
                    {lang === "KR"
                      ? "A: 가능합니다. 다만 긴 영상이나 큰 프레임 시퀀스는 기기 성능에 따라 시간이 걸릴 수 있습니다. 안정적인 결과가 필요하다면 먼저 짧은 클립이나 스프라이트 시트 내보내기로 테스트해보세요."
                      : lang === "EN"
                        ? "A: Yes, but large videos and long frame sequences can take time depending on your device and browser. For the most stable workflow, test with a shorter clip or start with sprite sheet export."
                        : "A: 可能です。ただし、長い動画や大きなフレームシーケンスは、端末やブラウザの性能によって時間がかかることがあります。安定した作業をしたい場合は、短いクリップやスプライトシート書き出しから試してください。"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer for Landing Page */}
        <footer
          data-testid="landing-footer"
          data-layout="landing"
          className={`w-full py-8 mt-12 border-t px-6 flex flex-col items-center justify-center gap-6 ${isDark ? "border-white/10 text-white/40" : "border-gray-200 text-gray-500"}`}
        >
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium max-w-2xl">
            <Link to="/guides" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              {lang === "KR" ? "가이드 아티클" : lang === "JP" ? "ガイド記事" : "Articles"}
            </Link>
            <Link to="/examples" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              {lang === "KR" ? "샘플 예시" : lang === "JP" ? "事例サンプル" : "Examples"}
            </Link>
            <Link to="/privacy" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              {lang === "KR" ? "개인정보" : lang === "JP" ? "プライバシー" : "Privacy"}
            </Link>
            <Link to="/terms" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              {lang === "KR" ? "이용 약관" : lang === "JP" ? "利用規約" : "Terms"}
            </Link>
            <Link to="/contact" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              {lang === "KR" ? "문의하기" : lang === "JP" ? "お問い合わせ" : "Contact"}
            </Link>
            <a href="https://tally.so/r/44vorO" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              {lang === "KR" ? "피드백" : lang === "JP" ? "フィードバック" : "Feedback"}
            </a>
            <button onClick={() => setShowSupport(true)} className="flex items-center justify-center gap-1 text-[#FACC15] hover:text-yellow-400 transition-colors font-bold">
              🍌 {lang === 'KR' ? '후원하기' : lang === 'EN' ? 'Support Us' : '応援する'}
            </button>
          </div>

          <div className="text-xs font-medium">
            © 2026 BananaCut | BY. DALGRACSTUDIO
          </div>
        </footer>
      </main>

      {/* Support Modal */}
      <Modal
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
        title={lang === 'KR' ? '후원하기' : lang === 'EN' ? 'Support Us' : 'サポート'}
        icon={HelpCircle}
        lang={lang}
        setLang={setLang}
        maxWidthClass="max-w-[350px]"
      >
        <div className="grid grid-cols-1 gap-3 py-2">
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                window.open("https://toon.at/donate/dalgracstudio", "_blank");
              } else {
                const width = 450;
                const height = 600;
                const left = (window.screen.width / 2) - (width / 2);
                const top = (window.screen.height / 2) - (height / 2);
                window.open(
                  "https://toon.at/donate/dalgracstudio",
                  "ToonationPopup",
                  `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no`
                );
              }
              setShowSupport(false);
            }}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#673ab7] text-white font-medium hover:bg-[#5e35b1] transition-colors shadow-sm whitespace-nowrap text-sm"
          >
            <span className="text-base">☕</span>
            {lang === 'KR' ? '익명으로 커피 후원하기' : lang === 'EN' ? 'Buy us a coffee anonymously' : '匿名でコーヒーを一杯おごる'}
          </button>
          
          <a
            href="https://ko-fi.com/siuuuukim"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setShowSupport(false)}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-colors border whitespace-nowrap text-sm ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'}`}
          >
            <span className="text-base">🍌</span>
            {lang === 'KR' ? 'Ko-fi로 후원하기' : lang === 'EN' ? 'Support via Ko-fi' : 'Ko-fiでサポート'}
          </a>
        </div>
      </Modal>
    </div>
  );
}
