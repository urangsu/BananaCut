import React from 'react';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';

export const Footer = ({ 
  onShowHelp, 
  onShowSupport 
}: { 
  onShowHelp: () => void; 
  onShowSupport: () => void;
}) => {
  const { isDark } = useTheme();
  const { lang } = useLanguage();

  return (
    <footer className={`w-full py-6 mt-12 border-t px-6 flex flex-col md:flex-row items-center justify-between gap-4 ${isDark ? 'border-white/10 text-white/40' : 'border-gray-200 text-gray-500'}`}>
      <div className="text-xs font-medium">
        © 2026 BananaCut | BY. DALGRACSTUDIO
      </div>
      
      <div className="flex items-center gap-4 text-xs font-medium">
        <button onClick={onShowHelp} className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Guide</button>
        <span className="opacity-20">|</span>
        <Link to="/privacy" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Privacy</Link>
        <span className="opacity-20">|</span>
        <Link to="/terms" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Terms</Link>
        <span className="opacity-20">|</span>
        <a href="https://tally.so/r/44vorO" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Feedback</a>
        <span className="opacity-20">|</span>
        <button onClick={onShowSupport} className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors flex items-center gap-1">
          Support 🍌
        </button>
      </div>
    </footer>
  );
};
