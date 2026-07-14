import React, { createContext, useContext, useState, useEffect } from 'react';
import { initGA, setAnalyticsEnabled } from './lib/analytics';

export type ConsentState = {
  analytics: boolean;
  ads: boolean;
};

interface ConsentContextType {
  consent: ConsentState;
  hasPrompted: boolean;
  showCMP: boolean;
  setShowCMP: (val: boolean) => void;
  acceptAll: () => void;
  denyAll: () => void;
  saveConsent: (state: ConsentState) => void;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'bananacut_consent_v1';

function parseStoredConsent(value: string | null): ConsentState {
  if (!value) {
    return { analytics: false, ads: false };
  }

  try {
    const parsed = JSON.parse(value);
    return {
      analytics: parsed?.analytics === true,
      ads: parsed?.ads === true
    };
  } catch {
    return { analytics: false, ads: false };
  }
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = useState<ConsentState>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return parseStoredConsent(stored);
  });

  const [hasPrompted, setHasPrompted] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY) !== null;
  });

  const [showCMP, setShowCMP] = useState(false);

  // Apply consent changes (Consent Mode v2 defaults and updates)
  useEffect(() => {
    // Set Google Consent Mode defaults/updates in window
    const gtags = (window as any).gtag;
    if (gtags) {
      gtags('consent', 'update', {
        ad_storage: consent.ads ? 'granted' : 'denied',
        analytics_storage: consent.analytics ? 'granted' : 'denied',
        ad_user_data: consent.ads ? 'granted' : 'denied',
        ad_personalization: consent.ads ? 'granted' : 'denied',
      });
    }

    setAnalyticsEnabled(consent.analytics);

    if (consent.analytics) {
      // Initialize GA if allowed and not already initialized
      try {
        initGA();
      } catch (e) {
        console.warn('GA Init failed/blocked:', e);
      }
    }
  }, [consent]);

  const acceptAll = () => {
    const newState = { analytics: true, ads: true };
    setConsentState(newState);
    setHasPrompted(true);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
  };

  const denyAll = () => {
    const newState = { analytics: false, ads: false };
    setConsentState(newState);
    setHasPrompted(true);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
  };

  const saveConsent = (customState: ConsentState) => {
    setConsentState(customState);
    setHasPrompted(true);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customState));
  };

  return (
    <ConsentContext.Provider value={{
      consent,
      hasPrompted,
      showCMP,
      setShowCMP,
      acceptAll,
      denyAll,
      saveConsent
    }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) throw new Error('useConsent must be used within ConsentProvider');
  return context;
}
