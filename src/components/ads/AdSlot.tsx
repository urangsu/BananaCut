import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useConsent } from '../../ConsentContext';
import { useContentAd, isContentAdRoute } from './ContentAdProvider';

interface AdSlotProps {
  slotId: string;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ slotId, className = "" }) => {
  const { consent } = useConsent();
  const { isScriptLoaded } = useContentAd();
  const location = useLocation();
  const isPushed = useRef(false);

  // Validate slotId structure
  if (!/^\d+$/.test(slotId)) {
    throw new Error('INVALID_ADSENSE_SLOT_ID');
  }

  const isRouteAllowed = isContentAdRoute(location.pathname);
  const hasAdConsent = consent.ads;

  useEffect(() => {
    if (!isRouteAllowed || !hasAdConsent || !isScriptLoaded) {
      return;
    }

    if (!isPushed.current) {
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        isPushed.current = true;
      } catch (e) {
        console.warn("AdSense push failed or deferred:", e);
      }
    }
  }, [location.pathname, hasAdConsent, isRouteAllowed, isScriptLoaded]);

  // If not allowed or doesn't have consent, return null immediately
  if (!isRouteAllowed || !hasAdConsent) {
    return null;
  }

  return (
    <div className={`w-full overflow-hidden my-6 flex flex-col items-center justify-center ${className}`}>
      <div className="text-center text-[10px] opacity-50 mb-2">
        Advertisement
      </div>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px', width: '100%' }}
        data-ad-client="ca-pub-6406237368816995"
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};
