import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { useAdSense } from '../hooks/useAdSense';

export default function GuideRemoveBackgroundPage() {
  useAdSense();
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className={`w-full h-full overflow-y-auto ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto p-6 md:p-12 min-h-full">
        <SEO 
          title={lang === 'KR' ? "브라우저에서 비디오 배경 제거하는 방법 | BananaCut" : "How to Remove Backgrounds from Video in Your Browser | BananaCut"}
          description={lang === 'KR' ? "비디오 배경을 제거하고, 프레임을 정리하고, 브라우저에서 PNG 시퀀스, WebM 또는 스프라이트 시트를 내보내는 실용적인 가이드." : "A practical guide to remove video backgrounds, clean frames, and export PNG sequences, WebM, or sprite sheets in your browser."}
          canonical="https://www.bananacut.art/guides/remove-background-from-video"
        />
        <div className="mb-8">
          <Link to="/guides" className={`text-sm hover:underline ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {lang === 'KR' ? '← 가이드로 돌아가기' : lang === 'EN' ? '← Back to Guides' : '← ガイドに戻る'}
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8 border-b pb-6 border-gray-200 dark:border-white/10">
          <BookOpen className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <h1 className="text-3xl font-semibold tracking-tight">
            {lang === 'KR' ? '브라우저에서 비디오 배경 제거하는 방법' : lang === 'EN' ? 'How to Remove Backgrounds from Video in Your Browser' : 'ブラウザで動画の背景を削除する方法'}
          </h1>
        </div>

        <div className={`space-y-10 text-base leading-relaxed p-6 md:p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <p className="text-lg opacity-90 font-medium">
            {lang === 'KR' ? "게임 에셋을 제작하든, 버튜버 프레젠테이션을 만들든, UI 애니메이션을 준비하든 피사체를 배경에서 분리해야 할 때가 많습니다. 과거에는 비디오 배경을 제거하려면 복잡한 데스크톱 소프트웨어와 긴 렌더링 시간이 필요했습니다. 더 이상 그렇지 않습니다. 바나나컷을 사용하면 웹 브라우저 내에서 배경을 직접 제거하고, 허용 오차 수준을 조정하며, 투명한 비디오나 스프라이트 시트를 내보낼 수 있습니다." 
             : lang === 'EN' ? "Whether you're creating assets for a game, making a VTuber presentation, or preparing UI animations, you often need a subject isolated from its background. Historically, removing backgrounds from videos required complex desktop software and lengthy rendering. Not anymore. BananaCut allows you to strip away backgrounds, tweak tolerance levels, and export transparent video or sprite sheets—all within your web browser." 
             : "ゲームアセットの作成、VTuberのプレゼンテーション、UIアニメーションの準備など、被写体を背景から分離する必要があることがよくあります。これまで、動画の背景を削除するには、複雑なデスクトップソフトウェアと長いレンダリングが必要でした。もうそんなことはありません。BananaCutを使用すると、ウェブブラウザ内で直接背景を削除し、許容レベルを調整し、透明な動画やスプライトシートをエクスポートできます。"}
          </p>

          <nav className={`p-5 rounded-xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
            <h2 className="font-bold text-lg mb-3">
              {lang === 'KR' ? '목차' : lang === 'EN' ? 'Table of Contents' : '目次'}
            </h2>
            <ul className="list-disc pl-5 space-y-2 opacity-80 text-sm hover:[&_a]:underline">
              <li><a href="#why-this-matters">{lang === 'KR' ? '이것이 현대적인 워크플로우에서 중요한 이유' : lang === 'EN' ? 'Why This Matters in Modern Workflows' : 'これが現代のワークフローで重要な理由'}</a></li>
              <li><a href="#why-hard">{lang === 'KR' ? '비디오 배경 제거가 전통적으로 고된 이유' : lang === 'EN' ? 'Why Video Background Removal is Traditionally Hard' : '動画の背景削除が従来困難だった理由'}</a></li>
              <li><a href="#step-1">{lang === 'KR' ? '1단계: 비디오 업로드 및 프레임 추출' : lang === 'EN' ? 'Step 1: Upload Video & Extract Frames' : 'ステップ1：動画のアップロードとフレームの抽出'}</a></li>
              <li><a href="#step-2">{lang === 'KR' ? '2단계: 배경색 선택' : lang === 'EN' ? 'Step 2: Pick the Background Color' : 'ステップ2：背景色の選択'}</a></li>
              <li><a href="#step-3">{lang === 'KR' ? '3단계: 허용 오차 조정 및 가장자리 다듬기' : lang === 'EN' ? 'Step 3: Adjust Tolerance & Clean Edges' : 'ステップ3：許容誤差の調整とエッジのクリーンアップ'}</a></li>
              <li><a href="#recommended-settings">{lang === 'KR' ? '최상의 결과를 위한 권장 설정' : lang === 'EN' ? 'Recommended Settings for Best Results' : '最良の結果を得るための推奨設定'}</a></li>
              <li><a href="#common-mistakes">{lang === 'KR' ? '피해야 할 일반적인 실수' : lang === 'EN' ? 'Common Mistakes to Avoid' : '避けるべきよくある間違い'}</a></li>
              <li><a href="#export">{lang === 'KR' ? '내보내기: PNG 시퀀스, WebM 또는 스프라이트 시트' : lang === 'EN' ? 'Exporting: PNG Sequence, WebM, or Sprite Sheet' : 'エクスポート：PNGシーケンス、WebM、またはスプライトシート'}</a></li>
              <li><a href="#practical-tips">{lang === 'KR' ? '복잡한 비디오를 위한 실용적인 팁' : lang === 'EN' ? 'Practical Tips for Complex Videos' : '複雑な動画のための実践的なヒント'}</a></li>
              <li><a href="#faq">{lang === 'KR' ? '자주 묻는 질문 (FAQ)' : lang === 'EN' ? 'Frequently Asked Questions (FAQ)' : 'よくある質問（FAQ）'}</a></li>
            </ul>
          </nav>

          <section id="why-this-matters" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '이것이 현대적인 워크플로우에서 중요한 이유' : lang === 'EN' ? 'Why This Matters in Modern Workflows' : 'これが現代のワークフローで重要な理由'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "독립 개발자나 소규모 디자인 팀에게 효율성은 모든 것입니다. 웹사이트 히어로 섹션을 위한 빠른 루핑 애니메이션이나 2D 인디 게임을 위한 캐릭터 리액션만 필요할 때, Adobe Premiere나 After Effects 같은 무거운 비디오 편집 도구를 부팅하는 것은 흐름을 깨뜨릴 수 있습니다. 브라우저 기반 배경 제거 도구는 에셋 생성을 민주화하여 최신 웹 브라우저가 있는 사람이라면 누구나 단 몇 초 만에 투명한 에셋을 생성할 수 있게 합니다. 비싼 하드웨어나 전문 컴포지팅 기술이 필요 없고 원본 레코딩에서 최종 프로젝트로 바로 이어지는 파이프라인이 간소화됩니다." 
               : lang === 'EN' ? "For independent developers and small design teams, efficiency is everything. When you only need a quick looping animation for a website hero section or a character reaction for a 2D indie game, booting up a heavy video editing suite like Adobe Premiere or After Effects can easily break your momentum. Browser-based background removal democratizes asset creation, allowing anyone with a modern web browser to generate transparent assets in seconds. This eliminates the need for expensive hardware or specialized compositing skills, streamlining the pipeline from raw recording directly into your final project." 
               : "独立系開発者や小規模なデザインチームにとって、効率はすべてです。ウェブサイトのヒーローセクション用の短いループアニメーションや、2Dインディーゲームのキャラクターリアクションだけが必要な場合、Adobe PremiereやAfter Effectsのような重い動画編集スイートを起動するのは勢いを削ぐ可能性があります。ブラウザベースの背景削除はアセットの作成を民主化し、最新のウェブブラウザを持つ誰でも数秒で透明なアセットを作成できるようにします。"}
            </p>
          </section>

          <section id="why-hard" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '비디오 배경 제거가 전통적으로 고된 이유' : lang === 'EN' ? 'Why Video Background Removal is Traditionally Hard' : '動画の背景削除が従来困難だった理由'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "피사체의 테두리가 고정된 정적 이미지와 달리, 비디오는 모션 블러, 조명 변화, 압축 아티팩트 및 프레임 속도 제한을 겪습니다. 프레임 1에서 완벽한 단색 녹색 환경이 프레임 14에서는 피사체가 빠르게 이동하면서 눈에 띄는 녹색 얼룩(Green Spill)을 남길 수 있습니다." 
               : lang === 'EN' ? "Unlike static images where the edge of a subject is fixed, videos suffer from motion blur, lighting changes, compression artifacts, and frame-rate limitations. A green screen that appears perfectly solid and drops out flawlessly on frame 1 might leave noticeable green spill on frame 14 due to the subject moving quickly across the frame." 
               : "被写体のエッジが固定されている静止画像とは異なり、動画はモーションブラー、照明の変化、圧縮アーティファクト、およびフレームレートの制限を被ります。フレーム1で完璧に単色で問題なく抜けるグリーンスクリーンでも、被写体が画面全体をすばやく移動するため、フレーム14では顕著な緑のスピルが残る場合があります。"}
            </p>
            <p className="opacity-80">
              {lang === 'KR' ? "표준 크로마키 작업 도구는 일관된 조명에 크게 의존합니다. 게다가 (배경색이 피사체에 반사되는) '스필'을 처리하려면 복잡한 마스킹과 색 보정이 필요할 때가 많습니다. 전문 도구는 이런 단계를 프레임별로 섬세하게 처리하지만, 대화형 미디어에 쓸 단순 에셋을 추출하려는 목적만 있다면 이런 접근법은 너무 과도하고 무겁습니다." 
               : lang === 'EN' ? "Standard chroma keying tools rely heavily on consistent lighting. Furthermore, dealing with \"spill\" (where the background color reflects onto the subject) often requires complex masking and color correction. Professional tools manage this by allowing precise, keyframe-by-keyframe masking, but this approach is excessively heavy and overkill when you are just trying to extract simple assets for interactive media." 
               : "標準のクロマキーツールは一貫した照明に大きく依存しています。さらに、「スピル」（背景色が被写体に反射する現象）の処理には、複雑なマスキングと色補正が必要になることがよくあります。専門のツールは、キーフレームごとの正確なマスキングを許可することでこれを管理しますが、インタラクティブメディア用のシンプルなアセットを抽出しようとしているだけの場合、このアプローチは重すぎて過剰です。"}
            </p>
          </section>

          <section id="step-1" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '1단계: 비디오 업로드 및 프레임 추출' : lang === 'EN' ? 'Step 1: Upload Video & Extract Frames' : 'ステップ1：動画のアップロードとフレームの抽出'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "미디어 클립을 준비하는 것부터 시작하세요. 10초에서 15초 미만의 짧은 클립이 이상적입니다. 왜냐하면 주로 루핑 에셋이나 특정 액션을 목적으로 하기 때문입니다. 비디오 파일을 바나나컷 인터페이스에 불러오세요." 
               : lang === 'EN' ? "Start by preparing your media clip. The ideal clip should be relatively short (under 10-15 seconds) as it is primarily intended for looping assets or specific actions. Load your video file into the BananaCut interface." 
               : "メディアクリップを準備することから始めます。ループアセットや特定のアクションを主な目的としているため、理想的なクリップは比較的短い（10〜15秒未満）ことです。BananaCutのインターフェースに動画ファイルを読み込みます。"}
            </p>
            <p className="opacity-80">
              {lang === 'KR' ? "중요한 점은 WebAssembly 및 캔버스 기술을 사용하여 브라우저 내부에서 모든 과정이 백그라운드 서버 없이 100% 로컬로 실행된다는 것입니다. 즉, 느린 서버 업로드가 없고 미디어에 대한 개인 정보 보호 우려가 없으며 처리 대기도 없습니다. 바나나컷은 자동으로 비디오를 디코딩하고 개별 이미지 프레임으로 추출한 뒤 컴퓨터 RAM에 저장하므로 전체 시퀀스에 투명화 작업이 어떻게 적용되는지 실시간으로 확인할 수 있습니다." 
               : lang === 'EN' ? "Crucially, everything runs locally inside your browser using WebAssembly and canvas technologies. This means there are no slow server uploads, no privacy concerns regarding your media, and no waiting in a processing queue. BananaCut automatically decodes the video and extracts it into individual image frames, storing them in your computer's RAM, so you can see exactly how the removal affects the entire sequence sequentially." 
               : "重要なのは、WebAssemblyとキャンバステクノロジーを使用して、すべてがブラウザ内でローカルに実行されることです。つまり、遅いサーバーへのアップロード、メディアに関するプライバシーの懸念、そして処理キューでの待機がありません。BananaCutは自動的に動画をデコードして個別の画像フレームに抽出し、コンピューターのRAMに保存するため、削除がシーケンス全体にどのように影響するかを順次正確に確認できます。"}
            </p>
          </section>

          <section id="step-2" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '2단계: 배경색 선택' : lang === 'EN' ? 'Step 2: Pick the Background Color' : 'ステップ2：背景色の選択'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "프레임이 로드되고 타임라인 블록에 표시되면, 인터페이스에 제공된 색상 스포이드 도구(Picker)를 사용하여 제거하려는 배경을 직접 클릭합니다. 일반적인 밝은 초록색, 파란색, 흰색이든 AI 영상 생성 도구에서 뽑아낸 생성 배경색이든 모두 가능합니다." 
               : lang === 'EN' ? "Once your frames are loaded and visible in the timeline block, the first active step is establishing your key color. Use the Color Picker tool provided in the interface. Click anywhere on the background you want to remove—whether it is a classic bright green, blue, white, or a generated solid color from an AI video tool." 
               : "フレームが読み込まれ、タイムラインブロックに表示されたら、最初の能動的なステップはキーカラーを確立することです。インターフェースで提供されるスポイトツールを使用します。削除したい背景の任意の場所をクリックします—典型的な明るい緑、青、白、またはAI動画ツールから生成された単色など。"}
            </p>
            <p className="opacity-80">
              {lang === 'KR' ? "최상의 초기 결과를 얻으려면 '평균적인' 조명을 나타내는 배경 영역을 클릭해보세요. 조명이 고르게 퍼져 있다면 어디를 클릭해도 됩니다. 희미한 그라데이션이 있다면, 가장 어둡거나 밝은 가장자리보다 중간 톤을 선택하는 것이 더 좋은 결과를 보여줍니다." 
               : lang === 'EN' ? "For the best initial results, try to click an area of the background that represents the \"average\" lighting. If the background is uniformly lit, clicking anywhere works. If there is a slight gradient, choosing the middle tone often yields a better starting point than clicking the absolute darkest or brightest corner." 
               : "最良の初期結果を得るには、「平均的な」照明を表す背景領域をクリックしてみてください。背景が均等に照らされている場合は、どこをクリックしてもうまくいきます。わずかなグラデーションがある場合は、最も暗い角や最も明るい角をクリックするよりも、中間トーンを選択する方が良い出発点になることがよくあります。"}
            </p>
          </section>

          <section id="step-3" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '3단계: 허용 오차 조정 및 가장자리 다듬기' : lang === 'EN' ? 'Step 3: Adjust Tolerance & Clean Edges' : 'ステップ3：許容誤差の調整とエッジのクリーンアップ'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "그림자, 조명 변화, 비디오 압축으로 인해 배경이 완벽하게 균일한 단일 헥스(hex) 코드인 경우는 거의 없으므로, 초기 색상 클릭만으로 완벽한 커팅을 기대하기 어렵습니다. 이 때 Tolerance(허용 오차)를 조정해야 합니다." 
               : lang === 'EN' ? "Because backgrounds are rarely a perfectly uniform hex color due to shadows, lighting variations, and video compression, you will almost never achieve a perfect cut with just the initial color pick. You need to adjust the <strong>Tolerance</strong>." 
               : "影、照明の変化、および動画圧縮のため、背景が完全に均一なhexカラーであることはめったにないため、初期の色選択だけで完璧なカットを実現することはほとんどありません。<strong>Tolerance（許容誤差）</strong>を調整する必要があります。"}
            </p>
            <p className="opacity-80">
              {lang === 'KR' ? "Tolerance 슬라이더를 천천히 올려보세요. 값을 올리면 알고리즘이 '배경'으로 간주하는 색상의 범위가 넓어집니다. 배경이 거의사라졌을 때 슬라이더 값을 유지하되, 슬라이더가 피사체의 내부까지 침범하기 전에 멈추세요." 
               : lang === 'EN' ? "Increase the Tolerance slider gently. As you increase it, you widen the range of colors the algorithm considers \"background.\" Stop when the background visibly vanishes but stop before it starts eating into your character or subject." 
               : "Toleranceスライダーをゆっくり上げます。上げると、アルゴリズムが「背景」と見なす色の範囲が広がります。背景が目立たなくなったときに止めますが、キャラクターや被写体に食い込む前に止めます。"}
            </p>
            <p className="opacity-80">
              {lang === 'KR' ? "다음으로 Softness(부드러움) 슬라이더를 사용하세요. Softness를 증가시키면 투명도 경계에 알파 페더링 효과가 적용됩니다. 피사체 주위에 거칠고 들쭉날쭉한 투명한 테두리를 남기는 대신 모서리를 부드럽게 블렌딩하여 최종 완성물을 다른 콘텐츠 위에 올렸을 때 훨씬 자연스럽게 보이게 해줍니다." 
               : lang === 'EN' ? "Next, use the <strong>Softness</strong> slider. Increasing softness applies an alpha-feathering effect. Rather than leaving harsh, jagged, transparent borders around your subject, softness blends the edges smoothly into transparency, making the final asset look much more natural when placed on top of other content." 
               : "次に、<strong>Softness（柔らかさ）</strong>スライダーを使用します。柔らかさを増やすと、アルファのぼかし効果が適用されます。被写体の周りに粗く、ギザギザとした透明な境界を残すのではなく、柔らかさがエッジを透明度に滑らかにブレンドし、最終的なアセットを他のコンテンツの上に置いたときに、はるかに自然に見えるようにします。"}
            </p>
          </section>

          <section id="recommended-settings" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '최상의 결과를 위한 권장 설정' : lang === 'EN' ? 'Recommended Settings for Best Results' : '最良の結果を得るための推奨設定'}</h2>
            <ul className="list-disc pl-5 opacity-80 space-y-2">
              <li>{lang === 'KR' ? <strong>아주 선명한 그린 스크린용:</strong> : lang === 'EN' ? <strong>For clean green screens:</strong> : <strong>きれいなグリーンスクリーン用：</strong>} {lang === 'KR' ? 'Tolerance 약 10-20%, Softness 약 5%.' : lang === 'EN' ? 'Tolerance around 10-20%, Softness around 5%.' : 'Toleranceは約10-20%、Softnessは約5%。'}</li>
              <li>{lang === 'KR' ? <strong>AI가 생성한 배경용:</strong> : lang === 'EN' ? <strong>For AI-generated solid backgrounds:</strong> : <strong>AI生成背景用：</strong>} {lang === 'KR' ? 'Tolerance 약 20-35% (AI 출력물은 블러 때문에 경계선이 선명하지 않습니다), Softness는 적당량을 유지하세요.' : lang === 'EN' ? 'Tolerance around 20-35% (AI outputs often have heavy compression banding), Softness around 10%.' : 'Toleranceは約20-35%（AI出力にはグラデーションがかかっていることが多い）、Softnessは約10%。'}</li>
              <li>{lang === 'KR' ? <strong>흰색 배경용:</strong> : lang === 'EN' ? <strong>For white backgrounds:</strong> : <strong>白背景用：</strong>} {lang === 'KR' ? 'Tolerance 약 5-15% (캐릭터의 눈 흰자위나 치아가 제거되지 않도록 주의하세요).' : lang === 'EN' ? 'Tolerance around 5-15% (be careful not to remove the whites of characters\' eyes or teeth).' : 'Toleranceは約5-15%（キャラクターの白目や歯が削除されないように注意してください）。'}</li>
            </ul>
          </section>

          <section id="common-mistakes" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '피해야 할 일반적인 실수' : lang === 'EN' ? 'Common Mistakes to Avoid' : '避けるべきよくある間違い'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "가장 빈번한 실수 중 하나는 영상 구석에 있는 모든 잔여 그림자를 지우려는 욕심에 Tolerance 슬라이더를 너무 높게 올리는 것입니다. 그렇게 하면 피사체 내부에 '구멍'이 나타납니다. 대신 적당한 Tolerance를 먼저 설정한 다음, 수동 RECOVER 브러시 도구를 나중에 활용하여 원본 자산을 훼손하지 않고 화면 귀퉁이 모서리를 칠해서 지우는 방법이 옳습니다." 
               : lang === 'EN' ? "One of the most frequent mistakes is pushing the Tolerance slider too high in an attempt to clean up every single shadow in the corner of the frame. This results in \"holes\" appearing in the subject. Instead, use a moderate Tolerance, and then utilize the manual <strong>Recover</strong> brush tools later to manually paint away stubborn corners without damaging your core asset." 
               : "最も頻繁におこる間違いの1つは、フレームの隅にあるすべての影を片付けようとしてToleranceスライダーを上げすぎることです。これにより、被写体に「穴」が現れます。代わりに、適度なToleranceを使用し、後で手動の<strong>Recover</strong>ブラシツールを利用して、コアアセットを損なうことなく頑固なコーナーを手動で塗りつぶします。"}
            </p>
            <p className="opacity-80">
              {lang === 'KR' ? "또 다른 실수는 타임라인을 확인하지 않는 것입니다. 프레임 1에서는 완벽한 컷아웃을 얻었을지 모르지만, 프레임 20에서는 그림자가 이동할 수 있습니다. 항상 투명화 설정이 전체 비디오 시퀀스 걸쳐 일관되게 적용되는지 비디오 타임라인을 스크러빙하며 확인하세요." 
               : lang === 'EN' ? "Another mistake is ignoring the timeline. You might achieve a perfect cutout on Frame 1, but shadows might shift by Frame 20. Always scrub through your video timeline to ensure the background removal holds up consistently across the entire sequence." 
               : "もう一つの間違いはタイムラインを無視することです。フレーム1で完璧なカットアウトを実現したとしても、フレーム20までに影が移動する可能性があります。背景削除がシーケンス全体で一貫して維持されるように、常に動画タイムラインをスクラブしてください。"}
            </p>
          </section>

          <section id="export" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '내보내기: PNG 시퀀스, WebM 또는 스프라이트 시트' : lang === 'EN' ? 'Exporting: PNG Sequence, WebM, or Sprite Sheet' : 'エクスポート：PNGシーケンス、WebM、またはスプライトシート'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "배경이 완전히 제거되고 모든 프레임에 걸쳐 알파 테두리를 정리한 후 ASSET 페이지로 이동하세요. 바나나컷은 프로젝트 요구 사항에 맞는 다양한 출력 형식을 제공합니다:" 
               : lang === 'EN' ? "After the background is completely removed and the alpha edges are cleaned up across all frames, navigate to the Asset page. BananaCut offers several output formats tailored to different project needs:" 
               : "背景が完全に削除され、すべてのフレームでアルファエッジがきれいになった後、Assetページに移動します。BananaCutは、さまざまなプロジェクトのニーズに合わせた複数の出力フォーマットを提供します。"}
            </p>
            <ul className="list-disc pl-5 opacity-80 space-y-3">
              <li>{lang === 'KR' ? <strong>투명한 비디오 (.webm):</strong> : lang === 'EN' ? <strong>Transparent Video (.webm):</strong> : <strong>透明動画（.webm）：</strong>} {lang === 'KR' ? '이것은 현대 웹 브라우저 사용자에게 가장 좋은 선택지 입니다. 완전한 투명 알파 채널을 지원하면서 고품질로 렌더링을 유지하여 UI 오버레이 또는 방문 페이지 그래픽에 매우 이상적입니다.' : lang === 'EN' ? 'This is the best choice for web display, modern browsers, and presentations. It retains high quality while supporting a fully transparent alpha channel, making it ideal for UI overlays or landing page graphics.' : 'これは、Web表示、最新のブラウザ、およびプレゼンテーションに最適な選択肢です。完全に透明なアルファチャネルをサポートしながら高品質を維持するため、UIオーバーレイやランディングページのグラフィックに最適です。'}</li>
              <li>{lang === 'KR' ? <strong>스프라이트 시트 (PNG/JSON):</strong> : lang === 'EN' ? <strong>Sprite Sheet (PNG/JSON):</strong> : <strong>スプライトシート（PNG/JSON）：</strong>} {lang === 'KR' ? '게임 엔진(Unity, Godot, Unreal, Phaser 등)에 통합하기 위한 궁극의 포맷. 모든 프레임을 하나의 최적화된 그리드 이미지에 포맷시켜 개별 이미지 시퀀스에 비해 메모리 오버헤드를 극적으로 줄입니다.' : lang === 'EN' ? 'The ultimate format for game engines (Unity, Godot, Unreal, Phaser). It packs all frames into a single, optimized grid image, drastically reducing draw calls and memory overhead compared to individual image sequences.' : 'ゲームエンジン（Unity、Godot、Unreal、Phaser）の究極の形式。すべてのフレームを1つの最適化されたグリッド画像にパックし、個々の画像シーケンスと比較してドローコールとメモリのオーバーヘッドを劇的に減らします。'}</li>
              <li>{lang === 'KR' ? <strong>ZIP (PNG 시퀀스):</strong> : lang === 'EN' ? <strong>ZIP (PNG Sequence):</strong> : <strong>ZIP（PNGシーケンス）：</strong>} {lang === 'KR' ? '개별 프레임들을 압축하여 즉시 After Effects 같은 컴포지팅 도구로 연결할 거라면 ZIP 형태로 저장하세요.' : lang === 'EN' ? 'Best if you are sending the files to another animator or bringing them into complex compositing software like After Effects where you need completely lossless, individual frames.' : 'ファイルを別のアニメーターに送信する場合や、完全にロスレスの個々のフレームが必要なAfter Effectsなどの複雑なコンポジットソフトウェアに持ち込む場合に最適です。'}</li>
            </ul>
          </section>

          <hr className={`my-8 ${isDark ? 'border-white/10' : 'border-gray-200'}`} />

          <section id="practical-tips" className="space-y-4">
            <h3 className="text-xl font-bold">{lang === 'KR' ? '복잡한 비디오를 위한 실용적인 팁' : lang === 'EN' ? 'Practical Tips for Complex Videos' : '複雑な動画のための実践的なヒント'}</h3>
            <p className="opacity-80">
              {lang === 'KR' ? "피사체와 배경색이 완전히 동일한 경우 (예: 그린스크린 환경의 피사체가 초록색 옷을 입고있는 상황) Tolerance를 올리면 불가피하게 옷마저 지워집니다. 이런 어려운 상황에서는 바나나컷의 Exclusion Brush(제외 브러쉬)를 활용 해봅시다. 이 도구로 옷 위를 칠해주면 칠해진 영역에 대해서는 엔진이 배경 제거를 무시하도록 지시하여 피사체의 디테일을 보호합니다." 
               : lang === 'EN' ? "If your subject contains the exact same color as the background—for example, a character wearing a green tie on a green screen—increasing the Tolerance will inevitably erase the tie. In these challenging situations, utilize BananaCut's <strong>Exclusion Brush</strong>. This tool allows you to manually paint over the tie, explicitly telling the engine to ignore that spatial area during the background removal pass, protecting your subject's details." 
               : "被写体に背景とまったく同じ色が含まれている場合（たとえば、グリーンスクリーンで緑のネクタイを締めているキャラクターなど）、Toleranceを上げると必然的にネクタイが消去されます。こうした困難な状況では、BananaCutの<strong>除外ブラシ</strong>を利用してください。このツールを使用すると、ネクタイを手動で塗りつぶすことができ、背景削除中にその空間領域を無視するようにエンジンに明示的に指示して、被写体の詳細を保護できます。"}
            </p>
          </section>

          <section id="faq" className="space-y-4">
            <h3 className="text-xl font-bold">{lang === 'KR' ? '자주 묻는 질문 (FAQ)' : lang === 'EN' ? 'Frequently Asked Questions (FAQ)' : 'よくある質問（FAQ）'}</h3>
            <div className="space-y-4">
              <div>
                <strong className="block mb-1">{lang === 'KR' ? '비디오가 외부 서버에 업로드되나요?' : lang === 'EN' ? 'Does this upload my video to a server?' : '動画はサーバーにアップロードされますか？'}</strong>
                <p className="opacity-80">{lang === 'KR' ? '아니요. 프레임 추출, 크로마키 작업, 정리 및 내보내기 전체 프로세스는 최신 웹 기술(WebAssembly 및 Canvas)을 사용하여 100% 사용자의 브라우저에서 직접 실행됩니다. 사용자의 파일은 로컬 공간안에서 완벽히 비공개로 유지됩니다.' : lang === 'EN' ? 'No. The entire process of frame extraction, chroma keying, cleanup, and exporting is executed directly in your browser using modern web technologies (like WebAssembly and Canvas). Your files are secure and private.' : 'いいえ。フレーム抽出、クロマキー、クリーンアップ、エクスポートのすべてのプロセスは、最新のWebテクノロジー（WebAssemblyやCanvasなど）を使用してブラウザで直接実行されます。ファイルは安全でプライベートです。'}</p>
              </div>
              
              <div>
                <strong className="block mb-1">{lang === 'KR' ? '비디오 길이는 얼마나 길 수 있나요?' : lang === 'EN' ? 'How long can the video be?' : '動画の長さはどのくらいまでですか？'}</strong>
                <p className="opacity-80">{lang === 'KR' ? '빠른 편집을 위해 모든 압축 해제된 프레임이 브라우저 메모리(RAM)에 보관되므로 시스템은 장치의 사용 가능한 메모리에 의해 제한을 받습니다. 10~15초 미만의 짧은 클립, 루프 애니메이션에 가장 적합합니다. 너무 긴 영상을 올리면 브라우저의 충돌을 유발할 수 있습니다.' : lang === 'EN' ? 'The system is constrained by your device\'s available memory (RAM) since all uncompressed frames are held in browser memory for rapid editing. Short clips (under 10 seconds), loops, and distinct character actions work best. Longer videos may cause the browser to crash or slow down significantly.' : '高速編集のために解凍されたすべてのフレームがブラウザのメモリに保持されるため、システムはデバイスの利用可能なメモリ（RAM）によって制限されます。短いクリップ（10秒未満）、ループ、および個別のキャラクターアクションが最適に機能します。長い動画は、ブラウザをクラッシュさせたり、大幅に低下させる可能性があります。'}</p>
              </div>

              <div>
                <strong className="block mb-1">{lang === 'KR' ? '내보낸 WebM 비디오 크기가 왜 이렇게 큰가요?' : lang === 'EN' ? 'Why is my exported WebM video large?' : 'エクスポートしたWebM動画のサイズが大きいのはなぜですか？'}</strong>
                <p className="opacity-80">{lang === 'KR' ? '비디오 프레임 전체에 걸쳐 고품질 알파 채널(투명도)을 유지하려면 표준 MP4 파일보다 덜 적극적인 압축이 필요합니다. 파일 크기가 엄격하게 제한되는 환경이라면 Sprite Sheet(스프라이트 시트)로 에셋을 추출할 경우 용량을 엄청나게 아낄 수 있습니다.' : lang === 'EN' ? 'Retaining a high-quality alpha channel (transparency) across video frames requires less aggressive compression than standard MP4 files. If file size is a strict concern, exporting as a Smart Cropped Sprite Sheet often yields lighter total payload sizes for interactive applications.' : '動画フレーム全体にわたって高品質のアルファチャネル（透明度）を保持するには、標準のMP4ファイルよりもアグレッシブではない圧縮が必要です。ファイルサイズが厳格な懸念事項である場合は、スマートクロップされたスプライトシートとしてエクスポートすると、多くの場合、インタラクティブアプリケーションの合計ペイロードサイズが軽くなります。'}</p>
              </div>
            </div>
          </section>

          <section className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
            <h3 className="font-bold mb-4">{lang === 'KR' ? '관련 가이드' : lang === 'EN' ? 'Related Guides' : '関連ガイド'}</h3>
            <div className="flex flex-col gap-3">
              <Link to="/guides/ai-video-to-game-asset" className={`hover:underline font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {lang === 'KR' ? 'AI 생성 비디오를 게임 에셋으로 변환하기' : lang === 'EN' ? 'Turn AI-Generated Videos into Game Assets' : 'AI生成動画をゲームアセットに変換'}
              </Link>
              <Link to="/guides/clean-alpha-edges" className={`hover:underline font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {lang === 'KR' ? '배경 제거 후 거친 가장자리 선 정리 방법' : lang === 'EN' ? 'How to Clean Rough Edges After Background Removal' : '背景削除後の荒いエッジをきれいにする方法'}
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
