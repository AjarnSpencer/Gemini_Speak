import React from 'react';
import { AppStatus } from '../types';

interface RecorderButtonProps {
  status: AppStatus;
  isUserATurn: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

const RecorderButton: React.FC<RecorderButtonProps> = ({ status, isUserATurn, onStart, onStop, disabled }) => {
  const isRecording = status === AppStatus.RECORDING;
  const isProcessing = status === AppStatus.PROCESSING;
  const isSpeaking = status === AppStatus.SPEAKING;

  let label = "Hold to Speak";
  // Updated colors: Blue (User A) / Orange (User B)
  let colorClass = isUserATurn 
    ? "bg-gradient-to-b from-cyan-500 to-blue-600 shadow-blue-200 ring-4 ring-blue-50" 
    : "bg-gradient-to-b from-orange-400 to-rose-500 shadow-orange-200 ring-4 ring-orange-50";

  if (isRecording) {
    label = "Recording...";
    colorClass = "bg-rose-500 ring-4 ring-rose-100 animate-pulse scale-105";
  } else if (isProcessing) {
    label = "Translating...";
    colorClass = "bg-slate-700 cursor-wait ring-4 ring-slate-100";
  } else if (isSpeaking) {
    label = "Speaking...";
    colorClass = "bg-indigo-500 cursor-wait ring-4 ring-indigo-100";
  } else if (disabled) {
    label = "Wait...";
    colorClass = "bg-slate-300 cursor-not-allowed";
  }

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!disabled && !isRecording && !isProcessing && !isSpeaking) {
      e.preventDefault(); 
      onStart();
    }
  };

  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (isRecording) {
      e.preventDefault();
      onStop();
    }
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Stop if mouse leaves button
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onTouchCancel={handleMouseUp} // Stop if touch cancelled/moved off
      disabled={disabled || isProcessing || isSpeaking}
      className={`
        relative w-28 h-28 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all duration-300 transform
        ${colorClass}
        ${!disabled && !isProcessing && !isRecording ? 'hover:scale-105 active:scale-95' : ''}
      `}
    >
        {isProcessing ? (
           <svg className="animate-spin h-8 w-8 text-white/80 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
        ) : (
            // Custom Detailed Microphone Icon
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-1">
               {/* Mic Head */}
               <rect x="8" y="2" width="8" height="12" rx="4" strokeWidth="2" />
               <line x1="10" y1="5" x2="14" y2="5" opacity="0.5" strokeLinecap="round" />
               <line x1="10" y1="8" x2="14" y2="8" opacity="0.5" strokeLinecap="round" />
               <line x1="10" y1="11" x2="14" y2="11" opacity="0.5" strokeLinecap="round" />
               
               {/* Stand/Base */}
               <path d="M19 10v2a7 7 0 01-14 0v-2" strokeLinecap="round" />
               <line x1="12" y1="19" x2="12" y2="22" strokeLinecap="round" strokeWidth="2" />
               <line x1="8" y1="22" x2="16" y2="22" strokeLinecap="round" strokeWidth="2" />
            </svg>
        )}
      <span className="text-[10px] font-bold tracking-widest uppercase">{label}</span>
      
      {/* Ripple effect rings when recording */}
      {isRecording && (
        <>
            <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-20 animate-ping"></span>
            <span className="absolute inline-flex h-3/4 w-3/4 rounded-full bg-rose-400 opacity-20 animate-ping delay-75"></span>
        </>
      )}
    </button>
  );
};

export default RecorderButton;
