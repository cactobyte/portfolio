import type { Metadata } from "next";
import PortfolioChrome from "../portfolio-chrome";

export const metadata: Metadata = {
  title: "Boris — Software Engineer",
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <PortfolioChrome>{children}</PortfolioChrome>;
}
