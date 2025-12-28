import React from 'react';

export const AppLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan */}
        <stop offset="50%" stopColor="#3b82f6" /> {/* Blue */}
        <stop offset="100%" stopColor="#f43f5e" /> {/* Rose */}
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Abstract stylized speech bubbles intertwining */}
    <path 
      d="M20 50 C20 20, 50 20, 50 50 C50 80, 80 80, 80 50" 
      stroke="url(#logoGradient)" 
      strokeWidth="12" 
      strokeLinecap="round"
      opacity="0.3"
    />
    <path 
      d="M20 50 C20 80, 50 80, 50 50 C50 20, 80 20, 80 50" 
      stroke="url(#logoGradient)" 
      strokeWidth="12" 
      strokeLinecap="round" 
    />
    
    {/* Central Node */}
    <circle cx="50" cy="50" r="8" fill="white" stroke="url(#logoGradient)" strokeWidth="4" />
  </svg>
);
