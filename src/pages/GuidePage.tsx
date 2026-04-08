import React, { useEffect, useState } from 'react';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';

export default function GuidePage() {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'quick' | 'detailed' | 'prompt'>('quick');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: Add a toast notification or feedback
  };

  return (
    <div className={`flex-1 overflow-y-auto w-full h-full ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
        <header className="mb-16 border-b pb-8 border-gray-200 dark:border-white/10">
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-4">
            {lang === 'KR' ? '바나나컷 가이드' : lang === 'EN' ? 'BananaCut Guide' : 'BananaCut ガイド'}
          </h1>
          <p className={`text-xl ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
            {lang === 'KR' ? '브라우저 기반 배경 제거 및 시퀀스 복구에 대한 모든 것을 알아보세요.' : 
             lang === 'EN' ? 'Everything you need to know about in-browser background removal and sequence recovery.' : 
             'ブラウザベースの背景削除とシーケンス復元について知っておくべきすべてのこと。'}
          </p>
        </header>

        {/* 3-Tab UI */}
        <div className="flex justify-center mb-12">
          <div className={`inline-flex p-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
            {(['quick', 'detailed', 'prompt'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                  activeTab === tab
                    ? (isDark ? 'bg-white text-black shadow-md' : 'bg-white text-gray-900 shadow-md')
                    : (isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                }`}
              >
                {tab === 'quick' ? (lang === 'KR' ? '요약 가이드' : lang === 'EN' ? 'Quick Guide' : '要約ガイド') :
                 tab === 'detailed' ? (lang === 'KR' ? '세부 가이드' : lang === 'EN' ? 'Detailed Guide' : '詳細ガイド') :
                 (lang === 'KR' ? '프롬프트 가이드' : lang === 'EN' ? 'Prompt Guide' : 'プロンプトガイド')}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="relative">
          {/* Quick Guide Content */}
          <div className={`transition-all duration-500 ${activeTab === 'quick' ? 'opacity-100 visible' : 'opacity-0 invisible absolute top-0 left-0 w-full'}`}>
            <div className="space-y-12">
              <section>
                <h2 className="text-2xl font-bold mb-6 tracking-tight text-blue-600 dark:text-blue-400">
                  {lang === 'KR' ? '1. REMOVE (투명화) 페이지' : lang === 'EN' ? '1. REMOVE Page' : '1. REMOVE（透明化）ページ'}
                </h2>
                <ul className={`space-y-4 list-disc pl-5 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                  <li><strong>{lang === 'KR' ? '파일 업로드: ' : lang === 'EN' ? 'File Upload: ' : 'ファイルアップロード：'}</strong> {lang === 'KR' ? '이미지나 동영상을 업로드하여 프레임을 추출합니다.' : lang === 'EN' ? 'Upload an image or video to extract frames.' : '画像や動画をアップロードしてフレームを抽出します。'}</li>
                  <li><strong>{lang === 'KR' ? '크로마키 (ChromaKey): ' : lang === 'EN' ? 'ChromaKey: ' : 'クロマキー（ChromaKey）：'}</strong> {lang === 'KR' ? '배경색(White, Green)을 선택하거나 Picker로 직접 선택하여 배경을 투명하게 제거합니다.' : lang === 'EN' ? 'Select a background color (White, Green) or use the Picker to remove the background transparently.' : '背景色（White、Green）を選択するか、Pickerで直接選択して背景を透明に削除します。'}</li>
                  <li><strong>{lang === 'KR' ? '제외 브러쉬 (Exclusion Brush): ' : lang === 'EN' ? 'Exclusion Brush: ' : '除外ブラシ（Exclusion Brush）：'}</strong> {lang === 'KR' ? '크로마키 제목 옆의 브러쉬 아이콘을 눌러 활성화합니다. 캔버스 위를 칠하면 해당 영역은 투명화 대상에서 제외되어 원본이 유지됩니다.' : lang === 'EN' ? 'Click the brush icon next to the ChromaKey title to activate. Paint over the canvas to exclude areas from transparency, preserving the original.' : 'クロマキーのタイトルの横にあるブラシアイコンをクリックして有効にします。キャンバス上を塗ると、その領域は透明化の対象から除外され、オリジナルが保持されます。'}</li>
                  <li><strong>{lang === 'KR' ? 'Tolerance (허용 오차): ' : lang === 'EN' ? 'Tolerance: ' : 'Tolerance（許容誤差）：'}</strong> {lang === 'KR' ? '값이 클수록 비슷한 색상까지 넓게 제거됩니다.' : lang === 'EN' ? 'Higher values remove a wider range of similar colors.' : '値が大きいほど、似た色まで広く削除されます。'}</li>
                  <li><strong>{lang === 'KR' ? 'Softness (가장자리 페더링): ' : lang === 'EN' ? 'Softness: ' : 'Softness（エッジのぼかし）：'}</strong> {lang === 'KR' ? '경계면을 부드럽게 처리하여 자연스럽게 합성되도록 합니다.' : lang === 'EN' ? 'Feathers the edges for a natural blend.' : '境界を滑らかに処理し、自然に合成されるようにします。'}</li>
                  <li><strong>{lang === 'KR' ? 'Enclosed Color (내부 빈틈): ' : lang === 'EN' ? 'Enclosed Color: ' : 'Enclosed Color（内部の隙間）：'}</strong> {lang === 'KR' ? '캐릭터 내부의 닫힌 공간에 있는 배경색도 함께 제거합니다.' : lang === 'EN' ? 'Removes background colors trapped inside closed spaces of the character.' : 'キャラクター内部の閉じた空間にある背景色も一緒に削除します。'}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6 tracking-tight text-blue-600 dark:text-blue-400">
                  {lang === 'KR' ? '2. RECOVER (복구) 페이지' : lang === 'EN' ? '2. RECOVER Page' : '2. RECOVER（復元）ページ'}
                </h2>
                <ul className={`space-y-4 list-disc pl-5 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                  <li><strong>{lang === 'KR' ? '스마트 채우기 (Smart Fill): ' : lang === 'EN' ? 'Smart Fill: ' : 'スマートフィル（Smart Fill）：'}</strong> {lang === 'KR' ? '투명화 과정에서 잘못 지워진 반투명한 틈새를 복구합니다.' : lang === 'EN' ? 'Recovers semi-transparent gaps mistakenly erased during the removal process.' : '透明化の過程で誤って消去された半透明の隙間を復元します。'}</li>
                  <li><strong>{lang === 'KR' ? '브러쉬/라쏘/지우개: ' : lang === 'EN' ? 'Brush/Lasso/Eraser: ' : 'ブラシ/なげなわ/消しゴム：'}</strong> {lang === 'KR' ? '캔버스에 색상을 채우거나 영역을 지정하여 채우고, 필요시 지울 수 있습니다.' : lang === 'EN' ? 'Fill colors or select areas on the canvas, and erase if necessary.' : 'キャンバスに色を塗ったり、領域を指定して塗りつぶしたり、必要に応じて消去したりできます。'}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6 tracking-tight text-blue-600 dark:text-blue-400">
                  {lang === 'KR' ? '단축키' : lang === 'EN' ? 'Shortcuts' : 'ショートカット'}
                </h2>
                <ul className={`space-y-4 list-disc pl-5 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                  <li className="flex items-center gap-2"><strong>{lang === 'KR' ? '화면 확대/축소: ' : lang === 'EN' ? 'Zoom In/Out: ' : 'ズームイン/アウト：'}</strong> <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>Ctrl/Cmd</kbd> + <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>Wheel</kbd></li>
                  <li className="flex items-center gap-2"><strong>{lang === 'KR' ? '화면 맞춤/원본 크기: ' : lang === 'EN' ? 'Fit/100% Size: ' : '画面に合わせる/元のサイズ：'}</strong> {lang === 'KR' ? '줌 비율 텍스트 클릭' : lang === 'EN' ? 'Click zoom percentage text' : 'ズームのパーセンテージテキストをクリック'}</li>
                  <li className="flex items-center gap-2"><strong>{lang === 'KR' ? '스포이드: ' : lang === 'EN' ? 'Eyedropper: ' : 'スポイト：'}</strong> <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>Ctrl/Cmd</kbd> + Click</li>
                  <li className="flex items-center gap-2"><strong>{lang === 'KR' ? '브러쉬 크기: ' : lang === 'EN' ? 'Brush Size: ' : 'ブラシサイズ：'}</strong> <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>[</kbd> / <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>]</kbd></li>
                  <li className="flex items-center gap-2"><strong>{lang === 'KR' ? '다중 선택: ' : lang === 'EN' ? 'Multi-Select: ' : '複数選択：'}</strong> <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>Shift</kbd> + Click</li>
                  <li className="flex items-center gap-2"><strong>{lang === 'KR' ? '선택 구간 동시 적용: ' : lang === 'EN' ? 'Apply to Selected Segments: ' : '選択区間同時適用：'}</strong> <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>Shift</kbd> + <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>Ctrl/Cmd</kbd> + Paint</li>
                  <li className="flex items-center gap-2"><strong>{lang === 'KR' ? '모션 구간 시간/프레임 전환: ' : lang === 'EN' ? 'Toggle Motion Segment Time/Frame: ' : 'モーション区間時間/フレーム切り替え：'}</strong> {lang === 'KR' ? '구간 설정 내 [Time/Frame] 버튼 클릭' : lang === 'EN' ? 'Click [Time/Frame] button in segment settings' : '区間設定内の[Time/Frame]ボタンをクリック'}</li>
                </ul>
              </section>
            </div>
          </div>

          {/* Detailed Guide Content */}
          <div className={`transition-all duration-500 ${activeTab === 'detailed' ? 'opacity-100 visible' : 'opacity-0 invisible absolute top-0 left-0 w-full'}`}>
            <div className={`space-y-12 ${isDark ? 'text-white/80' : 'text-gray-800'}`}>
              
              <section>
                <h2 className="text-3xl font-bold mb-6 tracking-tight">
                  {lang === 'KR' ? '1. 바나나컷 소개 (Introduction)' : lang === 'EN' ? '1. Introduction' : '1. BananaCutの紹介'}
                </h2>
                <p className="leading-relaxed">
                  {lang === 'KR' ? '바나나컷은 크리에이터, 3D 아티스트, 영상 편집자를 위해 설계된 100% 무료 웹 기반 에셋 팩토리입니다. 고성능 웹 기반 엔진을 활용하여 브라우저 환경에서 모든 프레임을 직접 처리합니다. 업로드 대기 시간 제로, 완벽한 데이터 보안, 무제한 사용을 보장합니다.' : 
                   lang === 'EN' ? 'BananaCut is a 100% free web-based asset factory designed for creators, 3D artists, and video editors. Using a high-performance web engine, it processes every frame locally in your browser. Guaranteeing zero upload time, absolute data privacy, and unlimited usage.' : 
                   'BananaCutは、クリエイター、3Dアーティスト、ビデオ編集者のために設計された100%無料のウェブベースのアセットファクトリーです。高性能ウェブエンジンを活用し、ブラウザ環境ですべてのフレームを直接処理します。アップロードの待ち時間ゼロ、完璧なデータセキュリティ、無制限の使用を保証します。'}
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-6 tracking-tight">
                  {lang === 'KR' ? '2. REMOVE: 스마트 크로마키 (Smart Extraction)' : lang === 'EN' ? '2. REMOVE: Smart Extraction' : '2. REMOVE: スマート抽出'}
                </h2>
                <p className="mb-4">{lang === 'KR' ? '단색 배경에서 피사체를 완벽하게 추출하는 핵심 작업 공간입니다.' : lang === 'EN' ? 'The core workspace for perfectly extracting subjects from solid backgrounds.' : '単色背景から被写体を完璧に抽出するコアワークスペースです。'}</p>
                <ul className="space-y-3 list-disc pl-5">
                  <li><strong>{lang === 'KR' ? '파일 업로드: ' : lang === 'EN' ? 'Upload: ' : 'ファイルアップロード: '}</strong>{lang === 'KR' ? '비디오(MP4, WEBM) 또는 이미지 시퀀스를 업로드하여 프레임 단위로 분리합니다.' : lang === 'EN' ? 'Load video (MP4, WEBM) or image sequences to separate them into frames.' : 'ビデオ（MP4、WEBM）または画像シーケンスをアップロードしてフレーム単位で分離します。'}</li>
                  <li><strong>{lang === 'KR' ? '크로마키 (ChromaKey): ' : lang === 'EN' ? 'ChromaKey: ' : 'クロマキー: '}</strong>{lang === 'KR' ? '배경색(White, Green) 프리셋을 누르거나 컬러 피커로 직접 배경을 선택하여 투명화합니다.' : lang === 'EN' ? 'Click the White/Green presets or use the color picker to select the background to remove.' : '背景色（White、Green）のプリセットを押すか、カラーピッカーで直接背景を選択して透明化します。'}</li>
                  <li><strong>{lang === 'KR' ? '제외 브러쉬 (Exclusion Brush): ' : lang === 'EN' ? 'Exclusion Brush: ' : '除外ブラシ: '}</strong>{lang === 'KR' ? '피사체 내부의 색상이 배경과 같아 지워질 경우, 브러쉬 아이콘을 켜고 해당 영역을 칠하면 투명화 대상에서 제외되어 원본이 완벽히 보존됩니다.' : lang === 'EN' ? 'If part of your subject is erased because it matches the background color, activate the brush icon and paint over the area to protect it from transparency.' : '被写体内部の色が背景と同じで消えてしまう場合、ブラシアイコンをオンにして該当領域を塗ることで透明化の対象から除外され、オリジナルが完璧に保持されます。'}</li>
                  <li><strong>{lang === 'KR' ? 'Tolerance (허용 오차): ' : lang === 'EN' ? 'Tolerance: ' : '許容誤差 (Tolerance): '}</strong>{lang === 'KR' ? '값이 클수록 선택한 색상과 비슷한 계열의 색상까지 넓게 제거됩니다.' : lang === 'EN' ? 'Higher values remove a wider range of colors similar to the selected background.' : '値を大きくするほど、選択した色に近い類似色まで広く削除されます。'}</li>
                  <li><strong>{lang === 'KR' ? 'Softness (가장자리 페더링): ' : lang === 'EN' ? 'Softness (Feathering): ' : 'エッジのぼかし (Softness): '}</strong>{lang === 'KR' ? '피사체와 배경의 경계면을 부드럽게 처리하여 계단 현상(Aliasing)을 방지합니다.' : lang === 'EN' ? 'Smoothes the edges between the subject and the background to prevent aliasing.' : '被写体と背景の境界線を滑らかに処理し、ジャギー（エイリアシング）を防ぎます。'}</li>
                  <li><strong>{lang === 'KR' ? 'Enclosed Color (내부 빈틈): ' : lang === 'EN' ? 'Enclosed Color: ' : '内部の隙間 (Enclosed Color): '}</strong>{lang === 'KR' ? '팔과 몸통 사이 등, 캐릭터 내부의 닫힌 공간에 갇힌 배경색도 함께 제거합니다.' : lang === 'EN' ? 'Removes background colors trapped inside enclosed spaces, like between a character\'s arm and body.' : '腕と胴体の間など、キャラクター内部の閉じた空間に閉じ込められた背景色も一緒に削除します。'}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-6 tracking-tight">
                  {lang === 'KR' ? '3. RECOVER: 디테일 복구 (Detail Restoration)' : lang === 'EN' ? '3. RECOVER: Detail Restoration' : '3. RECOVER: ディテール復元'}
                </h2>
                <p className="mb-4">{lang === 'KR' ? '자동 배경 제거 후 손실된 픽셀이나 아티팩트를 프레임 단위로 정교하게 복구합니다.' : lang === 'EN' ? 'Precisely recover lost pixels or artifacts frame-by-frame after automatic removal.' : '自動背景削除後に失われたピクセルやアーティファクトをフレーム単位で精巧に復元します。'}</p>
                <ul className="space-y-3 list-disc pl-5">
                  <li><strong>{lang === 'KR' ? '스마트 채우기 (Smart Fill): ' : lang === 'EN' ? 'Smart Fill: ' : 'スマートフィル: '}</strong>{lang === 'KR' ? '투명화 과정에서 잘못 지워진 반투명한 틈새나 픽셀 손실을 주변 색상을 분석하여 지능적으로 복구합니다.' : lang === 'EN' ? 'Intelligently restores semi-transparent gaps or lost details caused during the removal process by analyzing surrounding colors.' : '透明化の過程で誤って消去された半透明の隙間やピクセルの損失を、周囲の色を分析してインテリジェントに復元します。'}</li>
                  <li><strong>{lang === 'KR' ? '수동 툴 (Brush/Lasso/Eraser): ' : lang === 'EN' ? 'Manual Tools (Brush/Lasso/Eraser): ' : '手動ツール (Brush/Lasso/Eraser): '}</strong>{lang === 'KR' ? '브러쉬로 직접 색을 칠하거나, 올가미(Lasso)로 영역을 지정해 복구하고, 불필요한 찌꺼기는 지우개로 제거합니다.' : lang === 'EN' ? 'Paint directly, select areas with the lasso to restore, and use the eraser to clean up unwanted artifacts.' : 'ブラシで直接色を塗ったり、投げ縄(Lasso)で領域を指定して復元し、不要なゴミは消しゴムで削除します。'}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-6 tracking-tight">
                  {lang === 'KR' ? '4. ASSET: 에셋 파이프라인 (Asset Export)' : lang === 'EN' ? '4. ASSET: Production Pipeline' : '4. ASSET: アセットパイプライン'}
                </h2>
                <p className="mb-4">{lang === 'KR' ? '추출된 프레임을 실제 프로덕션에서 즉시 사용할 수 있는 포맷으로 변환합니다.' : lang === 'EN' ? 'Convert extracted frames into ready-to-use formats for your production.' : '抽出されたフレームを実際のプロダクションで即座に使用できるフォーマットに変換します。'}</p>
                <ul className="space-y-3 list-disc pl-5">
                  <li><strong>{lang === 'KR' ? '투명 비디오 (WebM Export): ' : lang === 'EN' ? 'Transparent Video (WebM): ' : '透明ビデオ (WebM Export): '}</strong>{lang === 'KR' ? '배경이 제거된 시퀀스를 알파 채널(투명도)이 포함된 고화질 WebM 비디오로 인코딩하여 추출합니다.' : lang === 'EN' ? 'Encode your sequence into a high-quality WebM video with an embedded alpha channel (transparency).' : '背景が削除されたシーケンスを、アルファチャネル（透明度）が含まれた高品質のWebMビデオとしてエンコードして書き出します。'}</li>
                  <li><strong>{lang === 'KR' ? '스프라이트 시트 (Sprite Sheet): ' : lang === 'EN' ? 'Sprite Sheet Generator: ' : 'スプライトシート (Sprite Sheet): '}</strong>{lang === 'KR' ? '개별 프레임들을 하나의 거대한 이미지 장표로 병합합니다. Auto-Crop(여백 자동 제거)과 Columns(가로 칸수) 조절을 통해 게임 엔진에 최적화된 에셋을 만드세요.' : lang === 'EN' ? 'Merge individual frames into a single atlas image. Use Auto-Crop and Column adjustments to create optimized assets for game engines.' : '個別のフレームを1つの巨大なアトラス画像に結合します。Auto-Crop（余白の自動削除）とColumns（横の列数）の調整により、ゲームエンジンに最適化されたアセットを作成します。'}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-6 tracking-tight">
                  {lang === 'KR' ? '5. 파워 유저를 위한 단축키 (Pro Shortcuts)' : lang === 'EN' ? '5. Pro Shortcuts' : '5. パワーユーザー向けショートカット'}
                </h2>
                <p className="mb-4">{lang === 'KR' ? '작업 속도를 10배 높여주는 필수 단축키입니다.' : lang === 'EN' ? 'Essential hotkeys to 10x your workflow speed.' : '作業速度を10倍に高める必須のショートカットキーです。'}</p>
                <ul className="space-y-3 list-disc pl-5">
                  <li><strong>{lang === 'KR' ? '화면 확대/축소: ' : lang === 'EN' ? 'Zoom In/Out: ' : '画面の拡大/縮小: '}</strong> <code className="bg-white/10 px-1 rounded">Ctrl/Cmd + Mouse Wheel</code></li>
                  <li><strong>{lang === 'KR' ? '화면 맞춤/원본 크기: ' : lang === 'EN' ? 'Fit to Screen/Original: ' : '画面に合わせる/元のサイズ: '}</strong> {lang === 'KR' ? '캔버스 하단의 줌 비율(%) 텍스트 클릭' : lang === 'EN' ? 'Click the Zoom Percentage (%) text below the canvas' : 'キャンバス下部のズーム比率(%)テキストをクリック'}</li>
                  <li><strong>{lang === 'KR' ? '스포이드 (컬러 픽업): ' : lang === 'EN' ? 'Eyedropper: ' : 'スポイト (色を取得): '}</strong> <code className="bg-white/10 px-1 rounded">Ctrl/Cmd + Click</code></li>
                  <li><strong>{lang === 'KR' ? '브러쉬 크기 조절: ' : lang === 'EN' ? 'Brush Size: ' : 'ブラシサイズの調整: '}</strong> <code className="bg-white/10 px-1 rounded">[</code> {lang === 'KR' ? '(축소) / ' : lang === 'EN' ? '(Decrease) / ' : '(縮小) / '} <code className="bg-white/10 px-1 rounded">]</code> {lang === 'KR' ? '(확대)' : lang === 'EN' ? '(Increase)' : '(拡大)'}</li>
                  <li><strong>{lang === 'KR' ? '프레임 다중 선택: ' : lang === 'EN' ? 'Multi-Select Frames: ' : 'フレームの複数選択: '}</strong> <code className="bg-white/10 px-1 rounded">Shift + Click</code> ({lang === 'KR' ? '타임라인에서' : lang === 'EN' ? 'on the timeline' : 'タイムライン上で'})</li>
                  <li><strong>{lang === 'KR' ? '선택 구간 동시 적용: ' : lang === 'EN' ? 'Batch Apply: ' : '選択区間への同時適用: '}</strong> <code className="bg-white/10 px-1 rounded">Shift + Ctrl/Cmd + Paint</code> ({lang === 'KR' ? '칠한 내용을 선택된 모든 프레임에 일괄 적용' : lang === 'EN' ? 'Apply edits to all selected frames simultaneously' : '塗った内容を選択されたすべてのフレームに一括適用'})</li>
                  <li><strong>{lang === 'KR' ? '시간/프레임 단위 전환: ' : lang === 'EN' ? 'Time/Frame Toggle: ' : '時間/フレーム単位の切り替え: '}</strong> {lang === 'KR' ? '타임라인 구간 설정의 [Time/Frame] 버튼 클릭' : lang === 'EN' ? 'Click the [Time/Frame] button in the timeline settings' : 'タイムライン区間設定の[Time/Frame]ボタンをクリック'}</li>
                </ul>
              </section>

            </div>
          </div>

          {/* Prompt Guide Content */}
          <div className={`transition-all duration-500 ${activeTab === 'prompt' ? 'opacity-100 visible' : 'opacity-0 invisible absolute top-0 left-0 w-full'}`}>
            <div className="space-y-12">
              <h2 className="text-3xl font-bold mb-6 tracking-tight">
                {lang === 'KR' ? '프롬프트 가이드' : lang === 'EN' ? 'Prompt Guide' : 'プロンプトガイド'}
              </h2>

              {/* [1] Image Generation Tips */}
              <section>
                <h3 className="text-2xl font-bold mb-6 tracking-tight flex items-center gap-2">🖼️ {lang === 'KR' ? '[1] 이미지 생성 팁' : lang === 'EN' ? '[1] Image Generation Tips' : '[1] 画像生成のヒント'}</h3>
                
                {/* Prompt Structure Template */}
                <div className={`p-6 rounded-2xl border mb-6 ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
                  <h4 className="text-lg font-bold mb-2">{lang === 'KR' ? '구조화 템플릿 (Prompt Structure Template)' : lang === 'EN' ? 'Prompt Structure Template' : 'プロンプト構造テンプレート'}</h4>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <p className="font-mono text-sm text-blue-600 dark:text-blue-400">[Reference subject], [Camera Perspective], [Character Pose], [Attire/Clothing], [Character Art Style], [Point Color]</p>
                    <button onClick={() => copyToClipboard('[Reference subject], [Camera Perspective], [Character Pose], [Attire/Clothing], [Character Art Style], [Point Color]')} className={`px-3 py-1 text-xs rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}>
                      {lang === 'KR' ? '복사' : lang === 'EN' ? 'Copy' : 'コピー'}
                    </button>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                    {lang === 'KR' ? '원하는 공통 사항으로 "참조 대상, 시점, 자세, 인상착의, 캐릭터 그림체, 포인트 색상"을 함께 적어 프롬프트를 고도화하세요. 이 뼈대에 단어만 채워 넣으면 일관된 고품질 에셋을 얻을 수 있습니다.' : 
                     lang === 'EN' ? 'Enhance your prompt by filling in this template: "Reference, Perspective, Pose, Attire, Art Style, and Point Color". This guarantees consistent and high-quality assets.' : 
                     '希望する共通事項として「参照対象、視点、姿勢、服装、キャラクターの絵柄、ポイントカラー」を一緒に入力してプロンプトを高度化してください。'}
                  </p>
                </div>

                <div className="grid gap-6">
                  {[
                    {
                      title: lang === 'KR' ? '스타일 및 렌더링 (Style & Rendering)' : lang === 'EN' ? 'Style & Rendering' : 'スタイルとレンダリング',
                      keywords: '2D game sprite, flat shading, cel shaded, clean vector art',
                      desc: lang === 'KR' ? '외곽선이 뚜렷하고 명암이 단순한 플랫/셀 셰이딩 스타일을 입력해야 배경과 피사체(캐릭터)의 경계가 명확해져 완벽한 누끼(투명화) 작업이 가능합니다.' : lang === 'EN' ? 'Input a flat/cel-shaded style with clear outlines and simple shading to ensure a distinct boundary between the background and subject for perfect transparency.' : '外郭線がはっきりしており、明暗が単純なフラット/セルシェーディングスタイルを入力することで、背景と被写体の境界が明確になり、完璧な透明化作業が可能になります。'
                    },
                    {
                      title: lang === 'KR' ? '포즈 및 시점 (Pose & View)' : lang === 'EN' ? 'Pose & View' : 'ポーズと視点',
                      keywords: 'Full body, A-pose, T-pose, Isometric view',
                      desc: lang === 'KR' ? '신체 일부가 잘리지 않도록 \'전신(Full body)\'을 명시하고, 게임 에셋 목적에 맞게 \'A-포즈\'나 쿼터뷰 형태인 \'아이소메트릭 뷰\'를 활용하세요.' : lang === 'EN' ? 'Specify \'Full body\' to avoid cutting off parts, and use \'A-pose\' or \'Isometric view\' for game asset purposes.' : '身体の一部が切れないように「全身（Full body）」を明示し、ゲームアセットの目的に合わせて「Aポーズ」やクォータービュー形式の「アイソメトリックビュー」を活用してください。'
                    }
                  ].map((item, i) => (
                    <div key={i} className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                      <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <p className="font-mono text-sm text-blue-500">{item.keywords}</p>
                        <button onClick={() => copyToClipboard(item.keywords)} className={`px-3 py-1 text-xs rounded-lg transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}>
                          {lang === 'KR' ? '복사' : lang === 'EN' ? 'Copy' : 'コピー'}
                        </button>
                      </div>
                      <p className={`${isDark ? 'text-white/70' : 'text-gray-700'}`}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* [2] Video Generation Tips */}
              <section>
                <h3 className="text-2xl font-bold mb-6 tracking-tight flex items-center gap-2">🎬 {lang === 'KR' ? '[2] 영상 생성 팁' : lang === 'EN' ? '[2] Video Generation Tips' : '[2] 動画生成のヒント'}</h3>
                <div className="grid gap-6">
                  {[
                    {
                      title: lang === 'KR' ? '시점 고정 (Perspective)' : lang === 'EN' ? 'Perspective' : '視点固定',
                      keywords: 'Fixed camera, Centrally framed, Static Perspective',
                      desc: lang === 'KR' ? '카메라가 캐릭터를 따라가지 않고, 화면 중앙에 고정되어 런 사이클(Run Cycle)이나 제자리 걷기가 되도록 합니다. 캐릭터가 화면 밖으로 이탈하는 것을 막아줍니다.' : lang === 'EN' ? 'Ensures the camera stays fixed on the character, enabling perfect run cycles or static walking, preventing the character from leaving the screen.' : 'カメラがキャラクターを追わず、画面中央に固定されてランサイクル（Run Cycle）やその場歩きができるようにします。キャラクターが画面外へ離脱するのを防ぎます。'
                    },
                    {
                      title: lang === 'KR' ? '화면 제한 (Negative Camera)' : lang === 'EN' ? 'Negative Camera' : '画面制限',
                      keywords: 'camera movement, camera rotation, zooming, panning, tracking shot, perspective shift',
                      desc: lang === 'KR' ? 'AI 모델이 임의로 카메라 각도를 비틀거나 줌인/아웃하는 것을 강력하게 차단하여 일관된 뷰를 유지합니다.' : lang === 'EN' ? 'Strongly prevents the AI from arbitrarily twisting camera angles or zooming in/out, maintaining a consistent view.' : 'AIモデルが任意にカメラ角度を歪めたり、ズームイン/アウトしたりすることを強力に遮断し、一貫したビューを維持します。'
                    },
                    {
                      title: lang === 'KR' ? '동작 및 이펙트 (Action & Effects)' : lang === 'EN' ? 'Action & Effects' : '動作とエフェクト',
                      keywords: 'Sprinting, Dynamic Running, Seamless loop, The gun does not fire, No muzzle flash',
                      desc: lang === 'KR' ? '단순 \'Walking\'보다 다리가 높이 올라가 속도감이 생기며, 불필요한 화염/총기 이펙트 효과를 빼서 순수한 캐릭터 모션에만 리소스를 집중합니다.' : lang === 'EN' ? 'Focuses resources on motion by increasing leg lift for speed and removing unnecessary muzzle flash effects.' : '単純な「Walking」よりも足が高く上がりスピード感が生まれ、不要な炎/銃器エフェクト効果を抜いて純粋なキャラクターモーションにのみリソースを集中させます。'
                    }
                  ].map((item, i) => (
                    <div key={i} className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                      <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <p className="font-mono text-sm text-blue-500">{item.keywords}</p>
                        <button onClick={() => copyToClipboard(item.keywords)} className={`px-3 py-1 text-xs rounded-lg transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}>
                          {lang === 'KR' ? '복사' : lang === 'EN' ? 'Copy' : 'コピー'}
                        </button>
                      </div>
                      <p className={`${isDark ? 'text-white/70' : 'text-gray-700'}`}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* [3] Common Environment Settings */}
              <section>
                <h3 className="text-2xl font-bold mb-6 tracking-tight flex items-center gap-2">📐 {lang === 'KR' ? '[3] 공통 환경 세팅' : lang === 'EN' ? '[3] Common Environment Settings' : '[3] 共通環境設定'}</h3>
                <div className="grid gap-6">
                  {[
                    {
                      title: lang === 'KR' ? '배경 및 그림자 (Background & Shadow)' : lang === 'EN' ? 'Background & Shadow' : '背景と影',
                      keywords: 'Pure white background, Solid green background, No drop shadow, no floor textures, no shadows on the ground',
                      desc: lang === 'KR' ? '바닥의 복잡한 질감이나 피사체의 그림자를 완전히 제거하여 바나나컷에서 크로마키 작업 시 가장 깔끔한 결과물을 얻게 합니다.' : lang === 'EN' ? 'Removes complex floor textures and shadows for the cleanest background removal results in BananaCut.' : '床の複雑な質感や被写体の影を完全に除去し、BananaCutでのクロマキー作業時に最もきれいな結果物を得られるようにします。'
                    },
                    {
                      title: lang === 'KR' ? '크기 및 비율 (Aspect Ratio)' : lang === 'EN' ? 'Aspect Ratio' : 'サイズと比率',
                      keywords: '--ar 16:9, --ar 9:16, --ar 1:1, 8k resolution',
                      desc: lang === 'KR' ? '미드저니 등에서 비율 파라미터를 사용해 용도에 맞는 사이즈를 설정하고, 고해상도를 명시해 픽셀 깨짐을 방지합니다.' : lang === 'EN' ? 'Sets the appropriate size using aspect ratio parameters and specifies high resolution to prevent pixelation.' : 'ミッドジャーニーなどで比率パラメータを使用して用途に合ったサイズを設定し、高解像度を明示してピクセルの破損を防ぎます。'
                    }
                  ].map((item, i) => (
                    <div key={i} className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                      <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <p className="font-mono text-sm text-blue-500">{item.keywords}</p>
                        <button onClick={() => copyToClipboard(item.keywords)} className={`px-3 py-1 text-xs rounded-lg transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}>
                          {lang === 'KR' ? '복사' : lang === 'EN' ? 'Copy' : 'コピー'}
                        </button>
                      </div>
                      <p className={`${isDark ? 'text-white/70' : 'text-gray-700'}`}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
