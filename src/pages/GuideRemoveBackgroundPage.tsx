import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export default function GuideRemoveBackgroundPage() {
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className={`max-w-4xl mx-auto p-6 md:p-12 min-h-[calc(100vh-80px)] ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <SEO 
        title="How to Remove Backgrounds from Video in Your Browser | BananaCut"
        description="A practical guide to remove video backgrounds, clean frames, and export PNG sequences, WebM, or sprite sheets in your browser."
        canonical="https://www.bananacut.art/guides/remove-background-from-video"
      />
      <div className="mb-8">
        <Link to="/guides" className={`text-sm hover:underline ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          ← Back to Guides
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8 border-b pb-6 border-gray-200 dark:border-white/10">
        <BookOpen className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <h1 className="text-3xl font-semibold tracking-tight">
          How to Remove Backgrounds from Video in Your Browser
        </h1>
      </div>

      <div className={`space-y-10 text-base leading-relaxed p-6 md:p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        
        <p className="text-lg opacity-90 font-medium">
          Whether you're creating assets for a game, making a VTuber presentation, or preparing UI animations, you often need a subject isolated from its background. Historically, removing backgrounds from videos required complex desktop software and lengthy rendering. Not anymore. BananaCut allows you to strip away backgrounds, tweak tolerance levels, and export transparent video or sprite sheets—all within your web browser.
        </p>

        <nav className={`p-5 rounded-xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <h2 className="font-bold text-lg mb-3">Table of Contents</h2>
          <ul className="list-disc pl-5 space-y-2 opacity-80 text-sm hover:[&_a]:underline">
            <li><a href="#why-this-matters">Why This Matters in Modern Workflows</a></li>
            <li><a href="#why-hard">Why Video Background Removal is Traditionally Hard</a></li>
            <li><a href="#step-1">Step 1: Upload Video & Extract Frames</a></li>
            <li><a href="#step-2">Step 2: Pick the Background Color</a></li>
            <li><a href="#step-3">Step 3: Adjust Tolerance & Clean Edges</a></li>
            <li><a href="#recommended-settings">Recommended Settings for Best Results</a></li>
            <li><a href="#common-mistakes">Common Mistakes to Avoid</a></li>
            <li><a href="#export">Exporting: PNG Sequence, WebM, or Sprite Sheet</a></li>
            <li><a href="#practical-tips">Practical Tips for Complex Videos</a></li>
            <li><a href="#faq">Frequently Asked Questions (FAQ)</a></li>
          </ul>
        </nav>

        <section id="why-this-matters" className="space-y-4">
          <h2 className="text-2xl font-bold">Why This Matters in Modern Workflows</h2>
          <p className="opacity-80">
            For independent developers and small design teams, efficiency is everything. When you only need a quick looping animation for a website hero section or a character reaction for a 2D indie game, booting up a heavy video editing suite like Adobe Premiere or After Effects can easily break your momentum. Browser-based background removal democratizes asset creation, allowing anyone with a modern web browser to generate transparent assets in seconds. This eliminates the need for expensive hardware or specialized compositing skills, streamlining the pipeline from raw recording directly into your final project.
          </p>
        </section>

        <section id="why-hard" className="space-y-4">
          <h2 className="text-2xl font-bold">Why Video Background Removal is Traditionally Hard</h2>
          <p className="opacity-80">
            Unlike static images where the edge of a subject is fixed, videos suffer from motion blur, lighting changes, compression artifacts, and frame-rate limitations. A green screen that appears perfectly solid and drops out flawlessly on frame 1 might leave noticeable green spill on frame 14 due to the subject moving quickly across the frame.
          </p>
          <p className="opacity-80">
            Standard chroma keying tools rely heavily on consistent lighting. Furthermore, dealing with "spill" (where the background color reflects onto the subject) often requires complex masking and color correction. Professional tools manage this by allowing precise, keyframe-by-keyframe masking, but this approach is excessively heavy and overkill when you are just trying to extract simple assets for interactive media.
          </p>
        </section>

        <section id="step-1" className="space-y-4">
          <h2 className="text-2xl font-bold">Step 1: Upload Video & Extract Frames</h2>
          <p className="opacity-80">
            Start by preparing your media clip. The ideal clip should be relatively short (under 10-15 seconds) as it is primarily intended for looping assets or specific actions. Load your video file into the BananaCut interface.
          </p>
          <p className="opacity-80">
            Crucially, everything runs locally inside your browser using WebAssembly and canvas technologies. This means there are no slow server uploads, no privacy concerns regarding your media, and no waiting in a processing queue. BananaCut automatically decodes the video and extracts it into individual image frames, storing them in your computer's RAM, so you can see exactly how the removal affects the entire sequence sequentially.
          </p>
        </section>

        <section id="step-2" className="space-y-4">
          <h2 className="text-2xl font-bold">Step 2: Pick the Background Color</h2>
          <p className="opacity-80">
            Once your frames are loaded and visible in the timeline block, the first active step is establishing your key color. Use the Color Picker tool provided in the interface. Click anywhere on the background you want to remove—whether it is a classic bright green, blue, white, or a generated solid color from an AI video tool.
          </p>
          <p className="opacity-80">
            For the best initial results, try to click an area of the background that represents the "average" lighting. If the background is uniformly lit, clicking anywhere works. If there is a slight gradient, choosing the middle tone often yields a better starting point than clicking the absolute darkest or brightest corner.
          </p>
        </section>

        <section id="step-3" className="space-y-4">
          <h2 className="text-2xl font-bold">Step 3: Adjust Tolerance & Clean Edges</h2>
          <p className="opacity-80">
            Because backgrounds are rarely a perfectly uniform hex color due to shadows, lighting variations, and video compression, you will almost never achieve a perfect cut with just the initial color pick. You need to adjust the <strong>Tolerance</strong>.
          </p>
          <p className="opacity-80">
            Increase the Tolerance slider gently. As you increase it, you widen the range of colors the algorithm considers "background." Stop when the background visibly vanishes but stop before it starts eating into your character or subject.
          </p>
          <p className="opacity-80">
            Next, use the <strong>Softness</strong> slider. Increasing softness applies an alpha-feathering effect. Rather than leaving harsh, jagged, transparent borders around your subject, softness blends the edges smoothly into transparency, making the final asset look much more natural when placed on top of other content.
          </p>
        </section>

        <section id="recommended-settings" className="space-y-4">
          <h2 className="text-2xl font-bold">Recommended Settings for Best Results</h2>
          <ul className="list-disc pl-5 opacity-80 space-y-2">
            <li><strong>For clean green screens:</strong> Tolerance around 10-20%, Softness around 5%.</li>
            <li><strong>For AI-generated solid backgrounds:</strong> Tolerance around 20-35% (AI outputs often have heavy compression banding), Softness around 10%.</li>
            <li><strong>For white backgrounds:</strong> Tolerance around 5-15% (be careful not to remove the whites of characters' eyes or teeth).</li>
          </ul>
        </section>

        <section id="common-mistakes" className="space-y-4">
          <h2 className="text-2xl font-bold">Common Mistakes to Avoid</h2>
          <p className="opacity-80">
            One of the most frequent mistakes is pushing the Tolerance slider too high in an attempt to clean up every single shadow in the corner of the frame. This results in "holes" appearing in the subject. Instead, use a moderate Tolerance, and then utilize the manual <strong>Recover</strong> brush tools later to manually paint away stubborn corners without damaging your core asset.
          </p>
          <p className="opacity-80">
            Another mistake is ignoring the timeline. You might achieve a perfect cutout on Frame 1, but shadows might shift by Frame 20. Always scrub through your video timeline to ensure the background removal holds up consistently across the entire sequence.
          </p>
        </section>

        <section id="export" className="space-y-4">
          <h2 className="text-2xl font-bold">Exporting: PNG Sequence, WebM, or Sprite Sheet</h2>
          <p className="opacity-80">
            After the background is completely removed and the alpha edges are cleaned up across all frames, navigate to the Asset page. BananaCut offers several output formats tailored to different project needs:
          </p>
          <ul className="list-disc pl-5 opacity-80 space-y-3">
            <li><strong>Transparent Video (.webm):</strong> This is the best choice for web display, modern browsers, and presentations. It retains high quality while supporting a fully transparent alpha channel, making it ideal for UI overlays or landing page graphics.</li>
            <li><strong>Sprite Sheet (PNG/JSON):</strong> The ultimate format for game engines (Unity, Godot, Unreal, Phaser). It packs all frames into a single, optimized grid image, drastically reducing draw calls and memory overhead compared to individual image sequences.</li>
            <li><strong>ZIP (PNG Sequence):</strong> Best if you are sending the files to another animator or bringing them into complex compositing software like After Effects where you need completely lossless, individual frames.</li>
          </ul>
        </section>

        <hr className={`my-8 ${isDark ? 'border-white/10' : 'border-gray-200'}`} />

        <section id="practical-tips" className="space-y-4">
          <h3 className="text-xl font-bold">Practical Tips for Complex Videos</h3>
          <p className="opacity-80">
            If your subject contains the exact same color as the background—for example, a character wearing a green tie on a green screen—increasing the Tolerance will inevitably erase the tie. In these challenging situations, utilize BananaCut's <strong>Exclusion Brush</strong>. This tool allows you to manually paint over the tie, explicitly telling the engine to ignore that spatial area during the background removal pass, protecting your subject's details.
          </p>
        </section>

        <section id="faq" className="space-y-4">
          <h3 className="text-xl font-bold">Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div>
              <strong className="block mb-1">Does this upload my video to a server?</strong>
              <p className="opacity-80">No. The entire process of frame extraction, chroma keying, cleanup, and exporting is executed directly in your browser using modern web technologies (like WebAssembly and Canvas). Your files are secure and private.</p>
            </div>
            
            <div>
              <strong className="block mb-1">How long can the video be?</strong>
              <p className="opacity-80">The system is constrained by your device's available memory (RAM) since all uncompressed frames are held in browser memory for rapid editing. Short clips (under 10 seconds), loops, and distinct character actions work best. Longer videos may cause the browser to crash or slow down significantly.</p>
            </div>

            <div>
              <strong className="block mb-1">Why is my exported WebM video large?</strong>
              <p className="opacity-80">Retaining a high-quality alpha channel (transparency) across video frames requires less aggressive compression than standard MP4 files. If file size is a strict concern, exporting as a Smart Cropped Sprite Sheet often yields lighter total payload sizes for interactive applications.</p>
            </div>
          </div>
        </section>

        <section className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
          <h3 className="font-bold mb-4">Related Guides</h3>
          <div className="flex flex-col gap-3">
            <Link to="/guides/ai-video-to-game-asset" className={`hover:underline font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Turn AI-Generated Videos into Game Assets</Link>
            <Link to="/guides/clean-alpha-edges" className={`hover:underline font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>How to Clean Rough Edges After Background Removal</Link>
          </div>
        </section>

      </div>
    </div>
  );
}
