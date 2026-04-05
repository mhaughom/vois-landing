/**
 * Mock WebSocket Manager for Development & Testing
 *
 * Simulates the real-time streaming behavior without requiring a backend.
 * Useful for:
 * - Frontend development when backend is not available
 * - Testing error scenarios
 * - Demo purposes
 */

import { DemoWebSocketManager, WSMessage } from './websocketManager';

// Mock action cards that will be delivered incrementally
const MOCK_CARDS = [
  {
    type: 'task',
    title: 'Buy groceries',
    description: 'milk, eggs, bread',
    icon: '🛒',
  },
  {
    type: 'reminder',
    title: 'Call dentist',
    description: 'schedule appointment for next week',
    icon: '🔔',
  },
  {
    type: 'idea',
    title: 'Blog post idea',
    description: 'write about productivity tips',
    icon: '💡',
  },
  {
    type: 'event',
    title: 'Team meeting',
    description: 'tomorrow at 3pm',
    icon: '📅',
  },
];

const MOCK_TRANSCRIPT_SEGMENTS = [
  { text: "I need to buy groceries,", timestamp: 500 },
  { text: "milk, eggs, and bread.", timestamp: 1500 },
  { text: "Also, remind me to call the dentist", timestamp: 3000 },
  { text: "to schedule an appointment for next week.", timestamp: 4500 },
  { text: "Oh, I have an idea for a blog post", timestamp: 6000 },
  { text: "about productivity tips.", timestamp: 7500 },
  { text: "And I have a team meeting tomorrow at 3pm.", timestamp: 9000 },
];

export class MockDemoWebSocket extends DemoWebSocketManager {
  private mockTimers: NodeJS.Timeout[] = [];
  private mockTranscript = '';

  constructor(wsUrl: string) {
    super(wsUrl);
  }

  /**
   * Mock connection - immediately resolves
   */
  async connect(): Promise<void> {
    console.log('[Mock WS] Connecting...');

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('[Mock WS] Connected successfully');

    // Emit connection established
    this.emitPublic('connection_established', {
      type: 'connection_established',
    });

    return Promise.resolve();
  }

  /**
   * Mock recording start - simulates incremental transcripts and cards
   */
  async startRecording(): Promise<void> {
    console.log('[Mock WS] Starting mock recording...');

    // Simulate interim transcripts
    MOCK_TRANSCRIPT_SEGMENTS.forEach((segment, index) => {
      const timer = setTimeout(() => {
        // Emit interim transcript
        this.emitPublic('interim_transcript', {
          type: 'interim_transcript',
          text: segment.text,
        });

        this.mockTranscript += (index > 0 ? ' ' : '') + segment.text;

        console.log('[Mock WS] Interim transcript:', segment.text);
      }, segment.timestamp);

      this.mockTimers.push(timer);
    });

    // Simulate action cards arriving incrementally
    MOCK_CARDS.forEach((card, index) => {
      const timer = setTimeout(() => {
        this.emitPublic('action_card', {
          type: 'action_card',
          action: 'create',
          card,
        });

        console.log('[Mock WS] Action card received:', card.title);
      }, 2000 + (index * 1500)); // Start at 2s, then every 1.5s

      this.mockTimers.push(timer);
    });

    return Promise.resolve();
  }

  /**
   * Mock stop recording - sends final transcript
   */
  async stopRecording(): Promise<void> {
    console.log('[Mock WS] Stopping mock recording...');

    // Clear all pending timers
    this.mockTimers.forEach(timer => clearTimeout(timer));
    this.mockTimers = [];

    // Send final transcript
    setTimeout(() => {
      this.emitPublic('transcript', {
        type: 'transcript',
        data: {
          segments: MOCK_TRANSCRIPT_SEGMENTS.map(s => ({
            text: s.text,
            speaker: 'user',
            timestamp: s.timestamp,
          })),
        },
      });

      console.log('[Mock WS] Final transcript sent');
    }, 500);

    return Promise.resolve();
  }

  /**
   * Mock disconnect - cleans up timers
   */
  disconnect(): void {
    console.log('[Mock WS] Disconnecting...');

    this.mockTimers.forEach(timer => clearTimeout(timer));
    this.mockTimers = [];
    this.mockTranscript = '';

    super.disconnect();
  }

  /**
   * Public emit method for mock implementation
   */
  private emitPublic(event: string, message: WSMessage): void {
    // Access private emit method via any cast
    (this as any).emit(event, message);
  }

  /**
   * Mock error scenario - for testing error handling
   */
  simulateError(errorMessage: string = 'Mock connection error'): void {
    console.log('[Mock WS] Simulating error:', errorMessage);

    this.emitPublic('error', {
      type: 'error',
      data: { message: errorMessage },
    });
  }

  /**
   * Mock slow connection - for testing timeout scenarios
   */
  async connectSlow(delayMs: number = 5000): Promise<void> {
    console.log('[Mock WS] Simulating slow connection...');

    await new Promise(resolve => setTimeout(resolve, delayMs));

    return this.connect();
  }
}

/**
 * Factory function to create mock or real WebSocket manager
 * based on environment or feature flag
 */
export function createDemoWebSocketManager(
  wsUrl: string,
  useMock: boolean = false
): DemoWebSocketManager {
  if (useMock) {
    console.log('[Demo] Using mock WebSocket manager');
    return new MockDemoWebSocket(wsUrl);
  }

  console.log('[Demo] Using real WebSocket manager');
  return new DemoWebSocketManager(wsUrl);
}
