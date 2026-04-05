import React, { useEffect, useState } from 'react';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function GuidePage() {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

      {/* Toggle Button for Detailed Guide */}
      <div className="flex justify-center mb-12">
        <div className={`inline-flex p-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
          <button
            onClick={() => setShowDetails(false)}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
              !showDetails 
                ? (isDark ? 'bg-white text-black shadow-md' : 'bg-white text-gray-900 shadow-md')
                : (isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900')
            }`}
          >
            {lang === 'KR' ? '요약 가이드' : lang === 'EN' ? 'Quick Guide' : '要約ガイド'}
          </button>
          <button
            onClick={() => setShowDetails(true)}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
              showDetails 
                ? (isDark ? 'bg-white text-black shadow-md' : 'bg-white text-gray-900 shadow-md')
                : (isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900')
            }`}
          >
            {lang === 'KR' ? '세부 가이드' : lang === 'EN' ? 'Detailed Guide' : '詳細ガイド'}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative">
        {/* Simple Guide Content */}
        <div className={`transition-all duration-500 ${!showDetails ? 'opacity-100 visible' : 'opacity-0 invisible absolute top-0 left-0 w-full'}`}>
          <div className="space-y-12">
            {/* REMOVE Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6 tracking-tight text-blue-600 dark:text-blue-400">
                {lang === 'KR' ? '1. REMOVE (투명화) 페이지' : lang === 'EN' ? '1. REMOVE Page' : '1. REMOVE（透明化）ページ'}
              </h2>
              <ul className={`space-y-4 list-disc pl-5 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                <li>
                  <strong>{lang === 'KR' ? '파일 업로드: ' : lang === 'EN' ? 'File Upload: ' : 'ファイルアップロード：'}</strong>
                  {lang === 'KR' ? '이미지나 동영상을 업로드하여 프레임을 추출합니다.' : lang === 'EN' ? 'Upload an image or video to extract frames.' : '画像や動画をアップロードしてフレームを抽出します。'}
                </li>
                <li>
                  <strong>{lang === 'KR' ? '크로마키 (ChromaKey): ' : lang === 'EN' ? 'ChromaKey: ' : 'クロマキー（ChromaKey）：'}</strong>
                  {lang === 'KR' ? '배경색(White, Green)을 선택하거나 Picker로 직접 선택하여 배경을 투명하게 제거합니다.' : lang === 'EN' ? 'Select a background color (White, Green) or use the Picker to remove the background transparently.' : '背景色（White、Green）を選択するか、Pickerで直接選択して背景を透明に削除します。'}
                </li>
                <li>
                  <strong>{lang === 'KR' ? '제외 브러쉬 (Exclusion Brush): ' : lang === 'EN' ? 'Exclusion Brush: ' : '除外ブラシ（Exclusion Brush）：'}</strong>
                  {lang === 'KR' ? '크로마키 제목 옆의 브러쉬 아이콘을 눌러 활성화합니다. 캔버스 위를 칠하면 해당 영역은 투명화 대상에서 제외되어 원본이 유지됩니다.' : lang === 'EN' ? 'Click the brush icon next to the ChromaKey title to activate. Paint over the canvas to exclude areas from transparency, preserving the original.' : 'クロマキーのタイトルの横にあるブラシアイコンをクリックして有効にします。キャンバス上を塗ると、その領域は透明化の対象から除外され、オリジナルが保持されます。'}
                </li>
                <li>
                  <strong>{lang === 'KR' ? 'Tolerance (허용 오차): ' : lang === 'EN' ? 'Tolerance: ' : 'Tolerance（許容誤差）：'}</strong>
                  {lang === 'KR' ? '값이 클수록 비슷한 색상까지 넓게 제거됩니다.' : lang === 'EN' ? 'Higher values remove a wider range of similar colors.' : '値が大きいほど、似た色まで広く削除されます。'}
                </li>
                <li>
                  <strong>{lang === 'KR' ? 'Softness (가장자리 페더링): ' : lang === 'EN' ? 'Softness: ' : 'Softness（エッジのぼかし）：'}</strong>
                  {lang === 'KR' ? '경계면을 부드럽게 처리하여 자연스럽게 합성되도록 합니다.' : lang === 'EN' ? 'Feathers the edges for a natural blend.' : '境界を滑らかに処理し、自然に合成されるようにします。'}
                </li>
                <li>
                  <strong>{lang === 'KR' ? 'Enclosed Color (내부 빈틈): ' : lang === 'EN' ? 'Enclosed Color: ' : 'Enclosed Color（内部の隙間）：'}</strong>
                  {lang === 'KR' ? '캐릭터 내부의 닫힌 공간에 있는 배경색도 함께 제거합니다.' : lang === 'EN' ? 'Removes background colors trapped inside closed spaces of the character.' : 'キャラクター内部の閉じた空間にある背景色も一緒に削除します。'}
                </li>
              </ul>
            </section>

            {/* RECOVER Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6 tracking-tight text-blue-600 dark:text-blue-400">
                {lang === 'KR' ? '2. RECOVER (복구) 페이지' : lang === 'EN' ? '2. RECOVER Page' : '2. RECOVER（復元）ページ'}
              </h2>
              <ul className={`space-y-4 list-disc pl-5 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                <li>
                  <strong>{lang === 'KR' ? '스마트 채우기 (Smart Fill): ' : lang === 'EN' ? 'Smart Fill: ' : 'スマートフィル（Smart Fill）：'}</strong>
                  {lang === 'KR' ? '투명화 과정에서 잘못 지워진 반투명한 틈새를 복구합니다.' : lang === 'EN' ? 'Recovers semi-transparent gaps mistakenly erased during the removal process.' : '透明化の過程で誤って消去された半透明の隙間を復元します。'}
                </li>
                <li>
                  <strong>{lang === 'KR' ? '브러쉬/라쏘/지우개: ' : lang === 'EN' ? 'Brush/Lasso/Eraser: ' : 'ブラシ/なげなわ/消しゴム：'}</strong>
                  {lang === 'KR' ? '캔버스에 색상을 채우거나 영역을 지정하여 채우고, 필요시 지울 수 있습니다.' : lang === 'EN' ? 'Fill colors or select areas on the canvas, and erase if necessary.' : 'キャンバスに色を塗ったり、領域を指定して塗りつぶしたり、必要に応じて消去したりできます。'}
                </li>
              </ul>
            </section>

            {/* Shortcuts Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6 tracking-tight text-blue-600 dark:text-blue-400">
                {lang === 'KR' ? '단축키' : lang === 'EN' ? 'Shortcuts' : 'ショートカット'}
              </h2>
              <ul className={`space-y-4 list-disc pl-5 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                <li className="flex items-center gap-2">
                  <strong>{lang === 'KR' ? '화면 확대/축소: ' : lang === 'EN' ? 'Zoom In/Out: ' : 'ズームイン/アウト：'}</strong>
                  <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>Ctrl/Cmd</kbd> + <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>Wheel</kbd>
                </li>
                <li className="flex items-center gap-2">
                  <strong>{lang === 'KR' ? '화면 맞춤/원본 크기: ' : lang === 'EN' ? 'Fit/100% Size: ' : '画面に合わせる/元のサイズ：'}</strong>
                  {lang === 'KR' ? '줌 비율 텍스트 클릭' : lang === 'EN' ? 'Click zoom percentage text' : 'ズームのパーセンテージテキストをクリック'}
                </li>
                <li className="flex items-center gap-2">
                  <strong>{lang === 'KR' ? '스포이드: ' : lang === 'EN' ? 'Eyedropper: ' : 'スポイト：'}</strong>
                  <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>Ctrl/Cmd</kbd> + Click
                </li>
                <li className="flex items-center gap-2">
                  <strong>{lang === 'KR' ? '브러쉬 크기: ' : lang === 'EN' ? 'Brush Size: ' : 'ブラシサイズ：'}</strong>
                  <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>[</kbd> / <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>]</kbd>
                </li>
                <li className="flex items-center gap-2">
                  <strong>{lang === 'KR' ? '다중 선택: ' : lang === 'EN' ? 'Multi-Select: ' : '複数選択：'}</strong>
                  <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>Shift</kbd> + Click
                </li>
                <li className="flex items-center gap-2">
                  <strong>{lang === 'KR' ? '전체 동시 적용: ' : lang === 'EN' ? 'Apply to All: ' : '全体同時適用：'}</strong>
                  <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>Shift</kbd> + <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>Ctrl/Cmd</kbd> + Paint
                </li>
              </ul>
            </section>
          </div>
        </div>

        {/* Detailed Guide Content */}
        <div className={`transition-all duration-500 ${showDetails ? 'opacity-100 visible' : 'opacity-0 invisible absolute top-0 left-0 w-full'}`}>
          <div className="space-y-16">
            <section>
          <h2 className="text-3xl font-bold mb-6 tracking-tight">
            {lang === 'KR' ? '1. 바나나컷 소개' : lang === 'EN' ? '1. Introduction to BananaCut' : '1. BananaCutの紹介'}
          </h2>
          <div className={`space-y-4 leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
            <p>
              {lang === 'KR' ? '바나나컷은 크리에이터, 3D 아티스트, 영상 편집자를 위해 설계된 혁신적인 웹 기반 도구입니다. 무거운 영상 파일을 원격 서버에 업로드해야 하는 기존 클라우드 기반 서비스와 달리, 바나나컷은 고성능 웹 기반 엔진을 사용하여 브라우저 내부에서 모든 것을 직접 처리합니다.' : 
               lang === 'EN' ? 'BananaCut is a revolutionary web-based tool designed for creators, 3D artists, and video editors. Unlike traditional cloud-based services that require you to upload heavy video files to a remote server, BananaCut processes everything directly inside your browser using a high-performance web-based engine.' : 
               'BananaCutは、クリエイター、3Dアーティスト、ビデオ編集者のために設計された革新的なウェブベースのツールです。重いビデオファイルをリモートサーバーにアップロードする必要がある従来のクラウドベースのサービスとは異なり、BananaCutは高性能ウェブベースエンジンを使用して、ブラウザ内ですべてを直接処理します。'}
            </p>
            <p>
              {lang === 'KR' ? '이는 업로드 시간 제로, 완벽한 데이터 프라이버시, 서버 병목 현상 없음을 의미합니다. 파일은 절대 컴퓨터를 떠나지 않습니다. MP4에서 프레임을 추출하든, 그린 스크린을 제거하든, PNG 시퀀스에서 손상된 알파 채널을 복구하든, 바나나컷은 네이티브와 같은 성능으로 모든 것을 로컬에서 처리합니다.' : 
               lang === 'EN' ? 'This means zero upload times, absolute data privacy, and no server bottlenecks. Your files never leave your computer. Whether you are extracting frames from an MP4, removing a green screen, or recovering damaged alpha channels in a PNG sequence, BananaCut handles it all locally with native-like performance.' : 
               'これは、アップロード時間ゼロ、絶対的なデータプライバシー、サーバーのボトルネックがないことを意味します。ファイルがコンピューターから離れることはありません。MP4からフレームを抽出する場合でも、グリーンスクリーンを削除する場合でも、PNGシーケンスで破損したアルファチャンネルを復元する場合でも、BananaCutはネイティブのようなパフォーマンスですべてをローカルで処理します。'}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 tracking-tight">
            {lang === 'KR' ? '2. REMOVE 도구: 스마트 크로마키' : lang === 'EN' ? '2. The REMOVE Tool: Smart Chroma Key' : '2. REMOVEツール：スマートクロマキー'}
          </h2>
          <div className={`space-y-4 leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
            <p>
              {lang === 'KR' ? 'REMOVE 페이지는 단색 배경에서 피사체를 추출하기 위한 기본 작업 공간입니다. 그린 스크린(크로마키) 및 흰색 배경 제거에 고도로 최적화되어 있습니다.' : 
               lang === 'EN' ? 'The REMOVE page is your primary workspace for extracting subjects from solid backgrounds. It is heavily optimized for Green Screen (Chroma Key) and White Background removal.' : 
               'REMOVEページは、単色背景から被写体を抽出するための主要なワークスペースです。グリーンスクリーン（クロマキー）と白背景の削除に高度に最適化されています。'}
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>{lang === 'KR' ? '업로드 및 추출:' : lang === 'EN' ? 'Upload & Extract:' : 'アップロードと抽出：'}</strong> {lang === 'KR' ? 'MP4 또는 MOV 파일을 드래그 앤 드롭하세요. 바나나컷이 원하는 FPS(초당 프레임 수)로 프레임을 즉시 추출합니다.' : lang === 'EN' ? 'Drag and drop your MP4 or MOV file. BananaCut will instantly extract the frames at your desired FPS (Frames Per Second).' : 'MP4またはMOVファイルをドラッグ＆ドロップします。BananaCutは、希望のFPS（1秒あたりのフレーム数）でフレームを即座に抽出します。'}</li>
              <li><strong>{lang === 'KR' ? '대상 색상:' : lang === 'EN' ? 'Target Color:' : '対象色：'}</strong> {lang === 'KR' ? '녹색, 흰색 중에서 선택하거나 사용자 정의 색상 선택기를 사용하여 제거할 정확한 배경색을 선택하세요.' : lang === 'EN' ? 'Choose between Green, White, or use the custom Color Picker to select the exact background color you want to remove.' : '緑、白から選択するか、カスタムカラーピッカーを使用して、削除する正確な背景色を選択します。'}</li>
              <li><strong>{lang === 'KR' ? '오차 범위 및 가장자리 부드러움:' : lang === 'EN' ? 'Tolerance & Edge Softness:' : '許容範囲とエッジの柔らかさ：'}</strong> {lang === 'KR' ? '오차 범위 슬라이더를 조정하여 색상 일치 범위를 확장하거나 축소하세요. 가장자리 부드러움 슬라이더를 사용하여 가장자리를 페더링하여 피사체 주변의 거친 픽셀 윤곽선을 방지하세요.' : lang === 'EN' ? 'Adjust the Tolerance slider to expand or contract the color matching range. Use the Edge Softness slider to feather the edges, preventing harsh pixelated outlines around your subject.' : '許容範囲スライダーを調整して、カラーマッチング範囲を拡大または縮小します。エッジの柔らかさスライダーを使用してエッジをフェザリングし、被写体の周りの粗いピクセル化された輪郭を防ぎます。'}</li>
              <li><strong>{lang === 'KR' ? '내보내기:' : lang === 'EN' ? 'Export:' : 'エクスポート：'}</strong> {lang === 'KR' ? '미리보기에 만족하면 내보내기를 클릭하여 모든 투명 PNG 프레임이 포함된 ZIP 파일을 다운로드하세요.' : lang === 'EN' ? 'Once satisfied with the preview, click Export to download a ZIP file containing all the transparent PNG frames.' : 'プレビューに満足したら、エクスポートをクリックして、すべての透明なPNGフレームを含むZIPファイルをダウンロードします。'}</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 tracking-tight">
            {lang === 'KR' ? '3. RECOVER 도구: 고급 알파 복구' : lang === 'EN' ? '3. The RECOVER Tool: Advanced Alpha Repair' : '3. RECOVERツール：高度なアルファ修復'}
          </h2>
          <div className={`space-y-4 leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
            <p>
              {lang === 'KR' ? '때로는 자동 배경 제거로 인해 피사체에 아티팩트나 구멍이 남을 수 있습니다. RECOVER 페이지는 전체 시퀀스에 걸쳐 이러한 문제를 복구할 수 있는 전문가급 도구를 제공합니다.' : 
               lang === 'EN' ? 'Sometimes, automated background removal leaves artifacts or holes in your subject. The RECOVER page provides professional-grade tools to repair these issues across an entire sequence.' : 
               '自動背景削除により、被写体にアーティファクトや穴が残る場合があります。RECOVERページは、シーケンス全体でこれらの問題を修復するためのプロフェッショナルグレードのツールを提供します。'}
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>{lang === 'KR' ? '스마트 필:' : lang === 'EN' ? 'Smart Fill:' : 'スマートフィル：'}</strong> {lang === 'KR' ? '누락된 알파 데이터를 지능적으로 보간하는 독점 알고리즘입니다. 수정이 필요한 영역을 선택하기만 하면 스마트 필이 주변 픽셀을 혼합하여 누락된 부분을 복원합니다.' : lang === 'EN' ? 'Our proprietary algorithm that intelligently interpolates missing alpha data. Simply select the area that needs fixing, and Smart Fill will blend the surrounding pixels to restore the missing parts.' : '欠落しているアルファデータをインテリジェントに補間する独自のアルゴリズム。修正が必要な領域を選択するだけで、スマートフィルが周囲のピクセルをブレンドして欠落部分を復元します。'}</li>
              <li><strong>{lang === 'KR' ? '올가미 및 브러시 도구:' : lang === 'EN' ? 'Lasso & Brush Tools:' : 'なげなわ＆ブラシツール：'}</strong> {lang === 'KR' ? '수동 정밀도를 위해 올가미 도구를 사용하여 복잡한 모양을 선택하거나 브러시 도구를 사용하여 알파 값을 캔버스에 직접 칠하세요.' : lang === 'EN' ? 'For manual precision, use the Lasso tool to select complex shapes or the Brush tool to paint alpha values directly onto the canvas.' : '手動の精度のために、なげなわツールを使用して複雑な形状を選択するか、ブラシツールを使用してアルファ値をキャンバスに直接ペイントします。'}</li>
              <li><strong>{lang === 'KR' ? '선택한 모든 항목에 적용:' : lang === 'EN' ? 'Apply to All Selected:' : '選択したすべてに適用：'}</strong> {lang === 'KR' ? '이것은 바나나컷의 가장 강력한 기능입니다. 필름스트립에서 여러 프레임을 선택하고 한 프레임에서 수정을 수행한 다음 해당 수정을 선택한 모든 프레임에 동시에 적용합니다. 이렇게 하면 지루한 프레임별 로토스코핑 시간을 절약할 수 있습니다.' : lang === 'EN' ? 'This is BananaCut\'s most powerful feature. Select multiple frames in the filmstrip, make a correction on one frame, and apply that exact correction to all selected frames simultaneously. This saves hours of tedious frame-by-frame rotoscoping.' : 'これはBananaCutの最も強力な機能です。フィルムストリップで複数のフレームを選択し、1つのフレームで修正を行い、その正確な修正を選択したすべてのフレームに同時に適用します。これにより、退屈なフレームごとのロトスコープの時間を節約できます。'}</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 tracking-tight">
            {lang === 'KR' ? '4. 배경 제거 꿀팁 & 단축키' : lang === 'EN' ? '4. Tips & Shortcuts' : '4. ヒントとショートカット'}
          </h2>
          <div className={`space-y-4 leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
            <p>
              {lang === 'KR' ? '바나나컷을 최대한 활용하려면 소스 영상의 조명이 밝아야 합니다. 크로마키의 경우 균일하게 조명된 그린 스크린이 주름지거나 고르지 않게 조명된 배경보다 훨씬 더 나은 결과를 얻을 수 있습니다.' : 
               lang === 'EN' ? 'To get the best results out of BananaCut, ensure your source footage is well-lit. For chroma keying, a uniformly lit green screen will yield significantly better results than a wrinkled or unevenly lit background.' : 
               'BananaCutを最大限に活用するには、ソース映像が明るく照らされていることを確認してください。クロマキーの場合、均一に照らされたグリーンスクリーンは、しわが寄ったり不均一に照らされた背景よりもはるかに良い結果をもたらします。'}
            </p>
            <div className={`p-6 rounded-2xl mt-6 shadow-sm ${isDark ? 'bg-white/5 border border-white/10' : 'bg-yellow-50/50 border border-yellow-100/50'}`}>
              <h3 className="text-xl font-bold mb-4">{lang === 'KR' ? '단축키 안내' : lang === 'EN' ? 'Keyboard Shortcuts' : 'キーボードショートカット'}</h3>
              <ul className="space-y-3">
                <li className="flex items-center justify-between">
                  <span>{lang === 'KR' ? '화면 확대/축소' : lang === 'EN' ? 'Zoom In/Out' : 'ズームイン/アウト'}</span>
                  <div className="space-x-1">
                    <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>Ctrl/Cmd</kbd>
                    <span>+</span>
                    <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>Wheel</kbd>
                  </div>
                </li>
                <li className="flex items-center justify-between">
                  <span>{lang === 'KR' ? '실행 취소 (Undo)' : lang === 'EN' ? 'Undo' : '元に戻す'}</span>
                  <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>Ctrl/Cmd + Z</kbd>
                </li>
                <li className="flex items-center justify-between">
                  <span>{lang === 'KR' ? '다시 실행 (Redo)' : lang === 'EN' ? 'Redo' : 'やり直し'}</span>
                  <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>Ctrl/Cmd + Shift + Z</kbd>
                </li>
                <li className="flex items-center justify-between">
                  <span>{lang === 'KR' ? '브러시 크기 조절' : lang === 'EN' ? 'Adjust Brush Size' : 'ブラシサイズの調整'}</span>
                  <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>[ ]</kbd>
                </li>
                <li className="flex items-center justify-between">
                  <span>{lang === 'KR' ? '프레임 이동' : lang === 'EN' ? 'Navigate Frames' : 'フレームの移動'}</span>
                  <kbd className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>← →</kbd>
                </li>
              </ul>
            </div>
          </div>
        </section>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
