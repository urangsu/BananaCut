import { useEffect } from 'react';
import { useConsent } from '../ConsentContext';

export function useAdSense() {
  const { hasConsentValue } = useConsent();
  const hasAdConsent = hasConsentValue('ad_storage') && hasConsentValue('ad_personalization');

  useEffect(() => {
    if (!hasAdConsent) {
      // If consent is not granted, ensure any existing AdSense script is cleaned up
      const existing = document.querySelector(`script[src*="adsbygoogle.js"]`);
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
      return;
    }

    const src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6406237368816995";
    
    // Check if script already exists
    let script = document.querySelector(`script[src*="adsbygoogle.js"]`) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
    
    return () => {
      // Remove from head when leaving an allowed page to ensure 0 ads elements in forbidden pages
      const existing = document.querySelector(`script[src*="adsbygoogle.js"]`);
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
    };
  }, [hasAdConsent]);
}
