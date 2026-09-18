import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  variant?: 'horizontal' | 'stacked' | 'icon' | 'dark';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  linkToHome?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  className = '',
  size = 'md',
  linkToHome = true,
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: { title: 'text-base', sub: 'text-[10px]' },
    md: { title: 'text-xl', sub: 'text-xs' },
    lg: { title: 'text-3xl', sub: 'text-sm' },
  };

  // Pure SVG Organic Heart Icon
  const LogoIcon = (
    <svg viewBox="0 0 160 140" className={`${iconSizes[size]} flex-shrink-0`} fill="none">
      <defs>
        <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8A2C8D" />
          <stop offset="100%" stopColor="#6B1D6F" />
        </linearGradient>
        <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34A853" />
          <stop offset="100%" stopColor="#1E7E34" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5BF50" />
          <stop offset="100%" stopColor="#D99A36" />
        </linearGradient>
      </defs>
      {/* Purple Petal (Left / Human Care) */}
      <path d="M60 118 C38 104 14 74 14 44 C14 22 30 8 50 8 C62 8 72 16 78 26 C70 50 64 82 60 118 Z" fill="url(#purpleGrad)" />
      {/* Green Leaf Petal (Top Right / Growth & Land) */}
      <path d="M84 22 C92 12 105 6 120 6 C142 6 156 22 156 46 C156 68 136 90 94 96 C88 68 86 42 84 22 Z" fill="url(#greenGrad)" />
      {/* Golden Petal (Bottom Right / Warmth & Hope) */}
      <path d="M98 102 C134 96 160 84 160 62 C160 84 138 110 110 124 C90 134 74 134 68 128 C78 120 88 112 98 102 Z" fill="url(#goldGrad)" />
    </svg>
  );

  const content = (
    <div className={`flex items-center gap-3 ${variant === 'stacked' ? 'flex-col text-center' : ''} ${className}`}>
      {LogoIcon}
      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`font-black tracking-wide ${variant === 'dark' ? 'text-white' : 'text-slate-800'} ${textSizes[size].title}`}>
              AEI <span className="text-aei-gold font-light">·</span> WFP <span className="text-aei-green font-light">·</span> HR
            </span>
            <span className="bg-wfp-blue/10 text-wfp-blue text-[10px] font-bold px-1.5 py-0.5 rounded border border-wfp-blue/20">
              WFP Partner
            </span>
          </div>
          <span className={`font-medium ${variant === 'dark' ? 'text-slate-300' : 'text-slate-500'} ${textSizes[size].sub}`}>
            جمعية أرض الإنسان <span className="text-aei-green">•</span> نظام الموارد البشرية
          </span>
        </div>
      )}
    </div>
  );

  if (linkToHome) {
    return (
      <Link to="/" className="inline-flex hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};
