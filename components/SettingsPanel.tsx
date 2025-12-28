import React from 'react';

interface SettingsPanelProps {
  autoPlay: boolean;
  onToggleAutoPlay: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ autoPlay, onToggleAutoPlay }) => {
  return (
    <div className="bg-slate-50/50 px-6 py-3 flex items-center justify-between text-xs border-b border-slate-100">
        <span className="text-slate-400 font-bold uppercase tracking-widest">Settings</span>
        
        <div className="flex items-center gap-4">
             <label className="flex items-center cursor-pointer group">
                <div className="relative">
                <input type="checkbox" className="sr-only" checked={autoPlay} onChange={onToggleAutoPlay} />
                <div className={`block w-8 h-5 rounded-full transition-colors ${autoPlay ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${autoPlay ? 'transform translate-x-3' : ''}`}></div>
                </div>
                <div className="ml-2 text-slate-600 font-semibold group-hover:text-slate-800 transition-colors">
                Auto-Speak
                </div>
            </label>
        </div>
    </div>
  );
};

export default SettingsPanel;