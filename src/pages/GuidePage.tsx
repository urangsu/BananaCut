import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { useLanguage } from "../LanguageContext";

export default function GuidePage() {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === "dark";
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentTab = searchParams.get("tab");
  const activeTab = (currentTab === "quick" || currentTab === "detailed" || currentTab === "prompt")
    ? currentTab
    : "quick";

  const setActiveTab = (tab: "quick" | "detailed" | "prompt") => {
    setSearchParams({ tab });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: Add a toast notification or feedback
  };

  return (
    <div
      className={`h-full min-h-0 overflow-y-auto w-full ${isDark ? "bg-[#121212] text-white" : "bg-white text-gray-900"}`}
    >
      <div className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
        <header className="mb-16 border-b pb-8 border-gray-200 dark:border-white/10">
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-4">
            {lang === "KR"
              ? "바나나컷 가이드"
              : lang === "EN"
                ? "BananaCut Guide"
                : "BananaCut ガイド"}
          </h1>
          <p
            className={`text-xl ${isDark ? "text-white/60" : "text-gray-600"}`}
          >
            {lang === "KR"
              ? "브라우저 기반 배경 제거 및 시퀀스 복구에 대한 모든 것을 알아보세요."
              : lang === "EN"
                ? "Everything you need to know about in-browser background removal and sequence recovery."
                : "ブラウザベースの背景削除とシーケンス復元について知っておくべきすべてのこと。"}
          </p>
        </header>

        {/* 3-Tab UI */}
        <div className="flex justify-center mb-12">
          <div
            className={`inline-flex p-1 rounded-full ${isDark ? "bg-white/10" : "bg-gray-100"}`}
          >
            {(["quick", "detailed", "prompt"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                  activeTab === tab
                    ? isDark
                      ? "bg-white text-black shadow-md"
                      : "bg-white text-gray-900 shadow-md"
                    : isDark
                      ? "text-white/60 hover:text-white"
                      : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab === "quick"
                  ? lang === "KR"
                    ? "요약 가이드"
                    : lang === "EN"
                      ? "Quick Guide"
                      : "要約ガイド"
                  : tab === "detailed"
                    ? lang === "KR"
                      ? "세부 가이드"
                      : lang === "EN"
                        ? "Detailed Guide"
                        : "詳細ガイド"
                    : lang === "KR"
                      ? "프롬프트 가이드"
                      : lang === "EN"
                        ? "Prompt Guide"
                        : "プロンプトガイド"}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="relative">
          {/* Quick Guide Content */}
          <div
            className={`transition-all duration-500 ${activeTab === "quick" ? "opacity-100 visible" : "opacity-0 invisible absolute top-0 left-0 w-full"}`}
          >
            <div className="space-y-12">
              <section>
                <h2 className="text-2xl font-bold mb-6 tracking-tight text-blue-600 dark:text-blue-400">
                  {lang === "KR"
                    ? "1. REMOVE (투명화) 페이지"
                    : lang === "EN"
                      ? "1. REMOVE Page"
                      : "1. REMOVE（透明化）ページ"}
                </h2>
                <ul
                  className={`space-y-4 list-disc pl-5 ${isDark ? "text-white/80" : "text-gray-700"}`}
                >
                  <li>
                    <strong>
                      {lang === "KR"
                        ? "파일 업로드: "
                        : lang === "EN"
                          ? "File Upload: "
                          : "ファイルアップロード："}
                    </strong>{" "}
                    {lang === "KR"
                      ? "이미지나 동영상을 업로드하여 프레임을 추출합니다."
                      : lang === "EN"
                        ? "Upload an image or video to extract frames."
                        : "画像や動画をアップロードしてフレームを抽出します。"}
                  </li>
                  <li>
                    <strong>
                      {lang === "KR"
                        ? "크로마키 (ChromaKey): "
                        : lang === "EN"
                          ? "ChromaKey: "
                          : "クロマキー（ChromaKey）："}
                    </strong>{" "}
                    {lang === "KR"
                      ? "배경색(White, Green)을 선택하거나 Picker로 직접 선택하여 배경을 투명하게 제거합니다."
                      : lang === "EN"
                        ? "Select a background color (White, Green) or use the Picker to remove the background transparently."
                        : "背景色（White、Green）を選択するか、Pickerで直接選択して背景を透明に削除します。"}
                  </li>
                  <li>
                    <strong>
                      {lang === "KR"
                        ? "제외 브러쉬 (Exclusion Brush): "
                        : lang === "EN"
                          ? "Exclusion Brush: "
                          : "除外ブラシ（Exclusion Brush）："}
                    </strong>{" "}
                    {lang === "KR"
                      ? "크로마키 제목 옆의 브러쉬 아이콘을 눌러 활성화합니다. 캔버스 위를 칠하면 해당 영역은 투명화 대상에서 제외되어 원본이 유지됩니다."
                      : lang === "EN"
                        ? "Click the brush icon next to the ChromaKey title to activate. Paint over the canvas to exclude areas from transparency, preserving the original."
                        : "クロマキーのタイトルの横にあるブラシアイコンをクリックして有効にします。キャンバス上を塗ると、その領域は透明化の対象から除外され、オリジナルが保持されます。"}
                  </li>
                  <li>
                    <strong>
                      {lang === "KR"
                        ? "Tolerance (허용 오차): "
                        : lang === "EN"
                          ? "Tolerance: "
                          : "Tolerance（許容誤差）："}
                    </strong>{" "}
                    {lang === "KR"
                      ? "값이 클수록 비슷한 색상까지 넓게 제거됩니다."
                      : lang === "EN"
                        ? "Higher values remove a wider range of similar colors."
                        : "値が大きいほど、似た色まで広く削除されます。"}
                  </li>
                  <li>
                    <strong>
                      {lang === "KR"
                        ? "Softness (가장자리 페더링): "
                        : lang === "EN"
                          ? "Softness: "
                          : "Softness（エッジのぼかし）："}
                    </strong>{" "}
                    {lang === "KR"
                      ? "경계면을 부드럽게 처리하여 자연스럽게 합성되도록 합니다."
                      : lang === "EN"
                        ? "Feathers the edges for a natural blend."
                        : "境界を滑らかに処理し、自然に合成されるようにします。"}
                  </li>
                  <li>
                    <strong>
                      {lang === "KR"
                        ? "Enclosed Color (내부 빈틈): "
                        : lang === "EN"
                          ? "Enclosed Color: "
                          : "Enclosed Color（内部の隙間）："}
                    </strong>{" "}
                    {lang === "KR"
                      ? "캐릭터 내부의 닫힌 공간에 있는 배경색도 함께 제거합니다."
                      : lang === "EN"
                        ? "Removes background colors trapped inside closed spaces of the character."
                        : "キャラクター内部の閉じた空間にある背景色も一緒に削除します。"}
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6 tracking-tight text-blue-600 dark:text-blue-400">
                  {lang === "KR"
                    ? "2. RECOVER (복구) 페이지"
                    : lang === "EN"
                      ? "2. RECOVER Page"
                      : "2. RECOVER（復元）ページ"}
                </h2>
                <ul
                  className={`space-y-4 list-disc pl-5 ${isDark ? "text-white/80" : "text-gray-700"}`}
                >
                  <li>
                    <strong>
                      {lang === "KR"
                        ? "스마트 채우기 (Smart Fill): "
                        : lang === "EN"
                          ? "Smart Fill: "
                          : "スマートフィル（Smart Fill）："}
                    </strong>{" "}
                    {lang === "KR"
                      ? "투명화 과정에서 잘못 지워진 반투명한 틈새를 복구합니다."
                      : lang === "EN"
                        ? "Recovers semi-transparent gaps mistakenly erased during the removal process."
                        : "透明化の過程で誤って消去された半透明の隙間を復元します。"}
                  </li>
                  <li>
                    <strong>
                      {lang === "KR"
                        ? "브러쉬/라쏘/지우개: "
                        : lang === "EN"
                          ? "Brush/Lasso/Eraser: "
                          : "ブラシ/なげなわ/消しゴム："}
                    </strong>{" "}
                    {lang === "KR"
                      ? "캔버스에 색상을 채우거나 영역을 지정하여 채우고, 필요시 지울 수 있습니다."
                      : lang === "EN"
                        ? "Fill colors or select areas on the canvas, and erase if necessary."
                        : "キャンバスに色を塗ったり、領域を指定して塗りつぶしたり、必要に応じて消去したりできます。"}
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6 tracking-tight text-blue-600 dark:text-blue-400">
                  {lang === "KR"
                    ? "단축키"
                    : lang === "EN"
                      ? "Shortcuts"
                      : "ショートカット"}
                </h2>
                <ul
                  className={`space-y-4 list-disc pl-5 ${isDark ? "text-white/80" : "text-gray-700"}`}
                >
                  <li className="flex items-center gap-2">
                    <strong>
                      {lang === "KR"
                        ? "화면 확대/축소: "
                        : lang === "EN"
                          ? "Zoom In/Out: "
                          : "ズームイン/アウト："}
                    </strong>{" "}
                    <kbd
                      className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? "bg-white/10 text-white" : "bg-white border border-gray-200 text-gray-800"}`}
                    >
                      Ctrl/Cmd
                    </kbd>{" "}
                    +{" "}
                    <kbd
                      className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? "bg-white/10 text-white" : "bg-white border border-gray-200 text-gray-800"}`}
                    >
                      Wheel
                    </kbd>
                  </li>
                  <li className="flex items-center gap-2">
                    <strong>
                      {lang === "KR"
                        ? "화면 맞춤/원본 크기: "
                        : lang === "EN"
                          ? "Fit/100% Size: "
                          : "画面に合わせる/元のサイズ："}
                    </strong>{" "}
                    {lang === "KR"
                      ? "줌 비율 텍스트 클릭"
                      : lang === "EN"
                        ? "Click zoom percentage text"
                        : "ズームのパーセンテージテキストをクリック"}
                  </li>
                  <li className="flex items-center gap-2">
                    <strong>
                      {lang === "KR"
                        ? "스포이드: "
                        : lang === "EN"
                          ? "Eyedropper: "
                          : "スポイト："}
                    </strong>{" "}
                    <kbd
                      className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? "bg-white/10 text-white" : "bg-white border border-gray-200 text-gray-800"}`}
                    >
                      Ctrl/Cmd
                    </kbd>{" "}
                    + Click
                  </li>
                  <li className="flex items-center gap-2">
                    <strong>
                      {lang === "KR"
                        ? "브러쉬 크기: "
                        : lang === "EN"
                          ? "Brush Size: "
                          : "ブラシサイズ："}
                    </strong>{" "}
                    <kbd
                      className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? "bg-white/10 text-white" : "bg-white border border-gray-200 text-gray-800"}`}
                    >
                      [
                    </kbd>{" "}
                    /{" "}
                    <kbd
                      className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? "bg-white/10 text-white" : "bg-white border border-gray-200 text-gray-800"}`}
                    >
                      ]
                    </kbd>
                  </li>
                  <li className="flex items-center gap-2">
                    <strong>
                      {lang === "KR"
                        ? "다중 선택: "
                        : lang === "EN"
                          ? "Multi-Select: "
                          : "複数選択："}
                    </strong>{" "}
                    <kbd
                      className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? "bg-white/10 text-white" : "bg-white border border-gray-200 text-gray-800"}`}
                    >
                      Shift
                    </kbd>{" "}
                    + Click
                  </li>
                  <li className="flex items-center gap-2">
                    <strong>
                      {lang === "KR"
                        ? "선택 구간 동시 적용: "
                        : lang === "EN"
                          ? "Apply to Selected Segments: "
                          : "選択区間同時適用："}
                    </strong>{" "}
                    <kbd
                      className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? "bg-white/10 text-white" : "bg-white border border-gray-200 text-gray-800"}`}
                    >
                      Shift
                    </kbd>{" "}
                    +{" "}
                    <kbd
                      className={`px-2 py-1 rounded text-xs font-mono shadow-sm ${isDark ? "bg-white/10 text-white" : "bg-white border border-gray-200 text-gray-800"}`}
                    >
                      Ctrl/Cmd
                    </kbd>{" "}
                    + Paint
                  </li>
                  <li className="flex items-center gap-2">
                    <strong>
                      {lang === "KR"
                        ? "모션 구간 시간/프레임 전환: "
                        : lang === "EN"
                          ? "Toggle Motion Segment Time/Frame: "
                          : "モーション区間時間/フレーム切り替え："}
                    </strong>{" "}
                    {lang === "KR"
                      ? "구간 설정 내 [Time/Frame] 버튼 클릭"
                      : lang === "EN"
                        ? "Click [Time/Frame] button in segment settings"
                        : "区間設定内の[Time/Frame]ボタンをクリック"}
                  </li>
                </ul>
              </section>
            </div>
          </div>

          {/* Detailed Guide Content */}
          <div
            className={`transition-all duration-500 ${activeTab === "detailed" ? "opacity-100 visible" : "opacity-0 invisible absolute top-0 left-0 w-full"}`}
          >
            <div className="space-y-16">
              <section>
                <h2 className="text-3xl font-bold mb-6 tracking-tight">
                  {lang === "KR"
                    ? "1. 바나나컷 소개"
                    : lang === "EN"
                      ? "1. Introduction"
                      : "1. BananaCutの紹介"}
                </h2>
                <div
                  className={`space-y-4 leading-relaxed ${isDark ? "text-white/70" : "text-gray-700"}`}
                >
                  <p>
                    {lang === "KR"
                      ? "바나나컷은 크리에이터, 3D 아티스트, 영상 편집자를 위해 설계된 로그인 없는 웹 기반 도구입니다. 무거운 영상 파일을 원격 서버에 업로드해야 했던 기존의 클라우드 서비스들과 달리, 바나나컷은 웹 기반 엔진을 활용하여 브라우저 환경에서 모든 프레임을 직접 처리합니다. 업로드 대기 시간 제로, 완벽한 데이터 로컬 처리 적용. 여러분의 작업물은 절대 컴퓨터 밖으로 나가지 않습니다. 그린 스크린 제거부터 손상된 알파 채널 복구까지, 필요한 기능들을 웹에서 바로 사용해 보세요."
                      : lang === "EN"
                        ? "BananaCut is a user-friendly web-based tool designed for creators, 3D artists, and video editors without any sign-up required. Unlike traditional cloud services that require you to upload heavy video files to remote servers, BananaCut uses a web engine to process everything directly inside your browser. Zero upload times, and local data processing. Your files never leave your computer. From removing green screens to recovering damaged alpha channels, use the tools you need right in your web browser."
                        : "BananaCutは、クリエイター、3Dアーティスト、ビデオ編集者のために設計されたサインアップ不要のウェブベースのツールです。重い動画ファイルをリモートサーバーにアップロードする必要がある従来のクラウドサービスとは異なり、BananaCutはウェブエンジンを使用し、ブラウザ内ですべてを直接処理します。アップロードの待ち時間はゼロ、完全なローカルデータ処理。ファイルがコンピューターから外部に出ることは決してありません。グリーンスクリーンの除去から損傷したアルファチャネルの復元まで、必要な機能をブラウザですぐにお使いいただけます。"}
                  </p>
                </div>
              </section>
              <section>
                <h2 className="text-3xl font-bold mb-6 tracking-tight">
                  {lang === "KR"
                    ? "2. REMOVE 도구: 스마트 크로마키"
                    : lang === "EN"
                      ? "2. The REMOVE Tool: Smart Chroma Key"
                      : "2. REMOVEツール：スマートクロマキー"}
                </h2>
                <div
                  className={`space-y-4 leading-relaxed ${isDark ? "text-white/70" : "text-gray-700"}`}
                >
                  <p>
                    {lang === "KR"
                      ? "REMOVE 페이지는 단색 배경에서 피사체를 추출하기 위한 기본 작업 공간입니다. 그린 스크린(크로마키) 및 흰색 배경 제거에 고도로 최적화되어 있습니다."
                      : lang === "EN"
                        ? "The REMOVE page is your primary workspace for extracting subjects from solid backgrounds. It is heavily optimized for Green Screen (Chroma Key) and White Background removal."
                        : "REMOVEページは、単色背景から被写体を抽出するための主要なワークスペースです。グリーンスクリーン（クロマキー）と白背景の削除に高度に最適化されています。"}
                  </p>
                </div>
              </section>
              <section>
                <h2 className="text-3xl font-bold mb-6 tracking-tight">
                  {lang === "KR"
                    ? "3. RECOVER 도구: 고급 알파 복구"
                    : lang === "EN"
                      ? "3. The RECOVER Tool: Advanced Alpha Repair"
                      : "3. RECOVERツール：高度なアルファ修復"}
                </h2>
                <div
                  className={`space-y-4 leading-relaxed ${isDark ? "text-white/70" : "text-gray-700"}`}
                >
                  <p>
                    {lang === "KR"
                      ? "때로는 자동 배경 제거로 인해 피사체에 아티팩트나 구멍이 남을 수 있습니다. RECOVER 페이지는 전체 시퀀스에 걸쳐 이러한 문제를 복구할 수 있는 전문가급 도구를 제공합니다."
                      : lang === "EN"
                        ? "Sometimes, automated background removal leaves artifacts or holes in your subject. The RECOVER page provides professional-grade tools to repair these issues across an entire sequence."
                        : "自動背景削除により、被写体にアーティファクトや穴が残る場合があります。RECOVERページは、シーケンス全体でこれらの問題を修復するためのプロフェッショナルグレードのツールを提供します。"}
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* Prompt Guide Content */}
          <div
            className={`transition-all duration-500 ${activeTab === "prompt" ? "opacity-100 visible" : "opacity-0 invisible absolute top-0 left-0 w-full"}`}
          >
            <div className="space-y-12">
              <h2 className="text-3xl font-bold mb-6 tracking-tight">
                {lang === "KR"
                  ? "프롬프트 가이드"
                  : lang === "EN"
                    ? "Prompt Guide"
                    : "プロンプトガイド"}
              </h2>

              {/* [1] Image Generation Tips */}
              <section>
                <h3 className="text-2xl font-bold mb-6 tracking-tight flex items-center gap-2">
                  🖼️{" "}
                  {lang === "KR"
                    ? "[1] 이미지 생성 팁"
                    : lang === "EN"
                      ? "[1] Image Generation Tips"
                      : "[1] 画像生成のヒント"}
                </h3>

                {/* Prompt Structure Template */}
                <div
                  className={`p-6 rounded-2xl border mb-6 ${isDark ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-200"}`}
                >
                  <h4 className="text-lg font-bold mb-2">
                    {lang === "KR"
                      ? "구조화 템플릿 (Prompt Structure Template)"
                      : lang === "EN"
                        ? "Prompt Structure Template"
                        : "プロンプト構造テンプレート"}
                  </h4>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <p className="font-mono text-sm text-blue-600 dark:text-blue-400">
                      [Reference subject], [Camera Perspective], [Character
                      Pose], [Attire/Clothing], [Character Art Style], [Point
                      Color]
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          "[Reference subject], [Camera Perspective], [Character Pose], [Attire/Clothing], [Character Art Style], [Point Color]",
                        )
                      }
                      className={`px-3 py-1 text-xs rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${isDark ? "bg-white/10 hover:bg-white/20" : "bg-gray-200 hover:bg-gray-300"}`}
                    >
                      {lang === "KR"
                        ? "복사"
                        : lang === "EN"
                          ? "Copy"
                          : "コピー"}
                    </button>
                  </div>
                  <p
                    className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}
                  >
                    {lang === "KR"
                      ? '원하는 공통 사항으로 "참조 대상, 시점, 자세, 인상착의, 캐릭터 그림체, 포인트 색상"을 함께 적어 프롬프트를 고도화하세요. 이 뼈대에 단어만 채워 넣으면 일관된 고품질 에셋을 얻을 수 있습니다.'
                      : lang === "EN"
                        ? 'Enhance your prompt by filling in this template: "Reference, Perspective, Pose, Attire, Art Style, and Point Color". This guarantees consistent and high-quality assets.'
                        : "希望する共通事項として「参照対象、視点、姿勢、服装、キャラクターの絵柄、ポイントカラー」を一緒に入力してプロンプトを高度化してください。"}
                  </p>
                </div>

                <div className="grid gap-6">
                  {[
                    {
                      title:
                        lang === "KR"
                          ? "스타일 및 렌더링 (Style & Rendering)"
                          : lang === "EN"
                            ? "Style & Rendering"
                            : "スタイルとレンダリング",
                      keywords:
                        "2D game sprite, flat shading, cel shaded, clean vector art",
                      desc:
                        lang === "KR"
                          ? "외곽선이 뚜렷하고 명암이 단순한 플랫/셀 셰이딩 스타일을 입력해야 배경과 피사체(캐릭터)의 경계가 명확해져 완벽한 누끼(투명화) 작업이 가능합니다."
                          : lang === "EN"
                            ? "Input a flat/cel-shaded style with clear outlines and simple shading to ensure a distinct boundary between the background and subject for perfect transparency."
                            : "外郭線がはっきりしており、明暗が単純なフラット/セルシェーディングスタイルを入力することで、背景と被写体の境界が明確になり、完璧な透明化作業が可能になります。",
                    },
                    {
                      title:
                        lang === "KR"
                          ? "포즈 및 시점 (Pose & View)"
                          : lang === "EN"
                            ? "Pose & View"
                            : "ポーズと視点",
                      keywords: "Full body, A-pose, T-pose, Isometric view",
                      desc:
                        lang === "KR"
                          ? "신체 일부가 잘리지 않도록 '전신(Full body)'을 명시하고, 게임 에셋 목적에 맞게 'A-포즈'나 쿼터뷰 형태인 '아이소메트릭 뷰'를 활용하세요."
                          : lang === "EN"
                            ? "Specify 'Full body' to avoid cutting off parts, and use 'A-pose' or 'Isometric view' for game asset purposes."
                            : "身体の一部が切れないように「全身（Full body）」を明示し、ゲームアセットの目的に合わせて「Aポーズ」やクォータービュー形式の「アイソメトリックビュー」を活用してください。",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`p-6 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                    >
                      <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <p className="font-mono text-sm text-blue-500">
                          {item.keywords}
                        </p>
                        <button
                          onClick={() => copyToClipboard(item.keywords)}
                          className={`px-3 py-1 text-xs rounded-lg transition-colors ${isDark ? "bg-white/10 hover:bg-white/20" : "bg-gray-200 hover:bg-gray-300"}`}
                        >
                          {lang === "KR"
                            ? "복사"
                            : lang === "EN"
                              ? "Copy"
                              : "コピー"}
                        </button>
                      </div>
                      <p
                        className={`${isDark ? "text-white/70" : "text-gray-700"}`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* [2] Video Generation Tips */}
              <section>
                <h3 className="text-2xl font-bold mb-6 tracking-tight flex items-center gap-2">
                  🎬{" "}
                  {lang === "KR"
                    ? "[2] 영상 생성 팁"
                    : lang === "EN"
                      ? "[2] Video Generation Tips"
                      : "[2] 動画生成のヒント"}
                </h3>
                <div className="grid gap-6">
                  {[
                    {
                      title:
                        lang === "KR"
                          ? "시점 고정 (Perspective)"
                          : lang === "EN"
                            ? "Perspective"
                            : "視点固定",
                      keywords:
                        "Fixed camera, Centrally framed, Static Perspective",
                      desc:
                        lang === "KR"
                          ? "카메라가 캐릭터를 따라가지 않고, 화면 중앙에 고정되어 런 사이클(Run Cycle)이나 제자리 걷기가 되도록 합니다. 캐릭터가 화면 밖으로 이탈하는 것을 막아줍니다."
                          : lang === "EN"
                            ? "Ensures the camera stays fixed on the character, enabling perfect run cycles or static walking, preventing the character from leaving the screen."
                            : "カメラがキャラクターを追わず、画面中央に固定されてランサイクル（Run Cycle）やその場歩きができるようにします。キャラクターが画面外へ離脱するのを防ぎます。",
                    },
                    {
                      title:
                        lang === "KR"
                          ? "화면 제한 (Negative Camera)"
                          : lang === "EN"
                            ? "Negative Camera"
                            : "画面制限",
                      keywords:
                        "camera movement, camera rotation, zooming, panning, tracking shot, perspective shift",
                      desc:
                        lang === "KR"
                          ? "AI 모델이 임의로 카메라 각도를 비틀거나 줌인/아웃하는 것을 강력하게 차단하여 일관된 뷰를 유지합니다."
                          : lang === "EN"
                            ? "Strongly prevents the AI from arbitrarily twisting camera angles or zooming in/out, maintaining a consistent view."
                            : "AIモデルが任意にカメラ角度を歪めたり、ズームイン/アウトしたりすることを強力に遮断し、一貫したビューを維持します。",
                    },
                    {
                      title:
                        lang === "KR"
                          ? "동작 및 이펙트 (Action & Effects)"
                          : lang === "EN"
                            ? "Action & Effects"
                            : "動作とエフェクト",
                      keywords:
                        "Sprinting, Dynamic Running, Seamless loop, The gun does not fire, No muzzle flash",
                      desc:
                        lang === "KR"
                          ? "단순 'Walking'보다 다리가 높이 올라가 속도감이 생기며, 불필요한 화염/총기 이펙트 효과를 빼서 순수한 캐릭터 모션에만 리소스를 집중합니다."
                          : lang === "EN"
                            ? "Focuses resources on motion by increasing leg lift for speed and removing unnecessary muzzle flash effects."
                            : "単純な「Walking」よりも足が高く上がりスピード感が生まれ、不要な炎/銃器エフェクト効果を抜いて純粋なキャラクターモーションにのみリソースを集中させます。",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`p-6 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                    >
                      <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <p className="font-mono text-sm text-blue-500">
                          {item.keywords}
                        </p>
                        <button
                          onClick={() => copyToClipboard(item.keywords)}
                          className={`px-3 py-1 text-xs rounded-lg transition-colors ${isDark ? "bg-white/10 hover:bg-white/20" : "bg-gray-200 hover:bg-gray-300"}`}
                        >
                          {lang === "KR"
                            ? "복사"
                            : lang === "EN"
                              ? "Copy"
                              : "コピー"}
                        </button>
                      </div>
                      <p
                        className={`${isDark ? "text-white/70" : "text-gray-700"}`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* [3] Common Environment Settings */}
              <section>
                <h3 className="text-2xl font-bold mb-6 tracking-tight flex items-center gap-2">
                  📐{" "}
                  {lang === "KR"
                    ? "[3] 공통 환경 세팅"
                    : lang === "EN"
                      ? "[3] Common Environment Settings"
                      : "[3] 共通環境設定"}
                </h3>
                <div className="grid gap-6">
                  {[
                    {
                      title:
                        lang === "KR"
                          ? "배경 및 그림자 (Background & Shadow)"
                          : lang === "EN"
                            ? "Background & Shadow"
                            : "背景と影",
                      keywords:
                        "Pure white background, Solid green background, No drop shadow, no floor textures, no shadows on the ground",
                      desc:
                        lang === "KR"
                          ? "바닥의 복잡한 질감이나 피사체의 그림자를 완전히 제거하여 바나나컷에서 크로마키 작업 시 가장 깔끔한 결과물을 얻게 합니다."
                          : lang === "EN"
                            ? "Removes complex floor textures and shadows for the cleanest background removal results in BananaCut."
                            : "床の複雑な質感や被写体の影を完全に除去し、BananaCutでのクロマキー作業時に最もきれいな結果物を得られるようにします。",
                    },
                    {
                      title:
                        lang === "KR"
                          ? "크기 및 비율 (Aspect Ratio)"
                          : lang === "EN"
                            ? "Aspect Ratio"
                            : "サイズと比率",
                      keywords: "--ar 16:9, --ar 9:16, --ar 1:1, 8k resolution",
                      desc:
                        lang === "KR"
                          ? "미드저니 등에서 비율 파라미터를 사용해 용도에 맞는 사이즈를 설정하고, 고해상도를 명시해 픽셀 깨짐을 방지합니다."
                          : lang === "EN"
                            ? "Sets the appropriate size using aspect ratio parameters and specifies high resolution to prevent pixelation."
                            : "ミッドジャーニーなどで比率パラメータを使用して用途に合ったサイズを設定し、高解像度を明示してピクセルの破損を防ぎます。",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`p-6 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                    >
                      <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <p className="font-mono text-sm text-blue-500">
                          {item.keywords}
                        </p>
                        <button
                          onClick={() => copyToClipboard(item.keywords)}
                          className={`px-3 py-1 text-xs rounded-lg transition-colors ${isDark ? "bg-white/10 hover:bg-white/20" : "bg-gray-200 hover:bg-gray-300"}`}
                        >
                          {lang === "KR"
                            ? "복사"
                            : lang === "EN"
                              ? "Copy"
                              : "コピー"}
                        </button>
                      </div>
                      <p
                        className={`${isDark ? "text-white/70" : "text-gray-700"}`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* [4] Prompts to Avoid */}
              <section>
                <h3 className="text-2xl font-bold mb-6 tracking-tight flex items-center gap-2">
                  🚫{" "}
                  {lang === "KR"
                    ? "[4] 피해야 할 프롬프트 및 워터마크 방지"
                    : lang === "EN"
                      ? "[4] Prompts to Avoid & Preventing Watermarks"
                      : "[4] 避けるべきプロンプトとウォーターマーク防止"}
                </h3>
                <div className={`p-6 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                  <p className={`mb-4 text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}>
                    {lang === "KR"
                      ? "로고, 텍스트, 워터마크 등 생성 시 자잘한 불필요 요소가 화면에 끼지 않도록 막는 부정적인 제어어 모음입니다. 이 키워드들을 입력하여 누끼 경계선이 훼손되는 걸 방지하세요."
                      : lang === "EN"
                        ? "Prevent small text, logos, and watermarks from getting in during generation. Keeping these unwanted elements out of your images secures clean borders."
                        : "ロゴ、テキスト、ウォーターマークなど、生成時に細かな不要要素が画面に入り込まないように防ぐためのコントロールワード集です。"}
                  </p>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <p className="font-mono text-sm text-red-500 font-semibold break-all">
                      text, typography, writing, letters, logo, watermark, signature, blurry, multiple angles, cropped head, out of frame
                    </p>
                    <button
                      onClick={() => copyToClipboard("text, typography, writing, letters, logo, watermark, signature, blurry, multiple angles, cropped head, out of frame")}
                      className={`px-3 py-1 text-xs rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${isDark ? "bg-white/10 hover:bg-white/20" : "bg-gray-200 hover:bg-gray-300"}`}
                    >
                      {lang === "KR" ? "부정어 복사" : lang === "EN" ? "Copy Negative Keywords" : "ネガティブワードコピー"}
                    </button>
                  </div>
                </div>
              </section>

              {/* [5] Practical Sample Prompts */}
              <section>
                <h3 className="text-2xl font-bold mb-6 tracking-tight flex items-center gap-2">
                  💡{" "}
                  {lang === "KR"
                    ? "[5] 추천 실전 샘플 프롬프트"
                    : lang === "EN"
                      ? "[5] Recommended Practical Sample Prompts"
                      : "[5] おすすめの実践向けプロンプト"}
                </h3>
                <div className="grid gap-6">
                  {/* Card 1: Green Screen Character */}
                  <div className={`p-6 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h4 className="text-lg font-bold">
                        🟢 {lang === "KR" ? "그린 스크린 캐릭터" : lang === "EN" ? "Green Screen Character" : "グリーンバックキャラクター"}
                      </h4>
                      <span className="px-2 py-1 text-xs font-bold rounded bg-green-500/10 text-green-500">Chroma Key</span>
                    </div>
                    <p className={`text-sm mb-4 ${isDark ? "text-white/60" : "text-gray-500"}`}>
                      {lang === "KR"
                        ? "크로마키 배경에서 2D 게임 스타일 캐릭터를 완벽하게 생성합니다."
                        : lang === "EN"
                          ? "Generates a 2D game-style character on a flawless neon-green background."
                          : "クロマキー背景の2Dゲームスタイルキャラクター生成に最適です。"}
                    </p>
                    <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-black/5 dark:bg-white/5 font-mono text-xs">
                      <p className="break-all text-blue-500 font-medium">
                        Full body, 2D game sprite, cel shaded, flat colors, running hero, active pose, solid neon-green background, no shadows on the ground --ar 1:1
                      </p>
                      <button
                        onClick={() => copyToClipboard("Full body, 2D game sprite, cel shaded, flat colors, running hero, active pose, solid neon-green background, no shadows on the ground --ar 1:1")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${isDark ? "bg-white/10 hover:bg-white/20" : "bg-gray-200 hover:bg-gray-300"}`}
                      >
                        {lang === "KR" ? "복사" : lang === "EN" ? "Copy" : "コピー"}
                      </button>
                    </div>
                  </div>

                  {/* Card 2: White Background App Character */}
                  <div className={`p-6 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h4 className="text-lg font-bold">
                        ⚪ {lang === "KR" ? "흰색 배경 앱 캐릭터" : lang === "EN" ? "White Background App Character" : "白背景のアプリ向けキャラクター"}
                      </h4>
                      <span className="px-2 py-1 text-xs font-bold rounded bg-blue-500/10 text-blue-500">App & UI</span>
                    </div>
                    <p className={`text-sm mb-4 ${isDark ? "text-white/60" : "text-gray-500"}`}>
                      {lang === "KR"
                        ? "앱 아이콘이나 UI에 어울리게 바닥 그림자가 전혀 없는 깨끗한 단색 화이트 배경을 얻어냅니다."
                        : lang === "EN"
                          ? "Creates objects or icons on a pure white background with no ground shadow for UI integration."
                          : "アプリのアイコンに最適な、床の影が全くない純粋な白背景キャラクターを得られます。"}
                    </p>
                    <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-black/5 dark:bg-white/5 font-mono text-xs">
                      <p className="break-all text-blue-500 font-medium">
                        Isometric full body view of a futuristic robot, clean vector art, flat design, pure solid white background, no floor textures, no gradient, no shadows --ar 1:1
                      </p>
                      <button
                        onClick={() => copyToClipboard("Isometric full body view of a futuristic robot, clean vector art, flat design, pure solid white background, no floor textures, no gradient, no shadows --ar 1:1")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${isDark ? "bg-white/10 hover:bg-white/20" : "bg-gray-200 hover:bg-gray-300"}`}
                      >
                        {lang === "KR" ? "복사" : lang === "EN" ? "Copy" : "コピー"}
                      </button>
                    </div>
                  </div>

                  {/* Card 3: Sprite Sheet Action Frame */}
                  <div className={`p-6 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h4 className="text-lg font-bold">
                        ⚔️ {lang === "KR" ? "스프라이트 시트 동작 프레임" : lang === "EN" ? "Action Frame for Sprite Sheets" : "スプライトシート用の動作フレーム"}
                      </h4>
                      <span className="px-2 py-1 text-xs font-bold rounded bg-purple-500/10 text-purple-500">Sprite Sheet</span>
                    </div>
                    <p className={`text-sm mb-4 ${isDark ? "text-white/60" : "text-gray-500"}`}>
                      {lang === "KR"
                        ? "스프라이트 시트로 일관성 있게 정지/동작 프레임을 반복 생성하여 분할 가능 상태로 리소스를 출력합니다."
                        : lang === "EN"
                          ? "Generates clean frame sequences aligned in grid form for motion clipping in asset studio."
                          : "スプライト画像として一貫した歩行・走行サイクルなどのフレームを出力します。"}
                    </p>
                    <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-black/5 dark:bg-white/5 font-mono text-xs">
                      <p className="break-all text-blue-500 font-medium">
                        Multiple poses sprite sheet of a fantasy knight, walking cycle, front view, cel-shaded animation style, pure solid white background, separate frames, no shadow --ar 16:9
                      </p>
                      <button
                        onClick={() => copyToClipboard("Multiple poses sprite sheet of a fantasy knight, walking cycle, front view, cel-shaded animation style, pure solid white background, separate frames, no shadow --ar 16:9")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${isDark ? "bg-white/10 hover:bg-white/20" : "bg-gray-200 hover:bg-gray-300"}`}
                      >
                        {lang === "KR" ? "복사" : lang === "EN" ? "Copy" : "コピー"}
                      </button>
                    </div>
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
