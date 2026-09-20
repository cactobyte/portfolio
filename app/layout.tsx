import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import Nav from "./nav";
import "./globals.css";

const mono = IBM_Plex_Mono({
  variable: "--mono-font",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const sans = Inter({
  variable: "--sans-font",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Boris — Software Engineer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
        <footer>© 2026 Boris — cactobyte.tech</footer>
      </body>
    </html>
  );
}
