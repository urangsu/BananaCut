import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { Shield } from 'lucide-react';
import { SEO } from '../components/SEO';

export default function PrivacyPage() {
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className={`h-full min-h-0 overflow-y-auto w-full max-w-4xl mx-auto p-6 md:p-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <SEO 
        title="Privacy Policy | BananaCut"
        description="Learn how BananaCut handles browser-side media processing, cookies, Google AdSense, Analytics, and third-party services."
        canonical="https://www.bananacut.art/privacy"
      />
      
      <div className="flex items-center gap-3 mb-8 border-b pb-6 border-gray-200 dark:border-white/10">
        <Shield className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <h1 className="text-3xl font-semibold tracking-tight">
          {lang === 'KR' ? '개인정보 처리방침 (Privacy Policy)' : lang === 'EN' ? 'Privacy Policy' : '個人情報保護方針 (Privacy Policy)'}
        </h1>
      </div>

      <div className={`space-y-8 text-base leading-relaxed p-6 md:p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        
        {/* TOP METADATA */}
        <div className="border-b pb-4 border-gray-200 dark:border-white/10 text-sm opacity-80 space-y-1">
          {lang === 'KR' ? (
            <>
              <div><strong>시행일:</strong> 2026년 7월 21일</div>
              <div><strong>최종 수정일:</strong> 2026년 7월 21일</div>
              <div><strong>문의:</strong> <a href="mailto:hello@bananacut.art" className="underline hover:text-blue-500">hello@bananacut.art</a></div>
            </>
          ) : lang === 'EN' ? (
            <>
              <div><strong>Effective date:</strong> July 21, 2026</div>
              <div><strong>Last updated:</strong> July 21, 2026</div>
              <div><strong>Contact:</strong> <a href="mailto:hello@bananacut.art" className="underline hover:text-blue-500">hello@bananacut.art</a></div>
            </>
          ) : (
            <>
              <div><strong>施行日：</strong> 2026年7月21日</div>
              <div><strong>最終更新日：</strong> 2026年7月21日</div>
              <div><strong>お問い合わせ：</strong> <a href="mailto:hello@bananacut.art" className="underline hover:text-blue-500">hello@bananacut.art</a></div>
            </>
          )}
        </div>

        {lang === 'KR' && (
          <div className="space-y-8">
            <section>
              <h2 className="font-bold text-xl mb-3 text-blue-500 dark:text-blue-400">1. 미디어 데이터 처리 (Media Data Processing)</h2>
              <p className="opacity-80">
                BananaCut은 이미지와 비디오의 편집 처리를 사용자의 브라우저 안에서 완벽하게 수행합니다.
                사용자의 원본 미디어 파일과 편집 결과물은 BananaCut 서버에 업로드하거나 절대 저장하지 않습니다.
                단, 분석, 광고, 피드백 폼, 후원 및 외부 링크 등 제3자 서비스는 사용자의 선택과 각 서비스의 정책에 따라 별도의 네트워크 통신을 수행할 수 있습니다.
              </p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-3 text-blue-500 dark:text-blue-400">2. 구글 애널리틱스 (Google Analytics)</h2>
              <p className="opacity-80">
                BananaCut은 사용자가 동의한 경우에만 서비스 이용 통계와 사용성 개선을 위해 Google Analytics를 사용할 수 있습니다.
                분석 동의 여부는 전적으로 사용자의 선택 사항이며, 동의를 거부하더라도 BananaCut의 핵심 미디어 편집 기능은 아무런 제한 없이 무료로 사용하실 수 있습니다.
                사용자의 동의 여부 상태는 브라우저의 로컬 저장소(localStorage)에 안전하게 기록되며, 하단의 ‘분석 및 개인정보 설정’ 메뉴를 통해 언제든지 자유롭게 설정을 변경하고 관리할 수 있습니다.
                구글 애널리틱스로는 사용자의 원본 미디어나 프레임 바이너리 등의 데이터를 절대 전송하지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-xl mb-3 text-blue-500 dark:text-blue-400">3. 구글 애드센스 (Google AdSense) 및 광고 설정</h2>
              <p className="opacity-80">
                BananaCut은 지속적인 사이트 운영을 지원하기 위해 Google AdSense 사이트 소유권 확인 메타태그 기능을 사용할 수 있습니다.
                향후 광고 서비스가 활성화되는 경우, Google 및 제3자 공급업체는 광고 제공, 광고 성과 측정 및 부정행위 방지를 위해 쿠키(Cookie) 또는 유사 기술을 사용할 수 있습니다.
                EEA, 영국, 스위스 등 관련 규정이 적용되는 지역에서의 광고 동의 관리는 Google Privacy & messaging 시스템 또는 Google 인증 동의 관리 플랫폼(CMP)을 통해 별도로 취득 및 관리될 수 있습니다.
                사용자는 <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">Google 광고 설정</a> 또는 브라우저 설정을 방문하여 제3자 공급업체의 맞춤설정 광고 및 쿠키 사용을 관리하거나 거부할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-xl mb-3 text-blue-500 dark:text-blue-400">4. Google Privacy & messaging 규정 준수</h2>
              <p className="opacity-80">
                관련 법령이 적용되는 지역에서는 Google Privacy & messaging 시스템을 통해 광고 및 관련 쿠키 동의를 수집하기 위한 공식 선택 화면이 제공될 수 있습니다.
                구글의 공식 광고 동의 화면과 BananaCut 내부의 분석 설정은 서로 완전히 독립된 기능입니다.
                BananaCut 자체 분석 설정창은 Google의 공식 인증 CMP(동의 관리 플랫폼)를 대체하지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-xl mb-3 text-blue-500 dark:text-blue-400">5. 제3자 서비스 (Third-Party Services)</h2>
              <p className="opacity-80">
                BananaCut은 서비스 품질 향상을 위해 다음 제3자 서비스를 연동하거나 링크 형태로 지원할 수 있습니다. 각 서비스 방문 시 해당 서비스 제공자의 독자적인 개인정보 처리방침이 적용됩니다.
              </p>
              <ul className="list-disc pl-6 mt-2 opacity-80 space-y-1">
                <li><strong>Google Analytics:</strong> 사용자 통계 분석</li>
                <li><strong>Google AdSense:</strong> 사이트 소유권 확인 및 향후 광고 연동</li>
                <li><strong>Google Privacy & messaging:</strong> 광고 동의 관리 및 규정 제어</li>
                <li><strong>Tally 피드백 폼:</strong> 사용성 설문 조사 및 제안 의견 수렴</li>
                <li><strong>후원 및 외부 링크:</strong> 개발 후원 및 참고 웹사이트 연결</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-xl mb-3 text-blue-500 dark:text-blue-400">6. 사용자 동의 및 선택 관리 방법 (Preference Adjustment)</h2>
              <p className="opacity-80">
                사용자는 언제든지 다음 수단을 통해 개인정보 수집 및 쿠키 설정 상태를 원클릭으로 취소하거나 조정할 수 있습니다.
              </p>
              <ul className="list-disc pl-6 mt-2 opacity-80 space-y-1">
                <li>BananaCut 하단 바의 ‘분석 및 개인정보 설정’ 메뉴를 통한 애널리틱스 동의 토글</li>
                <li>구글 제공 공식 <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">Google 광고 설정 페이지</a> 방문</li>
                <li>구글 AdSense 광고 게재 시 노출되는 개인정보 메시지의 ‘Manage options’ 선택창</li>
                <li>사용자 브라우저 설정에서의 쿠키 차단 및 사이트 데이터 수동 초기화</li>
              </ul>
            </section>
          </div>
        )}
        
        {lang === 'EN' && (
          <div className="space-y-8">
            <section>
              <h2 className="font-bold text-xl mb-3 text-blue-500 dark:text-blue-400">1. Media Data Processing</h2>
              <p className="opacity-80">
                BananaCut processes images and videos entirely inside your web browser. 
                Your original media files and editing outputs are never uploaded to or stored on BananaCut servers. 
                However, third-party services such as analytics, ads, feedback forms, sponsorships, and external links may perform separate network communications based on your choices and their respective policies.
              </p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-3 text-blue-500 dark:text-blue-400">2. Google Analytics</h2>
              <p className="opacity-80">
                BananaCut may use Google Analytics to gather service usage statistics and improve usability, only if you provide your consent.
                Analytics consent is strictly optional, and you can still use the core video editing tools of BananaCut for free even if you decline.
                Your consent state is stored securely in your browser's local storage (localStorage) and can be modified or withdrawn at any time via the "Analytics & Privacy Settings" link at the bottom of our page.
                We never transmit your raw media files or editing frames to Google Analytics.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-xl mb-3 text-blue-500 dark:text-blue-400">3. Google AdSense & Ad Settings</h2>
              <p className="opacity-80">
                BananaCut may use Google AdSense site verification features to support continued site operations.
                If advertising services are enabled in the future, Google and third-party vendors may use cookies or similar technologies to serve advertisements, measure performance, and prevent fraud.
                Advertising consent management in applicable areas (such as the EEA, UK, and Switzerland) will be collected and handled via Google Privacy & messaging or a Google-certified Consent Management Platform (CMP).
                Users can manage or opt out of personalized advertisements and cookie usage by visiting <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">Google Ads Settings</a> or managing browser cookies.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-xl mb-3 text-blue-500 dark:text-blue-400">4. Google Privacy & messaging Compliance</h2>
              <p className="opacity-80">
                In regions where relevant legal regulations apply, an official consent screen may be presented via Google Privacy & messaging to collect choices regarding advertisements and related cookies.
                Google's official advertisement consent screen and BananaCut's local analytics preferences are completely separate.
                BananaCut's local analytics settings modal does not replace or serve as a Google-certified Consent Management Platform (CMP).
              </p>
            </section>

            <section>
              <h2 className="font-bold text-xl mb-3 text-blue-500 dark:text-blue-400">5. Third-Party Services</h2>
              <p className="opacity-80">
                BananaCut may integrate or link to the following third-party services to enhance usability. When visiting these services, their own respective privacy policies apply:
              </p>
              <ul className="list-disc pl-6 mt-2 opacity-80 space-y-1">
                <li><strong>Google Analytics:</strong> Usage statistics and behavioral analysis</li>
                <li><strong>Google AdSense:</strong> Site ownership verification and future advertising</li>
                <li><strong>Google Privacy & messaging:</strong> Consent management and regulation control</li>
                <li><strong>Tally Forms:</strong> User feedback and survey forms</li>
                <li><strong>Sponsorships & External Links:</strong> Donations and references</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-xl mb-3 text-blue-500 dark:text-blue-400">6. User Consent & Preference Adjustment</h2>
              <p className="opacity-80">
                You can withdraw or adjust your privacy and cookie choices at any time through the following mechanisms:
              </p>
              <ul className="list-disc pl-6 mt-2 opacity-80 space-y-1">
                <li>Toggling the Analytics preference in the "Analytics & Privacy Settings" link at the bottom bar</li>
                <li>Visiting the official <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">Google Ads Settings Page</a></li>
                <li>Clicking "Manage options" inside Google's privacy consent messages when ads are served</li>
                <li>Manually clearing cookies and site data within your web browser settings</li>
              </ul>
            </section>
          </div>
        )}
        
        {lang === 'JP' && (
          <div className="space-y-8">
            <section>
              <h2 className="font-bold text-xl mb-3 text-blue-500 dark:text-blue-400">1. メディアデータ処理</h2>
              <p className="opacity-80">
                BananaCutは、画像および動画の編集処理を完全にユーザーのウェブブラウザ上で行います。
                ユーザーの元のメディアファイルや編集した結果がBananaCutのサーバーに送信、保存されることは一切ありません。
                ただし、分析、広告、フィードバックフォーム、スポンサーシップ、外部リンクなどの第三者サービスは、ユーザーの選択や各ポリシーに基づき、別途ネットワーク通信を行う場合があります。
              </p>
            </section>
            
            <section>
              <h2 className="font-bold text-xl mb-3 text-blue-500 dark:text-blue-400">2. Google アナリティクス</h2>
              <p className="opacity-80">
                BananaCutは、お客様が同意された場合に限り、サービス統計収集や改善のためにGoogleアナリティクスを使用することがあります。
                アナリティクスへの同意は完全に任意であり、同意を拒否した場合でもBananaCutのコアな画像・動画編集機能は完全に無制限、かつ無料でご利用いただけます。
                同意ステータスはブラウザのローカルストレージ(localStorage)に安全に記録され、フッターにある「分析および個人情報設定」からいつでも自由に変更できます。
                元のメディアデータや画像フレームがGoogleアナリティクスに送信されることは一切ありません。
              </p>
            </section>

            <section>
              <h2 className="font-bold text-xl mb-3 text-blue-500 dark:text-blue-400">3. Google アドセンスおよび広告設定</h2>
              <p className="opacity-80">
                BananaCutは、サービス運営をサポートするためにGoogle AdSenseサイト所有権確認メタタグ機能を使用することがあります。
                将来的に広告サービスが有効になった場合、Googleおよび第三者配信事業者は、広告配信、効果測定、不正防止のためにCookieや類似の技術を使用する場合があります。
                EEA、英国、スイスなどの規制対象地域での広告同意は、Google Privacy & messagingシステムまたはGoogle認定の同意管理プラットフォーム(CMP)を通じて収集および管理されます。
                ユーザーは、<a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">Google 広告設定</a>、またはブラウザのCookie設定から、パーソナライズ広告とCookieの使用を制御またはオプトアウトできます。
              </p>
            </section>

            <section>
              <h2 className="font-bold text-xl mb-3 text-blue-500 dark:text-blue-400">4. Google Privacy & messagingの準拠</h2>
              <p className="opacity-80">
                適用可能な法律が導入されている地域では、広告および関連Cookieに対する選択を提供する目的で、Google Privacy & messaging経由の公式同意画面が提供される場合があります。
                Googleの公式広告同意画面と、BananaCutローカルの分析および個人情報設定は、完全に別の機能として独立しています。
                BananaCutローカルの分析設定モーダルは、Google認定のCMP（同意管理プラットフォーム）を代替するものではありません。
              </p>
            </section>

            <section>
              <h2 className="font-bold text-xl mb-3 text-blue-500 dark:text-blue-400">5. 第三者サービス</h2>
              <p className="opacity-80">
                BananaCutはサービスの品質向上のため、以下の第三者サービスを連携、またはリンクとしてサポートすることがあります。該当サービス利用時には、各サービス提供者の個別のプライバシーポリシーが適用されます。
              </p>
              <ul className="list-disc pl-6 mt-2 opacity-80 space-y-1">
                <li><strong>Google Analytics:</strong> 統計分析および利用改善</li>
                <li><strong>Google AdSense:</strong> 所有権の確認および将来的な広告統合</li>
                <li><strong>Google Privacy & messaging:</strong> 同意管理プラットフォームおよび規制適用</li>
                <li><strong>Tally Forms:</strong> フィードバック調査およびユーザー提案フォーム</li>
                <li><strong>スポンサーおよび外部リンク:</strong> 開発支援および参考情報のリンク</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-xl mb-3 text-blue-500 dark:text-blue-400">6. 同意ステータスと選択の変更方法</h2>
              <p className="opacity-80">
                ユーザーは、以下の方法を用いていつでもプライバシーおよびCookieの同意ステータスを即座に変更、または無効化できます。
              </p>
              <ul className="list-disc pl-6 mt-2 opacity-80 space-y-1">
                <li>フッターの「分析および個人情報設定」リンクからローカルアナリティクス同意をオプトアウト</li>
                <li>公式の <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">Google 広告設定ページ</a> へアクセス</li>
                <li>広告表示時に表示されるGoogleプライバシー同意メッセージの「Manage options」を選択</li>
                <li>ご使用ブラウザの設定ページからCookieおよびサイトデータの削除</li>
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
