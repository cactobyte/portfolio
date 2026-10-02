import Nav from "./nav";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <footer>© 2026 Boris — cactobyte.tech</footer>
    </>
  );
}
