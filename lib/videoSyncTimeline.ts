// ── Video Sync Timeline ─────────────────────────────────────────────────────
// Maps Situations.mp4 timestamps to scenario data for device sync animation.
// Word-level timestamps from Whisper (base model) for accurate transcription sync.
// Categorized segments enable text highlighting and action card reveals.

import { allCategoryConfigs } from './scenarios';

export interface VideoScenarioSegment {
  text: string;
  category?: string;
  highlightColor?: string;
}

export interface VideoScenarioItem {
  category: string;
  icon: string;
  label: string;
  content: string;
}

export interface VideoScenario {
  id: number;
  name: string;
  device: 'phone' | 'watch';
  startTime: number;      // seconds – first word start
  endTime: number;        // seconds – last word end
  text: string;           // full transcript (segments joined)
  segments: VideoScenarioSegment[];
  wordTimings: number[];  // start time per word (split text on spaces)
  items: VideoScenarioItem[];
}

// ── Scenario data with Whisper word-level timestamps ────────────────────────

export const videoScenarios: VideoScenario[] = [

  // ─── 1. Airport (watch) ───────────────────────────────────────────────────
  {
    id: 1,
    name: 'Airport',
    device: 'watch',
    startTime: 0.84,
    endTime: 7.96,
    text: "Cancel my three o'clock with David, something came up, move the client presentation to Thursday morning instead.",
    segments: [
      { text: "Cancel my three o'clock with David, ", category: 'events', highlightColor: allCategoryConfigs.events.highlight },
      { text: "something came up, " },
      { text: "move the client presentation to Thursday morning instead.", category: 'events', highlightColor: allCategoryConfigs.events.highlight },
    ],
    // Words: Cancel my three o'clock with David, something came up, move the client presentation to Thursday morning instead.
    wordTimings: [
      0.84, 1.36, 1.78, 2.20, 2.56, 2.82,   // Cancel … David,
      3.06, 3.38, 3.66,                        // something came up,
      4.82, 5.18, 5.36, 5.56, 6.18, 6.60, 7.00, 7.46, // move … instead.
    ],
    items: [
      { category: 'events', icon: '📅', label: 'Calendar', content: 'Cancel 3pm with David' },
      { category: 'events', icon: '📅', label: 'Calendar', content: 'Client presentation → Thursday AM' },
    ],
  },

  // ─── 2. Driving (watch) ───────────────────────────────────────────────────
  {
    id: 2,
    name: 'Driving',
    device: 'watch',
    startTime: 11.22,
    endTime: 14.48,
    text: "Remind me to call the accountant about the tax return before Friday.",
    segments: [
      { text: "Remind me to call the accountant about the tax return before Friday.", category: 'work', highlightColor: allCategoryConfigs.work.highlight },
    ],
    wordTimings: [
      11.22, 11.74, 11.86, 11.96, 12.12, 12.30,  // Remind … accountant
      12.66, 12.80, 12.92, 13.16, 13.56, 14.02,   // about … Friday.
    ],
    items: [
      { category: 'work', icon: '✅', label: 'Task', content: 'Call accountant re: tax return' },
    ],
  },

  // ─── 3. Post-meeting (phone) ──────────────────────────────────────────────
  {
    id: 3,
    name: 'Post-meeting',
    device: 'phone',
    startTime: 14.48,
    endTime: 24.28,
    text: "Quick debrief, the pitch went well. They're interested but want to see the Q3 numbers and we need to send them by Thursday. Write a follow-up email to the team. We need the updated revenue deck by Wednesday.",
    segments: [
      { text: "Quick debrief, " },
      { text: "the pitch went well. They're interested but want to see the Q3 numbers and we need to send them by Thursday. ", category: 'work', highlightColor: allCategoryConfigs.work.highlight },
      { text: "Write a follow-up email to the team. We need the updated revenue deck by Wednesday.", category: 'messages', highlightColor: allCategoryConfigs.messages?.highlight },
    ],
    // 38 words
    wordTimings: [
      14.48, 15.00,                                             // Quick debrief,
      15.40, 15.62, 15.72, 15.80, 15.90, 16.00, 16.30, 16.60, // the pitch went well. They're interested but want
      16.76, 16.88, 16.98, 17.10, 17.54, 17.90, 18.22, 18.36, // to see the Q3 numbers and we need
      18.52, 18.70, 18.88, 19.14, 19.26,                       // to send them by Thursday.
      19.74, 20.26, 20.36, 20.84, 21.10, 21.34, 21.46,        // Write a follow-up email to the team.
      21.84, 22.18, 22.32, 22.44, 22.76, 23.10, 23.42, 23.84, // We need the updated revenue deck by Wednesday.
    ],
    items: [
      { category: 'work', icon: '📝', label: 'Note', content: 'Pitch went well — want Q3 numbers' },
      { category: 'work', icon: '✅', label: 'Task', content: 'Send Q3 numbers by Thursday' },
      { category: 'messages', icon: '✉️', label: 'Email', content: 'Follow-up: revenue deck by Wednesday' },
    ],
  },

  // ─── 4. Running (watch) ───────────────────────────────────────────────────
  {
    id: 4,
    name: 'Running',
    device: 'watch',
    startTime: 25.84,
    endTime: 30.48,
    text: "That podcast made a great point. Stop optimizing for productivity and start optimizing for clarity.",
    segments: [
      { text: "That podcast made a great point. " },
      { text: "Stop optimizing for productivity and start optimizing for clarity.", category: 'ideas', highlightColor: allCategoryConfigs.ideas.highlight },
    ],
    wordTimings: [
      25.84, 26.36, 26.70, 26.92, 27.02, 27.16, // That podcast made a great point.
      27.44, 27.84, 28.36, 28.54, 28.92, 29.18, 29.32, 29.78, 30.06, // Stop … clarity.
    ],
    items: [
      { category: 'ideas', icon: '💡', label: 'Insight', content: 'Optimize for clarity, not productivity' },
    ],
  },

  // ─── 5. Shower (watch) ────────────────────────────────────────────────────
  {
    id: 5,
    name: 'Shower',
    device: 'watch',
    startTime: 33.50,
    endTime: 39.78,
    text: "Just had a really good idea I need to look into. What if we position it as a platform instead of a tool? Save it to my work ideas.",
    segments: [
      { text: "Just had a really good idea I need to look into. " },
      { text: "What if we position it as a platform instead of a tool? ", category: 'ideas', highlightColor: allCategoryConfigs.ideas.highlight },
      { text: "Save it to my work ideas." },
    ],
    // 29 words
    wordTimings: [
      33.50, 33.90, 34.06, 34.16, 34.36, 34.56, 34.80, 34.92, 35.00, 35.12, 35.24, // Just … into.
      35.56, 35.76, 35.90, 35.96, 36.36, 36.48, 36.66, 36.72, 37.26, 37.74, 37.90, 37.98, // What … tool?
      38.30, 38.88, 39.00, 39.10, 39.20, 39.38, // Save … ideas.
    ],
    items: [
      { category: 'ideas', icon: '💡', label: 'Idea', content: 'Position as platform, not tool' },
    ],
  },

  // ─── 6. Bedtime (watch) ───────────────────────────────────────────────────
  {
    id: 6,
    name: 'Bedtime',
    device: 'watch',
    startTime: 39.90,
    endTime: 46.46,
    text: "Tomorrow I need to pick up dry cleaning. The kids have soccer at three. Oh, and I never replied to that email from the landlord.",
    segments: [
      { text: "Tomorrow I need to pick up dry cleaning. ", category: 'errands', highlightColor: allCategoryConfigs.errands.highlight },
      { text: "The kids have soccer at three. ", category: 'events', highlightColor: allCategoryConfigs.events.highlight },
      { text: "Oh, and I never replied to that email from the landlord.", category: 'errands', highlightColor: allCategoryConfigs.errands.highlight },
    ],
    // 25 words
    wordTimings: [
      39.90, 40.10, 40.20, 40.35, 40.54, 40.90, 41.14, 41.38, // Tomorrow … cleaning.
      41.82, 42.52, 42.74, 42.86, 43.18, 43.38,                // The … three.
      43.68, 44.58, 44.70, 44.78, 44.96, 45.34, 45.54, 45.64, 45.88, 46.10, 46.22, // Oh, … landlord.
    ],
    items: [
      { category: 'errands', icon: '📋', label: 'Task', content: 'Pick up dry cleaning' },
      { category: 'events', icon: '📅', label: 'Calendar', content: 'Kids soccer at 3pm' },
      { category: 'errands', icon: '✅', label: 'Task', content: 'Reply to landlord email' },
    ],
  },

  // ─── 7. Dinner (watch) ────────────────────────────────────────────────────
  {
    id: 7,
    name: 'Dinner',
    device: 'watch',
    startTime: 48.40,
    endTime: 55.88,
    text: "Henrik just said his parents are coming for dinner Saturday. I should make that lamb thing again, add lamb, rosemary, and red wine to the shopping list.",
    segments: [
      { text: "Henrik just said his parents are coming for dinner Saturday. ", category: 'events', highlightColor: allCategoryConfigs.events.highlight },
      { text: "I should make that lamb thing again, " },
      { text: "add lamb, rosemary, and red wine to the shopping list.", category: 'shopping', highlightColor: allCategoryConfigs.shopping.highlight },
    ],
    // 27 words
    wordTimings: [
      48.40, 48.80, 48.98, 49.20, 49.34, 49.58, 49.74, 49.94, 50.12, 50.30, // Henrik … Saturday.
      51.56, 51.78, 51.90, 52.02, 52.20, 52.44, 52.66,                       // I … again,
      53.00, 53.46, 53.88, 54.38, 54.64, 54.80, 54.98, 55.16, 55.26, 55.54, // add … list.
    ],
    items: [
      { category: 'events', icon: '📅', label: 'Calendar', content: "Dinner Saturday — Henrik's parents" },
      { category: 'shopping', icon: '🛒', label: 'Shopping', content: 'Lamb, rosemary, red wine' },
    ],
  },

  // ─── 8. Mountain (watch) — estimated timing (Whisper base missed this) ───
  {
    id: 8,
    name: 'Mountain',
    device: 'watch',
    startTime: 56.00,
    endTime: 61.00,
    text: "Jonas is ready to lead. Sarah needs honest feedback on presentations. Set up one-on-one this week.",
    segments: [
      { text: "Jonas is ready to lead. ", category: 'work', highlightColor: allCategoryConfigs.work.highlight },
      { text: "Sarah needs honest feedback on presentations. ", category: 'work', highlightColor: allCategoryConfigs.work.highlight },
      { text: "Set up one-on-one this week.", category: 'events', highlightColor: allCategoryConfigs.events.highlight },
    ],
    // 16 words – estimated timing
    wordTimings: [
      56.00, 56.20, 56.40, 56.60, 56.80,         // Jonas … lead.
      57.40, 57.70, 58.00, 58.30, 58.70, 58.90,   // Sarah … presentations.
      59.60, 59.80, 60.00, 60.40, 60.60,           // Set … week.
    ],
    items: [
      { category: 'work', icon: '📝', label: 'Note', content: 'Jonas ready to lead' },
      { category: 'work', icon: '✅', label: 'Task', content: 'Give Sarah feedback on presentations' },
      { category: 'events', icon: '📅', label: 'Calendar', content: 'Set up 1:1 this week' },
    ],
  },
];

// ── Lookup helpers ──────────────────────────────────────────────────────────

/** Get the active scenario for a given video time, or null if between scenarios. */
export function getVideoScenario(videoTime: number): VideoScenario | null {
  return videoScenarios.find(s => videoTime >= s.startTime && videoTime <= s.endTime) ?? null;
}

/** Get the most recently completed scenario before a given video time. */
export function getPreviousScenario(videoTime: number): VideoScenario | null {
  for (let i = videoScenarios.length - 1; i >= 0; i--) {
    if (videoScenarios[i].endTime <= videoTime) return videoScenarios[i];
  }
  return null;
}

/**
 * Get the number of characters to reveal based on word-level Whisper timestamps.
 * Each word appears at its spoken time, giving precise sync with the video audio.
 */
export function getRevealedChars(videoTime: number, scenario: VideoScenario): number {
  const words = scenario.text.split(' ');
  const timings = scenario.wordTimings;
  let chars = 0;

  for (let i = 0; i < timings.length && i < words.length; i++) {
    if (videoTime >= timings[i]) {
      chars += words[i].length;
      // Add space after every word except the last
      if (i < words.length - 1) chars += 1;
    } else {
      break;
    }
  }

  return chars;
}

/** Get typing progress (0–1) within a scenario based on video time. */
export function getTypingProgress(videoTime: number, scenario: VideoScenario): number {
  const duration = scenario.endTime - scenario.startTime;
  if (duration <= 0) return 1;
  return Math.min(1, Math.max(0, (videoTime - scenario.startTime) / duration));
}
