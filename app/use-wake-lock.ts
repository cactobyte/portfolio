import { useEffect } from "react";

/** Keeps the screen on while `active`, re-acquiring the lock when the page becomes visible again. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    let lock: WakeLockSentinel | null = null;
    let released = false;
    const request = () => {
      navigator.wakeLock
        ?.request("screen")
        .then((l) => {
          if (released) void l.release();
          else lock = l;
        })
        .catch(() => {});
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") request();
    };
    request();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      released = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void lock?.release();
    };
  }, [active]);
}
