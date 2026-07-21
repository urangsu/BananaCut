import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export function isContentAdRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/guides" ||
    pathname.startsWith("/guides/") ||
    pathname === "/examples" ||
    pathname === "/about" ||
    pathname === "/privacy" ||
    pathname === "/terms"
  );
}

interface ContentAdContextType {
  isScriptLoaded: boolean;
}

const ContentAdContext = createContext<ContentAdContextType>({ isScriptLoaded: false });

export const useContentAd = () => useContext(ContentAdContext);

const ADSENSE_SCRIPT_URL = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6406237368816995";
const ADSENSE_SCRIPT_SELECTOR = 'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]';

export const ContentAdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isAdRoute = isContentAdRoute(location.pathname);

    if (!isAdRoute) {
      // Clean up script if present
      const existingScript = document.querySelector(ADSENSE_SCRIPT_SELECTOR);
      if (existingScript) {
        existingScript.parentNode?.removeChild(existingScript);
      }
      setIsScriptLoaded(false);
      return;
    }

    let script = document.querySelector(ADSENSE_SCRIPT_SELECTOR) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.async = true;
      script.src = ADSENSE_SCRIPT_URL;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    if ((window as any).adsbygoogle) {
      setIsScriptLoaded(true);
      return;
    }

    const handleLoad = () => setIsScriptLoaded(true);
    const handleError = () => setIsScriptLoaded(false);

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    if ((window as any).adsbygoogle) {
      setIsScriptLoaded(true);
    }

    return () => {
      if (script) {
        script.removeEventListener("load", handleLoad);
        script.removeEventListener("error", handleError);
      }
    };
  }, [location.pathname]);

  return (
    <ContentAdContext.Provider value={{ isScriptLoaded }}>
      {children}
    </ContentAdContext.Provider>
  );
};

