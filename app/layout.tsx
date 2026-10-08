import type { Metadata } from "next";
import { Funnel_Display, Funnel_Sans } from "next/font/google";
import { ThemeProvider } from "@/src/components/theme";
import { site, themeCss } from "@/src/config/site";
import "./globals.css";

const display = Funnel_Display({ variable: "--font-funnel-display", subsets: ["latin"] });
const sans = Funnel_Sans({ variable: "--font-funnel-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Boris Cheung", template: "%s – Boris Cheung" },
  description:
    "Boris Cheung, software engineer. I build full-stack products and AI tools, and take on freelance work.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme={site.theme.default} className={`${display.variable} ${sans.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
      </head>
      <body className="flex min-h-svh flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
