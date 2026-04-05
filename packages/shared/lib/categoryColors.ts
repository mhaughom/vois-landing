// ── Single source of truth for category colors across the entire app ─────────
//
// Every badge, card, and text highlight should use these colors.
// To add a new category, add it to the canonical maps below and its aliases.

export interface CardColor {
  bg: string;      // Light pastel background
  accent: string;  // Medium accent
  text: string;    // Dark text
}

// ── Canonical card colors (one per semantic group) ──────────────────────────

const GREEN:  CardColor = { bg: '#dcfce7', accent: '#4ade80', text: '#16a34a' };
const BLUE:   CardColor = { bg: '#dbeafe', accent: '#60a5fa', text: '#2563eb' };
const YELLOW: CardColor = { bg: '#fefce8', accent: '#fde047', text: '#ca8a04' };
const PURPLE: CardColor = { bg: '#f3e8ff', accent: '#c084fc', text: '#9333ea' };
const SLATE:  CardColor = { bg: '#f1f5f9', accent: '#94a3b8', text: '#475569' };
const ORANGE: CardColor = { bg: '#fff7ed', accent: '#fdba74', text: '#ea580c' };
const VIOLET: CardColor = { bg: '#f5f3ff', accent: '#c4b5fd', text: '#7c3aed' };
const TEAL:   CardColor = { bg: '#ecfeff', accent: '#22d3ee', text: '#0891b2' };
const RED:    CardColor = { bg: '#fef2f2', accent: '#fca5a5', text: '#dc2626' };
const PINK:   CardColor = { bg: '#fdf2f8', accent: '#f9a8d4', text: '#db2777' };

// ── Canonical highlight colors (70% opacity pastels for text background) ────

const H_GREEN  = 'rgba(187, 247, 208, 0.7)';
const H_BLUE   = 'rgba(191, 219, 254, 0.7)';
const H_YELLOW = 'rgba(254, 240, 138, 0.7)';
const H_PURPLE = 'rgba(233, 213, 255, 0.7)';
const H_SLATE  = 'rgba(226, 232, 240, 0.7)';
const H_ORANGE = 'rgba(254, 215, 170, 0.7)';
const H_VIOLET = 'rgba(221, 214, 254, 0.7)';
const H_TEAL   = 'rgba(165, 243, 252, 0.7)';
const H_RED    = 'rgba(254, 202, 202, 0.7)';
const H_PINK   = 'rgba(251, 207, 232, 0.7)';

// ── Category → color group mapping ──────────────────────────────────────────
// Each entry maps a category name (lowercase) to its color group.
// Add new categories or aliases here.

const COLOR_MAP: [string[], CardColor, string][] = [
  // [aliases, cardColor, highlightColor]
  // GREEN — Tasks, Work, Projects
  [['task', 'tasks', 'work', 'projects', 'project', 'meeting notes', 'meeting'],  GREEN,  H_GREEN],
  // BLUE — Events, Calendar
  [['event', 'events', 'calendar', 'appointment'],                                BLUE,   H_BLUE],
  // YELLOW — Ideas, Dreams, Research, Gratitude
  [['idea', 'ideas', 'dreams', 'dream', 'research', 'gratitude'],                 YELLOW, H_YELLOW],
  // PURPLE — Reminders
  [['reminder', 'reminders'],                                                      PURPLE, H_PURPLE],
  // SLATE — Notes
  [['note', 'notes'],                                                              SLATE,  H_SLATE],
  // ORANGE — Errands, Goals, Habits
  [['errand', 'errands', 'goals', 'goal', 'habits', 'habit'],                     ORANGE, H_ORANGE],
  // VIOLET — Shopping, Journal, Meals
  [['shopping', 'list', 'grocery', 'groceries', 'journal', 'meals', 'meal', 'recipe'], VIOLET, H_VIOLET],
  // TEAL — Finance
  [['finance', 'money', 'budget', 'expense'],                                     TEAL,   H_TEAL],
  // RED — Health
  [['health', 'sleep', 'tracking', 'wellness', 'symptom'],                        RED,    H_RED],
  // PINK — Social, Family, Memories, Messages
  [['social', 'family', 'memories', 'memory', 'quotes', 'quote', 'message', 'messages'], PINK, H_PINK],
];

// ── Expanded lookup tables (built once at module load) ──────────────────────

export const DEFAULT_CARD_COLOR: CardColor = { bg: '#f8fafc', accent: '#94a3b8', text: '#64748b' };
export const DEFAULT_HIGHLIGHT = H_GREEN;

export const CATEGORY_CARD_COLORS: Record<string, CardColor> = {};
export const CATEGORY_HIGHLIGHT_COLORS: Record<string, string> = {};

for (const [aliases, card, highlight] of COLOR_MAP) {
  for (const alias of aliases) {
    CATEGORY_CARD_COLORS[alias] = card;
    CATEGORY_HIGHLIGHT_COLORS[alias] = highlight;
  }
}

// ── Label-based card colors (for canvas action cards) ────────────────────────
// Maps item labels (Note, Task, Calendar, etc.) to their visual color.
// Key difference from category map: Note = YELLOW (not SLATE).

export const LABEL_CARD_COLORS: Record<string, CardColor> = {
  calendar: BLUE,
  note:     YELLOW,
  task:     GREEN,
  email:    PINK,
  idea:     YELLOW,
  insight:  YELLOW,
  shopping: VIOLET,
  reminder: PURPLE,
};

export function getLabelCardColor(label: string): CardColor {
  return LABEL_CARD_COLORS[label.toLowerCase()] || DEFAULT_CARD_COLOR;
}

// ── Helper functions ────────────────────────────────────────────────────────

export function getCardColor(category: string): CardColor {
  return CATEGORY_CARD_COLORS[category.toLowerCase()] || DEFAULT_CARD_COLOR;
}

export function getHighlightColor(category: string): string {
  return CATEGORY_HIGHLIGHT_COLORS[category.toLowerCase()] || DEFAULT_HIGHLIGHT;
}
