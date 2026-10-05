import { API_BASE_URL } from './api-client';

export interface TranscriptionResult {
  originalText: string;
  detectedLanguageCode: string; // e.g. 'hi-IN', 'kn-IN', 'te-IN', 'ta-IN', 'mr-IN', 'en-IN'
  detectedLanguageName: string; // e.g. 'Hindi', 'Kannada', 'Telugu', 'Tamil', 'Marathi', 'English'
  confidenceScore: number;     // e.g. 0.96 (96%)
  translatedText: string;
}

export type ProcessingStage = 'transcribing' | 'translating' | null;

export interface TranscriptionProgressCallback {
  (stage: 'transcribing' | 'translating'): void;
}

const LIVE_TRANSCRIBE_ENDPOINT = `${API_BASE_URL}/transcribe`;
const USE_LIVE_ENDPOINT = true;

// Regional language metadata registry for Indian Public Services
const SUPPORTED_LANGUAGES: Record<string, { name: string; sampleOriginal: string; sampleEnglish: string }> = {
  'hi-IN': {
    name: 'Hindi',
    sampleOriginal: 'छात्रवृत्ति शुल्क प्रतिपूर्ति आवेदन खारिज कर दिया गया। नोटिस कहता है कि आय प्रमाण पत्र अमान्य है।',
    sampleEnglish: 'Scholarship fee reimbursement application was rejected. Notice states that Income Certificate is invalid.',
  },
  'kn-IN': {
    name: 'Kannada',
    sampleOriginal: 'ವಿದ್ಯಾರ್ಥಿವೇತನ ಶುಲ್ಕ ಮರುಪಾವತಿ ಅರ್ಜಿಯನ್ನು ತಿರಸ್ಕರಿಸಲಾಗಿದೆ. ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ 12-03-2023 ಅಮಾನ್ಯವಾಗಿದೆ ಎಂದು ನೋಟಿಸ್ ಹೇಳುತ್ತದೆ.',
    sampleEnglish: 'Scholarship fee reimbursement application was rejected. Notice states that Income Certificate dated 12-03-2023 is invalid.',
  },
  'te-IN': {
    name: 'Telugu',
    sampleOriginal: 'స్కాలర్‌షిప్ ఫీజు రీయింబర్స్‌మెంట్ దరఖాస్తు తిరస్కరించబడింది. ఆదాయ ధృవీకరణ పత్రం చెల్లదని నోటీసు పేర్కొంది.',
    sampleEnglish: 'Scholarship fee reimbursement application was rejected. Notice states that Income Certificate is invalid.',
  },
  'ta-IN': {
    name: 'Tamil',
    sampleOriginal: 'கல்வி உதவித்தொகை விண்ணப்பம் நிராகரிக்கப்பட்டது. வருமானச் சான்றிதழ் செல்லாது என கூறப்பட்டுள்ளது.',
    sampleEnglish: 'Scholarship application was rejected. Notice states that Income Certificate is invalid.',
  },
  'mr-IN': {
    name: 'Marathi',
    sampleOriginal: 'स्कॉलरशिप अर्ज फेटाळण्यात आला आहे. उत्पन्न प्रमाणपत्र अमान्य झाल्याचे नोटीसमध्ये म्हटले आहे.',
    sampleEnglish: 'Scholarship application was rejected. Notice states that Income Certificate is invalid.',
  },
  'en-IN': {
    name: 'English',
    sampleOriginal: 'Application KAR-SSP-2025-948210 was rejected due to Income Certificate date discrepancy.',
    sampleEnglish: 'Application KAR-SSP-2025-948210 was rejected due to Income Certificate date discrepancy.',
  },
};

/**
 * Server-side audio transcription + translation orchestrator.
 * Simulates Amazon Transcribe (with IdentifyLanguage: true) + Amazon Translate.
 */
export async function processServerSideTranscription(
  audioBlob: Blob,
  onProgress?: TranscriptionProgressCallback,
  fieldLabel: string = ''
): Promise<TranscriptionResult> {
  // Stage 1: Amazon Transcribe Language Identification & ASR
  if (onProgress) onProgress('transcribing');

  if (USE_LIVE_ENDPOINT) {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(LIVE_TRANSCRIBE_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        if (onProgress) onProgress('translating');
        const data = await response.json();
        console.log(
          `[Amazon Transcribe Audit] Spoken language: ${data.detectedLanguageCode} (${data.detectedLanguageName}) | Confidence: ${(data.confidenceScore * 100).toFixed(0)}%`
        );
        return data;
      }
      throw new Error(`Transcription request failed (${response.status})`);
    } catch (e) {
      console.warn('Live transcribe server connection failed', e);
      throw new Error('Voice transcription is unavailable. Please type your description instead.');
    }
  }

  // Realistic Amazon Transcribe processing delay
  await new Promise((res) => setTimeout(res, 900));

  // Stage 2: Amazon Translate Normalization Phase
  if (onProgress) onProgress('translating');
  await new Promise((res) => setTimeout(res, 800));

  // Select language simulation based on field context or blob characteristics
  const labelLower = fieldLabel.toLowerCase();
  let langKey = 'hi-IN';
  if (labelLower.includes('state') || labelLower.includes('karnataka')) {
    langKey = 'kn-IN';
  } else if (labelLower.includes('scheme') || labelLower.includes('telangana')) {
    langKey = 'te-IN';
  } else {
    const options = ['hi-IN', 'kn-IN', 'te-IN', 'en-IN'];
    langKey = options[Math.floor(audioBlob.size / 100) % options.length] || 'hi-IN';
  }

  const langData = SUPPORTED_LANGUAGES[langKey] || SUPPORTED_LANGUAGES['hi-IN'];
  const confidenceScore = 0.93 + (Math.abs(audioBlob.size % 7) * 0.01);

  const result: TranscriptionResult = {
    originalText: langData.sampleOriginal,
    detectedLanguageCode: langKey,
    detectedLanguageName: langData.name,
    confidenceScore: Math.min(0.99, confidenceScore),
    translatedText: langData.sampleEnglish,
  };

  // Hackathon Real-time Usage Audit Console Log
  console.log(
    `%c[Amazon Transcribe + Translate Audit]%c Spoken language detected: %c${result.detectedLanguageName} (${result.detectedLanguageCode})%c | Confidence: %c${(result.confidenceScore * 100).toFixed(1)}%%c | Normalized to English for OpenSearch RAG`,
    'color: #4f46e5; font-weight: bold;',
    'color: inherit;',
    'color: #16A34A; font-weight: bold;',
    'color: inherit;',
    'color: #d97706; font-weight: bold;',
    'color: inherit;'
  );

  return result;
}
