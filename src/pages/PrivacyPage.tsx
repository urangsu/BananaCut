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
              <h2 className="font-bold text-xl mb-4">2. 쿠키 및 제3자 광고</h2>
              <p className="opacity-80">
                BananaCut은 서비스 운영, 통계 분석, 광고 송출을 위해 쿠키를 사용할 수 있습니다.<br/>
                Google을 포함한 제3자 공급업체는 쿠키를 사용하여 본 웹사이트나 다른 웹사이트에서의 이전 방문 기록을 기반으로 광고를 게재할 수 있습니다.<br/>
                Google은 광고 쿠키를 사용하여 사용자의 웹사이트 방문 기록을 바탕으로 맞춤 광고를 제공할 수 있습니다.<br/>
                사용자는 <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">Google 광고 설정</a>에서 맞춤 광고를 관리할 수 있습니다.<br/>
                해당되는 경우, 다른 제3자 공급업체나 광고 네트워크 또한 쿠키를 사용할 수 있습니다.
              </p>
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
              <h2 className="font-bold text-xl mb-4">2. Cookies and Third-Party Ads</h2>
              <p className="opacity-80">
                BananaCut may use cookies or similar technologies for service operation, analytics, and advertising.<br/>
                Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites.<br/>
                Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to your sites and/or other sites on the Internet.<br/>
                Users may opt out of personalized advertising by visiting <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">Google Ads Settings</a>.<br/>
                If applicable, other third-party vendors or ad networks may also use cookies to serve ads.
              </p>
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
              <h2 className="font-bold text-xl mb-4">2. クッキーと第三者広告</h2>
              <p className="opacity-80">
                BananaCutは、サービスの運営、分析、および広告配信のためにクッキーを使用する場合があります。<br/>
                Googleを含む第三者配信事業者は、ユーザーが過去に本ウェブサイトや他のウェブサイトにアクセスした際の情報に基づいて、クッキーを使用して広告を配信します。<br/>
                Googleが広告クッキーを使用することにより、ユーザーがウェブサイトにアクセスした際の情報に基づいて、Googleやそのパートナーが適切な広告をユーザーに表示できます。<br/>
                ユーザーは、<a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">Google 広告設定</a>にアクセスして、パーソナライズ広告を無効にできます。<br/>
                該当する場合、他の第三者配信事業者や広告ネットワークもクッキーを使用する可能性があります。
              </p>
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
