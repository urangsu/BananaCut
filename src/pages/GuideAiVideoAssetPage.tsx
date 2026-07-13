import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { useAdSense } from '../hooks/useAdSense';

export default function GuideAiVideoAssetPage() {
  useAdSense();
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className={`w-full h-full overflow-y-auto ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto p-6 md:p-12 min-h-full">
        <SEO 
          title={lang === 'KR' ? "AI 생성 비디오를 게임 에셋으로 변환 | BananaCut" : "Turn AI-Generated Videos into Game Assets | BananaCut"}
          description={lang === 'KR' ? "AI 생성 클립을 정리하고 앱, 게임, 웹사이트 및 비디오를 위한 재사용 가능한 에셋으로 준비하는 방법을 배웁니다." : "Learn how to clean up AI-generated clips and prepare them as reusable assets for apps, games, websites, and videos."}
          canonical="https://www.bananacut.art/guides/ai-video-to-game-asset"
        />
        <div className="mb-8">
          <Link to="/guides" className={`text-sm hover:underline ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {lang === 'KR' ? '← 가이드로 돌아가기' : lang === 'EN' ? '← Back to Guides' : '← ガイドに戻る'}
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8 border-b pb-6 border-gray-200 dark:border-white/10">
          <BookOpen className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <h1 className="text-3xl font-semibold tracking-tight">
            {lang === 'KR' ? 'AI 생성 비디오를 게임 에셋으로 변환하기' : lang === 'EN' ? 'Turn AI-Generated Videos into Game Assets' : 'AI生成動画をゲームアセットに変換'}
          </h1>
        </div>

        <div className={`space-y-10 text-base leading-relaxed p-6 md:p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <p className="text-lg opacity-90 font-medium">
            {lang === 'KR' ? "생성형 AI 툴은 인상적인 컨셉 아트워크와 빠른 애니메이션을 만들어냅니다. 그러나 생성된 비디오 클립을 게임 엔진이나 인터랙티브 웹 앱에 직접 넣는 것은 일반적으로 불가능합니다. 왜냐하면 항상 피사체가 어떤 형태로든 배경과 함께 렌더링되기 때문입니다." 
             : lang === 'EN' ? "Generative AI tools produce impressive concept artwork and rapid animations. However, dropping a generated video clip directly into a game engine or interactive web app is usually impossible because they almost always render with flat, baked-in backgrounds." 
             : "生成AIツールは、印象的なコンセプトアートワークと高速なアニメーションを生成します。ただし、生成された動画クリップをゲームエンジンやインタラクティブWebアプリに直接ドロップすることは通常不可能です。なぜなら、それらはほとんど常に背景が焼き付けられた状態でレンダリングされるからです。"}
          </p>

          <nav className={`p-5 rounded-xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
            <h2 className="font-bold text-lg mb-3">
              {lang === 'KR' ? '목차' : lang === 'EN' ? 'Table of Contents' : '目次'}
            </h2>
            <ul className="list-disc pl-5 space-y-2 opacity-80 text-sm hover:[&_a]:underline">
              <li><a href="#why-this-matters">{lang === 'KR' ? '이것이 에셋 파이프라인에서 중요한 이유' : lang === 'EN' ? 'Why This Matters for Asset Pipelines' : 'これがアセットパイプラインで重要な理由'}</a></li>
              <li><a href="#why-generated">{lang === 'KR' ? '생성형 비디오가 바로 사용될 수 없는 이유' : lang === 'EN' ? 'Why Generated Videos Are Not Ready to Use' : '生成された動画がすぐに使用できない理由'}</a></li>
              <li><a href="#compatible">{lang === 'KR' ? 'AI 비디오와 통용되는 바나나컷의 활용성' : lang === 'EN' ? 'Using BananaCut with AI Videos' : 'AI動画でのBananaCutの使用'}</a></li>
              <li><a href="#fixing">{lang === 'KR' ? '깜박이는 가장자리(Flickering Edge) 문제 수정' : lang === 'EN' ? 'Fixing Flickering Edges and Artifacts' : 'ちらつくエッジとアーティファクトの修正'}</a></li>
              <li><a href="#recommended-settings">{lang === 'KR' ? '투명도 확보를 위한 권장 설정' : lang === 'EN' ? 'Recommended Settings for Cleanup' : '整理のための推奨設定'}</a></li>
              <li><a href="#common-mistakes">{lang === 'KR' ? '피해야 할 일반적인 실수' : lang === 'EN' ? 'Common Mistakes to Avoid' : '避けるべきよくある間違い'}</a></li>
              <li><a href="#export">{lang === 'KR' ? '앱, 게임 및 웹사이트를 위한 내보내기' : lang === 'EN' ? 'Exporting for Apps, Games, and Websites' : 'アプリ、ゲーム、ウェブサイト向けのエクスポート'}</a></li>
              <li><a href="#practical-tips">{lang === 'KR' ? '생성형 AI 프롬프트 작성 실용 팁' : lang === 'EN' ? 'Practical Tips for Prompting' : 'プロンプトの実践的なヒント'}</a></li>
              <li><a href="#faq">{lang === 'KR' ? '자주 묻는 질문 (FAQ)' : lang === 'EN' ? 'Frequently Asked Questions (FAQ)' : 'よくある質問（FAQ）'}</a></li>
            </ul>
          </nav>

          <section id="why-this-matters" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '이것이 에셋 파이프라인에서 중요한 이유' : lang === 'EN' ? 'Why This Matters for Asset Pipelines' : 'これがアセットパイプラインで重要な理由'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "디지털 제품의 프로토타이핑 단계에서는 속도가 생명입니다. 게임 안에서 달리고 있는 적 캐릭터의 임시 애니메이션이나 웹사이트 배경에 움직이는 덩어리가 필요할 때, AI 비디오 생성기가 많이 활용됩니다. 문제는 캐릭터가 배경이라는 환경에 갇혀 있다는 것을 깨달을 때 발생합니다. 피사체를 배경에서 빠르게 분리할 수 있다면, 그냥 쓸모없는 비디오 클립 수준의 AI 결과물을 당장 코드로 적용 가능한 훌륭한 게임 에셋으로 탈바꿈할 수 있습니다." 
               : lang === 'EN' ? "Speed is crucial during the prototyping phase of any digital product. When you need a quick placeholder animation of an enemy running in a game, or an abstract blob moving for a website background, AI video generators are heavily utilized. The friction arises when you realize the character is trapped in an environment. Being able to quickly separate the subject transforms a cool video clip into a functional, reusable code asset." 
               : "デジタル製品のプロトタイピングフェーズでは、スピードが不可欠です。ゲーム内で走る敵のクイックなプレースホルダーアニメーション、またはウェブサイトの背景に移動する抽象的なブロックが必要な場合、AI動画ジェネレーターが頻繁に利用されます。キャラクターが環境に閉じ込められていることに気づいたときに摩擦が生じます。被写体をすばやく分離できるようになると、クールな動画クリップが機能的で再利用可能なコードアセットに変わります。"}
            </p>
          </section>

          <section id="why-generated" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '생성형 비디오가 바로 사용될 수 없는 이유' : lang === 'EN' ? 'Why Generated Videos Are Not Ready to Use' : '生成された動画がすぐに使用できない理由'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "AI 생성기에 \"단색 녹색 배경 위를 걷는 캐릭터\"를 만들어 달라고 프롬프트를 요청할 때, 그 출력물은 결코 수학적으로 평평한 순수 100%의 솔리드(#00FF00) 그린 스크린이 아닙니다. AI 모델은 그라데이션, 개념적인 그림자, 주변 조명 반사, 그리고 무거운 비디오 압축 노이즈를 함께 구워냅니다." 
               : lang === 'EN' ? "When you prompt an AI generator to create a \"character walking on a solid green background,\" the output is never a mathematically flat, solid #00FF00 green screen. The AI models bake in gradients, conceptual shadows, environmental lighting reflections, and heavy video compression noise." 
               : "AIジェネレーターに「無地の緑の背景を歩くキャラクター」を作成するようにプロンプトを表示した場合、出力は数学的に平らで無地の#00FF00グリーンスクリーンになることは決してありません。AIモデルは、グラデーション、概念的な影、環境照明の反射、および重い動画圧縮ノイズを焼き付けます。"}
            </p>
            <p className="opacity-80">
              {lang === 'KR' ? "이러한 불순물 때문에 게임 엔진 내에서 기본 크로마키 필터를 적용하면 종종 실패합니다. AI가 피사체와 배경 사이의 경계를 흐릿하게 만들었기 때문에 캐릭터 주위에 거친 가장자리를 남기거나 실수로 캐릭터 옷의 일부를 투명하게 만들어 버립니다." 
               : lang === 'EN' ? "Because of these impurities, if you apply a basic chroma-key filter inside game engines, it often fails. It leaves harsh ragged edges around the character or accidentally makes portions of the character's clothing transparent because the AI blurred the boundary between the subject and the background." 
               : "これらの不純物のため、ゲームエンジン内で基本的なクロマキーフィルターを適用すると、失敗することがよくあります。AIが被写体と背景の境界をぼやけさせたため、キャラクターの周りに粗くギザギザのエッジが残ったり、キャラクターの服の一部が誤って透明になったりします。"}
            </p>
          </section>

          <section id="compatible" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? 'AI 비디오와 통용되는 바나나컷의 활용성' : lang === 'EN' ? 'Using BananaCut with AI Videos' : 'AI動画でのBananaCutの使用'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "바나나컷은 앱, 게임 또는 웹사이트에서 사용하기 전에 찌꺼기 제거 및 투명화가 필요한 AI 비디오 워크플로우를 완벽하게 서포트합니다. Luma Dream Machine, Kling, Gen-3, Sora 등 어떤 플랫폼을 사용해 비디오 에셋을 생성하든, 바나나컷은 원본 프레임의 손실 없이 완벽한 기능적 중간 단계를 제공합니다." 
               : lang === 'EN' ? "BananaCut can fit into AI video workflows where generated outputs still need cleanup before they are used in apps, games, or websites. Whether you generally produce these assets utilizing platforms like GPT Image, Nano Banana, Seedance, or Veo, BananaCut acts as a functional middle step." 
               : "BananaCutは、生成された出力がアプリ、ゲーム、またはウェブサイトで使用される前にクリーンアップを必要とするAI動画ワークフローに適合できます。GPT Image、Nano Banana、Seedance、またはVeoなどのプラットフォームを使用してこれらのアセットを通常作成するかどうかにかかわらず、BananaCutは機能的な中間ステップとして機能します。"}
            </p>
            <p className="opacity-80">
              {lang === 'KR' ? "생성된 클립을 바나나컷에 끌어다 놓기만 하면 고르지 않은 백그라운드 색의 평균 톤을 찾아 선택하여 전역적으로 제거하고, 코드 기반 환경에서 요구하는 포맷(스프라이트 시트 등)으로 내보낼 준비를 마칠 수 있습니다." 
               : lang === 'EN' ? "By dropping the generated clip into BananaCut, you can pick the average tone of the uneven background and strip it out globally, preparing the clip for the formatting that code-based environments expect." 
               : "生成されたクリップをBananaCutにドラッグアンドドロップするだけで、不均一な背景の平均色調を選択してグローバルに削除し、コードベースの環境で想定される形式でクリップを準備できます。"}
            </p>
          </section>

          <section id="fixing" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '깜박이는 가장자리(Flickering Edge) 문제 수정' : lang === 'EN' ? 'Fixing Flickering Edges and Artifacts' : 'ちらつくエッジとアーティファクトの修正'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "AI 비디오 생성에서 흔히 발생하는 문제는 AI가 매 프레임을 개념적으로 그리기 때문에 캐릭터의 정확한 실루엣이 프레임마다 몇 픽셀씩 유기적으로 이동한다는 것입니다. 인간의 눈으로는 인식하지 못할지 몰라도 투명화 알고리즘이 적용된 가장자리 주변에서는 현저한 깜박임(Flickering)이 발생합니다." 
               : lang === 'EN' ? "A common issue with AI video generation is that it draws each frame conceptually, meaning the exact silhouette of a character might shift organically by a few pixels from frame to frame. This creates noticeable flickering around the extracted edges." 
               : "AI動画生成の一般的な問題は、AIが各フレームを概念的に描画することです。これは、キャラクターの正確なシルエットがフレームごとに数ピクセルずつ有機的に移動する可能性があることを意味します。これにより、抽出されたエッジの周囲に目立つちらつきが生じます。"}
            </p>
            <p className="opacity-80">
              {lang === 'KR' ? "바나나컷은 이를 해결하기 위한 도구들을 제공합니다. Softness(부드러움) 슬라이더는 캐릭터 실루엣 경계를 따라 발생하는 아주 미세한 깜박임을 녹여 없애어 시각적으로 자연스럽게 만듭니다. 또한, AI 생성기가 캐릭터의 어깨에 실수로 배경색과 같은 초록색 패치를 그려 넣었다면, 투명화 전 Exclusion Brush(제외 브러쉬)를 사용하여 화면상 해당 영역을 크로마키 대상에서 보호하거나, 투명화 후 RECOVER(복구) 브러쉬를 사용하여 배경색과 같이 날아가버린 픽셀을 다시 칠해 살려낼 수 있습니다." 
               : lang === 'EN' ? "BananaCut provides tools specifically to address this. The <strong>Softness</strong> algorithm feathers the alpha channel, dissolving the micro-flickering along the silhouette edge so it is less visually disruptive. Additionally, if the AI generator erroneously placed a green patch on the character's shoulder, you can use the <strong>Exclusion Brush</strong> to protect that area or the <strong>Recover Brush</strong> to manually paint it back after the background removal." 
               : "BananaCutは、これに対処するためのツールを提供します。<strong>Softness（柔らかさ）</strong>アルゴリズムはアルファチャネルをぼかし、シルエットエッジに沿ったマイクロフリッカリングを解消して視覚的に自然にします。さらに、AIジェネレーターが誤ってキャラクターの肩に緑色のパッチを配置した場合、<strong>除外ブラシ</strong>を使用してその領域を保護したり、<strong>回復ブラシ</strong>を使用して背景を削除した後に手動でペイントして元に戻すことができます。"}
            </p>
          </section>

          <section id="recommended-settings" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '투명도 확보를 위한 권장 설정' : lang === 'EN' ? 'Recommended Settings for Cleanup' : '整理のための推奨設定'}</h2>
            <ul className="list-disc pl-5 opacity-80 space-y-2">
              <li>{lang === 'KR' ? <strong>높은 Tolerance:</strong> : lang === 'EN' ? <strong>Higher Tolerance:</strong> : <strong>より高い許容誤差：</strong>} {lang === 'KR' ? 'AI가 생성한 배경은 얼핏보면 깨끗해보일지 몰라도 내부적으로 많은 그라디언트를 포함하므로, 조명이 완벽히 제어된 전문적인 그린 스크린보다 약간 더 높은 허용 오차(Tolerance 약 25-35%)를 필요로 합니다.' : lang === 'EN' ? 'AI generated flat backgrounds typically require a slightly higher Tolerance (around 25-35%) than professionally lit green screens to account for the generated gradients.' : 'AIが生成した無地の背景は、生成されたグラデーションを考慮するために、専門的に照明されたグリーンスクリーンよりもわずかに高い上限（約25-35％）を通常必要とします。'}</li>
              <li>{lang === 'KR' ? <strong>충분한 Softness:</strong> : lang === 'EN' ? <strong>Generous Softness:</strong> : <strong>十分な柔らかさ：</strong>} {lang === 'KR' ? '약 10-15%의 부드러움을 사용하여 생성 과정에서 생기는 가장자리의 시간적 깜박임(Temporal Flickering) 현상을 흐리게 하세요.' : lang === 'EN' ? 'Use around 10-15% Softness to blur out the temporal flickering along the generated borders.' : '約10〜15％の柔らかさを使用して、生成された境界に沿った時間的なちらつきをぼかします。'}</li>
              <li>{lang === 'KR' ? <strong>Enclosed Color(내부 빈틈) 옵션 활용:</strong> : lang === 'EN' ? <strong>Use Enclosed Color:</strong> : <strong>Enclosed Colorを使用：</strong>} {lang === 'KR' ? '캐릭터가 엉덩이에 손을 얹어 생기는 팔 사이의 닫힌 공간처럼 배경색이 캐릭터 내부에 갇혀 있는 영역을 타겟팅하려면 \'Enclosed Color\' 체크박스를 선택하세요.' : lang === 'EN' ? 'If your prompt resulted in a character with their hands on their hips, tick the \'Enclosed Color\' box to target the background loops between their arms.' : 'プロンプトの結果、腰に手を当てているキャラクターになった場合は、「Enclosed Color」ボックスをオンにして、腕の間の背景ループをターゲットにします。'}</li>
            </ul>
          </section>

          <section id="common-mistakes" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '피해야 할 일반적인 실수' : lang === 'EN' ? 'Common Mistakes to Avoid' : '避けるべきよくある間違い'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "AI가 생성한 복잡하고 사실적인 배경(예: 혼잡한 거리)에서 캐릭터를 크로마키 도구를 활용해 추출하려는 시도는 사실상 불가능합니다. 항상 초기 AI 생성 프롬프트를 작성할 때 캐릭터(피사체)의 색감과 극명하게 대비되는 단색 배경 색상을 명시적으로 요청해야 합니다." 
               : lang === 'EN' ? "Trying to extract a character from a complex, realistic background (like a crowded street) generated by AI is incredibly difficult and often yields poor results in standard keying tools. Removing a flat color background is significantly easier. Always ensure your initial AI generation prompt explicitly requests a solid, flat background color that contrasts heavily with your subject." 
               : "AIによって生成された複雑でリアルな背景（混雑した通りなど）からキャラクターを抽出しようとすることは非常に困難であり、標準のキーイングツールではしばしば不十分な結果になります。無地の背景を削除する方がはるかに簡単です。常に、最初のAI生成プロンプトで、被写体と大きく対照的な無地の背景色を明示的に要求するようにしてください。"}
            </p>
          </section>

          <section id="export" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '앱, 게임 및 웹사이트를 위한 내보내기' : lang === 'EN' ? 'Exporting for Apps, Games, and Websites' : 'アプリ、ゲーム、ウェブサイト向けのエクスポート'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "AI 클립을 바나나컷에서 투명하게 처리한 후 마지막 단계는 용도에 알맞는 포맷팅입니다. 새 자산을 최적으로 활용하려면:" 
               : lang === 'EN' ? "After processing the AI clip, the final step is formatting. To use your new asset optimally:" 
               : "AIクリップを処理した後、最後のステップはフォーマットです。新しいアセットを最適に使用するには："}
            </p>
            <ul className="list-disc pl-5 opacity-80 space-y-3">
              <li>{lang === 'KR' ? <strong>게임 엔진을 위해 (Unity, Godot, GameMaker):</strong> : lang === 'EN' ? <strong>For Game Engines (Unity, Godot, GameMaker):</strong> : <strong>ゲームエンジン用（Unity、Godot、GameMaker）：</strong>} {lang === 'KR' ? 'Sprite Sheet(스프라이트 시트)로 내보내세요. 엔진은 단일 텍스처를 GPU에 로드해 개별 시퀀스의 모든 프레임을 한 방에 그릴 수 있으며, 이는 고성능 2D 게임 그래픽을 실행하기 위한 업계 표준 방법론입니다.' : lang === 'EN' ? 'Export as a <strong>Sprite Sheet</strong>. The engine can load a single texture into the GPU, which is the standard methodology for running performant 2D game graphics.' : '<strong>スプライトシート</strong>としてエクスポートします。エンジンは単一のテクスチャをGPUにロードできます。これは、パフォーマンスの高い2Dゲームグラフィックスを実行するための標準的な方法論です。'}</li>
              <li>{lang === 'KR' ? <strong>웹 인터페이스를 위해 (React, Vue, plain HTML):</strong> : lang === 'EN' ? <strong>For Web Interfaces (React, Vue, plain HTML):</strong> : <strong>Webインターフェース用（React、Vue、プレーンHTML）：</strong>} {lang === 'KR' ? '그래픽이 사용자와의 상호작용 없는 수동적인 배경 루프인 경우 Transparent Video (.webm) 포맷을 선택하세요. 그리고, 사용자 스크롤 이벤트에 애니메이션 프레임을 연동시키는 등 인터랙티브한 코딩이 필요한 경우엔 무조건 Sprite Sheet 로 내보내야 합니다.' : lang === 'EN' ? 'Export as a Transparent Video (.webm) if the graphic is a passive background loop, or a Sprite Sheet if you need to bind the animation frames to user scroll events.' : 'グラフィックが受動的な背景ループの場合は透明な動画（.webm）としてエクスポートし、アニメーションフレームをユーザースクロールイベントにバインドする必要がある場合はスプライトシートとしてエクスポートします。'}</li>
            </ul>
          </section>

          <hr className={`my-8 ${isDark ? 'border-white/10' : 'border-gray-200'}`} />

          <section id="practical-tips" className="space-y-4">
            <h3 className="text-xl font-bold">{lang === 'KR' ? '생성형 AI 프롬프트 작성 실용 팁' : lang === 'EN' ? 'Practical Tips for Prompting' : 'プロンプトの実践的なヒント'}</h3>
            <p className="opacity-80">
              {lang === 'KR' ? "선택한 생성기에 프롬프트를 작성할 때, 끝에 다음과 같은 문구를 추가하세요:" : lang === 'EN' ? "When writing your prompt in your generator of choice, append phrases like" : "選択したジェネレーターでプロンプトを記述する場合は、次のようなフレーズを追加してください。"} <br/>
              <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded">"on a bright solid green background, 2D flat composition, high contrast"</code>.<br/>
              {lang === 'KR' ? "역동적인 볼류메트릭 조명(Volumetric Lighting)이나 깊은 빛그림자를 표현해달라는 요청 시도는 피해야 합니다. 화려한 결과물이 텍스트 자체에는 나올지 몰라도, 해당 효과가 배경색으로 번져 배경 제거 작업이 극도로 어려워집니다. 빛 반사를 요구하지 마세요." 
               : lang === 'EN' ? "Avoid prompting for volumetric lighting or deep shadows, as those will spill onto your background color and complicate the removal." 
               : "ボリュームライティングや深い影を求めることは避けてください。これらは背景色にこぼれ、削除を複雑にするためです。"}
            </p>
          </section>

          <section id="faq" className="space-y-4">
            <h3 className="text-xl font-bold">{lang === 'KR' ? '자주 묻는 질문 (FAQ)' : lang === 'EN' ? 'Frequently Asked Questions (FAQ)' : 'よくある質問（FAQ）'}</h3>
            <div className="space-y-4">
              <div>
                <strong className="block mb-1">{lang === 'KR' ? '바나나컷이 AI가 그린 여분의 팔이나 다리를 고칠 수 있나요?' : lang === 'EN' ? 'Can BananaCut fix morphing limbs or AI hallucinations?' : 'BananaCutは変形する手足やAIの幻覚を修復できますか？'}</strong>
                <p className="opacity-80">{lang === 'KR' ? '아니요. 바나나컷은 알파 채널(투명도)를 확보하고 가장자리를 정리하는 데 중점을 둡니다. 이는 AI가 창조해버린 여분의 팔다리처럼 구조적인 생성 오류를 수정하거나 해부학적 구조를 다시 그리지 않습니다. 항상 추출을 시도하기 전에 AI 도구 내에서 구조적으로 완벽한 클립을 생성하는 데 집중하세요.' : lang === 'EN' ? 'No. BananaCut focuses on alpha channel transparency and edge cleanup. It does not redraw anatomy or fix structural generation errors like an extra limb. You must generate a structurally sound clip first before attempting to extract it.' : 'いいえ。BananaCutはアルファチャネルの透明度とエッジのクリーンアップに重点を置いています。解剖学を再描画したり、余分な手足などの構造的な生成エラーを修正したりすることはありません。抽出を試みる前に、まず構造的に健全なクリップを生成する必要があります。'}</p>
              </div>
              <div>
                <strong className="block mb-1">{lang === 'KR' ? '고해상도 AI 비디오도 잘 작동하나요?' : lang === 'EN' ? 'Does this support high-resolution AI videos?' : 'これを高解상度のAI動画でサポートしていますか？'}</strong>
                <p className="opacity-80">{lang === 'KR' ? '바나나컷은 브라우저 메모리 안에서 작동합니다. 720p 또는 1080p 클립은 웬만하면 상당히 잘 처리하지만, 매우 높은 해상도의 원본 영상 파일은 브라우저의 메모리 부족을 일으킬 수 있습니다. 필요하다면 바나나컷에 던져 넣기 전 비디오 크기를 줄이는 것도 방법입니다.' : lang === 'EN' ? 'BananaCut operates in your browser memory. While it handles 720p or 1080p clips fairly well, very high-resolution clips or clips exceeding a few hundred frames may cause your browser to run out of memory. Resize the video prior to processing if necessary.' : 'BananaCutはブラウザーのメモリ内で動作します。720pまたは1080pのクリップはかなりうまく処理しますが、非常に高解像度のクリップ、または数百フレームを超えるクリップは、ブラウザーのメモリー不足を引き起こす可能性があります。必要に応じて、処理前にビデオのサイズを変更してください。'}</p>
              </div>
            </div>
          </section>

          <section className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
            <h3 className="font-bold mb-4">{lang === 'KR' ? '관련 가이드' : lang === 'EN' ? 'Related Guides' : '関連ガイド'}</h3>
            <div className="flex flex-col gap-3">
              <Link to="/guides/remove-background-from-video" className={`hover:underline font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{lang === 'KR' ? '브라우저에서 비디오 배경 제거하는 방법' : lang === 'EN' ? 'How to Remove Backgrounds from Video in Your Browser' : 'ブラウザで動画の背景を削除する方法'}</Link>
              <Link to="/guides/sprite-sheet-generator" className={`hover:underline font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{lang === 'KR' ? '비디오 프레임으로 스프라이트 시트 만들기' : lang === 'EN' ? 'How to Create a Sprite Sheet from Video Frames' : '動画フレームからスプライトシートを作成する方法'}</Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
