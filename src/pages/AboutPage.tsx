import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { Info } from 'lucide-react';

export default function AboutPage() {
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className={`max-w-4xl mx-auto p-6 md:p-12 min-h-[calc(100vh-80px)] ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex items-center gap-3 mb-8 border-b pb-6 border-gray-200 dark:border-white/10">
        <Info className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <h1 className="text-3xl font-semibold tracking-tight">
          {lang === 'KR' ? 'About BananaCut' : lang === 'EN' ? 'About BananaCut' : 'About BananaCut'}
        </h1>
      </div>

      <div className={`space-y-8 text-base leading-relaxed p-6 md:p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        {lang === 'KR' && (
          <div className="space-y-6">
            <p>
              BananaCut은 앱에 사용할 에셋을 만들던 과정에서 시작한 브라우저 기반 도구입니다.
            </p>
            <p>
              동영상이나 이미지 시퀀스에서 배경을 제거하고, 남은 프레임의 빈틈이나 가장자리 얼룩을 정리하며, 
              PNG 시퀀스와 스프라이트 시트를 내보내는 과정을 더 빠르고 쉽게 만드는 것을 목표로 합니다.
            </p>
            <p>
              모든 작업은 브라우저 내에서 안전하게 로컬로 처리되며 서버로 파일이 업로드되지 않습니다.
              창작자들이 게임, 앱, 웹사이트, 영상 제작에 필요한 리소스를 쉽고 빠르게 얻을 수 있도록 돕겠습니다.
            </p>
          </div>
        )}
        
        {lang === 'EN' && (
          <div className="space-y-6">
            <p>
              BananaCut was built while preparing assets for an app project.
            </p>
            <p>
              It helps creators remove backgrounds, clean frames, and export reusable assets like PNG sequences, WebM videos, and sprite sheets for apps, games, videos, and websites.
            </p>
            <p>
              All processing happens locally and securely within your browser, meaning your media files are never uploaded to any server. Our goal is to make asset creation faster and easier for fellow creators.
            </p>
          </div>
        )}
        
        {lang === 'JP' && (
          <div className="space-y-6">
            <p>
              BananaCutは、アプリ用のゲームアセットを作成する過程から生まれたブラウザベースのツールです。
            </p>
            <p>
              背景の除去、フレームの整理、アプリ・ゲーム・映像・Webサイト向けのPNGシーケンスやスプライトシートの書き出しを、より簡単かつ迅速にすることを目指しています。
            </p>
            <p>
              すべての処理はブラウザ内で安全に行われ、メディアファイルがサーバーにアップロードされることはありません。クリエイターの皆様が、より手軽に必要なリソースを作成できるよう支援します。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
