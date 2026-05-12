import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export default function GuideAiVideoAssetPage() {
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className={`max-w-4xl mx-auto p-6 md:p-12 min-h-[calc(100vh-80px)] ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <SEO 
        title="Turn AI-Generated Videos into Game Assets | BananaCut"
        description="Learn how to clean up AI-generated clips and prepare them as reusable assets for apps, games, websites, and videos."
        canonical="https://www.bananacut.art/guides/ai-video-to-game-asset"
      />
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
          Generative AI tools produce impressive concept artwork and rapid animations. However, dropping a generated video clip directly into a game engine or interactive web app is usually impossible because they almost always render with flat, baked-in backgrounds.
        </p>

        <nav className={`p-5 rounded-xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <h2 className="font-bold text-lg mb-3">Table of Contents</h2>
          <ul className="list-disc pl-5 space-y-2 opacity-80 text-sm hover:[&_a]:underline">
            <li><a href="#why-this-matters">Why This Matters for Asset Pipelines</a></li>
            <li><a href="#why-generated">Why Generated Videos Are Not Ready to Use</a></li>
            <li><a href="#compatible">Using BananaCut with AI Videos</a></li>
            <li><a href="#fixing">Fixing Flickering Edges and Artifacts</a></li>
            <li><a href="#recommended-settings">Recommended Settings for Cleanup</a></li>
            <li><a href="#common-mistakes">Common Mistakes to Avoid</a></li>
            <li><a href="#export">Exporting for Apps, Games, and Websites</a></li>
            <li><a href="#practical-tips">Practical Tips for Prompting</a></li>
            <li><a href="#faq">Frequently Asked Questions (FAQ)</a></li>
          </ul>
        </nav>

        <section id="why-this-matters" className="space-y-4">
          <h2 className="text-2xl font-bold">Why This Matters for Asset Pipelines</h2>
          <p className="opacity-80">
            Speed is crucial during the prototyping phase of any digital product. When you need a quick placeholder animation of an enemy running in a game, or an abstract blob moving for a website background, AI video generators are heavily utilized. The friction arises when you realize the character is trapped in an environment. Being able to quickly separate the subject transforms a cool video clip into a functional, reusable code asset.
          </p>
        </section>

        <section id="why-generated" className="space-y-4">
          <h2 className="text-2xl font-bold">Why Generated Videos Are Not Ready to Use</h2>
          <p className="opacity-80">
            When you prompt an AI generator to create a "character walking on a solid green background," the output is never a mathematically flat, solid #00FF00 green screen. The AI models bake in gradients, conceptual shadows, environmental lighting reflections, and heavy video compression noise.
          </p>
          <p className="opacity-80">
            Because of these impurities, if you apply a basic chroma-key filter inside game engines, it often fails. It leaves harsh ragged edges around the character or accidentally makes portions of the character's clothing transparent because the AI blurred the boundary between the subject and the background.
          </p>
        </section>

        <section id="compatible" className="space-y-4">
          <h2 className="text-2xl font-bold">Using BananaCut with AI Videos</h2>
          <p className="opacity-80">
            BananaCut can fit into AI video workflows where generated outputs still need cleanup before they are used in apps, games, or websites. Whether you generally produce these assets utilizing platforms like GPT Image, Nano Banana, Seedance, or Veo, BananaCut acts as a functional middle step.
          </p>
          <p className="opacity-80">
            By dropping the generated clip into BananaCut, you can pick the average tone of the uneven background and strip it out globally, preparing the clip for the formatting that code-based environments expect.
          </p>
        </section>

        <section id="fixing" className="space-y-4">
          <h2 className="text-2xl font-bold">Fixing Flickering Edges and Artifacts</h2>
          <p className="opacity-80">
            A common issue with AI video generation is that it draws each frame conceptually, meaning the exact silhouette of a character might shift organically by a few pixels from frame to frame. This creates noticeable flickering around the extracted edges.
          </p>
          <p className="opacity-80">
            BananaCut provides tools specifically to address this. The <strong>Softness</strong> algorithm feathers the alpha channel, dissolving the micro-flickering along the silhouette edge so it is less visually disruptive. Additionally, if the AI generator erroneously placed a green patch on the character's shoulder, you can use the <strong>Exclusion Brush</strong> to protect that area or the <strong>Recover Brush</strong> to manually paint it back after the background removal.
          </p>
        </section>

        <section id="recommended-settings" className="space-y-4">
          <h2 className="text-2xl font-bold">Recommended Settings for Cleanup</h2>
          <ul className="list-disc pl-5 opacity-80 space-y-2">
            <li><strong>Higher Tolerance:</strong> AI generated flat backgrounds typically require a slightly higher Tolerance (around 25-35%) than professionally lit green screens to account for the generated gradients.</li>
            <li><strong>Generous Softness:</strong> Use around 10-15% Softness to blur out the temporal flickering along the generated borders.</li>
            <li><strong>Use Enclosed Color:</strong> If your prompt resulted in a character with their hands on their hips, tick the 'Enclosed Color' box to target the background loops between their arms.</li>
          </ul>
        </section>

        <section id="common-mistakes" className="space-y-4">
          <h2 className="text-2xl font-bold">Common Mistakes to Avoid</h2>
          <p className="opacity-80">
            Trying to extract a character from a complex, realistic background (like a crowded street) generated by AI is incredibly difficult and often yields poor results in standard keying tools. Removing a flat color background is significantly easier. Always ensure your initial AI generation prompt explicitly requests a solid, flat background color that contrasts heavily with your subject.
          </p>
        </section>

        <section id="export" className="space-y-4">
          <h2 className="text-2xl font-bold">Exporting for Apps, Games, and Websites</h2>
          <p className="opacity-80">
            After processing the AI clip, the final step is formatting. To use your new asset optimally:
          </p>
          <ul className="list-disc pl-5 opacity-80 space-y-3">
            <li><strong>For Game Engines (Unity, Godot, GameMaker):</strong> Export as a <strong>Sprite Sheet</strong>. The engine can load a single texture into the GPU, which is the standard methodology for running performant 2D game graphics.</li>
            <li><strong>For Web Interfaces (React, Vue, plain HTML):</strong> Export as a Transparent Video (.webm) if the graphic is a passive background loop, or a Sprite Sheet if you need to bind the animation frames to user scroll events.</li>
          </ul>
        </section>

        <hr className={`my-8 ${isDark ? 'border-white/10' : 'border-gray-200'}`} />

        <section id="practical-tips" className="space-y-4">
          <h3 className="text-xl font-bold">Practical Tips for Prompting</h3>
          <p className="opacity-80">
            When writing your prompt in your generator of choice, append phrases like <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded">"on a bright solid green background, 2D flat composition, high contrast"</code>. Avoid prompting for volumetric lighting or deep shadows, as those will spill onto your background color and complicate the removal.
          </p>
        </section>

        <section id="faq" className="space-y-4">
          <h3 className="text-xl font-bold">Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div>
              <strong className="block mb-1">Can BananaCut fix morphing limbs or AI hallucinations?</strong>
              <p className="opacity-80">No. BananaCut focuses on alpha channel transparency and edge cleanup. It does not redraw anatomy or fix structural generation errors like an extra limb. You must generate a structurally sound clip first before attempting to extract it.</p>
            </div>
            <div>
              <strong className="block mb-1">Does this support high-resolution AI videos?</strong>
              <p className="opacity-80">BananaCut operates in your browser memory. While it handles 720p or 1080p clips fairly well, very high-resolution clips or clips exceeding a few hundred frames may cause your browser to run out of memory. Resize the video prior to processing if necessary.</p>
            </div>
          </div>
        </section>

        <section className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
          <h3 className="font-bold mb-4">Related Guides</h3>
          <div className="flex flex-col gap-3">
            <Link to="/guides/remove-background-from-video" className={`hover:underline font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>How to Remove Backgrounds from Video in Your Browser</Link>
            <Link to="/guides/sprite-sheet-generator" className={`hover:underline font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>How to Create a Sprite Sheet from Video Frames</Link>
          </div>
        </section>

      </div>
    </div>
  );
}
