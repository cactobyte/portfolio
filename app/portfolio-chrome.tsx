import Nav from "./nav";
import "./globals.css";

export default function PortfolioChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <footer>© 2026 Boris — cactobyte.tech</footer>
    </>
  );
}
