import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GuideSpriteSheetPage() {
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
          How to Create a Sprite Sheet from Video Frames
        </h1>
      </div>

      <div className={`space-y-10 text-base leading-relaxed p-6 md:p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        
        <p className="text-lg opacity-90 font-medium">
          If you are building an app, a 2D game, or an interactive web experience, using standalone video files or hundreds of loose PNGs is inefficient. Sprite sheets are the industry standard for high-performance 2D animation.
        </p>

        <nav className={`p-4 rounded-xl ${isDark ? 'bg-black/20' : 'bg-gray-100'}`}>
          <h2 className="font-bold mb-2">Table of Contents</h2>
          <ul className="list-disc pl-5 space-y-1 opacity-80 text-sm hover:[&_a]:underline">
            <li><a href="#what-is-it">What a Sprite Sheet Is</a></li>
            <li><a href="#why-use">Why Games and Apps Use It</a></li>
            <li><a href="#layout">Configuring Columns and Spacing</a></li>
            <li><a href="#smart-crop">Original Canvas vs Smart Crop</a></li>
            <li><a href="#json">JSON Metadata</a></li>
            <li><a href="#when-to-use">When to Use a Sprite Sheet Instead of Video</a></li>
          </ul>
        </nav>

        <section id="what-is-it" className="space-y-4">
          <h2 className="text-2xl font-bold">What a Sprite Sheet Is</h2>
          <p className="opacity-80">
            A sprite sheet is a single, large image file that contains an entire sequence of animation frames laid out in a grid. Instead of loading multiple images, the software loads one image and rapidly shifts the visible "window" to display different frames, creating the illusion of movement.
          </p>
        </section>

        <section id="why-use" className="space-y-4">
          <h2 className="text-2xl font-bold">Why Games/Apps Use It</h2>
          <p className="opacity-80">
            Fetching 60 individual PNG files over a network requires 60 separate HTTP requests, slowing down your website. In game engines, loading one large texture into GPU memory is drastically more efficient than swapping textures every frame. Sprite sheets reduce draw calls, improve memory allocation, and guarantee smooth playback.
          </p>
        </section>

        <section id="layout" className="space-y-4">
          <h2 className="text-2xl font-bold">Configuring Columns and Spacing</h2>
          <p className="opacity-80">
            In BananaCut's Asset page, you can define how many <strong>Columns</strong> your sprite sheet uses. A higher column count makes the image wider; a lower count makes it taller. Be mindful of maximum texture sizes (often 4096px or 8192px on older mobile devices).
          </p>
        </section>

        <section id="smart-crop" className="space-y-4">
          <h2 className="text-2xl font-bold">Original Canvas vs Smart Crop</h2>
          <p className="opacity-80">
            By default, video frames have lots of empty space. BananaCut's <strong>Smart Crop</strong> feature analyzes all frames to find the maximum bounding box of the active pixels, and trims away the useless transparent pixels. This can reduce your file size massively. If your engine requires the exact original resolution to align things, use the <strong>Original Canvas</strong> mode instead.
          </p>
        </section>

        <section id="json" className="space-y-4">
          <h2 className="text-2xl font-bold">JSON Metadata</h2>
          <p className="opacity-80">
            When you export a Sprite Sheet from BananaCut, it includes a JSON file. This file tells your game engine exactly where each frame is located via X/Y coordinates and width/height dimensions. It's especially vital if you enabled Smart Crop, as the frame sizes are no longer perfectly identical.
          </p>
        </section>

        <section id="when-to-use" className="space-y-4">
          <h2 className="text-2xl font-bold">When to Use a Sprite Sheet Instead of Video</h2>
          <p className="opacity-80">
            Use a sprite sheet when the animation needs to be tied to user input (e.g., a character running when you press 'Right'), or when working in a strict 2D engine environment like Phaser, PixiJS, or Unity 2D. Use Transparent WebM video if you just need a passive, looping background decoration on a website and don't need frame-by-frame control.
          </p>
        </section>

        <hr className={`my-8 ${isDark ? 'border-white/10' : 'border-gray-200'}`} />

        <section className="space-y-4">
          <h3 className="text-xl font-bold">FAQ</h3>
          <div className="space-y-2">
            <strong className="block">Why is my sprite sheet massive?</strong>
            <p className="opacity-80 mb-4">You may be trying to convert a 10-second 1080p video (300 frames). Sprite sheets are meant for short, focused animations like jumps, runs, or UI explosions, usually under 60 frames. Use Smart Crop to reduce size.</p>
          </div>
        </section>

        <section className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
          <h3 className="font-bold mb-4">Related Guides</h3>
          <div className="flex flex-col gap-2">
            <Link to="/guides/remove-background-from-video" className={`hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>How to Remove Video Backgrounds</Link>
          </div>
        </section>

      </div>
    </div>
  );
}
