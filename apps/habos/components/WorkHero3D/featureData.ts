// Feature content for each face of the hexcube, mapped by TRI_LABELS name
export interface FeatureInfo {
  headline: string;
  body: string;
  closingLine: string;
  demoKey: string;
}

// demoKey values are static — they reference internal demo identifiers, not translatable strings.
const DEMO_KEYS: Record<string, string> = {
  'Your Assistant': 'voice-notes',
  'Your Super-Assistant': 'calendar',
  'Your Day': 'tasks',
  'Meetings': 'meeting-notes',
  'Projects': 'projects',
  'Operations': 'research',
  'Clients': 'mail',
  'Documents': 'documents',
  'Finance': 'reports',
  'Website': 'custom-apps',
  'AI Agents': 'agents',
  'Reports': 'reports',
  'Your Team': 'team-view',
  'Playbooks': 'live-view',
  'Field to Office': 'voice-notes',
  'The Airlock': 'agents',
  'Your Memory': 'research',
  'Growth Engine': 'meeting-notes',
};

// Mapping from display label to i18n camelCase key
const LABEL_TO_KEY: Record<string, string> = {
  'Your Assistant': 'yourAssistant',
  'Your Super-Assistant': 'yourSuperAssistant',
  'Your Day': 'yourDay',
  'Meetings': 'meetings',
  'Projects': 'projects',
  'Operations': 'operations',
  'Clients': 'clients',
  'Documents': 'documents',
  'Finance': 'finance',
  'Website': 'website',
  'AI Agents': 'aiAgents',
  'Reports': 'reports',
  'Your Team': 'yourTeam',
  'Playbooks': 'playbooks',
  'Field to Office': 'fieldToOffice',
  'The Airlock': 'theAirlock',
  'Your Memory': 'yourMemory',
  'Growth Engine': 'growthEngine',
};

export function getFeatureMap(t: (key: string) => string): Record<string, FeatureInfo> {
  const map: Record<string, FeatureInfo> = {};
  for (const [label, key] of Object.entries(LABEL_TO_KEY)) {
    map[label] = {
      headline: t(`features.${key}.headline`),
      body: t(`features.${key}.body`),
      closingLine: t(`features.${key}.closingLine`),
      demoKey: DEMO_KEYS[label],
    };
  }
  return map;
}
