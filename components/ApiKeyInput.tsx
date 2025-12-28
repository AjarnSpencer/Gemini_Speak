import React, { useState, useEffect } from 'react';

interface ApiKeyInputProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ isOpen, onClose }) => {
  const [key, setKey] = useState('');
  const [storageType, setStorageType] = useState<'session' | 'local'>('local');

  useEffect(() => {
    if (isOpen) {
      const local = localStorage.getItem('gemini_api_key');
      const session = sessionStorage.getItem('gemini_api_key');
      if (local) {
        setKey(local);
        setStorageType('local');
      } else if (session) {
        setKey(session);
        setStorageType('session');
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!key.trim()) return;
    
    // Clear both first to ensure no duplicates
    localStorage.removeItem('gemini_api_key');
    sessionStorage.removeItem('gemini_api_key');

    if (storageType === 'local') {
      localStorage.setItem('gemini_api_key', key.trim());
    } else {
      sessionStorage.setItem('gemini_api_key', key.trim());
    }
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem('gemini_api_key');
    sessionStorage.removeItem('gemini_api_key');
    setKey('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100 border border-slate-100">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
                <div className="bg-blue-50 p-1.5 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
                      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800">Secure API Key</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          This application utilizes a strict <strong>Bring Your Own Key (BYOK)</strong> architecture. 
          Your Google Gemini API Key is stored locally in your browser and is never transmitted to our servers.
        </p>
        
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Enter Gemini API Key
            </label>
            <input 
              type="password" 
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono text-sm"
              autoComplete="off"
            />
          </div>

          <div>
             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Storage Preference
            </label>
            <div className="flex gap-4 p-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${storageType === 'local' ? 'border-blue-500' : 'border-slate-300'}`}>
                    {storageType === 'local' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                </div>
                <input 
                  type="radio" 
                  name="storage" 
                  checked={storageType === 'local'} 
                  onChange={() => setStorageType('local')}
                  className="hidden"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900 font-medium">Persistent (LocalStorage)</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${storageType === 'session' ? 'border-blue-500' : 'border-slate-300'}`}>
                    {storageType === 'session' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                </div>
                <input 
                  type="radio" 
                  name="storage" 
                  checked={storageType === 'session'} 
                  onChange={() => setStorageType('session')}
                  className="hidden"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900 font-medium">Session Only</span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-slate-100">
             <button 
               onClick={handleClear}
               className="px-4 py-2.5 rounded-xl text-slate-500 font-semibold hover:bg-slate-50 hover:text-red-500 transition-colors text-sm"
             >
               Clear
             </button>
             <button 
               onClick={handleSave}
               disabled={!key.trim()}
               className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200 text-sm"
             >
               Save Credentials
             </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
          >
            Get a Gemini API Key 
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};