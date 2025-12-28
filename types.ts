export interface Language {
  code: string;
  name: string;
  flag: string; // Emoji flag
  voiceName?: string; // Preferred voice for TTS if available
}

export enum Speaker {
  UserA = 'UserA',
  UserB = 'UserB',
}

export interface ConversationEntry {
  id: string;
  timestamp: number;
  speaker: Speaker;
  sourceLanguage: Language;
  targetLanguage: Language;
  originalText: string;
  translatedText: string;
  audioData?: ArrayBuffer; // Raw PCM data for replay
  tone?: string;
}

export interface AppState {
  hasSetup: boolean;
  userALanguage: Language;
  userBLanguage: Language;
  autoPlay: boolean;
}

export enum AppStatus {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING', // Transcribing & Translating
  SPEAKING = 'SPEAKING', // TTS playing
  ERROR = 'ERROR',
}