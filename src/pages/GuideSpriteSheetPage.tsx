import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { useAdSense } from '../hooks/useAdSense';

export default function GuideSpriteSheetPage() {
  useAdSense();
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className={`w-full h-full overflow-y-auto ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto p-6 md:p-12 min-h-full">
        <SEO 
          title={lang === 'KR' ? "비디오 프레임으로 스프라이트 시트 만들기 | BananaCut" : "How to Create a Sprite Sheet from Video Frames | BananaCut"}
          description={lang === 'KR' ? "앱 및 게임을 위해 정리된 비디오 프레임을 레이아웃 옵션 및 메타데이터가 있는 스프라이트 시트로 내보내는 방법을 알아봅니다." : "Learn how to export cleaned video frames as sprite sheets with layout options and metadata for apps and games."}
          canonical="https://www.bananacut.art/guides/sprite-sheet-generator"
        />
        <div className="mb-8">
          <Link to="/guides" className={`text-sm hover:underline ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {lang === 'KR' ? '← 가이드로 돌아가기' : lang === 'EN' ? '← Back to Guides' : '← ガイドに戻る'}
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8 border-b pb-6 border-gray-200 dark:border-white/10">
          <BookOpen className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <h1 className="text-3xl font-semibold tracking-tight">
            {lang === 'KR' ? '비디오 프레임으로 스프라이트 시트 만들기' : lang === 'EN' ? 'How to Create a Sprite Sheet from Video Frames' : '動画フレームからスプライトシートを作成する方法'}
          </h1>
        </div>

        <div className={`space-y-10 text-base leading-relaxed p-6 md:p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <p className="text-lg opacity-90 font-medium font-sans">
            {lang === 'KR' ? "인터랙티브 웹 앱이나 2D 라이브 게임을 만들 경우, 알파 채널이 있는 비디오 파일에 의존하거나 수백 개의 개별 PNG 파일을 다루는 것은 매우 비효율적입니다. 스프라이트 시트(Sprite Sheet)는 수십 년 동안 고성능 2D 애니메이션을 위한 업계 표준 포맷이었으며, 이를 적절하게 구성하는 방법을 이해하는 것은 대단히 중요합니다." 
             : lang === 'EN' ? "If you are building an interactive app, a 2D indie game, or a complex web experience, relying on standalone video files with an alpha channel or hundreds of loose, individual PNG files is usually highly inefficient. Sprite sheets have been the industry standard for high-performance 2D animation for decades, and understanding how to construct them properly is crucial." 
             : "インタラクティブなアプリ、2Dインディーゲーム、または複雑なWebエクスペリエンスを構築している場合、アルファチャネルを持つスタンドアロンの動画ファイルや数百のばらばらの個別のPNGファイルに依存することは、通常非常に非効率的です。スプライトシートは何十年もの間、高性能2Dアニメーションの業界標準であり、それらを適切に構築する方法を理解することが不可欠です。"}
          </p>

          <nav className={`p-5 rounded-xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
            <h2 className="font-bold text-lg mb-3">
              {lang === 'KR' ? '목차' : lang === 'EN' ? 'Table of Contents' : '目次'}
            </h2>
            <ul className="list-disc pl-5 space-y-2 opacity-80 text-sm hover:[&_a]:underline">
              <li><a href="#why-this-matters">{lang === 'KR' ? '이것이 성능 향상 측면에서 중요한 이유' : lang === 'EN' ? 'Why This Matters for Performance' : 'これがパフォーマンスのために重要な理由'}</a></li>
              <li><a href="#what-is-it">{lang === 'KR' ? '스프라이트 시트가 대체 무엇인가요?' : lang === 'EN' ? 'Understanding What a Sprite Sheet Is' : 'スプライトシートとは何かを理解する'}</a></li>
              <li><a href="#step-by-step">{lang === 'KR' ? '바나나컷 사용법 가이드' : lang === 'EN' ? 'Step-by-Step Workflow in BananaCut' : 'BananaCutのステップバイステップのワークフロー'}</a></li>
              <li><a href="#layout">{lang === 'KR' ? '열과 간격 구성' : lang === 'EN' ? 'Configuring Columns and Spacing' : '列と間隔の構成'}</a></li>
              <li><a href="#smart-crop">{lang === 'KR' ? 'Original Canvas(원래 크기 그대로) vs. Smart Crop(여백 쳐내기)' : lang === 'EN' ? 'Original Canvas vs Smart Crop' : 'オリジナルキャンバス vs スマートクロップ'}</a></li>
              <li><a href="#json">{lang === 'KR' ? 'JSON 메타데이터 스펙 이해' : lang === 'EN' ? 'Understanding the JSON Metadata' : 'JSONメタデータの理解'}</a></li>
              <li><a href="#recommended-settings">{lang === 'KR' ? '권장 내보내기 설정' : lang === 'EN' ? 'Recommended Export Settings' : '推奨されるエクスポート設定'}</a></li>
              <li><a href="#when-to-use">{lang === 'KR' ? '스프라이트 시트 VS 투명 비디오 판단 기준' : lang === 'EN' ? 'When to Use a Sprite Sheet vs Video' : 'スプライトシートと動画의使い分け'}</a></li>
              <li><a href="#common-mistakes">{lang === 'KR' ? '피해야 할 일반적인 실수' : lang === 'EN' ? 'Common Mistakes to Avoid' : '避けるべきよくある間違い'}</a></li>
              <li><a href="#faq">{lang === 'KR' ? '자주 묻는 질문 (FAQ)' : lang === 'EN' ? 'Frequently Asked Questions (FAQ)' : 'よくある質問（FAQ）'}</a></li>
            </ul>
          </nav>

          <section id="why-this-matters" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '이것이 성능 향상 측면에서 중요한 이유' : lang === 'EN' ? 'Why This Matters for Performance' : 'これがパフォーマンスのために重要な理由'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "웹 애플리케이션의 경우 네트워크를 통해 60개의 개별 이미지 파일을 가져오려면 60개의 개별 HTTP 요청이 필요합니다. 이는 웹사이트의 로딩을 심각하게 지연시키며 리소스가 불러와지는 동안 이미지가 깨져 보이게 만듭니다. 로컬 애플리케이션이나 게임 엔진에서도 수십 개의 별도 텍스처를 로드하면 하드웨어가 매초 수십번의 데이터를 능동적으로 메모리에 넣었다 빼는 불필요한 스와핑 연산을 강제하게 됩니다." 
               : lang === 'EN' ? "For web applications, fetching 60 individual image files over a network requires 60 separate HTTP requests. This severely slows down the website render blocking process and creates visual stuttering as each frame drops in randomly. Even in local applications or game engines, loading dozens of separate textures forces the hardware to continually swap data in and out of active memory frame-by-frame." 
               : "Webアプリケーションの場合、ネットワークを介して60の個別の画像ファイルをフェッチするには、60の個別のHTTPリクエストが必要です。これにより、Webサイトのレンダリングブロックプロセスが大幅に遅くなり、各フレームがランダムにドロップインするため、視覚的な途切れが発生します。ローカルアプリケーションやゲームエンジンであっても、数十の個別のテクスチャをロードすると、ハードウェアはフレームごとにアクティブメモリとの間でデータを継続的にスワップする必要があります。"}
            </p>
            <p className="opacity-80">
              {lang === 'KR' ? "스프라이트 시트는 이 문제를 단 한방에 해결합니다. 모든 프레임을 하나의 거대한 마스터 파일로 포장함으로써 시스템은 단일 그림 파일 하나만 부르게 됩니다. 이렇게 하면 드로우 콜이 크게 줄어들고 메모리 할당 효율이 향상되며 불쾌한 깜박임 없는 완벽하고 매끄러운 애니메이션 재생이 보장됩니다." 
               : lang === 'EN' ? "Sprite sheets solve this. By packing all frames into one master file, you incur only a single HTTP request or a single texture load to the GPU. This drastically reduces draw calls, improves memory allocation efficiency, and guarantees smooth animation playback without hiccups." 
               : "スプライトシートがこれを解決します。すべてのフレームを1つのマスターファイルにパックすることで、単一のHTTPリクエストまたはGPUへの単一のテクスチャロードのみが発生します。これにより、ドローコールが大幅に削減され、メモリ割り当て効率が向上し、問題のないスムーズな動きなしの再生が保証されます。"}
            </p>
          </section>

          <section id="what-is-it" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '스프라이트 시트가 대체 무엇인가요?' : lang === 'EN' ? 'Understanding What a Sprite Sheet Is' : 'スプライトシートとは何かを理解する'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "개념적으로 스프라이트 시트는 여러 장의 애니메이션 프레임 전체를 그리드 형식(행과 열) 안에 전부 바둑판처럼 펼쳐 놓은 하나의 대형 이미지 파일입니다. 게임 엔진이나 브라우저는 계속 바뀌는 낱장 이미지를 반복해서 로드하는 대신, 이 거대한 단일 이미지를 화면 뒤에 미리 불러놓고 눈에 보일만한 사각형의 \"뷰포트 창\"을 수학적으로 빠르게 이동시켜 마치 캐릭터가 매 프레임마다 자연스럽게 움직이는 것 같은 착각을 자아냅니다." 
               : lang === 'EN' ? "Conceptually, a sprite sheet is a single, large image file composed of an entire sequence of animation frames laid out in a grid format (rows and columns). Instead of loading multiple changing images, the game engine or browser loads this one massive image statically, and then rapidly shifts a visible rectangular \"viewport window\" mathematically to display different grid segments over time, creating the illusion of smooth movement." 
               : "概念的には、スプライトシートは、グリッド形式（行と列）でレイアウトされたアニメーションフレームのシーケンス全体で構成される単一の大きな画像ファイルです。ゲームエンジンやブラウザーは、複数変化する画像を読み込むのではなく、この1つの巨大な画像を静的に読み込み、表示される長方形の「ビューポートウィンドウ」を数学的にすばやく移動させて、時間の経過とともに異なるグリッドセグメントを表示し、スムーズな動きの錯覚を作り出します。"}
            </p>
          </section>

          <section id="step-by-step" className="space-y-4">
            <h2 className="text-2xl font-bold">
              {lang === 'KR' ? '바나나컷 사용법 가이드' : lang === 'EN' ? 'Step-by-Step Workflow in BananaCut' : 'BananaCutのステップバイステップのワークフロー'}
            </h2>
            <p className="opacity-80">
              {lang === 'KR' ? "웹 브라우저에서 직접 일반 동영상 파일을 스프라이트 시트로 추출해주는 것이 바로 바나나컷의 핵심 역량입니다:" 
               : lang === 'EN' ? "Creating a sprite sheet directly from video footage natively in the browser is the core functionality BananaCut provides. The process is straightforward:" 
               : "Webブラウザーで直接動画からネイティブにスプライトシートを作成することは、BananaCutが提供するコア機能です。プロセスは簡単です。"}
            </p>
            <ol className="list-decimal pl-5 opacity-80 space-y-2">
              <li>
                {lang === 'KR' ? (
                  <>프레임이 적절한 투명도를 갖도록 <strong>REMOVE(제거)</strong> 단계에서 기존 단색 배경을 완전히 제거했는지 확인하세요.</>
                ) : lang === 'EN' ? (
                  <>Ensure you have removed any solid backgrounds in the <strong>Remove</strong> step so your frames have proper transparency.</>
                ) : (
                  <>フレームが適切な透明度を持つように、<strong>Remove</strong>ステップで単色の背景を削除したことを確認してください。</>
                )}
              </li>
              <li>
                {lang === 'KR' ? (
                  <><strong>ASSET(에셋)</strong> 모듈 페이지로 이동합니다.</>
                ) : lang === 'EN' ? (
                  <>Navigate to the <strong>Asset</strong> module page.</>
                ) : (
                  <><strong>Asset</strong>モジュールページに移動します。</>
                )}
              </li>
              <li>
                {lang === 'KR' ? (
                  <><strong>Sprite Sheet</strong> 내보내기 옵션을 선택합니다.</>
                ) : lang === 'EN' ? (
                  <>Select the <strong>Sprite Sheet</strong> export option.</>
                ) : (
                  <><strong>スプライトシート</strong>エクスポートオプションを選択します。</>
                )}
              </li>
              <li>
                {lang === 'KR' ? (
                  <>엔진의 요구 사항에 맞게 배열 슬라이더(Columns 등)를 조정합니다.</>
                ) : lang === 'EN' ? (
                  <>Adjust your arrangement sliders (columns and crop padding) to fit your engine's requirements.</>
                ) : (
                  <>エンジンの要件に合わせて、配置スライダー（列とクロップのパディング）を調整します。</>
                )}
              </li>
              <li>
                {lang === 'KR' ? (
                  <>내보내기를 실행하세요. 이제 최적화된 스프라이트 이미지 파일과 구조적 데이터가 담긴 JSON 맵 파일이 함께 제공됩니다.</>
                ) : lang === 'EN' ? (
                  <>Export the payload, which provides you with both the packed PNG image file and the accompanying structural JSON map.</>
                ) : (
                  <>ペイロードをエクスポートします。これにより、パックされたPNG画像ファイルと、付随する構造的JSONマップの両方が提供されます。</>
                )}
              </li>
            </ol>
          </section>

          <section id="layout" className="space-y-4">
            <h2 className="text-2xl font-bold">
              {lang === 'KR' ? '열과 간격 구성' : lang === 'EN' ? 'Configuring Columns and Spacing' : '列と間隔の構成'}
            </h2>
            <p className="opacity-80">
              {lang === 'KR' ? (
                <>그리드의 레이아웃도 중요합니다. ASSET 설정 도구에서 정의하는 <strong>Columns (열)</strong> 매개변수는 곧장 최종 이미지의 너비를 결정합니다. 열 개수를 높게 잡으면 출력된 마스터 이미지가 가로로 훨씬 넓어집니다. 반면, 열 개수를 작게 잡으면 수평 길이가 통제되는 대신 이미지가 세로 방향으로 길어집니다.</>
              ) : lang === 'EN' ? (
                <>The layout of the grid matters. In the BananaCut Asset configuration tools, you define the <strong>Columns</strong> parameter. A higher column count forces the master image to be much wider, while a lower count results in a taller image profile.</>
              ) : (
                <>グリッドのレイアウトは重要です。BananaCutアセット構成ツールで、<strong>列（Columns）</strong>パラメーターを定義します。列数が多いとマスター画像の幅がはるかに広くなり、列数が少ないと画像のプロファイルが高くなります。</>
              )}
            </p>
            <p className="opacity-80">
              {lang === 'KR' ? (
                <>대상 플랫폼에 따라 최대 해상도 제한에 주의해야 합니다. 오래된 모바일 장비나 특정 웹 렌더링 엔진(Pixi.js 등)은 한쪽 단일 축이 4096px 또는 8192px을 초과하는 텍스처의 로드를 거부하거나 자를 수 있습니다. 따라서 원본 비디오 해상도가 매우 큰데 무수히 많은 프레임을 단일 행(row)에 전부 몰아 넣으려고 한다면 이 로딩 한계선을 초과할 수 있습니다. 그래서 총 프레임 양의 제곱근에 근접하게 10x10이나 5x5 같은 정사각형 비율이 되도록 모양을 조정하는 것이 이상적입니다.</>
              ) : lang === 'EN' ? (
                <>Depending on your target platform, you must be mindful of maximum texture limits. Older mobile devices or specific web rendering engines will truncate or fail to load textures that exceed 4096px or 8192px on a single axis. If your video resolution is very large, packing 50 frames into a single row might exceed this boundary lock; distribute them into a more square-like aspect ratio instead by adjusting the column count closer to the square root of the total frame amount.</>
              ) : (
                <>ターゲットプラットフォームによっては、テクスチャの最大制限に注意する必要があります。古いモバイルデバイスや特定のWebレンダリングエンジンは、単一の軸で4096pxまたは8192pxを超えるテクスチャを切り捨てるか、読み込みに失敗します。動画の解像度が非常に大きい場合、1行に50フレームを詰め込むと、この境界ロックを超える可能性があります。代わりに、列の合計フレーム数の平方根に近づけるように列数を調整して、正方形に近いアスペクト比に分散させます。</>
              )}
            </p>
          </section>

          <section id="smart-crop" className="space-y-4">
            <h2 className="text-2xl font-bold">
              {lang === 'KR' ? 'Original Canvas(원래 크기 그대로) vs. Smart Crop(여백 쳐내기)' : lang === 'EN' ? 'Original Canvas vs Smart Crop' : 'オリジナルキャンバス vs スマートクロップ'}
            </h2>
            <p className="opacity-80">
              {lang === 'KR' ? (
                <>일반적으로 비디오 파일에서 피사체는 영상의 일부만 차지하며 그 주변에는 움직이는 피사체를 둘러싼 엄청난 양의 텅 빈 공간(여백)이 존재합니다. 이 빈 여백까지 유지한 채 스프라이트 시트로 패킹하면 불필요하게 파일 크기가 부풀어 오르고 아까운 메모리를 낭비하게 됩니다.</>
              ) : lang === 'EN' ? (
                <>By default, video frames generally have an excessive amount of empty, transparent space around a moving subject. Packing this empty space into a sprite sheet wastes memory and bloats file sizes severely.</>
              ) : (
                <>デフォルトでは、通常、動画フレームには移動する被写体の周囲に過剰な空の透明なスペースがあります。この空のスペースをスプライトシートにパックすると、メモリが無駄になり、ファイルサイズが大幅に膨れ上がります。</>
              )}
            </p>
            <p className="opacity-80">
              {lang === 'KR' ? (
                <>이 문제를 해결하기 위해 바나나컷의 <strong>Smart Crop(여백 쳐내기)</strong> 알고리즘은 전체 영상 시퀀스를 일괄 분석하여 눈에 보이는 픽셀이 하나라도 있는 글로벌 최대 경계 상자 공간을 계산합니다. 그런 뒤 쓸모없는 여백의 크기만큼 여백을 자동으로 잘라냅니다. 이 기능을 활용하면 캐릭터의 피벗(중심점)을 흔들림 없이 유지하면서 이미지가 차지하는 메모리 점유율을 대폭 최소화해줍니다. 그러나 이와 반대로, 개발 중인 엔진에서 하드코딩된 좌표를 화면 공간에 정밀하게 맞춰야 하고 반드시 원본과 같은 1920x1080 비율을 그대로 유지해야 하는 경우에는 이 설정을 <strong>Original Canvas</strong>로 두어야 합니다.</>
              ) : lang === 'EN' ? (
                <>BananaCut's <strong>Smart Crop</strong> algorithm automatically passes through all frames, finds the global maximum bounding box of the active pixels across the entire sequence, and trims away the useless transparent margins uniformly. This ensures the pivot point remains stable across frames while dramatically minimizing the overall surface area. Conversely, if your game engine requires exact 1920x1080 bounds to align hardcoded coordinates to screen-space, ensure you leave the setting switched to <strong>Original Canvas</strong>.</>
              ) : (
                <>BananaCutの<strong>スマートクロップ</strong>アルゴリズムは、すべてのフレームを自動的に通過し、シーケンス全体でアクティブなピクセルのグローバルな最大境界ボックスを見つけ、無駄な透明なマージンを均一に切り取ります。これにより、フレーム間でピボットポイントが安定したままになり、全体の表面積が劇的に最小限に抑えられます。逆に、ゲームエンジンがハードコードされた座標を画面スペースに合わせるために正確な1920x1080の境界線を必要とする場合は、設定を<strong>オリジナルキャンバス</strong>に切り替えたままにしてください。</>
              )}
            </p>
          </section>

          <section id="json" className="space-y-4">
            <h2 className="text-2xl font-bold">
              {lang === 'KR' ? 'JSON 메타데이터 스펙 이해' : lang === 'EN' ? 'Understanding the JSON Metadata' : 'JSONメタデータの理解'}
            </h2>
            <p className="opacity-80">
              {lang === 'KR' ? (
                <>단 하나의 사진에 무수히 많은 이미지가 뭉쳐버린 결과물 이미지 본체만으로는 게임 엔진이 정확히 어느 픽셀부터 어느 픽셀까지가 프레임 1, 2, 3인지 구분해 낼 수 없습니다. 여백을 자르기 위해 Smart Crop까지 켜져있다면 수학적으로 좌표를 짐작하는건 불가능합니다. 이를 위해 바나나컷은 내보내기 시 메타데이터 JSON 구성 파일을 함께 제공합니다.</>
              ) : lang === 'EN' ? (
                <>A packed PNG image by itself can be difficult to slice accurately via coordinate math, especially if Smart Crop has altered the boundaries. When exporting, BananaCut bundles a metadata JSON config file.</>
              ) : (
                <>パックされたPNG画像自体は、スマートクロップが境界線を変更した場合、特に座標演算を介して正確にスライスするのが難しい場合があります。エクスポート時に、BananaCutはメタデータJSON構成ファイルをバンドルします。</>
              )}
            </p>
            <p className="opacity-80">
              {lang === 'KR' ? (
                <>이 JSON 파일에는 시퀀스의 각 프레임이 마스터 PNG 이미지 안에서 구조적으로 정확히 어느 좌표에 위치해 있는지 프로그래밍적으로 맵핑되어 있습니다. 정확한 높이 및 너비 측정값과 함께 세밀한 X/Y 픽셀 좌표를 포함합니다. Phaser, PixiJS 또는 Godot과 같은 유명한 범용 엔진들은 PNG 파일과 함께 단지 이 JSON 파일을 함께 드래그-앤-드롭으로 올려놓는 것만으로도 화면 분할을 완벽히 자동으로 처리해줍니다.</>
              ) : lang === 'EN' ? (
                <>This file contains a programmatic dictionary mapping out exactly where each chronological frame is structurally located inside the master PNG image, utilizing precise X/Y pixel coordinates along with accurate width/height dimensions. Engines like Phaser, PixiJS, or Godot ingest this JSON file alongside the PNG to handle the animation splitting automatically.</>
              ) : (
                <>このファイルには、正確な幅/高さの寸法とともに正確なX/Yピクセル座標を使用して、年代順の各フレームがマスターPNG画像内の正確にどこに構造的に配置されているかを示すプログラム辞書マッピングが含まれています。Phaser、PixiJS、Godotなどのエンジンは、このJSONファイルをPNGと一緒に取り込んで、アニメーションの分割を自動的に処理します。</>
              )}
            </p>
          </section>

          <section id="recommended-settings" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '권장 내보내기 설정' : lang === 'EN' ? 'Recommended Export Settings' : '推奨されるエクスポート設定'}</h2>
            <ul className="list-disc pl-5 opacity-80 space-y-2">
              <li>
                {lang === 'KR' ? (
                  <strong>모바일 웹 또는 단순 React UI 사용시:</strong>
                ) : lang === 'EN' ? (
                  <strong>For mobile web/React:</strong>
                ) : (
                  <strong>モバイルWeb/Reactの場合：</strong>
                )}{" "}
                {lang === 'KR' ? '모바일 웹 환경의 심각한 메모리 제약 환경을 고려할 때 내보내는 최종 파일 용량이 3MB~5MB 미만이 유지되도록 무조건 Smart Crop을 켜두는 것이 현명합니다. 브라우저 디코드 충돌을 방지하기 위해 열 개수를 조정하여 상대적으로 정사각형 이미지를 형성하십시오.' : lang === 'EN' ? 'Enable Smart Crop to ensure the payload stays under 3-5MB. Set your columns to form a relatively square image to prevent browser decode crashes.' : 'ペイロードが常に3〜5MB未満になるようにスマートクロップを有効にします。ブラウザーのデコードクラッシュを防ぐために、列を設定して比較的正方形の画像を形成します。'}
              </li>
              <li>
                {lang === 'KR' ? (
                  <strong>유니티 엔진(Unity) 및 언리얼(Unreal) 프로젝트:</strong>
                ) : lang === 'EN' ? (
                  <strong>For Unity/Unreal Engine:</strong>
                ) : (
                  <strong>Unity/Unreal Engineの場合：</strong>
                )}{" "}
                {lang === 'KR' ? '이러한 독립형 게임엔진 안에 들어가는 애니메이션 에셋이 엄격하게 짜인 전체화면 UI 전환 효과나 규격화된 배경 일부라면 Original Canvas 옵션을 통해 공간을 유지하는 것이 좋습니다. 하지만 작은 캐릭터 스프라이트 추출이 목적이라면 Smart Crop + JSON 메타데이터를 결합해 엔진에 올리는 방법이 권장됩니다.' : lang === 'EN' ? 'Original canvas is often preferred if the animation is part of a strict layout or full-screen UI transition, though Smart Crop + JSON is optimal for smaller character sprites.' : 'アニメーションが厳密なレイアウトまたはフルスクリーンのUIトランジションの一部である場合は、多くの場合、オリジナルキャンバスが推奨されます。小さなキャラクタースプライトには、スマートクロップ+JSONが最適です。'}
              </li>
            </ul>
          </section>

          <section id="common-mistakes" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '피해야 할 일반적인 실수' : lang === 'EN' ? 'Common Mistakes to Avoid' : '避けるべきよくある間違い'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "60초 분량의 전체 비디오에서 하나의 거대한 스프라이트 시트를 구성하려는 시도는 무모하고 생산적이지 않습니다. 초당 30프레임으로 60초 클립은 1,800개의 고해상도 이미지가 들어 있다는 뜻입니다. 이것을 모두 하나의 스프라이트 시트로 패킹하면 즉시 엔진이나 브라우저를 충돌시키는 기가바이트 크기의 괴물과도 같은 이미지를 만들어버리고 맙니다. 스프라이트 시트는 무조건 짧은 동작(달리기 루프, 일회성 폭발, 캐릭터 공격) 전용으로 활용하세요." 
               : lang === 'EN' ? "Attempting to construct a Sprite Sheet from a 60-second video clip is counter-productive. A 60-second clip at 30 frames per second equals 1,800 full-resolution images. Packing this into a single sheet will result in a monstrous, gigabyte-sized image that will instantly crash any engine or browser that attempts to unpack it. Keep sprite sheets relegated to short actions (run cycles, explosions, character attacks)." 
               : "60秒のビデオクリップからスプライトシートを構成しようとすることは逆効果です。毎秒30フレームの60秒クリップは、1,800のフル解像度画像に相当します。これを1枚のシートに詰め込むと、その展開を試みるあらゆるエンジンやブラウザーを即座にクラッシュさせる、ギガバイトサイズの巨大な画像ができあがります。スプライトシートは、短いアクション（実行サイクル、爆発、キャラクターの攻撃）にのみ使用してください。"}
            </p>
          </section>

          <section id="when-to-use" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '스프라이트 시트 VS 투명 비디오 판단 기준' : lang === 'EN' ? 'When to Use a Sprite Sheet vs Video' : 'スプライトシートと動画の使い分け'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "사용자의 조작에 따라 애니메이션이 코드로 명시적으로 구동되어야 하는 경우 '스프라이트 시트(Sprite Sheet)'를 절대적으로 사용해야 합니다. 예를 들어, 게임에서 사용자가 마우스를 클릭하거나 조이스틱을 움직일 때만 5번째 프레임 애니메이션을 재생해야 한다면 시트 파일이 필수입니다. 만약 유저의 어떠한 개입 없이 랜딩 웹페이지 상단 등에서 수동적이고 지속적이며 조작도 불가능한 반복 백그라운드 영상 따위가 필요한 거라면, 그땐 'Transparent WebM Video (투명 비디오)'로 내보내는 편이 훨씬 프로세스를 줄여주고 비디오가 지원하는 압축 알고리즘 덕분에 더 작은 용량을 확보할 수 있습니다." 
               : lang === 'EN' ? "Use a Sprite Sheet any time the animation must be explicitly driven by programmatic logic in your application. For example, if frame 5 should only play when a user clicks the mouse or moves a joystick, use a sprite sheet. If you only require a passive, continuous, non-interactive decoration looped in the background of a landing page sidebar, exporting a direct Transparent WebM Video is usually simpler and yields smaller file footprints." 
               : "アニメーションがアプリケーションのプログラムロジックによって明示的に駆動される必要がある場合は常に、スプライトシートを使用してください。たとえば、ユーザーがマウスをクリックするかジョイスティックを動かしたときにのみフレーム5を再生する必要がある場合は、スプライトシートを使用します。ランディングページのサイドバーの背景でループされる、受動的で継続的でインタラクティブではない装飾のみが必要な場合は、直接的な透明WebMビデオをエクスポートする方が通常はシンプルであり、ファイルのフットプリントを小さくすることができます。"}
            </p>
          </section>

          <hr className={`my-8 ${isDark ? 'border-white/10' : 'border-gray-200'}`} />

          <section id="faq" className="space-y-4">
            <h3 className="text-xl font-bold">{lang === 'KR' ? '자주 묻는 질문 (FAQ)' : lang === 'EN' ? 'Frequently Asked Questions (FAQ)' : 'よくある質問（FAQ）'}</h3>
            <div className="space-y-4">
              <div>
                <strong className="block mb-1">{lang === 'KR' ? '스프라이트 시트 내보낸 결과물이 왜 이렇게 용량이 큰가요?' : lang === 'EN' ? 'Why is the generated sprite sheet image so large in bytes?' : '生成されたスプライトシートの画像ファイルのサイズが非常に大きいのはなぜですか？'}</strong>
                <p className="opacity-80">{lang === 'KR' ? '무손실 압축 포맷인 PNG가 지닌 태생적인 구조적 한계 때문입니다. 비디오에는 강력한 프레임 간 코덱이 압축을 돕지만 PNG는 그런게 없습니다. 만약 이미지가 8000x8000 픽셀의 큰 캔버스를 가지고 있다면 그것이 모조리 텅 비어있는 투명한 공간이라고 할지라도 캔버스 크기만으로 용량이 발생합니다. 바나나컷에서 Smart Crop을 활성화하거나 굳이 진정한 HD 고화질 에셋이 필요한 경우가 아니라면 파일이 들어오기 전 업로드 할 비디오의 해상도를 미리 낮추는 방식(Downscaling)이 추천됩니다.' : lang === 'EN' ? "Uncompressed PNG data adds up quickly. If an image is 8000x8000 pixels, it is heavy even if most of it is transparent. Try enabling Smart Crop, or downscaling the original video resolution before uploading it if you don't need true HD assets." : '非圧縮PNGデータはすぐに加算されます。画像が8000x8000ピクセルの場合、大部分が透明であっても重くなります。真のHDアセットが必要ない場合は、スマートクロップを有効にするか、アップロードする前に元の動画の解像度をダウンスケールしてみてください。'}</p>
              </div>
              
              <div>
                <strong className="block mb-1">{lang === 'KR' ? 'JSON 메타데이터 파일은 어떤 형식을 따르고 있나요?' : lang === 'EN' ? 'What format is the JSON map in?' : 'JSONマップはどのような形式ですか？'}</strong>
                <p className="opacity-80">{lang === 'KR' ? 'JSON 파일의 형태는 보편적으로 사용되는 도구인 TexturePacker(텍스처팩커)의 보편적인 신택스 구조(filename, frame, sourceSize, spriteSourceSize 등)와 완벽히 호환되는 범용 규격을 따릅니다. 따라서 Phaser, PixiJS 및 기타 일반적인 2D 에디터에서 즉시 지원이 보장됩니다.' : lang === 'EN' ? 'The JSON output dictates standard frame properties (filename, frame boundaries, sourceSize, spriteSourceSize) in a format heavily compatible with prevalent tools like TexturePacker syntax, making it ingestible by Phaser, PixiJS, and generalized 2D tools.' : 'JSON出力は、標準フレームプロパティ（ファイル名、フレーム境界、sourceSize、spriteSourceSize）をTexturePacker構文のような一般的なツールと互換性の強い形式で指示し、Phaser、PixiJS、および一般化された2Dツールで取り込み可能にします。'}</p>
              </div>
            </div>
          </section>

          <section className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
            <h3 className="font-bold mb-4">{lang === 'KR' ? '관련 가이드' : lang === 'EN' ? 'Related Guides' : '関連ガイド'}</h3>
            <div className="flex flex-col gap-2">
              <Link to="/guides/remove-background-from-video" className={`hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{lang === 'KR' ? '브라우저에서 비디오 배경 제거하는 방법' : lang === 'EN' ? 'How to Remove Video Backgrounds' : '動画の背景を削除する方法'}</Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
