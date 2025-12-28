import React, { useRef, useEffect } from 'react';
import { ConversationEntry, Speaker } from '../types';
import { SentimentIcon } from './SentimentIcon';

interface NotebookProps {
  entries: ConversationEntry[];
  onReplay: (audioData: ArrayBuffer) => void;
}

const Notebook: React.FC<NotebookProps> = ({ entries, onReplay }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-8 text-center m-4">
        <div className="bg-slate-50 p-6 rounded-full mb-6 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-slate-200">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
        </div>
        <p className="text-xl font-bold text-slate-400 mb-2">No conversations yet</p>
        <p className="text-sm text-slate-400/80 max-w-xs mx-auto">
          Start speaking to see real-time translation and sentiment analysis.
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-8 scroll-smooth"
    >
      {entries.map((entry) => {
        const isUserA = entry.speaker === Speaker.UserA;
        return (
          <div 
            key={entry.id} 
            className={`flex flex-col ${isUserA ? 'items-start' : 'items-end'}`}
          >
            <div className={`
              max-w-[85%] md:max-w-[75%] rounded-3xl p-5 shadow-sm relative transition-all hover:shadow-md group
              ${isUserA 
                ? 'bg-gradient-to-br from-white to-cyan-50/50 border border-cyan-100 rounded-tl-none text-cyan-900' 
                : 'bg-gradient-to-br from-white to-orange-50/50 border border-orange-100 rounded-tr-none text-orange-900'
              }
            `}>
                {/* Header: Lang and Tone */}
                <div className={`flex items-center gap-3 mb-3 text-[10px] uppercase tracking-wider font-bold ${isUserA ? 'text-cyan-400' : 'text-orange-400'}`}>
                    <div className="flex items-center gap-1.5 opacity-70">
                       <span>{entry.sourceLanguage.flag}</span>
                       <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                       <span>{entry.targetLanguage.flag}</span>
                    </div>
                    
                    {entry.tone && (
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-sm border bg-white/60 backdrop-blur-sm
                            ${isUserA ? 'border-cyan-100/50' : 'border-orange-100/50'}
                        `}>
                            <SentimentIcon tone={entry.tone} className="w-3.5 h-3.5" />
                            <span>{entry.tone}</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-3">
                    <p className={`text-sm italic font-serif leading-relaxed ${isUserA ? 'text-cyan-900/40' : 'text-orange-900/40'}`}>"{entry.originalText}"</p>
                    
                    <div className="flex items-end justify-between gap-4">
                        <p className={`text-lg font-medium leading-relaxed tracking-wide ${isUserA ? 'text-slate-800' : 'text-slate-800'}`}>
                            {entry.translatedText}
                        </p>
                        
                        {/* Replay Button */}
                        {entry.audioData && (
                            <button 
                                onClick={() => entry.audioData && onReplay(entry.audioData)}
                                className={`
                                    flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all opacity-0 group-hover:opacity-100
                                    ${isUserA 
                                        ? 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200 hover:scale-110' 
                                        : 'bg-orange-100 text-orange-600 hover:bg-orange-200 hover:scale-110'
                                    }
                                `}
                                title="Listen again"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 2.485.735 4.817 2.035 6.784.35 1.14 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                                  <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Notebook;
