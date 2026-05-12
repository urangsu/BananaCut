import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation, BrowserRouter, Link } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  HelpCircle, 
  X,
  Mail,
  Shield,
  Smartphone,
  MoreHorizontal
} from 'lucide-react';
import { BrandLogo } from './components/BrandLogo';
import { CutoutIcon, RepairIcon, SpriteSheetIcon } from './components/icons/BananaCutIcons';
import RemovePage from './pages/RemovePage';
import RecoverPage from './pages/RecoverPage';
import AssetPage from './pages/AssetPage';
import LandingPage from './pages/LandingPage';
import GuidePage from './pages/GuidePage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ExamplesPage from './pages/ExamplesPage';
import GuidesIndexPage from './pages/GuidesIndexPage';
import GuideRemoveBackgroundPage from './pages/GuideRemoveBackgroundPage';
import GuideAiVideoAssetPage from './pages/GuideAiVideoAssetPage';
import GuideSpriteSheetPage from './pages/GuideSpriteSheetPage';
import GuideCleanAlphaEdgesPage from './pages/GuideCleanAlphaEdgesPage';
import { ThemeProvider, useTheme } from './ThemeContext';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { FFmpegProvider } from './FFmpegContext';
import { StudioProvider } from './StudioContext';
import { Modal } from './components/Modal';
import { initGA, trackEvent, trackPageView } from './lib/analytics';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const [showHelp, setShowHelp] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showGetApp, setShowGetApp] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleGetApp = () => setShowGetApp(true);
    document.addEventListener('openGetApp', handleGetApp);
    return () => document.removeEventListener('openGetApp', handleGetApp);
  }, []);

  const handleGuideClick = () => {
    if (window.innerWidth < 1024) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
    setShowHelp(true);
  };

  return (
    <div className={`flex flex-col lg:flex-row h-[100dvh] lg:overflow-hidden overflow-y-auto overflow-x-hidden w-full transition-colors duration-300 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-gray-900'}`}>
      
      {/* Toast Notification */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className={`px-4 py-2 rounded-full shadow-lg text-sm font-medium whitespace-nowrap ${isDark ? 'bg-white/10 backdrop-blur-md text-white border border-white/20' : 'bg-black/80 backdrop-blur-md text-white border border-gray-800'}`}>
          {lang === 'KR' ? '바나나컷은 웹사이트 환경에 최적화되어 있습니다.' : lang === 'EN' ? 'BananaCut is optimized for a web environment.' : 'BananaCutはウェブサイト環境に最適化されています。'}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex w-64 border-r flex-col shrink-0 z-40 transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        <div className={`p-6 border-b flex items-center ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <BrandLogo size="md" />
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/remove"
            onClick={() => trackEvent('Switch_To_Remove')}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? (isDark ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-black/5 text-black border border-black/10 shadow-sm')
                  : (isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900')
              }`
            }
          >
            <CutoutIcon className="w-5 h-5" />
            <div className="flex flex-col text-left">
              <span>REMOVE</span>
              <span className="text-[10px] opacity-60">Background</span>
            </div>
          </NavLink>

          <NavLink
            to="/recover"
            onClick={() => trackEvent('Switch_To_Recover')}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? (isDark ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-black/5 text-black border border-black/10 shadow-sm')
                  : (isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900')
              }`
            }
          >
            <RepairIcon className="w-5 h-5" />
            <div className="flex flex-col text-left">
              <span>RECOVER</span>
              <span className="text-[10px] opacity-60">Edges</span>
            </div>
          </NavLink>

          <NavLink
            to="/asset"
            onClick={() => trackEvent('Switch_To_Asset')}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? (isDark ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-black/5 text-black border border-black/10 shadow-sm')
                  : (isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900')
              }`
            }
          >
            <SpriteSheetIcon className="w-5 h-5" />
            <div className="flex flex-col text-left">
              <span>ASSET</span>
              <span className="text-[10px] opacity-60">Export</span>
            </div>
          </NavLink>
        </nav>
        
        <div className={`p-6 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <NavLink 
            to="/guide"
            className={({ isActive }) =>
              `w-full flex items-center justify-center gap-2 py-2.5 mb-3 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? (isDark ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-blue-100 text-blue-700 border border-blue-200')
                  : (isDark ? 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900')
              }`
            }
          >
            <HelpCircle className="w-4 h-4" strokeWidth={1} />
            App Guide
          </NavLink>
          <button 
            onClick={toggleTheme}
            className={`w-full flex items-center justify-center gap-2 py-2.5 mb-4 rounded-lg text-sm font-medium transition-all ${
              isDark ? 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" strokeWidth={1} /> : <Moon className="w-4 h-4" strokeWidth={1} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div className={`flex flex-col items-center gap-3 pt-4 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
            <div className={`flex justify-center gap-x-4 text-[11px] font-medium w-full ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
              <button onClick={() => setShowHelp(true)} className="hover:text-blue-500 transition-colors no-underline">App Guide</button>
              <button onClick={() => setShowMore(true)} className="hover:text-blue-500 transition-colors no-underline">More</button>
            </div>
            
            <div className={`text-[10px] text-center mt-1 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
              © 2026 BananaCut
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className={`lg:hidden sticky top-0 flex flex-col shrink-0 z-50 ${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-gray-50 border-gray-200'} border-b`}>
        <div className="flex items-center justify-between p-3">
          <BrandLogo size="sm" />
          <div className="flex items-center gap-2">
            <div className={`flex gap-1 p-1 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-200'}`}>
              <NavLink to="/remove" onClick={() => trackEvent('Switch_To_Remove')} className={({isActive}) => `px-3 py-1.5 text-xs font-medium rounded-md transition-all ${isActive ? (isDark ? 'bg-purple-500/20 text-purple-400 shadow-sm' : 'bg-white text-gray-900 shadow-sm') : (isDark ? 'text-white/60' : 'text-gray-500')}`}>Remove</NavLink>
              <NavLink to="/recover" onClick={() => trackEvent('Switch_To_Recover')} className={({isActive}) => `px-3 py-1.5 text-xs font-medium rounded-md transition-all ${isActive ? (isDark ? 'bg-blue-500/20 text-blue-400 shadow-sm' : 'bg-white text-gray-900 shadow-sm') : (isDark ? 'text-white/60' : 'text-gray-500')}`}>Recover</NavLink>
              <NavLink to="/asset" onClick={() => trackEvent('Switch_To_Asset')} className={({isActive}) => `px-3 py-1.5 text-xs font-medium rounded-md transition-all ${isActive ? (isDark ? 'bg-green-500/20 text-green-400 shadow-sm' : 'bg-white text-gray-900 shadow-sm') : (isDark ? 'text-white/60' : 'text-gray-500')}`}>Asset</NavLink>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:flex-1 min-w-0 flex flex-col lg:min-h-0 lg:overflow-hidden relative w-full">
        {/* Top Right Controls (Desktop & Mobile) */}
        <div className="absolute top-4 right-4 z-50 hidden lg:flex items-center gap-2">
          {/* GET APP Button */}
          <button
            onClick={() => setShowGetApp(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' 
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            {lang === 'KR' ? '로드맵' : lang === 'EN' ? 'Roadmap' : 'ロードマップ'}
          </button>
          
          {/* Language Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-full border bg-white/50 dark:bg-black/50 backdrop-blur-md border-gray-200 dark:border-white/10">
            {(['KR', 'EN', 'JP'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                  lang === l 
                    ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                    : (isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-black')
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {children}
      </main>

      {/* Mobile Footer */}
      <footer className={`lg:hidden flex flex-col shrink-0 border-t p-4 pb-[max(env(safe-area-inset-bottom),16px)] z-40 ${isDark ? 'bg-[#1a1a1a] border-white/10 text-white/40' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 p-1 rounded-full border bg-white/50 dark:bg-black/50 backdrop-blur-md border-gray-200 dark:border-white/10">
            {(['KR', 'EN', 'JP'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 text-[10px] font-medium rounded-full transition-all ${
                  lang === l 
                    ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                    : (isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-black')
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button onClick={toggleTheme} className="flex items-center gap-1 hover:text-blue-500 text-xs font-medium">
            {isDark ? <Sun className="w-4 h-4" strokeWidth={1.5}/> : <Moon className="w-4 h-4" strokeWidth={1.5}/>} Theme
          </button>
        </div>
        
        <div className="flex flex-col items-center gap-2 mb-4 w-full px-4">
          <div className="flex justify-center gap-x-4 text-[11px] font-medium w-full">
            <button onClick={() => setShowHelp(true)} className="hover:text-blue-500 transition-colors">App Guide</button>
            <button onClick={() => setShowMore(true)} className="hover:text-blue-500 transition-colors">More</button>
          </div>
        </div>

        <div className={`text-[9px] text-center ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
          © 2026 BananaCut
        </div>
      </footer>

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

      {/* Guide Modal */}
      <Modal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title={lang === 'KR' ? 'BananaCut 사용 설명서' : lang === 'EN' ? 'BananaCut User Guide' : 'BananaCut 使用説明書'}
        icon={HelpCircle}
        lang={lang}
        setLang={setLang}
        showLanguageToggle={true}
      >
        <div className="space-y-6 text-sm leading-relaxed">
          {lang === 'KR' && (
            <>
              <section>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>1. REMOVE (투명화) 페이지</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>파일 업로드:</strong> 이미지나 동영상을 업로드하여 프레임을 추출합니다.</li>
                  <li><strong>크로마키 (ChromaKey):</strong> 배경색(White, Green)을 선택하거나 Picker로 직접 선택하여<br /> 배경을 투명하게 제거합니다.</li>
                  <li><strong>제외 브러쉬 (Exclusion Brush):</strong> 크로마키 제목 옆의 브러쉬 아이콘을 눌러 활성화합니다.<br /> 캔버스 위를 칠하면 해당 영역은 투명화 대상에서 제외되어 원본이 유지됩니다.</li>
                  <li><strong>Tolerance (허용 오차):</strong> 값이 클수록 비슷한 색상까지 넓게 제거됩니다.</li>
                  <li><strong>Softness (가장자리 페더링):</strong> 경계면을 부드럽게 처리하여 자연스럽게 합성되도록 합니다.</li>
                  <li><strong>Enclosed Color (내부 빈틈):</strong> 캐릭터 내부의 닫힌 공간에 있는 배경색도 함께 제거합니다.</li>
                </ul>
              </section>
              <section>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>2. RECOVER (복구) 페이지</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>스마트 채우기 (Smart Fill):</strong> 투명화 과정에서 잘못 지워진 반투명한 틈새를 복구합니다.</li>
                  <li><strong>브러쉬/라쏘/지우개:</strong> 캔버스에 색상을 채우거나 영역을 지정하여 채우고,<br /> 필요시 지울 수 있습니다.</li>
                </ul>
              </section>
            </>
          )}

          {lang === 'EN' && (
            <>
              <section>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>1. REMOVE Page</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>File Upload:</strong> Upload images or videos to extract frames.</li>
                  <li><strong>ChromaKey:</strong> Select background color (White, Green) or use Picker to remove background.</li>
                  <li><strong>Exclusion Brush:</strong> Click the brush icon next to ChromaKey title. Painted areas will be excluded from transparency.</li>
                  <li><strong>Tolerance:</strong> Higher values remove a wider range of similar colors.</li>
                  <li><strong>Softness:</strong> Feathers edges for natural blending.</li>
                  <li><strong>Enclosed Color:</strong> Removes background color inside closed areas of the character.</li>
                </ul>
              </section>
              <section>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>2. RECOVER Page</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Smart Fill:</strong> Recovers semi-transparent gaps accidentally removed during transparency.</li>
                  <li><strong>Brush/Lasso/Eraser:</strong> Fill colors, select areas to fill, or erase as needed.</li>
                </ul>
              </section>
            </>
          )}

          {lang === 'JP' && (
            <>
              <section>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>1. REMOVE (透明化) ページ</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>ファイルアップロード:</strong> 画像や動画をアップロードしてフレームを抽出します。</li>
                  <li><strong>クロマキー (ChromaKey):</strong> 背景色(White, Green)を選択するか、Pickerで直接選択して背景を透明に除去します。</li>
                  <li><strong>除外ブラシ (Exclusion Brush):</strong> クロマキータイトルの横にあるブラシアイコンを押して有効にします。キャンバス上を塗ると、その領域は透明化の対象から除外され、オリジナルが維持されます。</li>
                  <li><strong>Tolerance (許容誤差):</strong> 値が大きいほど、似た色まで広く除去されます。</li>
                  <li><strong>Softness (エッジフェザリング):</strong> 境界線を滑らかに処理し、自然に合成されるようにします。</li>
                  <li><strong>Enclosed Color (内部の隙間):</strong> キャラクター内部の閉じた空間にある背景色も一緒に除去します。</li>
                </ul>
              </section>
              <section>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>2. RECOVER (復元) ページ</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>スマートフィル (Smart Fill):</strong> 透明化の過程で誤って消された半透明な隙間を復元します。</li>
                  <li><strong>ブラシ/投げ縄/消しゴム:</strong> キャンバスに色を塗ったり、領域を指定して塗ったり、必要に応じて消したりできます。</li>
                </ul>
              </section>
            </>
          )}

          <section>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {lang === 'KR' ? '단축키' : lang === 'EN' ? 'Shortcuts' : 'ショートカット'}
            </h3>
            <ul className="list-disc pl-5 space-y-3">
              <li><strong>{lang === 'KR' ? '스포이드' : lang === 'EN' ? 'Eyedropper' : 'スポイト'}:</strong> <kbd className="px-2 py-1 rounded-md border-2 text-xs font-mono font-bold shadow-sm bg-gray-200 border-gray-400 text-black dark:bg-gray-700 dark:border-gray-500 dark:text-white">Ctrl/Cmd</kbd> + Click</li>
              <li><strong>{lang === 'KR' ? '브러쉬 크기' : lang === 'EN' ? 'Brush Size' : 'ブラシサイズ'}:</strong> <kbd className="px-2 py-1 rounded-md border-2 text-xs font-mono font-bold shadow-sm bg-gray-200 border-gray-400 text-black dark:bg-gray-700 dark:border-gray-500 dark:text-white">[</kbd> / <kbd className="px-2 py-1 rounded-md border-2 text-xs font-mono font-bold shadow-sm bg-gray-200 border-gray-400 text-black dark:bg-gray-700 dark:border-gray-500 dark:text-white">]</kbd></li>
              <li><strong>{lang === 'KR' ? '다중 선택' : lang === 'EN' ? 'Multi-select' : '複数選択'}:</strong> <kbd className="px-2 py-1 rounded-md border-2 text-xs font-mono font-bold shadow-sm bg-gray-200 border-gray-400 text-black dark:bg-gray-700 dark:border-gray-500 dark:text-white">Shift</kbd> + Click</li>
              <li><strong>{lang === 'KR' ? '전체 동시 적용' : lang === 'EN' ? 'Apply to All' : '全フレーム適用'}:</strong> <kbd className="px-2 py-1 rounded-md border-2 text-xs font-mono font-bold shadow-sm bg-gray-200 border-gray-400 text-black dark:bg-gray-700 dark:border-gray-500 dark:text-white">Shift</kbd> + <kbd className="px-2 py-1 rounded-md border-2 text-xs font-mono font-bold shadow-sm bg-gray-200 border-gray-400 text-black dark:bg-gray-700 dark:border-gray-500 dark:text-white">Ctrl/Cmd</kbd> + Paint</li>
            </ul>
          </section>
        </div>
      </Modal>

      {/* GET APP Modal */}
      <Modal
        isOpen={showGetApp}
        onClose={() => setShowGetApp(false)}
        title="Roadmap"
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
              {lang === 'KR' ? '웹 버전이 안정화된 뒤 앱 버전을 검토할 예정입니다.' : lang === 'EN' ? 'An app version is planned after the web workflow is stable.' : 'Web版が安定した後、アプリ版を検討する予定です。'}
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

      {/* More Modal */}
      <Modal
        isOpen={showMore}
        onClose={() => setShowMore(false)}
        title={lang === 'KR' ? '더보기' : lang === 'EN' ? 'More' : 'その他'}
        icon={MoreHorizontal}
        lang={lang}
        setLang={setLang}
        maxWidthClass="max-w-[400px]"
      >
        <div className="space-y-6 py-2">
          {/* Learn */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Learn</h4>
            <div className="flex flex-col gap-1">
              <Link to="/guides" onClick={() => setShowMore(false)} className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-white/10 ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
                Articles
              </Link>
              <Link to="/examples" onClick={() => setShowMore(false)} className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-white/10 ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
                Examples
              </Link>
            </div>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Legal</h4>
            <div className="flex flex-col gap-1">
              <Link to="/privacy" onClick={() => setShowMore(false)} className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-white/10 ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
                Privacy
              </Link>
              <Link to="/terms" onClick={() => setShowMore(false)} className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-white/10 ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
                Terms
              </Link>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Feedback</h4>
            <div className="flex flex-col gap-1">
              <a href="https://tally.so/r/44vorO" target="_blank" rel="noopener noreferrer" onClick={() => setShowMore(false)} className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-white/10 ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
                Feedback
              </a>
              <button onClick={() => { setShowMore(false); setShowSupport(true); }} className="w-full text-left px-3 py-2.5 rounded-xl transition-colors text-yellow-600 dark:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 font-bold flex items-center justify-between">
                <span>Support 🍌</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ScrollToTop() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
}

function App() {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <FFmpegProvider>
          <StudioProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/remove" element={<Layout><RemovePage /></Layout>} />
                <Route path="/recover" element={<Layout><RecoverPage /></Layout>} />
                <Route path="/asset" element={<Layout><AssetPage /></Layout>} />
                <Route path="/guide" element={<Layout><GuidePage /></Layout>} />
                <Route path="/guides" element={<Layout><GuidesIndexPage /></Layout>} />
                <Route path="/guides/remove-background-from-video" element={<Layout><GuideRemoveBackgroundPage /></Layout>} />
                <Route path="/guides/ai-video-to-game-asset" element={<Layout><GuideAiVideoAssetPage /></Layout>} />
                <Route path="/guides/sprite-sheet-generator" element={<Layout><GuideSpriteSheetPage /></Layout>} />
                <Route path="/guides/clean-alpha-edges" element={<Layout><GuideCleanAlphaEdgesPage /></Layout>} />
                <Route path="/about" element={<Layout><AboutPage /></Layout>} />
                <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
                <Route path="/examples" element={<Layout><ExamplesPage /></Layout>} />
                <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
                <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
              </Routes>
            </BrowserRouter>
          </StudioProvider>
        </FFmpegProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
