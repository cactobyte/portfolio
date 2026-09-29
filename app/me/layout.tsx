import type { Metadata } from "next";
import "./me.css";

export const metadata: Metadata = {
  title: { template: "%s · me", default: "me" },
  robots: { index: false, follow: false },
};

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return <div className="me">{children}</div>;
}
