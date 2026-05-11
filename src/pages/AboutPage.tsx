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
          {lang === 'KR' ? 'Why I Built BananaCut' : lang === 'EN' ? 'Why I Built BananaCut' : 'Why I Built BananaCut'}
        </h1>
      </div>

      <div className={`space-y-8 text-base leading-relaxed p-6 md:p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        {lang === 'KR' && (
          <div className="space-y-6">
            <p>
              BananaCut은 앱에 사용할 에셋을 만들던 과정에서 시작한 브라우저 기반 도구입니다.
            </p>
            <p>
              배경 제거와 프레임 정리가 반복적이고 번거로워 직접 만들었고, 같은 문제를 겪는 분들도 사용할 수 있도록 공개했습니다.
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
              BananaCut started while I was preparing assets for an app project.
            </p>
            <p>
              I built it because background removal and frame cleanup were repetitive and inconvenient, then made it available for others with the same workflow problem.
            </p>
            <p>
              All processing happens locally and securely within your browser, meaning your media files are never uploaded to any server. Our goal is to make asset creation faster and easier for fellow creators.
            </p>
          </div>
        )}
        
        {lang === 'JP' && (
          <div className="space-y-6">
            <p>
              BananaCutは、自身のアプリプロジェクト用アセットを準備していた過程で始まりました。
            </p>
            <p>
              背景の除去やフレームのクリーンアップが反復的で面倒だったため自作し、同じワークフローの悩みを抱える他のクリエイターも使えるように公開しました。
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
