import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { Mail } from 'lucide-react';

export default function ContactPage() {
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className={`max-w-4xl mx-auto p-6 md:p-12 min-h-[calc(100vh-80px)] ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex items-center gap-3 mb-8 border-b pb-6 border-gray-200 dark:border-white/10">
        <Mail className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <h1 className="text-3xl font-semibold tracking-tight">
          {lang === 'KR' ? 'Contact Us' : lang === 'EN' ? 'Contact Us' : 'お問い合わせ'}
        </h1>
      </div>

      <div className={`space-y-8 text-base leading-relaxed p-6 md:p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        <div className="space-y-6">
          <p className="opacity-80">
            {lang === 'KR' ? '버그 제보, 기능 제안, 사용 중 불편한 점을 편하게 보내주세요.' 
             : lang === 'EN' ? 'Send bug reports, feature ideas, or feedback about your workflow.' 
             : 'バグ報告、機能提案、使いにくい点などをお気軽にお送りください。'}
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg mb-1">Service Name</h3>
              <p className="opacity-80">BananaCut</p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-1">Studio</h3>
              <p className="opacity-80">DALGRACSTUDIO</p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-1">Contact Email</h3>
              <a href="mailto:hello@bananacut.art" className={`hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                hello@bananacut.art
              </a>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-1">Feedback Link</h3>
              <a href="https://tally.so/r/44vorO" target="_blank" rel="noopener noreferrer" className={`hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                Submit Feedback Request
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
