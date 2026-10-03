"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWakeLock } from "../use-wake-lock";
import { LevelMeter, type Weighting } from "./level-meter";
import styles from "./volume.module.css";

const SCALE_MIN = 30;
const SCALE_MAX = 100;
const WARN_MARGIN = 6; // dB below the limit where the meter turns amber
const OVER_HOLD_MS = 2000; // stay red this long after dropping back under, so it doesn't flicker
const HISTORY_INTERVAL_MS = 250;
const HISTORY_LENGTH = 480; // 2 minutes
const UI_INTERVAL_MS = 80;
const QUIET_ROOM_DB = 35;
const STORAGE_KEY = "volume-settings";

const PRESETS = [
  { label: "Late night", limit: 55 },
  { label: "Chatting", limit: 65 },
  { label: "Lively", limit: 72 },
];

interface Settings {
  limit: number;
  /** Added to dBFS to get an approximate dB SPL. Depends on the device's mic. */
  offset: number;
  weighting: Weighting;
}

const DEFAULT_SETTINGS: Settings = { limit: 65, offset: 100, weighting: "A" };

type Zone = "ok" | "warn" | "over";

interface Live {
  level: number;
  avg: number;
  peak: number;
  zone: Zone;
  overMs: number;
  incidents: number;
  max: number;
}

const EMPTY_LIVE: Live = { level: 0, avg: 0, peak: 0, zone: "ok", overMs: 0, incidents: 0, max: 0 };

type Status = { kind: "idle" } | { kind: "starting" } | { kind: "running" } | { kind: "error"; message: string };

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

function errorMessage(err: unknown) {
  const name = err instanceof Error ? (err.name === "Error" ? err.message : err.name) : "";
  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Mic access was blocked. Allow the microphone for this site in your browser settings, then try again.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "No microphone found on this device.";
    case "NotReadableError":
      return "The mic is busy — another app might be using it.";
    case "insecure":
      return "Mic access needs HTTPS. Open this page via https://.";
    case "unsupported":
      return "This browser can't access the microphone.";
    default:
      return "Couldn't start the microphone.";
  }
}

const toPercent = (db: number) => Math.min(Math.max((db - SCALE_MIN) / (SCALE_MAX - SCALE_MIN), 0), 1) * 100;

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const ZONE_TEXT: Record<Zone, string> = {
  ok: "All good",
  warn: "Getting loud",
  over: "Too loud — keep it down",
};

export default function VolumeMeter() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [live, setLive] = useState<Live>(EMPTY_LIVE);

  const meterRef = useRef<LevelMeter | null>(null);
  const settingsRef = useRef(settings);
  const slowDbfsRef = useRef(-100);
  const statsRef = useRef({ overMs: 0, incidents: 0, max: 0 });
  const historyRef = useRef<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    settingsRef.current = settings;
    meterRef.current?.setWeighting(settings.weighting);
    if (status.kind === "running") saveSettings(settings);
  }, [settings, status.kind]);

  const stop = useCallback(() => {
    meterRef.current?.stop();
    meterRef.current = null;
    setStatus({ kind: "idle" });
  }, []);

  const start = async () => {
    const stored = loadSettings();
    setSettings(stored);
    settingsRef.current = stored;
    setStatus({ kind: "starting" });
    try {
      const meter = await LevelMeter.start(stored.weighting);
      meterRef.current = meter;
      statsRef.current = { overMs: 0, incidents: 0, max: 0 };
      historyRef.current = [];
      setLive(EMPTY_LIVE);
      meter.onEnded(() => {
        meterRef.current?.stop();
        meterRef.current = null;
        setStatus({ kind: "error", message: "The microphone was disconnected." });
      });
      setStatus({ kind: "running" });
    } catch (err) {
      setStatus({ kind: "error", message: errorMessage(err) });
    }
  };

  // Release the mic if the page is left while running.
  useEffect(() => () => meterRef.current?.stop(), []);

  useWakeLock(status.kind === "running");

  // Measurement loop.
  useEffect(() => {
    if (status.kind !== "running") return;
    const meter = meterRef.current;
    if (!meter) return;

    let frame = 0;
    let last = 0;
    let lastUi = 0;
    let lastHistory = 0;
    let historyMax = -Infinity;
    let peak = 0;
    let peakAt = 0;
    let lastAbove = -Infinity;
    let zone: Zone = "ok";

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const { limit, offset } = settingsRef.current;
      const raw = meter.read(now);
      slowDbfsRef.current = raw.slow;
      const level = raw.fast + offset;
      const avg = raw.slow + offset;
      const dt = last ? Math.min(now - last, 250) : 0;
      last = now;

      // Peak hold: hang for 1.5 s, then fall at 20 dB/s.
      if (level >= peak) {
        peak = level;
        peakAt = now;
      } else if (now - peakAt > 1500) {
        peak = Math.max(level, peak - (20 * dt) / 1000);
      }

      const stats = statsRef.current;
      stats.max = Math.max(stats.max, level);
      if (avg > limit) {
        lastAbove = now;
        stats.overMs += dt;
      }
      const next: Zone = now - lastAbove < OVER_HOLD_MS ? "over" : avg > limit - WARN_MARGIN ? "warn" : "ok";
      if (next === "over" && zone !== "over") stats.incidents++;
      zone = next;

      historyMax = Math.max(historyMax, level);
      if (now - lastHistory >= HISTORY_INTERVAL_MS) {
        const history = historyRef.current;
        history.push(historyMax);
        if (history.length > HISTORY_LENGTH) history.shift();
        historyMax = -Infinity;
        lastHistory = now;
        drawHistory(canvasRef.current, history, limit);
      }

      if (now - lastUi >= UI_INTERVAL_MS) {
        lastUi = now;
        setLive({ level, avg, peak, zone, ...stats });
      }
    };
    frame = requestAnimationFrame(tick);

    // iOS suspends audio while the page is in the background.
    const onVisibility = () => {
      if (document.visibilityState === "visible") meter.resume();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [status.kind]);

  // Redraw the graph immediately when the limit line moves.
  useEffect(() => {
    if (status.kind === "running") drawHistory(canvasRef.current, historyRef.current, settings.limit);
  }, [settings.limit, status.kind]);

  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));

  const calibrateQuietRoom = () => {
    update({ offset: Math.round(QUIET_ROOM_DB - slowDbfsRef.current) });
  };

  const resetStats = () => {
    statsRef.current = { overMs: 0, incidents: 0, max: 0 };
    historyRef.current = [];
    drawHistory(canvasRef.current, [], settings.limit);
  };

  if (status.kind !== "running") {
    return (
      <div className={styles.root} data-zone="ok">
        <div className={styles.intro}>
          <p className={styles.eyebrow}>volume</p>
          <h1 className={styles.introTitle}>How loud are we?</h1>
          <p className={styles.introText}>
            Live noise meter from your mic. Set a limit and the screen turns red when you&apos;re loud enough to
            annoy the neighbours.
          </p>
          <button
            type="button"
            className={styles.startButton}
            onClick={start}
            disabled={status.kind === "starting"}
          >
            {status.kind === "starting" ? "Starting…" : "Start listening"}
          </button>
          {status.kind === "error" && (
            <p className={styles.error} role="alert">
              {status.message}
            </p>
          )}
          <p className={styles.fineprint}>Audio is processed on your device and never recorded or uploaded.</p>
        </div>
      </div>
    );
  }

  const zone = live.zone;
  const rounded = Math.round(live.level);

  return (
    <div className={styles.root} data-zone={zone}>
      <div className={styles.app}>
        <div className={styles.topBar}>
          <span className={styles.eyebrow}>volume</span>
          <button type="button" className={styles.ghostButton} onClick={stop}>
            Stop
          </button>
        </div>

        <section className={styles.readout} aria-label="Current level">
          <div className={styles.number}>
            {rounded < SCALE_MIN ? `<${SCALE_MIN}` : rounded}
            <span className={styles.unit}>dB{settings.weighting === "A" ? "(A)" : ""}</span>
          </div>
          <p className={styles.status} aria-live="polite">
            {ZONE_TEXT[zone]}
          </p>
          <p className={styles.sub}>
            1s avg {Math.round(live.avg)} · limit {settings.limit}
          </p>
        </section>

        <div
          className={styles.meter}
          role="meter"
          aria-label="Noise level"
          aria-valuemin={SCALE_MIN}
          aria-valuemax={SCALE_MAX}
          aria-valuenow={Math.round(Math.min(Math.max(live.level, SCALE_MIN), SCALE_MAX))}
        >
          <div className={styles.meterFill} style={{ transform: `scaleX(${toPercent(live.level) / 100})` }} />
          <div className={styles.meterPeak} style={{ left: `${toPercent(live.peak)}%` }} />
          <div className={styles.meterLimit} style={{ left: `${toPercent(settings.limit)}%` }}>
            <span>{settings.limit}</span>
          </div>
        </div>
        <div className={styles.scale} aria-hidden="true">
          {[30, 40, 50, 60, 70, 80, 90, 100].map((db) => (
            <span key={db} style={{ left: `${toPercent(db)}%` }}>
              {db}
            </span>
          ))}
        </div>

        <canvas ref={canvasRef} className={styles.history} aria-label="Level over the last two minutes" />

        <dl className={styles.stats}>
          <div>
            <dt>Over limit</dt>
            <dd>{formatDuration(live.overMs)}</dd>
          </div>
          <div>
            <dt>Times</dt>
            <dd>{live.incidents}</dd>
          </div>
          <div>
            <dt>Loudest</dt>
            <dd>{live.max ? Math.round(live.max) : "–"}</dd>
          </div>
        </dl>

        <section className={styles.settings} aria-label="Settings">
          <div className={styles.field}>
            <div className={styles.fieldHead}>
              <label htmlFor="limit">Limit</label>
              <output htmlFor="limit">{settings.limit} dB</output>
            </div>
            <input
              id="limit"
              type="range"
              min={40}
              max={95}
              value={settings.limit}
              onChange={(e) => update({ limit: Number(e.target.value) })}
            />
            <div className={styles.chips}>
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className={styles.chip}
                  aria-pressed={settings.limit === preset.limit}
                  onClick={() => update({ limit: preset.limit })}
                >
                  {preset.label} · {preset.limit}
                </button>
              ))}
            </div>
            <p className={styles.hint}>
              Measured where the phone is, not at the wall. Rough guide: quiet chat ~55, normal conversation ~60–65,
              raised voices / laughing ~70+, music or shouting 80+.
            </p>
          </div>

          <div className={styles.field}>
            <div className={styles.fieldHead}>
              <span>Weighting</span>
            </div>
            <div className={styles.chips}>
              <button
                type="button"
                className={styles.chip}
                aria-pressed={settings.weighting === "A"}
                onClick={() => update({ weighting: "A" })}
              >
                dB(A) · like ears
              </button>
              <button
                type="button"
                className={styles.chip}
                aria-pressed={settings.weighting === "Z"}
                onClick={() => update({ weighting: "Z" })}
              >
                Flat · counts bass
              </button>
            </div>
          </div>

          <details className={styles.calibration}>
            <summary>Calibration</summary>
            <div className={styles.field}>
              <div className={styles.fieldHead}>
                <label htmlFor="offset">Mic offset</label>
                <output htmlFor="offset">+{settings.offset} dB</output>
              </div>
              <input
                id="offset"
                type="range"
                min={60}
                max={130}
                value={settings.offset}
                onChange={(e) => update({ offset: Number(e.target.value) })}
              />
              <button type="button" className={styles.ghostButton} onClick={calibrateQuietRoom}>
                Room is silent → set to {QUIET_ROOM_DB} dB
              </button>
              <p className={styles.hint}>
                Every phone mic is different, so readings are approximate. Either tap the button while everyone is
                quiet, or match the number to a proper sound meter app.
              </p>
            </div>
            <button type="button" className={styles.ghostButton} onClick={resetStats}>
              Reset stats
            </button>
          </details>
        </section>
      </div>
    </div>
  );
}

const COLORS = {
  line: "#8caf7c",
  fill: "rgba(140, 175, 124, 0.18)",
  overLine: "#ff6b57",
  overFill: "rgba(255, 107, 87, 0.3)",
  limit: "rgba(243, 242, 238, 0.45)",
};

function drawHistory(canvas: HTMLCanvasElement | null, history: number[], limit: number) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const y = (db: number) => height - (toPercent(db) / 100) * height;
  const step = width / (HISTORY_LENGTH - 1);
  const x0 = width - (history.length - 1) * step;
  const limitY = y(limit);

  if (history.length > 1) {
    const path = new Path2D();
    history.forEach((db, i) => (i ? path.lineTo(x0 + i * step, y(db)) : path.moveTo(x0, y(db))));
    const area = new Path2D(path);
    area.lineTo(width, height);
    area.lineTo(x0, height);
    area.closePath();

    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.fillStyle = COLORS.fill;
    ctx.fill(area);
    ctx.strokeStyle = COLORS.line;
    ctx.stroke(path);

    // Repaint whatever sits above the limit line in red.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, limitY);
    ctx.clip();
    ctx.fillStyle = COLORS.overFill;
    ctx.fill(area);
    ctx.strokeStyle = COLORS.overLine;
    ctx.stroke(path);
    ctx.restore();
  }

  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = COLORS.limit;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, Math.round(limitY) + 0.5);
  ctx.lineTo(width, Math.round(limitY) + 0.5);
  ctx.stroke();
  ctx.setLineDash([]);
}
