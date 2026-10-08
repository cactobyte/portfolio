"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * - "unavailable": not a touch device, or no orientation events arrive (use idle sway)
 * - "needs-permission": iOS; call `request()` from a tap to enable
 * - "on": `tilt.current` is live
 * - "denied": the person declined the iOS prompt
 */
export type DeviceTiltStatus = "unavailable" | "needs-permission" | "on" | "denied";

type IOSOrientationEvent = { requestPermission?: () => Promise<"granted" | "denied"> };

const clampUnit = (v: number) => Math.max(-1, Math.min(1, v));

/**
 * Phone tilt as x/y in -1..1, written to a ref so a render loop can read it
 * without re-rendering. Only listens on coarse-pointer devices.
 */
export function useDeviceTilt(enabled: boolean) {
  const tilt = useRef({ x: 0, y: 0 });
  const [status, setStatus] = useState<DeviceTiltStatus>("unavailable");
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (!enabled || typeof DeviceOrientationEvent === "undefined") return;
    const ios = (DeviceOrientationEvent as unknown as IOSOrientationEvent).requestPermission;
    if (ios) {
      // Deferred so the status update doesn't happen synchronously inside the effect.
      queueMicrotask(() => setStatus((s) => (s === "unavailable" ? "needs-permission" : s)));
      return;
    }
    queueMicrotask(() => setListening(true));
  }, [enabled]);

  useEffect(() => {
    if (!listening) return;
    let received = false;
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma == null || event.beta == null) return;
      if (!received) {
        received = true;
        setStatus("on");
      }
      // ponytail: portrait mapping only; swap beta/gamma by screen.orientation.angle if landscape matters
      tilt.current.x = clampUnit(event.gamma / 30);
      tilt.current.y = clampUnit((event.beta - 45) / 30);
    };
    window.addEventListener("deviceorientation", onOrientation);
    return () => window.removeEventListener("deviceorientation", onOrientation);
  }, [listening]);

  /** Must run inside a tap handler on iOS. */
  const request = useCallback(async () => {
    const ios = (DeviceOrientationEvent as unknown as IOSOrientationEvent).requestPermission;
    const result = ios ? await ios().catch(() => "denied" as const) : "granted";
    if (result === "granted") setListening(true);
    else setStatus("denied");
  }, []);

  return { tilt, status, request };
}
