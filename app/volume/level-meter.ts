export type Weighting = "A" | "Z";

// Standard sound-level-meter time constants (IEC 61672 "fast" and a 1 s average).
const TAU_FAST = 0.125;
const TAU_SLOW = 1;
const MIN_MEAN_SQUARE = 1e-10; // -100 dBFS floor

// A-weighting poles (Hz). The curve is s^4 / ((s+f1)^2 (s+f2)(s+f3)(s+f4)^2), which maps exactly onto
// three biquads: a double-pole highpass at f1, a highpass whose two real poles are f2 and f3, and a
// double-pole lowpass at f4. Web Audio's highpass/lowpass Q is in dB, hence the conversion.
const A_F1 = 20.598997;
const A_F2 = 107.65265;
const A_F3 = 737.86223;
const A_F4 = 12194.217;

const qDb = (q: number) => 20 * Math.log10(q);

export interface Levels {
  /** Fast (125 ms) level in dBFS. */
  fast: number;
  /** Slow (1 s) level in dBFS. */
  slow: number;
}

/** Live microphone level meter. Everything runs locally in the Web Audio graph; no audio leaves the device. */
export class LevelMeter {
  private readonly buffer: Float32Array<ArrayBuffer>;
  private readonly aWeighting: BiquadFilterNode[];
  private weighting: Weighting = "A";
  private gainCorrection = 0;
  private fastMs = 0;
  private slowMs = 0;
  private lastTime = 0;

  private constructor(
    private readonly ctx: AudioContext,
    private readonly stream: MediaStream,
    private readonly source: MediaStreamAudioSourceNode,
    private readonly analyser: AnalyserNode,
  ) {
    this.buffer = new Float32Array(analyser.fftSize);
    this.aWeighting = [
      new BiquadFilterNode(ctx, { type: "highpass", frequency: A_F1, Q: qDb(0.5) }),
      new BiquadFilterNode(ctx, {
        type: "highpass",
        frequency: Math.sqrt(A_F2 * A_F3),
        Q: qDb(Math.sqrt(A_F2 * A_F3) / (A_F2 + A_F3)),
      }),
      new BiquadFilterNode(ctx, { type: "lowpass", frequency: A_F4, Q: qDb(0.5) }),
    ];
    for (let i = 0; i < this.aWeighting.length - 1; i++) this.aWeighting[i].connect(this.aWeighting[i + 1]);

    // Some browsers (Safari) don't pull audio through nodes that never reach the destination,
    // so route the analyser into a muted gain node.
    const mute = new GainNode(ctx, { gain: 0 });
    analyser.connect(mute).connect(ctx.destination);
  }

  /** Must be called from a user gesture (iOS won't start an AudioContext otherwise). */
  static async start(weighting: Weighting): Promise<LevelMeter> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(window.isSecureContext ? "unsupported" : "insecure");
    }
    const ctx = new AudioContext();
    let stream: MediaStream;
    try {
      // Browser voice processing would flatten the levels we're trying to measure.
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
    } catch (err) {
      void ctx.close();
      throw err;
    }
    await ctx.resume();
    const source = new MediaStreamAudioSourceNode(ctx, { mediaStream: stream });
    const analyser = new AnalyserNode(ctx, { fftSize: 2048 });
    const meter = new LevelMeter(ctx, stream, source, analyser);
    meter.connect(weighting);
    return meter;
  }

  setWeighting(weighting: Weighting) {
    if (weighting === this.weighting) return;
    this.source.disconnect();
    this.aWeighting[this.aWeighting.length - 1].disconnect();
    this.connect(weighting);
  }

  private connect(weighting: Weighting) {
    this.weighting = weighting;
    if (weighting === "A") {
      this.source.connect(this.aWeighting[0]);
      this.aWeighting[this.aWeighting.length - 1].connect(this.analyser);
      this.gainCorrection = -this.chainGainDb(1000);
    } else {
      this.source.connect(this.analyser);
      this.gainCorrection = 0;
    }
  }

  /** Gain of the A-weighting chain at a frequency, used to normalise it to 0 dB at 1 kHz. */
  private chainGainDb(frequency: number) {
    const freq = new Float32Array([frequency]);
    const mag = new Float32Array(1);
    const phase = new Float32Array(1);
    let gain = 1;
    for (const filter of this.aWeighting) {
      filter.getFrequencyResponse(freq, mag, phase);
      gain *= mag[0];
    }
    return 20 * Math.log10(gain);
  }

  /** Sample the mic and advance the fast/slow averages. Call once per animation frame. */
  read(now: number): Levels {
    this.analyser.getFloatTimeDomainData(this.buffer);
    let sum = 0;
    for (let i = 0; i < this.buffer.length; i++) sum += this.buffer[i] * this.buffer[i];
    const ms = sum / this.buffer.length;

    if (this.lastTime === 0) {
      this.fastMs = ms;
      this.slowMs = ms;
    } else {
      // Clamp dt so a backgrounded tab doesn't produce a huge jump when it comes back.
      const dt = Math.min(Math.max((now - this.lastTime) / 1000, 0), 0.25);
      this.fastMs += (ms - this.fastMs) * (1 - Math.exp(-dt / TAU_FAST));
      this.slowMs += (ms - this.slowMs) * (1 - Math.exp(-dt / TAU_SLOW));
    }
    this.lastTime = now;

    return { fast: this.toDb(this.fastMs), slow: this.toDb(this.slowMs) };
  }

  private toDb(ms: number) {
    return 10 * Math.log10(Math.max(ms, MIN_MEAN_SQUARE)) + this.gainCorrection;
  }

  /** iOS suspends the context when the page is backgrounded. */
  resume() {
    if (this.ctx.state !== "running") void this.ctx.resume();
  }

  onEnded(callback: () => void) {
    for (const track of this.stream.getAudioTracks()) track.addEventListener("ended", callback);
  }

  stop() {
    for (const track of this.stream.getTracks()) track.stop();
    void this.ctx.close();
  }
}
