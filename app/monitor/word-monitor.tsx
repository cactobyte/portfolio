"use client";

import { useEffect, useRef, useState } from "react";
import { useWakeLock } from "../use-wake-lock";
import { censor, countHits } from "./detect";
import styles from "./monitor.module.css";

// The Web Speech API isn't in TypeScript's DOM lib yet.
interface RecognitionResultEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface RecognitionErrorEvent extends Event {
  error: string;
}
interface Recognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

const STORAGE_KEY = "monitor-tally";
const MAX_LOG = 50;
const MAX_LINES = 6;
const RESTART_DELAY_MS = 250;
const RETRY_DELAY_MS = 3000;

interface Catch {
  at: number;
  snippet: string;
  hits: number;
}

interface Tally {
  count: number;
  log: Catch[];
}

type Status =
  | { kind: "idle" }
  | { kind: "listening"; warning?: string }
  | { kind: "error"; message: string };

function getRecognitionCtor(): RecognitionCtor | undefined {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

function loadTally(): Tally {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { count: 0, log: [] };
}

function saveTally(tally: Tally) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tally));
  } catch {}
}

const formatTime = (at: number) =>
  new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

function Censored({ text }: { text: string }) {
  return (
    <>
      {censor(text).map((segment, i) =>
        segment.hit ? (
          <mark key={i} className={styles.hit}>
            {segment.text}
          </mark>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </>
  );
}

export default function WordMonitor() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [tally, setTally] = useState<Tally>({ count: 0, log: [] });
  const [lines, setLines] = useState<string[]>([]);
  const [interim, setInterim] = useState("");
  const [flash, setFlash] = useState(0);

  const recognitionRef = useRef<Recognition | null>(null);
  const wantRunningRef = useRef(false);
  const restartTimerRef = useRef<number | undefined>(undefined);
  const loadedRef = useRef(false);

  const listening = status.kind === "listening";
  useWakeLock(listening);

  useEffect(() => {
    if (loadedRef.current) saveTally(tally);
  }, [tally]);

  const stopRecognition = () => {
    wantRunningRef.current = false;
    window.clearTimeout(restartTimerRef.current);
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onresult = null;
      recognition.abort();
    }
  };

  // Release the mic if the page is left while listening.
  useEffect(() => stopRecognition, []);

  const fail = (message: string) => {
    stopRecognition();
    setInterim("");
    setStatus({ kind: "error", message });
  };

  // Continuous recognition still ends on its own (silence, time limits, network blips), so each
  // session is a fresh instance that restarts itself until the user hits stop.
  const startSession = (Ctor: RecognitionCtor) => {
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;
    let counted = 0; // final results already counted, in case a browser re-delivers them
    let retryDelay = RESTART_DELAY_MS;

    recognition.onresult = (event) => {
      let pending = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript.trim();
        if (!result.isFinal) {
          pending += ` ${text}`;
          continue;
        }
        if (i < counted || !text) continue;
        counted = i + 1;
        setLines((prev) => [...prev, text].slice(-MAX_LINES));
        const hits = countHits(text);
        if (hits) {
          setTally((prev) => ({
            count: prev.count + hits,
            log: [{ at: Date.now(), snippet: text, hits }, ...prev.log].slice(0, MAX_LOG),
          }));
          setFlash((n) => n + 1);
          navigator.vibrate?.(200);
        }
      }
      setInterim(pending.trim());
      retryDelay = RESTART_DELAY_MS;
      setStatus({ kind: "listening" });
    };

    recognition.onerror = (event) => {
      switch (event.error) {
        case "not-allowed":
        case "service-not-allowed":
          fail("Mic or speech recognition was blocked. Allow the microphone for this site, then try again.");
          return;
        case "audio-capture":
          fail("No microphone found, or another app is using it.");
          return;
        case "language-not-supported":
          fail("This browser's speech service doesn't support English here.");
          return;
        case "network":
          retryDelay = RETRY_DELAY_MS;
          setStatus({ kind: "listening", warning: "Can't reach the speech service — retrying…" });
          return;
        default:
          // "no-speech" and "aborted" are routine; the session just restarts.
          return;
      }
    };

    recognition.onend = () => {
      if (!wantRunningRef.current || recognitionRef.current !== recognition) return;
      setInterim("");
      restartTimerRef.current = window.setTimeout(() => {
        if (wantRunningRef.current) startSession(Ctor);
      }, retryDelay);
    };

    try {
      recognition.start();
    } catch {
      fail("Couldn't start speech recognition.");
    }
  };

  const start = () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setStatus({
        kind: "error",
        message: "This browser doesn't support speech recognition. Use Chrome (Android/desktop) or Safari (iPhone/Mac).",
      });
      return;
    }
    if (!loadedRef.current) {
      loadedRef.current = true;
      setTally(loadTally());
    }
    setLines([]);
    setInterim("");
    wantRunningRef.current = true;
    setStatus({ kind: "listening" });
    startSession(Ctor);
  };

  const stop = () => {
    stopRecognition();
    setInterim("");
    setStatus({ kind: "idle" });
  };

  const reset = () => {
    if (window.confirm("Reset the counter to 0?")) setTally({ count: 0, log: [] });
  };

  if (!listening) {
    return (
      <div className={styles.root}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>monitor</p>
          <h1 className={styles.introTitle}>N-word counter</h1>
          <p className={styles.introText}>
            Listens to the room and counts every time someone says it. Leave it on the table near whoever&apos;s
            talking — the closer, the more it catches.
          </p>
          <button type="button" className={styles.startButton} onClick={start}>
            Start listening
          </button>
          {status.kind === "error" && (
            <p className={styles.error} role="alert">
              {status.message}
            </p>
          )}
          <p className={styles.fineprint}>
            Speech is transcribed by your browser&apos;s speech service (Google in Chrome, Apple in Safari), so audio
            is sent to them while listening. Only the count and caught lines are saved, on this device.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {flash > 0 && (
        <div key={flash} className={styles.flash} aria-hidden="true">
          +1
        </div>
      )}
      <div className={styles.app}>
        <div className={styles.topBar}>
          <span className={styles.live}>
            <span className={styles.dot} aria-hidden="true" />
            {status.warning ?? "Listening"}
          </span>
          <button type="button" className={styles.ghostButton} onClick={stop}>
            Stop
          </button>
        </div>

        <section className={styles.counter} aria-live="polite">
          <div key={tally.count} className={styles.count}>
            {tally.count}
          </div>
          <p className={styles.countLabel}>n-word count</p>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Live transcript</h2>
          <div className={styles.transcript}>
            {lines.length === 0 && !interim && <p className={styles.empty}>Waiting for speech…</p>}
            {lines.map((line, i) => (
              <p key={`${lines.length}-${i}`}>
                <Censored text={line} />
              </p>
            ))}
            {interim && (
              <p className={styles.interim}>
                <Censored text={interim} />
              </p>
            )}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Caught</h2>
            <button type="button" className={styles.ghostButton} onClick={reset} disabled={tally.count === 0}>
              Reset
            </button>
          </div>
          {tally.log.length === 0 ? (
            <p className={styles.empty}>Clean so far.</p>
          ) : (
            <ol className={styles.log}>
              {tally.log.map((entry) => (
                <li key={entry.at}>
                  <time>{formatTime(entry.at)}</time>
                  <span>
                    <Censored text={entry.snippet} />
                    {entry.hits > 1 && <strong> ×{entry.hits}</strong>}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <p className={styles.fineprint}>
          Speech recognition misses things in a noisy room and can&apos;t tell who said it. Audio goes to your
          browser&apos;s speech service while listening.
        </p>
      </div>
    </div>
  );
}
