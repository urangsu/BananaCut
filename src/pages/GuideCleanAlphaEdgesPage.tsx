import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GuideCleanAlphaEdgesPage() {
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
          How to Clean Rough Edges After Background Removal
        </h1>
      </div>

      <div className={`space-y-10 text-base leading-relaxed p-6 md:p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        
        <p className="text-lg opacity-90 font-medium">
          Removing the background is only half the battle. Often, doing so leaves behind harsh artifacts, green halos, or holes in your character's clothing. Cleaning these up manually used to require drawing over hundreds of individual frames.
        </p>

        <nav className={`p-4 rounded-xl ${isDark ? 'bg-black/20' : 'bg-gray-100'}`}>
          <h2 className="font-bold mb-2">Table of Contents</h2>
          <ul className="list-disc pl-5 space-y-1 opacity-80 text-sm hover:[&_a]:underline">
            <li><a href="#why-happen">Why Rough Edges Happen</a></li>
            <li><a href="#slow">Why Frame-by-Frame Cleanup is Slow</a></li>
            <li><a href="#how-banana">How BananaCut Helps Clean Multiple Frames</a></li>
            <li><a href="#filling-gaps">Filling Gaps (Smart Fill)</a></li>
          </ul>
        </nav>

        <section id="why-happen" className="space-y-4">
          <h2 className="text-2xl font-bold">Why Rough Edges Happen (Green Spill and Gaps)</h2>
          <p className="opacity-80">
            <strong>Green Spill:</strong> When recording against a physical green screen, the green light reflects onto the subject's edges, hair, and clothing. When the green background is removed, this bright green rim remains.<br /><br />
            <strong>Gaps and Missing Parts:</strong> If your subject is wearing something that contains the background color (like a greenish-blue shirt on a green screen), the removal filter will accidentally punch holes through their chest, making them semi-transparent in places they shouldn't be.
          </p>
        </section>

        <section id="slow" className="space-y-4">
          <h2 className="text-2xl font-bold">Why Frame-by-Frame Cleanup is Slow</h2>
          <p className="opacity-80">
            If a 3-second animation has 90 frames, taking just 30 seconds to erase the noise around the edges of a single frame means spending 45 minutes on mind-numbing cleanup. Animation is motion, and motion makes manual frame-by-frame cleanup nearly impossible to keep perfectly stable.
          </p>
        </section>

        <section id="how-banana" className="space-y-4">
          <h2 className="text-2xl font-bold">How BananaCut Helps Clean Multiple Frames</h2>
          <p className="opacity-80">
            BananaCut addresses this by applying non-destructive, global adjustments across all your frames before you use manual tools:
          </p>
          <ul className="list-disc pl-5 opacity-80 space-y-2">
            <li><strong>Softness (Remove Menu):</strong> Before moving to manual cleanup, increase the Softness slider gently. It acts as an alpha-feathering tool that globally blurs and shrinks the hard borders, often hiding minor green spill entirely.</li>
            <li><strong>Enclosed Color:</strong> Toggle this on if your character makes a fist on their hip and the green screen peeks through the gap of their arm. It targets localized background patches automatically.</li>
          </ul>
        </section>

        <section id="filling-gaps" className="space-y-4">
          <h2 className="text-2xl font-bold">Filling Gaps and Fixing Missing Parts</h2>
          <p className="opacity-80">
            If pieces of your character were removed:
            Navigate to the <strong>Recover</strong> page. BananaCut features a robust manual toolset where you can:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Use the <strong>Lasso</strong> to circle a specific artifact across just one frame to erase it.</li>
              <li>Use the <strong>Brush</strong> to paint solid colors back into the gaps where the chroma key went too far.</li>
            </ul>
          </p>
        </section>

        <hr className={`my-8 ${isDark ? 'border-white/10' : 'border-gray-200'}`} />

        <section className="space-y-4">
          <h3 className="text-xl font-bold">FAQ</h3>
          <div className="space-y-2">
            <strong className="block">Can I apply my brush strokes to all frames at once?</strong>
            <p className="opacity-80 mb-4">You can hold <kbd className="px-1 py-0.5 border rounded-sm">Shift</kbd> + <kbd className="px-1 py-0.5 border rounded-sm">Ctrl/Cmd</kbd> while painting or erasing to easily apply the identical stroke to all frames simultaneously. This works great for static dead pixels.</p>
          </div>
        </section>

        <section className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
          <h3 className="font-bold mb-4">Related Guides</h3>
          <div className="flex flex-col gap-2">
            <Link to="/guides/ai-video-to-game-asset" className={`hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Turn AI Videos into Assets</Link>
            <Link to="/guides/sprite-sheet-generator" className={`hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Exporting as a Sprite Sheet</Link>
          </div>
        </section>

      </div>
    </div>
  );
}
