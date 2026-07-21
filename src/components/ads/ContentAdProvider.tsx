import React, { createContext, useContext, useState, useEffect } from "react";

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

const ADSENSE_SCRIPT_SELECTOR =
  'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]';

export const ContentAdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.querySelector(
      ADSENSE_SCRIPT_SELECTOR
    ) as HTMLScriptElement | null;

    if (!script) {
      setIsScriptLoaded(false);
      return;
    }

    if ((window as any).adsbygoogle) {
      setIsScriptLoaded(true);
      return;
    }

    const handleLoad = () => setIsScriptLoaded(true);
    const handleError = () => setIsScriptLoaded(false);

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    // Initial check in case it loaded between the first check and event listener attachment
    if ((window as any).adsbygoogle) {
      setIsScriptLoaded(true);
    }

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <ContentAdContext.Provider value={{ isScriptLoaded }}>
      {children}
    </ContentAdContext.Provider>
  );
};
