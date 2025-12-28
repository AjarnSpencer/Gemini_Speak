import { Language } from './types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦', voiceName: 'Zephyr' },
  { code: 'my-MM', name: 'Burmese', flag: '🇲🇲', voiceName: 'Fenrir' },
  { code: 'ca-ES', name: 'Catalan', flag: '🇪🇸', voiceName: 'Kore' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)', flag: '🇨🇳', voiceName: 'Fenrir' },
  { code: 'nl-NL', name: 'Dutch', flag: '🇳🇱', voiceName: 'Puck' },
  { code: 'nl-BE', name: 'Dutch (Belgium)', flag: '🇧🇪', voiceName: 'Kore' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸', voiceName: 'Puck' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷', voiceName: 'Fenrir' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪', voiceName: 'Puck' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳', voiceName: 'Charon' },
  { code: 'id-ID', name: 'Indonesian', flag: '🇮🇩', voiceName: 'Zephyr' },
  { code: 'it-IT', name: 'Italian', flag: '🇮🇹', voiceName: 'Kore' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵', voiceName: 'Charon' },
  { code: 'km-KH', name: 'Khmer', flag: '🇰🇭', voiceName: 'Fenrir' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷', voiceName: 'Zephyr' },
  { code: 'lo-LA', name: 'Lao', flag: '🇱🇦', voiceName: 'Charon' },
  { code: 'ms-MY', name: 'Malay', flag: '🇲🇾', voiceName: 'Puck' },
  { code: 'mt-MT', name: 'Maltese', flag: '🇲🇹', voiceName: 'Kore' },
  { code: 'no-NO', name: 'Norwegian', flag: '🇳🇴', voiceName: 'Fenrir' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷', voiceName: 'Kore' },
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺', voiceName: 'Charon' },
  { code: 'es-ES', name: 'Spanish', flag: '🇪🇸', voiceName: 'Kore' },
  { code: 'sv-SE', name: 'Swedish', flag: '🇸🇪', voiceName: 'Puck' },
  { code: 'tl-PH', name: 'Tagalog', flag: '🇵🇭', voiceName: 'Zephyr' },
  { code: 'th-TH', name: 'Thai', flag: '🇹🇭', voiceName: 'Charon' },
  { code: 'ceb-PH', name: 'Visayan', flag: '🇵🇭', voiceName: 'Fenrir' },
];

export const INITIAL_USER_A = SUPPORTED_LANGUAGES.find(l => l.code === 'en-US') || SUPPORTED_LANGUAGES[0];
export const INITIAL_USER_B = SUPPORTED_LANGUAGES.find(l => l.code === 'es-ES') || SUPPORTED_LANGUAGES[1];