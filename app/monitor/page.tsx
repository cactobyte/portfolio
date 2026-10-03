import type { Metadata, Viewport } from "next";
import WordMonitor from "./word-monitor";

export const metadata: Metadata = {
  title: "Monitor",
  description: "Listens to the room and counts every n-word.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#07080a",
};

export default function MonitorPage() {
  return <WordMonitor />;
}
