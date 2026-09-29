import { IBM_Plex_Mono, Inter } from "next/font/google";

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

// Bare document shell. Each section of the app (portfolio, client sites) brings its own chrome and styles.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
