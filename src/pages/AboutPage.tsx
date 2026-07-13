import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { Info } from 'lucide-react';
import { SEO } from '../components/SEO';
import { useAdSense } from '../hooks/useAdSense';

export default function AboutPage() {
  useAdSense();
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className={`h-full min-h-0 overflow-y-auto w-full max-w-4xl mx-auto p-6 md:p-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <SEO 
        title="Why I Built BananaCut | BananaCut"
        description="BananaCut started as a browser-based tool for preparing app assets, removing backgrounds, and cleaning repeated video frames."
        canonical="https://www.bananacut.art/about"
      />
      <div className="flex items-center gap-3 mb-8 border-b pb-6 border-gray-200 dark:border-white/10">
        <Info className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <h1 className="text-3xl font-semibold tracking-tight">
          {lang === 'KR' ? 'Why I Built BananaCut' : lang === 'EN' ? 'Why I Built BananaCut' : 'Why I Built BananaCut'}
        </h1>
      </div>

      <div className={`space-y-8 text-base leading-relaxed p-6 md:p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        <p className="opacity-90">
          BananaCut is a personal project born out of frustration. It started while I was preparing assets for an app project. I built it because background removal and frame cleanup were repetitive and inconvenient, then made it available for others with the same workflow problem.
        </p>
        
        <div className="space-y-8 mt-8">
          <section>
            <h2 className="text-xl font-bold mb-3">What BananaCut is for</h2>
            <p className="opacity-80">
              When creating small apps, indie games, or prototyping UI, you often need isolated moving assets. You either record something on a green screen or generate a quick motion clip using AI. The problem is removing that solid background perfectly across dozens of frames. Professional video editing software is heavy, expensive, and overkill for extracting a simple sprite sheet. BananaCut is a lightweight tool specifically for developers and creators to solve this narrow problem quickly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Why browser-based processing matters</h2>
            <p className="opacity-80">
              Many background removal services act as black boxes. You upload your video to a server, wait for a queue, pay credits, and hope the result is acceptable. BananaCut runs entirely locally in your browser. Utilizing modern WebAssembly and in-memory frame processing, the media files never leave your computer. This gives you instant feedback, zero privacy risks, and no unnecessary server latency.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">What BananaCut does not do</h2>
            <p className="opacity-80">
              It is not a complex video editor. It does not create advanced motion graphics, handle multi-track audio, or generate complex visual effects. It is a utility for cleaning alpha channels, fixing frame artifacts, and exporting usable assets. If you need to make a movie, use standard software. If you need a transparent running character for your web project, use BananaCut.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Feedback and improvements</h2>
            <p className="opacity-80">
              This tool is continuously evolving based on what breaks and what feels too slow in real-world workflows. If you encounter bugs, have ideas to make the interface faster, or run into specific video formats that fail to load, please reach out.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
