import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useConsent } from "../../ConsentContext";

export function isContentAdRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/guides" ||
    pathname.startsWith("/guides/") ||
    pathname === "/examples" ||
    pathname === "/about"
  );
}

interface ContentAdContextType {
  isScriptLoaded: boolean;
}

const ContentAdContext = createContext<ContentAdContextType>({ isScriptLoaded: false });

export const useContentAd = () => useContext(ContentAdContext);

export const ContentAdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { consent } = useConsent();
  const location = useLocation();
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const isAllowed = isContentAdRoute(location.pathname);
  const shouldLoad = isAllowed && consent.ads;

  useEffect(() => {
    const scriptId = "bananacut-adsense-script";

    if (shouldLoad) {
      const existing = document.getElementById(scriptId) as HTMLScriptElement;
      if (!existing) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6406237368816995";
        script.async = true;
        script.crossOrigin = "anonymous";
        script.onload = () => {
          setIsScriptLoaded(true);
        };
        script.onerror = () => {
          setIsScriptLoaded(false);
        };
        document.head.appendChild(script);
      } else {
        // If script was already there, check if actually loaded
        setIsScriptLoaded(true);
      }
    } else {
      setIsScriptLoaded(false);
      
      // Clean up script by ID
      const script = document.getElementById(scriptId);
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      
      // Remove any other AdSense script tags
      const scripts = document.querySelectorAll('script[src*="adsbygoogle.js"]');
      scripts.forEach((s) => {
        if (s.parentNode) s.parentNode.removeChild(s);
      });

      // Remove legacy script tag if present
      const legacyScript = document.getElementById("adsense-global-script");
      if (legacyScript && legacyScript.parentNode) {
        legacyScript.parentNode.removeChild(legacyScript);
      }

      // If we are on a non-allowed (Studio) route, clean up any remaining ins.adsbygoogle elements to avoid memory leaks or layout interference
      if (!isAllowed) {
        const adSlots = document.querySelectorAll("ins.adsbygoogle");
        adSlots.forEach((slot) => {
          if (slot.parentNode) {
            slot.parentNode.removeChild(slot);
          }
        });
      }
    }
  }, [shouldLoad, isAllowed]);

  return (
    <ContentAdContext.Provider value={{ isScriptLoaded }}>
      {children}
    </ContentAdContext.Provider>
  );
};
