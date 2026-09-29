import Link from "next/link";
import { requireOwner } from "@/lib/me/owner";
import { signOutOwner } from "../actions";
import MeNav from "../me-nav";

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  await requireOwner();
  return (
    <>
      <header className="me-header">
        <div className="me-header-row">
          <Link href="/me" className="me-wordmark">
            boris<span>_</span>
          </Link>
          <form action={signOutOwner}>
            <button type="submit" className="me-link-btn">
              Sign out
            </button>
          </form>
        </div>
        <MeNav />
      </header>
      <main className="me-main">{children}</main>
    </>
  );
}
