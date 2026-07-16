import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { Info } from 'lucide-react';
import { SEO } from '../components/SEO';
import { AdSlot } from '../components/ads/AdSlot';

export default function AboutPage() {
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  const content = {
    KR: {
      title: "BananaCut을 만든 이유",
      intro: "BananaCut은 개인적인 불편함에서 시작된 개인 프로젝트입니다. 모바일 앱 프로젝트를 위한 리소스를 준비하던 중 시작되었습니다. 배경 제거와 프레임 정리가 너무 반복적이고 불편하여 직접 만들었으며, 저와 같은 문제로 고민하는 다른 개발자와 디자이너분들도 사용하실 수 있도록 공개하게 되었습니다.",
      sect1Title: "BananaCut의 목적",
      sect1Body: "작은 앱이나 인디 게임을 개발하고 UI 프로토타입을 제작할 때, 배경이 제거된 움직이는 에셋이 필요한 경우가 많습니다. 크로마키 녹화를 하거나 AI를 활용해 짧은 모션 클립을 생성하곤 하죠. 문제는 수십 개의 프레임 전체에서 단색 배경을 완벽하게 제거하는 작업이 무척 번거롭다는 점입니다. 전문 비디오 편집 소프트웨어는 무겁고 비싸며, 단순한 스프라이트 시트 하나를 추출하기엔 과도한 기능을 가지고 있습니다. BananaCut은 오직 개발자와 창작자분들이 이 구체적인 문제를 쉽고 빠르게 해결할 수 있도록 돕는 경량화 툴입니다.",
      sect2Title: "브라우저 기반 처리의 강점",
      sect2Body: "기존의 수많은 배경 제거 서비스들은 블랙박스 방식으로 동작합니다. 비디오를 서버로 업로드하고, 대기열에서 기다리고, 크레딧을 결제하며 결과물이 괜찮게 나오기만을 바래야 하죠. BananaCut은 모든 처리를 여러분 브라우저 내부에서 100% 로컬로 진행합니다. 현대적인 WebAssembly 기술과 메모리 내 프레임 처리 기법을 활용하므로 미디어 파일이 컴퓨터 외부로 전송되지 않습니다. 덕분에 즉각적인 피드백이 가능하고, 개인 정보 유출 위험이 없으며, 무거운 서버 대기 시간도 전혀 발생하지 않습니다.",
      sect3Title: "BananaCut이 하지 않는 것",
      sect3Body: "BananaCut은 무거운 동영상 편집기가 아닙니다. 화려한 모션 그래픽을 제작하거나 다중 트랙 오디오를 편집하고, 복잡한 시각 효과를 입히는 등의 작업은 수행하지 않습니다. 오직 알파 채널을 정교하게 정리하고, 프레임 잔상을 수정하여 즉시 사용 가능한 깔끔한 에셋을 내보내는 유틸리티입니다. 영화를 만들어야 한다면 전문적인 편집기를 쓰시고, 여러분의 웹 프로젝트에 넣을 투명한 달리기 캐릭터 에셋이 필요하다면 BananaCut을 이용하세요.",
      sect4Title: "피드백 및 개선 문의",
      sect4Body: "이 도구는 실제 작업 과정에서 마주치는 불편함과 비효율성을 바탕으로 지속적으로 발전하고 있습니다. 버그를 발견하셨거나, 작업 속도를 더 높일 수 있는 인터페이스 아이디어가 있으시거나, 특정 비디오 포맷에서 오류가 발생한다면 언제든 편하게 연락해 주세요."
    },
    EN: {
      title: "Why I Built BananaCut",
      intro: "BananaCut is a personal project born out of frustration. It started while I was preparing assets for an app project. I built it because background removal and frame cleanup were repetitive and inconvenient, then made it available for others with the same workflow problem.",
      sect1Title: "What BananaCut is for",
      sect1Body: "When creating small apps, indie games, or prototyping UI, you often need isolated moving assets. You either record something on a green screen or generate a quick motion clip using AI. The problem is removing that solid background perfectly across dozens of frames. Professional video editing software is heavy, expensive, and overkill for extracting a simple sprite sheet. BananaCut is a lightweight tool specifically for developers and creators to solve this narrow problem quickly.",
      sect2Title: "Why browser-based processing matters",
      sect2Body: "Many background removal services act as black boxes. You upload your video to a server, wait for a queue, pay credits, and hope the result is acceptable. BananaCut runs entirely locally in your browser. Utilizing modern WebAssembly and in-memory frame processing, the media files never leave your computer. This gives you instant feedback, zero privacy risks, and no unnecessary server latency.",
      sect3Title: "What BananaCut does not do",
      sect3Body: "It is not a complex video editor. It does not create advanced motion graphics, handle multi-track audio, or generate complex visual effects. It is a utility for cleaning alpha channels, fixing frame artifacts, and exporting usable assets. If you need to make a movie, use standard software. If you need a transparent running character for your web project, use BananaCut.",
      sect4Title: "Feedback and improvements",
      sect4Body: "This tool is continuously evolving based on what breaks and what feels too slow in real-world workflows. If you encounter bugs, have ideas to make the interface faster, or run into specific video formats that fail to load, please reach out."
    },
    JP: {
      title: "BananaCutを作った理由",
      intro: "BananaCutは、個人的な不便さから始まった個人プロジェクトです。モバイルアプリプロジェクトの素材を準備する過程で開発をスタートしました。背景の削除やフレームのクリーンアップ作業が非常に反復的で面倒だったため、自らツールを制作し、同じ課題を抱える他の開発者やクリエイターの方々にも利用していただけるよう公開しました。",
      sect1Title: "BananaCutの目的",
      sect1Body: "小規模なアプリやインディーズゲームの開発、UIのプロトタイプ作成時には、背景が透過されたアニメーション素材が必要になることがよくあります。グリーンバックで録画したり、AIで短いモーションクリップを作成したりする手法です。しかし、数十枚に及ぶフレームから単一色背景を完璧に取り除く作業は極めて手間がかかります。プロ向けの動画編集ソフトウェアは重く、高価で、単純なスプライトシートを抽出するにはオーバースペックです。BananaCutは、開発者やクリエイターがこの特定の課題を迅速かつ簡単に解決できるよう設計された軽量ユーティリティです。",
      sect2Title: "ブラウザ内処理にこだわる理由",
      sect2Body: "多くの背景削除サービスはブラックボックスとして動作します。動画をサーバーにアップロードし、キューを待ち、料金を支払い、出来栄えが良いことを祈るしかありません。一方、BananaCutは完全にローカルでお使いのブラウザ内のみで処理を行います。最新のWebAssembly技術とインメモリフレーム処理技術を活用することで、メディアファイルがパソコンの外に送信されることはありません。これにより、即座のプレビューフィードバック、確実なプライバシー保護、そして不要なサーバー待ち時間ゼロを実現しています。",
      sect3Title: "BananaCutが提供しないこと",
      sect3Body: "複雑な動画エディタではありません。高度なモーショングラフィックスの制作やマルチトラックの音声処理、複雑な視覚効果（VFX）の合成などは対応していません。あくまでアルファチャンネルをきれいに仕上げ、フレームの不要な部分を修正して、すぐに使えるアセットとして出力するための専用ユーティリティです。映画を制作したい場合は本格的なソフトウェアをお使いください。ウェブプロジェクトで透過背景の走るキャラクターアニメーションが必要なら、BananaCutが最適です。",
      sect4Title: "フィードバックと改善",
      sect4Body: "このツールは、実際のワークフローで直面する非効率的な操作や改善点に基づいて、継続的にアップデートを重ねています。バグを発見した場合、操作をより快適にするアイデアがある場合、特定の動画フォーマットがうまく読み込めない場合など、いつでもお気軽にご連絡ください。"
    }
  };

  const active = content[lang as 'KR' | 'EN' | 'JP'] || content.EN;

  return (
    <div className={`h-full min-h-0 overflow-y-auto w-full max-w-4xl mx-auto p-6 md:p-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <SEO 
        title={`${active.title} | BananaCut`}
        description={active.intro}
        canonical="https://www.bananacut.art/about"
      />
      <div className="flex items-center gap-3 mb-8 border-b pb-6 border-gray-200 dark:border-white/10">
        <Info className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <h1 className="text-3xl font-semibold tracking-tight">
          {active.title}
        </h1>
      </div>

      <div className={`space-y-8 text-base leading-relaxed p-6 md:p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        <p className="opacity-90">
          {active.intro}
        </p>
        
        <div className="space-y-8 mt-8">
          <section>
            <h2 className="text-xl font-bold mb-3">{active.sect1Title}</h2>
            <p className="opacity-80">
              {active.sect1Body}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">{active.sect2Title}</h2>
            <p className="opacity-80">
              {active.sect2Body}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">{active.sect3Title}</h2>
            <p className="opacity-80">
              {active.sect3Body}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">{active.sect4Title}</h2>
            <p className="opacity-80">
              {active.sect4Body}
            </p>
          </section>
        </div>
      </div>

      <AdSlot slotId="8472910483" className="mt-8" />
    </div>
  );
}
