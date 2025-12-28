import React from 'react';
import { Language } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants';

interface LanguageSelectProps {
  label?: string;
  selected: Language;
  onChange: (lang: Language) => void;
  disabled?: boolean;
}

const LanguageSelect: React.FC<LanguageSelectProps> = ({ label, selected, onChange, disabled }) => {
  return (
    <div className="flex flex-col">
      {label && <label className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest pl-1">{label}</label>}
      <div className="relative group">
        <select
          value={selected.code}
          onChange={(e) => {
            const lang = SUPPORTED_LANGUAGES.find(l => l.code === e.target.value);
            if (lang) onChange(lang);
          }}
          disabled={disabled}
          className="appearance-none w-full bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition-all shadow-sm font-semibold text-sm cursor-pointer hover:border-slate-300"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 group-hover:text-slate-700 transition-colors">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelect;