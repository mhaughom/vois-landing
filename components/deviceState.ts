// Shared state and setter functions extracted from DeviceScene.tsx
// This module has NO Three.js dependencies, allowing DeviceScene to be lazy-loaded
// while other components can still access the state API immediately.

// Section identifiers for precise timing
export type SectionId = 'hero' | 'video-transition' | 'narrative' | 'capture' | 'flow' | 'other';

// Demo state for Try Now feature
export type DemoDevice = 'phone' | 'watch' | null;

export interface DemoState {
  isWaitingToStart: boolean;
  activeDevice: DemoDevice;
  isRecording: boolean;
  isProcessing: boolean;
  isStreaming: boolean; // Live streaming mode - show results while recording
  audioLevels: number[];
  countdown: number;
  elapsed: number;
  transcript: string;
  highlights: Array<{ text: string; start: number; end: number; category: string; color: string }>;
  items: Array<{ type: string; rawText: string; content: string; icon: string }>;
  error: string | null;
  tip: string;
  hasReceivedFirstCard: boolean; // Track if first action card has been received
}

// Phone screen navigation state
export type PhoneScreen = 'lockscreen' | 'stream' | 'magic' | 'apps' | 'voicenote' | 'app-tasks' | 'app-ideas' | 'app-calendar' | 'app-lists' | 'app-messages' | 'app-people' | 'app-research' | 'app-journal' | 'app-meeting-notes' | 'app-shopping' | 'app-wisdom' | 'app-insights' | 'app-summit' | 'app-sleep' | 'app-todo';

// Global state (updated via window listeners and section observers)
export const globalState = {
  scrollProgress: 0,
  isScrolling: false,
  mouseX: 0,
  mouseY: 0,
  smoothMouseX: 0,
  smoothMouseY: 0,
  isDragging: false,
  draggedDevice: null as 'phone' | 'watch' | null,
  dragStartX: 0,
  dragStartY: 0,
  dragDeltaX: 0,
  dragDeltaY: 0,
  smoothDragX: 0,
  smoothDragY: 0,
  phoneSmoothDragX: 0,
  phoneSmoothDragY: 0,
  watchSmoothDragX: 0,
  watchSmoothDragY: 0,
  videoSmoothDragX: 0,
  videoSmoothDragY: 0,
  animationStartTime: Date.now(),
  currentSection: 'hero' as SectionId,
  narrativeScrollProgress: 0,
  phoneScreenState: {
    currentScreen: 'voicenote' as PhoneScreen,
    hoveredButton: null as string | null,
    lastClickTime: 0,
    selectedCard: null as { time: string; duration: string; title: string; transcript: string; items: { type: string; content: string; icon: string }[] } | null,
    streamCards: [] as { time: string; duration: string; title: string; transcript: string; items: { type: string; content: string; icon: string }[] }[],
  },
  watchHoveredRecord: false,
  demoState: {
    isWaitingToStart: false,
    activeDevice: null,
    isRecording: false,
    isProcessing: false,
    isStreaming: false,
    audioLevels: new Array(24).fill(0.1),
    countdown: 30,
    elapsed: 0,
    transcript: '',
    highlights: [],
    items: [],
    error: null,
    tip: '',
    hasReceivedFirstCard: false,
  } as DemoState,
  demoResultsStartTime: null as number | null,
  chatState: {
    messages: [] as { role: 'user' | 'assistant'; content: string; citations?: { date: string; preview: string }[] }[],
    isLoading: false,
    error: null as string | null,
    messageCount: 0,
    isLimitReached: false,
    inputText: '',
    isInputFocused: false,
  },
  heroShowcaseActive: true,
  cardVerifications: {} as Record<number, 'verified' | 'declined'>,
  // Touch ripple animations
  phoneTouchRipple: null as { x: number; y: number; startTime: number } | null,
  watchTouchRipple: null as { x: number; y: number; startTime: number } | null,
  // Hover glow positions (UV coordinates, null when not hovering)
  phoneHoverUV: null as { x: number; y: number } | null,
  watchHoverUV: null as { x: number; y: number } | null,
  // Watch UV mapping (repeat/offset from texture setup, for raw→canvas conversion)
  watchUVMapping: null as { repeatX: number; repeatY: number; offsetX: number; offsetY: number } | null,
};

// Callback holders — shared between setter functions and DeviceScene's click handlers
export const callbacks = {
  onChatOpen: null as (() => void) | null,
  onChatMessageSent: null as (() => void) | null,
  onPhoneRecordClick: null as (() => void) | null,
  onWatchRecordClick: null as (() => void) | null,
  onStopRecordClick: null as (() => void) | null,
  onChatSendMessage: null as ((message: string) => void) | null,
  onChatInputClick: null as (() => void) | null,
  onCardVerified: null as ((cardIndex: number, action: 'verified' | 'declined') => void) | null,
};

// --- Setter / Getter functions ---

export const setCurrentSection = (section: SectionId) => {
  if (section !== 'hero' && globalState.heroShowcaseActive) {
    globalState.heroShowcaseActive = false;
  }
  globalState.currentSection = section;
};

export const setOnChatOpen = (callback: (() => void) | null) => {
  callbacks.onChatOpen = callback;
};

export const setOnChatMessageSent = (callback: (() => void) | null) => {
  callbacks.onChatMessageSent = callback;
};

export const setPhoneScreen = (screen: PhoneScreen) => {
  globalState.phoneScreenState.currentScreen = screen;
  globalState.phoneScreenState.lastClickTime = Date.now();
  if (screen !== 'voicenote' && globalState.heroShowcaseActive) {
    globalState.heroShowcaseActive = false;
  }
  if (screen === 'stream') {
    globalState.phoneScreenState.selectedCard = null;
  }
  if (screen === 'magic' && callbacks.onChatOpen) {
    callbacks.onChatOpen();
  }
};

export const setPhoneHoveredButton = (button: string | null) => {
  globalState.phoneScreenState.hoveredButton = button;
};

export const setSelectedCard = (card: { time: string; duration: string; title: string; transcript: string; items: { type: string; content: string; icon: string }[] } | null) => {
  globalState.phoneScreenState.selectedCard = card;
};

export const getPhoneScreenState = () => globalState.phoneScreenState;

export const setNarrativeScrollProgress = (progress: number) => {
  globalState.narrativeScrollProgress = progress;
};

export const endHeroShowcase = () => {
  globalState.heroShowcaseActive = false;
};

export const isHeroShowcaseActive = () => {
  return globalState.heroShowcaseActive && globalState.currentSection === 'hero';
};

export const setDemoWaitingToStart = (waiting: boolean) => {
  globalState.demoState.isWaitingToStart = waiting;
  if (waiting) {
    globalState.heroShowcaseActive = false;
    globalState.phoneScreenState.currentScreen = 'lockscreen';
    globalState.demoState.activeDevice = null;
    globalState.demoState.isRecording = false;
    globalState.demoState.isProcessing = false;
    globalState.demoState.error = null;
    globalState.demoState.transcript = '';
    globalState.demoState.highlights = [];
    globalState.demoState.items = [];
  }
};

export const setDemoActiveDevice = (device: DemoDevice) => {
  globalState.demoState.activeDevice = device;
};

export const setDemoRecording = (isRecording: boolean) => {
  globalState.demoState.isRecording = isRecording;
  if (isRecording && !globalState.demoState.isStreaming) {
    // Only reset state for batch mode, NOT streaming mode
    globalState.demoState.isWaitingToStart = false;
    globalState.demoState.countdown = 30;
    globalState.demoState.elapsed = 0;
    globalState.demoState.error = null;
    globalState.demoState.transcript = '';
    globalState.demoState.highlights = [];
    globalState.demoState.items = [];
    globalState.demoState.tip = '';
    globalState.demoResultsStartTime = null;
    globalState.cardVerifications = {};
  }
};

export const setDemoProcessing = (isProcessing: boolean) => {
  globalState.demoState.isProcessing = isProcessing;
};

export const setDemoStreaming = (isStreaming: boolean) => {
  console.log(`[deviceState] 🎛️  setDemoStreaming called with: ${isStreaming}`);
  globalState.demoState.isStreaming = isStreaming;
  console.log(`[deviceState] ✅ isStreaming is now: ${globalState.demoState.isStreaming}`);
};

export const setDemoAudioLevels = (levels: number[]) => {
  globalState.demoState.audioLevels = levels;
};

export const setDemoCountdown = (countdown: number) => {
  globalState.demoState.countdown = countdown;
};

export const setDemoElapsed = (elapsed: number) => {
  globalState.demoState.elapsed = elapsed;
};

export const setDemoTip = (tip: string) => {
  globalState.demoState.tip = tip;
};

// --- Icon resolution helpers (used by setDemoResults) ---

const iconNameToEmoji: Record<string, string> = {
  'calendar': '📅', 'calendar.fill': '📅', 'event': '📅',
  'checkmark': '✅', 'checkmark.circle': '✅', 'checkmark_circle': '✅',
  'check': '✅', 'check_circle': '✅', 'done': '✅',
  'checkmark.circle.fill': '✅', 'check.circle': '✅',
  'cart': '🛒', 'cart.fill': '🛒', 'shopping_cart': '🛒', 'shopping': '🛒',
  'list': '📋', 'list.bullet': '📋', 'clipboard': '📋', 'assignment': '📋',
  'lightbulb': '💡', 'lightbulb.fill': '💡', 'bulb': '💡', 'idea': '💡',
  'heart': '❤️', 'heart.fill': '❤️', 'health': '❤️',
  'bell': '🔔', 'bell.fill': '🔔', 'alarm': '⏰', 'reminder': '🔔',
  'note': '📝', 'note.text': '📝', 'pencil': '✏️', 'edit': '✏️',
  'person': '👤', 'person.fill': '👤', 'person.2': '👥', 'people': '👥',
  'bubble': '💬', 'bubble.left': '💬', 'message': '💬', 'chat': '💬',
  'dollarsign': '💰', 'dollarsign.circle': '💰', 'money': '💰',
  'creditcard': '💳', 'payment': '💳',
  'briefcase': '💼', 'briefcase.fill': '💼', 'work': '💼',
  'star': '⭐', 'star.fill': '⭐', 'favorite': '⭐',
  'book': '📚', 'book.fill': '📚', 'reading': '📚',
  'house': '🏠', 'house.fill': '🏠', 'home': '🏠',
  'airplane': '✈️', 'car.fill': '🚗',
  'fork.knife': '🍽️', 'food': '🍽️', 'meal': '🍽️',
  'dumbbell': '🏋️', 'figure.run': '🏃', 'fitness': '🏋️',
  'gift': '🎁', 'gift.fill': '🎁',
  'music.note': '🎵', 'music': '🎵',
  'clock': '🕐', 'clock.fill': '🕐', 'time': '🕐',
  'tag': '🏷️', 'tag.fill': '🏷️',
};

const typeFallbackEmoji: Record<string, string> = {
  'task': '✅', 'event': '📅', 'shopping': '🛒', 'reminder': '🔔',
  'idea': '💡', 'note': '📝', 'health': '❤️', 'social': '👥',
  'finance': '💰', 'work': '💼', 'list': '📋', 'grocery': '🛒',
  'groceries': '🛒', 'errands': '📋', 'errand': '📋',
};

const isIconName = (str: string): boolean => /^[a-zA-Z0-9._\-]+$/.test(str);

const resolveIcon = (icon: string, itemType?: string): string => {
  if (!icon) return typeFallbackEmoji[itemType?.toLowerCase() || ''] || '📋';
  if (!isIconName(icon)) return icon;
  const key = icon.toLowerCase().replace(/_/g, '.').replace(/-/g, '.');
  const mapped = iconNameToEmoji[key] || iconNameToEmoji[icon.toLowerCase()];
  if (mapped) return mapped;
  return typeFallbackEmoji[itemType?.toLowerCase() || ''] || '📋';
};

export const setDemoResults = (results: {
  transcript: string;
  highlights: DemoState['highlights'];
  items: DemoState['items'];
}) => {
  const mappedItems = results.items.map(item => ({
    ...item,
    icon: resolveIcon(item.icon, item.type),
  }));

  const transcript = results.transcript;
  const lowerTranscript = transcript.toLowerCase();
  const rawTextHighlights: DemoState['highlights'] = [];

  for (const item of results.items) {
    const rawText = item.rawText?.trim();
    if (!rawText) continue;
    const idx = lowerTranscript.indexOf(rawText.toLowerCase());
    if (idx === -1) continue;
    rawTextHighlights.push({
      text: transcript.substring(idx, idx + rawText.length),
      start: idx,
      end: idx + rawText.length,
      category: item.type?.toLowerCase() || 'task',
      color: '',
    });
  }

  const finalHighlights = rawTextHighlights.length > 0 ? rawTextHighlights : results.highlights;

  console.log('[deviceState] 📝 setDemoResults called:', {
    transcript,
    transcriptLength: transcript.length,
    highlightCount: finalHighlights.length,
    itemCount: mappedItems.length,
    isStreaming: globalState.demoState.isStreaming,
    isRecording: globalState.demoState.isRecording,
  });

  globalState.demoState.transcript = transcript;
  globalState.demoState.highlights = finalHighlights;
  globalState.demoState.items = mappedItems;
  globalState.demoResultsStartTime = Date.now();
};

export const setDemoError = (error: string | null) => {
  globalState.demoState.error = error;
};

export const setDemoFirstCardReceived = (received: boolean) => {
  globalState.demoState.hasReceivedFirstCard = received;
};

export const getDemoState = () => globalState.demoState;

// --- Chat state ---

export const getChatState = () => globalState.chatState;

export const addChatMessage = (message: { role: 'user' | 'assistant'; content: string; citations?: { date: string; preview: string }[] }) => {
  globalState.chatState.messages.push(message);
  if (message.role === 'user') {
    globalState.chatState.messageCount++;
  }
  if (globalState.chatState.messageCount >= 5) {
    globalState.chatState.isLimitReached = true;
  }
};

export const setChatLoading = (isLoading: boolean) => {
  globalState.chatState.isLoading = isLoading;
};

export const setChatError = (error: string | null) => {
  globalState.chatState.error = error;
};

export const setChatInput = (text: string) => {
  globalState.chatState.inputText = text;
};

export const setChatInputFocused = (focused: boolean) => {
  globalState.chatState.isInputFocused = focused;
};

export const resetChat = () => {
  globalState.chatState.messages = [];
  globalState.chatState.isLoading = false;
  globalState.chatState.error = null;
  globalState.chatState.messageCount = 0;
  globalState.chatState.isLimitReached = false;
  globalState.chatState.inputText = '';
  globalState.chatState.isInputFocused = false;
};

export const CHAT_SUGGESTED_PROMPTS = [
  "What did I say about the project?",
  "Why have I been tired lately?",
  "What should I get Sam for their birthday?",
  "Do I have any open tasks?",
  "When did I last mention Sarah?",
];

// --- Device click callback setters ---

export const setOnPhoneRecordClick = (callback: (() => void) | null) => {
  callbacks.onPhoneRecordClick = callback;
};

export const setOnWatchRecordClick = (callback: (() => void) | null) => {
  callbacks.onWatchRecordClick = callback;
};

export const setOnStopRecordClick = (callback: (() => void) | null) => {
  callbacks.onStopRecordClick = callback;
};

export const setOnChatSendMessage = (callback: ((message: string) => void) | null) => {
  callbacks.onChatSendMessage = callback;
};

export const setOnChatInputClick = (callback: (() => void) | null) => {
  callbacks.onChatInputClick = callback;
};

// --- Card verification ---

export const setOnCardVerified = (callback: ((cardIndex: number, action: 'verified' | 'declined') => void) | null) => {
  callbacks.onCardVerified = callback;
};

export const setCardVerification = (cardIndex: number, action: 'verified' | 'declined') => {
  globalState.cardVerifications[cardIndex] = action;
  if (callbacks.onCardVerified) {
    callbacks.onCardVerified(cardIndex, action);
  }
};

export const getCardVerifications = () => globalState.cardVerifications;

export const resetCardVerifications = () => {
  globalState.cardVerifications = {};
};

export const areAllCardsVerified = (): boolean => {
  const items = globalState.demoState.items;
  if (items.length === 0) return false;
  return items.every((_, i) => i in globalState.cardVerifications);
};
