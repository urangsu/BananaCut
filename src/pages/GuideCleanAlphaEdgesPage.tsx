import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { useAdSense } from '../hooks/useAdSense';

export default function GuideCleanAlphaEdgesPage() {
  useAdSense();
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className={`w-full h-full overflow-y-auto ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto p-6 md:p-12 min-h-full">
        <SEO 
          title={lang === 'KR' ? "거친 가장자리(알파 엣지) 및 잔여물 제거 가이드 | BananaCut" : "How to Clean Rough Edges After Background Removal | BananaCut"}
          description={lang === 'KR' ? "배경 제거 후 거친 가장자리, 여백, 색상 유출이 발생하는 이유와 프레임을 보다 효율적으로 다듬는 방법을 알아봅니다." : "Learn why rough edges, gaps, and spill happen after background removal and how to clean frames more efficiently."}
          canonical="https://www.bananacut.art/guides/clean-alpha-edges"
        />
        <div className="mb-8">
          <Link to="/guides" className={`text-sm hover:underline ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {lang === 'KR' ? '← 가이드로 돌아가기' : lang === 'EN' ? '← Back to Guides' : '← ガイドに戻る'}
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8 border-b pb-6 border-gray-200 dark:border-white/10">
          <BookOpen className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <h1 className="text-3xl font-semibold tracking-tight">
            {lang === 'KR' ? '거친 가장자리(알파 엣지) 및 잔여물 안보이게 처리하는 법' : lang === 'EN' ? 'How to Clean Rough Edges After Background Removal' : '背景を削除した後の粗いエッジをきれいにする方法'}
          </h1>
        </div>

        <div className={`space-y-10 text-base leading-relaxed p-6 md:p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <p className="text-lg opacity-90 font-medium">
            {lang === 'KR' ? "배경을 없애는건 전체 공정의 절반일 뿐입니다. 영상을 따내고 나면 가장자리에 거친 픽셀 아티팩트, 녹색 후광(컬러 스필), 혹은 모델의 옷 사이에 뚫려버린 엉뚱한 구멍 등이 눈에 띄곤 합니다. 수백 개의 프레임에 걸쳐 일일이 수동으로 이를 정리하는 건 끔찍한 시간 낭비입니다. 이 가이드에서는 알파 채널 가장자리 문제를 스마트하고 빠르게 해결하는 방법을 집중 조명합니다." 
             : lang === 'EN' ? "Removing the background is only half the battle. Often, doing so leaves behind harsh artifacts, green halos, temporal flickering, or accidental holes in your character's clothing. Cleaning these up manually across hundreds of individual frames is historically a massive time sink. This guide demonstrates how to tackle alpha edge issues efficiently." 
             : "背景の削除は戦いの半分にすぎません。多くの場合、そうすることで、過酷なアーティファクト、緑色のハロー、一時的なちらつき、またはキャラクターの衣服の偶発的な穴が残ります。何百もの個々のフレームにわたってこれらを手動でクリーンアップすることは、歴史的に大規模な時間の無駄です。このガイドでは、アルファエッジの問題に効率的に対処する方法を示します。"}
          </p>

          <nav className={`p-5 rounded-xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
            <h2 className="font-bold text-lg mb-3">
              {lang === 'KR' ? '목차' : lang === 'EN' ? 'Table of Contents' : '目次'}
            </h2>
            <ul className="list-disc pl-5 space-y-2 opacity-80 text-sm hover:[&_a]:underline">
              <li><a href="#why-this-matters">{lang === 'KR' ? '가장자리(Edge) 품질이 에셋 처리에 있어 중요한 이유' : lang === 'EN' ? 'Why Edge Quality Matters' : 'エッジの品質が重要な理由'}</a></li>
              <li><a href="#why-happen">{lang === 'KR' ? '거친 엣지나 빛 번짐 현상은 왜 발생하나요?' : lang === 'EN' ? 'Why Rough Edges and Halos Happen' : '粗いエッジと後光が発生する理由'}</a></li>
              <li><a href="#slow">{lang === 'KR' ? '지우스 브러시로 한 프레임씩 수정하는 방식은 틀렸습니다' : lang === 'EN' ? 'The Problem with Frame-by-Frame Cleanup' : 'フレームごとのクリーンアップの問題'}</a></li>
              <li><a href="#global-tools">{lang === 'KR' ? 'Global Softness (선명도 흐리기 효과) 사용법' : lang === 'EN' ? 'Using Global Softness and Tolerance' : 'グローバルな柔らかさと許容値を使用する'}</a></li>
              <li><a href="#exclusion">{lang === 'KR' ? 'Exclusion Brush (제외 브러시)로 원본 텍스처 보호하기' : lang === 'EN' ? 'Protecting Assets with the Exclusion Brush' : '除外ブラシでアセットを保護する'}</a></li>
              <li><a href="#filling-gaps">{lang === 'KR' ? 'Recover Tool (복구 툴)로 뚫린 구멍 메꾸기' : lang === 'EN' ? 'Filling Core Gaps with the Recover Brush' : '回復ブラシでコアのギャップを埋める'}</a></li>
              <li><a href="#recommended-settings">{lang === 'KR' ? '권장되는 엣지 정리 전략' : lang === 'EN' ? 'Recommended Edge Strategies' : '推奨されるエッジ戦略'}</a></li>
              <li><a href="#common-mistakes">{lang === 'KR' ? '명백하게 피해야할 흔한 실수들' : lang === 'EN' ? 'Common Mistakes to Avoid' : '避けるべきよくある間違い'}</a></li>
              <li><a href="#practical-tips">{lang === 'KR' ? '작업 속도를 높여주는 실전 꿀팁 (단축키 포함)' : lang === 'EN' ? 'Practical Tips for Fast Workflows' : 'スピーディーな作業のための実践的なヒント'}</a></li>
              <li><a href="#faq">{lang === 'KR' ? '자주 묻는 질문 (FAQ)' : lang === 'EN' ? 'Frequently Asked Questions (FAQ)' : 'よくある質問（FAQ）'}</a></li>
            </ul>
          </nav>

          <section id="why-this-matters" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '가장자리(Edge) 품질이 에셋 처리에 있어 중요한 이유' : lang === 'EN' ? 'Why Edge Quality Matters' : 'エッジの品質が重要な理由'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "추출 상태가 엉망인 에셋은 누가 봐도 합성이란 걸 바로 티나게 만듭니다. 지글거리고 계단 현상이 일어난 픽셀 가장자리는 콘텐츠의 몰입감을 부수고 허접한 느낌을 주게 마련이죠. 캐릭터를 웹사이트에 띄우건 엔진 속으로 스프라이트를 이식하건 간에, 알파 채널(투명도 맵)의 엣지가 부드럽고 자연스럽게 처리되어야만 합니다. 깔끔한 엣지 처리가 곧 아마추어와 프로의 에셋을 나누는 핵심 기준입니다." 
               : lang === 'EN' ? "A poorly extracted asset is immediately obvious. Jagged, pixelated borders draw the eye away from the content and ruin the illusion of integration. Whether you are overlaying a character on a complex website background or dropping an enemy sprite into a game engine environment, the alpha channel (the transparency map) needs to feather smoothly to sell the composite. Precision edge cleanup separates amateur assets from professional ones." 
               : "抽出が不十分なアセットはすぐにわかります。ギザギザのピクセル化された境界線は、目線をコンテンツから遠ざけ、統合の幻想を台無しにします。複雑なWebサイトの背景にキャラクターをオーバーレイする場合でも、ゲームエンジン環境に敵のスプライトをドロップする場合でも、合成を販売するには、アルファチャネル（透明度マップ）がスムーズにフェザーする必要があります。精密なエッジのクリーンアップは、アマチュアのアセットとプロのアセットを区別します。"}
            </p>
          </section>

          <section id="why-happen" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '거친 엣지나 빛 번짐 현상은 왜 발생하나요?' : lang === 'EN' ? 'Why Rough Edges and Halos Happen' : '粗いエッジと後光が発生する理由'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? <span><strong>초록색 후광 (Green Spill):</strong> 물리적인 크로마키 스크린 앞에서 촬영할 때 조명이 초록색 장막에 튕겨 부서지면서 그 반사광이 피사체의 머리카락이나 윤곽선을 녹색으로 물들입니다. 소프트웨어가 배경의 순수한 초록색을 지웠다 할지라도, 이 '번진 조명'은 이미 피사체의 고유 픽셀 색상으로 기록되어버렸기에 얇은 녹색 테두리가 남게 되는 것입니다.<br /><br /><strong>AI 컷아웃의 시간적 팝핑:</strong> 생성형 모델들은 60프레임 내내 외곽선을 칼같이 똑같은 모양으로 유지하지 못합니다. 단색 배경이 아닌 이상 조금씩 경계선을 다르게 해석하기 때문에, 실루엣 외곽선이 부글부글 끓는 것처럼 일렁이며 노이즈 조각을 사방에 남기곤 합니다.<br /><br /><strong>의도치 않은 뚫림 현상:</strong> 만약 여러분의 캐릭터가 제거하려는 배경색과 비슷한 색을 보유하고 있다면(예: 흰 배경 앞의 흰색 눈동자, 녹색 넥타이 등), 허용치(Tolerance)를 높일 때 소프트웨어가 그것마저 배경으로 착각해 지워버릴 수 있습니다.</span> 
               : lang === 'EN' ? <span><strong>The Green Spill Halo:</strong> When recording against a physical green screen, light bounces off the backdrop and reflects onto the subject's edges, hair, and clothing. Even if the pure background is mathematically removed, this bright green "spill" remains physically baked into the subject's edge pixels.<br /><br /><strong>Temporal AI Flickering:</strong> Generative AI models rarely hold a perfectly stable silhouette across 60 frames. The outline "boils" and morphs, leaving scattered pixel dust outside the main subject when keying out a supposedly solid background.<br /><br /><strong>Gaps and Missing Parts (Collateral Damage):</strong> If your subject is wearing something that contains the target background color (like a greenish-blue shirt on a green screen, or a white eye on a white background), raising the removal tolerance will accidentally punch holes straight through them, making them semi-transparent in places they shouldn't be.</span> 
               : <span><strong>グリーンスピルハロー：</strong>物理的なグリーンスクリーンに向かって録画する場合、光は背景で跳ね返り、被写体のエッジ、髪、衣服に反射します。純粋な背景が数学的に削除されたとしても、この明るい緑色の「スピル」は物理的に被写体のエッジピクセルに焼き付けられたままです。<br /><br /><strong>一時的なAIのちらつき：</strong>生成的AIモデルは、60フレームにわたって完全に安定したシルエットを保持することはめったにありません。ソリッドな背景をキーアウトするとき、アウトラインは「沸騰」して変形し、メインの被写体の外側に散乱したピクセルダストを残します。<br /><br /><strong>ギャップと欠落パーツ（付随的被害）：</strong>被写体がターゲットの背景色を含むものを着ている場合（グリーンスクリーン上の緑がかった青のシャツや、白い背景の白い目など）、削除許容値を上げると、意図せずにそれらを通り抜けて穴が開き、本来はそうならないはずの場所が半透明になります。</span>}
            </p>
          </section>

          <section id="slow" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '지우스 브러시로 한 프레임씩 수정하는 방식은 틀렸습니다' : lang === 'EN' ? 'The Problem with Frame-by-Frame Cleanup' : 'フレームごとのクリーンアップの問題'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "3초짜리 애니메이션이 90프레임이라고 가정해 봅시다. 1프레임의 가장자리 노이즈를 수작업으로 지우는 데 불과 30초밖에 걸리지 않는다 하더라도, 전체 90프레임을 처리하려면 극도로 소형 에셋 하나에 45분간 클릭질만 해야합니다. 더군다나 마우스로 한 지우개질은 매 프레임마다 모양이 튀기 마련이라, 재생시켜보면 캐릭터 어깨선이 마치 사시나무 떨리듯 심각하게 요동칠 것입니다. 손으로 지우는 방식은 안정성을 결고 담보할 수 없으며, 시간만 낭비합니다." 
               : lang === 'EN' ? "If a 3-second animation has 90 frames, taking just 30 seconds to erase the noise around the edges of a single frame means spending 45 minutes on mind-numbing cleanup for a tiny asset. Furthermore, animation is motion. If you manually erase the edge of an arm on Frame 1, and manually erase it slightly differently on Frame 2, the arm will visually shake and stutter during playback. Manual frame-by-frame cleanup is nearly impossible to keep perfectly stable." 
               : "3秒のアニメーションに90フレームある場合、1つのフレームのエッジの周りのノイズを消去するのにわずか30秒かかるということは、小さなアセットのための退屈なクリーンアップに45分を費やすことを意味します。さらに、アニメーションはモーションです。フレーム1の腕のエッジを手動で消去し、フレーム2で少し異なる手動で消去した場合、腕は再生中に視覚的に揺れ、途切れます。手動のフレームごとのクリーンアップを完全に安定した状態に保つことはほぼ不可能です。"}
            </p>
          </section>

          <section id="global-tools" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? 'Global Softness (선명도 흐리기 효과) 사용법' : lang === 'EN' ? 'Using Global Softness and Tolerance' : 'グローバルな柔らかさと許容値を使用する'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "가장 지능적인 작업 방식은 전역 매개변수(Global Parameter)를 조정하여 육체 노동 자체를 피하는 것입니다:" 
               : lang === 'EN' ? "The key to fast extraction is avoiding manual labor entirely using global parameter adjustments:" 
               : "素早い抽出の鍵は、グローバルなパラメーター調整を使用して肉体労働を完全に避けることです。"}
            </p>
            <ul className="list-disc pl-5 opacity-80 space-y-3">
              <li>{lang === 'KR' ? <strong>Softness (부드러움) 슬라이더:</strong> : lang === 'EN' ? <strong>The Softness Slider:</strong> : <strong>柔らかさ（Softness）スライダー：</strong>} {lang === 'KR' ? '가장자리가 알파-페더링(Alpha-Feather) 되며 살짝 가장자리가 투명으로 깎여들어갑니다. 브러시를 건드리지 않고도 크로마키 윤곽선의 거친 계단 현상이나 초록색 후광을 제거하는 가장 효과적인 방법입니다. 단 10~15% 만 적용해도 마법같은 결과를 보여줍니다.' : lang === 'EN' ? 'Located in the Remove menu, increasing Softness acts as a global alpha-feather. It blurs and gently erodes the harsh outer boundary of the chroma key. This is the single most effective way to eliminate thin green "spill" halos without touching a brush.' : 'RemoveメニューにあるSoftnessを増やすと、グローバルなアルファフェザーとして機能します。クロマキーの過酷な外側の境界をぼかし、優しく浸食します。これは、ブラシに触れることなく薄い緑色の「スピル」ハローを排除する最も効果的な方法です。'}</li>
              <li>{lang === 'KR' ? <strong>Tolerance (허용치) 튜닝:</strong> : lang === 'EN' ? <strong>Tolerance Tuning:</strong> : <strong>許容値（Tolerance）のチューニング：</strong>} {lang === 'KR' ? '허용치를 무작정 높게 놓지 마십시오. 아주 천천히 마우스 휠로 값을 올려가며 타겟 배경이 푹 사라지는 지점을 포착하되 피사체의 원형은 부서지지 않는 정확한 수학적 기준점을 찾아내세요.' : lang === 'EN' ? 'Rather than setting Tolerance to 50% immediately, inch it up slowly. Find the exact mathematical pivot point where the background drops out but the subject remains solid.' : 'すぐに許容値を50%に設定するのではなく、ゆっくりと上げてください。背景が抜け落ちるが被写体がしっかりと残る正確な数学的ピボットポイントを見つけてください。'}</li>
              <li>{lang === 'KR' ? <strong>Enclosed Color (갇힌 색상 지우기) 토글:</strong> : lang === 'EN' ? <strong>Enclosed Color Toggle:</strong> : <strong>囲まれた色（Enclosed Color）の切り替え：</strong>} {lang === 'KR' ? '캐릭터가 팔짱을 끼거나 엉덩이에 손을 얹고 있으면 그 사이 꽉 막힌 공간에는 어두운 그림자가 져 키잉이 제대로 들어가지 않는 경우가 많습니다. 이 버튼을 켜면 피사체로 둘러싸인 구역 안에 갇힌 배경도 시스템이 무자비하게 찾아내어 관통시켜 지워버립니다.' : lang === 'EN' ? 'If your character puts their hands on their hips, the green screen trapped between their arms is usually darker due to shadows. Toggling "Enclosed Color" instructs the system to hunt for background clusters even if they are walled off by the subject.' : 'キャラクターが腰に手を当てると、腕の間に挟まれたグリーンスクリーンは通常、影のために暗くなります。「Enclosed Color」を切り替えると、被写体に囲まれていても、システムが背景のクラスターを探すように指示されます。'}</li>
            </ul>
          </section>

          <section id="exclusion" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? 'Exclusion Brush (제외 브러시)로 원본 텍스처 보호하기' : lang === 'EN' ? 'Protecting Assets with the Exclusion Brush' : '除外ブラシでアセットを保護する'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "배경을 완벽하게 날려버리기 위해 허용치를 한껏 높였더니 캐릭터가 입고 있던 녹색 넥타이까지 구멍이 뻥 뚫려버린다면, 어떻게 할까요? 이때 바로 Exclusion Brush (제외 마스킹 툴)가 나설 차례입니다." 
               : lang === 'EN' ? "If you raise the Tolerance slider high enough to clear the background perfectly, but doing so destroys your character's green tie, you need the <strong>Exclusion Brush</strong>." 
               : "背景を完全に消去するのに十分な高さにToleranceスライダーを上げても、そうすることでキャラクターの緑色のネクタイが破壊される場合は、<strong>除外ブラシ</strong>が必要です。"}
            </p>
            <ul className="list-disc pl-5 mt-2 opacity-80 space-y-2">
              <li>{lang === 'KR' ? '초록색 배경을 지우는 모드로 되어있는 REMOVE 툴 위에서, 보호하고 싶은 넥타이 영역 위를 브러시로 슥슥 칠해주세요.' : lang === 'EN' ? 'Draw a rough mask over the green tie using the brush.' : 'ブラシを使って、緑色のネクタイの上に大まかなマスクを描きます。'}</li>
              <li>{lang === 'KR' ? '여러분이 보라색으로 마스킹한 이 영역은 시스템에 대해 "그 어떤 경우에도 절대 지우지 말 것" 이라는 무적의 면책 권한을 가집니다. Tolerance가 아무리 높아도 이 구역 밑에 있는 픽셀은 결코 투명해지지 않습니다.' : lang === 'EN' ? 'This mask strictly forbids the engine from keying out anything beneath it, no matter what the Tolerance is set to.' : 'このマスクは、Toleranceがどのように設定されていても、その下のものをキーアウトすることをエンジンに厳密に禁止します。'}</li>
              <li>{lang === 'KR' ? '캐릭터가 움직이는 경우, 이 타임라인 키프레임 도구를 사용해 보라색 방어 마스크의 위치를 이동시킬 수도 있습니다.' : lang === 'EN' ? 'You can animate this mask across multiple frames using the timeline tools.' : 'タイムラインツールを使用して、複数のフレームにわたってこのマスクをアニメーション化できます。'}</li>
            </ul>
          </section>

          <section id="filling-gaps" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? 'Recover Tool (복구 툴)로 뚫린 구멍 메꾸기' : lang === 'EN' ? 'Filling Core Gaps with the Recover Brush' : '回復ブラシでコアのギャップを埋める'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "배경 제거(Remove) 과정에서 떨어져 나온 쓰레기 부품이나, 원본 영상 자체에 노이즈 글리치가 포함되어 있어서 어쩔 수 없이 수리로 넘어가야 할 경우 REPAIR(복구 및 수정) 페이지로 이동하십시오. 이곳엔 프레임 단위의 외과 수술적 도구들이 기다리고 있습니다:" 
               : lang === 'EN' ? "If pieces of your character were still removed or if the source video has a glitch, navigate to the <strong>Recover</strong> page. This workspace holds surgical, frame-specific tools:" 
               : "キャラクターの一部がまだ削除されている場合、またはソース動画にグリッチがある場合は、<strong>Recover</strong>ページに移動します。このワークスペースには、外科的でフレーム固有のツールが用意されています。"}
            </p>
            <ul className="list-disc pl-5 mt-2 opacity-80 space-y-2">
              <li>{lang === 'KR' ? '<strong>Lasso(올가미) 도구(단축키: L):</strong> 허공에 둥둥 떠서 거슬리게 하는 노이즈 파편이나 아티팩트를 둥그렇게 원을 그려 영구히 삭제해버리세요.' : lang === 'EN' ? 'Use the <strong>Lasso tool</strong> (shortcut: L) to circle a random artifact floating in the sky and delete it definitively.' : '<strong>なげなわツール</strong>（ショートカット：L）を使用して、空に浮かんでいるランダムなアーティファクトを円で囲み、確実に取り除きます。'}</li>
              <li>{lang === 'KR' ? '<strong>Recover Brush (복구 브러시, 단축키 B):</strong> 이 브러시는 색상을 그리는게 아니라 "알파 채널" 그 자체를 불투명하게 회복시키는 역할을 합니다. 캐릭터 몸통에 반투명하게 뚫린 구멍이 있다면 이걸 칠해서 원본 RGB를 되살려 살을 메꿔넣을 수 있습니다.' : lang === 'EN' ? 'Use the <strong>Recover Brush</strong> (shortcut: B) to paint solid, opaque color directly back into the alpha channel, physically patching holes in the frame locally.' : '<strong>リカバリブラシ</strong>（ショートカット：B）を使用して、ソリッドで不透明な色を直接アルファチャネルにペイントし、フレームの穴に局所的にパッチを物理的に当てます。'}</li>
            </ul>
          </section>

          <section id="recommended-settings" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '권장되는 엣지 정리 전략' : lang === 'EN' ? 'Recommended Edge Strategies' : '推奨されるエッジ戦略'}</h2>
            <ul className="list-disc pl-5 opacity-80 space-y-2">
              <li>{lang === 'KR' ? '<strong>항상 Global을 먼저 잡으세요:</strong> 절대로 시작하자마자 마우스나 펜을 잡고 브러시 칠부터 하지 마세요. 전체 노력의 90%를 피커 색상 선택, Tolerance 수치 타협, 그리고 Softness 적용에 쏟아야 합니다.' : lang === 'EN' ? '<strong>Start Global:</strong> Never pick up the brush first. Spend 90% of your effort tuning the global Color Pick, Tolerance, and Softness.' : '<strong>グローバルから始める:</strong> 最初にブラシを手に取らないでください。グローバルなColor Pick、Tolerance、Softnessのチューニングに労力の90%を費やしてください。'}</li>
              <li>{lang === 'KR' ? '<strong>시간적 연속성을 검토할 것:</strong> 1번 프레임에서 Softness 5%가 너무 완벽해보이더라도 그걸 믿지 말고 30번, 60번 프레임으로 드래그 해보세요. 캐릭터가 그림자 속으로 들어가거나 밝은 빛 아래서 춤추기 시작하면 가장자리가 확 다르게 날아갈 수 있습니다. 타임라인의 양 끝 극단을 꼭 체크하십시오.' : lang === 'EN' ? '<strong>Verify Temporal Stability:</strong> A softness setting of 5% might look great on Frame 1, but scrub to Frame 30. If the subject moves into shadow, the edge boundary might shift. Always check the extremes of your timeline.' : '<strong>一時的な安定性を確認する:</strong> 柔らかさの設定を5%にすると、フレーム1では見栄えがするかもしれませんが、フレーム30にスクラブします。被写体が影の中に移動すると、エッジの境界が変わる可能性があります。常にタイムラインの極端な部分を確認してください。'}</li>
            </ul>
          </section>

          <section id="common-mistakes" className="space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'KR' ? '명백하게 피해야할 흔한 실수들' : lang === 'EN' ? 'Common Mistakes to Avoid' : '避けるべきよくある間違い'}</h2>
            <p className="opacity-80">
              {lang === 'KR' ? "가장 빈번한 실수는 Global 설정으로 끝낼 수 있는 상황에서 쓸데없이 브러시질을 남발하는 것입니다. 만일 여러분이 Exclusion Brush를 프레임 5개 이상 칠하고 앉아있다면 그건 명백히 접근 방식이 잘못된 겁니다. 작업을 중단하고 초기화(Reset) 한 다음, 차라리 Color Picker로 배경의 다른 픽셀 음영을 짚어보거나 Tolerance를 낮춰보세요. 수동 브러시는 도저히 일관적인 수치로 해결 안되는 극단적인 몇몇 글리치 구간을 위해 아껴두어야 합니다." 
               : lang === 'EN' ? "A frequent error is over-using the manual brush tools when global settings could solve the problem. If you find yourself painting masks on more than 5 frames, you should stop, reset the tools, and try color picking a different pixel on the background or adjusting the tolerance. The brush tools should be reserved for isolated glitches, not the primary extraction mechanic." 
               : "よくある間違いは、グローバル設定で問題を解決できるのに、手動ブラシツールを使いすぎることです。5フレーム以上でマスクをペイントしている場合は、停止してツールをリセットし、背景の別のピクセルを色選択するか、許容値を調整してみてください。ブラシツールは、孤立したグリッチのために予約しておくべきであり、主要な抽出メカニズムではありません。"}
            </p>
          </section>

          <hr className={`my-8 ${isDark ? 'border-white/10' : 'border-gray-200'}`} />

          <section id="practical-tips" className="space-y-4">
            <h3 className="text-xl font-bold">{lang === 'KR' ? '작업 속도를 높여주는 실전 꿀팁 (단축키 포함)' : lang === 'EN' ? 'Practical Tips for Fast Workflows' : 'スピーディーな作業のための実践的なヒント'}</h3>
            <p className="opacity-80">
              {lang === 'KR' ? <span>대규모 브러시, 올가미 반복 작업을 위해 <strong>일괄 복제 수정 명령</strong>을 반드시 숙지하세요. 모든 프레임의 우측 상단 가장자리에 똑같은 모양의 데드 픽셀 쓰레기가 걸려 있다면 60번 올가미를 치지 마세요. <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded">Shift + Ctrl</kbd> (Mac의 경우 Cmd) 버튼을 동시에 꾹 누른 상태에서 마우스로 올가미 원을 그리거나 브러시 칠을 놔보세요. 바나나컷이 유저가 행한 단 한 번의 액션을 타임라인의 전체 60프레임 좌표에 동시다발적으로 일괄 복제하여 0.1초만에 투하합니다. 동일한 물리적 구간의 노이즈를 빛처럼 일소할 수 있습니다.</span> 
               : lang === 'EN' ? <span>Use keyboard modifiers for bulk manual edits. If you have a stubborn dead pixel in the exact same spot in the top right corner across all 60 frames, don't erase it 60 times. Hold down <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded">Shift + Ctrl/Cmd</kbd> while using the Lasso or Brush tools. BananaCut will duplicate that identical stroke or erasing action instantly across every single frame in the timeline array.</span> 
               : <span>バルクの手動編集にはキーボード修飾子を使用します。60フレーム全体で右上のまったく同じスポットにしつこいデッドピクセルがある場合は、60回消去しないでください。なげなわまたはブラシツールを使用している間は、<kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded">Shift + Ctrl/Cmd</kbd>を押し続けます。BananaCutは、タイムライン配列のすべての単一フレームで、同一のストロークまたは消去アクションを即座に複製します。</span>}
            </p>
          </section>

          <section id="faq" className="space-y-4">
            <h3 className="text-xl font-bold">{lang === 'KR' ? '자주 묻는 질문 (FAQ)' : lang === 'EN' ? 'Frequently Asked Questions (FAQ)' : 'よくある質問（FAQ）'}</h3>
            <div className="space-y-4">
              <div>
                <strong className="block mb-1">{lang === 'KR' ? 'Softness를 늘렸더니 결과물이 너무 흐릿하고 유령처럼 보입니다.' : lang === 'EN' ? 'Why does Softness make my image look blurry?' : 'Softnessを使用すると画像がぼやけて見えるのはなぜですか？'}</strong>
                <p className="opacity-80">{lang === 'KR' ? 'Softness 렌더링은 이미지 원본 RGB 자체를 블러(Blur) 먹이는게 아니라 오직 "마스크의 경계선(Alpha)"만을 갉아먹듯이 안쪽으로 흐립니다. 만약 30% 이상 과도하게 수치를 높이면 캐릭터 외곽선 방어막이 완전히 무너져 이미지 중심부 픽셀까지 갉아먹혀 투명해지면서 반투명한 유령처럼 보이게 됩니다. 샤프한 결과물을 원한다면 15% 이하를 유지하십시오.' : lang === 'EN' ? 'Softness specifically blurs the alpha mask transition, not the RGB image data. However, if pushed too high (e.g., above 30%), the mask feathering will begin to eat aggressively into the core of your subject, creating a ghostly, semi-transparent fade. Keep it under 15% for sharp assets.' : 'Softnessは、RGB画像データではなく、アルファマスクの移行を具体的にぼかします。ただし、高すぎると（たとえば、30%を超えると）、マスクのフェザリングが被写体のコアに積極的に食い込み始め、半透明の幽霊のようなフェードが作成されます。シャープなアセットの場合は15%未満に保ちます。'}</p>
              </div>
              <div>
                <strong className="block mb-1">{lang === 'KR' ? '이전 브러시 수작업을 실행 취소(Undo) 할 수 있나요?' : lang === 'EN' ? 'Can I undo brush strokes?' : 'ブラシストロークを元に戻すことはできますか？'}</strong>
                <p className="opacity-80">{lang === 'KR' ? '네, 가능합니다. 복구(Recover) 워크스페이스의 타임라인은 프레임별 전용 개별 Undo를 지원합니다. 5번 프레임에서 브러시를 잘못 그렸다 한들 Ctrl+Z를 누르면 5번째 프레임의 작업만 되돌려집니다. 6번째 프레임에 이미 작업해둔 브러시 내역은 안전합니다.' : lang === 'EN' ? 'Yes. The timeline supports local undo/redo stacks. If you make a mistake with the Recover brush on Frame 5, you can step backward without affecting the work you did on Frame 6.' : 'はい。タイムラインは、ローカルの元に戻す/やり直しスタックをサポートしています。フレーム5のRecoverブラシでミスをした場合、フレーム6で行った作業に影響を与えることなく後退できます。'}</p>
              </div>
            </div>
          </section>

          <section className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
            <h3 className="font-bold mb-4">{lang === 'KR' ? '관련 가이드' : lang === 'EN' ? 'Related Guides' : '関連ガイド'}</h3>
            <div className="flex flex-col gap-3">
              <Link to="/guides/remove-background-from-video" className={`hover:underline font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{lang === 'KR' ? '웹 브라우저에서 비디오 배경 깔끔하게 제거하기' : lang === 'EN' ? 'How to Remove Video Backgrounds in the Browser' : 'ブラウザで動画の背景を削除する方法'}</Link>
              <Link to="/guides/sprite-sheet-generator" className={`hover:underline font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{lang === 'KR' ? '스프라이트 시트(Sprite Sheet) 구조의 이해 및 포맷 내보내기' : lang === 'EN' ? 'Exporting as a Sprite Sheet' : 'スプライトシートとしてエクスポートする'}</Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
