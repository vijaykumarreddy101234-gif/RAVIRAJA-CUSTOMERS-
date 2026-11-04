import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceDictationButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  title?: string;
  size?: 'sm' | 'md';
  variant?: 'default' | 'ghost';
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
  variant = 'default',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusMsg('Speech recognition not supported in browser');
      setTimeout(() => setStatusMsg(null), 3000);
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
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMsg('Listening...');
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
        setStatusMsg(event.error === 'not-allowed' ? 'Mic permission blocked' : 'Voice failed');
        setTimeout(() => setStatusMsg(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const isSmall = size === 'sm';

  const defaultClasses = isListening
    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50 animate-pulse border border-rose-400'
    : 'bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-sky-300 border border-slate-800';

  const ghostClasses = isListening
    ? 'text-rose-400 animate-pulse scale-110'
    : 'text-slate-400 hover:text-white transition-colors';

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        className={`relative inline-flex items-center justify-center rounded-xl transition cursor-pointer active:scale-90 ${
          isSmall ? 'p-1.5' : 'p-2'
        } ${variant === 'ghost' ? ghostClasses : defaultClasses} ${className}`}
        title={isListening ? 'Tap to stop recording' : title}
      >
        {isListening ? (
          <MicOff className={`${isSmall ? 'w-4 h-4' : 'w-5 h-5'} text-rose-400`} />
        ) : (
          <Mic className={`${isSmall ? 'w-4 h-4' : 'w-5 h-5'}`} />
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
