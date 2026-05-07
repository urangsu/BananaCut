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
              <h2 className="font-bold text-xl mb-4">1. 데이터 처리</h2>
              <p className="opacity-80">BananaCut은 이미지 및 비디오 처리를 사용자의 브라우저 내에서 수행합니다.<br/>원본 미디어 파일과 편집 데이터는 BananaCut 서버로 업로드되거나 저장되지 않습니다.</p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-4">2. 쿠키 및 광고</h2>
              <p className="opacity-80">BananaCut은 서비스 운영, 분석, 광고 송출을 위해 쿠키 또는 유사 기술을 사용할 수 있습니다.<br/>광고는 Google AdSense 등 제3자 광고 네트워크를 통해 제공될 수 있습니다.</p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-4">3. 제3자 서비스</h2>
              <p className="opacity-80">후원, 설문, 외부 링크 등 제3자 서비스를 이용하는 경우 해당 서비스의 개인정보 처리방침이 적용됩니다.</p>
            </section>
          </div>
        )}
        
        {lang === 'EN' && (
          <div className="space-y-8">
            <section>
              <h2 className="font-bold text-xl mb-4">1. Data Processing</h2>
              <p className="opacity-80">BananaCut processes images and videos directly in your browser.<br/>Your original media files and editing data are not uploaded to or stored on BananaCut servers.</p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-4">2. Cookies and Ads</h2>
              <p className="opacity-80">BananaCut may use cookies or similar technologies for service operation, analytics, and advertising.<br/>Ads may be served through third-party advertising networks such as Google AdSense.</p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-4">3. Third-party Services</h2>
              <p className="opacity-80">When you use third-party services such as donations, surveys, or external links, their own privacy policies apply.</p>
            </section>
          </div>
        )}
        
        {lang === 'JP' && (
          <div className="space-y-8">
            <section>
              <h2 className="font-bold text-xl mb-4">1. データ処理</h2>
              <p className="opacity-80">BananaCutは、ユーザーのブラウザ内で直接画像と動画を処理します。<br/>元のメディアファイルや編集データがBananaCutサーバーにアップロードまたは保存されることはありません。</p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-4">2. クッキーと広告</h2>
              <p className="opacity-80">BananaCutは、サービスの運営、分析、および広告配信のためにクッキーまたは類似の技術を使用する場合があります。<br/>広告は、Google AdSenseなどの第三者広告ネットワークを通じて提供される場合があります。</p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-4">3. 第三者サービス</h2>
              <p className="opacity-80">寄付、アンケート、外部リンクなどの第三者サービスを利用する場合、それぞれのプラットフォームのプライバシーポリシーが適用されます。</p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
