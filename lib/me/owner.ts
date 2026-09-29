import { redirect } from "next/navigation";
import { auth, isOwner } from "@/auth";

/**
 * Every /me page and server action calls this before touching data. Layout checks alone
 * aren't enough: server actions are public endpoints and layouts don't re-run on navigation.
 */
export async function requireOwner() {
  const session = await auth();
  if (!isOwner(session?.githubId)) redirect("/me/sign-in");
  return session;
}
