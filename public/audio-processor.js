/**
 * AudioWorklet Processor for PCM16 Conversion
 *
 * Converts Float32 audio samples from Web Audio API to PCM16 format
 * for DeepGram real-time transcription.
 *
 * Float32: Audio samples in range [-1.0, 1.0]
 * PCM16: Audio samples as 16-bit signed integers [-32768, 32767]
 */

class PCM16Processor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.chunkSize = 4096; // Process in 4KB chunks for efficiency
    this.buffer = [];
    this.chunkCount = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];

    // Handle no input or empty input
    if (!input || input.length === 0) {
      return true;
    }

    const samples = input[0]; // First channel (mono)

    // Handle empty samples
    if (!samples || samples.length === 0) {
      return true;
    }

    // DEBUG: Calculate audio statistics on first few chunks
    if (this.chunkCount < 5 || this.chunkCount % 100 === 0) {
      // Calculate RMS (Root Mean Square) to measure audio level
      let sumSquares = 0;
      let maxAbsValue = 0;
      let nonZeroCount = 0;

      for (let i = 0; i < samples.length; i++) {
        const absVal = Math.abs(samples[i]);
        sumSquares += samples[i] * samples[i];
        maxAbsValue = Math.max(maxAbsValue, absVal);
        if (absVal > 0.001) nonZeroCount++;
      }

      const rms = Math.sqrt(sumSquares / samples.length);

      this.port.postMessage({
        type: 'debug',
        chunkCount: this.chunkCount,
        sampleCount: samples.length,
        rms: rms,
        maxAbsValue: maxAbsValue,
        nonZeroCount: nonZeroCount,
        percentNonZero: (nonZeroCount / samples.length * 100).toFixed(1),
      });
    }

    // Convert Float32 samples to PCM16
    const pcm16 = new Int16Array(samples.length);

    for (let i = 0; i < samples.length; i++) {
      // Clamp sample to [-1, 1] range
      const s = Math.max(-1, Math.min(1, samples[i]));

      // Convert to 16-bit integer
      // Negative samples: multiply by 0x8000 (32768)
      // Positive samples: multiply by 0x7FFF (32767)
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    this.chunkCount++;

    // Send converted audio to main thread with type marker
    // Transfer the buffer to avoid copying
    this.port.postMessage(
      { type: 'audio', data: pcm16.buffer },
      [pcm16.buffer]
    );

    // Continue processing
    return true;
  }
}

// Register the processor
registerProcessor('pcm16-processor', PCM16Processor);
