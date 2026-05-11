import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { Sparkles, Video, Grid } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ExamplesPage() {
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className={`max-w-4xl mx-auto p-6 md:p-12 min-h-[calc(100vh-80px)] ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex items-center gap-3 mb-8 border-b pb-6 border-gray-200 dark:border-white/10">
        <Sparkles className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
        <h1 className="text-3xl font-semibold tracking-tight">
          {lang === 'KR' ? 'Examples & Use Cases' : lang === 'EN' ? 'Examples & Use Cases' : '事例とユースケース'}
        </h1>
      </div>

      <div className="space-y-12">
        {/* Example 1 */}
        <section className={`p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-6">
            <Video className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            <h2 className="text-2xl font-bold">1. Green-screen character animation</h2>
          </div>
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
            <img src="/images/examples/placeholder-1.svg" alt="Green-screen character animation" className="w-full h-auto block" />
          </div>
          <div className="space-y-4 text-base opacity-80">
            <div>
              <strong className="block mb-1 opacity-100">Problem:</strong>
              <p>You have a 3D animated character on a bright green background, but exporting straight from the rendering engine leaves anti-aliasing artifacts or green spill around the edges.</p>
            </div>
            <div>
              <strong className="block mb-1 opacity-100">BananaCut Workflow:</strong>
              <p>Upload the video, select the green background color to remove it, and apply a small tolerance tweak. Use the Recover tool to fill in any gaps if the character has green elements on their clothing.</p>
            </div>
            <div>
              <strong className="block mb-1 opacity-100">Recommended Export:</strong>
              <p>Transparent WebM Video for web presentation, or PNG Sequence for video editors.</p>
            </div>
            <div>
              <strong className="block mb-1 opacity-100">When to use:</strong>
              <p>Great for YouTubers creating overlay elements, VTuber assets, and compositing.</p>
            </div>
          </div>
        </section>

        {/* Example 2 */}
        <section className={`p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className="text-2xl font-bold">2. AI-generated motion clip</h2>
          </div>
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
            <img src="/images/examples/placeholder-2.svg" alt="AI-generated motion clip after cleanup" className="w-full h-auto block" />
          </div>
          <div className="space-y-4 text-base opacity-80">
            <div>
              <strong className="block mb-1 opacity-100">Problem:</strong>
              <p>Generative AI video tools often create amazing animations but don't output transparent backgrounds. The background is usually solid or slightly messy.</p>
            </div>
            <div>
              <strong className="block mb-1 opacity-100">BananaCut Workflow:</strong>
              <p>Pick the dominant background color to drop it out. If the AI created strange flickering edges, use the exclusion brush or adjust softness to blend the outline perfectly.</p>
            </div>
            <div>
              <strong className="block mb-1 opacity-100">Recommended Export:</strong>
              <p>Transparent Video (.webm) for landing pages or marketing materials.</p>
            </div>
            <div>
              <strong className="block mb-1 opacity-100">When to use:</strong>
              <p>Prototyping UI animations, creating marketing assets from generated media.</p>
            </div>
          </div>
        </section>

        {/* Example 3 */}
        <section className={`p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-6">
            <Grid className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            <h2 className="text-2xl font-bold">3. App/game sprite sheet workflow</h2>
          </div>
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
            <img src="/images/examples/placeholder-3.svg" alt="App or game sprite sheet workflow" className="w-full h-auto block" />
          </div>
          <div className="space-y-4 text-base opacity-80">
            <div>
              <strong className="block mb-1 opacity-100">Problem:</strong>
              <p>Game engines and web frameworks perform much better when using a single image containing all frames (a sprite sheet), rather than loading 60 separate PNG files.</p>
            </div>
            <div>
              <strong className="block mb-1 opacity-100">BananaCut Workflow:</strong>
              <p>Upload the raw video animation, clean the background, then use the Asset menu to configure a sprite sheet. Smart Crop can automatically trim wasted transparent space.</p>
            </div>
            <div>
              <strong className="block mb-1 opacity-100">Recommended Export:</strong>
              <p>Sprite Sheet (PNG + JSON) with Smart Crop enabled.</p>
            </div>
            <div>
              <strong className="block mb-1 opacity-100">When to use:</strong>
              <p>2D indie games, React/Vue web applications needing high-performance character animations.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
