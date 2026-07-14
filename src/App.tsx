import React, { useEffect } from 'react';
import { Routes, Route, useLocation, BrowserRouter } from 'react-router-dom';
import RemovePage from './pages/RemovePage';
import RecoverPage from './pages/RecoverPage';
import AssetPage from './pages/AssetPage';
import LandingPage from './pages/LandingPage';
import GuidePage from './pages/GuidePage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ExamplesPage from './pages/ExamplesPage';
import GuidesIndexPage from './pages/GuidesIndexPage';
import GuideRemoveBackgroundPage from './pages/GuideRemoveBackgroundPage';
import GuideAiVideoAssetPage from './pages/GuideAiVideoAssetPage';
import GuideSpriteSheetPage from './pages/GuideSpriteSheetPage';
import GuideCleanAlphaEdgesPage from './pages/GuideCleanAlphaEdgesPage';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import { FFmpegProvider } from './FFmpegContext';
import { StudioProvider } from './StudioContext';
import { ConsentProvider } from './ConsentContext';
import { ConsentManager } from './components/ConsentManager';
import { ContentLayout } from './layouts/ContentLayout';
import { StudioLayout } from './layouts/StudioLayout';
import { trackPageView } from './lib/analytics';

function ScrollToTop() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <ConsentProvider>
      <ThemeProvider>
        <LanguageProvider>
          <FFmpegProvider>
            <StudioProvider>
              <BrowserRouter>
                <ScrollToTop />
                <ConsentManager />
                <Routes>
                  <Route path="/" element={<ContentLayout><LandingPage /></ContentLayout>} />
                  <Route path="/remove" element={<StudioLayout><RemovePage /></StudioLayout>} />
                  <Route path="/recover" element={<StudioLayout><RecoverPage /></StudioLayout>} />
                  <Route path="/asset" element={<StudioLayout><AssetPage /></StudioLayout>} />
                  <Route path="/guide" element={<StudioLayout><GuidePage /></StudioLayout>} />
                  <Route path="/guides" element={<ContentLayout><GuidesIndexPage /></ContentLayout>} />
                  <Route path="/guides/remove-background-from-video" element={<ContentLayout><GuideRemoveBackgroundPage /></ContentLayout>} />
                  <Route path="/guides/ai-video-to-game-asset" element={<ContentLayout><GuideAiVideoAssetPage /></ContentLayout>} />
                  <Route path="/guides/sprite-sheet-generator" element={<ContentLayout><GuideSpriteSheetPage /></ContentLayout>} />
                  <Route path="/guides/clean-alpha-edges" element={<ContentLayout><GuideCleanAlphaEdgesPage /></ContentLayout>} />
                  <Route path="/about" element={<ContentLayout><AboutPage /></ContentLayout>} />
                  <Route path="/contact" element={<ContentLayout><ContactPage /></ContentLayout>} />
                  <Route path="/examples" element={<ContentLayout><ExamplesPage /></ContentLayout>} />
                  <Route path="/privacy" element={<ContentLayout><PrivacyPage /></ContentLayout>} />
                  <Route path="/terms" element={<ContentLayout><TermsPage /></ContentLayout>} />
                </Routes>
              </BrowserRouter>
            </StudioProvider>
          </FFmpegProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ConsentProvider>
  );
}

export default App;
