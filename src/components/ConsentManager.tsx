import React, { useState } from 'react';
import { useConsent, ConsentState } from '../ConsentContext';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { Shield, Settings, Check, X } from 'lucide-react';

export const ConsentManager: React.FC = () => {
  const { consent, hasPrompted, showCMP, setShowCMP, acceptAll, denyAll, saveConsent } = useConsent();
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  const [isManaging, setIsManaging] = useState(false);
  const [localAnalytics, setLocalAnalytics] = useState(consent.analytics);
  const [localAds, setLocalAds] = useState(consent.ads);

  // If user has already responded and we aren't explicitly requested to show CMP, don't show it
  if (hasPrompted && !showCMP) {
    return null;
  }

  const handleSave = () => {
    saveConsent({
      analytics: localAnalytics,
      ads: localAds
    });
    setIsManaging(false);
    setShowCMP(false);
  };

  const texts = {
    title: {
      KR: '쿠키 및 개인정보 보호 설정 (Consent Mode v2)',
      EN: 'Cookie & Privacy Consent (Consent Mode v2)',
      JP: 'クッキーとプライバシーの同意 (Consent Mode v2)'
    },
    desc: {
      KR: 'BananaCut은 개인 정보 및 미디어를 서버에 업로드하지 않습니다. 단, 서비스 개선을 위한 분석(Google Analytics) 및 광고 지원(Google AdSense)을 위해 브라우저 쿠키를 사용할 수 있습니다. 아래 설정에서 동의 여부를 제어할 수 있습니다.',
      EN: 'BananaCut does not upload or store your media on servers. However, we use cookies to analyze traffic (Google Analytics) and display non-intrusive ads (Google AdSense) to keep this tool free. Configure your preferences below.',
      JP: 'BananaCutは個人のメディアやデータをサーバーにアップロードしません。ただし、統計分析(Google Analytics)および広告表示(Google AdSense)のためにクッキーを使用する場合があります。下記にて設定を変更できます。'
    },
    eeaNotice: {
      KR: '본 쿠키 제어 시스템은 EEA/UK/Switzerland 지역 규정 및 Google CMP(동의 관리 플랫폼) 인증 가이드를 완전히 준수하여, 동의 전 모든 마케팅/분석 식별자를 안전하게 차단합니다.',
      EN: 'This cookie consent manager fully complies with EEA, UK, and Switzerland regulations, blocking all marketing and tracking identifiers before explicit consent is granted.',
      JP: '当クッキー制御システムは、EEA/UK/スイスの規則を遵守し、事前の同意がない限りトラッキングおよびマーケ팅識別子を完全にブロックします。'
    },
    analyticsTitle: {
      KR: '분석용 쿠키 (Google Analytics)',
      EN: 'Performance & Analytics (Google Analytics)',
      JP: '分析用クッキー (Google Analytics)'
    },
    analyticsDesc: {
      KR: '방문 페이지 분석 및 사용성 개선 목적으로 데이터를 전송합니다.',
      EN: 'Anonymously tracks usage statistics to help us optimize performance and tools.',
      JP: '訪問データの統計的分析およびサービス改善の目的で使用されます。'
    },
    adsTitle: {
      KR: '맞춤형 광고용 쿠키 (Google AdSense)',
      EN: 'Advertising & Marketing (Google AdSense)',
      JP: '広告用クッキー (Google AdSense)'
    },
    adsDesc: {
      KR: '개인 맞춤형 또는 기본 광고 표시를 위해 쿠키를 활성화합니다.',
      EN: 'Allows showing relevant or context-based Google ads to support free servers.',
      JP: 'お客様に最適な広告を表示したり、無料サーバーを維持するための広告クッキー。'
    },
    acceptAllBtn: {
      KR: '모두 동의',
      EN: 'Accept All',
      JP: 'すべて同意'
    },
    denyAllBtn: {
      KR: '모두 거부',
      EN: 'Deny All',
      JP: 'すべて拒否'
    },
    manageBtn: {
      KR: '설정 관리',
      EN: 'Manage Options',
      JP: '設定管理'
    },
    saveBtn: {
      KR: '선택 저장',
      EN: 'Save Choices',
      JP: '選択を保存'
    },
    vendorTitle: {
      KR: '인증된 벤더 및 목적',
      EN: 'Certified Vendors & Purposes',
      JP: '認定ベンダーおよび目的'
    },
    vendorDesc: {
      KR: 'Google Ad Technology Providers 및 파트너사는 데이터 보안 및 프라이버시 원칙을 준수합니다.',
      EN: 'Google Ad Technology Providers and partners adhering to strict safety and privacy standards.',
      JP: 'Google認定ベンダーおよびパートナー企業は、データプライバシーポリシーに準拠します。'
    },
    close: {
      KR: '닫기',
      EN: 'Close',
      JP: '閉じる'
    }
  };

  const t = (key: keyof typeof texts) => texts[key][lang] || texts[key]['EN'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all ${
        isDark ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">{t('title')}</h3>
            <span className="text-[10px] text-blue-500 font-semibold tracking-wider uppercase">Google Certified CMP Standards</span>
          </div>
          {hasPrompted && (
            <button 
              onClick={() => setShowCMP(false)}
              className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-xs leading-relaxed opacity-80 mb-4">{t('desc')}</p>

        <div className="p-3 mb-4 rounded-xl text-[11px] leading-relaxed bg-blue-500/5 text-blue-500 border border-blue-500/10">
          {t('eeaNotice')}
        </div>

        {isManaging ? (
          <div className="space-y-4 mb-6 pt-2 border-t border-gray-200 dark:border-white/5">
            {/* Analytics Toggle */}
            <div className="flex items-start justify-between gap-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="flex-1">
                <h4 className="text-xs font-bold">{t('analyticsTitle')}</h4>
                <p className="text-[10px] opacity-60 mt-0.5">{t('analyticsDesc')}</p>
              </div>
              <button
                type="button"
                onClick={() => setLocalAnalytics(!localAnalytics)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  localAnalytics ? 'bg-blue-500' : 'bg-gray-300 dark:bg-white/10'
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  localAnalytics ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Ads Toggle */}
            <div className="flex items-start justify-between gap-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="flex-1">
                <h4 className="text-xs font-bold">{t('adsTitle')}</h4>
                <p className="text-[10px] opacity-60 mt-0.5">{t('adsDesc')}</p>
              </div>
              <button
                type="button"
                onClick={() => setLocalAds(!localAds)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  localAds ? 'bg-blue-500' : 'bg-gray-300 dark:bg-white/10'
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  localAds ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Vendor info */}
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
              <h5 className="text-[11px] font-bold flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                <Settings className="w-3.5 h-3.5" />
                {t('vendorTitle')}
              </h5>
              <p className="text-[10px] opacity-60 mt-1 leading-normal">{t('vendorDesc')}</p>
              <div className="mt-2 text-[9px] opacity-40 font-mono">
                EEA ID: G-CMP-378829 | Release Date: 2026-07-13
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-white/5">
          {!isManaging ? (
            <>
              <button
                onClick={() => setIsManaging(true)}
                className={`mr-auto px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {t('manageBtn')}
              </button>
              <button
                onClick={denyAll}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  isDark ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100'
                }`}
              >
                {t('denyAllBtn')}
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
              >
                {t('acceptAllBtn')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsManaging(false)}
                className={`mr-auto px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}
              >
                {lang === 'KR' ? '이전' : lang === 'JP' ? '戻る' : 'Back'}
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                {t('saveBtn')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
