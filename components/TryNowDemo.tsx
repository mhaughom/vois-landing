import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, AlertCircle, CheckCircle } from 'lucide-react';
import {
  setDemoRecording,
  setDemoProcessing,
  setDemoAudioLevels,
  setDemoCountdown,
  setDemoResults,
  setDemoError,
  setDemoElapsed,
  setDemoTip,
  getDemoState,
  setDemoWaitingToStart,
  setDemoActiveDevice,
  setOnPhoneRecordClick,
  setOnWatchRecordClick,
} from './DeviceScene';

// API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'https://api.vois.app';

// Did you know tips for processing state (exported for DeviceScene)
export const DEMO_TIPS = [
  "VOIS remembers everything you capture — forever searchable",
  "Ask 'What did I say about the project?' and VOIS finds it instantly",
  "Your thoughts become tasks, events, and ideas — automatically",
  "VOIS works on Apple Watch, iPhone, and desktop",
  "Never lose a shower thought again",
  "VOIS can spot patterns: 'Why have I been getting headaches?'",
];

// Category colors for extracted items
const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  task: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-700' },
  event: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-700' },
  reminder: { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-700' },
  idea: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-700' },
  note: { bg: 'bg-slate-50', border: 'border-slate-400', text: 'text-slate-700' },
  default: { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-600' },
};

export type DemoStage = 'idle' | 'waiting' | 'recording' | 'processing' | 'results' | 'error';

interface ExtractedItem {
  type: string;
  rawText: string;
  content: string;
  icon: string;
}

interface Highlight {
  text: string;
  start: number;
  end: number;
  category: string;
  color: string;
}

interface ApiResponse {
  transcript: string;
  duration: number;
  highlights: Highlight[];
  items: ExtractedItem[];
}

interface TryNowDemoProps {
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onStageChange?: (stage: DemoStage, controls: { stopRecording: () => void; reset: () => void }) => void;
  hasCompletedDemo?: boolean;
}

// Suggestions to show during recording
const RECORDING_SUGGESTIONS = [
  "a task you need to do",
  "an idea you want to remember",
  "something you're grateful for",
  "items for your shopping list",
  "a quote that inspired you",
  "research you want to explore",
  "an event coming up",
  "a reminder for later",
];

// Separate component for the step instructions
export const DemoSteps: React.FC<{
  stage: DemoStage;
  onStopRecording?: () => void;
  onReset?: () => void;
}> = ({ stage, onStopRecording, onReset }) => {
  const [currentSuggestion, setCurrentSuggestion] = useState(0);

  // Cycle through suggestions during recording
  useEffect(() => {
    if (stage !== 'recording') {
      setCurrentSuggestion(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % RECORDING_SUGGESTIONS.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [stage]);

  if (stage === 'idle' || stage === 'error') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-start gap-4 mt-8"
    >
      {/* Step 1 - Always visible once waiting starts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <span className={`font-serif text-xl md:text-2xl ${stage === 'waiting' ? 'text-slate-900' : 'text-slate-400'}`}>
          <span className="text-slate-400 mr-2">1.</span>
          Tap record on your phone or watch
        </span>
        {stage !== 'waiting' && <CheckCircle size={20} className="text-green-500" />}
      </motion.div>

      {/* Step 2 - Visible from recording onwards */}
      {(stage === 'recording' || stage === 'processing' || stage === 'results') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-3">
            <span className={`font-serif text-xl md:text-2xl ${stage === 'recording' ? 'text-slate-900' : 'text-slate-400'}`}>
              <span className="text-slate-400 mr-2">2.</span>
              Talk about your thoughts
            </span>
            {stage !== 'recording' && <CheckCircle size={20} className="text-green-500" />}
            {stage === 'recording' && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-3 h-3 rounded-full bg-red-500 ml-1"
              />
            )}
          </div>

          {/* Cycling suggestions - only during recording */}
          {stage === 'recording' && (
            <AnimatePresence mode="wait">
              <motion.p
                key={currentSuggestion}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="text-slate-400 text-base md:text-lg ml-8 italic"
              >
                Try mentioning {RECORDING_SUGGESTIONS[currentSuggestion]}...
              </motion.p>
            </AnimatePresence>
          )}
        </motion.div>
      )}

      {/* Step 3 - Visible from processing onwards */}
      {(stage === 'processing' || stage === 'results') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <span className={`font-serif text-xl md:text-2xl ${stage === 'processing' ? 'text-slate-900' : 'text-slate-400'}`}>
            <span className="text-slate-400 mr-2">3.</span>
            Watch the AI organize your thoughts
          </span>
          {stage === 'processing' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full" />
            </motion.div>
          )}
          {stage === 'results' && <CheckCircle size={20} className="text-green-500" />}
        </motion.div>
      )}

      {/* Step 4 - Now you can try chat - Visible only after results */}
      {stage === 'results' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-1"
        >
          <span className="font-serif text-xl md:text-2xl text-slate-900">
            <span className="text-slate-400 mr-2">4.</span>
            Try your personal ChatGPT
          </span>
          <span className="text-slate-400 text-sm ml-7">
            Tap the ✦ icon at the bottom left of the phone
          </span>
        </motion.div>
      )}

      {/* Stop button during recording */}
      {stage === 'recording' && onStopRecording && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onStopRecording}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition-all mt-2"
        >
          <Square size={12} className="fill-current" />
          <span>Stop Recording</span>
        </motion.button>
      )}

      {/* Cancel button when waiting */}
      {stage === 'waiting' && onReset && (
        <button
          onClick={onReset}
          className="text-slate-400 hover:text-slate-600 text-sm"
        >
          Cancel
        </button>
      )}
    </motion.div>
  );
};

export const TryNowDemo: React.FC<TryNowDemoProps> = ({ onStartRecording, onStopRecording, onStageChange, hasCompletedDemo }) => {
  const [stage, setStageInternal] = useState<DemoStage>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [results, setResults] = useState<ApiResponse | null>(null);

  // Store control functions in refs so they can be passed to parent
  const stopRecordingRef = useRef<() => void>(() => {});
  const resetRef = useRef<() => void>(() => {});

  // Wrapper to set stage and notify parent
  const setStage = (newStage: DemoStage) => {
    setStageInternal(newStage);
  };

  // Notify parent of stage changes with controls
  useEffect(() => {
    onStageChange?.(stage, {
      stopRecording: () => stopRecordingRef.current(),
      reset: () => resetRef.current(),
    });
  }, [stage, onStageChange]);

  // Refs for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setDemoRecording(false);
    setDemoProcessing(false);
    setDemoAudioLevels(new Array(24).fill(0.1));
    setDemoElapsed(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      setOnPhoneRecordClick(null);
      setOnWatchRecordClick(null);
    };
  }, [cleanup]);

  // Store startRecording in a ref so the callback always has the latest version
  const startRecordingRef = useRef<() => void>(() => {});

  // Register the phone and watch record button callbacks
  useEffect(() => {
    if (stage === 'waiting') {
      // During initial demo - both phone and watch can start recording
      setOnPhoneRecordClick(() => {
        startRecordingRef.current();
      });
      setOnWatchRecordClick(() => {
        startRecordingRef.current();
      });
    } else if (hasCompletedDemo && stage === 'idle') {
      // After demo completion - only watch can start recording (quick capture mode)
      setOnPhoneRecordClick(null);
      setOnWatchRecordClick(() => {
        // Set active device to watch and start recording
        setDemoActiveDevice('watch');
        startRecordingRef.current();
      });
    } else {
      setOnPhoneRecordClick(null);
      setOnWatchRecordClick(null);
    }
  }, [stage, hasCompletedDemo]);

  // Enter waiting mode - show record buttons on devices
  const enterWaitingMode = () => {
    setStage('waiting');
    setDemoWaitingToStart(true);
  };

  // Rotate tips during processing and sync with device scene
  useEffect(() => {
    if (stage !== 'processing') return;

    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => {
        const next = (prev + 1) % DEMO_TIPS.length;
        setDemoTip(DEMO_TIPS[next]); // Sync with device scene
        return next;
      });
    }, 2500);

    // Set initial tip
    setDemoTip(DEMO_TIPS[currentTip]);

    return () => clearInterval(tipInterval);
  }, [stage]);

  // Update audio levels visualization
  const updateAudioLevels = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Map frequency data to 24 bars
    const bars = 24;
    const levels: number[] = [];
    const binSize = Math.floor(dataArray.length / bars);

    for (let i = 0; i < bars; i++) {
      let sum = 0;
      const start = i * binSize;
      for (let j = 0; j < binSize; j++) {
        sum += dataArray[start + j];
      }
      const avg = sum / binSize / 255; // Normalize to 0-1
      levels.push(avg);
    }

    setDemoAudioLevels(levels);

    if (getDemoState().isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevels);
    }
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      // Set up Web Audio API for visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Set up MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        processRecording();
      };

      // Start recording
      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setStage('recording');
      setElapsedTime(0);
      setDemoWaitingToStart(false); // Clear waiting state
      setDemoRecording(true);
      setDemoElapsed(0);
      onStartRecording?.();

      // Start audio visualization
      updateAudioLevels();

      // Start count-up timer (stops at 30 seconds)
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 1;
          setDemoElapsed(newTime);

          if (newTime >= 30) {
            stopRecording();
          }

          return newTime;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Please allow microphone access to try VOIS');
      } else {
        setErrorMessage('Could not access microphone. Please try again.');
      }
      setStage('error');
      setDemoError('microphone_denied');
    }
  };

  // Keep the ref updated with the latest startRecording function
  startRecordingRef.current = startRecording;

  // Stop recording - also update ref for parent access
  const stopRecording = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setDemoRecording(false);
    onStopRecording?.();
  }, [onStopRecording]);

  // Keep stopRecording ref updated
  stopRecordingRef.current = stopRecording;

  // Process the recording
  const processRecording = async () => {
    setStage('processing');
    setDemoProcessing(true);
    setDemoAudioLevels(new Array(24).fill(0.3)); // Subtle processing animation
    setDemoTip(DEMO_TIPS[0]); // Set initial tip for device scene

    try {
      // Create blob from chunks
      const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
      const audioBlob = new Blob(chunksRef.current, { type: mimeType });

      // Check if we have any audio data
      if (audioBlob.size < 1000) {
        throw new Error('Recording too short');
      }

      // Create FormData
      const formData = new FormData();
      const extension = mimeType.includes('webm') ? 'webm' : mimeType.includes('mp4') ? 'm4a' : 'wav';
      formData.append('audio', audioBlob, `recording.${extension}`);

      // Send to API
      console.log('[VOIS Demo] Sending request to:', `${API_URL}/api/demo/extract`);
      console.log('[VOIS Demo] Audio blob size:', audioBlob.size, 'bytes');

      const response = await fetch(`${API_URL}/api/demo/extract`, {
        method: 'POST',
        body: formData,
      });

      console.log('[VOIS Demo] Response status:', response.status);

      // Rate limit check disabled for debugging
      // if (response.status === 429) {
      //   setErrorMessage("You've used your 3 free tries. Sign up to continue using VOIS.");
      //   setStage('error');
      //   setDemoError('rate_limited');
      //   setDemoProcessing(false);
      //   return;
      // }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[VOIS Demo] API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data: ApiResponse = await response.json();

      setResults(data);
      setDemoResults({
        transcript: data.transcript,
        highlights: data.highlights,
        items: data.items,
      });
      setStage('results');
    } catch (err: any) {
      console.error('[VOIS Demo] Processing error:', err);
      console.error('[VOIS Demo] Error details:', err.message);
      setErrorMessage(`API Error: ${err.message || 'Something went wrong. Please try again.'}`);
      setStage('error');
      setDemoError('api_error');
    } finally {
      setDemoProcessing(false);
      setDemoAudioLevels(new Array(24).fill(0.1));
      setDemoTip('');
    }
  };

  // Reset to try again
  const reset = () => {
    cleanup();
    setStage('idle');
    setElapsedTime(0);
    setResults(null);
    setErrorMessage('');
    setDemoError(null);
    setDemoTip('');
    setDemoWaitingToStart(false);
    setDemoActiveDevice(null);
  };

  // Keep reset ref updated
  resetRef.current = reset;

  // Scroll to pricing
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {/* IDLE STATE - Show "Try Now" or "Get Early Access" based on completion */}
        {stage === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            {hasCompletedDemo ? (
              /* After demo completion - Show "Get Early Access" with pastel gradient */
              <motion.button
                onClick={scrollToPricing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative pl-6 pr-8 py-3 rounded-full text-base font-medium flex items-center justify-center gap-3 shadow-lg shadow-violet-100/50 border border-white/60 hover:border-white/80 transition-all overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(251,245,255,0.9) 25%, rgba(245,250,255,0.9) 50%, rgba(255,250,245,0.9) 75%, rgba(255,255,255,0.95) 100%)',
                }}
              >
                {/* Subtle animated gradient overlay */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.15), rgba(129,140,248,0.15), rgba(251,191,36,0.1), transparent)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '200% 0%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                <span className="relative z-10 font-semibold text-slate-900">Get Early Access</span>
                {/* Scarcity badge */}
                <span className="relative z-10 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-900/10 text-slate-700">
                  100 left
                </span>
              </motion.button>
            ) : (
              /* First time - Show "Try Now" */
              <>
                <motion.button
                  onClick={enterWaitingMode}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-slate-100 text-slate-900 pl-4 pr-8 py-3 rounded-full text-base font-medium flex items-center justify-center gap-3 shadow-lg shadow-black/5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <span className="flex items-center justify-center w-9 h-9 bg-slate-900 rounded-full">
                    <Mic size={14} className="text-white" />
                  </span>
                  <span className="font-medium">Try Now</span>
                </motion.button>
                <span className="text-slate-400 text-xs mt-1.5">Speak for 30 seconds</span>
              </>
            )}
          </motion.div>
        )}

        {/* ERROR STATE - Compact */}
        {stage === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <div className="bg-red-50 text-red-700 px-6 py-3 rounded-full text-sm font-medium flex items-center gap-2 border border-red-200">
              <AlertCircle size={16} />
              <span className="max-w-[200px] truncate">{errorMessage}</span>
            </div>

            <motion.button
              onClick={reset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-full transition-colors"
              title="Try Again"
            >
              <RefreshCw size={18} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TryNowDemo;
