import type { Metadata, Viewport } from "next";
import VolumeMeter from "./volume-meter";

export const metadata: Metadata = {
  title: "Volume",
  description: "Live noise meter — goes red when you're too loud.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#07080a",
};

export default function VolumePage() {
  return <VolumeMeter />;
}
