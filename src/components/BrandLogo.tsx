import React from 'react';
import { useTheme } from '../ThemeContext';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  markOnly?: boolean;
  className?: string;
}

export function BrandLogo({ size = 'md', markOnly = false, className = '' }: BrandLogoProps) {
  const { isDark } = useTheme();

  const sizeClasses = {
    sm: {
      img: 'w-5 h-5',
      text: 'text-sm',
      sub: 'text-[8px]',
      gap: 'gap-1.5'
    },
    md: {
      img: 'w-6 h-6',
      text: 'text-base',
      sub: 'text-[10px]',
      gap: 'gap-2'
    },
    lg: {
      img: 'w-8 h-8',
      text: 'text-xl',
      sub: 'text-xs',
      gap: 'gap-2.5'
    }
  };

  const { img, text, sub, gap } = sizeClasses[size];

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      <img src="/brand/bananacut-mark.svg" alt="BananaCut Logo" className={img} />
      {!markOnly && (
        <div className="flex flex-col items-start leading-[1.1]">
          <span className={`font-brand tracking-tight ${text} ${isDark ? 'text-[#FAFAFA]' : 'text-[#171717]'}`}>
            BananaCut
          </span>
          <span className={`font-ui ${sub} ${isDark ? 'text-[#D4D4D8]' : 'text-[#3F3F46]'}`}>
            BY. DALGRACSTUDIO
          </span>
        </div>
      )}
    </div>
  );
}
