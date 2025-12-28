import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Language } from "../types";

/**
 * Retrieves the API Key strictly from browser storage.
 * Prioritizes LocalStorage (Persistent) then SessionStorage (Temporary).
 * NEVER falls back to process.env to ensure strict BYOK architecture.
 */
export const getStoredApiKey = (): string | null => {
  return localStorage.getItem('gemini_api_key') || sessionStorage.getItem('gemini_api_key');
};

// Helper to convert Blob to Base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

interface TranslationResult {
  originalText: string;
  translatedText: string;
  detectedTone: string;
}

/**
 * Uses Gemini 3 Pro to transcribe audio and translate it while preserving tone.
 * STRICT MODE: Temperature 0 and directive prompt to prevent hallucination.
 */
export const translateAudio = async (
  audioBlob: Blob,
  sourceLang: Language,
  targetLang: Language
): Promise<TranslationResult> => {
  try {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }

    // Initialize client dynamically with the stored key
    const ai = new GoogleGenAI({ apiKey });

    const base64Audio = await blobToBase64(audioBlob);

    // Highly restrictive prompt to prevent "conversational completion" hallucination
    // We explicitly tell it what to do if it hears nothing.
    const prompt = `
    You are a professional interpreter API. Your only job is to return a JSON object.
    
    METADATA:
    - Input Audio Language: ${sourceLang.name}
    - Output Text Language: ${targetLang.name}
    
    INSTRUCTIONS:
    1. Analyze the attached audio file.
    2. Transcribe the speech EXACTLY.
    3. Translate the speech to the Output Language.
    4. Detect the tone.
    
    CRITICAL ANTI-HALLUCINATION RULES:
    - If the audio is silent, just background noise, or unintelligible: Return "..." for originalText and translatedText.
    - DO NOT invent a conversation. 
    - DO NOT complete the sentence.
    - DO NOT provide examples like "The delivery deadline is tomorrow".
    - DO NOT respond to the user. Only translate.
    
    RESPONSE FORMAT (JSON ONLY):
    {
      "originalText": "string",
      "translatedText": "string",
      "detectedTone": "string"
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              // Crucial: Use the blob's actual type. 
              mimeType: audioBlob.type || 'audio/webm',
              data: base64Audio
            }
          },
          { text: prompt }
        ]
      },
      config: {
        temperature: 0, // CRITICAL: Forces deterministic output
        topK: 1,
        topP: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalText: { type: Type.STRING },
            translatedText: { type: Type.STRING },
            detectedTone: { type: Type.STRING },
          },
          required: ["originalText", "translatedText", "detectedTone"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from Gemini");
    
    return JSON.parse(jsonText) as TranslationResult;

  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};

/**
 * Uses Gemini 2.5 TTS to generate speech from the translated text.
 */
export const generateSpeech = async (
  text: string,
  targetLang: Language
): Promise<ArrayBuffer> => {
  try {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }

    const ai = new GoogleGenAI({ apiKey });

    const safeText = text.trim();
    if (!safeText || safeText === '...') throw new Error("Text is empty or invalid");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [
        { 
          parts: [{ text: safeText }] 
        }
      ],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: targetLang.voiceName || 'Puck'
            }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio generated");
    }

    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;

  } catch (error) {
    console.error("TTS error:", error);
    throw error;
  }
};