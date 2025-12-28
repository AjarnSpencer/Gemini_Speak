import React from 'react';

interface SentimentIconProps {
  tone?: string;
  className?: string;
}

export const SentimentIcon: React.FC<SentimentIconProps> = ({ tone, className = "w-4 h-4" }) => {
  if (!tone) return null;

  const lowerTone = tone.toLowerCase();
  
  // Define icon paths based on tone categories
  let iconPath;
  let colorClass = "text-slate-500";

  if (lowerTone.includes('happy') || lowerTone.includes('excited') || lowerTone.includes('joy') || lowerTone.includes('friendly')) {
    // Sun / Sparkle
    iconPath = (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    );
    colorClass = "text-amber-500";
  } else if (lowerTone.includes('sad') || lowerTone.includes('somber') || lowerTone.includes('sorry')) {
    // Cloud/Rain
    iconPath = (
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    );
    colorClass = "text-blue-400";
  } else if (lowerTone.includes('angry') || lowerTone.includes('frustrated') || lowerTone.includes('urgent') || lowerTone.includes('tense')) {
    // Lightning
    iconPath = (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    );
    colorClass = "text-red-500";
  } else if (lowerTone.includes('question') || lowerTone.includes('confused') || lowerTone.includes('curious')) {
    // Question
    iconPath = (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    );
    colorClass = "text-violet-500";
  } else if (lowerTone.includes('professional') || lowerTone.includes('formal') || lowerTone.includes('business')) {
    // Briefcase/Shield (Structure)
    iconPath = (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    );
    colorClass = "text-slate-600";
  } else {
    // Neutral / Waves
    iconPath = (
       <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5M3.75 15.75h16.5M3.75 8.25h16.5" />
    );
    colorClass = "text-slate-400";
  }

  return (
    <div className={`inline-flex items-center justify-center ${colorClass}`} title={tone}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        {iconPath}
      </svg>
    </div>
  );
};
