import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GuideAiVideoAssetPage() {
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className={`max-w-4xl mx-auto p-6 md:p-12 min-h-[calc(100vh-80px)] ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <div className="mb-8">
        <Link to="/guides" className={`text-sm hover:underline ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          ← Back to Guides
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8 border-b pb-6 border-gray-200 dark:border-white/10">
        <BookOpen className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <h1 className="text-3xl font-semibold tracking-tight">
          Turn AI-Generated Videos into Game Assets
        </h1>
      </div>

      <div className={`space-y-10 text-base leading-relaxed p-6 md:p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        
        <p className="text-lg opacity-90 font-medium">
          Generative AI tools are incredible at creating rapid concept art and short animations. However, integrating a generated video directly into a game or interactive app is usually impossible because they lack transparency.
        </p>

        <nav className={`p-4 rounded-xl ${isDark ? 'bg-black/20' : 'bg-gray-100'}`}>
          <h2 className="font-bold mb-2">Table of Contents</h2>
          <ul className="list-disc pl-5 space-y-1 opacity-80 text-sm hover:[&_a]:underline">
            <li><a href="#why-generated">Why Generated Videos Are Not Ready to Use</a></li>
            <li><a href="#fixing">Fixing Flickering Edges and Artifacts</a></li>
            <li><a href="#compatible">Using BananaCut with AI Videos</a></li>
            <li><a href="#export">Exporting for Apps, Games, and Websites</a></li>
          </ul>
        </nav>

        <section id="why-generated" className="space-y-4">
          <h2 className="text-2xl font-bold">Why Generated Videos Are Not Ready to Use</h2>
          <p className="opacity-80">
            When you prompt an AI to create a "running character on a green background," the output is never a perfect, solid green #00FF00. The AI bakes in gradients, shadows, and compression noise. As a result, backgrounds remain stuck to your character, and simple chroma key filters often fail to remove it cleanly without destroying the character itself.
          </p>
        </section>

        <section id="fixing" className="space-y-4">
          <h2 className="text-2xl font-bold">Fixing Flickering Edges and Artifacts</h2>
          <p className="opacity-80">
            Because AI generates each frame sequentially, the edges of the character often flicker or change shape slightly. To fix this:
          </p>
          <ul className="list-disc pl-5 opacity-80 space-y-2">
            <li>Use a slightly higher <strong>Tolerance</strong> in BananaCut to catch color variations in the AI's artificial green screen.</li>
            <li>Apply <strong>Softness</strong> to hide the micro-flickering along the silhouette edge.</li>
            <li>Check for "holes" inside the character where the AI accidentally colored a piece of clothing green. Use the Recover tool to patch these holes.</li>
          </ul>
        </section>

        <section id="compatible" className="space-y-4">
          <h2 className="text-2xl font-bold">Using BananaCut with AI Videos</h2>
          <p className="opacity-80">
            BananaCut is an excellent companion to top AI video models. Whether you're generating assets using GPT Image, Nano Banana, Seedance, or Veo, BananaCut acts as the crucial middle step between the AI's raw video output and your final game engine. Simply export your clip from the generator, drop it into BananaCut, and extract the transparent sprite.
          </p>
        </section>

        <section id="export" className="space-y-4">
          <h2 className="text-2xl font-bold">Exporting for Apps, Games, and Websites</h2>
          <p className="opacity-80">
            To use your new AI asset optimally:
          </p>
          <ul className="list-disc pl-5 opacity-80 space-y-2">
            <li>For <strong>Game Engines</strong> (Unity, Godot, Unreal): Export as a Sprite Sheet. This allows the engine to load a single texture into GPU memory and slice it using the provided JSON metadata.</li>
            <li>For <strong>Web UIs</strong>: Export as a transparent WebM if playing a continuous loop, or a compressed Sprite Sheet if binding animations to scroll events.</li>
          </ul>
        </section>

        <hr className={`my-8 ${isDark ? 'border-white/10' : 'border-gray-200'}`} />

        <section className="space-y-4">
          <h3 className="text-xl font-bold">FAQ</h3>
          <div className="space-y-2">
            <strong className="block">Can I fix morphing limbs?</strong>
            <p className="opacity-80">BananaCut helps clean transparency and edges, but it cannot redraw anatomy if the AI generated an extra limb. You should generate a good base video first before using BananaCut.</p>
          </div>
        </section>

        <section className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
          <h3 className="font-bold mb-4">Related Guides</h3>
          <div className="flex flex-col gap-2">
            <Link to="/guides/remove-background-from-video" className={`hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>How to Remove Video Backgrounds</Link>
            <Link to="/guides/sprite-sheet-generator" className={`hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Create Sprite Sheets</Link>
          </div>
        </section>

      </div>
    </div>
  );
}
