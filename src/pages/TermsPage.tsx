import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { FileText } from 'lucide-react';
import { SEO } from '../components/SEO';

export default function TermsPage() {
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className={`max-w-4xl mx-auto p-6 md:p-12 min-h-[calc(100vh-80px)] ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <SEO 
        title="Terms of Use | BananaCut"
        description="Read the terms for using BananaCut, including user media ownership, service limits, and third-party links."
        canonical="https://www.bananacut.art/terms"
      />
      <div className="flex items-center gap-3 mb-8 border-b pb-6 border-gray-200 dark:border-white/10">
        <FileText className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <h1 className="text-3xl font-semibold tracking-tight">
          {lang === 'KR' ? '이용약관 (Terms of Service)' : lang === 'EN' ? 'Terms of Service' : '利用規約'}
        </h1>
      </div>

      <div className={`space-y-8 text-base leading-relaxed p-6 md:p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        {lang === 'KR' && (
          <div className="space-y-8">
            <section>
              <h2 className="font-bold text-xl mb-4">1. 저작권 및 미디어 소유권</h2>
              <p className="opacity-80">
                사용자는 본 서비스를 통해 처리하는 모든 콘텐츠 및 미디어 파일에 대한 소유권 및 정당한 권리를 보유합니다. 
                BananaCut은 사용자의 미디어 파일에 대해 어떠한 소유권도 주장하지 않습니다. 
                업로드 되거나 처리된 파일에 대한 모든 책임은 전적으로 사용자에게 있습니다.
              </p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-4">2. 서비스 제공</h2>
              <p className="opacity-80">본 서비스는 '있는 그대로(As-Is)' 제공되며, 무상 서비스 특성상 예고 없이 기능이 변경되거나 중단될 수 있습니다.</p>
            </section>

            <section>
              <h2 className="font-bold text-xl mb-4">3. 제3자 링크</h2>
              <p className="opacity-80">본 서비스에는 제3자 웹사이트나 서비스로 연결되는 링크가 포함될 수 있습니다. 제3자 링크 이용 시 해당 사이트의 자체 이용약관이 적용됩니다.</p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-4">4. 금지 행위</h2>
              <p className="opacity-80">서비스의 정상적인 운영을 방해하는 자동화된 접근, 스크래핑, 또는 시스템 부하 유발 행위를 금지합니다.</p>
            </section>
          </div>
        )}
        
        {lang === 'EN' && (
          <div className="space-y-8">
            <section>
              <h2 className="font-bold text-xl mb-4">1. Copyright & Media Ownership</h2>
              <p className="opacity-80">
                You retain complete ownership and all rights to any media files and content you process using this service. 
                BananaCut does not claim ownership over any of your user media. 
                You bear full and sole responsibility for ensuring you have the necessary rights to any uploaded or processed files.
              </p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-4">2. Service Provision</h2>
              <p className="opacity-80">This service is provided 'As-Is.' As a free service, features may be changed or discontinued without prior notice.</p>
            </section>

            <section>
              <h2 className="font-bold text-xl mb-4">3. Third-party Links</h2>
              <p className="opacity-80">Our service may contain links to third-party web sites or services. Third-party links may have their own terms of service.</p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-4">4. Prohibited Acts</h2>
              <p className="opacity-80">Automated access, scraping, or any activity that causes abnormal system load is strictly prohibited.</p>
            </section>
          </div>
        )}
        
        {lang === 'JP' && (
          <div className="space-y-8">
            <section>
              <h2 className="font-bold text-xl mb-4">1. 著作権及びメディア所持権</h2>
              <p className="opacity-80">
                ユーザーは、本サービスを通じて処理したすべてのコンテンツおよびメディアファイルに対する所有権および正当な権利を保有します。
                BananaCutは、ユーザーのメディアに対するいかなる所有権も主張しません。
                アップロードまたは処理されたファイルに関するすべての責任は、全面的にユーザーの皆様にあります。
              </p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-4">2. サービスの提供</h2>
              <p className="opacity-80">本サービスは「現状のまま(As-Is)」提供されます。無料サービスの特性上、予告なく機能が変更または中断される場合があります。</p>
            </section>

            <section>
              <h2 className="font-bold text-xl mb-4">3. 第三者のリンク</h2>
              <p className="opacity-80">本サービスには、第三者のウェブサイトまたはサービスへのリンクが含まれる場合があります。それらのリンクを利用する際は、該当サイト独自の利用規約が適用されます。</p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-4">4. 禁止事項</h2>
              <p className="opacity-80">サービスの正常な運営を妨げる自動アクセス、スクレイピング、またはシステム負荷を誘発する行為を禁止します。</p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
