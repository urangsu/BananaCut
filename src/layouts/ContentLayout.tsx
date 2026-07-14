import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import { useConsent } from '../ConsentContext';
import { BrandLogo } from '../components/BrandLogo';
import { Sun, Moon, Shield } from 'lucide-react';
import { ContentAdProvider } from '../components/ads/ContentAdProvider';

interface ContentLayoutProps {
  children: React.ReactNode;
}

export const ContentLayout: React.FC<ContentLayoutProps> = ({ children }) => {
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const { setShowCMP } = useConsent();
  const location = useLocation();

  return (
    <ContentAdProvider>
      <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDark ? 'bg-[#121212] text-white' : 'bg-gray-50 text-gray-900'
      }`}>
      {/* Public Site Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${
        isDark ? 'bg-[#121212]/80 border-white/10' : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink 
              to="/guides" 
              className={({ isActive }) => `text-sm font-medium hover:text-blue-500 transition-colors ${isActive ? 'text-blue-500' : 'opacity-70'}`}
            >
              {lang === 'KR' ? '가이드' : lang === 'JP' ? 'ガイド' : 'Guides'}
            </NavLink>
            <NavLink 
              to="/examples" 
              className={({ isActive }) => `text-sm font-medium hover:text-blue-500 transition-colors ${isActive ? 'text-blue-500' : 'opacity-70'}`}
            >
              {lang === 'KR' ? '예시' : lang === 'JP' ? '作例' : 'Examples'}
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => `text-sm font-medium hover:text-blue-500 transition-colors ${isActive ? 'text-blue-500' : 'opacity-70'}`}
            >
              About
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => `text-sm font-medium hover:text-blue-500 transition-colors ${isActive ? 'text-blue-500' : 'opacity-70'}`}
            >
              Contact
            </NavLink>
          </nav>

          {/* Utility buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors`}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language Selection */}
            <div className="flex items-center gap-0.5 p-1 rounded-full border bg-white/50 dark:bg-black/50 backdrop-blur-md border-gray-200 dark:border-white/10">
              {(['KR', 'EN', 'JP'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                    lang === l 
                      ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                      : (isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-black')
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Open Studio Button */}
            <Link 
              to="/remove"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg transition-all"
            >
              {lang === 'KR' ? '스튜디오 열기' : lang === 'JP' ? 'スタジオを開く' : 'Open Studio'}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Content Footer */}
      <footer className={`border-t transition-colors mt-auto ${
        isDark ? 'bg-[#181818] border-white/10 text-white/40' : 'bg-white border-gray-200 text-gray-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div>
            © 2026 BananaCut | BY. DALGRACSTUDIO
          </div>

          <div className="flex items-center flex-wrap gap-4 md:gap-6">
            <Link to="/guides" className="hover:text-blue-500 transition-colors">
              {lang === 'KR' ? '가이드' : lang === 'JP' ? 'ガイド' : 'Guides'}
            </Link>
            <Link to="/about" className="hover:text-blue-500 transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-blue-500 transition-colors">
              Contact
            </Link>
            <Link to="/privacy" className="hover:text-blue-500 transition-colors font-semibold text-blue-600 dark:text-blue-400">
              {lang === 'KR' ? '개인정보 보호정책' : lang === 'JP' ? 'プライバシーポリシー' : 'Privacy Policy'}
            </Link>
            <Link to="/terms" className="hover:text-blue-500 transition-colors">
              {lang === 'KR' ? '이용약관' : lang === 'JP' ? '利用規約' : 'Terms'}
            </Link>
            <button 
              onClick={() => setShowCMP(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-current text-[10px] hover:text-blue-500 transition-colors"
            >
              <Shield className="w-3 h-3" />
              {lang === 'KR' ? '쿠키 설정' : lang === 'JP' ? 'Cookie 設定' : 'Cookie Settings'}
            </button>
          </div>
        </div>
      </footer>
    </div>
    </ContentAdProvider>
  );
};
