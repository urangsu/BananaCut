import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { useAdSense } from '../hooks/useAdSense';
import { AdSlot } from '../components/ads/AdSlot';

export default function GuidesIndexPage() {
  useAdSense();
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className={`h-full min-h-0 overflow-y-auto w-full ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto p-6 md:p-12 min-h-full">
        <SEO 
          title="Guides | BananaCut"
          description="Learn how to remove backgrounds, clean frames, and export assets for apps, games, and videos."
          canonical="https://www.bananacut.art/guides"
        />
        <div className="flex items-center gap-3 mb-8 border-b pb-6 border-gray-200 dark:border-white/10">
          <BookOpen className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <h1 className="text-3xl font-semibold tracking-tight">
            {lang === 'KR' ? '가이드 및 튜토리얼' : lang === 'EN' ? 'Guides & Tutorials' : 'ガイドとチュートリアル'}
          </h1>
        </div>

        <p className="text-lg opacity-80 mb-12">
          {lang === 'KR' ? '바나나컷을 활용하여 에셋 제작 워크플로우를 간소화하는 방법을 알아보세요.' : lang === 'EN' ? 'Learn how to streamline your asset creation workflow using BananaCut.' : 'BananaCutを使用してアセット作成ワークフローを合理化する方法を学びます。'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            to="/guides/remove-background-from-video" 
            className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-lg'}`}
          >
            <h2 className="text-xl font-bold mb-3">{lang === 'KR' ? '브라우저에서 비디오 배경 제거하는 방법' : lang === 'EN' ? 'How to Remove Backgrounds from Video in Your Browser' : 'ブラウザで動画の背景を削除する方法'}</h2>
            <p className="opacity-70 text-sm leading-relaxed">
              {lang === 'KR' ? '기존의 비디오 배경 제거가 왜 어려웠는지, 그리고 웹 브라우저에서 배경색을 선택하고 깨끗한 에셋을 추출하는 방법을 알아봅니다.' : lang === 'EN' ? 'Learn why video background removal is traditionally difficult, and how to extract frames, pick a background color, and export clean assets directly in your web browser.' : '動画の背景削除が従来なぜ困難だったのか、そしてブラウザで背景色を選択し、きれいなアセットを抽出する方法を学びます。'}
            </p>
          </Link>

          <Link 
            to="/guides/ai-video-to-game-asset" 
            className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-lg'}`}
          >
            <h2 className="text-xl font-bold mb-3">{lang === 'KR' ? 'AI 생성 비디오를 게임 에셋으로 변환' : lang === 'EN' ? 'Turn AI-Generated Videos into Game Assets' : 'AI生成動画をゲームアセットに変換'}</h2>
            <p className="opacity-70 text-sm leading-relaxed">
              {lang === 'KR' ? '투명도가 없는 AI 생성 클립을 정리하여 게임이나 앱에서 사용할 수 있는 유용한 리소스로 변환하는 방법을 살펴봅니다.' : lang === 'EN' ? 'Generated videos are often messy and lack transparency. Discover how to process clips from AI generators and turn them into usable game and app resources.' : '透明度のないAI生成クリップを整理し、ゲームやアプリで使えるリソースに変換する方法を見てみましょう。'}
            </p>
          </Link>

          <Link 
            to="/guides/sprite-sheet-generator" 
            className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-lg'}`}
          >
            <h2 className="text-xl font-bold mb-3">{lang === 'KR' ? '비디오 프레임으로 스프라이트 시트 만들기' : lang === 'EN' ? 'How to Create a Sprite Sheet from Video Frames' : '動画フレームからスプライトシートを作成する方法'}</h2>
            <p className="opacity-70 text-sm leading-relaxed">
              {lang === 'KR' ? '스프라이트 시트가 무엇인지, 게임에서 왜 필요한지, 그리고 추출된 프레임들을 최적화된 격자 레이아웃(JSON 메타데이터 포함)으로 묶는 방법을 배웁니다.' : lang === 'EN' ? 'Understand what sprite sheets are, why games rely on them, and how to pack your exported frames into an optimized grid layout with accompanying JSON metadata.' : 'スプライトシートとは何か、ゲームでなぜ必要なのか、抽出されたフレームを最適化されたグリッドレイアウトでパックする方法を学びます。'}
            </p>
          </Link>

          <Link 
            to="/guides/clean-alpha-edges" 
            className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-lg'}`}
          >
            <h2 className="text-xl font-bold mb-3">{lang === 'KR' ? '배경 제거 후 거친 테두리 정리 방법' : lang === 'EN' ? 'How to Clean Rough Edges After Background Removal' : '背景削除後の粗いエッジをきれいにする方法'}</h2>
            <p className="opacity-70 text-sm leading-relaxed">
              {lang === 'KR' ? '바나나컷을 사용하여 여러 프레임에 걸친 알파 테두리를 단 몇 초 만에 깔끔하게 정리하는 방법을 알아봅니다.' : lang === 'EN' ? 'Tired of green spill or flickering borders? See how BananaCut helps you clean up messy alpha edges globally across multiple frames in seconds.' : 'BananaCutを使用して、複数のフレームにわたるアルファエッジを数秒できれいに整える方法を学びます。'}
            </p>
          </Link>
        </div>

        <AdSlot slotId="4567890123" className="mt-12" />

      </div>
    </div>
  );
}
