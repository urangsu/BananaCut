import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export default function GuideCleanAlphaEdgesPage() {
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className={`max-w-4xl mx-auto p-6 md:p-12 min-h-[calc(100vh-80px)] ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <SEO 
        title="How to Clean Rough Edges After Background Removal | BananaCut"
        description="Learn why rough edges, gaps, and spill happen after background removal and how to clean frames more efficiently."
        canonical="https://www.bananacut.art/guides/clean-alpha-edges"
      />
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
          Removing the background is only half the battle. Often, doing so leaves behind harsh artifacts, green halos, temporal flickering, or accidental holes in your character's clothing. Cleaning these up manually across hundreds of individual frames is historically a massive time sink. This guide demonstrates how to tackle alpha edge issues efficiently.
        </p>

        <nav className={`p-5 rounded-xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <h2 className="font-bold text-lg mb-3">Table of Contents</h2>
          <ul className="list-disc pl-5 space-y-2 opacity-80 text-sm hover:[&_a]:underline">
            <li><a href="#why-this-matters">Why Edge Quality Matters</a></li>
            <li><a href="#why-happen">Why Rough Edges and Halos Happen</a></li>
            <li><a href="#slow">The Problem with Frame-by-Frame Cleanup</a></li>
            <li><a href="#global-tools">Using Global Softness and Tolerance</a></li>
            <li><a href="#exclusion">Protecting Assets with the Exclusion Brush</a></li>
            <li><a href="#filling-gaps">Filling Core Gaps with the Recover Brush</a></li>
            <li><a href="#recommended-settings">Recommended Edge Strategies</a></li>
            <li><a href="#common-mistakes">Common Mistakes to Avoid</a></li>
            <li><a href="#practical-tips">Practical Tips for Fast Workflows</a></li>
            <li><a href="#faq">Frequently Asked Questions (FAQ)</a></li>
          </ul>
        </nav>

        <section id="why-this-matters" className="space-y-4">
          <h2 className="text-2xl font-bold">Why Edge Quality Matters</h2>
          <p className="opacity-80">
            A poorly extracted asset is immediately obvious. Jagged, pixelated borders draw the eye away from the content and ruin the illusion of integration. Whether you are overlaying a character on a complex website background or dropping an enemy sprite into a game engine environment, the alpha channel (the transparency map) needs to feather smoothly to sell the composite. Precision edge cleanup separates amateur assets from professional ones.
          </p>
        </section>

        <section id="why-happen" className="space-y-4">
          <h2 className="text-2xl font-bold">Why Rough Edges and Halos Happen</h2>
          <p className="opacity-80">
            <strong>The Green Spill Halo:</strong> When recording against a physical green screen, light bounces off the backdrop and reflects onto the subject's edges, hair, and clothing. Even if the pure background is mathematically removed, this bright green "spill" remains physically baked into the subject's edge pixels.<br /><br />
            <strong>Temporal AI Flickering:</strong> Generative AI models rarely hold a perfectly stable silhouette across 60 frames. The outline "boils" and morphs, leaving scattered pixel dust outside the main subject when keying out a supposedly solid background.<br /><br />
            <strong>Gaps and Missing Parts (Collateral Damage):</strong> If your subject is wearing something that contains the target background color (like a greenish-blue shirt on a green screen, or a white eye on a white background), raising the removal tolerance will accidentally punch holes straight through them, making them semi-transparent in places they shouldn't be.
          </p>
        </section>

        <section id="slow" className="space-y-4">
          <h2 className="text-2xl font-bold">The Problem with Frame-by-Frame Cleanup</h2>
          <p className="opacity-80">
            If a 3-second animation has 90 frames, taking just 30 seconds to erase the noise around the edges of a single frame means spending 45 minutes on mind-numbing cleanup for a tiny asset. Furthermore, animation is motion. If you manually erase the edge of an arm on Frame 1, and manually erase it slightly differently on Frame 2, the arm will visually shake and stutter during playback. Manual frame-by-frame cleanup is nearly impossible to keep perfectly stable.
          </p>
        </section>

        <section id="global-tools" className="space-y-4">
          <h2 className="text-2xl font-bold">Using Global Softness and Tolerance</h2>
          <p className="opacity-80">
            The key to fast extraction is avoiding manual labor entirely using global parameter adjustments:
          </p>
          <ul className="list-disc pl-5 opacity-80 space-y-3">
            <li><strong>The Softness Slider:</strong> Located in the Remove menu, increasing Softness acts as a global alpha-feather. It blurs and gently erodes the harsh outer boundary of the chroma key. This is the single most effective way to eliminate thin green "spill" halos without touching a brush.</li>
            <li><strong>Tolerance Tuning:</strong> Rather than setting Tolerance to 50% immediately, inch it up slowly. Find the exact mathematical pivot point where the background drops out but the subject remains solid.</li>
            <li><strong>Enclosed Color Toggle:</strong> If your character puts their hands on their hips, the green screen trapped between their arms is usually darker due to shadows. Toggling "Enclosed Color" instructs the system to hunt for background clusters even if they are walled off by the subject.</li>
          </ul>
        </section>

        <section id="exclusion" className="space-y-4">
          <h2 className="text-2xl font-bold">Protecting Assets with the Exclusion Brush</h2>
          <p className="opacity-80">
            If you raise the Tolerance slider high enough to clear the background perfectly, but doing so destroys your character's green tie, you need the <strong>Exclusion Brush</strong>.
          </p>
          <ul className="list-disc pl-5 mt-2 opacity-80 space-y-2">
            <li>Draw a rough mask over the green tie using the brush.</li>
            <li>This mask strictly forbids the engine from keying out anything beneath it, no matter what the Tolerance is set to.</li>
            <li>You can animate this mask across multiple frames using the timeline tools.</li>
          </ul>
        </section>

        <section id="filling-gaps" className="space-y-4">
          <h2 className="text-2xl font-bold">Filling Core Gaps with the Recover Brush</h2>
          <p className="opacity-80">
            If pieces of your character were still removed or if the source video has a glitch, navigate to the <strong>Recover</strong> page. This workspace holds surgical, frame-specific tools:
          </p>
          <ul className="list-disc pl-5 mt-2 opacity-80 space-y-2">
            <li>Use the <strong>Lasso tool</strong> (shortcut: L) to circle a random artifact floating in the sky and delete it definitively.</li>
            <li>Use the <strong>Recover Brush</strong> (shortcut: B) to paint solid, opaque color directly back into the alpha channel, physically patching holes in the frame locally.</li>
          </ul>
        </section>

        <section id="recommended-settings" className="space-y-4">
          <h2 className="text-2xl font-bold">Recommended Edge Strategies</h2>
          <ul className="list-disc pl-5 opacity-80 space-y-2">
            <li><strong>Start Global:</strong> Never pick up the brush first. Spend 90% of your effort tuning the global Color Pick, Tolerance, and Softness.</li>
            <li><strong>Verify Temporal Stability:</strong> A softness setting of 5% might look great on Frame 1, but scrub to Frame 30. If the subject moves into shadow, the edge boundary might shift. Always check the extremes of your timeline.</li>
          </ul>
        </section>

        <section id="common-mistakes" className="space-y-4">
          <h2 className="text-2xl font-bold">Common Mistakes to Avoid</h2>
          <p className="opacity-80">
            A frequent error is over-using the manual brush tools when global settings could solve the problem. If you find yourself painting masks on more than 5 frames, you should stop, reset the tools, and try color picking a different pixel on the background or adjusting the tolerance. The brush tools should be reserved for isolated glitches, not the primary extraction mechanic.
          </p>
        </section>

        <hr className={`my-8 ${isDark ? 'border-white/10' : 'border-gray-200'}`} />

        <section id="practical-tips" className="space-y-4">
          <h3 className="text-xl font-bold">Practical Tips for Fast Workflows</h3>
          <p className="opacity-80">
            Use keyboard modifiers for bulk manual edits. If you have a stubborn dead pixel in the exact same spot in the top right corner across all 60 frames, don't erase it 60 times. Hold down <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded">Shift + Ctrl/Cmd</kbd> while using the Lasso or Brush tools. BananaCut will duplicate that identical stroke or erasing action instantly across every single frame in the timeline array.
          </p>
        </section>

        <section id="faq" className="space-y-4">
          <h3 className="text-xl font-bold">Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div>
              <strong className="block mb-1">Why does Softness make my image look blurry?</strong>
              <p className="opacity-80">Softness specifically blurs the alpha mask transition, not the RGB image data. However, if pushed too high (e.g., above 30%), the mask feathering will begin to eat aggressively into the core of your subject, creating a ghostly, semi-transparent fade. Keep it under 15% for sharp assets.</p>
            </div>
            <div>
              <strong className="block mb-1">Can I undo brush strokes?</strong>
              <p className="opacity-80">Yes. The timeline supports local undo/redo stacks. If you make a mistake with the Recover brush on Frame 5, you can step backward without affecting the work you did on Frame 6.</p>
            </div>
          </div>
        </section>

        <section className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
          <h3 className="font-bold mb-4">Related Guides</h3>
          <div className="flex flex-col gap-3">
            <Link to="/guides/remove-background-from-video" className={`hover:underline font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>How to Remove Video Backgrounds in the Browser</Link>
            <Link to="/guides/sprite-sheet-generator" className={`hover:underline font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Exporting as a Sprite Sheet</Link>
          </div>
        </section>

      </div>
    </div>
  );
}
