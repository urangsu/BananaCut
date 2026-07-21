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

  // If user has already responded and we aren't explicitly requested to show CMP, don't show it
  if (hasPrompted && !showCMP) {
    return null;
  }

  const handleSave = () => {
    saveConsent({
      analytics: localAnalytics
    });
    setIsManaging(false);
    setShowCMP(false);
  };

  const texts = {
    title: {
      KR: '분석 및 개인정보 설정',
      EN: 'Analytics & Privacy Settings',
      JP: '分析・プライバシー設定'
    },
    desc: {
      KR: 'BananaCut은 원본 미디어 파일을 서버에 업로드하거나 저장하지 않습니다.\n선택적 분석 기능은 사용자의 설정에 따라 활성화됩니다.\n광고 관련 동의는 Google의 개인정보 메시지에서 별도로 관리됩니다.',
      EN: 'BananaCut does not upload or store your original media files. Optional analytics functions are enabled based on your consent settings. Advertising-related consent is managed separately via Google\'s privacy message.',
      JP: 'BananaCutは元のメディアファイルをサーバーにアップロードまたは保存しません。\nオプションの分析機能は、ユーザーの同意設定に基づいて有効になります。\n広告関連の同意は、Googleのプライバシーメッセージを介して別途管理されます。'
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
    }
  };

  const t = (key: keyof typeof texts) => texts[key][lang] || texts[key]['EN'];

  return (
    <div data-testid="consent-modal" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all ${
        isDark ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">{t('title')}</h3>
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
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-white/5">
          {!isManaging ? (
            <>
              <button
                data-testid="consent-manage"
                onClick={() => setIsManaging(true)}
                className={`mr-auto px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {t('manageBtn')}
              </button>
              <button
                data-testid="consent-deny-all"
                onClick={denyAll}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  isDark ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100'
                }`}
              >
                {t('denyAllBtn')}
              </button>
              <button
                data-testid="consent-accept-all"
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
                data-testid="consent-save"
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
