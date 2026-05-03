import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className={`max-w-4xl mx-auto p-6 md:p-12 min-h-[calc(100vh-80px)] ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex items-center gap-3 mb-8 border-b pb-6 border-gray-200 dark:border-white/10">
        <Shield className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <h1 className="text-3xl font-semibold tracking-tight">
          {lang === 'KR' ? '개인정보 처리방침 (Privacy Policy)' : lang === 'EN' ? 'Privacy Policy' : '個人情報処理方針'}
        </h1>
      </div>

      <div className={`space-y-8 text-base leading-relaxed p-6 md:p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        {lang === 'KR' && (
          <div className="space-y-8">
            <section>
              <h2 className="font-bold text-xl mb-4">1. 미디어 파일 처리</h2>
              <p className="opacity-80">원본 이미지/비디오, 추출 프레임, 편집 결과물은 BananaCut 서버로 업로드되거나 저장되지 않습니다.</p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-4">2. 쿠키 및 광고</h2>
              <p className="opacity-80">본 서비스는 Google AdSense를 통한 광고 송출 및 서비스 분석을 위해 쿠키를 사용합니다. 쿠키는 사용자의 브라우저에 저장되는 작은 텍스트 파일로, 맞춤형 광고 제공을 위해 사용될 수 있습니다.</p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-4">3. 제3자 서비스</h2>
              <p className="opacity-80">후원(Ko-fi), 설문(Tally) 등 외부 서비스 이용 시 해당 플랫폼의 개인정보 정책이 적용됩니다.</p>
            </section>
          </div>
        )}
        
        {lang === 'EN' && (
          <div className="space-y-8">
            <section>
              <h2 className="font-bold text-xl mb-4">1. Media File Processing</h2>
              <p className="opacity-80">Original images/videos, extracted frames, and edited results are not uploaded or stored on BananaCut servers.</p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-4">2. Cookies & Ads</h2>
              <p className="opacity-80">We use cookies for Google AdSense to serve ads and analyze service usage. Cookies are small text files stored in your browser to provide personalized advertising experiences.</p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-4">3. Third-party Services</h2>
              <p className="opacity-80">Usage of external platforms like Ko-fi (Support) or Tally (Feedback) is subject to their respective privacy policies.</p>
            </section>
          </div>
        )}
        
        {lang === 'JP' && (
          <div className="space-y-8">
            <section>
              <h2 className="font-bold text-xl mb-4">1. メディアファイル処理</h2>
              <p className="opacity-80">元の画像/ビデオ、抽出されたフレーム、および編集結果がBananaCutサーバーにアップロードされたり保存されたりすることはありません。</p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-4">2. クッキーと広告</h2>
              <p className="opacity-80">Google AdSenseを通じた広告配信およびサービス分析のためにクッキーを使用します。クッキーはカスタマイズされた広告提供のために使用される場合があります。</p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-4">3. 第三者サービス</h2>
              <p className="opacity-80">寄付(Ko-fi)やアンケート(Tally)などの外部サービスを利用する場合、各プラットフォームのポリシーが適用されます。</p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
