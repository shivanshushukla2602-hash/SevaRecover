import { useState, useEffect, useRef, useCallback } from 'react';
import {
  processServerSideTranscription,
  TranscriptionResult,
  ProcessingStage,
} from '../services/transcription-service';

export interface UseVoiceInputOptions {
  onTranscript: (translatedText: string, result?: TranscriptionResult) => void;
  currentValue?: string;
  fieldLabel?: string;
}

export function useVoiceInput({
  onTranscript,
  currentValue = '',
  fieldLabel = '',
}: UseVoiceInputOptions) {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<string>('');
  const [lastResult, setLastResult] = useState<TranscriptionResult | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const currentValueRef = useRef<string>(currentValue);

  useEffect(() => {
    currentValueRef.current = currentValue;
  }, [currentValue]);

  // Feature detection for MediaRecorder & MediaDevices
  useEffect(() => {
    const hasMediaDevices =
      typeof window !== 'undefined' &&
      !!navigator.mediaDevices &&
      !!navigator.mediaDevices.getUserMedia &&
      typeof MediaRecorder !== 'undefined';

    if (!hasMediaDevices) {
      setIsSupported(false);
    }
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping MediaRecorder:', e);
      }
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    if (!isSupported) return;
    if (permissionDenied) return;

    setError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stopStream();
        setIsListening(false);

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        if (audioBlob.size === 0) {
          setError('No audio recorded. Please try again.');
          setAnnouncement('No audio recorded.');
          return;
        }

        try {
          setAnnouncement('Audio captured. Sending to Amazon Transcribe...');

          const result = await processServerSideTranscription(
            audioBlob,
            (stage) => setProcessingStage(stage),
            fieldLabel
          );

          setProcessingStage(null);

          if (result.confidenceScore < 0.5) {
            setError("Couldn't confidently detect the language — try again or type directly");
            setAnnouncement("Couldn't confidently detect the language.");
            return;
          }

          setLastResult(result);

          // Append translated text to existing text with a space
          const existing = currentValueRef.current.trim();
          const appended = existing
            ? `${existing} ${result.translatedText.trim()}`
            : result.translatedText.trim();

          onTranscript(appended, result);
          setAnnouncement(
            `Speech transcribed from ${result.detectedLanguageName} and translated to English.`
          );
        } catch (err) {
          console.error('Transcription error:', err);
          setProcessingStage(null);
          setError('Failed to transcribe audio. Please try again.');
          setAnnouncement('Transcription error.');
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      setAnnouncement('Recording started. Speak now in any language...');
    } catch (err: any) {
      console.warn('Microphone permission error:', err);
      setIsListening(false);
      setPermissionDenied(true);
      setError('Microphone access denied — you can still type');
      setAnnouncement('Microphone access denied. You can still type.');
    }
  }, [isSupported, permissionDenied, fieldLabel, onTranscript, stopStream]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    processingStage,
    error,
    permissionDenied,
    announcement,
    lastResult,
    toggleListening,
    stopListening,
  };
}
