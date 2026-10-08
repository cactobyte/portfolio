import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import VolumeMeter from "./volume-meter";

// The meter keeps its own type; the rest of the site uses Funnel.
const mono = IBM_Plex_Mono({ variable: "--mono-font", weight: ["400", "500", "600"], subsets: ["latin"] });
const sans = Inter({ variable: "--sans-font", weight: ["400", "500"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: { absolute: "Volume" },
  description: "Live noise meter — goes red when you're too loud.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#07080a",
};

export default function VolumePage() {
  return (
    <div className={`${mono.variable} ${sans.variable} contents`}>
      <VolumeMeter />
    </div>
  );
}
