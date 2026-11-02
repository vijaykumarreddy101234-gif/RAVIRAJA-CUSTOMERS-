import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceDictationButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  title?: string;
  size?: 'sm' | 'md';
}

// Web Speech API interface definitions
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

export const VoiceDictationButton: React.FC<VoiceDictationButtonProps> = ({
  onTranscript,
  className = '',
  title = 'Click to dictate via microphone (Voice-to-Text)',
  size = 'sm',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleListening = () => {
    // Check Web Speech API availability
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusMsg('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      setTimeout(() => setStatusMsg(null), 4000);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      setStatusMsg(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Indian English preset with Hindi/Regional phonetic tolerance

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMsg('Listening... speak now');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (event.results && event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          if (transcript && transcript.trim()) {
            onTranscript(transcript.trim());
            setStatusMsg('✓ Captured');
            setTimeout(() => setStatusMsg(null), 2000);
          }
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setStatusMsg('Microphone blocked. Please allow mic permission.');
        } else if (event.error === 'no-speech') {
          setStatusMsg('No speech detected. Please try speaking again.');
        } else {
          setStatusMsg(`Mic error: ${event.error || 'speech failed'}`);
        }
        setTimeout(() => setStatusMsg(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.warn('Speech recognition initiation error:', err);
      setIsListening(false);
      setStatusMsg('Could not start microphone. Check browser permissions.');
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const isSmall = size === 'sm';

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        className={`relative inline-flex items-center justify-center rounded-xl transition cursor-pointer active:scale-95 ${
          isSmall ? 'p-1.5 text-xs' : 'p-2 text-sm'
        } ${
          isListening
            ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50 animate-pulse border border-rose-400 ring-2 ring-rose-400/50'
            : 'bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-sky-300 border border-slate-800 hover:border-sky-500/50'
        } ${className}`}
        title={isListening ? 'Tap to stop recording' : title}
      >
        {isListening ? (
          <MicOff className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-white`} />
        ) : (
          <Mic className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
        )}
      </button>

      {/* Floating status hint */}
      {statusMsg && (
        <span
          className={`absolute bottom-full mb-1.5 right-0 z-30 whitespace-nowrap px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-xl border animate-fadeIn flex items-center gap-1 ${
            isListening
              ? 'bg-rose-950 text-rose-200 border-rose-500/60'
              : statusMsg.startsWith('✓')
              ? 'bg-emerald-950 text-emerald-200 border-emerald-500/60'
              : 'bg-slate-900 text-amber-300 border-amber-500/50'
          }`}
        >
          {isListening && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping mr-0.5"></span>
          )}
          {!isListening && !statusMsg.startsWith('✓') && (
            <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
          )}
          <span>{statusMsg}</span>
        </span>
      )}
    </div>
  );
};
