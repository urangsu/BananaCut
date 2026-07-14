import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import { 
  Sun, 
  Moon, 
  HelpCircle, 
  Smartphone, 
  MoreHorizontal,
  X
} from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { CutoutIcon, RepairIcon, SpriteSheetIcon } from '../components/icons/BananaCutIcons';
import { Modal } from '../components/Modal';

interface StudioLayoutProps {
  children: React.ReactNode;
}

export const StudioLayout: React.FC<StudioLayoutProps> = ({ children }) => {
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
              <span className="text-[10px] opacity-60">
                {lang === "KR" ? "배경 제거" : lang === "JP" ? "背景" : "Background"}
              </span>
            </div>
          </NavLink>

          <NavLink
            to="/recover"
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
              <span className="text-[10px] opacity-60">
                {lang === "KR" ? "가장자리 복구" : lang === "JP" ? "エッジ" : "Edges"}
              </span>
            </div>
          </NavLink>

          <NavLink
            to="/asset"
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
              <span className="text-[10px] opacity-60">
                {lang === "KR" ? "에셋 내보내기" : lang === "JP" ? "エクスポート" : "Export"}
              </span>
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
            {lang === 'KR' ? '앱 가이드' : lang === 'JP' ? 'アプリガイド' : 'App Guide'}
          </NavLink>
          <button 
            onClick={toggleTheme}
            className={`w-full flex items-center justify-center gap-2 py-2.5 mb-4 rounded-lg text-sm font-medium transition-all ${
              isDark ? 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" strokeWidth={1} /> : <Moon className="w-4 h-4" strokeWidth={1} />}
            {isDark 
              ? (lang === 'KR' ? '라이트 모드' : lang === 'JP' ? 'ライトモード' : 'Light Mode') 
              : (lang === 'KR' ? '다크 모드' : lang === 'JP' ? 'ダークモード' : 'Dark Mode')}
          </button>

          <div className={`flex flex-col items-center gap-3 pt-4 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] font-medium w-full text-center">
              <Link to="/privacy" className="hover:text-blue-500 transition-colors">
                {lang === 'KR' ? '개인정보' : lang === 'JP' ? 'プライバシー' : 'Privacy'}
              </Link>
              <a href="https://tally.so/r/44vorO" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">
                {lang === 'KR' ? '피드백' : lang === 'JP' ? 'フィードバック' : 'Feedback'}
              </a>
              <button 
                onClick={() => setShowSupport(true)} 
                className="flex items-center justify-center gap-1 text-[#FACC15] hover:text-yellow-400 transition-colors font-bold"
              >
                🍌 {lang === 'KR' ? '후원하기' : lang === 'EN' ? 'Support Us' : '応援する'}
              </button>
              <button onClick={() => setShowMore(true)} className="hover:text-blue-500 transition-colors">
                {lang === 'KR' ? '더보기' : lang === 'JP' ? 'その他' : 'More'}
              </button>
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
              <NavLink to="/remove" className={({isActive}) => `px-3 py-1.5 text-xs font-medium rounded-md transition-all ${isActive ? (isDark ? 'bg-purple-500/20 text-purple-400 shadow-sm' : 'bg-white text-gray-900 shadow-sm') : (isDark ? 'text-white/60' : 'text-gray-500')}`}>Remove</NavLink>
              <NavLink to="/recover" className={({isActive}) => `px-3 py-1.5 text-xs font-medium rounded-md transition-all ${isActive ? (isDark ? 'bg-blue-500/20 text-blue-400 shadow-sm' : 'bg-white text-gray-900 shadow-sm') : (isDark ? 'text-white/60' : 'text-gray-500')}`}>Recover</NavLink>
              <NavLink to="/asset" className={({isActive}) => `px-3 py-1.5 text-xs font-medium rounded-md transition-all ${isActive ? (isDark ? 'bg-green-500/20 text-green-400 shadow-sm' : 'bg-white text-gray-900 shadow-sm') : (isDark ? 'text-white/60' : 'text-gray-500')}`}>Asset</NavLink>
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
            {lang === 'KR' ? '앱 다운로드' : lang === 'EN' ? 'GET APP' : 'アプリ入手'}
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
            {isDark ? <Sun className="w-4 h-4" strokeWidth={1.5}/> : <Moon className="w-4 h-4" strokeWidth={1.5}/>} {lang === 'KR' ? '테마' : lang === 'JP' ? 'テーマ' : 'Theme'}
          </button>
        </div>
        
        <div className="flex flex-col items-center gap-2 mb-4 w-full px-4 text-[11px] font-medium">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full text-center">
            <Link to="/privacy" className="hover:text-blue-500 transition-colors">
              {lang === 'KR' ? '개인정보' : lang === 'JP' ? 'プライバシー' : 'Privacy'}
            </Link>
            <a href="https://tally.so/r/44vorO" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">
              {lang === 'KR' ? '피드백' : lang === 'JP' ? 'フィードバック' : 'Feedback'}
            </a>
            <button 
              onClick={() => setShowSupport(true)} 
              className="flex items-center justify-center gap-1 text-[#FACC15] hover:text-yellow-400 transition-colors font-bold"
            >
              🍌 {lang === 'KR' ? '후원하기' : lang === 'EN' ? 'Support Us' : '応援する'}
            </button>
            <button onClick={() => setShowMore(true)} className="hover:text-blue-500 transition-colors">
              {lang === 'KR' ? '더보기' : lang === 'JP' ? 'その他' : 'More'}
            </button>
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
              window.open("https://toon.at/donate/dalgracstudio", "_blank");
              setShowSupport(false);
            }}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#673ab7] text-white font-medium hover:bg-[#5e35b1] transition-colors shadow-sm whitespace-nowrap text-sm"
          >
            ☕ {lang === 'KR' ? '커피 후원하기' : lang === 'EN' ? 'Buy us a coffee' : 'コーヒーをおごる'}
          </button>
          
          <a
            href="https://ko-fi.com/siuuuukim"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setShowSupport(false)}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-colors border whitespace-nowrap text-sm ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'}`}
          >
            🍌 {lang === 'KR' ? 'Ko-fi로 후원하기' : lang === 'EN' ? 'Support via Ko-fi' : 'Ko-fiでサポート'}
          </a>
        </div>
      </Modal>

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
            <div className="flex flex-col items-center justify-center text-gray-400 p-8">
              <Smartphone className="w-12 h-12 mb-2 opacity-20" />
              <span className="text-sm font-medium">Coming Soon</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold">
              {lang === 'KR' ? '아직 어플 준비 중입니다.' : lang === 'EN' ? 'App is under development.' : 'アプリは準備中です。'}
            </h3>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
              {lang === 'KR' ? '반응이 좋으면 준비해볼게요! 🍌' : lang === 'EN' ? "We'll prepare it if there's good feedback! 🍌" : '反響が良ければ準備します！ 🍌'}
            </p>
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
          
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Company</h4>
            <div className="flex flex-col gap-1">
              <Link to="/about" onClick={() => setShowMore(false)} className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-white/10 ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
                About
              </Link>
              <Link to="/contact" onClick={() => setShowMore(false)} className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-white/10 ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
                Contact
              </Link>
              <Link to="/privacy" onClick={() => setShowMore(false)} className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-white/10 ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
                Privacy
              </Link>
              <Link to="/terms" onClick={() => setShowMore(false)} className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-white/10 ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
                Terms
              </Link>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
