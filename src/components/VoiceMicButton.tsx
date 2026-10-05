import React, { useState } from 'react';
import { Mic, Loader2, AlertCircle, Languages, Eye, EyeOff } from 'lucide-react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { TranscriptionResult } from '../services/transcription-service';

interface VoiceMicButtonProps {
  onTranscript: (translatedText: string, result?: TranscriptionResult) => void;
  currentValue?: string;
  className?: string;
  fieldLabel?: string;
}

export const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
  onTranscript,
  currentValue = '',
  className = '',
  fieldLabel,
}) => {
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  const {
    isSupported,
    isListening,
    processingStage,
    error,
    permissionDenied,
    announcement,
    lastResult,
    toggleListening,
  } = useVoiceInput({ onTranscript, currentValue, fieldLabel });

  if (!isSupported) {
    return null; // Hide mic button on unsupported browsers
  }

  if (permissionDenied) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-[#D9A74A] bg-[#D9A74A]/10 px-2 py-0.5 rounded-md border border-[#D9A74A]/30">
        <AlertCircle className="w-3.5 h-3.5 text-[#D9A74A] flex-shrink-0" />
        <span className="font-medium">Microphone access denied — you can still type</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 relative ${className}`}>
      {/* State Announcement for Screen Readers */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {/* Recording Waveform / Indicator Badge */}
      {isListening && (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#B5453F]/15 border border-[#B5453F]/30 text-[#B5453F] text-[11px] font-semibold animate-fadeIn">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B5453F] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B5453F]"></span>
          </span>
          <span>Recording audio…</span>
        </div>
      )}

      {/* Two-Stage Processing Status Indicator */}
      {processingStage === 'transcribing' && (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-[11px] font-medium animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin text-[#22C55E]" />
          <span>Transcribing…</span>
        </div>
      )}

      {processingStage === 'translating' && (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#22C55E]/20 border border-[#22C55E]/40 text-[#22C55E] text-[11px] font-medium animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin text-[#22C55E]" />
          <span>Translating to English…</span>
        </div>
      )}

      {/* Language Detection & Translation Badge */}
      {lastResult && !isListening && !processingStage && (
        <div className="relative inline-flex items-center gap-1.5">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#141416] border border-[#22C55E]/30 text-[#F2F1EC] text-[11px] font-medium">
            <Languages className="w-3 h-3 text-[#22C55E]" />
            <span>
              Detected: <strong className="font-bold text-[#22C55E]">{lastResult.detectedLanguageName}</strong> ({(lastResult.confidenceScore * 100).toFixed(0)}%) → <span className="font-semibold text-[#7A9B7E]">English</span>
            </span>

            {/* Show Original Dictation Toggle */}
            <button
              type="button"
              onClick={() => setShowOriginal(!showOriginal)}
              title="Toggle original dictated text"
              aria-label="Toggle original dictated text"
              className="ml-1 p-0.5 text-[#22C55E] hover:text-[#22C55E] hover:bg-[#22C55E]/20 rounded transition-colors"
            >
              {showOriginal ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>

          {/* Collapsible Original Text Tooltip micro-card */}
          {showOriginal && (
            <div className="absolute right-0 top-7 z-30 w-72 bg-[#141416] text-[#F2F1EC] p-2.5 rounded-xl border border-[#22C55E]/30 shadow-[0_10px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(34,197,94,0.2)] text-[11px] leading-relaxed animate-fadeIn">
              <div className="flex items-center justify-between text-[10px] text-[#A8ABB3] font-bold uppercase mb-1">
                <span>Original Dictated Speech ({lastResult.detectedLanguageName}):</span>
                <span className="text-[#22C55E] font-mono">{(lastResult.confidenceScore * 100).toFixed(0)}% match</span>
              </div>
              <p className="text-[#F2F1EC] font-medium italic">&quot;{lastResult.originalText}&quot;</p>
            </div>
          )}
        </div>
      )}

      {/* Error Tooltip / Badge */}
      {error && !isListening && !processingStage && (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#D9A74A]/10 text-[#D9A74A] border border-[#D9A74A]/30 text-[11px] font-medium">
          <AlertCircle className="w-3 h-3 text-[#D9A74A] flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mic Button */}
      <button
        type="button"
        onClick={toggleListening}
        aria-label={
          isListening
            ? `Stop voice recording${fieldLabel ? ` for ${fieldLabel}` : ''}`
            : `Start voice recording${fieldLabel ? ` for ${fieldLabel}` : ''}`
        }
        className={`relative w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:outline-none ${
          isListening
            ? 'bg-[#B5453F]/20 text-[#B5453F] border border-[#B5453F]/40 shadow-sm'
            : processingStage
            ? 'bg-[#141416] text-[#22C55E] border border-[#22C55E]/30'
            : error
            ? 'bg-[#D9A74A]/20 text-[#D9A74A] border border-[#D9A74A]/40'
            : 'text-[#A8ABB3] hover:text-[#22C55E] hover:bg-[#141416] border border-transparent'
        }`}
      >
        {/* Soft Pulse Halo when Recording */}
        {isListening && (
          <span className="absolute -inset-0.5 rounded-lg bg-[#B5453F]/30 animate-pulse pointer-events-none" />
        )}

        {processingStage ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#22C55E] relative z-10" />
        ) : (
          <Mic className={`w-4 h-4 relative z-10 ${isListening ? 'fill-[#B5453F]/20 text-[#B5453F]' : ''}`} />
        )}
      </button>
    </div>
  );
};
