import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';
import {
  setDemoRecording,
  setDemoProcessing,
  setDemoStreaming,
  setDemoAudioLevels,
  setDemoCountdown,
  setDemoResults,
  setDemoError,
  setDemoElapsed,
  setDemoTip,
  getDemoState,
  setDemoWaitingToStart,
  setDemoActiveDevice,
  setDemoFirstCardReceived,
  setOnPhoneRecordClick,
  setOnWatchRecordClick,
  setOnStopRecordClick,
} from './deviceState';

import { Analytics } from '../lib/analytics';
import { DemoWebSocketManager, WSMessage } from '../lib/websocketManager';
import { MockDemoWebSocket } from '../lib/mockWebSocket';
import { DeepgramStreamingManager } from '../lib/deepgramStreamingManager';

// API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'https://api.vois.app';

// Feature flag for streaming (can be enabled via environment variable)
const ENABLE_STREAMING = import.meta.env.VITE_ENABLE_STREAMING === 'true';

// Did you know tips for processing state (exported for DeviceScene)
export const DEMO_TIPS = [
  "VOIS remembers everything you capture — forever searchable",
  "Ask 'What did I say about the project?' and VOIS finds it instantly",
  "Your thoughts become tasks, events, and ideas — automatically",
  "VOIS works on Apple Watch, iPhone, and desktop",
  "Never lose a shower thought again",
  "VOIS can spot patterns: 'Why have I been getting headaches?'",
];

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
  onStageChange?: (stage: DemoStage, controls: { stopRecording: () => void; reset: () => void; startNew: () => void }, isRecording?: boolean) => void;
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
  chatOpened?: boolean;
  chatMessageCount?: number;
  allCardsVerified?: boolean;
}> = ({ stage, onStopRecording, onReset, chatOpened, chatMessageCount = 0, allCardsVerified = false }) => {
  const isMobile = useIsMobile();
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  const [demoPhase, setDemoPhase] = useState<'steps' | 'question' | 'chat'>('steps');

  // Check actual recording state from global state
  const demoState = getDemoState();
  const isActuallyRecording = demoState.isRecording;
  const hasReceivedFirstCard = demoState.hasReceivedFirstCard;

  // Cycle through suggestions during recording (including streaming mode)
  useEffect(() => {
    // Show suggestions during recording or during streaming mode before first card
    const shouldShowSuggestions = (stage === 'recording' || (stage === 'results' && !hasReceivedFirstCard));

    if (!shouldShowSuggestions) {
      setCurrentSuggestion(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % RECORDING_SUGGESTIONS.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [stage, hasReceivedFirstCard]);

  // Reset states when a new recording starts
  useEffect(() => {
    if (stage === 'recording' || stage === 'waiting') {
      setDemoPhase('steps');
    }
  }, [stage]);

  if (stage === 'idle' || stage === 'error') return null;

  // Derived state for Phase 3 sub-steps
  const hasSentTwoMessages = chatMessageCount >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center sm:items-start gap-3 sm:gap-4 mt-6 sm:mt-8 w-full"
    >
      {/* Recording indicator with countdown and stop button */}
      {isActuallyRecording && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-red-500"
            />
            <span className="text-red-600 text-sm font-medium">
              Recording... {demoState.elapsed}s / 30s
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStopRecording}
            className="px-4 py-2 rounded-full text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-all duration-200"
          >
            Stop
          </motion.button>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* Phase 1: Recording steps 1-3 + "Cool, show me more" */}
        {demoPhase === 'steps' && (
          <motion.div
            key="initial-steps"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center sm:items-start gap-3 sm:gap-4 w-full"
          >
            {/* Step 1 - Mobile: only during waiting. Desktop: always visible */}
            {(!isMobile || stage === 'waiting') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <span className={`font-serif text-lg sm:text-xl md:text-2xl ${stage === 'waiting' ? 'text-slate-900' : 'text-slate-400'}`}>
                  <span className="text-slate-400 mr-2">1.</span>
                  Tap record on the phone or watch
                </span>
                {stage !== 'waiting' && <CheckCircle size={18} className="text-green-500 flex-shrink-0" />}
              </motion.div>
            )}

            {/* Step 2 - Mobile: during recording or streaming results. Desktop: recording onwards */}
            {(isMobile ? (stage === 'recording' || (stage === 'results' && isActuallyRecording)) : (stage === 'recording' || stage === 'processing' || stage === 'results')) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 items-center sm:items-start"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className={`font-serif text-lg sm:text-xl md:text-2xl ${((stage === 'recording' || stage === 'results') && !hasReceivedFirstCard) ? 'text-slate-900' : 'text-slate-400'}`}>
                    <span className="text-slate-400 mr-2">2.</span>
                    Talk about your thoughts
                  </span>
                  {hasReceivedFirstCard && <CheckCircle size={18} className="text-green-500 flex-shrink-0" />}
                  {((stage === 'recording' || stage === 'results') && !hasReceivedFirstCard) && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-red-500 ml-1 flex-shrink-0"
                    />
                  )}
                </div>

                {/* Cycling suggestions - only during recording and before first card */}
                {((stage === 'recording' || stage === 'results') && !hasReceivedFirstCard) && (
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentSuggestion}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className="text-slate-400 text-sm sm:text-base md:text-lg sm:ml-8 italic max-w-[280px] sm:max-w-none"
                    >
                      Try mentioning {RECORDING_SUGGESTIONS[currentSuggestion]}...
                    </motion.p>
                  </AnimatePresence>
                )}
              </motion.div>
            )}

            {/* Step 3 - Only visible after first card received OR during processing */}
            {((stage === 'processing') || (stage === 'results' && hasReceivedFirstCard)) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 sm:gap-3"
              >
                <span className={`font-serif text-lg sm:text-xl md:text-2xl ${stage === 'processing' ? 'text-slate-900' : 'text-slate-400'}`}>
                  <span className="text-slate-400 mr-2">3.</span>
                  Watch AI organize your thoughts
                </span>
                {stage === 'processing' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full flex-shrink-0" />
                  </motion.div>
                )}
                {stage === 'results' && hasReceivedFirstCard && <CheckCircle size={18} className="text-green-500 flex-shrink-0" />}
              </motion.div>
            )}

            {/* Action buttons - visible after results AND recording stopped */}
            {stage === 'results' && !isActuallyRecording && hasReceivedFirstCard && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-2 flex items-center gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDemoPhase('question')}
                  className="px-8 py-3 rounded-full text-base font-medium bg-slate-900 text-white shadow-lg shadow-black/10 hover:bg-slate-800 transition-all duration-200"
                >
                  Cool, show me more
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onReset}
                  className="px-8 py-3 rounded-full text-base font-medium bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900 transition-all duration-200"
                >
                  Try Again
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Phase 2: Question — "Want to try the AI?" with Yes / No */}
        {demoPhase === 'question' && (
          <motion.div
            key="question-phase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center sm:items-start gap-5 w-full"
          >
            <p className="font-serif text-xl sm:text-2xl md:text-3xl text-slate-900 leading-snug">
              Want to try the AI that can retrieve anything you have said to it?
            </p>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setDemoPhase('chat')}
                className="px-8 py-3 rounded-full text-base font-medium bg-slate-900 text-white shadow-lg shadow-black/10 hover:bg-slate-800 transition-all duration-200"
              >
                Yes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onReset?.()}
                className="px-8 py-3 rounded-full text-base font-medium bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900 transition-all duration-200"
              >
                No
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Phase 3: Chat steps — multi-step progression */}
        {demoPhase === 'chat' && (
          <motion.div
            key="chat-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center sm:items-start gap-3 sm:gap-4 w-full"
          >
            {/* Phase header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-1 items-center sm:items-start mb-1"
            >
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-slate-900 font-medium">
                Try the AI Assistant
              </h3>
              <p className="text-slate-400 text-sm sm:text-base">
                Ask VOIS anything about what you just said
              </p>
            </motion.div>

            {/* Step 1: Tap bottom left of the phone */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col gap-1 items-center sm:items-start"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <span className={`font-serif text-lg sm:text-xl md:text-2xl ${chatOpened ? 'text-slate-400' : 'text-slate-900'}`}>
                  <span className="text-slate-400 mr-2">1.</span>
                  Tap the bottom left of the phone
                </span>
                {chatOpened && <CheckCircle size={18} className="text-green-500 flex-shrink-0" />}
              </div>
              {!chatOpened && (
                <span className="text-slate-400 text-xs sm:text-sm sm:ml-7">
                  Open the ✦ icon to try your personal ChatGPT
                </span>
              )}
            </motion.div>

            {/* Step 2: Ask anything about your notes — visible after chat opened */}
            {chatOpened && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-2 items-center sm:items-start"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className={`font-serif text-lg sm:text-xl md:text-2xl ${hasSentTwoMessages ? 'text-slate-400' : 'text-slate-900'}`}>
                    <span className="text-slate-400 mr-2">2.</span>
                    Ask anything about your notes
                  </span>
                  {hasSentTwoMessages && <CheckCircle size={18} className="text-green-500 flex-shrink-0" />}
                </div>
                {!hasSentTwoMessages && (
                  <span className="text-slate-400 text-xs sm:text-sm sm:ml-7">
                    Try the suggested prompts or type your own
                  </span>
                )}

                {/* Info note — always visible once chat opened */}
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed mt-1 sm:ml-7">
                  For your information, this is a test user. But you get the point.
                </p>
              </motion.div>
            )}

            {/* Step 3: Verify or decline action cards — visible after 2 messages */}
            {hasSentTwoMessages && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-1 items-center sm:items-start"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className={`font-serif text-lg sm:text-xl md:text-2xl ${allCardsVerified ? 'text-slate-400' : 'text-slate-900'}`}>
                    <span className="text-slate-400 mr-2">3.</span>
                    Verify or decline the action cards
                  </span>
                  {allCardsVerified && <CheckCircle size={18} className="text-green-500 flex-shrink-0" />}
                </div>
                {!allCardsVerified && (
                  <span className="text-slate-400 text-xs sm:text-sm sm:ml-7">
                    Tap ✓ or ✕ on each card on the phone
                  </span>
                )}
              </motion.div>
            )}

            {/* "Do you want to see more?" — visible after all cards verified */}
            {allCardsVerified && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-3 items-center sm:items-start mt-2"
              >
                <p className="font-serif text-xl sm:text-2xl md:text-3xl text-slate-900 leading-snug">
                  Do you want to see more?
                </p>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      onReset?.();
                      document.getElementById('video-transition')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-8 py-3 rounded-full text-base font-medium bg-slate-900 text-white shadow-lg shadow-black/10 hover:bg-slate-800 transition-all duration-200"
                  >
                    Yes
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onReset?.()}
                    className="px-8 py-3 rounded-full text-base font-medium bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900 transition-all duration-200"
                  >
                    No
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel button when waiting */}
      {stage === 'waiting' && onReset && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onReset();
          }}
          className="text-slate-400 hover:text-slate-600 text-sm transition-colors cursor-pointer"
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
  const [isRecordingForParent, setIsRecordingForParent] = useState(false);

  // Store control functions in refs so they can be passed to parent
  const stopRecordingRef = useRef<() => void>(() => {});
  const resetRef = useRef<() => void>(() => {});
  const startNewRef = useRef<() => void>(() => {});

  // Wrapper to set stage and notify parent
  const setStage = (newStage: DemoStage) => {
    setStageInternal(newStage);
  };

  // Notify parent of stage changes with controls
  useEffect(() => {
    if (!onStageChange) return;

    onStageChange(stage, {
      stopRecording: () => stopRecordingRef.current(),
      reset: () => resetRef.current(),
      startNew: () => startNewRef.current(),
    }, isRecordingForParent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, isRecordingForParent]); // Depend on stage and recording state

  // Refs for batch recording (fallback mode)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Refs for streaming mode
  const wsManagerRef = useRef<DemoWebSocketManager | null>(null);
  const deepgramManagerRef = useRef<DeepgramStreamingManager | null>(null);
  const receivedCardsRef = useRef<ExtractedItem[]>([]);
  const streamingModeRef = useRef<boolean>(false);
  const recordingStartTimeRef = useRef<number>(0);
  const accumulatedTranscriptRef = useRef<string>('');
  const hasTransitionedToResultsRef = useRef<boolean>(false);
  const lastInterimUpdateRef = useRef<number>(0);

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
    setDemoStreaming(false);
    setDemoAudioLevels(new Array(24).fill(0.1));
    setDemoElapsed(0);
    setIsRecordingForParent(false);
  }, []);

  // Initialize streaming manager
  useEffect(() => {
    if (!ENABLE_STREAMING) {
      console.log('[Demo] Streaming disabled - using batch mode');
      return;
    }

    // Initialize DeepGram + OpenAI client-side streaming
    const deepgramKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;

    console.log('[Demo] 🔑 DeepGram Key:', deepgramKey ? `${deepgramKey.substring(0, 10)}...${deepgramKey.substring(deepgramKey.length - 4)}` : 'MISSING');
    console.log('[Demo] 🔑 OpenAI Key:', openaiKey ? `${openaiKey.substring(0, 15)}...${openaiKey.substring(openaiKey.length - 4)}` : 'MISSING');

    if (!deepgramKey || !openaiKey) {
      console.error('[Demo] Missing API keys - check .env file');
      console.error('[Demo] Need: VITE_DEEPGRAM_API_KEY and VITE_OPENAI_API_KEY');
      return;
    }

    deepgramManagerRef.current = new DeepgramStreamingManager(deepgramKey, openaiKey);

    console.log('[Demo] ✅ Client-side streaming manager initialized');

    // Register event handlers for DeepGram streaming
    const handleInterimTranscript = (data: any) => {
      try {
        // Show interim transcripts to make it feel LIVE!
        // But throttle updates to prevent watch blinking (max 10 updates/sec)
        if (!data || !data.text) return;

        const now = Date.now();
        if (now - lastInterimUpdateRef.current < 100) {
          // Skip this update if less than 100ms since last update
          return;
        }
        lastInterimUpdateRef.current = now;

        const currentState = getDemoState();

        // Update with interim text (append to accumulated final transcript)
        setDemoResults({
          transcript: (accumulatedTranscriptRef.current + ' ' + data.text).trim(),
          highlights: currentState.highlights || [],
          items: receivedCardsRef.current,
        });
      } catch (err) {
        console.error('[Demo] ❌ Error in handleInterimTranscript:', err);
      }
    };

    const handleFinalTranscript = (data: any) => {
      try {
        console.log('[Demo] ✅ Final transcript:', data.text);

        if (!data || !data.fullTranscript) {
          console.warn('[Demo] ⚠️  Invalid transcript data:', data);
          return;
        }

        // Accumulate final transcripts
        accumulatedTranscriptRef.current = data.fullTranscript;

        // Update with full accumulated transcript
        setDemoResults({
          transcript: accumulatedTranscriptRef.current,
          highlights: [],
          items: receivedCardsRef.current,
        });

        // Transition to results stage only once
        if (!hasTransitionedToResultsRef.current) {
          console.log('[Demo] 🎬 Transitioning to results stage (first final transcript)');
          hasTransitionedToResultsRef.current = true;
          setStage('results');
          setDemoProcessing(false);
        }
      } catch (err) {
        console.error('[Demo] ❌ Error in handleFinalTranscript:', err);
      }
    };

    const handleActionCard = (data: any) => {
      console.log('[Demo] 🎴 Action card received:', {
        action: data.action,
        type: data.card?.type,
        rawText: data.card?.rawText,
        content: data.card?.content,
        index: data.index
      });

      try {
        let shouldUpdateUI = false;

        if (data.action === 'create' && data.card) {
          const item: ExtractedItem = {
            type: data.card.type,
            rawText: data.card.rawText || data.card.description || data.card.content,
            content: data.card.content,
            icon: data.card.icon,
          };

          receivedCardsRef.current.push(item);
          console.log('[Demo] ✅ Card created. Total cards:', receivedCardsRef.current.length);
          console.log('[Demo] 📋 All cards:', receivedCardsRef.current.map(c => ({ type: c.type, rawText: c.rawText })));

          // Mark step 2 as complete when first card arrives
          if (receivedCardsRef.current.length === 1) {
            setDemoFirstCardReceived(true);
          }

          shouldUpdateUI = true;
          Analytics.streamingCardReceived(receivedCardsRef.current.length, item.type);
        } else if (data.action === 'update' && data.card && data.index !== undefined) {
          // Handle card update
          const index = data.index;
          if (index >= 0 && index < receivedCardsRef.current.length) {
            const oldCard = receivedCardsRef.current[index];
            console.log('[Demo] 🔄 Updating card at index', index);
            console.log('[Demo] 📝 Old:', { type: oldCard.type, rawText: oldCard.rawText });
            console.log('[Demo] 📝 New:', { type: data.card.type, rawText: data.card.rawText });

            const updatedItem: ExtractedItem = {
              type: data.card.type,
              rawText: data.card.rawText || data.card.description || data.card.content,
              content: data.card.content,
              icon: data.card.icon,
            };

            receivedCardsRef.current[index] = updatedItem;
            console.log('[Demo] 📋 All cards after update:', receivedCardsRef.current.map(c => ({ type: c.type, rawText: c.rawText })));
            shouldUpdateUI = true;
          }
        } else {
          console.warn('[Demo] ⚠️  Unknown action or missing data:', data);
          return;
        }

        // Update UI for both create and update actions
        if (shouldUpdateUI) {
          // DON'T transition stages during streaming - we're already in 'results' stage
          // Just update the content without changing stage or stopping audio levels

          // Get current state
          const currentState = getDemoState();
          const currentTranscript = currentState.transcript || accumulatedTranscriptRef.current;

          console.log('[Demo] 🔍 Updating highlights for', receivedCardsRef.current.length, 'cards');
          console.log('[Demo] 📝 Current transcript:', currentTranscript);

          const highlights = receivedCardsRef.current.map((card, cardIndex) => {
            const rawText = card.rawText.toLowerCase();
            const transcriptLower = currentTranscript.toLowerCase();

            console.log(`[Demo] 🎯 Card ${cardIndex} (${card.type}):`, {
              rawText: card.rawText,
              searchText: rawText,
              transcriptLength: currentTranscript.length
            });

            // Try 1: Exact match
            let idx = transcriptLower.indexOf(rawText);
            if (idx !== -1) {
              console.log(`[Demo] ✅ Exact match for card ${cardIndex} at position ${idx}`);
              return {
                text: currentTranscript.substring(idx, idx + card.rawText.length),
                start: idx,
                end: idx + card.rawText.length,
                category: card.type,
                color: getColorForType(card.type),
              };
            }

            console.log(`[Demo] ⚠️  No exact match for card ${cardIndex}, trying alternatives...`);

            // Try 2: Match by splitting on key words (handle punctuation breaks)
            // Extract the core words and search for them as a pattern
            const coreWords = rawText.trim().split(/\s+/);
            if (coreWords.length >= 3) {
              // Try progressively shorter phrases from full length down to 4 words
              for (let wordCount = coreWords.length; wordCount >= Math.min(4, coreWords.length); wordCount--) {
                const searchPhrase = coreWords.slice(0, wordCount).join(' ');
                const phraseIdx = transcriptLower.indexOf(searchPhrase);

                if (phraseIdx !== -1) {
                  // Find the end - try to capture as many words as possible
                  let endPos = phraseIdx + searchPhrase.length;

                  // If we didn't match all words, try to extend to include more context
                  if (wordCount < coreWords.length) {
                    const remainingWords = coreWords.slice(wordCount);
                    for (const word of remainingWords) {
                      const extendSearch = transcriptLower.substring(endPos, endPos + 50);
                      const wordPos = extendSearch.indexOf(word);
                      if (wordPos !== -1 && wordPos < 10) { // Word is nearby (within 10 chars)
                        endPos = endPos + wordPos + word.length;
                      } else {
                        break; // Stop extending if word is far or not found
                      }
                    }
                  }

                  console.log(`[Demo] ⚠️  Partial match for card ${cardIndex}: "${searchPhrase}" at ${phraseIdx}, extended to ${endPos}`);
                  return {
                    text: currentTranscript.substring(phraseIdx, endPos),
                    start: phraseIdx,
                    end: endPos,
                    category: card.type,
                    color: getColorForType(card.type),
                  };
                }
              }
            }

            // Try 3: Find any substantial match (first 3-4 words minimum)
            if (coreWords.length >= 3) {
              for (let wordCount = Math.min(4, coreWords.length); wordCount >= 3; wordCount--) {
                const searchPhrase = coreWords.slice(0, wordCount).join(' ');
                const phraseIdx = transcriptLower.indexOf(searchPhrase);

                if (phraseIdx !== -1) {
                  console.log(`[Demo] ⚠️  Minimum match (${wordCount} words) for card ${cardIndex}: "${searchPhrase}"`);
                  return {
                    text: currentTranscript.substring(phraseIdx, phraseIdx + searchPhrase.length),
                    start: phraseIdx,
                    end: phraseIdx + searchPhrase.length,
                    category: card.type,
                    color: getColorForType(card.type),
                  };
                }
              }
            }

            console.log(`[Demo] ❌ No match found for card ${cardIndex} (tried exact, partial, and minimum matches)`);
            return null;
          }).filter(Boolean) as any[];

          console.log('[Demo] 🎨 Created', highlights.length, 'highlights out of', receivedCardsRef.current.length, 'cards');
          console.log('[Demo] 📍 Highlight positions:', highlights.map(h => ({ start: h.start, end: h.end, category: h.category })));

          // Update state - cards appear/update in real-time with highlights!
          setDemoResults({
            transcript: currentTranscript,
            highlights: highlights,
            items: [...receivedCardsRef.current],
          });
        }
      } catch (err) {
        console.error('[Demo] ❌ Error in handleActionCard:', err);
        // Don't crash - just log and continue recording
      }
    };

    // Helper to get color for card type
    const getColorForType = (type: string): string => {
      const colors: Record<string, string> = {
        task: '#10b981',
        event: '#3b82f6',
        reminder: '#f59e0b',
        idea: '#8b5cf6',
        shopping: '#ec4899',
        note: '#6b7280',
      };
      return colors[type] || '#6b7280';
    };

    const handleError = (data: any) => {
      console.error('[Demo] ❌ Streaming error:', data.message);
      setErrorMessage(data.message || 'Streaming error');
      setStage('error');
      Analytics.streamingError('deepgram_error', data.message || 'Unknown error');
    };

    const handleItemsConsolidated = (data: any) => {
      try {
        console.log('[Demo] 🔄 Items consolidated:', data.items);

        if (!data || !data.items) return;

        // Update the received cards ref with consolidated items
        receivedCardsRef.current = data.items;

        // Refresh the UI with consolidated items
        const currentState = getDemoState();
        const currentTranscript = currentState.transcript || accumulatedTranscriptRef.current;

        const highlights = receivedCardsRef.current.map(card => {
          const rawText = card.rawText.toLowerCase();
          const idx = currentTranscript.toLowerCase().indexOf(rawText);

          if (idx !== -1) {
            return {
              text: currentTranscript.substring(idx, idx + card.rawText.length),
              start: idx,
              end: idx + card.rawText.length,
              category: card.type,
              color: getColorForType(card.type),
            };
          }
          return null;
        }).filter(Boolean) as any[];

        setDemoResults({
          transcript: currentTranscript,
          highlights: highlights,
          items: [...receivedCardsRef.current],
        });

        console.log('[Demo] ✅ UI updated with consolidated items');
      } catch (err) {
        console.error('[Demo] ❌ Error in handleItemsConsolidated:', err);
      }
    };

    deepgramManagerRef.current.on('interim_transcript', handleInterimTranscript);
    deepgramManagerRef.current.on('transcript', handleFinalTranscript);
    deepgramManagerRef.current.on('action_card', handleActionCard);
    deepgramManagerRef.current.on('items_consolidated', handleItemsConsolidated);
    deepgramManagerRef.current.on('error', handleError);

    // Cleanup on unmount
    return () => {
      if (deepgramManagerRef.current) {
        deepgramManagerRef.current.off('interim_transcript', handleInterimTranscript);
        deepgramManagerRef.current.off('transcript', handleFinalTranscript);
        deepgramManagerRef.current.off('action_card', handleActionCard);
        deepgramManagerRef.current.off('items_consolidated', handleItemsConsolidated);
        deepgramManagerRef.current.off('error', handleError);
        deepgramManagerRef.current.disconnect();
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      setOnPhoneRecordClick(null);
      setOnWatchRecordClick(null);
      setOnStopRecordClick(null);
    };
  }, [cleanup]);

  // Store startRecording in a ref so the callback always has the latest version
  const startRecordingRef = useRef<() => void>(() => {});

  // Register the phone and watch record button callbacks
  useEffect(() => {
    if (stage === 'waiting') {
      // During initial demo - both phone and watch can start recording
      setOnPhoneRecordClick(() => {
        setDemoActiveDevice('phone');
        startRecordingRef.current();
      });
      setOnWatchRecordClick(() => {
        setDemoActiveDevice('watch');
        startRecordingRef.current();
      });
      setOnStopRecordClick(null);
    } else if (stage === 'recording') {
      // During recording - stop button on device triggers stop
      setOnPhoneRecordClick(null);
      setOnWatchRecordClick(null);
      setOnStopRecordClick(() => {
        stopRecordingRef.current();
      });
    } else if (stage === 'results') {
      // Check if we're still recording (streaming mode shows results while recording)
      const isStillRecording = getDemoState().isRecording;

      if (isStillRecording) {
        // Streaming mode - still recording, show stop button
        setOnPhoneRecordClick(null);
        setOnWatchRecordClick(null);
        setOnStopRecordClick(() => {
          stopRecordingRef.current();
        });
      } else {
        // Normal results phase - watch can start a new recording (resets demo)
        setOnPhoneRecordClick(null);
        setOnWatchRecordClick(() => {
          // Reset and start new recording with watch
          cleanup();
          setElapsedTime(0);
          setResults(null);
          setErrorMessage('');
          setDemoError(null);
          setDemoTip('');
          setDemoActiveDevice('watch');
          setTimeout(() => startRecordingRef.current(), 50);
        });
        setOnStopRecordClick(null);
      }
    } else if (stage === 'idle') {
      // When idle (both before and after demo) - only watch can start recording (quick capture mode)
      setOnPhoneRecordClick(null);
      setOnWatchRecordClick(() => {
        // Set active device to watch and start recording
        setDemoActiveDevice('watch');
        startRecordingRef.current();
      });
      setOnStopRecordClick(null);
    } else if (stage === 'processing') {
      // During processing - watch can cancel and start new recording
      setOnPhoneRecordClick(null);
      setOnWatchRecordClick(() => {
        // Cancel processing and start new recording
        cleanup();
        setElapsedTime(0);
        setResults(null);
        setErrorMessage('');
        setDemoError(null);
        setDemoTip('');
        setDemoActiveDevice('watch');
        setTimeout(() => startRecordingRef.current(), 50);
      });
      setOnStopRecordClick(null);
    } else {
      setOnPhoneRecordClick(null);
      setOnWatchRecordClick(null);
      setOnStopRecordClick(null);
    }
  }, [stage, hasCompletedDemo, cleanup]);

  // Enter waiting mode - show record buttons on devices
  const enterWaitingMode = () => {
    const device = getDemoState().activeDevice;
    Analytics.demoStarted(device === 'watch' ? 'watch' : 'phone');
    setStage('waiting');
    setDemoWaitingToStart(true);
  };

  // Keep startNew ref updated
  startNewRef.current = () => {
    Analytics.demoRetryStarted();
    cleanup();
    setElapsedTime(0);
    setResults(null);
    setErrorMessage('');
    setDemoError(null);
    setDemoTip('');
    setDemoActiveDevice(null);
    enterWaitingMode();
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

  // Start recording - supports both streaming and batch modes
  const startRecording = async () => {
    const device = getDemoState().activeDevice;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[Demo] 🎬 Starting demo recording');
    console.log('[Demo] 📱 Device:', device);
    console.log('[Demo] ⚙️  Streaming enabled:', ENABLE_STREAMING);
    console.log('[Demo] 🌐 API URL:', API_URL);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Attempt streaming mode first (if enabled)
    if (ENABLE_STREAMING && deepgramManagerRef.current) {
      try {
        console.log('[Demo] 🚀 Attempting CLIENT-SIDE STREAMING mode...');

        // Start recording and streaming (DeepGram + OpenAI)
        await deepgramManagerRef.current.startRecording();

        streamingModeRef.current = true;
        receivedCardsRef.current = [];
        accumulatedTranscriptRef.current = ''; // Reset transcript for new recording
        recordingStartTimeRef.current = Date.now();
        hasTransitionedToResultsRef.current = false; // Reset stage transition flag
        setDemoFirstCardReceived(false); // Reset step 2 completion

        // Clear previous demo results to start fresh
        setDemoResults({
          transcript: '',
          highlights: [],
          items: [],
        });

        Analytics.streamingStarted(device === 'watch' ? 'watch' : 'phone');

        // Enable streaming mode - this tells PhoneScreenAnimation to show results while recording
        console.log('[Demo] 🎛️  Setting streaming mode to TRUE');
        setDemoStreaming(true);
        console.log('[Demo] 🔍 Verify streaming state:', getDemoState().isStreaming);

        // CRITICAL: Set results FIRST so transcript exists before we mark as recording
        // This ensures PhoneScreenAnimation sees hasTranscript=true when checking isStreamingMode
        setDemoResults({
          transcript: '...',  // Placeholder to show we're listening
          highlights: [],
          items: [],
        });

        // Start with results stage so transcript shows immediately
        // But keep recording flag true so timer/stop button work
        setStage('results');
        setElapsedTime(0);
        setDemoWaitingToStart(false);
        setDemoRecording(true); // Keep this true for recording state
        setDemoElapsed(0);
        setIsRecordingForParent(true);

        // Keep audio levels animating to show recording is active
        setDemoAudioLevels(new Array(24).fill(0.3));

        onStartRecording?.();

        // Start count-up timer (stops at 30 seconds)
        console.log('[Demo] ⏱️  Starting 30-second timer');
        timerIntervalRef.current = setInterval(() => {
          setElapsedTime((prev) => {
            const newTime = prev + 1;
            setDemoElapsed(newTime);

            if (newTime >= 30) {
              console.log('[Demo] ⏱️  30 seconds reached, stopping recording');
              stopRecording();
            } else if (newTime % 5 === 0) {
              // Only log every 5 seconds to reduce console spam
              console.log(`[Demo] ⏱️  Timer: ${newTime}/30 seconds`);
            }

            return newTime;
          });
        }, 1000);

        console.log('[Demo] ✅ Client-side streaming started successfully');
        return;
      } catch (err: any) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.warn('[Demo] ⚠️  Streaming FAILED, falling back to batch mode');
        console.warn('[Demo] 📛 Error:', err.message);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        Analytics.streamingFallback(err.message || 'Connection failed');
        streamingModeRef.current = false;

        // Clean up failed streaming attempt
        if (deepgramManagerRef.current) {
          deepgramManagerRef.current.disconnect();
        }

        // Fall through to batch mode
      }
    }

    // Batch mode (original implementation)
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('[Demo] 📦 Using BATCH mode');
      console.log('[Demo] 📍 Endpoint:', `${API_URL}/api/demo/extract`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      streamingModeRef.current = false;

      // Request microphone access
      // Note: avoid specifying sampleRate — iOS Safari doesn't support it
      // and will throw an OverconstrainedError.
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
      } catch (constraintErr) {
        // Fallback: some devices reject even echoCancellation/noiseSuppression
        console.warn('getUserMedia failed with constraints, retrying with audio:true', constraintErr);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

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
      Analytics.demoRecordingStarted(device === 'watch' ? 'watch' : 'phone');
      setStage('recording');
      setElapsedTime(0);
      setDemoWaitingToStart(false); // Clear waiting state
      setDemoRecording(true);
      setDemoElapsed(0);
      setDemoFirstCardReceived(false); // Reset step 2 completion
      setIsRecordingForParent(true);
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
        // Check if permission is permanently blocked
        let permanentlyBlocked = false;
        try {
          const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          permanentlyBlocked = status.state === 'denied';
        } catch {
          // Permissions API not supported (e.g. Safari) — assume blocked after denial
          permanentlyBlocked = true;
        }
        if (permanentlyBlocked) {
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          setErrorMessage(
            isIOS
              ? 'Mic blocked. Reload the page to allow access.'
              : 'Mic blocked. Tap the lock icon in the address bar to allow.'
          );
        } else {
          setErrorMessage('Please allow microphone access to try VOIS');
        }
        Analytics.demoMicrophoneDenied();
      } else {
        console.error('Microphone error type:', err.name, err.message);
        setErrorMessage('Could not access microphone. Please try again.');
        Analytics.demoError('microphone_access', `${err.name}: ${err.message}` || 'Unknown error');
      }
      setStage('error');
      setDemoError('microphone_denied');
    }
  };

  // Keep the ref updated with the latest startRecording function
  startRecordingRef.current = startRecording;

  // Stop recording - supports both streaming and batch modes
  const stopRecording = useCallback(async () => {
    // Get stack trace to see who called stopRecording
    const stack = new Error().stack;
    console.log('[Demo] 🛑 stopRecording called at', elapsedTime, 'seconds');
    console.log('[Demo] 📍 Called from:', stack);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
      console.log('[Demo] ⏱️  Timer cleared');
    }

    Analytics.demoRecordingCompleted(elapsedTime);

    // Streaming mode
    if (streamingModeRef.current && deepgramManagerRef.current) {
      console.log('[Demo] Stopping streaming mode...');

      await deepgramManagerRef.current.stopRecording();

      setDemoRecording(false);
      setDemoStreaming(false);
      setIsRecordingForParent(false);

      // Calculate streaming duration
      const durationSeconds = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
      const totalCards = receivedCardsRef.current.length;

      Analytics.streamingCompleted(totalCards, durationSeconds);

      // If cards already arrived, we're already in results state
      // If no cards yet, show brief processing state
      if (totalCards === 0) {
        setStage('processing');
        setDemoProcessing(true);
        setDemoAudioLevels(new Array(24).fill(0.3));
        setDemoTip(DEMO_TIPS[0]);

        // Wait briefly for final cards to arrive
        setTimeout(() => {
          if (receivedCardsRef.current.length === 0) {
            // Still no cards - show error
            Analytics.demoError('no_items', 'No action items found in streaming');
            setDemoProcessing(false);
            setDemoAudioLevels(new Array(24).fill(0.1));
            setDemoTip('');
            setDemoError('no_items');
            setStage('error');
            setErrorMessage('No action items found');

            // Auto-restart
            setTimeout(() => {
              setDemoError(null);
              setErrorMessage('');
              setStage('waiting');
              setDemoWaitingToStart(true);
            }, 3000);
          }
        }, 2000); // Wait 2 seconds for final cards
      } else {
        // Cards already visible - just log completion
        Analytics.demoResultsViewed(totalCards, receivedCardsRef.current.map(i => i.type));
      }

      onStopRecording?.();
      return;
    }

    // Batch mode (original implementation)
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
    setIsRecordingForParent(false);
    onStopRecording?.();
  }, [onStopRecording, elapsedTime]);

  // Keep stopRecording ref updated
  stopRecordingRef.current = stopRecording;

  // Process the recording
  const processRecording = async () => {
    Analytics.demoProcessingStarted();
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
        Analytics.demoError('recording_too_short', 'Audio blob too small');
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

      // Check if the API returned any action items
      if (!data.items || data.items.length === 0) {
        // No items extracted - show retry message and auto-restart
        Analytics.demoError('no_items', 'No action items found in recording');
        setDemoProcessing(false);
        setDemoAudioLevels(new Array(24).fill(0.1));
        setDemoTip('');
        setDemoError('no_items');
        setStage('error');
        setErrorMessage('No action items found');

        // Auto-restart recording after a brief delay
        setTimeout(() => {
          setDemoError(null);
          setErrorMessage('');
          // Go directly to waiting mode so record buttons appear on devices
          setStage('waiting');
          setDemoWaitingToStart(true);
        }, 3000);
        return;
      }

      setResults(data);
      setDemoResults({
        transcript: data.transcript,
        highlights: data.highlights,
        items: data.items,
      });
      Analytics.demoResultsViewed(data.items.length, data.items.map((i: any) => i.type));
      setStage('results');
    } catch (err: any) {
      console.error('[VOIS Demo] Processing error:', err);
      console.error('[VOIS Demo] Error details:', err.message);
      Analytics.demoError('api_error', err.message || 'Unknown processing error');
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
    if (stage !== 'idle' && stage !== 'results' && stage !== 'error') {
      Analytics.demoCancelled(stage);
    }
    cleanup();

    // Clear all demo state including phone/watch display
    setStage('idle'); // Go back to end page, not waiting
    setElapsedTime(0);
    setResults(null);
    setErrorMessage('');
    setDemoError(null);
    setDemoTip('');
    setDemoWaitingToStart(false); // Not waiting, back to idle
    setDemoActiveDevice(null);
    setDemoFirstCardReceived(false);

    // Clear the demo results from phone/watch display
    setDemoResults({
      transcript: '',
      highlights: [],
      items: [],
    });

    // Reset streaming refs
    if (deepgramManagerRef.current) {
      receivedCardsRef.current = [];
      accumulatedTranscriptRef.current = '';
      hasTransitionedToResultsRef.current = false;
    }
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
                <span className="relative z-10 font-semibold text-slate-900">View Plans</span>
              </motion.button>
            ) : (
              /* First time - Show "Try Now" */
              <>
                <motion.button
                  onClick={enterWaitingMode}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    touchAction: 'manipulation',
                    minHeight: '44px', // Ensure proper tap target size on iOS
                  }}
                  className="try-demo-btn group relative bg-slate-100 text-slate-900 pl-4 pr-8 py-3 rounded-full text-base font-medium flex items-center justify-center gap-3 border border-slate-200 hover:border-slate-900 transition-all shadow-lg"
                >
                  {/* Inner container for overflow clipping (keeps shadow visible on outer button) */}
                  <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    {/* Circular black fill expanding from mic button on hover */}
                    <span className="try-demo-fill absolute bg-slate-900 rounded-full" />
                  </span>
                  {/* Mic button circle - turns white on hover */}
                  <span className="relative z-10 flex items-center justify-center w-9 h-9 bg-slate-900 group-hover:bg-white rounded-full transition-colors duration-200">
                    <Mic size={14} className="text-white group-hover:text-slate-900 transition-colors duration-200" />
                  </span>
                  {/* Text - turns white on hover */}
                  <span className="relative z-10 font-medium group-hover:text-white transition-colors duration-500 delay-100">Try Demo</span>
                </motion.button>
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
            <div className="bg-red-50 text-red-700 px-6 py-3 rounded-2xl text-sm font-medium flex items-center gap-2 border border-red-200">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>

            <motion.button
              onClick={() => {
                setErrorMessage('');
                setStage('idle');
                setDemoError(null);
                // Re-attempt recording directly
                setTimeout(() => enterWaitingMode(), 50);
              }}
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
