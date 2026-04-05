/**
 * WebSocket Manager for DeepGram Real-Time Transcription Demo
 *
 * Handles:
 * - WebSocket connection to backend /ws/demo-deepgram endpoint
 * - Microphone audio capture and streaming
 * - PCM16 audio conversion via AudioWorklet
 * - Event-based message handling (transcript, action cards, errors)
 */

export type WSMessageType =
  | 'interim_transcript'
  | 'transcript'
  | 'action_card'
  | 'error'
  | 'connection_established';

export interface WSMessage {
  type: WSMessageType;
  text?: string;
  data?: any;
  action?: 'create';
  card?: {
    type: string;
    title: string;
    description: string;
    icon: string;
  };
}

type EventHandler = (msg: WSMessage) => void;

export class DemoWebSocketManager {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sequenceNumber = 0;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private wsUrl: string;

  constructor(wsUrl: string) {
    this.wsUrl = wsUrl;
  }

  /**
   * Connect to WebSocket endpoint
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('[WS] 🔌 Attempting WebSocket connection');
        console.log('[WS] 📍 URL:', this.wsUrl);
        console.log('[WS] 🌐 Protocol:', this.wsUrl.startsWith('wss') ? 'Secure (WSS)' : 'Unsecure (WS)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('[WS] ✅ Connected successfully!');
          console.log('[WS] 🎯 Ready state:', this.ws?.readyState);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connection_established', { type: 'connection_established' });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            console.log('[WS] 📨 Received:', message.type, message);
            this.emit(message.type, message);
          } catch (err) {
            console.error('[WS] ❌ Failed to parse message:', err);
            console.error('[WS] 📦 Raw data:', event.data);
          }
        };

        this.ws.onerror = (error) => {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.error('[WS] ❌ WebSocket ERROR occurred');
          console.error('[WS] 🔍 Error object:', error);
          console.error('[WS] 📍 URL attempted:', this.wsUrl);
          console.error('[WS] 🎯 Ready state:', this.ws?.readyState);
          console.log('[WS] 💡 Common causes:');
          console.log('[WS]    - Backend not running or not deployed');
          console.log('[WS]    - CORS policy blocking connection');
          console.log('[WS]    - Endpoint does not exist (404)');
          console.log('[WS]    - SSL/TLS certificate issues (WSS)');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          this.emit('error', {
            type: 'error',
            data: {
              message: `WebSocket connection failed to ${this.wsUrl}`,
              url: this.wsUrl,
              readyState: this.ws?.readyState
            }
          });
          reject(new Error(`WebSocket connection failed to ${this.wsUrl}`));
        };

        this.ws.onclose = (event) => {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('[WS] 🔌 Connection closed');
          console.log('[WS] 📊 Close code:', event.code);
          console.log('[WS] 📝 Close reason:', event.reason || 'No reason provided');
          console.log('[WS] 🔄 Clean close:', event.wasClean ? 'Yes' : 'No');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          this.isConnected = false;
          this.cleanup();
        };

        // Timeout after 10 seconds
        setTimeout(() => {
          if (!this.isConnected) {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('[WS] ⏱️  Connection TIMEOUT (10 seconds)');
            console.error('[WS] 📍 URL:', this.wsUrl);
            console.error('[WS] 🎯 Ready state:', this.ws?.readyState);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            reject(new Error(`WebSocket connection timeout to ${this.wsUrl}`));
          }
        }, 10000);
      } catch (err) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('[WS] ❌ Connection setup error:', err);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        reject(err);
      }
    });
  }

  /**
   * Start recording and streaming audio
   */
  async startRecording(): Promise<void> {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('[WS] 🎤 Starting recording...');

      // 1. Get microphone access
      console.log('[WS] 🔍 Requesting microphone access...');
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      console.log('[WS] ✅ Microphone access granted');
      console.log('[WS] 📊 Audio tracks:', this.mediaStream.getAudioTracks().length);

      // 2. Create AudioContext with correct sample rate
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      console.log('[WS] 🎵 AudioContext created (sample rate: 16000)');
      console.log('[WS] 🎯 AudioContext state:', this.audioContext.state);

      // 3. Load AudioWorklet processor
      try {
        console.log('[WS] 📦 Loading AudioWorklet from /audio-processor.js...');
        await this.audioContext.audioWorklet.addModule('/audio-processor.js');
        console.log('[WS] ✅ AudioWorklet loaded successfully');
      } catch (err) {
        console.error('[WS] ❌ Failed to load AudioWorklet:', err);
        console.error('[WS] 💡 Make sure /public/audio-processor.js exists');
        throw new Error('Failed to load audio processor');
      }

      // 4. Create AudioWorklet node
      this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm16-processor');
      console.log('[WS] 🔧 AudioWorklet node created');

      // 5. Handle processed audio chunks
      this.workletNode.port.onmessage = (event) => {
        const pcm16Data = event.data; // Int16Array
        this.sendAudioFrame(pcm16Data);
      };

      // 6. Connect audio graph
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.workletNode);

      console.log('[WS] 🔗 Audio pipeline connected');
      console.log('[WS] 📊 Pipeline: Microphone → AudioWorklet → PCM16 → WebSocket');

      // 7. Send start command to backend
      this.send({
        type: 'start',
        sample_rate: 16000,
        channels: 1,
        format: 'pcm16',
      });

      console.log('[WS] 📤 Sent START command to backend');
      console.log('[WS] ✅ Recording started successfully');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (err: any) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('[WS] ❌ Failed to start recording:', err);
      console.error('[WS] 📛 Error name:', err.name);
      console.error('[WS] 📝 Error message:', err.message);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      this.cleanup();
      throw err;
    }
  }

  /**
   * Stop recording and close connections
   */
  async stopRecording(): Promise<void> {
    console.log('[WS] Stopping recording...');

    // Send stop command to backend
    if (this.ws && this.isConnected) {
      try {
        this.send({ type: 'stop' });
      } catch (err) {
        console.error('[WS] Failed to send stop command:', err);
      }
    }

    // Clean up audio resources
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close();
      this.audioContext = null;
    }

    console.log('[WS] Recording stopped');
  }

  /**
   * Send audio frame to WebSocket
   */
  private sendAudioFrame(pcm16Data: Int16Array): void {
    if (!this.ws || !this.isConnected) {
      return;
    }

    try {
      // Create frame: 12-byte header + audio data
      const header = new ArrayBuffer(12);
      const view = new DataView(header);

      // Sequence number (8 bytes, BigUint64)
      view.setBigUint64(0, BigInt(this.sequenceNumber), true);

      // Timestamp (4 bytes, Uint32)
      view.setUint32(8, Date.now() & 0xFFFFFFFF, true);

      // Combine header + audio data
      const frame = new Uint8Array(12 + pcm16Data.byteLength);
      frame.set(new Uint8Array(header), 0);
      frame.set(new Uint8Array(pcm16Data.buffer), 12);

      // Send binary frame
      this.ws.send(frame);

      // Log every 50th frame to avoid spam
      if (this.sequenceNumber % 50 === 0) {
        console.log(`[WS] 📡 Sent ${this.sequenceNumber} audio frames (${(pcm16Data.byteLength / 1024).toFixed(1)} KB)`);
      }

      this.sequenceNumber++;
    } catch (err) {
      console.error('[WS] ❌ Failed to send audio frame:', err);
    }
  }

  /**
   * Send JSON message to WebSocket
   */
  private send(message: any): void {
    if (!this.ws || !this.isConnected) {
      console.warn('[WS] Cannot send message - not connected');
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (err) {
      console.error('[WS] Failed to send message:', err);
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
   * Emit event to all registered handlers
   */
  private emit(event: string, message: WSMessage): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (err) {
          console.error(`[WS] Error in event handler for ${event}:`, err);
        }
      });
    }
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    console.log('[WS] Disconnecting...');

    this.stopRecording().catch(err => {
      console.error('[WS] Error stopping recording:', err);
    });

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.eventHandlers.clear();
    this.sequenceNumber = 0;
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
      this.audioContext.close().catch(err => {
        console.error('[WS] Error closing AudioContext:', err);
      });
      this.audioContext = null;
    }
  }

  /**
   * Check if connected
   */
  isReady(): boolean {
    return this.isConnected && this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
