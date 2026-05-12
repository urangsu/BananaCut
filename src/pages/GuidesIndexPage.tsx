import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export default function GuidesIndexPage() {
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className={`max-w-4xl mx-auto p-6 md:p-12 min-h-[calc(100vh-80px)] ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <SEO 
        title="Guides | BananaCut"
        description="Learn how to remove backgrounds, clean frames, and export assets for apps, games, and videos."
        canonical="https://www.bananacut.art/guides"
      />
      <div className="flex items-center gap-3 mb-8 border-b pb-6 border-gray-200 dark:border-white/10">
        <BookOpen className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <h1 className="text-3xl font-semibold tracking-tight">
          Guides & Tutorials
        </h1>
      </div>

      <p className="text-lg opacity-80 mb-12">
        Learn how to streamline your asset creation workflow using BananaCut.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <Link 
          to="/guides/remove-background-from-video" 
          className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-lg'}`}
        >
          <h2 className="text-xl font-bold mb-3">How to Remove Backgrounds from Video in Your Browser</h2>
          <p className="opacity-70 text-sm leading-relaxed">
            Learn why video background removal is traditionally difficult, and how to extract frames, pick a background color, and export clean assets directly in your web browser.
          </p>
        </Link>

        {/* Card 2 */}
        <Link 
          to="/guides/ai-video-to-game-asset" 
          className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-lg'}`}
        >
          <h2 className="text-xl font-bold mb-3">Turn AI-Generated Videos into Game Assets</h2>
          <p className="opacity-70 text-sm leading-relaxed">
            Generated videos are often messy and lack transparency. Discover how to process clips from AI generators and turn them into usable game and app resources.
          </p>
        </Link>

        {/* Card 3 */}
        <Link 
          to="/guides/sprite-sheet-generator" 
          className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-lg'}`}
        >
          <h2 className="text-xl font-bold mb-3">How to Create a Sprite Sheet from Video Frames</h2>
          <p className="opacity-70 text-sm leading-relaxed">
            Understand what sprite sheets are, why games rely on them, and how to pack your exported frames into an optimized grid layout with accompanying JSON metadata.
          </p>
        </Link>

        {/* Card 4 */}
        <Link 
          to="/guides/clean-alpha-edges" 
          className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-lg'}`}
        >
          <h2 className="text-xl font-bold mb-3">How to Clean Rough Edges After Background Removal</h2>
          <p className="opacity-70 text-sm leading-relaxed">
            Tired of green spill or flickering borders? See how BananaCut helps you clean up messy alpha edges globally across multiple frames in seconds.
          </p>
        </Link>
      </div>
    </div>
  );
}
