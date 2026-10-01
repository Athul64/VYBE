import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isSupported, setIsSupported] = useState(false);
  const synthRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      setIsSupported(true);
    }
  }, []);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setCurrentStepIndex(-1);
    }
  }, []);

  const speakText = useCallback((text, onEnd) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const cleanText = text.replace(/[⚠️☂️☀️\(\)]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Choose natural English voice if available
    const voices = synthRef.current.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, []);

  const speakSteps = useCallback((steps) => {
    if (!synthRef.current || !steps || steps.length === 0) return;
    stop();

    let index = 0;
    const playNext = () => {
      if (index < steps.length) {
        setCurrentStepIndex(index);
        const stepText = `Step ${index + 1}: ${steps[index]}`;
        index += 1;
        speakText(stepText, playNext);
      } else {
        setCurrentStepIndex(-1);
        setIsSpeaking(false);
      }
    };

    playNext();
  }, [speakText, stop]);

  return {
    isSupported,
    isSpeaking,
    currentStepIndex,
    speakText,
    speakSteps,
    stop
  };
};
