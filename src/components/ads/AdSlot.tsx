import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useConsent } from '../../ConsentContext';
import { useLanguage } from '../../LanguageContext';
import { useTheme } from '../../ThemeContext';
import { Heart } from 'lucide-react';

interface AdSlotProps {
  slotId: string;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ slotId, className = "" }) => {
  const { consent, hasConsentValue } = useConsent();
  const { lang } = useLanguage();
  const { isDark } = useTheme();
  const location = useLocation();
  const isPushed = useRef(false);

  const allowedRoutes = ['/', '/guides', '/examples', '/about'];
  const isRouteAllowed = allowedRoutes.includes(location.pathname) || location.pathname.startsWith('/guides/');
  const hasAdConsent = hasConsentValue('ad_storage') && hasConsentValue('ad_personalization');

  useEffect(() => {
    if (!isRouteAllowed || !hasAdConsent) {
      return;
    }

    // Load Google AdSense Script
    const src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6406237368816995";
    let script = document.querySelector(`script[src*="adsbygoogle.js"]`) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    // Try to push ad layout
    if (!isPushed.current) {
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        isPushed.current = true;
      } catch (e) {
        console.warn("AdSense push failed or deferred:", e);
      }
    }
  }, [location.pathname, hasAdConsent, isRouteAllowed]);

  // If route is forbidden, never render anything related to ads
  if (!isRouteAllowed) {
    return null;
  }

  // Fallback placeholder when consent is not granted or pending
  if (!hasAdConsent) {
    return (
      <div className={`w-full max-w-4xl mx-auto my-6 p-6 rounded-2xl border text-center transition-all ${
        isDark 
          ? 'bg-purple-950/10 border-purple-900/30 text-purple-200' 
          : 'bg-blue-50/50 border-blue-100 text-blue-900'
      } ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <Heart className="w-6 h-6 text-red-500 animate-pulse" />
          <h4 className="text-sm font-bold">
            {lang === 'KR' 
              ? '달그락 스튜디오(DALGRACSTUDIO)의 창작 활동을 응원해주세요!' 
              : lang === 'JP' 
                ? 'DALGRACSTUDIOのクリエイティブな活動を応援してください！' 
                : 'Support DALGRACSTUDIO\'s Creative Journey!'}
          </h4>
          <p className="text-xs opacity-80 max-w-xl mx-auto">
            {lang === 'KR'
              ? '바나나컷은 창작자분들을 위해 무료로 제공되는 도구입니다. 쿠키 동의를 허용하시거나 후원을 통해 프로젝트 유지에 힘을 보태주세요.'
              : lang === 'JP'
                ? 'BananaCutはクリエイターのために無料で提供されています。クッキー同意を許可するか、サポートを通じてプロジェクトの維持にご協力ください。'
                : 'BananaCut is a free tool provided for creators. Support our project by allowing cookies or making a small contribution.'}
          </p>
          <div className="mt-2 flex gap-3">
            <a
              href="https://toon.at/donate/dalgracstudio"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-[11px] font-bold shadow transition-all"
            >
              🍌 {lang === 'KR' ? '후원하기' : lang === 'JP' ? '支援する' : 'Support Us'}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Consent is granted: Render actual manual ad unit
  return (
    <div className={`w-full overflow-hidden my-6 flex justify-center ${className}`}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px' }}
        data-ad-client="ca-pub-6406237368816995"
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};
