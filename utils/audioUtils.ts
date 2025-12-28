export const playAudioBuffer = async (
  audioData: ArrayBuffer,
  existingContext?: AudioContext,
  onStart?: (ctx: AudioContext, src: AudioBufferSourceNode) => void
): Promise<void> => {
  // Gemini TTS returns raw PCM at 24kHz
  const SAMPLE_RATE = 24000;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  
  // Use existing context (crucial for iOS) or create new one
  const audioContext = existingContext || new AudioContextClass({ sampleRate: SAMPLE_RATE });

  // Safety resume if suspended (iOS requirement)
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  
  try {
    const pcm16 = new Int16Array(audioData);
    const audioBuffer = audioContext.createBuffer(1, pcm16.length, SAMPLE_RATE);
    const channelData = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < pcm16.length; i++) {
        channelData[i] = pcm16[i] / 32768.0;
    }

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    if (onStart) {
        onStart(audioContext, source);
    }

    return new Promise((resolve) => {
      source.onended = () => {
        resolve();
        // We DO NOT close the context here if it was passed in, 
        // because we want to reuse it for the next turn to keep iOS happy.
        if (!existingContext && audioContext.state !== 'closed') {
           audioContext.close();
        }
      };
      source.start(0);
    });
  } catch (e) {
    console.error("Error playing audio", e);
    if (!existingContext && audioContext.state !== 'closed') {
        audioContext.close();
    }
  }
};