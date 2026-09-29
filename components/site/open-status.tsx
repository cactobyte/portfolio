"use client";

import { useSyncExternalStore } from "react";
import { openState } from "@/lib/sites/hours";
import type { OpeningHours } from "@/lib/sites/types";

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 30_000);
  return () => window.clearInterval(id);
}

// Rounded to the minute so the snapshot stays stable between ticks.
const currentMinute = () => Math.floor(Date.now() / 60_000);
const noMinuteOnServer = () => null;

export default function OpenStatus({ hours }: { hours: OpeningHours[] }) {
  const minute = useSyncExternalStore(subscribe, currentMinute, noMinuteOnServer);

  // Opening status depends on the visitor's clock, so it only renders in the browser.
  if (minute === null) return <p className="open-status" aria-hidden="true" />;

  const state = openState(hours, new Date(minute * 60_000));
  if (state.open) {
    return (
      <p className="open-status" data-open="true">
        Open now, until {state.closesAt}
      </p>
    );
  }
  if (state.opensAt === null) return null;
  return (
    <p className="open-status" data-open="false">
      Closed. Opens {state.label === "today" ? `at ${state.opensAt}` : `${state.label} ${state.opensAt}`}
    </p>
  );
}
