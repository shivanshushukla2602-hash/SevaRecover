import React, { useState, useRef, useEffect } from 'react';
import { Mic, Languages, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', name: 'English (India)' },
  { code: 'hi-IN', name: 'Hindi (हिन्दी)' },
  { code: 'te-IN', name: 'Telugu (తెలుగు)' },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
  { code: 'mr-IN', name: 'Marathi (मराठी)' },
  { code: 'bn-IN', name: 'Bengali (বাংলা)' },
  { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml-IN', name: 'Malayalam (മലയാളം)' },
];

export default function VoiceAssistant({ onTextUpdate }: { onTextUpdate: (text: string) => void }) {
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [transcript, setTranscript] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript((prev) => {
          const newText = (prev + ' ' + currentTranscript).trim();
          onTextUpdate(newText);
          return newText;
        });
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access blocked. Please allow browser permissions.');
        } else {
          setErrorMsg(`Voice input error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onTextUpdate]);

  const toggleListening = () => {
    setErrorMsg('');
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = selectedLang;
        setTranscript('');
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          setErrorMsg('Microphone already in use or blocked.');
        }
      } else {
        setErrorMsg('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      }
    }
  };

  return (
    <div className="flex flex-col mt-4 space-y-2">
      {errorMsg && (
        <div className="text-brick-400 bg-brick-500/10 p-3 rounded-lg text-xs flex items-center gap-2 border border-brick-500/20">
          <AlertCircle size={15} /> {errorMsg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-[#1C1D21] border border-[rgba(34,197,94,0.2)] rounded-xl">
        {/* Language Selection Dropdown */}
        <div className="relative w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex justify-between items-center gap-2 bg-[#141416] border border-white/10 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#F8FAFC] hover:border-[#22C55E]/40 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <Languages size={15} className="text-[#22C55E]" />
              <span>{SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang)?.name}</span>
            </div>
            <span className="text-[10px] text-[#A8ABB3]">▼</span>
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute bottom-full mb-2 left-0 w-full sm:w-56 bg-[#141416] border border-[#22C55E]/30 shadow-xl rounded-xl overflow-hidden z-50 p-1"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setSelectedLang(lang.code);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                      selectedLang === lang.code
                        ? 'text-[#22C55E] font-bold bg-[#22C55E]/15 border border-[#22C55E]/20'
                        : 'text-[#A8ABB3] hover:text-[#F8FAFC] hover:bg-white/5'
                    }`}
                  >
                    <span>{lang.name}</span>
                    {selectedLang === lang.code && <Check size={14} className="text-[#22C55E]" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live Mic Button */}
        <button
          type="button"
          onClick={toggleListening}
          className={`cursor-pointer w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all border shadow-sm ${
            isListening
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30 animate-pulse'
              : 'bg-[#22C55E] text-[#0A0A0B] border-[#22C55E] hover:bg-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.2)]'
          }`}
        >
          {isListening ? (
            <span className="flex items-center justify-center gap-2">
              <span className="flex items-center gap-0.5">
                <span className="w-1 h-3 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-4 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1 h-3 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
              <span>Stop Dictation</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Mic size={15} /> <span>Speak to Type (Live Dictation)</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
