import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  AppState, 
  Language, 
  AppStatus, 
  ConversationEntry, 
  Speaker 
} from './types';
import { INITIAL_USER_A, INITIAL_USER_B } from './constants';
import { translateAudio, generateSpeech, getStoredApiKey } from './services/geminiService';
import { playAudioBuffer } from './utils/audioUtils';
import LanguageSelect from './components/LanguageSelect';
import RecorderButton from './components/RecorderButton';
import Notebook from './components/Notebook';
import SettingsPanel from './components/SettingsPanel';
import { ApiKeyInput } from './components/ApiKeyInput';
import { AppLogo } from './components/AppLogo';

function App() {
  // --- State ---
  const [appState, setAppState] = useState<AppState>({
    hasSetup: false,
    userALanguage: INITIAL_USER_A,
    userBLanguage: INITIAL_USER_B,
    autoPlay: true,
  });

  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [notebook, setNotebook] = useState<ConversationEntry[]>([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
  // Turn Management: true = User A's turn, false = User B's turn
  const [isUserATurn, setIsUserATurn] = useState<boolean>(true);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Persistent Audio Context for iOS
  const audioContextRef = useRef<AudioContext | null>(null); 
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // --- Effects ---
  
  useEffect(() => {
    const saved = localStorage.getItem('gemini_relay_notebook');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Note: ArrayBuffers do not survive JSON.stringify/parse. 
        // Replay will only work for new messages in the current session, which is expected behavior for web.
        setNotebook(parsed);
      } catch (e) {
        console.error("Failed to load notebook", e);
      }
    }

    // Strict BYOK: Check for API key on mount using the centralized service
    const hasKey = getStoredApiKey();
    if (!hasKey) {
        // We do not force the modal immediately on mount to be less intrusive,
        // unless the user tries to record.
    }
  }, []);

  useEffect(() => {
    // We strip audioData before saving to local storage to avoid quota limits
    const safeNotebook = notebook.map(({ audioData, ...rest }) => rest);
    localStorage.setItem('gemini_relay_notebook', JSON.stringify(safeNotebook));
  }, [notebook]);

  // --- Helpers ---

  const getAudioContext = () => {
    if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
    }
    return audioContextRef.current;
  };

  const getSupportedMimeType = () => {
    const types = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'audio/webm';
  };

  // --- Handlers ---

  const handleSetupComplete = () => {
    const ctx = getAudioContext();
    if(ctx.state === 'suspended') ctx.resume();
    setAppState(prev => ({ ...prev, hasSetup: true }));
  };

  const startRecording = async () => {
    if (status !== AppStatus.IDLE) return;

    // Strict BYOK Check: Use service to verify key before allowing interaction
    const hasKey = getStoredApiKey();
    if (!hasKey) {
        setShowApiKeyModal(true);
        return;
    }

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        await ctx.resume();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true, 
            noiseSuppression: true,
            autoGainControl: true
          } 
      });
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => handleRecordingComplete(mimeType);

      // CRITICAL FIX: Use a timeslice (e.g., 200ms) to ensure data is collected periodically.
      // This prevents the browser from dropping the recording if it thinks the stream is idle.
      mediaRecorder.start(200); 
      
      setStatus(AppStatus.RECORDING);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please allow permissions.");
      setStatus(AppStatus.ERROR);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const stopPlayback = () => {
    if (audioSourceRef.current) {
        try {
            audioSourceRef.current.stop();
        } catch(e) { /* ignore */ }
    }
    if (status === AppStatus.SPEAKING) {
        setIsUserATurn(prev => !prev);
        setStatus(AppStatus.IDLE);
    }
  };

  const replayMessage = async (audioData: ArrayBuffer) => {
    if (status !== AppStatus.IDLE || !audioData) return;
    try {
        await playAudioBuffer(audioData, getAudioContext());
    } catch (e) {
        console.error("Replay failed", e);
    }
  };

  const handleRecordingComplete = async (mimeType: string) => {
    setStatus(AppStatus.PROCESSING);
    
    if (audioChunksRef.current.length === 0) {
        setStatus(AppStatus.IDLE);
        return;
    }

    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
    if (audioBlob.size < 1000) {
        setStatus(AppStatus.IDLE);
        return;
    }
    
    const sourceLang = isUserATurn ? appState.userALanguage : appState.userBLanguage;
    const targetLang = isUserATurn ? appState.userBLanguage : appState.userALanguage;

    try {
      const result = await translateAudio(audioBlob, sourceLang, targetLang);
      
      if (!result.originalText || result.originalText === "..." || result.translatedText === "...") {
         setStatus(AppStatus.IDLE);
         return;
      }

      // Generate Speech Logic
      let audioBuffer: ArrayBuffer | undefined;
      if (result.translatedText) {
         try {
             audioBuffer = await generateSpeech(result.translatedText, targetLang);
         } catch (audioErr) {
             console.error("TTS generation failed", audioErr);
             if ((audioErr as Error).message === 'API_KEY_MISSING') {
                setShowApiKeyModal(true);
             }
         }
      }

      const newEntry: ConversationEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        speaker: isUserATurn ? Speaker.UserA : Speaker.UserB,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        originalText: result.originalText,
        translatedText: result.translatedText,
        tone: result.detectedTone,
        audioData: audioBuffer // Store for replay
      };
      
      setNotebook(prev => [...prev, newEntry]);

      if (audioBuffer) {
         setStatus(AppStatus.SPEAKING);
         if (appState.autoPlay) {
           await playAudioBuffer(
               audioBuffer, 
               getAudioContext(),
               (ctx, src) => { audioSourceRef.current = src; }
           );
         }
      }

      setIsUserATurn(prev => !prev);
      setStatus(AppStatus.IDLE);

    } catch (error) {
      console.error("Relay processing failed:", error);
      
      // Strict BYOK Error Handling:
      // If the service throws API_KEY_MISSING (e.g. key was deleted during session),
      // we catch it here and prompt the user.
      if ((error as Error).message === 'API_KEY_MISSING') {
          setStatus(AppStatus.IDLE);
          setShowApiKeyModal(true);
          return;
      }

      alert("Translation failed. Please try again.");
      setStatus(AppStatus.IDLE);
    }
  };

  // --- Render ---

  const currentSpeakerLang = isUserATurn ? appState.userALanguage : appState.userBLanguage;
  const targetSpeakerLang = isUserATurn ? appState.userBLanguage : appState.userALanguage;

  return (
    <>
      <ApiKeyInput isOpen={showApiKeyModal} onClose={() => setShowApiKeyModal(false)} />
      
      {!appState.hasSetup ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                 <AppLogo className="w-96 h-96 -translate-x-20 -translate-y-20" />
              </div>
              
              <button 
                onClick={() => setShowApiKeyModal(true)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-20"
                title="API Settings"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                  </svg>
              </button>
              
              <div className="relative z-10 flex flex-col items-center">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full mb-3 shadow-lg">
                    <AppLogo className="w-12 h-12 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Speak Relay</h1>
                  <p className="text-blue-100 text-sm font-medium">Gemini 3 Pro Powered</p>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <LanguageSelect 
                  label="User A (Blue)" 
                  selected={appState.userALanguage}
                  onChange={(l) => setAppState(prev => ({...prev, userALanguage: l}))}
                />
                <div className="flex justify-center -my-2 relative z-10">
                  <div className="bg-white rounded-full p-2 shadow-sm border border-slate-100">
                     <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>
                  </div>
                </div>
                <LanguageSelect 
                  label="User B (Orange)" 
                  selected={appState.userBLanguage}
                  onChange={(l) => setAppState(prev => ({...prev, userBLanguage: l}))}
                />
              </div>
              
              <button 
                onClick={handleSetupComplete}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Start Session
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </button>
            </div>
          </div>
          
          <div className="absolute bottom-4 text-center text-slate-400 text-xs">
            <p>Created by <a href="https://github.com/AjarnSpencer" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-blue-600">Ajarn Spencer Littlewood</a></p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden relative">
          
          {/* Top Bar */}
          <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between z-10 sticky top-0">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-1.5 rounded-lg shadow-sm">
                    <AppLogo className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">Speak Relay</h1>
                    <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 uppercase tracking-wider">
                        <span className={`w-1.5 h-1.5 rounded-full ${status === AppStatus.ERROR ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`}></span>
                        Online
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setShowApiKeyModal(true)}
                    className="text-slate-400 hover:text-blue-500 p-2 rounded-full hover:bg-blue-50 transition-colors"
                    title="API Key Settings"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                    </svg>
                </button>
                <button 
                    onClick={() => {
                        if(confirm("Clear conversation history?")) setNotebook([]);
                    }}
                    className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Clear Notebook"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
          </div>

          {/* Notebook */}
          <Notebook entries={notebook} onReplay={replayMessage} />

          {/* Bottom Controls */}
          <div className="bg-white border-t border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            
            <SettingsPanel 
              autoPlay={appState.autoPlay} 
              onToggleAutoPlay={() => setAppState(p => ({...p, autoPlay: !p.autoPlay}))} 
            />

            <div className="p-6 pb-2">
                <div className="flex flex-col items-center">
                    
                    {/* Pivot Controls */}
                    <div className="w-full flex justify-between items-end mb-6 px-2 md:px-8">
                        <div className={`transition-all duration-300 transform origin-bottom-left ${isUserATurn ? 'opacity-100 scale-100' : 'opacity-40 scale-90 grayscale'}`}>
                            <LanguageSelect 
                                selected={appState.userALanguage}
                                onChange={(l) => setAppState(prev => ({...prev, userALanguage: l}))}
                                disabled={status !== AppStatus.IDLE}
                            />
                            <div className="text-center mt-2 font-bold text-cyan-800 text-xs uppercase tracking-widest">User A</div>
                        </div>

                        <div className="pb-8 text-slate-300">
                            {isUserATurn 
                                ? <svg className="w-6 h-6 animate-pulse text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                                : <svg className="w-6 h-6 animate-pulse text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"/></svg>
                            }
                        </div>

                        <div className={`transition-all duration-300 transform origin-bottom-right ${!isUserATurn ? 'opacity-100 scale-100' : 'opacity-40 scale-90 grayscale'}`}>
                            <LanguageSelect 
                                selected={appState.userBLanguage}
                                onChange={(l) => setAppState(prev => ({...prev, userBLanguage: l}))}
                                disabled={status !== AppStatus.IDLE}
                            />
                            <div className="text-center mt-2 font-bold text-orange-800 text-xs uppercase tracking-widest">User B</div>
                        </div>
                    </div>

                    {/* Recorder / Action Button */}
                    <div className="relative z-20 flex flex-col items-center gap-2">
                        <RecorderButton 
                            status={status}
                            isUserATurn={isUserATurn}
                            onStart={startRecording}
                            onStop={stopRecording}
                            disabled={status === AppStatus.ERROR}
                        />
                        
                        {/* Emergency Stop Button when Speaking */}
                        {status === AppStatus.SPEAKING && (
                            <button 
                              onClick={stopPlayback}
                              className="mt-4 px-6 py-1.5 text-xs font-bold text-white bg-red-500 rounded-full hover:bg-red-600 shadow-md transition-colors"
                            >
                              STOP AUDIO
                            </button>
                        )}
                    </div>

                    {/* Status Text */}
                    <div className="mt-4 h-6 text-sm font-medium text-slate-400 text-center w-full">
                        {status === AppStatus.IDLE && (
                            <span>Ready for <strong className={isUserATurn ? "text-cyan-600" : "text-orange-600"}>{currentSpeakerLang.name}</strong> input...</span>
                        )}
                        {status === AppStatus.RECORDING && <span className="text-red-500 animate-pulse">Listening... Release to translate</span>}
                        {status === AppStatus.PROCESSING && <span className="text-slate-600 flex items-center justify-center gap-2"><span className="animate-spin h-3 w-3 border-2 border-slate-600 rounded-full border-t-transparent"></span> Processing...</span>}
                        {status === AppStatus.SPEAKING && <span className="text-blue-600">Speaking {targetSpeakerLang.name}...</span>}
                    </div>
                </div>
            </div>
            
            <div className="bg-slate-50 border-t border-slate-100 py-4 text-center text-slate-500">
              <p className="text-xs mb-1">Created by</p>
              <a href="https://github.com/AjarnSpencer" target="_blank" rel="noopener noreferrer" className="text-base font-bold text-slate-800 hover:text-blue-600 transition-colors">Ajarn Spencer Littlewood</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;