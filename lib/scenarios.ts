// ── Types ────────────────────────────────────────────────────────────────────

export interface TranscriptSegment {
  text: string;
  category?: string;
  highlightColor?: string;
}

export interface ExtractedItem {
  category: string;
  icon: string;
  label: string;
  content: string;
}

export interface Scenario {
  title: string;
  subtitle: string;
  segments: TranscriptSegment[];
  categories: string[];
  extractedItems: ExtractedItem[];
}

export interface CategoryConfig {
  color: string;
  bg: string;
  highlight: string;
  label: string;
}

// ── Category color scheme ────────────────────────────────────────────────────

export const allCategoryConfigs: Record<string, CategoryConfig> = {
  events:   { color: '#2563eb', bg: '#dbeafe', highlight: 'rgba(191, 219, 254, 0.5)', label: 'Event' },
  work:     { color: '#16a34a', bg: '#dcfce7', highlight: 'rgba(187, 247, 208, 0.5)', label: 'Task' },
  errands:  { color: '#ea580c', bg: '#fff7ed', highlight: 'rgba(254, 215, 170, 0.5)', label: 'Errand' },
  finance:  { color: '#0891b2', bg: '#ecfeff', highlight: 'rgba(165, 243, 252, 0.5)', label: 'Task' },
  ideas:    { color: '#ca8a04', bg: '#fefce8', highlight: 'rgba(254, 240, 138, 0.5)', label: 'Idea' },
  health:   { color: '#dc2626', bg: '#fef2f2', highlight: 'rgba(254, 202, 202, 0.5)', label: 'Health Log' },
  shopping: { color: '#7c3aed', bg: '#f5f3ff', highlight: 'rgba(221, 214, 254, 0.5)', label: 'Shopping' },
  social:   { color: '#db2777', bg: '#fdf2f8', highlight: 'rgba(251, 207, 232, 0.5)', label: 'Reminder' },
  messages: { color: '#db2777', bg: '#fdf2f8', highlight: 'rgba(251, 207, 232, 0.5)', label: 'Message' },
};

// ── Scenarios ────────────────────────────────────────────────────────────────

export const scenarios: Scenario[] = [
  {
    title: "Commuter Thoughts",
    subtitle: "On the way to work",
    segments: [
      { text: "Send the " },
      { text: "Q3 budget report to Sarah by Friday. ", category: 'work', highlightColor: allCategoryConfigs.work.highlight },
      { text: "Oh, and I need to " },
      { text: "pick up dry cleaning before they close at 5. ", category: 'errands', highlightColor: allCategoryConfigs.errands.highlight },
      { text: "Also, " },
      { text: "great idea for the blog: 'Why multitasking is a lie.' ", category: 'ideas', highlightColor: allCategoryConfigs.ideas.highlight },
    ],
    categories: ['work', 'errands', 'ideas'],
    extractedItems: [
      { category: 'work', icon: '💼', label: 'Task', content: 'Send Q3 budget report to Sarah' },
      { category: 'errands', icon: '📋', label: 'Errand', content: 'Pick up dry cleaning by 5pm' },
      { category: 'ideas', icon: '💡', label: 'Idea', content: 'Blog: Why multitasking is a lie' },
    ]
  },
  {
    title: "Late Night Thoughts",
    subtitle: "Brain dump before sleep",
    segments: [
      { text: "Feeling a " },
      { text: "sharp headache behind my left eye, probably too much caffeine today. ", category: 'health', highlightColor: allCategoryConfigs.health.highlight },
      { text: "Also, " },
      { text: "cancel the Netflix subscription, I never use it. ", category: 'finance', highlightColor: allCategoryConfigs.finance.highlight },
      { text: "Remind me to " },
      { text: "call Mom tomorrow, it's been a while.", category: 'social', highlightColor: allCategoryConfigs.social.highlight },
    ],
    categories: ['health', 'finance', 'social'],
    extractedItems: [
      { category: 'health', icon: '❤️', label: 'Health Log', content: 'Headache - too much caffeine' },
      { category: 'finance', icon: '💰', label: 'Task', content: 'Cancel Netflix subscription' },
      { category: 'social', icon: '👥', label: 'Reminder', content: 'Call Mom tomorrow' },
    ]
  },
  {
    title: "Son's Birthday Party",
    subtitle: "Planning Checklist",
    segments: [
      { text: "First " },
      { text: "of January we're going to have a birthday party for our son. ", category: 'events', highlightColor: allCategoryConfigs.events.highlight },
      { text: "We will invite friends. Maybe " },
      { text: "you can write a message to them as an invite. ", category: 'messages', highlightColor: allCategoryConfigs.messages.highlight },
      { text: "We're having chicken salad. Can you make a " },
      { text: "shopping list for that? ", category: 'shopping', highlightColor: allCategoryConfigs.shopping.highlight },
      { text: "Also need a birthday gift." }
    ],
    categories: ['events', 'messages', 'shopping'],
    extractedItems: [
      { category: 'events', icon: '📅', label: 'Event', content: 'Birthday party - January 1st' },
      { category: 'messages', icon: '💬', label: 'Draft', content: 'Party invitation for friends' },
      { category: 'shopping', icon: '🛒', label: 'List', content: 'Chicken salad ingredients' },
    ]
  }
];

// ── Timing constants ─────────────────────────────────────────────────────────

export const RECORDING_START_TIME = 3.5;
export const SINGLE_SCENARIO_DURATION = 18.0;
export const TOTAL_ANIMATION_DURATION = SINGLE_SCENARIO_DURATION * scenarios.length;

export const TYPING_SPEED = 28;      // chars per second
export const HIGHLIGHT_SPEED = 60;   // chars per second for highlight sweep

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Pure function: given an animation start time, returns the current scenario state. */
export function getScenarioState(startTime: number) {
  const totalElapsed = (Date.now() - startTime) / 1000;
  const loopedTime = totalElapsed % TOTAL_ANIMATION_DURATION;
  const scenarioIndex = Math.floor(loopedTime / SINGLE_SCENARIO_DURATION);
  const scenarioElapsed = loopedTime % SINGLE_SCENARIO_DURATION;
  return {
    scenario: scenarios[scenarioIndex],
    scenarioIndex,
    elapsed: scenarioElapsed,
    fullTranscript: scenarios[scenarioIndex].segments.map(s => s.text).join(''),
  };
}
