import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';

interface ReadAloudButtonProps {
  textToRead: string;
}

export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({ textToRead }) => {
  const { language, t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getLangTag = (lang: Language): string => {
    switch (lang) {
      case 'hi': return 'hi-IN';
      case 'kn': return 'kn-IN';
      case 'te': return 'te-IN';
      default: return 'en-IN';
    }
  };

  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech read aloud is not supported in this browser environment.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = getLangTag(language);
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <button
      onClick={handleToggleSpeak}
      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 ${
        isSpeaking
          ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
          : 'bg-white text-brand-800 border-brand-200 hover:bg-brand-50 shadow-civic-sm'
      }`}
      title="Native Web Speech API Read Aloud"
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-4 h-4 text-amber-700 shrink-0" />
          {/* Animated Equalizer Waveform Bars */}
          <div className="flex items-center gap-0.5 h-3">
            <motion.span animate={{ height: ['4px', '12px', '4px'] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 bg-amber-700 rounded-full" />
            <motion.span animate={{ height: ['12px', '4px', '12px'] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-0.5 bg-amber-700 rounded-full" />
            <motion.span animate={{ height: ['6px', '14px', '6px'] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-amber-700 rounded-full" />
          </div>
          <span>{t('readAloudStop')}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 text-brand-600" />
          <span>{t('readAloud')}</span>
        </>
      )}
    </button>
  );
};
