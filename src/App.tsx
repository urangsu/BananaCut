import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation, BrowserRouter } from 'react-router-dom';
import { 
  Eraser, 
  PaintBucket, 
  Sun, 
  Moon, 
  HelpCircle, 
  X,
  Mail,
  Shield,
  Smartphone
} from 'lucide-react';
import RemovePage from './pages/RemovePage';
import RecoverPage from './pages/RecoverPage';
import LandingPage from './pages/LandingPage';
import { ThemeProvider, useTheme } from './ThemeContext';
import { FFmpegProvider } from './FFmpegContext';
import { StudioProvider } from './StudioContext';
import { Modal } from './components/Modal';
import { initGA, trackEvent, trackPageView } from './lib/analytics';

function Layout({ children }: { children: React.ReactNode }) {
  const { isDark, toggleTheme } = useTheme();
  const [showHelp, setShowHelp] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showGetApp, setShowGetApp] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [lang, setLang] = useState<'KR' | 'EN' | 'JP'>('KR');

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
        <div className={`p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <h1 className={`text-2xl font-bold tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>
            BananaCut
          </h1>
          <p className={`text-xs mt-1 font-medium tracking-widest uppercase ${isDark ? 'text-white/40' : 'text-gray-500'}`}>By. Dalgrac Studio</p>
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
            <Eraser className="w-5 h-5" strokeWidth={1} />
            <div className="flex flex-col">
              <span>REMOVE</span>
              <span className="text-[10px] opacity-60">(투명화)</span>
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
            <PaintBucket className="w-5 h-5" strokeWidth={1} />
            <div className="flex flex-col">
              <span>RECOVER</span>
              <span className="text-[10px] opacity-60">(복구)</span>
            </div>
          </NavLink>
        </nav>
        
        <div className={`p-6 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <button 
            onClick={handleGuideClick}
            className={`w-full flex items-center justify-center gap-2 py-2.5 mb-3 rounded-lg text-sm font-medium transition-all ${
              isDark ? 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" strokeWidth={1} />
            Guide (도움말)
          </button>
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
            <div className={`flex flex-col items-center gap-1 text-[11px] font-medium w-full ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-x-3 gap-y-2 items-center w-full">
                <button onClick={handleGuideClick} className="hover:text-blue-500 transition-colors no-underline text-right">Guide</button>
                <span className="opacity-20 text-center">|</span>
                <button onClick={() => setShowPrivacy(true)} className="hover:text-blue-500 transition-colors no-underline text-left">Privacy</button>

                <button onClick={() => setShowSupport(true)} className="hover:text-yellow-500 transition-colors no-underline flex items-center justify-end gap-1 font-medium text-yellow-600 dark:text-yellow-500">Support 🍌</button>
                <span className="opacity-20 text-center">|</span>
                <a href="https://tally.so/r/44vorO" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors no-underline text-left">Feedback</a>
              </div>
            </div>
            
            <div className={`text-[10px] text-center mt-2 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
              © 2026 BananaCut | By. Dalgrac Studio
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className={`lg:hidden sticky top-0 flex flex-col shrink-0 z-50 ${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-gray-50 border-gray-200'} border-b`}>
        <div className="flex items-center justify-between p-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 font-bold text-lg tracking-tighter">
              BananaCut
            </div>
            <div className={`text-[9px] font-medium tracking-widest uppercase leading-tight ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
              <div>BY. DALGRAC</div>
              <div className="pl-[22px]">STUDIO</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex gap-1 p-1 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-200'}`}>
              <NavLink to="/remove" onClick={() => trackEvent('Switch_To_Remove')} className={({isActive}) => `px-3 py-1.5 text-xs font-medium rounded-md transition-all ${isActive ? (isDark ? 'bg-purple-500/20 text-purple-400 shadow-sm' : 'bg-white text-gray-900 shadow-sm') : (isDark ? 'text-white/60' : 'text-gray-500')}`}>Remove</NavLink>
              <NavLink to="/recover" onClick={() => trackEvent('Switch_To_Recover')} className={({isActive}) => `px-3 py-1.5 text-xs font-medium rounded-md transition-all ${isActive ? (isDark ? 'bg-blue-500/20 text-blue-400 shadow-sm' : 'bg-white text-gray-900 shadow-sm') : (isDark ? 'text-white/60' : 'text-gray-500')}`}>Recover</NavLink>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:flex-1 min-w-0 flex flex-col lg:min-h-0 lg:overflow-hidden relative w-full">
        {/* Language Toggle (Desktop & Mobile) */}
        <div className="absolute top-4 right-4 z-50 hidden lg:flex items-center gap-1 p-1 rounded-full border bg-white/50 dark:bg-black/50 backdrop-blur-md border-gray-200 dark:border-white/10">
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
          <div className="grid grid-cols-[1fr_auto_1fr] gap-x-3 gap-y-2 items-center text-[11px] font-medium w-full max-w-[240px]">
            <button onClick={handleGuideClick} className="hover:text-blue-500 transition-colors text-right">Guide</button>
            <span className="opacity-20 text-center">|</span>
            <button onClick={() => setShowPrivacy(true)} className="hover:text-blue-500 transition-colors text-left">Privacy</button>
            
            <button onClick={() => setShowSupport(true)} className="text-yellow-500 hover:text-yellow-600 transition-colors flex items-center justify-end gap-1 font-bold">Support 🍌</button>
            <span className="opacity-20 text-center">|</span>
            <a href="https://tally.so/r/44vorO" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors text-left">Feedback</a>
          </div>
        </div>

        <div className={`text-[9px] text-center ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
          © 2026 BananaCut | By. Dalgrac Studio
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

      {/* Privacy Modal */}
      <Modal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        title={lang === 'KR' ? 'BananaCut 통합 정책 (Privacy & Terms)' : lang === 'EN' ? 'BananaCut Integrated Policy (Privacy & Terms)' : 'BananaCut 統合ポリシー (Privacy & Terms)'}
        icon={Shield}
        lang={lang}
        setLang={setLang}
      >
        <div className="space-y-6 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {lang === 'KR' && (
            <div className="space-y-6">
              <section>
                <h3 className="font-bold text-base mb-2">개인정보 처리방침 (Privacy Policy)</h3>
                <div className="space-y-2 opacity-80">
                  <p><strong>1. 데이터 처리:</strong> BananaCut은 모든 이미지 및 비디오 처리를 사용자의 브라우저 내에서 직접 수행합니다. 어떠한 원본 파일이나 편집 데이터도 서버로 전송하거나 저장하지 않습니다.</p>
                  <p><strong>2. 쿠키 및 광고:</strong> 본 서비스는 Google AdSense를 통한 광고 송출 및 서비스 분석을 위해 쿠키를 사용합니다. 쿠키는 사용자의 브라우저에 저장되는 작은 텍스트 파일로, 맞춤형 광고 제공을 위해 사용될 수 있습니다.</p>
                  <p><strong>3. 제3자 서비스:</strong> 후원(Ko-fi), 설문(Tally) 등 외부 서비스 이용 시 해당 플랫폼의 개인정보 정책이 적용됩니다.</p>
                </div>
              </section>
              <section>
                <h3 className="font-bold text-base mb-2">이용약관 (Terms of Service)</h3>
                <div className="space-y-2 opacity-80">
                  <p><strong>1. 저작권:</strong> 사용자는 본 서비스를 통해 처리하는 콘텐츠에 대한 정당한 권리를 보유해야 합니다. 결과물 사용으로 인해 발생하는 저작권 분쟁의 책임은 전적으로 사용자에게 있습니다.</p>
                  <p><strong>2. 서비스 제공:</strong> 본 서비스는 '있는 그대로(As-Is)' 제공되며, 무상 서비스 특성상 예고 없이 기능이 변경되거나 중단될 수 있습니다.</p>
                  <p><strong>3. 금지 행위:</strong> 서비스의 정상적인 운영을 방해하는 자동화된 접근, 스크래핑, 또는 시스템 부하 유발 행위를 금지합니다.</p>
                </div>
              </section>
            </div>
          )}
          {lang === 'EN' && (
            <div className="space-y-6">
              <section>
                <h3 className="font-bold text-base mb-2">Privacy Policy</h3>
                <div className="space-y-2 opacity-80">
                  <p><strong>1. Data Processing:</strong> BananaCut processes all images and videos directly within your browser. No original files or edited data are ever uploaded to or stored on our servers.</p>
                  <p><strong>2. Cookies & Ads:</strong> We use cookies for Google AdSense to serve ads and analyze service usage. Cookies are small text files stored in your browser to provide personalized advertising experiences.</p>
                  <p><strong>3. Third-party Services:</strong> Usage of external platforms like Ko-fi (Support) or Tally (Feedback) is subject to their respective privacy policies.</p>
                </div>
              </section>
              <section>
                <h3 className="font-bold text-base mb-2">Terms of Service</h3>
                <div className="space-y-2 opacity-80">
                  <p><strong>1. Copyright:</strong> Users must hold the necessary rights to the content processed through this service. Users bear full responsibility for any copyright issues arising from the results.</p>
                  <p><strong>2. Service Provision:</strong> This service is provided 'As-Is.' As a free service, features may be changed or discontinued without prior notice.</p>
                  <p><strong>3. Prohibited Acts:</strong> Automated access, scraping, or any activity that causes abnormal system load is strictly prohibited.</p>
                </div>
              </section>
            </div>
          )}
          {lang === 'JP' && (
            <div className="space-y-6">
              <section>
                <h3 className="font-bold text-base mb-2">個人情報処理方針</h3>
                <div className="space-y-2 opacity-80">
                  <p><strong>1. データ処理:</strong> BananaCutは、すべての画像およびビデオ処理をユーザーのブラウザ内で直接実行します。元のファイルや編集データがサーバーに送信または保存されることはありません。</p>
                  <p><strong>2. クッキーと広告:</strong> Google AdSenseを通じた広告配信およびサービス分析のためにクッキーを使用します。クッキーはカスタマイズされた広告提供のために使用される場合があります。</p>
                  <p><strong>3. 第三者サービス:</strong> 寄付(Ko-fi)やアンケート(Tally)などの外部サービスを利用する場合、各プラットフォームのポリシーが適用されます。</p>
                </div>
              </section>
              <section>
                <h3 className="font-bold text-base mb-2">利用規約</h3>
                <div className="space-y-2 opacity-80">
                  <p><strong>1. 著作権:</strong> ユーザーは、本サービスを通じて処理するコンテンツに対して正当な権利を保有している必要があります。結果物の使用により発生する著作権紛争の責任はユーザーに帰属します。</p>
                  <p><strong>2. サービスの提供:</strong> 本サービスは「現状のまま(As-Is)」提供されます。無料サービスの特性上、予告なく機能が変更または中断される場合があります。</p>
                  <p><strong>3. 禁止事項:</strong> サービスの正常な運営を妨げる自動アクセス、スクレイピング、またはシステム負荷を誘発する行為を禁止します。</p>
                </div>
              </section>
            </div>
          )}
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
          <div className="w-full bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden relative">
            <img 
              src="/team.png" 
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
            By. Dalgrac Studio
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
      <FFmpegProvider>
        <StudioProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/remove" element={<Layout><RemovePage /></Layout>} />
              <Route path="/recover" element={<Layout><RecoverPage /></Layout>} />
            </Routes>
          </BrowserRouter>
        </StudioProvider>
      </FFmpegProvider>
    </ThemeProvider>
  );
}

export default App;
