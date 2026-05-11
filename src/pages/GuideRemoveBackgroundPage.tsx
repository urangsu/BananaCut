import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GuideRemoveBackgroundPage() {
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
          How to Remove Backgrounds from Video in Your Browser
        </h1>
      </div>

      <div className={`space-y-10 text-base leading-relaxed p-6 md:p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        
        <p className="text-lg opacity-90 font-medium">
          Whether you're creating assets for a game, making a VTuber presentation, or preparing UI animations, you often need a subject isolated from its background. Historically, removing backgrounds from videos required complex desktop software and lengthy rendering. Not anymore.
        </p>

        <nav className={`p-4 rounded-xl ${isDark ? 'bg-black/20' : 'bg-gray-100'}`}>
          <h2 className="font-bold mb-2">Table of Contents</h2>
          <ul className="list-disc pl-5 space-y-1 opacity-80 text-sm hover:[&_a]:underline">
            <li><a href="#why-hard">Why Video Background Removal is Hard</a></li>
            <li><a href="#upload">1. Upload Video & Extract Frames</a></li>
            <li><a href="#pick">2. Pick Background Color</a></li>
            <li><a href="#adjust">3. Adjust Tolerance & Clean Edges</a></li>
            <li><a href="#export">4. Export PNG Sequence, WebM, or Sprite Sheet</a></li>
          </ul>
        </nav>

        <section id="why-hard" className="space-y-4">
          <h2 className="text-2xl font-bold">Why Video Background Removal is Hard</h2>
          <p className="opacity-80">
            Unlike static images where the edge of a subject is fixed, videos have motion blur, lighting changes, and compression artifacts. A green screen that perfectly drops out on frame 1 might leave noticeable green spill on frame 14 due to movement. Professional tools allow precise masking, but they are heavy and overkill for simple assets.
          </p>
        </section>

        <section id="upload" className="space-y-4">
          <h2 className="text-2xl font-bold">1. Upload Video & Extract Frames</h2>
          <p className="opacity-80">
            Start by loading your video file into BananaCut. Everything runs locally in your browser, meaning no slow server uploads. BananaCut automatically extracts the video into individual image frames so you can see exactly how the removal affects the entire sequence.
          </p>
        </section>

        <section id="pick" className="space-y-4">
          <h2 className="text-2xl font-bold">2. Pick Background Color</h2>
          <p className="opacity-80">
            Once loaded, use the Color Picker tool to click on the background you want to remove (e.g., green, blue, white, or black). For best results, click an area of the background that represents the average color.
          </p>
        </section>

        <section id="adjust" className="space-y-4">
          <h2 className="text-2xl font-bold">3. Adjust Tolerance & Clean Edges</h2>
          <p className="opacity-80">
            Because backgrounds are rarely a perfectly uniform color due to shadows and lighting, adjust the <strong>Tolerance</strong> slider. Increase it gently until the background vanishes. Use the <strong>Softness</strong> slider to feather the edges so the cut doesn't look harsh and pixelated.
          </p>
        </section>

        <section id="export" className="space-y-4">
          <h2 className="text-2xl font-bold">4. Export PNG Sequence, WebM, or Sprite Sheet</h2>
          <p className="opacity-80">
            Once the background is removed across all frames, navigate to the Asset page. Choose your output format:
          </p>
          <ul className="list-disc pl-5 opacity-80 space-y-2">
            <li><strong>Transparent Video (.webm):</strong> Best for web display and presentations.</li>
            <li><strong>Sprite Sheet:</strong> Best for game engines in Unity, Godot, or React web apps.</li>
            <li><strong>Zip (PNG Sequence):</strong> Best if you need to do further compositing in Premiere Pro or After Effects.</li>
          </ul>
        </section>

        <hr className={`my-8 ${isDark ? 'border-white/10' : 'border-gray-200'}`} />

        <section className="space-y-4">
          <h3 className="text-xl font-bold">Practical Tips</h3>
          <p className="opacity-80">
            If your subject contains the same color as the background (e.g. a character wearing a green tie on a green screen), use the Exclusion Brush in BananaCut to explicitly protect the tie from being removed.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold">FAQ</h3>
          <div className="space-y-2">
            <strong className="block">Does this upload my video to a server?</strong>
            <p className="opacity-80 mb-4">No. The entire process of frame extraction, chroma keying, and exporting is executed directly in your browser using modern web technologies.</p>
            
            <strong className="block">How long can the video be?</strong>
            <p className="opacity-80">It depends on your device's memory since all frames are stored in browser RAM. Short clips (under 10 seconds) for UI elements or character loops work best.</p>
          </div>
        </section>

        <section className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
          <h3 className="font-bold mb-4">Related Guides</h3>
          <div className="flex flex-col gap-2">
            <Link to="/guides/ai-video-to-game-asset" className={`hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Turn AI-Generated Videos into Game Assets</Link>
            <Link to="/guides/clean-alpha-edges" className={`hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>How to Clean Rough Edges</Link>
          </div>
        </section>

      </div>
    </div>
  );
}
