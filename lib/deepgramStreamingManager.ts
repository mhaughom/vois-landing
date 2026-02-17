/**
 * Direct Browser → DeepGram + OpenAI Streaming Manager
 *
 * Fully client-side implementation:
 * - Connects directly to DeepGram for real-time transcription
 * - Uses OpenAI GPT-4o-mini for instant action card extraction
 * - No backend needed for demo functionality
 */

import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import OpenAI from 'openai';

export interface ExtractedItem {
  type: string;
  rawText: string;
  content: string;
  icon: string;
  description?: string;
  due_date?: string;
  scheduled_time?: string;
}

type EventHandler = (data: any) => void;

export class DeepgramStreamingManager {
  private deepgram: any;
  private openai: OpenAI;
  private connection: any = null;
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private mediaStream: MediaStream | null = null;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private keepAliveInterval: NodeJS.Timeout | null = null;

  private fullTranscript = '';
  private extractedItems: ExtractedItem[] = [];
  private lastExtractionTime = 0;
  private extractionDebounceMs = 2500; // Re-evaluate all cards every 2.5 seconds with full context
  private lastProcessedTranscript = ''; // Track what we've already extracted from
  private pendingConsolidation = false; // Track if we need to consolidate items
  private consolidationInterval: NodeJS.Timeout | null = null; // Recurring consolidation timer
  private actualSampleRate = 16000; // Will be updated to AudioContext's actual rate

  constructor(deepgramKey: string, openaiKey: string) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[Streaming] 🚀 Initializing client-side streaming');
    console.log('[Streaming] 📡 DeepGram: Direct browser connection');
    console.log('[Streaming] 🤖 OpenAI: Client-side extraction');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    this.deepgram = createClient(deepgramKey);
    this.openai = new OpenAI({
      apiKey: openaiKey,
      dangerouslyAllowBrowser: true, // Required for client-side usage
    });
  }

  /**
   * Start recording and streaming
   */
  async startRecording(): Promise<void> {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('[Streaming] 🎤 Starting recording...');

      // Reset state for fresh recording
      this.fullTranscript = '';
      this.extractedItems = [];
      this.lastExtractionTime = 0;
      this.lastProcessedTranscript = '';
      console.log('[Streaming] 🧹 Cleared previous transcript and items');

      // 1. Get microphone access (with iOS fallback)
      console.log('[Streaming] 🔍 Requesting microphone access...');
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (constraintErr) {
        // iOS Safari rejects sampleRate constraint — retry without it
        console.warn('[Streaming] getUserMedia failed with sampleRate constraint, retrying without it', constraintErr);
        try {
          this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            },
          });
        } catch (basicErr) {
          // Last resort: simplest possible constraint
          console.warn('[Streaming] getUserMedia failed again, trying audio:true', basicErr);
          this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      }

      console.log('[Streaming] ✅ Microphone access granted');
      const trackSettings = this.mediaStream.getAudioTracks()[0].getSettings();
      console.log('[Streaming] 🎙️ Audio track settings:', trackSettings);

      // 2. Create AudioContext — let the browser pick native sample rate
      // iOS Safari ignores custom sampleRate; using native rate avoids resampling issues
      this.audioContext = new AudioContext();
      this.actualSampleRate = this.audioContext.sampleRate;
      console.log('[Streaming] 🎵 AudioContext created at', this.actualSampleRate, 'Hz');
      console.log('[Streaming] 🎵 AudioContext state:', this.audioContext.state);

      // Resume if suspended (required for some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('[Streaming] ▶️ AudioContext resumed');
      }

      // 3. Load AudioWorklet
      await this.audioContext.audioWorklet.addModule('/audio-processor.js');
      console.log('[Streaming] 📦 AudioWorklet loaded');

      // 4. Create processor node
      this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm16-processor');

      // 5. Connect audio pipeline
      // NOTE: Don't connect to destination to avoid feedback/echo
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.workletNode);
      // Removed: this.workletNode.connect(this.audioContext.destination);

      console.log('[Streaming] 🔗 Audio pipeline connected (mic → worklet)');

      // 6. Connect to DeepGram
      await this.connectDeepGram();

      console.log('[Streaming] ✅ Recording started successfully');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (err: any) {
      console.error('[Streaming] ❌ Failed to start recording:', err);
      this.cleanup();
      throw err;
    }
  }

  /**
   * Connect to DeepGram WebSocket
   */
  private async connectDeepGram(): Promise<void> {
    console.log('[Streaming] 🌐 Connecting to DeepGram...');

    // Use the actual AudioContext sample rate (may be 16kHz, 44.1kHz, or 48kHz)
    const sampleRate = this.actualSampleRate;

    console.log('[Streaming] 📝 DeepGram config:', {
      model: 'nova-2',
      language: 'en-US',
      encoding: 'linear16',
      sample_rate: sampleRate,
      channels: 1,
    });

    this.connection = this.deepgram.listen.live({
      model: 'nova-2',
      language: 'en-US',
      encoding: 'linear16',
      sample_rate: sampleRate,
      channels: 1,
      smart_format: true,
      interim_results: true,
    });

    // Handle connection open
    this.connection.on(LiveTranscriptionEvents.Open, () => {
      console.log('[Streaming] ✅ DeepGram WebSocket OPENED - ready to receive transcripts');

      let audioChunkCount = 0;

      // Send audio from worklet
      if (this.workletNode) {
        console.log('[Streaming] 📡 Setting up audio worklet message handler');
        this.workletNode.port.onmessage = (event) => {
          // Handle debug messages from audio processor
          if (event.data.type === 'debug') {
            console.log('[Streaming] 🔊 Audio stats:', {
              chunk: event.data.chunkCount,
              samples: event.data.sampleCount,
              rms: event.data.rms.toFixed(4),
              maxLevel: event.data.maxAbsValue.toFixed(4),
              nonZero: event.data.percentNonZero + '%',
            });
            return;
          }

          if (event.data.type === 'audio' && this.connection) {
            const audioData = event.data.data; // ArrayBuffer

            // Log first chunk to verify format
            if (audioChunkCount === 0) {
              console.log('[Streaming] 🎵 First audio chunk:', {
                type: typeof audioData,
                constructor: audioData.constructor.name,
                byteLength: audioData.byteLength,
              });
            }

            this.connection.send(audioData);
            audioChunkCount++;

            // Log every 50th chunk to confirm audio is flowing
            if (audioChunkCount % 50 === 0) {
              console.log(`[Streaming] 📡 Sent ${audioChunkCount} audio chunks to DeepGram`);
            }
          }
        };
      }

      this.emit('connected', {});

      // Send keep-alive messages every 5 seconds to prevent timeout
      // Deepgram can close connections after ~10 seconds of silence
      this.keepAliveInterval = setInterval(() => {
        if (this.connection) {
          try {
            // Send empty audio buffer as keep-alive
            const keepAlive = new ArrayBuffer(0);
            this.connection.send(keepAlive);
            console.log('[Streaming] 💓 Sent keep-alive to DeepGram');
          } catch (err) {
            console.error('[Streaming] ❌ Keep-alive failed:', err);
          }
        }
      }, 5000);

      // Consolidation disabled - full context extraction handles everything
      // The AI sees all cards and full transcript on every extraction,
      // so it naturally merges, updates, and corrects as needed
      console.log('[Streaming] ℹ️  Consolidation disabled (full-context extraction handles merging)');
    });

    // Handle transcripts
    this.connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
      console.log('[Streaming] 📨 Received transcript event from DeepGram');
      this.handleTranscript(data);
    });

    // Handle errors
    this.connection.on(LiveTranscriptionEvents.Error, (error: any) => {
      console.error('[Streaming] ❌ DeepGram error:', error);
      this.emit('error', { message: 'DeepGram error', error });
    });

    // Handle close
    this.connection.on(LiveTranscriptionEvents.Close, (event: any) => {
      console.log('[Streaming] 🔌 DeepGram connection closed');
      console.log('[Streaming] 📊 Close event:', event);

      // Only emit error if this wasn't an intentional disconnect
      // (connection will be null if we called disconnect() or stopRecording())
      if (this.connection) {
        console.error('[Streaming] ⚠️  Connection closed unexpectedly - possible API key issue or timeout');
        // Don't emit error - just log it. Let the recording continue for the full 30 seconds.
        console.log('[Streaming] 💡 This is normal if you reached the end of your speech');
      }
    });
  }

  /**
   * Handle incoming transcripts
   */
  private async handleTranscript(data: any): Promise<void> {
    console.log('[Streaming] 🔍 handleTranscript called, data:', data);

    const transcript = data.channel?.alternatives?.[0]?.transcript;
    if (!transcript) {
      console.log('[Streaming] ⚠️ No transcript text in data, skipping');
      return;
    }

    const isFinal = data.is_final;
    console.log('[Streaming] 📊 Transcript:', isFinal ? 'FINAL' : 'INTERIM', '-', transcript);

    if (!isFinal) {
      // Interim transcript - send to UI for instant feedback
      console.log('[Streaming] 📝 Emitting interim transcript:', transcript);
      this.emit('interim_transcript', { text: transcript });
      return;
    }

    // Final transcript
    console.log('[Streaming] ✅ Final transcript:', transcript);
    this.fullTranscript = (this.fullTranscript + ' ' + transcript).trim();

    this.emit('transcript', {
      text: transcript,
      fullTranscript: this.fullTranscript,
    });

    // Extract action cards on EVERY final transcript to catch all items
    // Small debounce to avoid extracting from fragments that arrive milliseconds apart
    const now = Date.now();
    if (now - this.lastExtractionTime >= this.extractionDebounceMs) {
      this.lastExtractionTime = now;

      // Calculate the new text since last extraction
      const newTextSinceLastExtraction = this.fullTranscript.substring(this.lastProcessedTranscript.length).trim();

      if (this.fullTranscript.trim()) {
        console.log('[Streaming] 🤖 Re-evaluating all cards with full context');
        this.lastProcessedTranscript = this.fullTranscript;

        // Pass FULL transcript and existing cards for context-aware extraction
        this.extractActionCards(this.fullTranscript).catch(err => {
          console.error('[Streaming] ❌ Extraction error:', err);
        });
      }
    } else {
      console.log('[Streaming] ⏭️  Skipping extraction (too soon, waiting for next chunk)');
    }
  }

  /**
   * Check if an item is a duplicate of an existing item
   */
  private isDuplicate(newItem: { type: string; title: string; source_text?: string }, existingItems: ExtractedItem[]): boolean {
    if (existingItems.length === 0) return false;

    const newTitleLower = newItem.title.toLowerCase().trim();
    const newSourceLower = (newItem.source_text || newItem.title).toLowerCase().trim();

    // Check only the most recent item first (most likely to be a duplicate if user is elaborating)
    const mostRecent = existingItems[existingItems.length - 1];
    const recentTitleLower = mostRecent.content.toLowerCase().trim();
    const recentSourceLower = (mostRecent.rawText || mostRecent.content).toLowerCase().trim();

    // If the new item has very similar words to the most recent item, it's probably a duplicate/elaboration
    const newWords = new Set(newTitleLower.split(/\s+/));
    const recentWords = new Set(recentTitleLower.split(/\s+/));
    const intersection = new Set([...newWords].filter(x => recentWords.has(x)));
    const recentSimilarity = intersection.size / Math.min(newWords.size, recentWords.size);

    if (recentSimilarity > 0.5 && newItem.type === mostRecent.type) {
      console.log('[Streaming] 🔍 Likely duplicate of most recent item:', {
        new: newTitleLower,
        recent: recentTitleLower,
        similarity: recentSimilarity
      });
      return true;
    }

    // Now check all existing items
    for (const existing of existingItems) {
      const existingTitleLower = existing.content.toLowerCase().trim();
      const existingSourceLower = (existing.rawText || existing.content).toLowerCase().trim();

      // Exact title match
      if (newTitleLower === existingTitleLower) {
        return true;
      }

      // Check if source texts overlap significantly (fragments from same sentence)
      if (newSourceLower && existingSourceLower) {
        const newSourceWords = new Set(newSourceLower.split(/\s+/));
        const existingSourceWords = new Set(existingSourceLower.split(/\s+/));
        const sourceIntersection = new Set([...newSourceWords].filter(x => existingSourceWords.has(x)));
        const sourceUnion = new Set([...newSourceWords, ...existingSourceWords]);
        const sourceSimilarity = sourceIntersection.size / sourceUnion.size;

        // If source texts are more than 60% similar, likely fragments of same statement
        if (sourceSimilarity > 0.6) {
          console.log('[Streaming] 🔍 Source text overlap detected:', {
            new: newSourceLower,
            existing: existingSourceLower,
            similarity: sourceSimilarity
          });
          return true;
        }
      }

      // Check if one title contains the other
      if (newTitleLower.includes(existingTitleLower) || existingTitleLower.includes(newTitleLower)) {
        // Same type required
        if (newItem.type === existing.type) {
          return true;
        }
      }

      // Calculate title similarity (word overlap)
      const newItemWords = new Set(newTitleLower.split(/\s+/));
      const existingWords = new Set(existingTitleLower.split(/\s+/));
      const titleIntersection = new Set([...newItemWords].filter(x => existingWords.has(x)));
      const union = new Set([...newItemWords, ...existingWords]);
      const similarity = titleIntersection.size / union.size;

      // If more than 70% similar and same type, consider duplicate
      if (similarity > 0.7 && newItem.type === existing.type) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if new item is elaborating on the last item (adding more details to same action)
   */
  private isElaboratingOnLastItem(newItem: ExtractedItem, lastItem: ExtractedItem): boolean {
    // Must be same type to be an elaboration
    if (newItem.type !== lastItem.type) {
      return false;
    }

    // Get meaningful words (filter out short words)
    const lastWords = lastItem.content.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const newWords = newItem.content.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    // Count how many words from last item appear in new item
    const overlap = lastWords.filter(w => newWords.includes(w)).length;
    const overlapRatio = lastWords.length > 0 ? overlap / lastWords.length : 0;

    console.log('[Streaming] 🔍 Checking elaboration:', {
      last: lastItem.content,
      new: newItem.content,
      overlapRatio: overlapRatio.toFixed(2),
      isElaboration: overlapRatio >= 0.5
    });

    // If 50%+ of last item's words are in new item, it's likely an elaboration
    // Example: "Buy milk" → "Buy milk tomorrow at the store" (overlap = 100%)
    return overlapRatio >= 0.5;
  }

  /**
   * Extract action cards using OpenAI with full context
   */
  private async extractActionCards(fullTranscript: string): Promise<void> {
    // Don't extract from empty text
    if (!fullTranscript || fullTranscript.trim().length < 5) {
      console.log('[Streaming] ⏭️  Skipping extraction - text too short');
      return;
    }

    try {
      console.log('[Streaming] 🤖 Re-evaluating with full context:', fullTranscript);
      console.log('[Streaming] 📋 Current cards:', this.extractedItems.map(i => i.content));

      // Prepare existing cards for context
      const existingCards = this.extractedItems.map((item, index) => ({
        id: index,
        type: item.type,
        title: item.content
      }));

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are managing action cards extracted from a live voice transcript.

Your job: Given the FULL transcript and EXISTING cards, return the COMPLETE set of cards that should exist.

Return JSON:
{
  "cards": [
    {
      "id": <existing-id-or-null-for-new>,
      "type": "task|event|idea|shopping",
      "title": "Complete action with timing and details",
      "source_text": "The exact words from transcript that describe this card"
    }
  ]
}

CRITICAL RULES:
1. **Use FULL context** - you see the entire transcript, so understand complete thoughts
2. **Update existing cards** - if an existing card should be refined with new details, return it with same id but better title
3. **Create new cards** - for new actions not covered by existing cards, use id: null
4. **Don't duplicate** - if existing card already covers an action, keep it (don't create duplicate)
5. **Remove meta-phrases** - "add a task to X" → extract only "X"
6. **Correct types with context**:
   - "write a book about bananas" → idea (NOT shopping, even though it mentions bananas)
   - "go to church on Sunday at 5pm" → event (specific day + time)
   - "do laundry tomorrow" → task (day but no specific time)

IMPORTANT: source_text should be the ACTUAL words from the transcript (for highlighting).

Examples:

Transcript: "I want to add a task to write a book about bananas"
Existing: []
Return: [{"id": null, "type": "idea", "title": "Write a book about bananas", "source_text": "write a book about bananas"}]

Transcript: "tomorrow morning do laundry and then go to church on Sunday at five"
Existing: [{"id": 0, "type": "task", "title": "Do laundry tomorrow", "source_text": "tomorrow do laundry"}]
Return: [
  {"id": 0, "type": "task", "title": "Do laundry tomorrow morning", "source_text": "tomorrow morning do laundry"},
  {"id": null, "type": "event", "title": "Go to church on Sunday at 5pm", "source_text": "go to church on Sunday at five"}
]`,
          },
          {
            role: 'user',
            content: `Full transcript: "${fullTranscript}"
Existing cards: ${JSON.stringify(existingCards)}

Return the complete set of cards that should exist.`,
          },
        ],
        temperature: 0.3, // Increased for more comprehensive extraction
        response_format: { type: 'json_object' },
      });

      const result = response.choices[0].message.content;
      if (!result) {
        console.log('[Streaming] ⚠️  No result from OpenAI');
        return;
      }

      const parsed = JSON.parse(result);
      const newCards = parsed.cards || parsed.actions || [];

      if (!newCards || !Array.isArray(newCards)) {
        console.warn('[Streaming] ⚠️  Invalid cards format:', parsed);
        return;
      }

      console.log('[Streaming] 📦 AI returned', newCards.length, 'cards');

      // Diff: compare old cards with new cards
      const oldCards = [...this.extractedItems];
      const creates: ExtractedItem[] = [];
      const updates: { index: number; card: ExtractedItem }[] = [];
      const keeps: Set<number> = new Set();

      // Process new cards
      for (const newCard of newCards) {
        if (newCard.id !== null && newCard.id !== undefined && newCard.id < oldCards.length) {
          // UPDATE existing card
          const oldCard = oldCards[newCard.id];
          const hasChanges = oldCard.content !== newCard.title ||
                            oldCard.type !== newCard.type ||
                            oldCard.rawText !== newCard.source_text;

          if (hasChanges) {
            oldCard.content = newCard.title;
            oldCard.type = newCard.type;
            oldCard.icon = this.getDefaultIcon(newCard.type);

            // Update highlighting with source text from transcript
            if (newCard.source_text) {
              oldCard.rawText = newCard.source_text;
              console.log('[Streaming] 📍 Updated highlight for card', newCard.id, ':', newCard.source_text);
            }

            updates.push({ index: newCard.id, card: oldCard });
            console.log('[Streaming] 🔄 Updated card', newCard.id, ':', newCard.title);
          }
          keeps.add(newCard.id);
        } else {
          // CREATE new card
          const extractedItem: ExtractedItem = {
            type: newCard.type || 'task',
            content: newCard.title,
            rawText: newCard.source_text || newCard.title, // Use source text for highlighting
            icon: this.getDefaultIcon(newCard.type),
          };

          creates.push(extractedItem);
          console.log('[Streaming] 🎴 Created card:', newCard.title);
          console.log('[Streaming] 📍 Highlight span:', newCard.source_text);
        }
      }

      // Apply updates first
      for (const update of updates) {
        this.emit('action_card', {
          action: 'update',
          index: update.index,
          card: update.card,
        });
      }

      // Add new cards
      for (const newCard of creates) {
        this.extractedItems.push(newCard);
        this.emit('action_card', {
          action: 'create',
          card: newCard,
        });
      }

      // Remove cards that weren't kept (deleted by AI)
      const deletes: number[] = [];
      for (let i = 0; i < oldCards.length; i++) {
        if (!keeps.has(i)) {
          deletes.push(i);
        }
      }

      // Delete in reverse order to maintain indices
      for (const deleteIndex of deletes.reverse()) {
        console.log('[Streaming] 🗑️ Deleted card', deleteIndex, ':', oldCards[deleteIndex].content);
        this.extractedItems.splice(deleteIndex, 1);
        this.emit('action_card', {
          action: 'delete',
          index: deleteIndex,
        });
      }

      console.log('[Streaming] ✅ Summary:', {
        created: creates.length,
        updated: updates.length,
        deleted: deletes.length,
        total: this.extractedItems.length
      });

      // Don't manually trigger consolidation - let the 2-second interval handle it
    } catch (err) {
      console.error('[Streaming] ❌ Extraction failed:', err);
      // Don't crash - just log and continue
      // The recording should keep going even if extraction fails
    }
  }

  /**
   * Consolidate recent items - merge items that are fragments of the same thing
   */
  private async consolidateRecentItems(): Promise<void> {
    if (this.extractedItems.length === 0 || this.pendingConsolidation) return;

    this.pendingConsolidation = true;

    try {
      console.log('[Streaming] 🔍 Running consolidation on', this.extractedItems.length, 'items:',
        this.extractedItems.map(i => i.content));

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a CONSERVATIVE consolidator. Only merge TRUE DUPLICATES. Keep separate actions separate.

Return a JSON object:
{
  "merges": [
    {
      "indices_to_merge": [0, 1],  // All indices involved (will keep lowest, delete rest)
      "merged_title": "Complete merged title",
      "merged_description": "Complete description",
      "merged_type": "task|event|reminder|idea|shopping|note",
      "due_date": "YYYY-MM-DD",
      "scheduled_time": "HH:MM"
    }
  ]
}

**CRITICAL: REMOVE META-PHRASES** - These are NOT real tasks:
- "Add to my list"
- "Create a list"
- "Add a task"
- "Add calendar item"
- "Add event"
- "Make a note"
- "Remember to add"
- "Save this"
- "Write down"

If you see ONLY a meta-phrase → DELETE it
Example: ["Add to my list"] → DELETE (it's not a real action)

If meta-phrase + real task in SAME SENTENCE → Delete meta, keep real
Example: ["Add to my list", "Do laundry"] → Keep only "Do laundry"

**ONLY MERGE IF:**
1. Pure meta-phrase (no real action) → DELETE it completely
2. Same action mentioned twice with different wording
   Example: ["Do laundry", "Laundry needs to be done"] → Merge to "Do laundry"
3. Fragment that adds details to previous item FROM SAME SENTENCE
   Example: ["Call mom", "tomorrow at 5pm"] → Merge to "Call mom tomorrow at 5pm"
4. Generic task + specific action that elaborate the same intent
   Example: ["Task for tomorrow morning", "Do laundry"] → Merge to "Do laundry tomorrow morning"
   Example: ["Add event for Friday", "Eat with friends"] → Merge to "Eat with friends on Friday"

**KEEP SEPARATE if different:**
- Different actions ("Do laundry" vs "Eat with friends") → SEPARATE
- Different timings ("Tomorrow" vs "Saturday") → SEPARATE
- Different people/places → SEPARATE
- Different objects ("Buy milk" vs "Buy eggs") → SEPARATE
- Ideas vs tasks → SEPARATE

**SPECIAL CASE - Generic + Specific:**
If one item is generic timing/placeholder AND another is the specific action, MERGE THEM:
- ["Task for tomorrow morning at five", "Do laundry"] → MERGE to "Do laundry tomorrow morning at five"
- ["Add event for Friday", "Eat porridge"] → MERGE to "Eat porridge on Friday"
The generic item has the timing, the specific item has the action → combine both!

**When in doubt → KEEP SEPARATE** (unless it's the generic+specific pattern above)

**When merging:**
- Use the MOST SPECIFIC and COMPLETE title
- Preserve ALL details (time, date, location, people)
- NEVER include meta-phrases in final title`,
          },
          {
            role: 'user',
            content: `All current items:
${JSON.stringify(this.extractedItems.map((item, idx) => ({
  index: idx,
  type: item.type,
  title: item.content,
  due_date: item.due_date,
  scheduled_time: item.scheduled_time
})), null, 2)}

IMPORTANT: Only merge TRUE DUPLICATES or meta-phrases. Keep different actions SEPARATE.

Examples of what to merge:
- ["Add to my list"] → DELETE (pure meta-phrase)
- ["Do laundry", "Laundry tomorrow"] → MERGE (same action)
- ["Task for tomorrow morning", "Do laundry"] → MERGE to "Do laundry tomorrow morning" (generic + specific = complete task)

Examples of what to KEEP SEPARATE:
- ["Do laundry tomorrow", "Eat with friends Saturday"] → KEEP SEPARATE (different actions, different days)
- ["Buy milk", "Buy eggs"] → KEEP SEPARATE (different items)
- ["Task for tomorrow", "What if life isn't crazy"] → KEEP SEPARATE (task vs idea)

Return merge operations. If no duplicates found, return empty merges array.`,
          },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      const result = response.choices[0].message.content;
      if (!result) return;

      const analysis = JSON.parse(result);

      if (analysis.merges && analysis.merges.length > 0) {
        console.log('[Streaming] 🔄 Found', analysis.merges.length, 'merges to perform');

        for (const merge of analysis.merges) {
          const indices = merge.indices_to_merge || [];
          if (indices.length < 2) continue;

          console.log('[Streaming] 🔄 Merging indices:', indices, '→', merge.merged_title);

          // Keep the first index, delete the rest
          const keepIndex = Math.min(...indices);
          const deleteIndices = indices.filter(i => i !== keepIndex).sort((a, b) => b - a);

          // Update the kept item with merged content
          if (keepIndex >= 0 && keepIndex < this.extractedItems.length) {
            this.extractedItems[keepIndex].content = merge.merged_title;
            this.extractedItems[keepIndex].description = merge.merged_description;
            this.extractedItems[keepIndex].type = merge.merged_type || this.extractedItems[keepIndex].type;
            this.extractedItems[keepIndex].due_date = merge.due_date;
            this.extractedItems[keepIndex].scheduled_time = merge.scheduled_time;

            // Delete the other items (in reverse order to maintain indices)
            for (const idx of deleteIndices) {
              if (idx >= 0 && idx < this.extractedItems.length) {
                this.extractedItems.splice(idx, 1);
              }
            }
          }
        }

        // Emit consolidated items to refresh UI
        this.emit('items_consolidated', {
          items: this.extractedItems,
        });

        console.log('[Streaming] ✅ Consolidation complete. New count:', this.extractedItems.length);
      } else {
        console.log('[Streaming] ✅ No consolidation needed');
      }
    } catch (err) {
      console.error('[Streaming] ❌ Consolidation failed (non-fatal):', err);
      // Don't propagate error - let recording continue
    } finally {
      this.pendingConsolidation = false;
    }
  }

  /**
   * Get default icon for item type
   */
  private getDefaultIcon(type: string): string {
    const icons: Record<string, string> = {
      task: '✅',
      event: '📅',
      reminder: '🔔',
      idea: '💡',
      shopping: '🛒',
      note: '📝',
    };
    return icons[type] || '📋';
  }

  /**
   * Stop recording
   */
  async stopRecording(): Promise<void> {
    console.log('[Streaming] ⏹ Stopping recording...');

    // CRITICAL: Do final extraction to catch any remaining text
    if (this.fullTranscript && this.fullTranscript.trim().length > 0) {
      console.log('[Streaming] 🔚 Performing FINAL extraction before stopping');
      console.log('[Streaming] 📝 Final transcript:', this.fullTranscript);

      try {
        // Force immediate extraction of any remaining text
        await this.extractActionCards(this.fullTranscript);
        console.log('[Streaming] ✅ Final extraction complete');
      } catch (err) {
        console.error('[Streaming] ❌ Final extraction failed:', err);
        // Continue with stop even if extraction fails
      }
    } else {
      console.log('[Streaming] ℹ️  No transcript to extract');
    }

    // Clear keep-alive interval
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }

    // Clear consolidation interval
    if (this.consolidationInterval) {
      clearInterval(this.consolidationInterval);
      this.consolidationInterval = null;
    }

    if (this.connection) {
      this.connection.finish();
      this.connection = null;
    }

    this.cleanup();
    console.log('[Streaming] ✅ Recording stopped');
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  /**
   * Register event handler
   */
  on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /**
   * Unregister event handler
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (err) {
          console.error(`[Streaming] Error in ${event} handler:`, err);
        }
      });
    }
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    console.log('[Streaming] 🔌 Disconnecting...');

    // Clear keep-alive interval
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }

    // Clear consolidation interval
    if (this.consolidationInterval) {
      clearInterval(this.consolidationInterval);
      this.consolidationInterval = null;
    }

    this.stopRecording();
    this.eventHandlers.clear();
    this.fullTranscript = '';
    this.extractedItems = [];
    this.lastProcessedTranscript = '';
  }
}
