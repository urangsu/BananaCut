import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ElementType;
  lang: 'KR' | 'EN' | 'JP';
  setLang: (lang: 'KR' | 'EN' | 'JP') => void;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, icon: Icon, lang, setLang, children }: ModalProps) {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-[#1c1c1e] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
          isDark ? 'border-white/10' : 'border-gray-100'
        }`}>
          <h2 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {Icon && <Icon className="w-5 h-5 text-blue-500" />}
            {title}
          </h2>
          
          <div className="flex items-center gap-4">
            {/* Segmented Control */}
            <div className={`flex p-0.5 rounded-lg ${isDark ? 'bg-black/50' : 'bg-gray-200/50'}`}>
              {(['KR', 'EN', 'JP'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    lang === l 
                      ? (isDark ? 'bg-[#2c2c2e] text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm')
                      : (isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            
            <button 
              onClick={onClose}
              className={`p-1.5 rounded-full transition-colors ${
                isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={`p-6 overflow-y-auto custom-scrollbar ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
