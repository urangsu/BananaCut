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
  Shield
} from 'lucide-react';
import RemovePage from './pages/RemovePage';
import RecoverPage from './pages/RecoverPage';
import { ThemeProvider, useTheme } from './ThemeContext';
import { FFmpegProvider } from './FFmpegContext';
import { StudioProvider } from './StudioContext';
import { Modal } from './components/Modal';
import { initGA, trackEvent, trackPageView } from './lib/analytics';

function Sidebar() {
  const { isDark, toggleTheme } = useTheme();
  const [showHelp, setShowHelp] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [lang, setLang] = useState<'KR' | 'EN' | 'JP'>('KR');
  
  return (
    <div className={`w-64 border-r h-screen flex flex-col fixed left-0 top-0 z-40 transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
      <div className={`p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <h1 className={`text-2xl font-bold tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>
          BananaCut
        </h1>
        <p className={`text-xs mt-1 font-medium tracking-widest uppercase ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Dalgaurak Studio</p>
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
          <Eraser className="w-5 h-5" />
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
          <PaintBucket className="w-5 h-5" />
          <div className="flex flex-col">
            <span>RECOVER</span>
            <span className="text-[10px] opacity-60">(복구)</span>
          </div>
        </NavLink>
      </nav>
      
      <div className={`p-6 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <button 
          onClick={() => setShowHelp(true)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 mb-3 rounded-lg text-sm font-medium transition-all ${
            isDark ? 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Guide (도움말)
        </button>
        <button 
          onClick={toggleTheme}
          className={`w-full flex items-center justify-center gap-2 py-2.5 mb-4 rounded-lg text-sm font-medium transition-all ${
            isDark ? 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>

        <div className={`flex flex-col items-center gap-3 pt-2 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
          <div className={`flex flex-col items-center gap-1 text-[11px] font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowHelp(true)} className="hover:text-blue-500 transition-colors no-underline">Guide</button>
              <span className="opacity-20">|</span>
              <a href="https://ko-fi.com/siuuuukim" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500 transition-colors no-underline flex items-center gap-1">Support 🍌</a>
            </div>
            <div className="flex items-center gap-3">
              <a href="https://tally.so/r/44vorO" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors no-underline">Feedback</a>
              <span className="opacity-20">|</span>
              <button onClick={() => setShowPrivacy(true)} className="hover:text-blue-500 transition-colors no-underline">Privacy</button>
            </div>
          </div>
          
          {/* AdSense Placeholder */}
          <div className={`w-full aspect-[4/1] rounded-lg border border-dashed flex items-center justify-center text-[9px] uppercase tracking-widest ${isDark ? 'border-white/5 bg-white/5 text-white/20' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
            Advertisement
          </div>

          <div className={`text-[10px] text-center ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
            © 2026 BananaCut | Built by Dalgaurak
          </div>
        </div>
      </div>

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
                  <li><strong>크로마키 (ChromaKey):</strong> 배경색(White, Green)을 선택하거나 Picker로 직접 선택하여 배경을 투명하게 제거합니다.</li>
                  <li><strong>제외 브러쉬 (Exclusion Brush):</strong> 크로마키 제목 옆의 브러쉬 아이콘을 눌러 활성화합니다. 캔버스 위를 칠하면 해당 영역은 투명화 대상에서 제외되어 원본이 유지됩니다.</li>
                  <li><strong>Tolerance (허용 오차):</strong> 값이 클수록 비슷한 색상까지 넓게 제거됩니다.</li>
                  <li><strong>Softness (가장자리 페더링):</strong> 경계면을 부드럽게 처리하여 자연스럽게 합성되도록 합니다.</li>
                  <li><strong>Enclosed Color (내부 빈틈):</strong> 캐릭터 내부의 닫힌 공간에 있는 배경색도 함께 제거합니다.</li>
                </ul>
              </section>
              <section>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>2. RECOVER (복구) 페이지</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>스마트 채우기 (Smart Fill):</strong> 투명화 과정에서 잘못 지워진 반투명한 틈새를 복구합니다.</li>
                  <li><strong>브러쉬/라쏘/지우개:</strong> 캔버스에 색상을 채우거나 영역을 지정하여 채우고, 필요시 지울 수 있습니다.</li>
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
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>{lang === 'KR' ? '스포이드' : lang === 'EN' ? 'Eyedropper' : 'スポ이트'}:</strong> <kbd className="bg-gray-200 dark:bg-gray-700 px-1 rounded">Ctrl/Cmd</kbd> + Click</li>
              <li><strong>{lang === 'KR' ? '브러쉬 크기' : lang === 'EN' ? 'Brush Size' : 'ブラシサイズ'}:</strong> <kbd className="bg-gray-200 dark:bg-gray-700 px-1 rounded">[</kbd> / <kbd className="bg-gray-200 dark:bg-gray-700 px-1 rounded">]</kbd></li>
              <li><strong>{lang === 'KR' ? '다중 선택' : lang === 'EN' ? 'Multi-select' : '複数選択'}:</strong> <kbd className="bg-gray-200 dark:bg-gray-700 px-1 rounded">Shift</kbd> + Click</li>
              <li><strong>{lang === 'KR' ? '전체 동시 적용' : lang === 'EN' ? 'Apply to All' : '全フレーム適用'}:</strong> <kbd className="bg-gray-200 dark:bg-gray-700 px-1 rounded">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-1 rounded">Ctrl/Cmd</kbd> + Paint</li>
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
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-gray-900'}`}>
      <Sidebar />
      <main className="flex-1 ml-64 overflow-x-hidden">
        {children}
      </main>
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
            <Layout>
              <Routes>
                <Route path="/" element={<RemovePage />} />
                <Route path="/remove" element={<RemovePage />} />
                <Route path="/recover" element={<RecoverPage />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </StudioProvider>
      </FFmpegProvider>
    </ThemeProvider>
  );
}

export default App;
