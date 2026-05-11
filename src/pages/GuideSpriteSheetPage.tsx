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
          If you are building an interactive app, a 2D indie game, or a complex web experience, relying on standalone video files with an alpha channel or hundreds of loose, individual PNG files is usually highly inefficient. Sprite sheets have been the industry standard for high-performance 2D animation for decades, and understanding how to construct them properly is crucial.
        </p>

        <nav className={`p-5 rounded-xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <h2 className="font-bold text-lg mb-3">Table of Contents</h2>
          <ul className="list-disc pl-5 space-y-2 opacity-80 text-sm hover:[&_a]:underline">
            <li><a href="#why-this-matters">Why This Matters for Performance</a></li>
            <li><a href="#what-is-it">Understanding What a Sprite Sheet Is</a></li>
            <li><a href="#step-by-step">Step-by-Step Workflow in BananaCut</a></li>
            <li><a href="#layout">Configuring Columns and Spacing</a></li>
            <li><a href="#smart-crop">Original Canvas vs Smart Crop</a></li>
            <li><a href="#json">Understanding the JSON Metadata</a></li>
            <li><a href="#recommended-settings">Recommended Export Settings</a></li>
            <li><a href="#when-to-use">When to Use a Sprite Sheet vs Video</a></li>
            <li><a href="#common-mistakes">Common Mistakes to Avoid</a></li>
            <li><a href="#faq">Frequently Asked Questions (FAQ)</a></li>
          </ul>
        </nav>

        <section id="why-this-matters" className="space-y-4">
          <h2 className="text-2xl font-bold">Why This Matters for Performance</h2>
          <p className="opacity-80">
            For web applications, fetching 60 individual image files over a network requires 60 separate HTTP requests. This severely slows down the website render blocking process and creates visual stuttering as each frame drops in randomly. Even in local applications or game engines, loading dozens of separate textures forces the hardware to continually swap data in and out of active memory frame-by-frame. 
          </p>
          <p className="opacity-80">
            Sprite sheets solve this. By packing all frames into one master file, you incur only a single HTTP request or a single texture load to the GPU. This drastically reduces draw calls, improves memory allocation efficiency, and guarantees smooth animation playback without hiccups.
          </p>
        </section>

        <section id="what-is-it" className="space-y-4">
          <h2 className="text-2xl font-bold">Understanding What a Sprite Sheet Is</h2>
          <p className="opacity-80">
            Conceptually, a sprite sheet is a single, large image file composed of an entire sequence of animation frames laid out in a grid format (rows and columns). Instead of loading multiple changing images, the game engine or browser loads this one massive image statically, and then rapidly shifts a visible rectangular "viewport window" mathematically to display different grid segments over time, creating the illusion of smooth movement.
          </p>
        </section>

        <section id="step-by-step" className="space-y-4">
          <h2 className="text-2xl font-bold">Step-by-Step Workflow in BananaCut</h2>
          <p className="opacity-80">
            Creating a sprite sheet directly from video footage natively in the browser is the core functionality BananaCut provides. The process is straightforward:
          </p>
          <ol className="list-decimal pl-5 opacity-80 space-y-2">
            <li>Ensure you have removed any solid backgrounds in the <strong>Remove</strong> step so your frames have proper transparency.</li>
            <li>Navigate to the <strong>Asset</strong> module page.</li>
            <li>Select the <strong>Sprite Sheet</strong> export option.</li>
            <li>Adjust your arrangement sliders (columns and crop padding) to fit your engine's requirements.</li>
            <li>Export the payload, which provides you with both the packed PNG image file and the accompanying structural JSON map.</li>
          </ol>
        </section>

        <section id="layout" className="space-y-4">
          <h2 className="text-2xl font-bold">Configuring Columns and Spacing</h2>
          <p className="opacity-80">
            The layout of the grid matters. In the BananaCut Asset configuration tools, you define the <strong>Columns</strong> parameter. A higher column count forces the master image to be much wider, while a lower count results in a taller image profile.
          </p>
          <p className="opacity-80">
            Depending on your target platform, you must be mindful of maximum texture limits. Older mobile devices or specific web rendering engines will truncate or fail to load textures that exceed 4096px or 8192px on a single axis. If your video resolution is very large, packing 50 frames into a single row might exceed this boundary lock; distribute them into a more square-like aspect ratio instead by adjusting the column count closer to the square root of the total frame amount.
          </p>
        </section>

        <section id="smart-crop" className="space-y-4">
          <h2 className="text-2xl font-bold">Original Canvas vs Smart Crop</h2>
          <p className="opacity-80">
            By default, video frames generally have an excessive amount of empty, transparent space around a moving subject. Packing this empty space into a sprite sheet wastes memory and bloats file sizes severely.
          </p>
          <p className="opacity-80">
            BananaCut's <strong>Smart Crop</strong> algorithm automatically passes through all frames, finds the global maximum bounding box of the active pixels across the entire sequence, and trims away the useless transparent margins uniformly. This ensures the pivot point remains stable across frames while dramatically minimizing the overall surface area. Conversely, if your game engine requires exact 1920x1080 bounds to align hardcoded coordinates to screen-space, ensure you leave the setting switched to <strong>Original Canvas</strong>.
          </p>
        </section>

        <section id="json" className="space-y-4">
          <h2 className="text-2xl font-bold">Understanding the JSON Metadata</h2>
          <p className="opacity-80">
            A packed PNG image by itself can be difficult to slice accurately via coordinate math, especially if Smart Crop has altered the boundaries. When exporting, BananaCut bundles a metadata JSON config file.
          </p>
          <p className="opacity-80">
            This file contains a programmatic dictionary mapping out exactly where each chronological frame is structurally located inside the master PNG image, utilizing precise X/Y pixel coordinates along with accurate width/height dimensions. Engines like Phaser, PixiJS, or Godot ingest this JSON file alongside the PNG to handle the animation splitting automatically.
          </p>
        </section>

        <section id="recommended-settings" className="space-y-4">
          <h2 className="text-2xl font-bold">Recommended Export Settings</h2>
          <ul className="list-disc pl-5 opacity-80 space-y-2">
            <li><strong>For mobile web/React:</strong> Enable Smart Crop to ensure the payload stays under 3-5MB. Set your columns to form a relatively square image to prevent browser decode crashes.</li>
            <li><strong>For Unity/Unreal Engine:</strong> Original canvas is often preferred if the animation is part of a strict layout or full-screen UI transition, though Smart Crop + JSON is optimal for smaller character sprites.</li>
          </ul>
        </section>

        <section id="common-mistakes" className="space-y-4">
          <h2 className="text-2xl font-bold">Common Mistakes to Avoid</h2>
          <p className="opacity-80">
            Attempting to construct a Sprite Sheet from a 60-second video clip is counter-productive. A 60-second clip at 30 frames per second equals 1,800 full-resolution images. Packing this into a single sheet will result in a monstrous, gigabyte-sized image that will instantly crash any engine or browser that attempts to unpack it. Keep sprite sheets relegated to short actions (run cycles, explosions, character attacks).
          </p>
        </section>

        <section id="when-to-use" className="space-y-4">
          <h2 className="text-2xl font-bold">When to Use a Sprite Sheet vs Video</h2>
          <p className="opacity-80">
            Use a Sprite Sheet any time the animation must be explicitly driven by programmatic logic in your application. For example, if frame 5 should only play when a user clicks the mouse or moves a joystick, use a sprite sheet. If you only require a passive, continuous, non-interactive decoration looped in the background of a landing page sidebar, exporting a direct Transparent WebM Video is usually simpler and yields smaller file footprints.
          </p>
        </section>

        <hr className={`my-8 ${isDark ? 'border-white/10' : 'border-gray-200'}`} />

        <section id="faq" className="space-y-4">
          <h3 className="text-xl font-bold">Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div>
              <strong className="block mb-1">Why is the generated sprite sheet image so large in bytes?</strong>
              <p className="opacity-80">Uncompressed PNG data adds up quickly. If an image is 8000x8000 pixels, it is heavy even if most of it is transparent. Try enabling Smart Crop, or downscaling the original video resolution before uploading it if you don't need true HD assets.</p>
            </div>
            
            <div>
              <strong className="block mb-1">What format is the JSON map in?</strong>
              <p className="opacity-80">The JSON output dictates standard frame properties (filename, frame boundaries, sourceSize, spriteSourceSize) in a format heavily compatible with prevalent tools like TexturePacker syntax, making it ingestible by Phaser, PixiJS, and generalized 2D tools.</p>
            </div>
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
